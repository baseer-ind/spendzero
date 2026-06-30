import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/achievement.dart';
import '../../../core/models/goal.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/category_labels.dart';
import '../../../core/utils/money.dart';
import '../../../core/widgets/activity_row.dart';

String _labelFor(String categoryId) => labelForCategory(categoryId);

String _emojiFor(String categoryId) => emojiForCategory(categoryId);

DateTime _dateOnly(DateTime dt) => DateTime(dt.year, dt.month, dt.day);

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(statsProvider);
    final history = ref.watch(savingsHistoryProvider);
    final goals = ref.watch(goalsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('My Future')),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(statsProvider);
          ref.invalidate(savingsHistoryProvider);
          ref.invalidate(goalsProvider);
        },
        child: stats.when(
          data: (s) => history.when(
            data: (h) => goals.when(
              data: (g) => _DashboardBody(stats: s, history: h, goals: g),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (_, __) => const _DashboardError(),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, __) => const _DashboardError(),
          ),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => const _DashboardError(),
        ),
      ),
    );
  }
}

class _DashboardError extends StatelessWidget {
  const _DashboardError();

  @override
  Widget build(BuildContext context) =>
      const Center(child: Text("Couldn't load your dashboard. Pull to retry."));
}

class _DashboardBody extends StatelessWidget {
  const _DashboardBody({required this.stats, required this.history, required this.goals});

  final dynamic stats;
  final List<Map<String, dynamic>> history;
  final List<SavingsGoal> goals;

  List<Map<String, dynamic>> get _saved =>
      history.where((e) => e['outcome'] == 'saved').toList();

  int _sumSince(DateTime since) => _saved
      .where((e) => DateTime.parse(e['completed_at'] as String).isAfter(since))
      .fold<int>(0, (sum, e) => sum + (e['amount_paise'] as int));

  Map<String, int> get _byCategory {
    final map = <String, int>{};
    for (final e in _saved) {
      final cat = e['category_id'] as String;
      map[cat] = (map[cat] ?? 0) + (e['amount_paise'] as int);
    }
    return map;
  }

  Map<DateTime, int> get _byDayLast7 {
    final today = _dateOnly(DateTime.now());
    final map = <DateTime, int>{
      for (var i = 6; i >= 0; i--) today.subtract(Duration(days: i)): 0,
    };
    for (final e in _saved) {
      final day = _dateOnly(DateTime.parse(e['completed_at'] as String));
      if (map.containsKey(day)) map[day] = map[day]! + (e['amount_paise'] as int);
    }
    return map;
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final today = _dateOnly(now);
    final weekStart = today.subtract(Duration(days: today.weekday - 1));
    final monthStart = DateTime(now.year, now.month, 1);
    final yearStart = DateTime(now.year, 1, 1);

    final activeGoals = goals.where((g) => g.progress < 1).toList()
      ..sort((a, b) => b.progress.compareTo(a.progress));
    final completedGoals = goals.where((g) => g.progress >= 1).toList();
    final topDream = goals.isEmpty
        ? null
        : (goals.toList()..sort((a, b) => b.savedPaise.compareTo(a.savedPaise))).first;

    final byCategory = _byCategory;
    final maxCategory = byCategory.values.isEmpty
        ? 1
        : byCategory.values.reduce((a, b) => a > b ? a : b);

    final byDay = _byDayLast7;
    final maxDay = byDay.values.isEmpty ? 1 : byDay.values.reduce((a, b) => a > b ? a : b);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _HeroHeader(
          totalPaise: stats.totalAmountNotSpentPaise,
          currentStreakDays: stats.currentStreakDays,
          longestStreakDays: stats.longestStreakDays,
          topDream: topDream,
        ),
        const SizedBox(height: 14),
        _MomentumStory(
          thisWeekPaise: _sumSince(weekStart),
          lastWeekPaise: _sumSince(weekStart.subtract(const Duration(days: 7))) -
              _sumSince(weekStart),
          stats: stats,
          topDream: topDream,
        ),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.4,
          children: [
            _StatCard(index: 0, label: "Today", value: formatPaise(_sumSince(today)), emoji: '☀️'),
            _StatCard(index: 1, label: 'This week', value: formatPaise(_sumSince(weekStart)), emoji: '📅'),
            _StatCard(index: 2, label: 'This month', value: formatPaise(_sumSince(monthStart)), emoji: '🗓'),
            _StatCard(index: 3, label: 'This year', value: formatPaise(_sumSince(yearStart)), emoji: '📈'),
            _StatCard(index: 4, label: 'Cravings defeated', value: '${stats.cravingsCompleted}', emoji: '🛡'),
            _StatCard(index: 5, label: 'Longest streak', value: '${stats.longestStreakDays} days', emoji: '🏆'),
          ],
        ),
        const SizedBox(height: 16),
        _BadgesCard(stats: stats),
        const SizedBox(height: 24),
        Text('Last 7 days', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        _WeeklyBarChart(byDay: byDay, maxDay: maxDay),
        const SizedBox(height: 24),
        Text('Redirected by category', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        if (byCategory.isEmpty)
          const _EmptySection(message: 'Nothing redirected yet — skip a craving to get started.')
        else
          ...byCategory.entries.toList().asMap().entries.map(
            (indexed) => _CategoryRow(
              index: indexed.key,
              categoryId: indexed.value.key,
              amountPaise: indexed.value.value,
              fraction: indexed.value.value / maxCategory,
            ),
          ),
        const SizedBox(height: 24),
        Text('Dreams', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _MiniStat(label: 'Active', value: '${activeGoals.length}'),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _MiniStat(label: 'Completed', value: '${completedGoals.length}'),
            ),
          ],
        ),
        if (topDream != null) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                Text(topDream.emoji, style: const TextStyle(fontSize: 22)),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Top dream: ${topDream.title}',
                          style: Theme.of(context).textTheme.bodyMedium),
                      Text(
                        '${formatPaise(topDream.savedPaise)} / ${formatPaise(topDream.targetPaise)}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Recent victories', style: Theme.of(context).textTheme.titleMedium),
            if (history.isNotEmpty)
              TextButton(
                onPressed: () => context.push('/journey'),
                child: const Text('View Journey'),
              ),
          ],
        ),
        const SizedBox(height: 4),
        if (history.isEmpty)
          const _EmptySection(message: 'No cravings logged yet.')
        else
          ...history.take(5).map((e) => ActivityRow(entry: e)),
        const SizedBox(height: 24),
        _KeepGoingCard(topDream: topDream),
      ],
    );
  }
}

