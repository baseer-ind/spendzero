import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:go_router/go_router.dart';

import '../../../core/data/local/fictional_apps_seed.dart';
import '../../../core/data/local/food_seed_data.dart';
import '../../../core/data/local/persistent_cart_store.dart';
import '../../../core/data/local/wishlist_store.dart';
import '../../../core/models/cart_item.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';
import 'menu_item_detail_sheet.dart';

List<Color> _gradientForSeed(String seed) {
  final hue = (seed.codeUnits.fold<int>(0, (a, b) => a + b) % 360).toDouble();
  final start = HSLColor.fromAHSL(1, hue, 0.55, 0.55).toColor();
  final end = HSLColor.fromAHSL(1, (hue + 40) % 360, 0.6, 0.4).toColor();
  return [start, end];
}

Color _dietDotColor(DietaryTag tag) {
  switch (tag) {
    case DietaryTag.veg:
    case DietaryTag.vegan:
      return const Color(0xFF2E7D32);
    case DietaryTag.nonVeg:
    case DietaryTag.egg:
      return const Color(0xFF8D2424);
  }
}

class RestaurantScreen extends ConsumerStatefulWidget {
  const RestaurantScreen({super.key, required this.categoryId, required this.restaurantId});

  final String categoryId;
  final String restaurantId;

  @override
  ConsumerState<RestaurantScreen> createState() => _RestaurantScreenState();
}

class _RestaurantScreenState extends ConsumerState<RestaurantScreen> {
  final Map<String, int> _quantities = {};
  bool _showAllReviews = false;
  bool _restoredFromCart = false;

  String get _appId => findAppIdForEntity(widget.restaurantId) ?? widget.restaurantId;

  void _restoreFromCartOnce() {
    if (_restoredFromCart) return;
    _restoredFromCart = true;
    final items = ref.read(cartProvider.notifier).itemsForApp(_appId);
    if (items.isEmpty) return;
    _quantities.addAll({for (final e in items) e.listingId: e.quantity});
  }

