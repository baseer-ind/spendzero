import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/craving_completed.dart';
import '../../../core/models/goal.dart';
import '../../../core/providers/providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/money.dart';

/// Shown after every simulated checkout. Never "Order Successful" — the
/// celebration is always framed around the money the user chose not to
/// spend, per the SpendZero product vision.
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
  Widget build(BuildContext context) {
    final goalsAsync = ref.watch(goalsProvider);

    return Scaffold(
      backgroundColor: AppTheme.cravingCompletedAccent.withOpacity(0.08),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('🎉', style: TextStyle(fontSize: 48)),
                const SizedBox(height: 12),
                Text('Craving Completed', style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 8),
                Text('You chose not to spend', style: Theme.of(context).textTheme.bodyMedium),
                Text(
                  formatPaise(widget.result.amountNotSpentPaise),
                  style: Theme.of(context)
                      .textTheme
                      .displaySmall
                      ?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                _StatsRow(result: widget.result),
                const SizedBox(height: 24),
                goalsAsync.when(
                  data: (goals) => _GoalPicker(
                    goals: goals,
                    selectedGoalId: _selectedGoalId,
                    onSelected: (id) => setState(() => _selectedGoalId = id),
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
      ),
    );
  }

  Future<void> _recordOutcome(String outcome) async {
    setState(() => _isSubmitting = true);
    try {
      final repo = await ref.read(cravingRepositoryProvider.future);
      await repo.recordOutcome(
        cravingSessionId: widget.result.cravingSessionId,
        outcome: outcome,
        goalId: outcome == 'saved' ? _selectedGoalId : null,
      );
      ref.invalidate(goalsProvider);
    } catch (_) {
      // Best-effort: the celebration already happened locally, so a failed
      // network write shouldn't block the user from returning home.
    } finally {
      if (mounted) context.go('/');
    }
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
        Text('Put it toward a goal', style: Theme.of(context).textTheme.labelLarge),
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