/// Closes the loop on the Dashboard Journey: after reviewing progress, the
/// user needs a clear next step back into the app rather than a dead end.
class _KeepGoingCard extends StatelessWidget {
  const _KeepGoingCard({required this.topDream});

  final SavingsGoal? topDream;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final subtitle = topDream != null
        ? 'Every craving you skip moves you closer to ${topDream!.title}.'
        : 'Skip your next craving and start building momentum.';
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () {
        HapticFeedback.selectionClick();
        context.go('/');
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [colors.primary, colors.primary.withOpacity(0.78)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Ready for your next win?',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          color: colors.onPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: colors.onPrimary.withOpacity(0.9),
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Icon(Icons.arrow_forward_rounded, color: colors.onPrimary),
          ],
        ),
      ),
    );
  }
}

class _HeroHeader extends StatelessWidget {
  const _HeroHeader({
    required this.totalPaise,
    required this.currentStreakDays,
    required this.longestStreakDays,
    required this.topDream,
  });

  final int totalPaise;
  final int currentStreakDays;
  final int longestStreakDays;
  final SavingsGoal? topDream;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final dreamFraction = topDream == null
        ? 0.0
        : (topDream!.savedPaise / topDream!.targetPaise).clamp(0.0, 1.0);

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 22, 20, 20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [colors.primary, colors.tertiary],
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: colors.primary.withOpacity(0.35),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Redirected toward your future',
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: Colors.white.withOpacity(0.85)),
          ),
          const SizedBox(height: 4),
          TweenAnimationBuilder<double>(
            tween: Tween(begin: 0, end: totalPaise.toDouble()),
            duration: const Duration(milliseconds: 900),
            curve: Curves.easeOutCubic,
            builder: (context, value, _) => Text(
              formatPaise(value.round()),
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),
          const SizedBox(height: 18),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Row(
                  children: [
                    TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: currentStreakDays > 0 ? 1 : 0.4),
                      duration: const Duration(milliseconds: 600),
                      curve: Curves.elasticOut,
                      builder: (context, scale, child) =>
                          Transform.scale(scale: 0.7 + 0.3 * scale, child: child),
                      child: const Text('🔥', style: TextStyle(fontSize: 26)),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '$currentStreakDays day${currentStreakDays == 1 ? '' : 's'}',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        Text(
                          'Current streak · best $longestStreakDays',
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: Colors.white.withOpacity(0.85)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (topDream != null)
                Column(
                  children: [
                    SizedBox(
                      width: 52,
                      height: 52,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          TweenAnimationBuilder<double>(
                            tween: Tween(begin: 0, end: dreamFraction),
                            duration: const Duration(milliseconds: 900),
                            curve: Curves.easeOutCubic,
                            builder: (context, value, _) => CircularProgressIndicator(
                              value: value,
                              strokeWidth: 5,
                              backgroundColor: Colors.white.withOpacity(0.25),
                              valueColor: const AlwaysStoppedAnimation(Colors.white),
                            ),
                          ),
                          Text(topDream!.emoji, style: const TextStyle(fontSize: 18)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${(dreamFraction * 100).round()}%',
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}

/// The narrative line: turns raw stats into "here's how far you've come
/// and what's next" so the dashboard reads as a story, not a spreadsheet.
class _MomentumStory extends StatelessWidget {
  const _MomentumStory({
    required this.thisWeekPaise,
    required this.lastWeekPaise,
    required this.stats,
    required this.topDream,
  });

  final int thisWeekPaise;
  final int lastWeekPaise;
  final dynamic stats;
  final SavingsGoal? topDream;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final nextMilestone = allAchievements.firstWhere(
      (a) => !a.isUnlocked(stats),
      orElse: () => allAchievements.last,
    );
    final allUnlocked = allAchievements.every((a) => a.isUnlocked(stats));

    String headline;
    if (thisWeekPaise > 0 && lastWeekPaise > 0 && thisWeekPaise > lastWeekPaise) {
      final times = (thisWeekPaise / lastWeekPaise).toStringAsFixed(1);
      headline = "You've redirected ${times}x more this week than last — keep the momentum.";
    } else if (thisWeekPaise > 0) {
      headline = topDream != null
          ? "Every choice this week moved you closer to ${topDream!.title}."
          : "You've redirected ${formatPaise(thisWeekPaise)} toward your future this week. Nice discipline.";
    } else {
      headline = "A fresh week — skip your next craving to start the streak.";
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: colors.tertiaryContainer.withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(headline, style: Theme.of(context).textTheme.bodyMedium),
          if (!allUnlocked) ...[
            const SizedBox(height: 6),
            Text(
              'Next up: ${nextMilestone.emoji} ${nextMilestone.title} — '
              '${nextMilestone.progressLabel(stats)}',
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: colors.onTertiaryContainer.withOpacity(0.85)),
            ),
          ],
        ],
      ),
    );
  }
}

class _BadgesCard extends StatelessWidget {
  const _BadgesCard({required this.stats});

  final dynamic stats;

  @override
  Widget build(BuildContext context) {
    final unlockedCount = allAchievements.where((a) => a.isUnlocked(stats)).length;
    final colors = Theme.of(context).colorScheme;

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => context.push('/achievements'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: colors.secondaryContainer,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            const Text('🏅', style: TextStyle(fontSize: 28)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '$unlockedCount of ${allAchievements.length} victories unlocked',
                    style: Theme.of(context)
                        .textTheme
                        .titleSmall
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 2),
                  Text('Tap to see your badge cabinet', style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: colors.onSecondaryContainer),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.index, required this.label, required this.value, required this.emoji});

  final int index;
  final String label;
  final String value;
  final String emoji;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 320 + index * 40),
      curve: Curves.easeOutCubic,
      builder: (context, entrance, child) => Opacity(
        opacity: entrance,
        child: Transform.translate(offset: Offset(0, (1 - entrance) * 10), child: child),
      ),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 16, height: 1)),
            const SizedBox(height: 4),
            Text(value,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
            const SizedBox(height: 1),
            Text(label,
                style: Theme.of(context).textTheme.bodySmall,
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value, style: Theme.of(context).textTheme.titleLarge),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }
}

