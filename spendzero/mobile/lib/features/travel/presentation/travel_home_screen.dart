import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/data/local/fictional_apps_seed.dart';
import '../../../core/data/local/personalization_store.dart';
import '../../../core/data/local/travel_seed_data.dart';
import '../../../core/data/local/wishlist_store.dart';
import '../../../core/models/category.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';

String _appIdFor(String stayId) => findAppIdForEntity(stayId) ?? stayId;

enum _SortOption { relevance, ratingDesc, distanceAsc, priceAsc }

extension on _SortOption {
  String get label => switch (this) {
        _SortOption.relevance => 'Relevance',
        _SortOption.ratingDesc => 'Rating: High to Low',
        _SortOption.distanceAsc => 'Distance',
        _SortOption.priceAsc => 'Price: Low to High',
      };
}

const _recentlyViewedKey = 'travel_recently_viewed_stays_v1';
const _maxRecentlyViewed = 8;

/// Tracks the last-viewed stay ids on-device, SharedPreferences-backed
/// like every other `Local*` store in this app — see `local_store.dart`.
class RecentlyViewedTravelStay {
  Future<List<String>> read() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_recentlyViewedKey);
    if (raw == null) return [];
    return (jsonDecode(raw) as List).map((e) => e as String).toList();
  }

  Future<void> recordView(String stayId) async {
    final prefs = await SharedPreferences.getInstance();
    final current = await read();
    current.remove(stayId);
    current.insert(0, stayId);
    final trimmed = current.take(_maxRecentlyViewed).toList();
    await prefs.setString(_recentlyViewedKey, jsonEncode(trimmed));
  }
}

/// Deterministic gradient/colour derived from a seed string — same
/// hash-to-hue approach used by the other verticals' home/detail screens,
/// so stay/room art never needs a network image.
List<Color> _gradientForSeed(String seed) {
  final hue = (seed.codeUnits.fold<int>(0, (a, b) => a + b) % 360).toDouble();
  final start = HSLColor.fromAHSL(1, hue, 0.55, 0.55).toColor();
  final end = HSLColor.fromAHSL(1, (hue + 40) % 360, 0.6, 0.4).toColor();
  return [start, end];
}

class TravelHomeScreen extends ConsumerStatefulWidget {
  const TravelHomeScreen({super.key, required this.category});

  final SpendCategory category;

  @override
  ConsumerState<TravelHomeScreen> createState() => _TravelHomeScreenState();
}

