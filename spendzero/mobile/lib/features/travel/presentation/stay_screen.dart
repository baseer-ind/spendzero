import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/data/local/fictional_apps_seed.dart';
import '../../../core/data/local/travel_seed_data.dart';
import '../../../core/data/local/persistent_cart_store.dart';
import '../../../core/data/local/wishlist_store.dart';
import '../../../core/models/cart_item.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';
import 'room_detail_sheet.dart';

List<Color> _gradientForSeed(String seed) {
  final hue = (seed.codeUnits.fold<int>(0, (a, b) => a + b) % 360).toDouble();
  final start = HSLColor.fromAHSL(1, hue, 0.55, 0.55).toColor();
  final end = HSLColor.fromAHSL(1, (hue + 40) % 360, 0.6, 0.4).toColor();
  return [start, end];
}

class StayScreen extends ConsumerStatefulWidget {
  const StayScreen({super.key, required this.categoryId, required this.stayId});

  final String categoryId;
  final String stayId;

  @override
  ConsumerState<StayScreen> createState() => _StayScreenState();
}

class _StayScreenState extends ConsumerState<StayScreen> {
  final Map<String, int> _nights = {};
  bool _showAllReviews = false;
  bool _restoredFromCart = false;

  String get _appId => findAppIdForEntity(widget.stayId) ?? widget.stayId;

  void _restoreFromCartOnce() {
    if (_restoredFromCart) return;
    _restoredFromCart = true;
    final items = ref.read(cartProvider.notifier).itemsForApp(_appId);
    if (items.isEmpty) return;
    _nights.addAll({for (final e in items) e.listingId: e.quantity});
  }

