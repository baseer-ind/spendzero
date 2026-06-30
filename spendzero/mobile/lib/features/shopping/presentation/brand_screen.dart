import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/data/local/fictional_apps_seed.dart';
import '../../../core/data/local/persistent_cart_store.dart';
import '../../../core/data/local/shopping_seed_data.dart';
import '../../../core/data/local/wishlist_store.dart';
import '../../../core/models/cart_item.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';
import 'product_detail_sheet.dart';

List<Color> _gradientForSeed(String seed) {
  final hue = (seed.codeUnits.fold<int>(0, (a, b) => a + b) % 360).toDouble();
  final start = HSLColor.fromAHSL(1, hue, 0.55, 0.55).toColor();
  final end = HSLColor.fromAHSL(1, (hue + 40) % 360, 0.6, 0.4).toColor();
  return [start, end];
}

class BrandScreen extends ConsumerStatefulWidget {
  const BrandScreen({super.key, required this.categoryId, required this.brandId});

  final String categoryId;
  final String brandId;

  @override
  ConsumerState<BrandScreen> createState() => _BrandScreenState();
}

class _BrandScreenState extends ConsumerState<BrandScreen> {
  final Map<String, int> _quantities = {};
  bool _showAllReviews = false;
  bool _restoredFromCart = false;

  String get _appId => findAppIdForEntity(widget.brandId) ?? widget.brandId;

  void _restoreFromCartOnce() {
    if (_restoredFromCart) return;
    _restoredFromCart = true;
    final items = ref.read(cartProvider.notifier).itemsForApp(_appId);
    if (items.isEmpty) return;
    _quantities.addAll({for (final e in items) e.listingId: e.quantity});
  }

  void _setQuantity(ShoppingProduct item, int quantity) {
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
    final brand = findShoppingBrandById(widget.brandId);
    if (brand == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Brand')),
        body: const Center(child: Text('This brand could not be found.')),
      );
    }

    final productsAsync = ref.watch(productsForBrandProvider(widget.brandId));
    final reviewsAsync = ref.watch(shoppingReviewsForProvider(widget.brandId));
    _restoreFromCartOnce();

    return Scaffold(
      appBar: AppBar(
        title: Text(brand.name),
        actions: [
          Consumer(
            builder: (context, ref, _) {
              final appId = _appId;
              final saved = ref.watch(
                wishlistProvider.select(
                  (list) => list.any((e) => e.entityId == brand.id && e.appId == appId),
                ),
              );
              return IconButton(
                icon: Icon(saved ? Icons.favorite : Icons.favorite_border),
                color: saved ? Theme.of(context).colorScheme.error : null,
                onPressed: () {
                  HapticFeedback.lightImpact();
                  ref.read(wishlistProvider.notifier).toggle(brand.id, appId, widget.categoryId);
                },
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _Banner(brand: brand),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: brand.categories.map((c) => Chip(label: Text(c))).toList(),
          ),
          const SizedBox(height: 16),
          productsAsync.when(
            data: (items) => _ProductSections(
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
              child: Center(child: Text("Couldn't load the catalogue. Please try again.")),
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
          _quantities.isEmpty ? null : _buildCartBar(context, productsAsync.value ?? const []),
    );
  }

  void _openDetailSheet(ShoppingProduct item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => ProductDetailSheet(
        product: item,
        initialQuantity: _quantities[item.id] ?? 0,
        onQuantityChanged: (qty) => _setQuantity(item, qty),
      ),
    );
  }

  Widget _buildCartBar(BuildContext context, List<ShoppingProduct> items) {
    final itemsById = {for (final p in items) p.id: p};
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
  const _Banner({required this.brand});

  final ShoppingBrand brand;

  @override
  Widget build(BuildContext context) {
    final gradient = _gradientForSeed(brand.bannerColorSeed);
    return Container(
      constraints: const BoxConstraints(minHeight: 140),
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
            brand.name,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            brand.brandTagline,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white70),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.star_rounded, size: 16, color: Colors.white),
              const SizedBox(width: 4),
              Text(
                '${brand.avgRating.toStringAsFixed(1)} (${brand.reviewCount})',
                style: const TextStyle(color: Colors.white),
              ),
              const SizedBox(width: 12),
              Text(
                '${brand.deliveryTimeMins} min · ${brand.distanceKm.toStringAsFixed(1)} km',
                style: const TextStyle(color: Colors.white),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProductSections extends StatelessWidget {
  const _ProductSections({
    required this.items,
    required this.quantities,
    required this.onAdd,
    required this.onQuantityChanged,
  });

  final List<ShoppingProduct> items;
  final Map<String, int> quantities;
  final ValueChanged<ShoppingProduct> onAdd;
  final void Function(ShoppingProduct, int) onQuantityChanged;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: Text('No products available yet.')),
      );
    }

    final bestSellers = items.where((p) => p.isBestSeller).toList();
    final newArrivals = items.where((p) => p.isNewArrival).toList();
    final claimedIds = {...bestSellers, ...newArrivals}.map((p) => p.id).toSet();

    final byCategory = <String, List<ShoppingProduct>>{};
    for (final p in items.where((p) => !claimedIds.contains(p.id))) {
      byCategory.putIfAbsent(p.category, () => []).add(p);
    }

    final frequentlyBought = items.length > 3 ? items.sublist(0, 4) : items;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (bestSellers.isNotEmpty)
          _ProductSection(title: 'Best Sellers', items: bestSellers, quantities: quantities, onAdd: onAdd, onQuantityChanged: onQuantityChanged),
        if (newArrivals.isNotEmpty)
          _ProductSection(title: 'New Arrivals', items: newArrivals, quantities: quantities, onAdd: onAdd, onQuantityChanged: onQuantityChanged),
        for (final entry in byCategory.entries)
          _ProductSection(title: entry.key, items: entry.value, quantities: quantities, onAdd: onAdd, onQuantityChanged: onQuantityChanged),
        const SizedBox(height: 8),
        Text('Frequently Bought Together', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 10),
        SizedBox(
          height: 70,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: frequentlyBought.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final item = frequentlyBought[index];
              return Chip(label: Text(item.name));
            },
          ),
        ),
      ],
    );
  }
}

class _ProductSection extends StatelessWidget {
  const _ProductSection({
    required this.title,
    required this.items,
    required this.quantities,
    required this.onAdd,
    required this.onQuantityChanged,
  });

  final String title;
  final List<ShoppingProduct> items;
  final Map<String, int> quantities;
  final ValueChanged<ShoppingProduct> onAdd;
  final void Function(ShoppingProduct, int) onQuantityChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...items.map((item) => _ProductRow(
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

class _ProductRow extends StatelessWidget {
  const _ProductRow({
    required this.item,
    required this.quantity,
    required this.onAdd,
    required this.onQuantityChanged,
  });

  final ShoppingProduct item;
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
          Expanded(
            child: GestureDetector(
              onTap: onAdd,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.name, style: Theme.of(context).textTheme.bodyLarge),
                  const SizedBox(height: 2),
                  Text(
                    '${item.description} · ${item.variant}',
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