class _WeeklyBarChart extends StatelessWidget {
  const _WeeklyBarChart({required this.byDay, required this.maxDay});

  final Map<DateTime, int> byDay;
  final int maxDay;

  static const _weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      height: 140,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: byDay.entries.toList().asMap().entries.map((indexed) {
          final i = indexed.key;
          final e = indexed.value;
          final fraction = maxDay == 0 ? 0.0 : e.value / maxDay;
          final isToday = i == byDay.length - 1;
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0, end: fraction.clamp(0.05, 1.0)),
                    duration: Duration(milliseconds: 500 + i * 60),
                    curve: Curves.easeOutCubic,
                    builder: (context, value, _) => Container(
                      height: 70 * value,
                      decoration: BoxDecoration(
                        color: isToday ? colors.primary : colors.primary.withOpacity(0.55),
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _weekdayLabels[e.key.weekday - 1],
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontWeight: isToday ? FontWeight.bold : null,
                          color: isToday ? colors.primary : null,
                        ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _CategoryRow extends StatelessWidget {
  const _CategoryRow({
    required this.categoryId,
    required this.amountPaise,
    required this.fraction,
    this.index = 0,
  });

  final String categoryId;
  final int amountPaise;
  final double fraction;
  final int index;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 300 + (index * 60).clamp(0, 360)),
      curve: Curves.easeOutCubic,
      builder: (context, entrance, child) => Opacity(
        opacity: entrance,
        child: Transform.translate(offset: Offset((1 - entrance) * 16, 0), child: child),
      ),
      child: Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Text(_emojiFor(categoryId), style: const TextStyle(fontSize: 18)),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(_labelFor(categoryId), style: Theme.of(context).textTheme.bodyMedium),
                    Text(formatPaise(amountPaise), style: Theme.of(context).textTheme.bodyMedium),
                  ],
                ),
                const SizedBox(height: 4),
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0, end: fraction.clamp(0, 1)),
                    duration: const Duration(milliseconds: 600),
                    builder: (context, value, _) => LinearProgressIndicator(
                      value: value,
                      minHeight: 6,
                      backgroundColor: colors.surfaceContainerHigh,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ),
    );
  }
}

class _EmptySection extends StatelessWidget {
  const _EmptySection({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Text(message, style: Theme.of(context).textTheme.bodyMedium),
    );
  }
}
