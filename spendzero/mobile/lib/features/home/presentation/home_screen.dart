import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
            icon: const Icon(Icons.bar_chart_rounded),
            tooltip: 'Dashboard',
            onPressed: () => context.push('/dashboard'),
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
              data: (s) => GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  context.push('/dashboard');
                },
                child: _SavingsBanner(
                  totalSavedPaise: s.totalAmountNotSpentPaise,
                  streakDays: s.currentStreakDays,
                ),
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
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeOutCubic,
      builder: (context, entrance, child) => Opacity(
        opacity: entrance,
        child: Transform.translate(offset: Offset(0, (1 - entrance) * 12), child: child),
      ),
      child: Container(
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [colors.primary, colors.primaryContainer],
          ),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: colors.primary.withOpacity(0.25),
              blurRadius: 24,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total saved so far',
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(color: colors.onPrimary.withOpacity(0.85)),
                ),
                if (streakDays > 0)
                  Semantics(
                    label: '$streakDays day saving streak',
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: colors.onPrimary.withOpacity(0.18),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('🔥', style: TextStyle(fontSize: 14)),
                          const SizedBox(width: 4),
                          Text(
                            '$streakDays day streak',
                            style: Theme.of(context)
                                .textTheme
                                .labelMedium
                                ?.copyWith(color: colors.onPrimary),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 6),
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: totalSavedPaise.toDouble()),
              duration: const Duration(milliseconds: 1100),
              curve: Curves.easeOutExpo,
              builder: (context, value, _) => Text(
                formatPaise(value.round()),
                style: Theme.of(context).textTheme.displayMedium?.copyWith(
                      color: colors.onPrimary,
                      fontWeight: FontWeight.w800,
                    ),
              ),
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                Icon(Icons.bar_chart_rounded, size: 14, color: colors.onPrimary.withOpacity(0.75)),
                const SizedBox(width: 4),
                Text(
                  'Tap to see your dashboard',
                  style: Theme.of(context)
                      .textTheme
                      .labelSmall
                      ?.copyWith(color: colors.onPrimary.withOpacity(0.75)),
                ),
              ],
            ),
          ],
        ),
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
          index: index,
          emoji: category.emoji,
          name: category.name,
          gradient: _categoryGradient(category.slug, index),
          onTap: () {
            HapticFeedback.selectionClick();
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
    'entertainment': 'movies',
    'movies': 'movies',
    'furniture': 'furniture',
  };
  // Try slug first, then check categoryId for demo categories
  if (slugMap.containsKey(slug)) return slugMap[slug];
  if (categoryId == 'demo-food') return 'food';
  if (categoryId == 'demo-groceries') return 'grocery';
  if (categoryId == 'demo-fashion') return 'shopping';
  return null;
}

/// Distinct two-tone gradients per category so the home grid reads as
/// vivid, branded destinations rather than flat identical gray tiles.
const _categoryPalette = <List<Color>>[
  [Color(0xFFFF6B6B), Color(0xFFFF8E53)], // food — warm coral
  [Color(0xFF38B89A), Color(0xFF1A9B82)], // grocery — fresh green
  [Color(0xFFB06AB3), Color(0xFF8B5CF6)], // fashion — violet
  [Color(0xFF3B82F6), Color(0xFF2563EB)], // electronics — blue
  [Color(0xFF06B6D4), Color(0xFF0891B2)], // travel — teal
  [Color(0xFF7C3AED), Color(0xFF5B21B6)], // movies — deep purple
  [Color(0xFFEC4899), Color(0xFFDB2777)], // beauty — pink
  [Color(0xFFD97706), Color(0xFFB45309)], // furniture — amber/brown
];

List<Color> _categoryGradient(String slug, int index) {
  const slugIndex = {
    'food': 0,
    'grocery': 1,
    'groceries': 1,
    'fashion': 2,
    'shopping': 2,
    'electronics': 3,
    'travel': 4,
    'entertainment': 5,
    'movies': 5,
    'beauty': 6,
    'furniture': 7,
  };
  final i = slugIndex[slug] ?? (index % _categoryPalette.length);
  return _categoryPalette[i];
}

class _CategoryTile extends StatefulWidget {
  const _CategoryTile({
    required this.index,
    required this.emoji,
    required this.name,
    required this.gradient,
    required this.onTap,
  });

  final int index;
  final String emoji;
  final String name;
  final List<Color> gradient;
  final VoidCallback onTap;

  @override
  State<_CategoryTile> createState() => _CategoryTileState();
}

class _CategoryTileState extends State<_CategoryTile> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final delay = (widget.index * 40).clamp(0, 320);
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 280 + delay),
      curve: Curves.easeOutCubic,
      builder: (context, entrance, child) => Opacity(
        opacity: entrance,
        child: Transform.scale(scale: 0.85 + entrance * 0.15, child: child),
      ),
      child: GestureDetector(
        onTapDown: (_) => setState(() => _pressed = true),
        onTapCancel: () => setState(() => _pressed = false),
        onTapUp: (_) => setState(() => _pressed = false),
        child: AnimatedScale(
          scale: _pressed ? 0.94 : 1,
          duration: const Duration(milliseconds: 100),
          curve: Curves.easeOut,
          child: InkWell(
            borderRadius: BorderRadius.circular(18),
            onTap: widget.onTap,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: widget.gradient,
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: _pressed
                    ? []
                    : [
                        BoxShadow(
                          color: widget.gradient.last.withOpacity(0.32),
                          blurRadius: 14,
                          offset: const Offset(0, 6),
                        ),
                      ],
              ),
              child: Semantics(
                button: true,
                label: widget.name,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.22),
                        shape: BoxShape.circle,
                      ),
                      child: Text(widget.emoji, style: const TextStyle(fontSize: 20)),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.name,
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
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
