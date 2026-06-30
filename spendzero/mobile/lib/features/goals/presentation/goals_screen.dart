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
    final archived = ref.watch(archivedGoalsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Your dreams')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => showCreateGoalSheet(context, ref),
        tooltip: 'New dream',
        child: const Icon(Icons.add),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(goalsProvider);
          ref.invalidate(archivedGoalsProvider);
        },
        child: goals.when(
          data: (list) => list.isEmpty
              ? _EmptyGoals(ref: ref, archived: archived)
              : _GoalList(goals: list, archived: archived),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => ListView(
            children: [
              const SizedBox(height: 80),
              Center(
                child: Column(
                  children: [
                    Text(
                      'Couldn\'t load your dreams.',
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
  const _EmptyGoals({required this.ref, required this.archived});

  final WidgetRef ref;
  final AsyncValue<List<SavingsGoal>> archived;

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
                label: const Text('Create your first dream'),
              ),
            ],
          ),
        ),
        _ArchivedSection(archived: archived),
      ],
    );
  }
}

class _GoalList extends StatelessWidget {
  const _GoalList({required this.goals, required this.archived});

  final List<SavingsGoal> goals;
  final AsyncValue<List<SavingsGoal>> archived;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: goals.length + 1,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        if (index == goals.length) return _ArchivedSection(archived: archived);
        return _GoalCard(goal: goals[index]);
      },
    );
  }
}

class _ArchivedSection extends ConsumerWidget {
  const _ArchivedSection({required this.archived});

  final AsyncValue<List<SavingsGoal>> archived;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return archived.when(
      data: (list) {
        if (list.isEmpty) return const SizedBox.shrink();
        return Padding(
          padding: const EdgeInsets.only(top: 8),
          child: ExpansionTile(
            title: Text('Archived dreams (${list.length})'),
            children: list
                .map((g) => ListTile(
                      leading: Text(g.emoji, style: const TextStyle(fontSize: 20)),
                      title: Text(g.title),
                      subtitle: Text('${formatPaise(g.savedPaise)} / ${formatPaise(g.targetPaise)}'),
                      trailing: TextButton(
                        onPressed: () async {
                          final repo = await ref.read(goalRepositoryProvider.future);
                          await repo.setArchived(g.id, false);
                          ref.invalidate(goalsProvider);
                          ref.invalidate(archivedGoalsProvider);
                        },
                        child: const Text('Restore'),
                      ),
                    ))
                .toList(),
          ),
        );
      },
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }
}

class _GoalCard extends ConsumerWidget {
  const _GoalCard({required this.goal});

  final SavingsGoal goal;

  Future<void> _confirmDelete(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete this dream?'),
        content: Text('"${goal.title}" and its progress will be permanently removed.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    final repo = await ref.read(goalRepositoryProvider.future);
    await repo.deleteGoal(goal.id);
    ref.invalidate(goalsProvider);
    ref.invalidate(archivedGoalsProvider);
  }

  Future<void> _archive(WidgetRef ref) async {
    final repo = await ref.read(goalRepositoryProvider.future);
    await repo.setArchived(goal.id, true);
    ref.invalidate(goalsProvider);
    ref.invalidate(archivedGoalsProvider);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isComplete = goal.progress >= 1;
    final colors = Theme.of(context).colorScheme;
    return Semantics(
      label: '${goal.title}, ${formatPaise(goal.savedPaise)} saved of '
          '${formatPaise(goal.targetPaise)}'
          '${isComplete ? ', completed' : ''}',
      child: GestureDetector(
        onLongPress: () => showCreateGoalSheet(context, ref, editing: goal),
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
                      padding: EdgeInsets.only(left: 4),
                      child: Text('🏆', style: TextStyle(fontSize: 20)),
                    ),
                  PopupMenuButton<String>(
                    onSelected: (value) {
                      switch (value) {
                        case 'edit':
                          showCreateGoalSheet(context, ref, editing: goal);
                          break;
                        case 'archive':
                          _archive(ref);
                          break;
                        case 'delete':
                          _confirmDelete(context, ref);
                          break;
                      }
                    },
                    itemBuilder: (context) => const [
                      PopupMenuItem(value: 'edit', child: Text('Edit')),
                      PopupMenuItem(value: 'archive', child: Text('Archive')),
                      PopupMenuItem(value: 'delete', child: Text('Delete')),
                    ],
                  ),
                ],
              ),
              if (goal.targetDate != null || goal.category != 'General') ...[
                const SizedBox(height: 2),
                Text(
                  [
                    if (goal.category != 'General') goal.category,
                    if (goal.targetDate != null)
                      'by ${goal.targetDate!.day}/${goal.targetDate!.month}/${goal.targetDate!.year}',
                  ].join(' · '),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: colors.outline),
                ),
              ],
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
      ),
    );
  }
}
