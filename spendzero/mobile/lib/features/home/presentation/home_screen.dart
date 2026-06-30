import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/models/category.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';
import '../../feedback/presentation/feedback_sheet.dart';

const _firstLaunchHintKey = 'spendzero_seen_first_launch_hint';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool? _showHint;

  @override
  void initState() {
    super.initState();
    _loadHintState();
  }

  Future<void> _loadHintState() async {
    final prefs = await SharedPreferences.getInstance();
    final seen = prefs.getBool(_firstLaunchHintKey) ?? false;
    if (mounted) setState(() => _showHint = !seen);
  }

  Future<void> _dismissHint() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_firstLaunchHintKey, true);
    if (mounted) setState(() => _showHint = false);
  }

  @override
  Widget build(BuildContext context) {
    final categories = ref.watch(categoriesProvider);
    final stats = ref.watch(statsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('SpendZero'),
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline),
            tooltip: 'Send feedback',
            onPressed: () => showFeedbackSheet(context),
          ),
          IconButton(
            icon: const Icon(Icons.flag_outlined),
            tooltip: 'Goals',
            onPressed: () => context.push('/goals'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(categoriesProvider);
          ref.invalidate(goalsProvider);
          ref.invalidate(statsProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (_showHint == true) ...[
              _FirstLaunchHint(onDismiss: _dismissHint),
              const SizedBox(height: 16),
            ],
            stats.when(
              data: (s) => _SavingsBanner(
                totalSavedPaise: s.totalAmountNotSpentPaise,
                streakDays: s.currentStreakDays,
              ),
              loading: () => const _SavingsBannerSkeleton(),
              error: (error, _) => const _SavingsBannerSkeleton(),
            ),
            const SizedBox(height: 20),
            Text('Browse a category', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            categories.when(
              data: (list) => _CategoryGrid(categories: list),
              loading: () => const _CategoryGridSkeleton(),
              error: (error, _) => _ErrorState(
                message: 'Couldn\'t load categories. Pull down to retry.',
                onRetry: () => ref.invalidate(categoriesProvider),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Closes the "what do I even do here" gap for a brand-new install,
/// identified in docs/23-validation-review.md — shown once, dismissible,
/// no multi-screen onboarding flow.
class _FirstLaunchHint extends StatelessWidget {
  const _FirstLaunchHint({required this.onDismiss});

  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.tertiaryContainer,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('👋', style: TextStyle(fontSize: 20)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Tap any category below. Nothing here ever spends real '
              'money — it\'s all about catching what you didn\'t buy.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close, size: 18),
            tooltip: 'Dismiss',
            onPressed: onDismiss,
          ),
        ],
      ),
    );
  }
}

class _SavingsBanner extends StatelessWidget {
  const _SavingsBanner({required this.totalSavedPaise, required this.streakDays});

  final int totalSavedPaise;
  final int streakDays;

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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total saved so far', style: Theme.of(context).textTheme.bodyMedium),
              if (streakDays > 0)
                Semantics(
                  label: '$streakDays day saving streak',
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: colors.secondaryContainer,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('🔥', style: TextStyle(fontSize: 14)),
                        const SizedBox(width: 4),
                        Text(
                          '$streakDays day streak',
                          style: Theme.of(context).textTheme.labelMedium,
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          TweenAnimationBuilder<int>(
            tween: IntTween(begin: 0, end: totalSavedPaise),
            duration: const Duration(milliseconds: 800),
            curve: Curves.easeOutCubic,
            builder: (context, value, _) => Text(
              formatPaise(value),
              style: Theme.of(context)
                  .textTheme
                  .headlineMedium
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

class _SavingsBannerSkeleton extends StatelessWidget {
  const _SavingsBannerSkeleton();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 96,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(20),
      ),
    );
  }
}

class _CategoryGrid extends StatelessWidget {
  const _CategoryGrid({required this.categories});

  final List<SpendCategory> categories;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) {
      return const _EmptyState(message: 'No categories yet — check back soon.');
    }
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: categories.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.9,
      ),
      itemBuilder: (context, index) {
        final category = categories[index];
        return _CategoryTile(
          emoji: category.emoji,
          name: category.name,
          onTap: () {
            final vertical = _verticalForCategory(category.id, category.slug);
            if (vertical != null) {
              context.push('/vertical/$vertical/${category.id}');
            } else {
              context.push('/checkout/${category.id}', extra: category);
            }
          },
        );
      },
    );
  }
}

class _CategoryGridSkeleton extends StatelessWidget {
  const _CategoryGridSkeleton();

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 6,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.9,
      ),
      itemBuilder: (context, index) => Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}

/// Maps a category id/slug to a vertical name. Returns null for categories
/// that don't have a fictional-app launcher (falls back to checkout screen).
String? _verticalForCategory(String categoryId, String slug) {
  const slugMap = {
    'food': 'food',
    'grocery': 'grocery',
    'groceries': 'grocery',
    'fashion': 'shopping',
    'shopping': 'shopping',
    'travel': 'travel',
    'beauty': 'beauty',
    'electronics': 'electronics',
  };
  // Try slug first, then check categoryId for demo categories
  if (slugMap.containsKey(slug)) return slugMap[slug];
  if (categoryId == 'demo-food') return 'food';
  if (categoryId == 'demo-groceries') return 'grocery';
  if (categoryId == 'demo-fashion') return 'shopping';
  return null;
}

class _CategoryTile extends StatefulWidget {
  const _CategoryTile({required this.emoji, required this.name, required this.onTap});

  final String emoji;
  final String name;
  final VoidCallback onTap;

  @override
  State<_CategoryTile> createState() => _CategoryTileState();
}

class _CategoryTileState extends State<_CategoryTile> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapCancel: () => setState(() => _pressed = false),
      onTapUp: (_) => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.94 : 1,
        duration: const Duration(milliseconds: 100),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: widget.onTap,
          child: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Semantics(
              button: true,
              label: widget.name,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(widget.emoji, style: const TextStyle(fontSize: 28)),
                  const SizedBox(height: 6),
                  Text(widget.name, style: Theme.of(context).textTheme.labelMedium),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Center(child: Text(message, style: Theme.of(context).textTheme.bodyMedium)),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          Text(message, style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}
