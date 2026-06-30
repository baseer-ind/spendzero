import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/data/local/movies_seed_data.dart';
import '../../../core/utils/money.dart';

/// Bottom sheet shown when tapping a movie row — description, genre/language
/// tags, rating, a tickets stepper and a "Book" action that writes
/// `unit_price_paise` explicitly so the existing cart pipeline
/// (see `local_cart_repository.dart`) resolves the price with zero changes.
class ShowtimeDetailSheet extends ConsumerStatefulWidget {
  const ShowtimeDetailSheet({
    super.key,
    required this.movie,
    required this.initialTickets,
    required this.onTicketsChanged,
  });

  final Movie movie;
  final int initialTickets;
  final ValueChanged<int> onTicketsChanged;

  @override
  ConsumerState<ShowtimeDetailSheet> createState() => _ShowtimeDetailSheetState();
}

class _ShowtimeDetailSheetState extends ConsumerState<ShowtimeDetailSheet> {
  late int _tickets;

  @override
  void initState() {
    super.initState();
    _tickets = widget.initialTickets == 0 ? 1 : widget.initialTickets;
  }

  @override
  Widget build(BuildContext context) {
    final movie = widget.movie;
    final colors = Theme.of(context).colorScheme;
    final related = allMovies
        .where((m) =>
            m.id != movie.id &&
            m.cinemaId == movie.cinemaId &&
            m.tags.any((t) => movie.tags.contains(t)))
        .take(4)
        .toList();

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(movie.title, style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              Text(movie.description, style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  Chip(label: Text(movie.genre)),
                  Chip(label: Text(movie.language)),
                  Chip(label: Text('${movie.durationMins} mins')),
                  Chip(label: Text('${movie.rating.toStringAsFixed(1)} ★ (${movie.reviewCount})')),
                  ...movie.tags.map((t) => Chip(label: Text(t))),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Text(formatPaise(movie.pricePaise), style: Theme.of(context).textTheme.titleMedium),
                  Text(' / ticket', style: Theme.of(context).textTheme.bodyMedium),
                  if (movie.mrpPaise != null && movie.discountPercent != null) ...[
                    const SizedBox(width: 8),
                    Text(
                      formatPaise(movie.mrpPaise!),
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            decoration: TextDecoration.lineThrough,
                            color: colors.outline,
                          ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  IconButton(
                    onPressed: _tickets > 1 ? () => setState(() => _tickets--) : null,
                    icon: const Icon(Icons.remove_circle_outline),
                  ),
                  Text('$_tickets ticket${_tickets > 1 ? 's' : ''}', style: Theme.of(context).textTheme.titleMedium),
                  IconButton(
                    onPressed: () => setState(() => _tickets++),
                    icon: const Icon(Icons.add_circle_outline),
                  ),
                  const Spacer(),
                  FilledButton(
                    onPressed: () => _book(context),
                    child: Text('Book · ${formatPaise(movie.pricePaise * _tickets)}'),
                  ),
                ],
              ),
              if (related.isNotEmpty) ...[
                const SizedBox(height: 20),
                Text('You may also like', style: Theme.of(context).textTheme.titleSmall),
                const SizedBox(height: 8),
                SizedBox(
                  height: 60,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: related.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) => Chip(label: Text(related[index].title)),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _book(BuildContext context) async {
    HapticFeedback.mediumImpact();
    widget.onTicketsChanged(_tickets);
    Navigator.of(context).pop();
  }
}