class _TravelHomeScreenState extends ConsumerState<TravelHomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _searchDebounce;
  String _searchQuery = '';
  String? _selectedAmenity;
  List<TravelStay> _recentlyViewed = [];
  _SortOption _sortOption = _SortOption.relevance;

  List<TravelStay> _applySort(List<TravelStay> list) {
    final sorted = [...list];
    switch (_sortOption) {
      case _SortOption.relevance:
        break;
      case _SortOption.ratingDesc:
        sorted.sort((a, b) => b.avgRating.compareTo(a.avgRating));
        break;
      case _SortOption.distanceAsc:
        sorted.sort((a, b) => a.distanceKm.compareTo(b.distanceKm));
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
    final ids = await RecentlyViewedTravelStay().read();
    if (!mounted) return;
    setState(() {
      _recentlyViewed = ids.map(findTravelStayById).whereType<TravelStay>().toList();
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

  void _onAmenitySelected(String? amenity) {
    HapticFeedback.selectionClick();
    setState(() => _selectedAmenity = _selectedAmenity == amenity ? null : amenity);
  }

  void _openStay(TravelStay stay) async {
    await RecentlyViewedTravelStay().recordView(stay.id);
    ref.read(personalizationProvider.notifier).recordAppView(_appIdFor(stay.id));
    if (!mounted) return;
    context.push('/travel/${widget.category.id}/stay/${stay.id}');
  }

  @override
  Widget build(BuildContext context) {
    final staysAsync = ref.watch(travelStaysProvider);
    final trendingAsync = ref.watch(travelTrendingProvider);
    final offersAsync = ref.watch(travelTodaysOffersProvider);
    final wishlist = ref.watch(wishlistProvider);
    final savedStays = wishlist
        .where((e) => e.categoryId == widget.category.id)
        .map((e) => findTravelStayById(e.entityId))
        .whereType<TravelStay>()
        .toList();

    return Scaffold(
      appBar: AppBar(title: Text(widget.category.name)),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(travelStaysProvider);
          ref.invalidate(travelTrendingProvider);
          ref.invalidate(travelTodaysOffersProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Search stays or destinations',
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
                data: (stays) => stays.isEmpty
                    ? const SizedBox.shrink()
                    : _StayRail(
                        title: 'Trending Now',
                        stays: stays,
                        onTap: _openStay,
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
              if (savedStays.isNotEmpty) ...[
                _StayRail(title: 'Saved for Later', stays: savedStays, onTap: _openStay),
                const SizedBox(height: 20),
              ],
              if (_recentlyViewed.isNotEmpty) ...[
                _StayRail(
                  title: 'Recently Viewed',
                  stays: _recentlyViewed,
                  onTap: _openStay,
                ),
                const SizedBox(height: 20),
              ],
              Text('Browse Stays', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              staysAsync.when(
                data: (stays) {
                  final amenities = <String>{};
                  for (final s in stays) {
                    amenities.addAll(s.amenities);
                  }
                  final filtered = _applySort(_selectedAmenity == null
                      ? stays
                      : stays
                          .where((s) => s.amenities.contains(_selectedAmenity))
                          .toList());
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: _AmenityChipRow(
                              amenities: amenities.toList()..sort(),
                              selected: _selectedAmenity,
                              onSelected: _onAmenitySelected,
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
                        const _EmptyState(message: 'No stays match this filter.')
                      else
                        ...filtered.map(
                          (s) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: _StayCard(
                              stay: s,
                              onTap: () => _openStay(s),
                              categoryId: widget.category.id,
                            ),
                          ),
                        ),
                    ],
                  );
                },
                loading: () => const _StayListSkeleton(),
                error: (error, _) => _ErrorState(
                  message: "Couldn't load stays. Pull down to retry.",
                  onRetry: () => ref.invalidate(travelStaysProvider),
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
    final resultsAsync = ref.watch(travelSearchProvider(query));
    return resultsAsync.when(
      data: (results) {
        if (results.isEmpty) {
          return _EmptyState(message: 'No results for "$query".');
        }
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: results.map((result) {
            if (result is TravelStay) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _StayCard(
                  stay: result,
                  categoryId: categoryId,
                  onTap: () async {
                    await RecentlyViewedTravelStay().recordView(result.id);
                    if (context.mounted) {
                      context.push('/travel/$categoryId/stay/${result.id}');
                    }
                  },
                ),
              );
            }
            final room = result as TravelRoom;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                tileColor: Theme.of(context).colorScheme.surfaceContainerHighest,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                title: Text(room.name),
                subtitle: Text('${formatPaise(room.pricePaise)} / ${room.unit}'),
                onTap: () {
                  context.push('/travel/$categoryId/stay/${room.stayId}');
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

class _StayRail extends StatelessWidget {
  const _StayRail({required this.title, required this.stays, required this.onTap});

  final String title;
  final List<TravelStay> stays;
  final ValueChanged<TravelStay> onTap;

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
            itemCount: stays.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final s = stays[index];
              return _StayRailCard(stay: s, onTap: () => onTap(s));
            },
          ),
        ),
      ],
    );
  }
}

class _StayRailCard extends StatelessWidget {
  const _StayRailCard({required this.stay, required this.onTap});

  final TravelStay stay;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = _gradientForSeed(stay.bannerColorSeed);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 170,
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
              stay.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 2),
            Text(
              stay.location,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.star_rounded, size: 14, color: Colors.white),
                const SizedBox(width: 2),
                Text(
                  '${stay.avgRating.toStringAsFixed(1)} · ${stay.priceTier}',
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

  final List<TravelRoom> items;

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

  final TravelRoom item;

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

class _AmenityChipRow extends StatelessWidget {
  const _AmenityChipRow({required this.amenities, required this.selected, required this.onSelected});

  final List<String> amenities;
  final String? selected;
  final ValueChanged<String?> onSelected;

  @override
  Widget build(BuildContext context) {
    if (amenities.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: amenities.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final amenity = amenities[index];
          return ChoiceChip(
            label: Text(amenity),
            selected: selected == amenity,
            onSelected: (_) => onSelected(amenity),
          );
        },
      ),
    );
  }
}

class _StayCard extends ConsumerWidget {
  const _StayCard({required this.stay, required this.onTap, this.categoryId = 'travel'});

  final TravelStay stay;
  final VoidCallback onTap;
  final String categoryId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).colorScheme;
    final gradient = _gradientForSeed(stay.bannerColorSeed);
    final appId = _appIdFor(stay.id);
    final saved = ref.watch(
      wishlistProvider.select((list) => list.any((e) => e.entityId == stay.id && e.appId == appId)),
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
              child: const Icon(Icons.hotel, color: Colors.white),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(stay.name, style: Theme.of(context).textTheme.bodyLarge),
                  const SizedBox(height: 2),
                  Text(
                    stay.location,
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
                        '${stay.avgRating.toStringAsFixed(1)} (${stay.reviewCount})',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        '${stay.distanceKm.toStringAsFixed(1)} km · ${stay.priceTier}',
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
                ref.read(wishlistProvider.notifier).toggle(stay.id, appId, categoryId);
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

class _StayListSkeleton extends StatefulWidget {
  const _StayListSkeleton();

  @override
  State<_StayListSkeleton> createState() => _StayListSkeletonState();
}

class _StayListSkeletonState extends State<_StayListSkeleton>
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
