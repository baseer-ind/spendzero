import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/data/local/fictional_apps_seed.dart';
import '../../../core/data/local/grocery_seed_data.dart';
import '../../../core/data/local/personalization_store.dart';
import '../../../core/data/local/wishlist_store.dart';
import '../../../core/models/category.dart';
import '../../../core/providers/providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/money.dart';

String _appIdFor(String storeId) => findAppIdForEntity(storeId) ?? storeId;

enum _SortOption { relevance, ratingDesc, deliveryTimeAsc, priceAsc }

extension on _SortOption {
  String get label => switch (this) {
        _SortOption.relevance => 'Relevance',
        _SortOption.ratingDesc => 'Rating: High to Low',
        _SortOption.deliveryTimeAsc => 'Delivery Time',
        _SortOption.priceAsc => 'Price: Low to High',
      };
}

const _recentlyViewedKey = 'grocery_recently_viewed_stores_v1';
const _maxRecentlyViewed = 8;

/// Tracks the last-viewed store ids on-device, SharedPreferences-backed
/// like every other `Local*` store in this app — see `local_store.dart`.
class RecentlyViewedGroceryStore {
  Future<List<String>> read() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_recentlyViewedKey);
    if (raw == null) return [];
    return (jsonDecode(raw) as List).map((e) => e as String).toList();
  }

  Future<void> recordView(String storeId) async {
    final prefs = await SharedPreferences.getInstance();
    final current = await read();
    current.remove(storeId);
    current.insert(0, storeId);
    final trimmed = current.take(_maxRecentlyViewed).toList();
    await prefs.setString(_recentlyViewedKey, jsonEncode(trimmed));
  }
}

/// Deterministic gradient/colour derived from a seed string — same
/// hash-to-hue approach used by the Food vertical's home/restaurant
/// screens, so store/product art never needs a network image.
List<Color> _gradientForSeed(String seed) {
  final hue = (seed.codeUnits.fold<int>(0, (a, b) => a + b) % 360).toDouble();
  final start = HSLColor.fromAHSL(1, hue, 0.55, 0.55).toColor();
  final end = HSLColor.fromAHSL(1, (hue + 40) % 360, 0.6, 0.4).toColor();
  return [start, end];
}

class GroceryHomeScreen extends ConsumerStatefulWidget {
  const GroceryHomeScreen({super.key, required this.category});

  final SpendCategory category;

  @override
  ConsumerState<GroceryHomeScreen> createState() => _GroceryHomeScreenState();
}

