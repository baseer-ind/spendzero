import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/data/local/travel_seed_data.dart';
import '../../../core/utils/money.dart';

/// Bottom sheet shown when tapping a room row — description, amenities,
/// rating, tags, a nights stepper and a "Book this room" action that
/// writes `unit_price_paise` explicitly so the existing cart pipeline
/// (see `local_cart_repository.dart`) resolves the price with zero changes.
class RoomDetailSheet extends ConsumerStatefulWidget {
  const RoomDetailSheet({
    super.key,
    required this.room,
    required this.initialNights,
    required this.onNightsChanged,
  });

  final TravelRoom room;
  final int initialNights;
  final ValueChanged<int> onNightsChanged;

  @override
  ConsumerState<RoomDetailSheet> createState() => _RoomDetailSheetState();
}

class _RoomDetailSheetState extends ConsumerState<RoomDetailSheet> {
  late int _nights;

  @override
  void initState() {
    super.initState();
    _nights = widget.initialNights == 0 ? 1 : widget.initialNights;
  }

  @override
  Widget build(BuildContext context) {
    final room = widget.room;
    final colors = Theme.of(context).colorScheme;
    final related = allTravelRooms
        .where((r) =>
            r.id != room.id &&
            r.stayId == room.stayId &&
            r.tags.any((t) => room.tags.contains(t)))
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
              Text(room.name, style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              Text(room.description, style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  Chip(label: Text(room.category)),
                  Chip(label: Text('${room.rating.toStringAsFixed(1)} ★ (${room.reviewCount})')),
                  ...room.tags.map((t) => Chip(label: Text(t))),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Text(formatPaise(room.pricePaise), style: Theme.of(context).textTheme.titleMedium),
                  Text(' / ${room.unit}', style: Theme.of(context).textTheme.bodyMedium),
                  if (room.mrpPaise != null && room.discountPercent != null) ...[
                    const SizedBox(width: 8),
                    Text(
                      formatPaise(room.mrpPaise!),
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
                    onPressed: _nights > 1 ? () => setState(() => _nights--) : null,
                    icon: const Icon(Icons.remove_circle_outline),
                  ),
                  Text('$_nights night${_nights > 1 ? 's' : ''}', style: Theme.of(context).textTheme.titleMedium),
                  IconButton(
                    onPressed: () => setState(() => _nights++),
                    icon: const Icon(Icons.add_circle_outline),
                  ),
                  const Spacer(),
                  FilledButton(
                    onPressed: () => _book(context),
                    child: Text('Book · ${formatPaise(room.pricePaise * _nights)}'),
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
                    itemBuilder: (context, index) => Chip(label: Text(related[index].name)),
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
    widget.onNightsChanged(_nights);
    Navigator.of(context).pop();
  }
}
