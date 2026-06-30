import 'package:flutter/material.dart' show Icons, Icon, RefreshIndicator;
import 'package:flutter/widgets.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/category.dart';
import '../../../core/models/goal.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';
import '../../../design_system/colors.dart';
import '../../../design_system/components/dream_atmosphere.dart';
import '../../../design_system/components/dream_card.dart';
import '../../../design_system/components/falling_petals.dart';
import '../../../design_system/components/premium_progress_ring.dart';
import '../../../design_system/components/rise_in.dart';
import '../../../design_system/components/shimmer_gold_text.dart';
import '../../../design_system/gradients.dart';
import '../../../design_system/motion.dart';
import '../../../design_system/spacing.dart';
import '../../../design_system/typography.dart';
import '../../feedback/presentation/feedback_sheet.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    final categories = ref.watch(categoriesProvider);
    final stats = ref.watch(statsProvider);
    final goals = ref.watch(goalsProvider);

    return DecoratedBox(
      decoration: const BoxDecoration(color: DSColors.background),
      child: Stack(
        children: [
          const Positioned(
            top: -120,
            right: -80,
            child: _AmbientGlow(color: DSGradients.ambientGold, size: 320),
          ),
          const Positioned(
            bottom: 80,
            left: -100,
            child: _AmbientGlow(color: DSGradients.ambientFuture, size: 280),
          ),
          SafeArea(
            bottom: false,
            child: RefreshIndicator(
              color: DSColors.gold,
              backgroundColor: DSColors.surfaceElevated,
              onRefresh: () async {
                ref.invalidate(categoriesProvider);
                ref.invalidate(goalsProvider);
                ref.invalidate(statsProvider);
              },
              child: ListView(
                padding: const EdgeInsets.fromLTRB(
                    DSSpace.x5, DSSpace.x4, DSSpace.x5, 140),
                children: [
                  _TopBar(onFeedback: () => showFeedbackSheet(context)),
                  const SizedBox(height: DSSpace.x6),
                  const _Greeting(),
                  const SizedBox(height: DSSpace.x6),
                  stats.when(
                    data: (s) => goals.when(
                      data: (g) => RiseIn(
                        child: _HeroDream(
                          topDream: _topDream(g),
                          totalSavedPaise: s.totalAmountNotSpentPaise,
                          streakDays: s.currentStreakDays,
                          onTap: () => context.push('/dashboard'),
                        ),
                      ),
                      loading: () => const _HeroSkeleton(),
                      error: (_, __) => const _HeroSkeleton(),
                    ),
                    loading: () => const _HeroSkeleton(),
                    error: (_, __) => const _HeroSkeleton(),
                  ),
                  if (goals.valueOrNull != null &&
                      goals.value!.where((g) => !g.archived).isEmpty) ...[
                    const SizedBox(height: DSSpace.x4),
                    _NoDreamYetCard(onTap: () => context.push('/goals')),
                  ],
                  const SizedBox(height: DSSpace.x9),
                  RiseIn(
                    delayMs: DSMotion.riseDelayCollection,
                    child: goals.when(
                      data: (g) => _CollectionRow(
                        goals: g.where((d) => !d.archived).toList(),
                        onAdd: () => context.push('/goals'),
                        onOpenDream: () => context.push('/dashboard'),
                      ),
                      loading: () => const SizedBox(height: 300),
                      error: (_, __) => const SizedBox.shrink(),
                    ),
                  ),
                  const SizedBox(height: DSSpace.x9),
                  RiseIn(
                    delayMs: DSMotion.riseDelayCollection,
                    child: Text('Where to today?',
                        style: DSType.display_(18, color: DSColors.foreground)),
                  ),
                  const SizedBox(height: DSSpace.x4),
                  RiseIn(
                    delayMs: DSMotion.riseDelayCollection,
                    child: categories.when(
                      data: (list) => _CategoryGrid(categories: list),
                      loading: () => const _CategoryGridSkeleton(),
                      error: (error, _) => _ErrorState(
                        message: "Couldn't load categories. Pull down to retry.",
                        onRetry: () => ref.invalidate(categoriesProvider),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AmbientGlow extends StatelessWidget {
  const _AmbientGlow({required this.color, required this.size});

  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(colors: [color, color.withOpacity(0)]),
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.onFeedback});

  final VoidCallback onFeedback;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text('PROJECT FUTURE',
            style: DSType.eyebrow(size: 11, trackingEm: 0.24, color: DSColors.mutedForegroundOpacity(0.6))),
        GestureDetector(
          onTap: onFeedback,
          behavior: HitTestBehavior.opaque,
          child: Container(
            width: 36,
            height: 36,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: DSColors.whiteOpacity(0.06),
              border: Border.all(color: DSColors.whiteOpacity(0.1)),
            ),
            child: Icon(Icons.chat_bubble_outline,
                size: 16, color: DSColors.mutedForegroundOpacity(0.8)),
          ),
        ),
      ],
    );
  }
}

class _Greeting extends StatelessWidget {
  const _Greeting();

  String get _line {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    return RiseIn(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_line, style: DSType.sans_(15, color: DSColors.mutedForegroundOpacity(0.7))),
          const SizedBox(height: 2),
          ShimmerGoldText('Your future, today.',
              style: DSType.display_(28, weight: FontWeight.w600, color: DSColors.foreground)),
        ],
      ),
    );
  }
}

/// Picks the dream the home screen should tell a story about: the active,
/// non-archived goal closest to completion (most emotionally rewarding to
/// surface — "almost there" beats "just started").
SavingsGoal? _topDream(List<SavingsGoal> goals) {
  final active = goals.where((g) => !g.archived && g.progress < 1).toList()
    ..sort((a, b) => b.progress.compareTo(a.progress));
  if (active.isNotEmpty) return active.first;
  final any = goals.where((g) => !g.archived).toList();
  return any.isEmpty ? null : any.first;
}

/// Reproduces `index.tsx`'s `HeroDream`: a tall atmosphere card with falling
/// petals, a centered progress ring, and the running total beneath it.
class _HeroDream extends StatelessWidget {
  const _HeroDream({
    required this.topDream,
    required this.totalSavedPaise,
    required this.streakDays,
    required this.onTap,
  });

  final SavingsGoal? topDream;
  final int totalSavedPaise;
  final int streakDays;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final dream = topDream;
    final percent = dream != null ? (dream.progress * 100).round() : 0;
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Container(
        height: 320,
        width: double.infinity,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(DSRadius.xxl),
          border: Border.all(color: DSColors.whiteOpacity(0.1)),
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            DreamAtmosphere(seed: dream?.title ?? 'future'),
            const Positioned.fill(child: FallingPetals()),
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: DSGradients.heroScrim,
                  stops: DSGradients.heroScrimStops,
                ),
              ),
            ),
            Align(
              alignment: Alignment.center,
              child: PremiumProgressRing(percent: percent, size: 108),
            ),
            Align(
              alignment: Alignment.bottomLeft,
              child: Padding(
                padding: const EdgeInsets.all(DSSpace.x5),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      dream != null ? dream.title : 'Set your first dream',
                      style: DSType.display_(22, color: DSColors.foreground),
                    ),
                    const SizedBox(height: 4),
                    TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: totalSavedPaise.toDouble()),
                      duration: const Duration(milliseconds: 1100),
                      curve: Curves.easeOutExpo,
                      builder: (context, value, _) => Text(
                        '${formatPaise(value.round())} saved so far',
                        style: DSType.sans_(13, color: DSColors.mutedForegroundOpacity(0.75)),
                      ),
                    ),
                    if (streakDays > 0) ...[
                      const SizedBox(height: 6),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('🔥', style: DSType.sans_(13)),
                          const SizedBox(width: 4),
                          Text('$streakDays day streak',
                              style: DSType.sans_(12, color: DSColors.gold)),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HeroSkeleton extends StatelessWidget {
  const _HeroSkeleton();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 320,
      decoration: BoxDecoration(
        color: DSColors.surface,
        borderRadius: BorderRadius.circular(DSRadius.xxl),
      ),
    );
  }
}