class _GroceryHomeScreenState extends ConsumerState<GroceryHomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _searchDebounce;
  String _searchQuery = '';
  String? _selectedCategory;
  List<GroceryStore> _recentlyViewed = [];
  _SortOption _sortOption = _SortOption.relevance;

  List<GroceryStore> _applySort(List<GroceryStore> list) {
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
    final ids = await RecentlyViewedGroceryStore().read();
    if (!mounted) return;
    setState(() {
      _recentlyViewed = ids.map(findGroceryStoreById).whereType<GroceryStore>().toList();
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

  void _openStore(GroceryStore store) async {
    await RecentlyViewedGroceryStore().recordView(store.id);
    ref.read(personalizationProvider.notifier).recordAppView(_appIdFor(store.id));
    if (!mounted) return;
    context.push('/grocery/${widget.category.id}/store/${store.id}');
  }

  @override
  Widget build(BuildContext context) {
    final storesAsync = ref.watch(groceryStoresProvider);
    final trendingAsync = ref.watch(groceryTrendingProvider);
    final offersAsync = ref.watch(groceryTodaysOffersProvider);
    final wishlist = ref.watch(wishlistProvider);
    final savedStores = wishlist
        .where((e) => e.categoryId == widget.category.id)
        .map((e) => findGroceryStoreById(e.entityId))
        .whereType<GroceryStore>()
        .toList();
    final signals = ref.watch(personalizationProvider);
    final typicalPrice = signals.typicalPricePaise();
    final recommended = typicalPrice == null
        ? const <GroceryProduct>[]
        : (allGroceryProducts
                .where((p) => (p.pricePaise - typicalPrice).abs() <= typicalPrice)
                .toList()
              ..sort((a, b) =>
                  (a.pricePaise - typicalPrice).abs().compareTo((b.pricePaise - typicalPrice).abs())))
            .take(10)
            .toList();

    return Scaffold(
      appBar: AppBar(title: Text(widget.category.name)),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(groceryStoresProvider);
          ref.invalidate(groceryTrendingProvider);
          ref.invalidate(groceryTodaysOffersProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Search stores or products',
                prefixIcon: const Icon(Icons.search),
                isDense: true,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),
            if (_searchQuery.isNotEmpty)
              _SearchResults(query: _searchQuery, categoryId: widget.category.id)
            else ...[
              if (recommended.isNotEmpty) ...[
                _GroceryCollectionRail(
                  title: 'Recommended for You',
                  subtitle: 'Matched to your usual basket size',
                  items: recommended,
                  accentColor: (c) => AppTheme.gold.withOpacity(0.12),
                  categoryId: widget.category.id,
                ),
                const SizedBox(height: 20),
              ],
              trendingAsync.when(
                data: (stores) => stores.isEmpty
                    ? const SizedBox.shrink()
                    : _StoreRail(
                        title: 'Trending Now',
                        stores: stores,
                        onTap: _openStore,
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
              _GroceryCollectionRail(
                title: 'Weekly Must-Haves',
                subtitle: 'Hand-picked staples worth restocking',
                items: weeklyMustHaves(),
                accentColor: (c) => AppTheme.gold.withOpacity(0.12),
                categoryId: widget.category.id,
              ),
              const SizedBox(height: 20),
              _GroceryCollectionRail(
                title: 'Organic Picks',
                subtitle: 'Natural, chemical-free choices',
                items: organicPicks(),
                accentColor: (c) => AppTheme.future.withOpacity(0.12),
                categoryId: widget.category.id,
              ),
              const SizedBox(height: 20),
              _GroceryCollectionRail(
                title: 'Pantry Restock',
                subtitle: 'The staples that run out first',
                items: pantryStaples(),
                accentColor: (c) => AppTheme.gold.withOpacity(0.12),
                categoryId: widget.category.id,
              ),
              const SizedBox(height: 20),
              _GroceryCollectionRail(
                title: 'Snack Attack',
                subtitle: 'Trending in everyone\'s snack drawer',
                items: snackAttack(),
                accentColor: (c) => AppTheme.surface,
                categoryId: widget.category.id,
              ),
              const SizedBox(height: 20),
              _GroceryCollectionRail(
                title: 'Best Rated',
                subtitle: 'Loved by hundreds of shoppers',
                items: bestRatedGroceryProducts(),
                accentColor: (c) => AppTheme.gold.withOpacity(0.12),
                categoryId: widget.category.id,
              ),
              const SizedBox(height: 20),
              _GroceryCollectionRail(
                title: 'Hidden Gems',
                subtitle: 'High ratings, still flying under the radar',
                items: hiddenGemGroceryProducts(),
                accentColor: (c) => AppTheme.future.withOpacity(0.12),
                categoryId: widget.category.id,
              ),
              const SizedBox(height: 20),
              if (savedStores.isNotEmpty) ...[
                _StoreRail(title: 'Saved for Later', stores: savedStores, onTap: _openStore),
                const SizedBox(height: 20),
              ],
              if (_recentlyViewed.isNotEmpty) ...[
                _StoreRail(
                  title: 'Recently Viewed',
                  stores: _recentlyViewed,
                  onTap: _openStore,
                ),
                const SizedBox(height: 20),
              ],
              Text('Browse Stores', style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 12),
              storesAsync.when(
                data: (stores) {
                  final categories = <String>{};
                  for (final s in stores) {
                    categories.addAll(s.categories);
                  }
                  final filtered = _applySort(_selectedCategory == null
                      ? stores
                      : stores
                          .where((s) => s.categories.contains(_selectedCategory))
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
                        const _EmptyState(message: 'No stores match this filter.')
                      else
                        ...filtered.map(
                          (s) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: _StoreCard(
                              store: s,
                              onTap: () => _openStore(s),
                              categoryId: widget.category.id,
                            ),
                          ),
                        ),
                    ],
                  );
                },
                loading: () => const _StoreListSkeleton(),
                error: (error, _) => _ErrorState(
                  message: "Couldn't load stores. Pull down to retry.",
                  onRetry: () => ref.invalidate(groceryStoresProvider),
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
    final resultsAsync = ref.watch(grocerySearchProvider(query));
    return resultsAsync.when(
      data: (results) {
        if (results.isEmpty) {
          return _EmptyState(message: 'No results for "$query".');
        }
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: results.map((result) {
            if (result is GroceryStore) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _StoreCard(
                  store: result,
                  categoryId: categoryId,
                  onTap: () async {
                    await RecentlyViewedGroceryStore().recordView(result.id);
                    if (context.mounted) {
                      context.push('/grocery/$categoryId/store/${result.id}');
                    }
                  },
                ),
              );
            }
            final product = result as GroceryProduct;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                tileColor: AppTheme.surface,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.white.withOpacity(0.08)),
                ),
                title: Text(product.name),
                subtitle: Text(formatPaise(product.pricePaise)),
                onTap: () {
                  context.push('/grocery/$categoryId/store/${product.storeId}');
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

class _StoreRail extends StatelessWidget {
  const _StoreRail({required this.title, required this.stores, required this.onTap});

  final String title;
  final List<GroceryStore> stores;
  final ValueChanged<GroceryStore> onTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 10),
        SizedBox(
          height: 150,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: stores.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final s = stores[index];
              return _StoreRailCard(store: s, onTap: () => onTap(s));
            },
          ),
        ),
      ],
    );
  }
}

class _StoreRailCard extends StatelessWidget {
  const _StoreRailCard({required this.store, required this.onTap});

  final GroceryStore store;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = _gradientForSeed(store.bannerColorSeed);
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
              store.name,
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
                  '${store.avgRating.toStringAsFixed(1)} · ${store.deliveryTimeMins} min',
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

  final List<GroceryProduct> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Today's Offers", style: Theme.of(context).textTheme.headlineSmall),
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

  final GroceryProduct item;

  @override
  Widget build(BuildContext context) {
    final discount = item.discountPercent;
    return Container(
      width: 170,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.gold.withOpacity(0.12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.gold.withOpacity(0.24)),
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
                        color: AppTheme.gold,
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

/// Generic horizontal rail for a curated [GroceryProduct] collection
/// (Weekly Must-Haves, Organic Picks, Pantry Staples, Snack Attack, ...).
/// Each card opens the product's store and records personalization signals.
class _GroceryCollectionRail extends ConsumerWidget {
  const _GroceryCollectionRail({
    required this.title,
    required this.subtitle,
    required this.items,
    required this.accentColor,
    required this.categoryId,
  });

  final String title;
  final String subtitle;
  final List<GroceryProduct> items;
  final Color Function(BuildContext) accentColor;
  final String categoryId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (items.isEmpty) return const SizedBox.shrink();
    final colors = accentColor(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.headlineSmall),
        Text(
          subtitle,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 120,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final item = items[index];
              return Material(
                color: colors,
                borderRadius: BorderRadius.circular(16),
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () async {
                    HapticFeedback.selectionClick();
                    await RecentlyViewedGroceryStore().recordView(item.storeId);
                    final personalization = ref.read(personalizationProvider.notifier);
                    personalization.recordPriceView(item.pricePaise);
                    if (context.mounted) {
                      context.push('/grocery/$categoryId/store/${item.storeId}');
                    }
                  },
                  child: Container(
                    width: 150,
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodySmall),
                        const Spacer(),
                        Row(
                          children: [
                            const Icon(Icons.star_rounded, size: 13, color: AppTheme.gold),
                            const SizedBox(width: 2),
                            Text(item.rating.toStringAsFixed(1), style: Theme.of(context).textTheme.labelSmall),
                          ],
                        ),
                        const SizedBox(height: 4),
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

class _StoreCard extends ConsumerWidget {
  const _StoreCard({required this.store, required this.onTap, this.categoryId = 'grocery'});

  final GroceryStore store;
  final VoidCallback onTap;
  final String categoryId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).colorScheme;
    final gradient = _gradientForSeed(store.bannerColorSeed);
    final appId = _appIdFor(store.id);
    final saved = ref.watch(
      wishlistProvider.select((list) => list.any((e) => e.entityId == store.id && e.appId == appId)),
    );
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
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
              child: const Icon(Icons.local_grocery_store, color: Colors.white),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(store.name, style: Theme.of(context).textTheme.bodyLarge),
                  const SizedBox(height: 2),
                  Text(
                    store.brandTagline,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, size: 16, color: AppTheme.gold),
                      const SizedBox(width: 2),
                      Text(
                        '${store.avgRating.toStringAsFixed(1)} (${store.reviewCount})',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        '${store.deliveryTimeMins} min · ${store.priceTier}',
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
                ref.read(wishlistProvider.notifier).toggle(store.id, appId, categoryId);
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
        Text(widget.title, style: Theme.of(context).textTheme.headlineSmall),
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
                    color: AppTheme.surface,
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

class _StoreListSkeleton extends StatefulWidget {
  const _StoreListSkeleton();

  @override
  State<_StoreListSkeleton> createState() => _StoreListSkeletonState();
}

class _StoreListSkeletonState extends State<_StoreListSkeleton>
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
                  color: AppTheme.surface,
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