  void _setNights(TravelRoom room, int nights) {
    setState(() {
      if (nights <= 0) {
        _nights.remove(room.id);
      } else {
        _nights[room.id] = nights;
      }
    });
    final notifier = ref.read(cartProvider.notifier);
    final alreadyInCart = ref
        .read(cartProvider)
        .any((e) => e.listingId == room.id && e.appId == _appId);
    if (nights <= 0) {
      if (alreadyInCart) notifier.removeItem(room.id, _appId);
    } else if (alreadyInCart) {
      notifier.setQuantity(room.id, _appId, nights);
    } else {
      notifier.addItem(CartItem(
        listingId: room.id,
        name: room.name,
        unitPricePaise: room.pricePaise,
        quantity: nights,
        appId: _appId,
        categoryId: widget.categoryId,
        imageColorSeed: room.id,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final stay = findTravelStayById(widget.stayId);
    if (stay == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Stay')),
        body: const Center(child: Text('This stay could not be found.')),
      );
    }

    final roomsAsync = ref.watch(roomsForStayProvider(widget.stayId));
    final reviewsAsync = ref.watch(travelReviewsForProvider(widget.stayId));
    _restoreFromCartOnce();

    return Scaffold(
      appBar: AppBar(
        title: Text(stay.name),
        actions: [
          Consumer(
            builder: (context, ref, _) {
              final appId = _appId;
              final saved = ref.watch(
                wishlistProvider.select(
                  (list) => list.any((e) => e.entityId == stay.id && e.appId == appId),
                ),
              );
              return IconButton(
                icon: Icon(saved ? Icons.favorite : Icons.favorite_border),
                color: saved ? Theme.of(context).colorScheme.error : null,
                onPressed: () {
                  HapticFeedback.lightImpact();
                  ref.read(wishlistProvider.notifier).toggle(stay.id, appId, widget.categoryId);
                },
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _Banner(stay: stay),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: stay.amenities.map((c) => Chip(label: Text(c))).toList(),
          ),
          const SizedBox(height: 16),
          roomsAsync.when(
            data: (items) => _RoomSections(
              items: items,
              nights: _nights,
              onAdd: (item) => _openDetailSheet(item),
              onNightsChanged: _setNights,
            ),
            loading: () => const Padding(
              padding: EdgeInsets.symmetric(vertical: 32),
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (_, __) => const Padding(
              padding: EdgeInsets.symmetric(vertical: 32),
              child: Center(child: Text("Couldn't load the room list. Please try again.")),
            ),
          ),
          const SizedBox(height: 24),
          reviewsAsync.when(
            data: (reviews) => _ReviewsSection(
              reviews: reviews,
              showAll: _showAllReviews,
              onSeeAll: () => setState(() => _showAllReviews = true),
            ),
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
      ),
      bottomNavigationBar:
          _nights.isEmpty ? null : _buildCartBar(context, roomsAsync.value ?? const []),
    );
  }

  void _openDetailSheet(TravelRoom item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => RoomDetailSheet(
        room: item,
        initialNights: _nights[item.id] ?? 0,
        onNightsChanged: (nights) => _setNights(item, nights),
      ),
    );
  }

  Widget _buildCartBar(BuildContext context, List<TravelRoom> items) {
    final itemsById = {for (final r in items) r.id: r};
    final total = _nights.entries.fold<int>(0, (sum, e) {
      final item = itemsById[e.key];
      return item == null ? sum : sum + item.pricePaise * e.value;
    });
    final count = _nights.values.fold<int>(0, (a, b) => a + b);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: FilledButton(
          onPressed: () {
            HapticFeedback.mediumImpact();
            context.push('/cart');
          },
          child: Text('View cart · $count night${count > 1 ? 's' : ''} · ${formatPaise(total)}'),
        ),
      ),
    );
  }
}

class _Banner extends StatelessWidget {
  const _Banner({required this.stay});

  final TravelStay stay;

  @override
  Widget build(BuildContext context) {
    final gradient = _gradientForSeed(stay.bannerColorSeed);
    return Container(
      constraints: const BoxConstraints(minHeight: 150),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Text(
            stay.name,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            stay.brandTagline,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white70),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.location_on, size: 16, color: Colors.white),
              const SizedBox(width: 4),
              Expanded(child: Text(stay.location, style: const TextStyle(color: Colors.white))),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.star_rounded, size: 16, color: Colors.white),
              const SizedBox(width: 4),
              Text(
                '${stay.avgRating.toStringAsFixed(1)} (${stay.reviewCount})',
                style: const TextStyle(color: Colors.white),
              ),
              const SizedBox(width: 12),
              Text(
                '${stay.distanceKm.toStringAsFixed(1)} km away',
                style: const TextStyle(color: Colors.white),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RoomSections extends StatelessWidget {
  const _RoomSections({
    required this.items,
    required this.nights,
    required this.onAdd,
    required this.onNightsChanged,
  });

  final List<TravelRoom> items;
  final Map<String, int> nights;
  final ValueChanged<TravelRoom> onAdd;
  final void Function(TravelRoom, int) onNightsChanged;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: Text('No rooms available yet.')),
      );
    }

    final bestSellers = items.where((r) => r.isBestSeller).toList();
    final newArrivals = items.where((r) => r.isNewArrival).toList();
    final claimedIds = {...bestSellers, ...newArrivals}.map((r) => r.id).toSet();

    final byCategory = <String, List<TravelRoom>>{};
    for (final r in items.where((r) => !claimedIds.contains(r.id))) {
      byCategory.putIfAbsent(r.category, () => []).add(r);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (bestSellers.isNotEmpty)
          _RoomSection(title: 'Most Booked', items: bestSellers, nights: nights, onAdd: onAdd, onNightsChanged: onNightsChanged),
        if (newArrivals.isNotEmpty)
          _RoomSection(title: 'New Room Types', items: newArrivals, nights: nights, onAdd: onAdd, onNightsChanged: onNightsChanged),
        for (final entry in byCategory.entries)
          _RoomSection(title: entry.key, items: entry.value, nights: nights, onAdd: onAdd, onNightsChanged: onNightsChanged),
      ],
    );
  }
}

class _RoomSection extends StatelessWidget {
  const _RoomSection({
    required this.title,
    required this.items,
    required this.nights,
    required this.onAdd,
    required this.onNightsChanged,
  });

