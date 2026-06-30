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
    final locked = allAchievements.where((a) => !a.isUnlocked(stats)).toList();
    final progress = allAchievements.isEmpty ? 0.0 : unlockedCount / allAchievements.length;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _StoryBanner(
          unlockedCount: unlockedCount,
          total: allAchievements.length,
          progress: progress,
          nextUp: locked.isNotEmpty ? locked.first : null,
          stats: stats,
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

/// Replaces the flat "X of Y unlocked" counter with a celebratory headline
/// that reacts to progress, plus a live progress bar and a highlight of the
/// next badge within reach — giving the badge cabinet the same narrative
/// treatment the other journeys already have, instead of reading as a
/// static stat block.
class _StoryBanner extends StatelessWidget {
  const _StoryBanner({
    required this.unlockedCount,
    required this.total,
    required this.progress,
    required this.nextUp,
    required this.stats,
  });

  final int unlockedCount;
  final int total;
  final double progress;
  final AchievementDefinition? nextUp;
  final UserStats stats;

  String get _headline {
    if (unlockedCount == 0) return 'Your badge cabinet starts here';
    if (unlockedCount == total) return 'Every badge, unlocked. Legend status.';
    if (progress >= 0.75) return 'So close to a full cabinet';
    if (progress >= 0.4) return 'Building real momentum';
    return 'Off to a solid start';
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [colors.primary, colors.primaryContainer],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: colors.primary.withOpacity(0.25),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('🏅', style: TextStyle(fontSize: 30)),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  _headline,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: colors.onPrimary,
                      ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '$unlockedCount of $total badges unlocked',
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: colors.onPrimary.withOpacity(0.85)),
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: progress),
              duration: const Duration(milliseconds: 900),
              curve: Curves.easeOutCubic,
              builder: (context, value, _) => LinearProgressIndicator(
                value: value,
                minHeight: 8,
                backgroundColor: colors.onPrimary.withOpacity(0.18),
                valueColor: AlwaysStoppedAnimation(colors.onPrimary),
              ),
            ),
          ),
          if (nextUp != null) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Text(nextUp!.emoji, style: const TextStyle(fontSize: 18)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Next up: ${nextUp!.title} — ${nextUp!.progressLabel(stats)}',
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                          color: colors.onPrimary.withOpacity(0.9),
                        ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
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
