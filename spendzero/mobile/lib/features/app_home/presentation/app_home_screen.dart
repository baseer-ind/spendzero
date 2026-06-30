import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/data/local/beauty_seed_data.dart';
import '../../../core/data/local/fictional_apps_seed.dart';
import '../../../core/data/local/food_seed_data.dart';
import '../../../core/data/local/grocery_seed_data.dart';
import '../../../core/data/local/persistent_cart_store.dart';
import '../../../core/data/local/shopping_seed_data.dart';
import '../../../core/data/local/travel_seed_data.dart';
import '../../../core/models/fictional_app.dart';

/// The "inside a fictional app" home screen. Applies the fictional app's
/// unique theme and shows vertical-specific content (restaurants, stores,
/// brands) wrapped in that brand identity.
class AppHomeScreen extends ConsumerWidget {
  const AppHomeScreen({
    super.key,
    required this.appId,
    required this.categoryId,
  });

  final String appId;
  final String categoryId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final app = findFictionalAppById(appId);
    if (app == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('App not found')),
        body: const Center(child: Text('Unknown app')),
      );
    }

    final brightness = Theme.of(context).brightness;

    return Theme(
      data: app.themeData(brightness),
      child: _AppHomeContent(app: app, categoryId: categoryId),
    );
  }
}

class _AppHomeContent extends ConsumerWidget {
  const _AppHomeContent({required this.app, required this.categoryId});