  final String title;
  final List<TravelRoom> items;
  final Map<String, int> nights;
  final ValueChanged<TravelRoom> onAdd;
  final void Function(TravelRoom, int) onNightsChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...items.map((item) => _RoomRow(
                item: item,
                nights: nights[item.id] ?? 0,
                onAdd: () => onAdd(item),
                onNightsChanged: (n) => onNightsChanged(item, n),
              )),
        ],
      ),
    );
  }
}

class _RoomRow extends StatelessWidget {
  const _RoomRow({
    required this.item,
    required this.nights,
    required this.onAdd,
    required this.onNightsChanged,
  });

  final TravelRoom item;
  final int nights;
  final VoidCallback onAdd;
  final ValueChanged<int> onNightsChanged;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final discount = item.discountPercent;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: GestureDetector(
              onTap: onAdd,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.name, style: Theme.of(context).textTheme.bodyLarge),
                  const SizedBox(height: 2),
                  Text(
                    item.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(formatPaise(item.pricePaise), style: Theme.of(context).textTheme.titleSmall),
                      Text(' / ${item.unit}', style: Theme.of(context).textTheme.bodySmall),
                      if (item.mrpPaise != null && discount != null) ...[
                        const SizedBox(width: 6),
                        Text(
                          formatPaise(item.mrpPaise!),
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                decoration: TextDecoration.lineThrough,
                                color: colors.outline,
                              ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),
          _NightsStepper(nights: nights, onChanged: onNightsChanged),
        ],
      ),
    );
  }
}

class _NightsStepper extends StatelessWidget {
  const _NightsStepper({required this.nights, required this.onChanged});

  final int nights;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    if (nights == 0) {
      return SizedBox(
        height: 36,
        child: OutlinedButton(
          onPressed: () {
            HapticFeedback.selectionClick();
            onChanged(1);
          },
          style: OutlinedButton.styleFrom(minimumSize: const Size(44, 44)),
          child: const Text('Book'),
        ),
      );
    }
    return Container(
      height: 36,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          InkWell(
            onTap: () => onChanged(nights - 1),
            child: SizedBox(
              width: 32,
              height: 36,
              child: Icon(Icons.remove, size: 16, color: Theme.of(context).colorScheme.onPrimary),
            ),
          ),
          SizedBox(
            width: 24,
            child: Text(
              '$nights',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Theme.of(context).colorScheme.onPrimary),
            ),
          ),
          InkWell(
            onTap: () => onChanged(nights + 1),
            child: SizedBox(
              width: 32,
              height: 36,
              child: Icon(Icons.add, size: 16, color: Theme.of(context).colorScheme.onPrimary),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReviewsSection extends StatelessWidget {
  const _ReviewsSection({required this.reviews, required this.showAll, required this.onSeeAll});

  final List<Review> reviews;
  final bool showAll;
  final VoidCallback onSeeAll;

  @override
  Widget build(BuildContext context) {
    if (reviews.isEmpty) return const SizedBox.shrink();
    final visible = showAll ? reviews : reviews.take(3).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Reviews', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 10),
        ...visible.map((r) => _ReviewTile(review: r)),
        if (!showAll && reviews.length > 3)
          TextButton(onPressed: onSeeAll, child: Text('See all ${reviews.length} reviews')),
      ],
    );
  }
}

class _ReviewTile extends StatelessWidget {
  const _ReviewTile({required this.review});

  final Review review;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(radius: 14, child: Text(review.reviewerInitials, style: const TextStyle(fontSize: 11))),
              const SizedBox(width: 8),
              Expanded(child: Text(review.reviewerName, style: Theme.of(context).textTheme.bodyMedium)),
              Icon(Icons.star_rounded, size: 16, color: colors.secondary),
              Text(review.rating.toStringAsFixed(1)),
            ],
          ),
          const SizedBox(height: 6),
          Text(review.text, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 6),
          Text(
            '${review.daysAgo}d ago · ${review.helpfulCount} found this helpful'
            '${review.verifiedOrder ? ' · Verified order' : ''}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: colors.outline),
          ),
        ],
      ),
    );
  }
}