  void _setQuantity(MenuItem item, int quantity) {
    setState(() {
      if (quantity <= 0) {
        _quantities.remove(item.id);
      } else {
        _quantities[item.id] = quantity;
      }
    });
    final notifier = ref.read(cartProvider.notifier);
    final alreadyInCart = ref
        .read(cartProvider)
        .any((e) => e.listingId == item.id && e.appId == _appId);
    if (quantity <= 0) {
      if (alreadyInCart) notifier.removeItem(item.id, _appId);
    } else if (alreadyInCart) {
      notifier.setQuantity(item.id, _appId, quantity);
    } else {
      notifier.addItem(CartItem(
        listingId: item.id,
        name: item.name,
        unitPricePaise: item.pricePaise,
        quantity: quantity,
        appId: _appId,
        categoryId: widget.categoryId,
        imageColorSeed: item.id,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final restaurant = findRestaurantById(widget.restaurantId);
    if (restaurant == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Restaurant')),
        body: const Center(child: Text('This restaurant could not be found.')),
      );
    }

    final menuAsync = ref.watch(menuItemsForRestaurantProvider(widget.restaurantId));
    final reviewsAsync = ref.watch(reviewsForProvider(widget.restaurantId));
    _restoreFromCartOnce();

    return Scaffold(
      appBar: AppBar(
        title: Text(restaurant.name),
        actions: [
          Consumer(
            builder: (context, ref, _) {
              final appId = _appId;
              final saved = ref.watch(
                wishlistProvider.select(
                  (list) => list.any((e) => e.entityId == restaurant.id && e.appId == appId),
                ),
              );
              return IconButton(
                icon: Icon(saved ? Icons.favorite : Icons.favorite_border),
                color: saved ? Theme.of(context).colorScheme.error : null,
                onPressed: () {
                  HapticFeedback.lightImpact();
                  ref.read(wishlistProvider.notifier).toggle(restaurant.id, appId, widget.categoryId);
                },
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _Banner(restaurant: restaurant),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: restaurant.cuisines
                .map((c) => Chip(label: Text(c)))
                .toList(),
          ),
          const SizedBox(height: 16),
          menuAsync.when(
            data: (items) => _MenuSections(
              items: items,
              quantities: _quantities,
              onAdd: (item) => _openDetailSheet(item),
              onQuantityChanged: _setQuantity,
            ),
            loading: () => const Padding(
              padding: EdgeInsets.symmetric(vertical: 32),
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (_, __) => const Padding(
              padding: EdgeInsets.symmetric(vertical: 32),
              child: Center(child: Text("Couldn't load the menu. Please try again.")),
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
      bottomNavigationBar: _quantities.isEmpty ? null : _buildCartBar(context, menuAsync.value ?? const []),
    );
  }

  void _openDetailSheet(MenuItem item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => MenuItemDetailSheet(
        item: item,
        initialQuantity: _quantities[item.id] ?? 0,
        onQuantityChanged: (qty) => _setQuantity(item, qty),
      ),
    );
  }

  Widget _buildCartBar(BuildContext context, List<MenuItem> items) {
    final itemsById = {for (final m in items) m.id: m};
    final total = _quantities.entries.fold<int>(0, (sum, e) {
      final item = itemsById[e.key];
      return item == null ? sum : sum + item.pricePaise * e.value;
    });
    final count = _quantities.values.fold<int>(0, (a, b) => a + b);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: FilledButton(
          onPressed: () {
            HapticFeedback.mediumImpact();
            context.push('/cart');
          },
          child: Text('View cart · $count items · ${formatPaise(total)}'),
        ),
      ),
    );
  }
}

class _Banner extends StatelessWidget {
  const _Banner({required this.restaurant});

  final Restaurant restaurant;

  @override
  Widget build(BuildContext context) {
    final gradient = _gradientForSeed(restaurant.bannerColorSeed);
    return Container(
      height: 140,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Text(
            restaurant.name,
            style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(restaurant.brandTagline, style: const TextStyle(color: Colors.white70)),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.star_rounded, size: 16, color: Colors.white),
              const SizedBox(width: 4),
              Text(
                '${restaurant.avgRating.toStringAsFixed(1)} (${restaurant.reviewCount})',
                style: const TextStyle(color: Colors.white),
              ),
              const SizedBox(width: 12),
              Text(
                '${restaurant.deliveryTimeMins} min · ${restaurant.distanceKm.toStringAsFixed(1)} km',
                style: const TextStyle(color: Colors.white),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MenuSections extends StatelessWidget {
  const _MenuSections({
    required this.items,
    required this.quantities,
    required this.onAdd,
    required this.onQuantityChanged,
  });

  final List<MenuItem> items;
  final Map<String, int> quantities;
  final ValueChanged<MenuItem> onAdd;
  final void Function(MenuItem, int) onQuantityChanged;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: Text('No menu items available yet.')),
      );
    }

    final bestSellers = items.where((m) => m.isBestSeller).toList();
    final desserts = items.where((m) => m.tags.contains('dessert')).toList();
    final beverages = items
        .where((m) => m.tags.contains('beverage') || m.tags.contains('coffee'))
        .toList();
    final claimedIds = {...bestSellers, ...desserts, ...beverages}.map((m) => m.id).toSet();
    final mains = items.where((m) => !claimedIds.contains(m.id)).toList();

    final frequentlyOrdered = items.length > 3 ? items.sublist(0, 4) : items;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (bestSellers.isNotEmpty)
          _MenuSection(title: 'Best Sellers', items: bestSellers, quantities: quantities, onAdd: onAdd, onQuantityChanged: onQuantityChanged),
        if (mains.isNotEmpty)
          _MenuSection(title: 'Mains', items: mains, quantities: quantities, onAdd: onAdd, onQuantityChanged: onQuantityChanged),
        if (beverages.isNotEmpty)
          _MenuSection(title: 'Beverages', items: beverages, quantities: quantities, onAdd: onAdd, onQuantityChanged: onQuantityChanged),
        if (desserts.isNotEmpty)
          _MenuSection(title: 'Desserts', items: desserts, quantities: quantities, onAdd: onAdd, onQuantityChanged: onQuantityChanged),
        const SizedBox(height: 8),
        Text('Frequently Ordered Together', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 10),
        SizedBox(
          height: 70,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: frequentlyOrdered.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final item = frequentlyOrdered[index];
              return Chip(label: Text(item.name));
            },
          ),
        ),
      ],
    );
  }
}

class _MenuSection extends StatelessWidget {
  const _MenuSection({
    required this.title,
    required this.items,
    required this.quantities,
    required this.onAdd,
    required this.onQuantityChanged,
  });

  final String title;
  final List<MenuItem> items;
  final Map<String, int> quantities;
  final ValueChanged<MenuItem> onAdd;
  final void Function(MenuItem, int) onQuantityChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...items.map((item) => _MenuItemRow(
                item: item,
                quantity: quantities[item.id] ?? 0,
                onAdd: () => onAdd(item),
                onQuantityChanged: (qty) => onQuantityChanged(item, qty),
              )),
        ],
      ),
    );
  }
}

class _MenuItemRow extends StatelessWidget {
  const _MenuItemRow({
    required this.item,
    required this.quantity,
    required this.onAdd,
    required this.onQuantityChanged,
  });

  final MenuItem item;
  final int quantity;
  final VoidCallback onAdd;
  final ValueChanged<int> onQuantityChanged;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final discount = item.discountPercent;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 5, right: 8),
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              border: Border.all(color: _dietDotColor(item.dietaryTag)),
              shape: BoxShape.rectangle,
            ),
            child: Center(
              child: Container(
                width: 5,
                height: 5,
                decoration: BoxDecoration(color: _dietDotColor(item.dietaryTag), shape: BoxShape.circle),
              ),
            ),
          ),
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
          _QuantityStepper(quantity: quantity, onChanged: onQuantityChanged),
        ],
      ),
    );
  }
}

class _QuantityStepper extends StatelessWidget {
  const _QuantityStepper({required this.quantity, required this.onChanged});

  final int quantity;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    if (quantity == 0) {
      return SizedBox(
        height: 36,
        child: OutlinedButton(
          onPressed: () {
            HapticFeedback.selectionClick();
            onChanged(1);
          },
          style: OutlinedButton.styleFrom(minimumSize: const Size(44, 44)),
          child: const Text('Add'),
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
            onTap: () => onChanged(quantity - 1),
            child: SizedBox(
              width: 32,
              height: 36,
              child: Icon(Icons.remove, size: 16, color: Theme.of(context).colorScheme.onPrimary),
            ),
          ),
          SizedBox(
            width: 24,
            child: Text(
              '$quantity',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Theme.of(context).colorScheme.onPrimary),
            ),
          ),
          InkWell(
            onTap: () => onChanged(quantity + 1),
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
