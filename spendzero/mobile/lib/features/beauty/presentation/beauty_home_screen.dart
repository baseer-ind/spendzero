import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/data/local/fictional_apps_seed.dart';
import '../../../core/data/local/beauty_seed_data.dart';
import '../../../core/data/local/personalization_store.dart';
import '../../../core/data/local/wishlist_store.dart';
import '../../../core/models/category.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';

String _appIdFor(String brandId) => findAppIdForEntity(brandId) ?? brandId;

enum _SortOption { relevance, ratingDesc, deliveryTimeAsc, priceAsc }

extension on _SortOption {
  String get label => switch (this) {
        _SortOption.relevance => 'Relevance',
        _SortOption.ratingDesc => 'Rating: High to Low',
        _SortOption.deliveryTimeAsc => 'Delivery Time',
        _SortOption.priceAsc => 'Price: Low to High',
      };
}

const _recentlyViewedKey = 'beauty_recently_viewed_brands_v1';
const _maxRecentlyViewed = 8;

/// Tracks the last-viewed brand ids on-device, SharedPreferences-backed
/// like every other `Local*` store in this app — see `local_store.dart`.
class RecentlyViewedBeautyBrand {
  Future<List<String>> read() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_recentlyViewedKey);
    if (raw == null) return [];
    return (jsonDecode(raw) as List).map((e) => e as String).toList();
  }

  Future<void> recordView(String brandId) async {
    final prefs = await SharedPreferences.getInstance();
    final current = await read();
    current.remove(brandId);
    current.insert(0, brandId);
    final trimmed = current.take(_maxRecentlyViewed).toList();
    await prefs.setString(_recentlyViewedKey, jsonEncode(trimmed));
  }
}

/// Deterministic gradient/colour derived from a seed string — same
/// hash-to-hue approach used by the Food and Grocery verticals, so
/// brand/product art never needs a network image.
List<Color> _gradientForSeed(String seed) {
  final hue = (seed.codeUnits.fold<int>(0, (a, b) => a + b) % 360).toDouble();
  final start = HSLColor.fromAHSL(1, hue, 0.55, 0.55).toColor();
  final end = HSLColor.fromAHSL(1, (hue + 40) % 360, 0.6, 0.4).toColor();
  return [start, end];
}

class BeautyHomeScreen extends ConsumerStatefulWidget {
  const BeautyHomeScreen({super.key, required this.category});

  final SpendCategory category;

  @override
  ConsumerState<BeautyHomeScreen> createState() => _BeautyHomeScreenState();
}

