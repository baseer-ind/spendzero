import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/achievement.dart';
import '../../../core/models/user_stats.dart';
import '../../../core/providers/providers.dart';

/// Full badge cabinet — every achievement in the game, unlocked or not,
/// with a progress hint for the ones still locked. Pure read view; the
/// celebratory "you just unlocked X" moment lives in
/// `craving_completed_screen.dart`.
class AchievementsScreen extends ConsumerWidget {
  const AchievementsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(statsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Badges')),
      body: statsAsync.when(
        data: (stats) => _AchievementsGrid(stats: stats),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) =>
            const Center(child: Text("Couldn't load your badges. Pull to retry.")),
      ),
    );
  }
}

class _AchievementsGrid extends StatelessWidget {
  const _AchievementsGrid({required this.stats});

  final UserStats stats;

  @override
  Widget build(BuildContext context) {
    final unlockedCount = allAchievements.where((a) => a.isUnlocked(stats)).length;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primaryContainer,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              const Text('🏅', style: TextStyle(fontSize: 32)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  '$unlockedCount of ${allAchievements.length} badges unlocked',
                  style: Theme.of(context)
                      .textTheme
                      .titleMedium
                      ?.copyWith(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 0.95,
          children: allAchievements
              .map((a) => _AchievementCard(achievement: a, stats: stats))
              .toList(),
        ),
      ],
    );
  }
}

class _AchievementCard extends StatelessWidget {
  const _AchievementCard({required this.achievement, required this.stats});

  final AchievementDefinition achievement;
  final UserStats stats;

  @override
  Widget build(BuildContext context) {
    final unlocked = achievement.isUnlocked(stats);
    final colors = Theme.of(context).colorScheme;

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 420),
      curve: Curves.easeOutCubic,
      builder: (context, t, child) => Opacity(
        opacity: t,
        child: Transform.scale(scale: 0.9 + t * 0.1, child: child),
      ),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: unlocked ? colors.surface : colors.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: unlocked ? colors.primary.withOpacity(0.4) : colors.outlineVariant,
            width: unlocked ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Opacity(
              opacity: unlocked ? 1 : 0.35,
              child: Text(achievement.emoji, style: const TextStyle(fontSize: 32)),
            ),
            const SizedBox(height: 8),
            Text(
              achievement.title,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: unlocked ? null : colors.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 4),
            Expanded(
              child: Text(
                achievement.description,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: colors.onSurfaceVariant,
                    ),
              ),
            ),
            const SizedBox(height: 6),
            if (unlocked)
              Row(
                children: [
                  Icon(Icons.check_circle, size: 14, color: colors.primary),
                  const SizedBox(width: 4),
                  Text(
                    'Unlocked',
                    style: Theme.of(context)
                        .textTheme
                        .labelSmall
                        ?.copyWith(color: colors.primary, fontWeight: FontWeight.bold),
                  ),
                ],
              )
            else
              Text(
                achievement.progressLabel(stats),
                style: Theme.of(context)
                    .textTheme
                    .labelSmall
                    ?.copyWith(color: colors.onSurfaceVariant),
              ),
          ],
        ),
      ),
    );
  }
}
