import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/goal.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';

const _categoryLabels = {
  'demo-food': 'Food',
  'demo-groceries': 'Grocery',
  'demo-fashion': 'Shopping',
  'demo-electronics': 'Electronics',
  'demo-travel': 'Travel',
  'demo-entertainment': 'Entertainment',
  'demo-beauty': 'Beauty',
};

const _categoryEmoji = {
  'demo-food': '🍔',
  'demo-groceries': '🛒',
  'demo-fashion': '👕',
  'demo-electronics': '📱',
  'demo-travel': '✈️',
  'demo-entertainment': '🎬',
  'demo-beauty': '💄',
};

String _labelFor(String categoryId) =>
    _categoryLabels[categoryId] ??
    categoryId.replaceFirst('demo-', '').replaceAll('-', ' ');

String _emojiFor(String categoryId) => _categoryEmoji[categoryId] ?? '💰';

DateTime _dateOnly(DateTime dt) => DateTime(dt.year, dt.month, dt.day);

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(statsProvider);
    final history = ref.watch(savingsHistoryProvider);
    final goals = ref.watch(goalsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Savings dashboard')),
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
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.7,
          children: [
            _StatCard(index: 0, label: 'Total saved', value: formatPaise(stats.totalAmountNotSpentPaise), emoji: '💰'),
            _StatCard(index: 1, label: "Today", value: formatPaise(_sumSince(today)), emoji: '☀️'),
            _StatCard(index: 2, label: 'This week', value: formatPaise(_sumSince(weekStart)), emoji: '📅'),
            _StatCard(index: 3, label: 'This month', value: formatPaise(_sumSince(monthStart)), emoji: '🗓'),
            _StatCard(index: 4, label: 'This year', value: formatPaise(_sumSince(yearStart)), emoji: '📈'),
            _StatCard(index: 5, label: 'Cravings defeated', value: '${stats.cravingsCompleted}', emoji: '🛡'),
            _StatCard(index: 6, label: 'Current streak', value: '${stats.currentStreakDays} days', emoji: '🔥'),
            _StatCard(index: 7, label: 'Longest streak', value: '${stats.longestStreakDays} days', emoji: '🏆'),
          ],
        ),
        const SizedBox(height: 24),
        Text('Last 7 days', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        _WeeklyBarChart(byDay: byDay, maxDay: maxDay),
        const SizedBox(height: 24),
        Text('Saved by category', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        if (byCategory.isEmpty)
          const _EmptySection(message: 'Nothing saved yet — skip a craving to get started.')
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
        Text('Recent activity', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        if (history.isEmpty)
          const _EmptySection(message: 'No cravings logged yet.')
        else
          ...history.take(10).map((e) => _ActivityRow(entry: e)),
      ],
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
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 4),
            Text(value,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
            Text(label, style: Theme.of(context).textTheme.bodySmall),
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

class _ActivityRow extends StatelessWidget {
  const _ActivityRow({required this.entry});

  final Map<String, dynamic> entry;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final categoryId = entry['category_id'] as String;
    final outcome = entry['outcome'] as String;
    final amountPaise = entry['amount_paise'] as int;
    final completedAt = DateTime.parse(entry['completed_at'] as String);
    final saved = outcome == 'saved';
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: saved ? colors.tertiaryContainer : colors.errorContainer,
            child: Text(_emojiFor(categoryId), style: const TextStyle(fontSize: 16)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  saved
                      ? 'Saved ${formatPaise(amountPaise)} on ${_labelFor(categoryId)}'
                      : 'Spent on ${_labelFor(categoryId)}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                Text(
                  '${completedAt.day}/${completedAt.month}/${completedAt.year}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: colors.outline),
                ),
              ],
            ),
          ),
        ],
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
