import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/data/local/achievements_store.dart';
import '../../../core/models/achievement.dart';
import '../../../core/models/craving_completed.dart';
import '../../../core/models/goal.dart';
import '../../../core/models/user_stats.dart';
import '../../../core/providers/providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/money.dart';
import 'confetti_burst.dart';

const _streakMilestones = [3, 7, 14, 30, 60, 100];

const _affirmations = [
  'That was a smart decision.',
  'Future you says thank you.',
  'Small choice, real progress.',
  'You\'re building a great habit.',
  'Discipline beats impulse — nice work.',
];

String _affirmationFor(int amountPaise) => _affirmations[amountPaise % _affirmations.length];

/// Shown after every simulated checkout. Never "Order Successful" — the
/// celebration is always framed around the money the user chose not to
/// spend, and (when a dream/goal is picked) around how much closer that
/// dream just got. This is the single highest-leverage emotional beat in
/// the app, so it gets confetti + haptics + a live "dream progress" preview
/// rather than a flat receipt.
class CravingCompletedScreen extends ConsumerStatefulWidget {
  const CravingCompletedScreen({super.key, required this.result});

  final CravingCompleted result;

  @override
  ConsumerState<CravingCompletedScreen> createState() => _CravingCompletedScreenState();
}

class _CravingCompletedScreenState extends ConsumerState<CravingCompletedScreen> {
  String? _selectedGoalId;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    HapticFeedback.mediumImpact();
  }

  @override
  Widget build(BuildContext context) {
    final goalsAsync = ref.watch(goalsProvider);

    return Scaffold(
      backgroundColor: AppTheme.cravingCompletedAccent.withOpacity(0.08),
      body: SafeArea(
        child: Stack(
          children: [
            Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: 1),
                      duration: const Duration(milliseconds: 600),
                      curve: Curves.elasticOut,
                      builder: (context, scale, child) => Transform.scale(scale: scale, child: child),
                      child: const Text('🎉', style: TextStyle(fontSize: 48)),
                    ),
                    const SizedBox(height: 12),
                    Text('Craving Completed', style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 8),
                    Text('You chose not to spend', style: Theme.of(context).textTheme.bodyMedium),
                    TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: widget.result.amountNotSpentPaise.toDouble()),
                      duration: const Duration(milliseconds: 900),
                      curve: Curves.easeOutExpo,
                      builder: (context, value, _) => Text(
                        formatPaise(value.round()),
                        style: Theme.of(context)
                            .textTheme
                            .displaySmall
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _affirmationFor(widget.result.amountNotSpentPaise),
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    _StatsRow(result: widget.result),
                    const SizedBox(height: 24),
                    goalsAsync.when(
                      data: (goals) => Column(
                        children: [
                          _GoalPicker(
                            goals: goals,
                            selectedGoalId: _selectedGoalId,
                            onSelected: (id) {
                              setState(() => _selectedGoalId = id);
                              if (id != null) HapticFeedback.selectionClick();
                            },
                          ),
                          if (_selectedGoalId != null)
                            _DreamProgressCard(
                              goal: goals.firstWhere((g) => g.id == _selectedGoalId),
                              additionalSavedPaise: widget.result.amountNotSpentPaise,
                            ),
                        ],
                      ),
                      loading: () => const SizedBox.shrink(),
                      error: (_, __) => const SizedBox.shrink(),
                    ),
                    const SizedBox(height: 32),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _isSubmitting ? null : () => _recordOutcome('maybe_later'),
                            child: const Text('Maybe Later'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: FilledButton(
                            onPressed: _isSubmitting ? null : () => _recordOutcome('saved'),
                            child: _isSubmitting
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  )
                                : const Text('I Saved It'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const ConfettiBurst(),
          ],
        ),
      ),
    );
  }

  Future<void> _recordOutcome(String outcome) async {
    setState(() => _isSubmitting = true);
    int previousStreak = 0;
    if (outcome == 'saved') {
      HapticFeedback.heavyImpact();
      previousStreak = ref.read(statsProvider).valueOrNull?.currentStreakDays ?? 0;
    }
    try {
      final repo = await ref.read(cravingRepositoryProvider.future);
      await repo.recordOutcome(
        cravingSessionId: widget.result.cravingSessionId,
        outcome: outcome,
        goalId: outcome == 'saved' ? _selectedGoalId : null,
      );
      ref.invalidate(goalsProvider);
      ref.invalidate(statsProvider);

      if (outcome == 'saved' && mounted) {
        int newStreak = previousStreak;
        UserStats? newStats;
        try {
          final fetched = await ref.read(statsProvider.future);
          newStats = fetched;
          newStreak = fetched.currentStreakDays;
        } catch (_) {
          // Keep previousStreak; milestone check below will simply no-op.
        }
        if (_streakMilestones.contains(newStreak) && newStreak > previousStreak && mounted) {
          await _showStreakMilestone(newStreak);
        }
        if (newStats != null && mounted) {
          await _showNewlyUnlockedAchievements(newStats);
        }
      }
    } catch (_) {
      // Best-effort: the celebration already happened locally, so a failed
      // network write shouldn't block the user from returning home.
    } finally {
      if (mounted) context.go('/');
    }
  }

  Future<void> _showNewlyUnlockedAchievements(UserStats stats) async {
    final unlockedIds = allAchievements
        .where((a) => a.isUnlocked(stats))
        .map((a) => a.id)
        .toList();
    final newlySeen = ref.read(seenAchievementsProvider.notifier).markSeen(unlockedIds);
    if (newlySeen.isEmpty) return;

    for (final id in newlySeen) {
      if (!mounted) return;
      final achievement = allAchievements.firstWhere((a) => a.id == id);
      HapticFeedback.heavyImpact();
      await showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('${achievement.emoji} Badge unlocked!'),
          content: Text('${achievement.title} — ${achievement.description}'),
          actions: [
            TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Nice!')),
          ],
        ),
      );
    }
  }

  Future<void> _showStreakMilestone(int days) async {
    HapticFeedback.heavyImpact();
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('🔥 Streak milestone!'),
        content: Text(
          "$days days in a row choosing your dream over the craving. That's real discipline — keep it going.",
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Nice!')),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.result});

  final CravingCompleted result;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _Stat(label: 'Today', amountPaise: result.todaySavingsPaise),
        _Stat(label: 'This month', amountPaise: result.monthSavingsPaise),
      ],
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.amountPaise});

  final String label;
  final int amountPaise;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label, style: Theme.of(context).textTheme.bodySmall),
        Text(formatPaise(amountPaise), style: Theme.of(context).textTheme.titleMedium),
      ],
    );
  }
}

