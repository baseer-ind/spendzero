import 'package:flutter/material.dart';

import '../../../core/models/listing.dart';
import '../../../core/utils/money.dart';

/// A real product card (image placeholder, title, rating, price/MRP,
/// quantity stepper) replacing the plain checkbox list, per
/// docs/07-design-system.md and docs/08-component-library.md.
class ProductCard extends StatelessWidget {
  const ProductCard({
    super.key,
    required this.listing,
    required this.quantity,
    required this.onQuantityChanged,
  });

  final Listing listing;
  final int quantity;
  final ValueChanged<int> onQuantityChanged;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final discount = listing.discountPercent;

    return Semantics(
      label: '${listing.title}, ${formatPaise(listing.pricePaise)}'
          '${quantity > 0 ? ', $quantity in cart' : ''}',
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: colors.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16),
          border: quantity > 0 ? Border.all(color: colors.primary, width: 1.5) : null,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _Thumbnail(seed: listing.id),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    listing.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  if (listing.rating != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.star_rounded, size: 16, color: colors.secondary),
                        const SizedBox(width: 2),
                        Text(
                          '${listing.rating!.toStringAsFixed(1)} (${listing.reviewCount})',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Text(
                        formatPaise(listing.pricePaise),
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      if (listing.mrpPaise != null && discount != null) ...[
                        const SizedBox(width: 6),
                        Text(
                          formatPaise(listing.mrpPaise!),
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                decoration: TextDecoration.lineThrough,
                                color: colors.outline,
                              ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '$discount% off',
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: colors.primary, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            _QuantityControl(quantity: quantity, onChanged: onQuantityChanged),
          ],
        ),
      ),
    );
  }
}

class _Thumbnail extends StatelessWidget {
  const _Thumbnail({required this.seed});

  final String seed;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final hue = (seed.codeUnits.fold<int>(0, (a, b) => a + b) % 360).toDouble();
    final color = HSLColor.fromAHSL(1, hue, 0.45, 0.85).toColor();
    return Container(
      width: 64,
      height: 64,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(Icons.shopping_bag_outlined, color: colors.onSurfaceVariant),
    );
  }
}

class _QuantityControl extends StatelessWidget {
  const _QuantityControl({required this.quantity, required this.onChanged});

  final int quantity;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    if (quantity == 0) {
      return SizedBox(
        height: 36,
        child: OutlinedButton(
          onPressed: () => onChanged(1),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(44, 44),
            padding: const EdgeInsets.symmetric(horizontal: 16),
          ),
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
          _StepButton(
            icon: Icons.remove,
            tooltip: 'Decrease quantity',
            onTap: () => onChanged(quantity - 1),
          ),
          SizedBox(
            width: 24,
            child: Text(
              '$quantity',
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: Theme.of(context).colorScheme.onPrimary),
            ),
          ),
          _StepButton(
            icon: Icons.add,
            tooltip: 'Increase quantity',
            onTap: () => onChanged(quantity + 1),
          ),
        ],
      ),
    );
  }
}

class _StepButton extends StatelessWidget {
  const _StepButton({required this.icon, required this.tooltip, required this.onTap});

  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          width: 32,
          height: 36,
          child: Icon(icon, size: 16, color: Theme.of(context).colorScheme.onPrimary),
        ),
      ),
    );
  }
}