class _BeautyHomeScreenState extends ConsumerState<BeautyHomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _searchDebounce;
  String _searchQuery = '';
  String? _selectedCategory;
  List<BeautyBrand> _recentlyViewed = [];
  _SortOption _sortOption = _SortOption.relevance;

  List<BeautyBrand> _applySort(List<BeautyBrand> list) {
    final sorted = [...list];
    switch (_sortOption) {
      case _SortOption.relevance:
        break;
      case _SortOption.ratingDesc:
        sorted.sort((a, b) => b.avgRating.compareTo(a.avgRating));
        break;
      case _SortOption.deliveryTimeAsc:
        sorted.sort((a, b) => a.deliveryTimeMins.compareTo(b.deliveryTimeMins));
        break;
      case _SortOption.priceAsc:
        sorted.sort((a, b) => a.priceTier.length.compareTo(b.priceTier.length));
        break;
    }
    return sorted;
  }

  @override
  void initState() {
    super.initState();
    _loadRecentlyViewed();
    Future.microtask(
      () => ref.read(personalizationProvider.notifier).recordCategoryView(widget.category.id),
    );
  }

  Future<void> _loadRecentlyViewed() async {
    final ids = await RecentlyViewedBeautyBrand().read();
    if (!mounted) return;
    setState(() {
      _recentlyViewed = ids.map(findBeautyBrandById).whereType<BeautyBrand>().toList();
    });
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _searchDebounce?.cancel();
    _searchDebounce = Timer(const Duration(milliseconds: 300), () {
      setState(() => _searchQuery = value.trim());
    });
  }

  void _onCategorySelected(String? category) {
    HapticFeedback.selectionClick();
    setState(() => _selectedCategory = _selectedCategory == category ? null : category);
  }

  void _openBrand(BeautyBrand brand) async {
    await RecentlyViewedBeautyBrand().recordView(brand.id);
    ref.read(personalizationProvider.notifier).recordAppView(_appIdFor(brand.id));
    if (!mounted) return;
    context.push('/beauty/${widget.category.id}/brand/${brand.id}');
  }

  @override
  Widget build(BuildContext context) {
    final brandsAsync = ref.watch(beautyBrandsProvider);
    final trendingAsync = ref.watch(beautyTrendingProvider);
    final offersAsync = ref.watch(beautyTodaysOffersProvider);
    final wishlist = ref.watch(wishlistProvider);
    final savedBrands = wishlist
        .where((e) => e.categoryId == widget.category.id)
        .map((e) => findBeautyBrandById(e.entityId))
        .whereType<BeautyBrand>()
        .toList();

    return Scaffold(
      appBar: AppBar(title: Text(widget.category.name)),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(beautyBrandsProvider);
          ref.invalidate(beautyTrendingProvider);
          ref.invalidate(beautyTodaysOffersProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Search brands or products',
                prefixIcon: const Icon(Icons.search),
                isDense: true,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),
            if (_searchQuery.isNotEmpty)
              _SearchResults(query: _searchQuery, categoryId: widget.category.id)
            else ...[
              trendingAsync.when(
                data: (brands) => brands.isEmpty
                    ? const SizedBox.shrink()
                    : _BrandRail(
                        title: 'Trending Now',
                        brands: brands,
                        onTap: _openBrand,
                      ),
                loading: () => const _RailSkeleton(title: 'Trending Now'),
                error: (_, __) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 20),
              offersAsync.when(
                data: (items) => items.isEmpty
                    ? const SizedBox.shrink()
                    : _OffersRail(items: items),
                loading: () => const _RailSkeleton(title: "Today's Offers"),
                error: (_, __) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 20),
              if (skincareEdit().isNotEmpty) ...[
                _BeautyCollectionRail(
                  title: 'Skincare Edit',
                  subtitle: 'Serums, moisturizers & suncare',
                  items: skincareEdit(),
                  categoryId: widget.category.id,
                  accentColor: (context) => Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(height: 20),
              ],
              if (makeupMustHaves().isNotEmpty) ...[
                _BeautyCollectionRail(
                  title: 'Makeup Must-Haves',
                  subtitle: 'Lips, eyes & base essentials',
                  items: makeupMustHaves(),
                  categoryId: widget.category.id,
                  accentColor: (context) => Colors.pinkAccent,
                ),
                const SizedBox(height: 20),
              ],
              if (haircarePicks().isNotEmpty) ...[
                _BeautyCollectionRail(
                  title: 'Haircare Picks',
                  subtitle: 'For every texture and concern',
                  items: haircarePicks(),
                  categoryId: widget.category.id,
                  accentColor: (context) => Colors.tealAccent.shade700,
                ),
                const SizedBox(height: 20),
              ],
              if (newArrivalsBeauty().isNotEmpty) ...[
                _BeautyCollectionRail(
                  title: 'New Arrivals',
                  subtitle: 'Fresh launches across all brands',
                  items: newArrivalsBeauty(),
                  categoryId: widget.category.id,
                  accentColor: (context) => Theme.of(context).colorScheme.tertiary,
                ),
                const SizedBox(height: 20),
              ],
              if (savedBrands.isNotEmpty) ...[
                _BrandRail(title: 'Saved for Later', brands: savedBrands, onTap: _openBrand),
                const SizedBox(height: 20),
              ],
              if (_recentlyViewed.isNotEmpty) ...[
                _BrandRail(
                  title: 'Recently Viewed',
                  brands: _recentlyViewed,
                  onTap: _openBrand,
                ),
                const SizedBox(height: 20),
              ],
              Text('Browse Brands', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              brandsAsync.when(
                data: (brands) {
                  final categories = <String>{};
                  for (final b in brands) {
                    categories.addAll(b.categories);
                  }
                  final filtered = _applySort(_selectedCategory == null
                      ? brands
                      : brands
                          .where((b) => b.categories.contains(_selectedCategory))
                          .toList());
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: _CategoryChipRow(
                              categories: categories.toList()..sort(),
                              selected: _selectedCategory,
                              onSelected: _onCategorySelected,
                            ),
                          ),
                          PopupMenuButton<_SortOption>(
                            icon: const Icon(Icons.sort_rounded),
                            tooltip: 'Sort',
                            initialValue: _sortOption,
                            onSelected: (value) {
                              HapticFeedback.selectionClick();
                              setState(() => _sortOption = value);
                            },
                            itemBuilder: (context) => _SortOption.values
                                .map((opt) => PopupMenuItem(value: opt, child: Text(opt.label)))
                                .toList(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (filtered.isEmpty)
                        const _EmptyState(message: 'No brands match this filter.')
                      else
                        ...filtered.map(
                          (b) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: _BrandCard(
                              brand: b,
                              onTap: () => _openBrand(b),
                              categoryId: widget.category.id,
                            ),
                          ),
                        ),
                    ],
                  );
                },
                loading: () => const _BrandListSkeleton(),
                error: (error, _) => _ErrorState(
                  message: "Couldn't load brands. Pull down to retry.",
                  onRetry: () => ref.invalidate(beautyBrandsProvider),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _SearchResults extends ConsumerWidget {
  const _SearchResults({required this.query, required this.categoryId});

  final String query;
  final String categoryId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resultsAsync = ref.watch(beautySearchProvider(query));
    return resultsAsync.when(
      data: (results) {
        if (results.isEmpty) {
          return _EmptyState(message: 'No results for "$query".');
        }
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: results.map((result) {
            if (result is BeautyBrand) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _BrandCard(
                  brand: result,
                  categoryId: categoryId,
                  onTap: () async {
                    await RecentlyViewedBeautyBrand().recordView(result.id);
                    if (context.mounted) {
                      context.push('/beauty/$categoryId/brand/${result.id}');
                    }
                  },
                ),
              );
            }
            final product = result as BeautyProduct;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                tileColor: Theme.of(context).colorScheme.surfaceContainerHighest,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                title: Text(product.name),
                subtitle: Text(formatPaise(product.pricePaise)),
                onTap: () {
                  context.push('/beauty/$categoryId/brand/${product.brandId}');
                },
              ),
            );
          }).toList(),
        );
      },
      loading: () => const Center(child: Padding(
        padding: EdgeInsets.all(24),
        child: CircularProgressIndicator(),
      )),
      error: (_, __) => const _EmptyState(message: 'Search failed. Try again.'),
    );
  }
}