class _GoalPicker extends StatelessWidget {
  const _GoalPicker({
    required this.goals,
    required this.selectedGoalId,
    required this.onSelected,
  });

  final List<SavingsGoal> goals;
  final String? selectedGoalId;
  final ValueChanged<String?> onSelected;

  @override
  Widget build(BuildContext context) {
    if (goals.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Put it toward a dream', style: Theme.of(context).textTheme.labelLarge),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: goals
              .map(
                (goal) => ChoiceChip(
                  label: Text('${goal.emoji} ${goal.title}'),
                  selected: selectedGoalId == goal.id,
                  onSelected: (_) => onSelected(selectedGoalId == goal.id ? null : goal.id),
                ),
              )
              .toList(),
        ),
      ],
    );
  }
}

/// Shows the dream's progress bar *as it would look* if this save is
/// allocated to it, before the user even confirms — the savings amount
/// becomes "this much closer to Goa" instead of an abstract number.
class _DreamProgressCard extends StatelessWidget {
  const _DreamProgressCard({required this.goal, required this.additionalSavedPaise});

  final SavingsGoal goal;
  final int additionalSavedPaise;

  @override
  Widget build(BuildContext context) {
    final projectedSaved = goal.savedPaise + additionalSavedPaise;
    final projectedProgress =
        goal.targetPaise == 0 ? 0.0 : (projectedSaved / goal.targetPaise).clamp(0, 1).toDouble();

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 420),
      curve: Curves.easeOutCubic,
      builder: (context, entrance, child) => Opacity(
        opacity: entrance,
        child: Transform.scale(scale: 0.94 + entrance * 0.06, child: child),
      ),
      child: Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${goal.emoji} ${formatPaise(additionalSavedPaise)} closer to ${goal.title}',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: TweenAnimationBuilder<double>(
                tween: Tween(begin: goal.progress, end: projectedProgress),
                duration: const Duration(milliseconds: 600),
                curve: Curves.easeOutCubic,
                builder: (context, value, _) => LinearProgressIndicator(
                  value: value,
                  minHeight: 10,
                  backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
                ),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              '${formatPaise(projectedSaved)} of ${formatPaise(goal.targetPaise)}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    ),
    );
  }
}
