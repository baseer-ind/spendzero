import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/data/mock_categories.dart';
import '../../../core/data/mock_goals.dart';
import '../../../core/utils/money.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final totalSavedPaise =
        mockGoals.fold<int>(0, (sum, goal) => sum + goal.savedPaise);

    return Scaffold(
      appBar: AppBar(
        title: const Text('SpendZero'),
        actions: [
          IconButton(
            icon: const Icon(Icons.flag_outlined),
            tooltip: 'Goals',
            onPressed: () => context.push('/goals'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _SavingsBanner(totalSavedPaise: totalSavedPaise),
          const SizedBox(height: 20),
          Text('Browse a category', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: mockCategories.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 0.9,
            ),
            itemBuilder: (context, index) {
              final category = mockCategories[index];
              return _CategoryTile(
                emoji: category.emoji,
                name: category.name,
                onTap: () => context.push('/checkout/${category.slug}'),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _SavingsBanner extends StatelessWidget {
  const _SavingsBanner({required this.totalSavedPaise});

  final int totalSavedPaise;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.primaryContainer,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Total saved so far', style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 4),
          Text(
            formatPaise(totalSavedPaise),
            style: Theme.of(context)
                .textTheme
                .headlineMedium
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}

class _CategoryTile extends StatelessWidget {
  const _CategoryTile({required this.emoji, required this.name, required this.onTap});

  final String emoji;
  final String name;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 28)),
            const SizedBox(height: 6),
            Text(name, style: Theme.of(context).textTheme.labelMedium),
          ],
        ),
      ),
    );
  }
}
