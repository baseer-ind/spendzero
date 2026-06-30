import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/data/local/fictional_apps_seed.dart';
import '../../../core/data/local/food_seed_data.dart';
import '../../../core/data/local/personalization_store.dart';
import '../../../core/data/local/wishlist_store.dart';
import '../../../core/models/category.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';

String _appIdFor(String restaurantId) => findAppIdForEntity(restaurantId) ?? restaurantId;

const _recentlyViewedKey = 'food_recently_viewed_restaurants_v1';
const _maxRecentlyViewed = 8;

/// Tracks the last-viewed restaurant ids on-device, SharedPreferences-backed
/// like every other `Local*` store in this app — see `local_store.dart`.
class RecentlyViewedFoodStore {
  Future<List<String>> read() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_recentlyViewedKey);
    if (raw == null) return [];
    return (jsonDecode(raw) as List).map((e) => e as String).toList();
  }

  Future<void> recordView(String restaurantId) async {
    final prefs = await SharedPreferences.getInstance();
    final current = await read();
    current.remove(restaurantId);
    current.insert(0, restaurantId);
    final trimmed = current.take(_maxRecentlyViewed).toList();
    await prefs.setString(_recentlyViewedKey, jsonEncode(trimmed));
  }
}

/// Deterministic gradient/colour derived from a seed string, extending the
/// same hash-to-hue approach used by `product_card.dart`'s `_Thumbnail`.
List<Color> _gradientForSeed(String seed) {
  final hue = (seed.codeUnits.fold<int>(0, (a, b) => a + b) % 360).toDouble();
  final start = HSLColor.fromAHSL(1, hue, 0.55, 0.55).toColor();
  final end = HSLColor.fromAHSL(1, (hue + 40) % 360, 0.6, 0.4).toColor();
  return [start, end];
}

class FoodHomeScreen extends ConsumerStatefulWidget {
  const FoodHomeScreen({super.key, required this.category});

  final SpendCategory category;

  @override
  ConsumerState<FoodHomeScreen> createState() => _FoodHomeScreenState();
}

enum _SortOption { relevance, ratingDesc, deliveryTimeAsc, priceAsc }

extension on _SortOption {
  String get label => switch (this) {
        _SortOption.relevance => 'Relevance',
        _SortOption.ratingDesc => 'Rating: High to Low',
        _SortOption.deliveryTimeAsc => 'Delivery Time',
        _SortOption.priceAsc => 'Price: Low to High',
      };
}