  final FictionalApp app;
  final String categoryId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartCount = ref
        .watch(cartProvider)
        .fold(0, (sum, e) => sum + e.quantity);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: app.primaryColor,
        foregroundColor: Colors.white,
        title: Row(
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(app.logoIcon, color: Colors.white, size: 16),
            ),
            const SizedBox(width: 8),
            Text(
              app.name,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),
        actions: [
          if (cartCount > 0)
            _CartBadge(count: cartCount, onTap: () => context.push('/cart')),
          const SizedBox(width: 8),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: _HeroBanner(app: app),
          ),
          SliverToBoxAdapter(
            child: _OfferStrip(app: app),
          ),
          ..._buildVerticalContent(context, ref),
        ],
      ),
      floatingActionButton: cartCount > 0
          ? FloatingActionButton.extended(
              backgroundColor: app.primaryColor,
              foregroundColor: Colors.white,
              onPressed: () {
                HapticFeedback.selectionClick();
                context.push('/cart');
              },
              icon: Stack(
                clipBehavior: Clip.none,
                children: [
                  const Icon(Icons.shopping_cart),
                  Positioned(
                    top: -6,
                    right: -6,
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                      child: Text(
                        '$cartCount',
                        style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                ],
              ),
              label: const Text('View Cart'),
            )
          : null,
    );
  }

  List<Widget> _buildVerticalContent(BuildContext context, WidgetRef ref) {
    switch (app.vertical) {
      case 'food':
        return _buildFoodContent(context, ref);
      case 'grocery':
        return _buildGroceryContent(context, ref);
      case 'shopping':
        return _buildShoppingContent(context, ref);
      case 'travel':
        return _buildTravelContent(context, ref);
      case 'beauty':
        return _buildBeautyContent(context, ref);
      case 'electronics':
        return _buildShoppingContent(context, ref);
      default:
        return _buildComingSoon(context);
    }
  }

  List<Widget> _buildFoodContent(BuildContext context, WidgetRef ref) {
    // Show restaurants from seed data, filtered by entityIds if available
    const all = allRestaurants;
    final restaurants = app.entityIds.isNotEmpty
        ? all.where((r) => app.entityIds.contains(r.id)).toList()
        : all;

    return [
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            'Restaurants near you',
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
        ),
      ),
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        sliver: SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final r = restaurants[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _RestaurantCard(
                  id: r.id,
                  name: r.name,
                  tagline: r.brandTagline,
                  cuisines: r.cuisines,
                  rating: r.avgRating,
                  deliveryMins: r.deliveryTimeMins,
                  distanceKm: r.distanceKm,
                  colorSeed: r.bannerColorSeed,
                  onTap: () {
                    HapticFeedback.selectionClick();
                    context.push(
                      '/food/$categoryId/restaurant/${r.id}',
                    );
                  },
                ),
              );
            },
            childCount: restaurants.length,
          ),
        ),
      ),
    ];
  }

  List<Widget> _buildGroceryContent(BuildContext context, WidgetRef ref) {
    const all = allGroceryStores;
    final stores = app.entityIds.isNotEmpty
        ? all.where((s) => app.entityIds.contains(s.id)).toList()
        : all;

    return [
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            'Stores near you',
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
        ),
      ),
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        sliver: SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final s = stores[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _RestaurantCard(
                  id: s.id,
                  name: s.name,
                  tagline: s.brandTagline,
                  cuisines: s.categories,
                  rating: s.avgRating,
                  deliveryMins: s.deliveryTimeMins,
                  distanceKm: s.distanceKm,
                  colorSeed: s.bannerColorSeed,
                  onTap: () {
                    HapticFeedback.selectionClick();
                    context.push(
                      '/grocery/$categoryId/store/${s.id}',
                    );
                  },
                ),
              );
            },
            childCount: stores.length,
          ),
        ),
      ),
    ];
  }

  List<Widget> _buildShoppingContent(BuildContext context, WidgetRef ref) {
    const all = allShoppingBrands;
    final brands = app.entityIds.isNotEmpty
        ? all.where((b) => app.entityIds.contains(b.id)).toList()
        : all;

    return [
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            'Brands & stores',
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
        ),
      ),
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        sliver: SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final b = brands[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _RestaurantCard(
                  id: b.id,
                  name: b.name,
                  tagline: b.brandTagline,
                  cuisines: b.categories,
                  rating: b.avgRating,
                  deliveryMins: b.deliveryTimeMins,
                  distanceKm: b.distanceKm,
                  colorSeed: b.bannerColorSeed,
                  onTap: () {
                    HapticFeedback.selectionClick();
                    context.push(
                      '/shopping/$categoryId/brand/${b.id}',
                    );
                  },
                ),
              );
            },
            childCount: brands.length,
          ),
        ),
      ),
    ];
  }

  List<Widget> _buildTravelContent(BuildContext context, WidgetRef ref) {
    const all = allTravelStays;
    final stays = app.entityIds.isNotEmpty
        ? all.where((s) => app.entityIds.contains(s.id)).toList()
        : all;

    return [
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            'Stays handpicked for you',
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
        ),
      ),
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        sliver: SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final s = stays[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _StayCard(
                  stay: s,
                  onTap: () {
                    HapticFeedback.selectionClick();
                    context.push(
                      '/travel/$categoryId/stay/${s.id}',
                    );
                  },
                ),
              );
            },
            childCount: stays.length,
          ),
        ),
      ),
    ];
  }

  List<Widget> _buildBeautyContent(BuildContext context, WidgetRef ref) {
    const all = allBeautyBrands;
    final brands = app.entityIds.isNotEmpty
        ? all.where((b) => app.entityIds.contains(b.id)).toList()
        : all;

    return [
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            'Brands handpicked for you',
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
        ),
      ),
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        sliver: SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final b = brands[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _RestaurantCard(
                  id: b.id,
                  name: b.name,
                  tagline: b.brandTagline,
                  cuisines: b.categories,
                  rating: b.avgRating,
                  deliveryMins: b.deliveryTimeMins,
                  distanceKm: b.distanceKm,
                  colorSeed: b.bannerColorSeed,
                  onTap: () {
                    HapticFeedback.selectionClick();
                    context.push(
                      '/beauty/$categoryId/brand/${b.id}',
                    );
                  },
                ),
              );
            },
            childCount: brands.length,
          ),
        ),
      ),
    ];
  }

  List<Widget> _buildComingSoon(BuildContext context) {
    return [
      SliverFillRemaining(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: app.logoBgGradient,
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Icon(app.logoIcon, color: Colors.white, size: 40),
              ),
              const SizedBox(height: 20),
              Text(
                '${app.name} is coming soon!',
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Text(
                  app.heroOffer,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    ];
  }
}

class _HeroBanner extends StatelessWidget {
  const _HeroBanner({required this.app});

  final FictionalApp app;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 160,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: app.logoBgGradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          // Decorative circles
          Positioned(
            right: -30,
            top: -30,
            child: Container(
              width: 150,
              height: 150,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.08),
              ),
            ),
          ),
          Positioned(
            left: -20,
            bottom: -40,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.06),
              ),
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.25),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    app.heroBadge,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  app.heroOffer,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  app.tagline,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.85),
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _OfferStrip extends StatelessWidget {
  const _OfferStrip({required this.app});

  final FictionalApp app;

  static const _offers = [
    ('Free delivery', Icons.delivery_dining),
    ('No surge pricing', Icons.block),
    ('Live tracking', Icons.gps_fixed),
    ('Safe & hygienic', Icons.verified_outlined),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      color: Theme.of(context).colorScheme.surfaceContainerLowest,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _offers.length,
        separatorBuilder: (_, __) => const SizedBox(width: 16),
        itemBuilder: (context, index) {
          final (label, icon) = _offers[index];
          return Row(
            children: [
              Icon(icon, size: 16, color: app.primaryColor),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: app.primaryColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _RestaurantCard extends StatefulWidget {
  const _RestaurantCard({
    required this.id,
    required this.name,
    required this.tagline,
    required this.cuisines,
    required this.rating,
    required this.deliveryMins,
    required this.distanceKm,
    required this.colorSeed,
    required this.onTap,
  });

  final String id;
  final String name;
  final String tagline;
  final List<String> cuisines;
  final double rating;
  final int deliveryMins;
  final double distanceKm;
  final String colorSeed;
  final VoidCallback onTap;

  @override
  State<_RestaurantCard> createState() => _RestaurantCardState();
}

class _RestaurantCardState extends State<_RestaurantCard> {
  bool _pressed = false;

  List<Color> get _gradient {
    final hue =
        (widget.colorSeed.codeUnits.fold<int>(0, (a, b) => a + b) % 360)
            .toDouble();
    final start = HSLColor.fromAHSL(1, hue, 0.55, 0.55).toColor();
    final end =
        HSLColor.fromAHSL(1, (hue + 40) % 360, 0.6, 0.4).toColor();
    return [start, end];
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final gradient = _gradient;

    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 120),
        child: Card(
          elevation: 0,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          clipBehavior: Clip.hardEdge,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Banner
              Container(
                height: 100,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: gradient,
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Center(
                  child: Text(
                    widget.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 22,
                    ),
                  ),
                ),
              ),
              // Details
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.name,
                                style: Theme.of(context)
                                    .textTheme
                                    .titleSmall
                                    ?.copyWith(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                widget.cuisines.take(3).join(' • '),
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                        color: colors.onSurfaceVariant),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: colors.primary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.star,
                                  size: 12, color: Colors.white),
                              const SizedBox(width: 3),
                              Text(
                                widget.rating.toStringAsFixed(1),
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.access_time_outlined,
                            size: 14, color: colors.onSurfaceVariant),
                        const SizedBox(width: 4),
                        Text(
                          '${widget.deliveryMins} min',
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: colors.onSurfaceVariant),
                        ),
                        const SizedBox(width: 12),
                        Icon(Icons.near_me_outlined,
                            size: 14, color: colors.onSurfaceVariant),
                        const SizedBox(width: 4),
                        Text(
                          '${widget.distanceKm.toStringAsFixed(1)} km',
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: colors.onSurfaceVariant),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StayCard extends StatefulWidget {
  const _StayCard({required this.stay, required this.onTap});

  final TravelStay stay;
  final VoidCallback onTap;

  @override
  State<_StayCard> createState() => _StayCardState();
}

class _StayCardState extends State<_StayCard> {
  bool _pressed = false;

  List<Color> get _gradient {
    final seed = widget.stay.bannerColorSeed;
    final hue = (seed.codeUnits.fold<int>(0, (a, b) => a + b) % 360).toDouble();
    final start = HSLColor.fromAHSL(1, hue, 0.55, 0.55).toColor();
    final end = HSLColor.fromAHSL(1, (hue + 40) % 360, 0.6, 0.4).toColor();
    return [start, end];
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final stay = widget.stay;
    final gradient = _gradient;

    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 120),
        child: Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          clipBehavior: Clip.hardEdge,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 100,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: gradient,
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Center(
                  child: Text(
                    stay.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 22,
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                stay.name,
                                style: Theme.of(context)
                                    .textTheme
                                    .titleSmall
                                    ?.copyWith(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                stay.location,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(color: colors.onSurfaceVariant),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: colors.primary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.star, size: 12, color: Colors.white),
                              const SizedBox(width: 3),
                              Text(
                                stay.avgRating.toStringAsFixed(1),
                                style: const TextStyle(
                                    color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.near_me_outlined, size: 14, color: colors.onSurfaceVariant),
                        const SizedBox(width: 4),
                        Text(
                          '${stay.distanceKm.toStringAsFixed(1)} km',
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: colors.onSurfaceVariant),
                        ),
                        const SizedBox(width: 12),
                        Icon(Icons.sell_outlined, size: 14, color: colors.onSurfaceVariant),
                        const SizedBox(width: 4),
                        Text(
                          stay.priceTier,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: colors.onSurfaceVariant),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CartBadge extends StatefulWidget {
  const _CartBadge({required this.count, required this.onTap});

  final int count;
  final VoidCallback onTap;

  @override
  State<_CartBadge> createState() => _CartBadgeState();
}

class _CartBadgeState extends State<_CartBadge> {
  int _previousCount = 0;

  @override
  void initState() {
    super.initState();
    _previousCount = widget.count;
  }

  @override
  void didUpdateWidget(_CartBadge old) {
    super.didUpdateWidget(old);
    _previousCount = old.count;
  }

  @override
  Widget build(BuildContext context) {
    final bumped = widget.count != _previousCount;
    return GestureDetector(
      onTap: widget.onTap,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          IconButton(
            icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white),
            onPressed: widget.onTap,
          ),
          Positioned(
            top: 4,
            right: 4,
            child: TweenAnimationBuilder<double>(
              key: ValueKey(widget.count),
              tween: Tween(begin: bumped ? 1.5 : 1.0, end: 1.0),
              duration: const Duration(milliseconds: 320),
              curve: Curves.elasticOut,
              builder: (context, scale, _) => Transform.scale(
                scale: scale,
                child: Container(
                  padding: const EdgeInsets.all(3),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                  child: Text(
                    '${widget.count}',
                    style: const TextStyle(
                        color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
