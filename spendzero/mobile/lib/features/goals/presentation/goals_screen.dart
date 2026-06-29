import 'package:flutter/material.dart';

import '../../../core/data/mock_goals.dart';
import '../../../core/utils/money.dart';

class GoalsScreen extends StatelessWidget {
  const GoalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Your goals')),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: mockGoals.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final goal = mockGoals[index];
          return Container(
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
          );
        },
      ),
    );
  }
}
