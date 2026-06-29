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
      appBar: AppBar(title: const Text('Your goals')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => showCreateGoalSheet(context, ref),
        tooltip: 'New goal',
        child: const Icon(Icons.add),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(goalsProvider),
        child: goals.when(
          data: (list) => _GoalList(goals: list),
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

class _GoalList extends StatelessWidget {
  const _GoalList({required this.goals});

  final List<SavingsGoal> goals;

  @override
  Widget build(BuildContext context) {
    if (goals.isEmpty) {
      return ListView(
        children: [
          const SizedBox(height: 80),
          Center(
            child: Text(
              'No goals yet.\nCreate one to start tracking what you save.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: goals.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final goal = goals[index];
        return Semantics(
          label: '${goal.title}, ${formatPaise(goal.savedPaise)} saved of ${formatPaise(goal.targetPaise)}',
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(goal.emoji, style: const TextStyle(fontSize: 24)),
                    const SizedBox(width: 8),
                    Text(goal.title, style: Theme.of(context).textTheme.titleMedium),
                  ],
                ),
                const SizedBox(height: 10),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(value: goal.progress, minHeight: 8),
                ),
                const SizedBox(height: 8),
                Text(
                  '${formatPaise(goal.savedPaise)} / ${formatPaise(goal.targetPaise)}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
