import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/data/local/fictional_apps_seed.dart';
import '../../../core/data/local/movies_seed_data.dart';
import '../../../core/data/local/persistent_cart_store.dart';
import '../../../core/data/local/wishlist_store.dart';
import '../../../core/models/cart_item.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';
import 'showtime_detail_sheet.dart';

List<Color> _gradientForSeed(String seed) {
  final hue = (seed.codeUnits.fold<int>(0, (a, b) => a + b) % 360).toDouble();
  final start = HSLColor.fromAHSL(1, hue, 0.55, 0.55).toColor();
  final end = HSLColor.fromAHSL(1, (hue + 40) % 360, 0.6, 0.4).toColor();
  return [start, end];
}

/// Booking a movie's tickets reuses the existing cart pipeline the same
/// way `StayScreen` reuses it for nights booked — ticket count is the
/// cart `quantity`.
class CinemaScreen extends ConsumerStatefulWidget {
  const CinemaScreen({super.key, required this.categoryId, required this.cinemaId});

  final String categoryId;
  final String cinemaId;

  @override
  ConsumerState<CinemaScreen> createState() => _CinemaScreenState();
}

class _CinemaScreenState extends ConsumerState<CinemaScreen> {
  final Map<String, int> _tickets = {};
  bool _showAllReviews = false;
  bool _restoredFromCart = false;

  String get _appId => findAppIdForEntity(widget.cinemaId) ?? widget.cinemaId;

  void _restoreFromCartOnce() {
    if (_restoredFromCart) return;
    _restoredFromCart = true;
    final items = ref.read(cartProvider.notifier).itemsForApp(_appId);
    if (items.isEmpty) return;
    _tickets.addAll({for (final e in items) e.listingId: e.quantity});
  }

  void _setTickets(Movie movie, int tickets) {
    setState(() {
      if (tickets <= 0) {
        _tickets.remove(movie.id);
      } else {
        _tickets[movie.id] = tickets;
      }
    });
    final notifier = ref.read(cartProvider.notifier);
    final alreadyInCart = ref
        .read(cartProvider)
        .any((e) => e.listingId == movie.id && e.appId == _appId);
    if (tickets <= 0) {
      if (alreadyInCart) notifier.removeItem(movie.id, _appId);
    } else if (alreadyInCart) {
      notifier.setQuantity(movie.id, _appId, tickets);
    } else {
      notifier.addItem(CartItem(
        listingId: movie.id,
        name: movie.title,
        unitPricePaise: movie.pricePaise,
        quantity: tickets,
        appId: _appId,
        categoryId: widget.categoryId,
        imageColorSeed: movie.id,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final cinema = findCinemaBrandById(widget.cinemaId);
    if (cinema == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Cinema')),
        body: const Center(child: Text('This cinema could not be found.')),
      );
    }

    final moviesAsync = ref.watch(moviesForCinemaProvider(widget.cinemaId));
    final reviewsAsync = ref.watch(movieReviewsForProvider(widget.cinemaId));
    _restoreFromCartOnce();

    return Scaffold(
      appBar: AppBar(
        title: Text(cinema.name),
        actions: [
          Consumer(
            builder: (context, ref, _) {
              final appId = _appId;
              final saved = ref.watch(
                wishlistProvider.select(
                  (list) => list.any((e) => e.entityId == cinema.id && e.appId == appId),
                ),
              );
              return IconButton(
                icon: Icon(saved ? Icons.favorite : Icons.favorite_border),
                color: saved ? Theme.of(context).colorScheme.error : null,
                onPressed: () {
                  HapticFeedback.lightImpact();
                  ref.read(wishlistProvider.notifier).toggle(cinema.id, appId, widget.categoryId);
                },
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _Banner(cinema: cinema),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: cinema.amenities.map((c) => Chip(label: Text(c))).toList(),
          ),
          const SizedBox(height: 16),
          moviesAsync.when(
            data: (items) => _MovieSections(
              items: items,
              tickets: _tickets,
              onAdd: (item) => _openDetailSheet(item),
              onTicketsChanged: _setTickets,
            ),
            loading: () => const Padding(
              padding: EdgeInsets.symmetric(vertical: 32),
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (_, __) => const Padding(
              padding: EdgeInsets.symmetric(vertical: 32),
              child: Center(child: Text("Couldn't load showtimes. Please try again.")),
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
          _tickets.isEmpty ? null : _buildCartBar(context, moviesAsync.value ?? const []),
    );
  }

  void _openDetailSheet(Movie item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => ShowtimeDetailSheet(
        movie: item,
        initialTickets: _tickets[item.id] ?? 0,
        onTicketsChanged: (tickets) => _setTickets(item, tickets),
      ),
    );
  }

  Widget _buildCartBar(BuildContext context, List<Movie> items) {
    final itemsById = {for (final m in items) m.id: m};
    final total = _tickets.entries.fold<int>(0, (sum, e) {
      final item = itemsById[e.key];
      return item == null ? sum : sum + item.pricePaise * e.value;
    });
    final count = _tickets.values.fold<int>(0, (a, b) => a + b);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: FilledButton(
          onPressed: () {
            HapticFeedback.mediumImpact();
            context.push('/cart');
          },
          child: Text('View cart · $count ticket${count > 1 ? 's' : ''} · ${formatPaise(total)}'),
        ),
      ),
    );
  }
}

class _Banner extends StatelessWidget {
  const _Banner({required this.cinema});

  final CinemaBrand cinema;

  @override
  Widget build(BuildContext context) {
    final gradient = _gradientForSeed(cinema.bannerColorSeed);
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
            cinema.name,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            cinema.brandTagline,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white70),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.location_on, size: 16, color: Colors.white),
              const SizedBox(width: 4),
              Expanded(child: Text(cinema.location, style: const TextStyle(color: Colors.white))),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.star_rounded, size: 16, color: Colors.white),
              const SizedBox(width: 4),
              Text(
                '${cinema.avgRating.toStringAsFixed(1)} (${cinema.reviewCount})',
                style: const TextStyle(color: Colors.white),
              ),
              const SizedBox(width: 12),
              Text(
                '${cinema.distanceKm.toStringAsFixed(1)} km away',
                style: const TextStyle(color: Colors.white),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MovieSections extends StatelessWidget {
  const _MovieSections({
    required this.items,
    required this.tickets,
    required this.onAdd,
    required this.onTicketsChanged,
  });

  final List<Movie> items;
  final Map<String, int> tickets;
  final ValueChanged<Movie> onAdd;
  final void Function(Movie, int) onTicketsChanged;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: Text('No movies are showing yet.')),
      );
    }

    final bestSellers = items.where((m) => m.isBestSeller).toList();
    final newArrivals = items.where((m) => m.isNewArrival).toList();
    final claimedIds = {...bestSellers, ...newArrivals}.map((m) => m.id).toSet();

    final byGenre = <String, List<Movie>>{};
    for (final m in items.where((m) => !claimedIds.contains(m.id))) {
      byGenre.putIfAbsent(m.genre, () => []).add(m);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (bestSellers.isNotEmpty)
          _MovieSection(title: 'Most Booked', items: bestSellers, tickets: tickets, onAdd: onAdd, onTicketsChanged: onTicketsChanged),
        if (newArrivals.isNotEmpty)
          _MovieSection(title: 'Now Showing', items: newArrivals, tickets: tickets, onAdd: onAdd, onTicketsChanged: onTicketsChanged),
        for (final entry in byGenre.entries)
          _MovieSection(title: entry.key, items: entry.value, tickets: tickets, onAdd: onAdd, onTicketsChanged: onTicketsChanged),
      ],
    );
  }
}

class _MovieSection extends StatelessWidget {
  const _MovieSection({
    required this.title,
    required this.items,
    required this.tickets,
    required this.onAdd,
    required this.onTicketsChanged,
  });