/// Nudges a brand-new user to set their first dream, so every later "you
/// saved ₹X" moment has somewhere meaningful to point at instead of an
/// abstract total.
class _NoDreamYetCard extends StatelessWidget {
  const _NoDreamYetCard({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.all(DSSpace.x4),
        decoration: BoxDecoration(
          color: DSColors.surface,
          borderRadius: BorderRadius.circular(DSRadius.lg),
          border: Border.all(color: DSColors.whiteOpacity(0.08)),
        ),
        child: Row(
          children: [
            Text('🌱', style: DSType.sans_(22)),
            const SizedBox(width: DSSpace.x3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('What are you saving for?',
                      style: DSType.display_(15, color: DSColors.foreground)),
                  const SizedBox(height: 2),
                  Text(
                    'Set a dream and every save you make starts counting toward it.',
                    style: DSType.sans_(12, color: DSColors.mutedForegroundOpacity(0.7)),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 14, color: DSColors.mutedForegroundOpacity(0.5)),
          ],
        ),
      ),
    );
  }
}

/// Reproduces `index.tsx`'s `CollectionRow`: a horizontal scroller of dream
/// cards, each backed by a deterministic atmosphere image, plus the
/// dashed-border "add dream" ghost card.
class _CollectionRow extends StatelessWidget {
  const _CollectionRow({
    required this.goals,
    required this.onAdd,
    required this.onOpenDream,
  });

