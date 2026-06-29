import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/goal.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';
import 'create_goal_sheet.dart';

class GoalsScreen extends ConsumerWidget {
  const GoalsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final goals = ref.watch(goalsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Your dreams')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => showCreateGoalSheet(context, ref),
        tooltip: 'New goal',
        child: const Icon(Icons.add),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(goalsProvider),
        child: goals.when(
          data: (list) => list.isEmpty
              ? _EmptyGoals(ref: ref)
              : _GoalList(goals: list),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => ListView(
            children: [
              const SizedBox(height: 80),
              Center(
                child: Column(
                  children: [
                    Text(
                      'Couldn\'t load your goals.',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () => ref.invalidate(goalsProvider),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyGoals extends StatelessWidget {
  const _EmptyGoals({required this.ref});

  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: [
        const SizedBox(height: 64),
        Center(
          child: Column(
            children: [
              const Text('🌱', style: TextStyle(fontSize: 48)),
              const SizedBox(height: 16),
              Text(
                'No dreams yet',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Text(
                  'Set something to save toward — every craving you skip '
                  'gets you closer.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
              const SizedBox(height: 20),
              FilledButton.icon(
                onPressed: () => showCreateGoalSheet(context, ref),
                icon: const Icon(Icons.add),
                label: const Text('Create your first goal'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _GoalList extends StatelessWidget {
  const _GoalList({required this.goals});

  final List<SavingsGoal> goals;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: goals.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) => _GoalCard(goal: goals[index]),
    );
  }
}

class _GoalCard extends StatelessWidget {
  const _GoalCard({required this.goal});

  final SavingsGoal goal;

  @override
  Widget build(BuildContext context) {
    final isComplete = goal.progress >= 1;
    final colors = Theme.of(context).colorScheme;
    return Semantics(
      label: '${goal.title}, ${formatPaise(goal.savedPaise)} saved of '
          '${formatPaise(goal.targetPaise)}'
          '${isComplete ? ', completed' : ''}',
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isComplete ? colors.tertiaryContainer : colors.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16),
          border: isComplete ? Border.all(color: colors.tertiary, width: 1.5) : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(goal.emoji, style: const TextStyle(fontSize: 24)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(goal.title, style: Theme.of(context).textTheme.titleMedium),
                ),
                if (isComplete)
                  const Padding(
                    padding: EdgeInsets.only(left: 8),
                    child: Text('🏆', style: TextStyle(fontSize: 20)),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: TweenAnimationBuilder<double>(
                tween: Tween(begin: 0, end: goal.progress),
                duration: const Duration(milliseconds: 700),
                curve: Curves.easeOutCubic,
                builder: (context, value, _) => LinearProgressIndicator(
                  value: value,
                  minHeight: 8,
                  backgroundColor: colors.surfaceContainerHigh,
                  color: isComplete ? colors.tertiary : null,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              isComplete
                  ? 'Dream achieved! ${formatPaise(goal.targetPaise)}'
                  : '${formatPaise(goal.savedPaise)} / ${formatPaise(goal.targetPaise)}',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