class _FoodHomeScreenState extends ConsumerState<FoodHomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _searchDebounce;
  String _searchQuery = '';
  String? _selectedCuisine;
  _SortOption _sortOption = _SortOption.relevance;
  List<Restaurant> _recentlyViewed = [];

  List<Restaurant> _applySort(List<Restaurant> list) {
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
        sorted.sort((a, b) => a.priceTier.compareTo(b.priceTier));
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
    final ids = await RecentlyViewedFoodStore().read();
    if (!mounted) return;
    setState(() {
      _recentlyViewed = ids.map(findRestaurantById).whereType<Restaurant>().toList();
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
      if (value.trim().length >= 3) {
        ref.read(personalizationProvider.notifier).recordSearch(value);
      }
    });
  }

  void _onCuisineSelected(String? cuisine) {
    HapticFeedback.selectionClick();
    setState(() => _selectedCuisine = _selectedCuisine == cuisine ? null : cuisine);
  }

  void _openRestaurant(Restaurant restaurant) async {
    await RecentlyViewedFoodStore().recordView(restaurant.id);
    ref.read(personalizationProvider.notifier).recordAppView(_appIdFor(restaurant.id));
    if (!mounted) return;
    context.push('/food/${widget.category.id}/restaurant/${restaurant.id}');
  }

  @override
  Widget build(BuildContext context) {
    final restaurantsAsync = ref.watch(foodRestaurantsProvider);
    final trendingAsync = ref.watch(foodTrendingProvider);
    final offersAsync = ref.watch(foodTodaysOffersProvider);
    final wishlist = ref.watch(wishlistProvider);
    final signals = ref.watch(personalizationProvider);
    final preferredDiet = signals.preferredDietTag();
    final recommended = preferredDiet == null
        ? const <MenuItem>[]
        : allMenuItemsFull
            .where((m) => m.dietaryTag.name == preferredDiet && m.isBestSeller)
            .take(10)
            .toList();
    final savedRestaurants = wishlist
        .where((e) => e.categoryId == widget.category.id)
        .map((e) => findRestaurantById(e.entityId))
        .whereType<Restaurant>()
        .toList();

    return Scaffold(
      appBar: AppBar(title: Text(widget.category.name)),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(foodRestaurantsProvider);
          ref.invalidate(foodTrendingProvider);
          ref.invalidate(foodTodaysOffersProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Search restaurants or dishes',
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
                _CollectionRail(
                  title: 'Recommended for You',
                  subtitle: 'Based on what you usually order',
                  items: recommended,
                  accentColor: (c) => Theme.of(c).colorScheme.surfaceContainerHighest,
                  categoryId: widget.category.id,
                ),
                const SizedBox(height: 20),
              ],
              trendingAsync.when(
                data: (restaurants) => restaurants.isEmpty
                    ? const SizedBox.shrink()
                    : _RestaurantRail(
                        title: 'Trending Now',
                        restaurants: restaurants,
                        onTap: _openRestaurant,
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
              _CollectionRail(
                title: 'Weekend Specials',
                subtitle: 'Hand-picked for slow Saturday mornings',
                items: weekendSpecials(),
                accentColor: (c) => Theme.of(c).colorScheme.tertiaryContainer,
                categoryId: widget.category.id,
              ),
              const SizedBox(height: 20),
              _CollectionRail(
                title: 'Late Night Cravings',
                subtitle: 'For when the kitchen calls after 9pm',
                items: lateNightCravings(),
                accentColor: (c) => Theme.of(c).colorScheme.surfaceContainerHighest,
                categoryId: widget.category.id,
              ),
              const SizedBox(height: 20),
              _CollectionRail(
                title: 'Healthy Week',
                subtitle: 'Lighter dishes that still hit the spot',
                items: healthyWeekPicks(),
                accentColor: (c) => Theme.of(c).colorScheme.secondaryContainer,
                categoryId: widget.category.id,
              ),
              const SizedBox(height: 20),
              _CollectionRail(
                title: 'Quick Office Lunch',
                subtitle: 'Bestsellers ready in 15 minutes or less',
                items: quickOfficeLunch(),
                accentColor: (c) => Theme.of(c).colorScheme.primaryContainer,
                categoryId: widget.category.id,
              ),
              const SizedBox(height: 20),
              _CollectionRail(
                title: 'Best Rated',
                subtitle: 'Loved by hundreds of regulars',
                items: bestRatedMenuItems(),
                accentColor: (c) => Theme.of(c).colorScheme.tertiaryContainer,
                categoryId: widget.category.id,
              ),
              const SizedBox(height: 20),
              _CollectionRail(
                title: 'Hidden Gems',
                subtitle: 'High ratings, still flying under the radar',
                items: hiddenGemMenuItems(),
                accentColor: (c) => Theme.of(c).colorScheme.secondaryContainer,
                categoryId: widget.category.id,
              ),
              const SizedBox(height: 20),
              if (savedRestaurants.isNotEmpty) ...[
                _RestaurantRail(
                  title: 'Saved for Later',
                  restaurants: savedRestaurants,
                  onTap: _openRestaurant,
                ),
                const SizedBox(height: 20),
              ],
              if (_recentlyViewed.isNotEmpty) ...[
                _RestaurantRail(
                  title: 'Recently Viewed',
                  restaurants: _recentlyViewed,
                  onTap: _openRestaurant,
                ),
                const SizedBox(height: 20),
              ],
              Text('Browse Restaurants', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              restaurantsAsync.when(
                data: (restaurants) {
                  final cuisines = <String>{};
                  for (final r in restaurants) {
                    cuisines.addAll(r.cuisines);
                  }
                  final filtered = _applySort(_selectedCuisine == null
                      ? restaurants
                      : restaurants
                          .where((r) => r.cuisines.contains(_selectedCuisine))
                          .toList());
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: _CuisineChipRow(
                              cuisines: cuisines.toList()..sort(),
                              selected: _selectedCuisine,
                              onSelected: _onCuisineSelected,
                            ),
                          ),
                          PopupMenuButton<_SortOption>(
                            icon: const Icon(Icons.sort_rounded),
                            tooltip: 'Sort',
                            initialValue: _sortOption,
                            onSelected: (option) {
                              HapticFeedback.selectionClick();
                              setState(() => _sortOption = option);
                            },
                            itemBuilder: (context) => _SortOption.values
                                .map((o) => PopupMenuItem(value: o, child: Text(o.label)))
                                .toList(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (filtered.isEmpty)
                        const _EmptyState(message: 'No restaurants match this filter.')
                      else
                        ...filtered.map(
                          (r) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: _RestaurantCard(
                              restaurant: r,
                              categoryId: widget.category.id,
                              onTap: () => _openRestaurant(r),
                            ),
                          ),
                        ),
                    ],
                  );
                },
                loading: () => const _RestaurantListSkeleton(),
                error: (error, _) => _ErrorState(
                  message: "Couldn't load restaurants. Pull down to retry.",
                  onRetry: () => ref.invalidate(foodRestaurantsProvider),
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
    final resultsAsync = ref.watch(foodSearchProvider(query));
    return resultsAsync.when(
      data: (results) {
        if (results.isEmpty) {
          return _EmptyState(message: 'No results for "$query".');
        }
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: results.map((result) {
            if (result is Restaurant) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _RestaurantCard(
                  restaurant: result,
                  categoryId: categoryId,
                  onTap: () async {
                    await RecentlyViewedFoodStore().recordView(result.id);
                    if (context.mounted) {
                      context.push('/food/$categoryId/restaurant/${result.id}');
                    }
                  },
                ),
              );
            }
            final item = result as MenuItem;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                tileColor: Theme.of(context).colorScheme.surfaceContainerHighest,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                title: Text(item.name),
                subtitle: Text(formatPaise(item.pricePaise)),
                onTap: () {
                  context.push('/food/$categoryId/restaurant/${item.restaurantId}');
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

class _RestaurantRail extends StatelessWidget {
  const _RestaurantRail({required this.title, required this.restaurants, required this.onTap});

  final String title;
  final List<Restaurant> restaurants;
  final ValueChanged<Restaurant> onTap;

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
            itemCount: restaurants.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final r = restaurants[index];
              return _RestaurantRailCard(restaurant: r, onTap: () => onTap(r));
            },
          ),
        ),
      ],
    );
  }
}

class _RestaurantRailCard extends StatelessWidget {
  const _RestaurantRailCard({required this.restaurant, required this.onTap});

  final Restaurant restaurant;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = _gradientForSeed(restaurant.bannerColorSeed);
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
              restaurant.name,
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
                  '${restaurant.avgRating.toStringAsFixed(1)} · ${restaurant.deliveryTimeMins} min',
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

  final List<MenuItem> items;

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

  final MenuItem item;

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

/// Generic horizontal rail for a curated [MenuItem] collection (Weekend
/// Specials, Late Night Cravings, Healthy Week, Quick Office Lunch, ...).
/// Each card opens the dish's restaurant, recording it as recently viewed
/// like every other entry point into a restaurant.
class _CollectionRail extends ConsumerWidget {
  const _CollectionRail({
    required this.title,
    required this.subtitle,
    required this.items,
    required this.accentColor,
    required this.categoryId,
  });

  final String title;
  final String subtitle;
  final List<MenuItem> items;
  final Color Function(BuildContext) accentColor;
  final String categoryId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (items.isEmpty) return const SizedBox.shrink();
    final colors = accentColor(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleMedium),
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
                    await RecentlyViewedFoodStore().recordView(item.restaurantId);
                    final personalization = ref.read(personalizationProvider.notifier);
                    personalization.recordDietaryView(item.dietaryTag.name);
                    personalization.recordPriceView(item.pricePaise);
                    if (context.mounted) {
                      context.push('/food/$categoryId/restaurant/${item.restaurantId}');
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

class _CuisineChipRow extends StatelessWidget {
  const _CuisineChipRow({required this.cuisines, required this.selected, required this.onSelected});

  final List<String> cuisines;
  final String? selected;
  final ValueChanged<String?> onSelected;

  @override
  Widget build(BuildContext context) {
    if (cuisines.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: cuisines.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final cuisine = cuisines[index];
          return ChoiceChip(
            label: Text(cuisine),
            selected: selected == cuisine,
            onSelected: (_) => onSelected(cuisine),
          );
        },
      ),
    );
  }
}

class _RestaurantCard extends ConsumerWidget {
  const _RestaurantCard({required this.restaurant, required this.onTap, this.categoryId = 'food'});

  final Restaurant restaurant;
  final VoidCallback onTap;
  final String categoryId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).colorScheme;
    final gradient = _gradientForSeed(restaurant.bannerColorSeed);
    final appId = _appIdFor(restaurant.id);
    final saved = ref.watch(
      wishlistProvider.select((list) => list.any((e) => e.entityId == restaurant.id && e.appId == appId)),
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
              child: const Icon(Icons.restaurant, color: Colors.white),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(restaurant.name, style: Theme.of(context).textTheme.bodyLarge),
                  const SizedBox(height: 2),
                  Text(
                    restaurant.brandTagline,
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
                        '${restaurant.avgRating.toStringAsFixed(1)} (${restaurant.reviewCount})',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        '${restaurant.deliveryTimeMins} min · ${restaurant.priceTier}',
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
                ref.read(wishlistProvider.notifier).toggle(restaurant.id, appId, categoryId);
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

class _RestaurantListSkeleton extends StatefulWidget {
  const _RestaurantListSkeleton();

  @override
  State<_RestaurantListSkeleton> createState() => _RestaurantListSkeletonState();
}

class _RestaurantListSkeletonState extends State<_RestaurantListSkeleton>
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