  final List<SavingsGoal> goals;
  final VoidCallback onAdd;
  final VoidCallback onOpenDream;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('YOUR FUTURES',
            style: DSType.eyebrow(size: 11, trackingEm: 0.24, color: DSColors.mutedForegroundOpacity(0.6))),
        const SizedBox(height: DSSpace.x3),
        SizedBox(
          height: 300,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: goals.length + 1,
            separatorBuilder: (_, __) => const SizedBox(width: DSSpace.x3),
            itemBuilder: (context, index) {
              if (index == goals.length) {
                return DSAddDreamCard(onTap: onAdd);
              }
              final dream = goals[index];
              return DSDreamCard(
                background: DreamAtmosphere(seed: dream.title),
                tag: dream.category,
                title: dream.title,
                amount: formatPaise(dream.targetPaise - dream.savedPaise),
                percent: (dream.progress * 100).round(),
                onTap: () {
                  HapticFeedback.selectionClick();
                  onOpenDream();
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

class _CategoryGrid extends StatelessWidget {
  const _CategoryGrid({required this.categories});

  final List<SpendCategory> categories;

  void _openCategory(BuildContext context, SpendCategory category) {
    HapticFeedback.selectionClick();
    final vertical = _verticalForCategory(category.id, category.slug);
    if (vertical != null) {
      context.push('/vertical/$vertical/${category.id}');
    } else {
      context.push('/checkout/${category.id}', extra: category);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) {
      return const _EmptyState(message: 'No categories yet — check back soon.');
    }
    final featured = categories.first;
    final rest = categories.skip(1).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _FeaturedCategoryCard(
          category: featured,
          gradient: _categoryGradient(featured.slug, 0),
          onTap: () => _openCategory(context, featured),
        ),
        if (rest.isNotEmpty) ...[
          const SizedBox(height: DSSpace.x3),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: rest.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              mainAxisSpacing: DSSpace.x3,
              crossAxisSpacing: DSSpace.x3,
              childAspectRatio: 0.9,
            ),
            itemBuilder: (context, index) {
              final category = rest[index];
              return _CategoryTile(
                index: index + 1,
                emoji: category.emoji,
                name: category.name,
                gradient: _categoryGradient(category.slug, index + 1),
                onTap: () => _openCategory(context, category),
              );
            },
          ),
        ],
      ],
    );
  }
}

/// A wide hero tile for the top category, so the home grid reads as a
/// curated "discovery surface" with a clear starting point rather than a
/// flat, uniform catalog grid.
class _FeaturedCategoryCard extends StatefulWidget {
  const _FeaturedCategoryCard({
    required this.category,
    required this.gradient,
    required this.onTap,
  });