class _BrandRail extends StatelessWidget {
  const _BrandRail({required this.title, required this.brands, required this.onTap});

  final String title;
  final List<BeautyBrand> brands;
  final ValueChanged<BeautyBrand> onTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 10),
        SizedBox(
          height: 150,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: brands.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final b = brands[index];
              return _BrandRailCard(brand: b, onTap: () => onTap(b));
            },
          ),
        ),
      ],
    );
  }
}

class _BrandRailCard extends StatelessWidget {
  const _BrandRailCard({required this.brand, required this.onTap});

  final BeautyBrand brand;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = _gradientForSeed(brand.bannerColorSeed);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 160,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: colors, begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Text(
              brand.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.star_rounded, size: 14, color: Colors.white),
                const SizedBox(width: 2),
                Text(
                  '${brand.avgRating.toStringAsFixed(1)} · ${brand.deliveryTimeMins} min',
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _OffersRail extends StatelessWidget {
  const _OffersRail({required this.items});

  final List<BeautyProduct> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Today's Offers", style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 10),
        SizedBox(
          height: 130,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) => _OfferCard(item: items[index]),
          ),
        ),
      ],
    );
  }
}

class _OfferCard extends StatelessWidget {
  const _OfferCard({required this.item});

  final BeautyProduct item;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final discount = item.discountPercent;
    return Container(
      width: 170,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(item.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodyMedium),
          const Spacer(),
          Row(
            children: [
              Text(formatPaise(item.pricePaise), style: Theme.of(context).textTheme.titleSmall),
              if (discount != null) ...[
                const SizedBox(width: 6),
                Text(
                  '$discount% off',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: colors.primary,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _BeautyCollectionRail extends ConsumerWidget {
  const _BeautyCollectionRail({
    required this.title,
    required this.subtitle,
    required this.items,
    required this.categoryId,
    required this.accentColor,
  });

  final String title;
  final String subtitle;
  final List<BeautyProduct> items;
  final String categoryId;
  final Color Function(BuildContext) accentColor;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleMedium),
        Text(subtitle, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: colors.outline)),
        const SizedBox(height: 10),
        SizedBox(
          height: 130,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final item = items[index];
              return Material(
                color: colors.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(16),
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () async {
                    await RecentlyViewedBeautyBrand().recordView(item.brandId);
                    ref.read(personalizationProvider.notifier).recordPriceView(item.pricePaise);
                    if (context.mounted) {
                      context.push('/beauty/$categoryId/brand/${item.brandId}');
                    }
                  },
                  child: Container(
                    width: 170,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      border: Border(top: BorderSide(color: accentColor(context), width: 3)),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.name,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.bodyMedium),
                        const Spacer(),
                        Text(formatPaise(item.pricePaise), style: Theme.of(context).textTheme.titleSmall),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _CategoryChipRow extends StatelessWidget {
  const _CategoryChipRow({required this.categories, required this.selected, required this.onSelected});

  final List<String> categories;
  final String? selected;
  final ValueChanged<String?> onSelected;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final category = categories[index];
          return ChoiceChip(
            label: Text(category),
            selected: selected == category,
            onSelected: (_) => onSelected(category),
          );
        },
      ),
    );
  }
}

class _BrandCard extends ConsumerWidget {
  const _BrandCard({required this.brand, required this.onTap, this.categoryId = 'beauty'});

  final BeautyBrand brand;
  final VoidCallback onTap;
  final String categoryId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).colorScheme;
    final gradient = _gradientForSeed(brand.bannerColorSeed);
    final appId = _appIdFor(brand.id);
    final saved = ref.watch(
      wishlistProvider.select((list) => list.any((e) => e.entityId == brand.id && e.appId == appId)),
    );
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: colors.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: gradient),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.storefront, color: Colors.white),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(brand.name, style: Theme.of(context).textTheme.bodyLarge),
                  const SizedBox(height: 2),
                  Text(
                    brand.brandTagline,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.star_rounded, size: 16, color: colors.secondary),
                      const SizedBox(width: 2),
                      Text(
                        '${brand.avgRating.toStringAsFixed(1)} (${brand.reviewCount})',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        '${brand.deliveryTimeMins} min · ${brand.priceTier}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            IconButton(
              icon: Icon(
                saved ? Icons.favorite : Icons.favorite_border,
                color: saved ? colors.error : colors.onSurfaceVariant,
              ),
              onPressed: () {
                HapticFeedback.lightImpact();
                ref.read(wishlistProvider.notifier).toggle(brand.id, appId, categoryId);
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _RailSkeleton extends StatefulWidget {
  const _RailSkeleton({required this.title});

  final String title;

  @override
  State<_RailSkeleton> createState() => _RailSkeletonState();
}

class _RailSkeletonState extends State<_RailSkeleton> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.title, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 10),
        SizedBox(
          height: 130,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: 4,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) => AnimatedBuilder(
              animation: _controller,
              builder: (context, _) => AnimatedOpacity(
                opacity: 0.4 + (_controller.value * 0.4),
                duration: const Duration(milliseconds: 100),
                child: Container(
                  width: 160,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _BrandListSkeleton extends StatefulWidget {
  const _BrandListSkeleton();

  @override
  State<_BrandListSkeleton> createState() => _BrandListSkeletonState();
}

class _BrandListSkeletonState extends State<_BrandListSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(4, (index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, _) => AnimatedOpacity(
              opacity: 0.4 + (_controller.value * 0.4),
              duration: const Duration(milliseconds: 100),
              child: Container(
                height: 88,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
        );
      }),
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
