import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/data/local/food_seed_data.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';

/// Bottom sheet shown when tapping a menu item row — description, spice
/// level, prep time, tags, a quantity stepper and an "Add to cart" action
/// that writes `unit_price_paise` explicitly so the existing cart pipeline
/// (see `local_cart_repository.dart`) resolves the price with zero changes.
class MenuItemDetailSheet extends ConsumerStatefulWidget {
  const MenuItemDetailSheet({
    super.key,
    required this.item,
    required this.initialQuantity,
    required this.onQuantityChanged,
  });

  final MenuItem item;
  final int initialQuantity;
  final ValueChanged<int> onQuantityChanged;

  @override
  ConsumerState<MenuItemDetailSheet> createState() => _MenuItemDetailSheetState();
}

class _MenuItemDetailSheetState extends ConsumerState<MenuItemDetailSheet> {
  late int _quantity;

  @override
  void initState() {
    super.initState();
    _quantity = widget.initialQuantity == 0 ? 1 : widget.initialQuantity;
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.item;
    final colors = Theme.of(context).colorScheme;
    final related = allMenuItemsFull
        .where((m) =>
            m.id != item.id &&
            m.restaurantId == item.restaurantId &&
            m.tags.any((t) => item.tags.contains(t)))
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
              Text(item.name, style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              Text(item.description, style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  if (item.spiceLevel != null)
                    Chip(label: Text('Spice ${item.spiceLevel}/3')),
                  Chip(label: Text('${item.prepTimeMins} min prep')),
                  ...item.tags.map((t) => Chip(label: Text(t))),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Text(formatPaise(item.pricePaise), style: Theme.of(context).textTheme.titleMedium),
                  if (item.mrpPaise != null && item.discountPercent != null) ...[
                    const SizedBox(width: 8),
                    Text(
                      formatPaise(item.mrpPaise!),
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
                    onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null,
                    icon: const Icon(Icons.remove_circle_outline),
                  ),
                  Text('$_quantity', style: Theme.of(context).textTheme.titleMedium),
                  IconButton(
                    onPressed: () => setState(() => _quantity++),
                    icon: const Icon(Icons.add_circle_outline),
                  ),
                  const Spacer(),
                  FilledButton(
                    onPressed: () => _addToCart(context),
                    child: Text('Add to cart · ${formatPaise(item.pricePaise * _quantity)}'),
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

  Future<void> _addToCart(BuildContext context) async {
    HapticFeedback.mediumImpact();
    widget.onQuantityChanged(_quantity);
    Navigator.of(context).pop();
  }
}