  final SpendCategory category;
  final List<Color> gradient;
  final VoidCallback onTap;

  @override
  State<_FeaturedCategoryCard> createState() => _FeaturedCategoryCardState();
}

class _FeaturedCategoryCardState extends State<_FeaturedCategoryCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return AnimatedScale(
      scale: _pressed ? 0.97 : 1,
      duration: const Duration(milliseconds: 100),
      curve: Curves.easeOut,
      child: GestureDetector(
        onTapDown: (_) => setState(() => _pressed = true),
        onTapCancel: () => setState(() => _pressed = false),
        onTapUp: (_) => setState(() => _pressed = false),
        onTap: widget.onTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          height: 132,
          padding: const EdgeInsets.all(DSSpace.x5),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: widget.gradient,
            ),
            borderRadius: BorderRadius.circular(DSRadius.lg),
            boxShadow: [
              BoxShadow(
                color: widget.gradient.last.withOpacity(0.32),
                blurRadius: 16,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: DSColors.whiteOpacity(0.22),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text('Popular today',
                          style: DSType.sans_(11, weight: FontWeight.w600, color: DSColors.foreground)),
                    ),
                    const SizedBox(height: 10),
                    Text(widget.category.name,
                        style: DSType.display_(22, weight: FontWeight.w700, color: DSColors.foreground)),
                    const SizedBox(height: 2),
                    Text('Start a craving here',
                        style: DSType.sans_(13, color: DSColors.whiteOpacity(0.85))),
                  ],
                ),
              ),
              Text(widget.category.emoji, style: DSType.sans_(48)),
            ],
          ),
        ),
      ),
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
        mainAxisSpacing: DSSpace.x3,
        crossAxisSpacing: DSSpace.x3,
        childAspectRatio: 0.9,
      ),
      itemBuilder: (context, index) => Container(
        decoration: BoxDecoration(
          color: DSColors.surface,
          borderRadius: BorderRadius.circular(DSRadius.md),
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
        onTap: widget.onTap,
        behavior: HitTestBehavior.opaque,
        child: AnimatedScale(
          scale: _pressed ? 0.94 : 1,
          duration: const Duration(milliseconds: 100),
          curve: Curves.easeOut,
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: widget.gradient,
              ),
              borderRadius: BorderRadius.circular(DSRadius.md),
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
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: DSColors.whiteOpacity(0.22),
                    shape: BoxShape.circle,
                  ),
                  child: Text(widget.emoji, style: DSType.sans_(20)),
                ),
                const SizedBox(height: 8),
                Text(
                  widget.name,
                  style: DSType.sans_(12, weight: FontWeight.w600, color: DSColors.foreground),
                  textAlign: TextAlign.center,
                ),
              ],
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
      child: Center(
        child: Text(message, style: DSType.sans_(13, color: DSColors.mutedForegroundOpacity(0.7))),
      ),
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
          Text(message,
              style: DSType.sans_(13, color: DSColors.mutedForegroundOpacity(0.7)),
              textAlign: TextAlign.center),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: onRetry,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: DSColors.whiteOpacity(0.2)),
              ),
              child: Text('Retry', style: DSType.sans_(13, color: DSColors.foreground)),
            ),
          ),
        ],
      ),
    );
  }
}