  final String title;
  final List<Movie> items;
  final Map<String, int> tickets;
  final ValueChanged<Movie> onAdd;
  final void Function(Movie, int) onTicketsChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...items.map((item) => _MovieRow(
                item: item,
                tickets: tickets[item.id] ?? 0,
                onAdd: () => onAdd(item),
                onTicketsChanged: (n) => onTicketsChanged(item, n),
              )),
        ],
      ),
    );
  }
}

class _MovieRow extends StatelessWidget {
  const _MovieRow({
    required this.item,
    required this.tickets,
    required this.onAdd,
    required this.onTicketsChanged,
  });

  final Movie item;
  final int tickets;
  final VoidCallback onAdd;
  final ValueChanged<int> onTicketsChanged;

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
                  Text(item.title, style: Theme.of(context).textTheme.bodyLarge),
                  const SizedBox(height: 2),
                  Text(
                    '${item.language} · ${item.durationMins} min',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(formatPaise(item.pricePaise), style: Theme.of(context).textTheme.titleSmall),
                      Text(' / ticket', style: Theme.of(context).textTheme.bodySmall),
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
          _TicketsStepper(tickets: tickets, onChanged: onTicketsChanged),
        ],
      ),
    );
  }
}

class _TicketsStepper extends StatelessWidget {
  const _TicketsStepper({required this.tickets, required this.onChanged});

  final int tickets;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    if (tickets == 0) {
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
            onTap: () => onChanged(tickets - 1),
            child: SizedBox(
              width: 32,
              height: 36,
              child: Icon(Icons.remove, size: 16, color: Theme.of(context).colorScheme.onPrimary),
            ),
          ),
          SizedBox(
            width: 24,
            child: Text(
              '$tickets',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Theme.of(context).colorScheme.onPrimary),
            ),
          ),
          InkWell(
            onTap: () => onChanged(tickets + 1),
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
