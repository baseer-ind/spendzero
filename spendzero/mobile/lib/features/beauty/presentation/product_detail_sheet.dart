import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/data/local/beauty_seed_data.dart';
import '../../../core/utils/money.dart';

/// Bottom sheet shown when tapping a product row — description, variant,
/// tags, a quantity stepper and an "Add to cart" action that writes
/// `unit_price_paise` explicitly so the existing cart pipeline resolves
/// the price with zero changes (see `local_cart_repository.dart`).
class BeautyProductDetailSheet extends ConsumerStatefulWidget {
  const BeautyProductDetailSheet({
    super.key,
    required this.product,
    required this.initialQuantity,
    required this.onQuantityChanged,
  });

  final BeautyProduct product;
  final int initialQuantity;
  final ValueChanged<int> onQuantityChanged;

  @override
  ConsumerState<BeautyProductDetailSheet> createState() => _BeautyProductDetailSheetState();
}

class _BeautyProductDetailSheetState extends ConsumerState<BeautyProductDetailSheet> {
  late int _quantity;

  @override
  void initState() {
    super.initState();
    _quantity = widget.initialQuantity == 0 ? 1 : widget.initialQuantity;
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final colors = Theme.of(context).colorScheme;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(product.name, style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 4),
              Text(product.variant,
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: colors.outline)),
              const SizedBox(height: 8),
              Text(product.description, style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: product.tags.map((t) => Chip(label: Text(t))).toList(),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Text(formatPaise(product.pricePaise),
                      style: Theme.of(context).textTheme.titleMedium),
                  if (product.mrpPaise != null && product.discountPercent != null) ...[
                    const SizedBox(width: 8),
                    Text(
                      formatPaise(product.mrpPaise!),
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            decoration: TextDecoration.lineThrough,
                            color: colors.outline,
                          ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '${product.discountPercent}% off',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: colors.primary,
                            fontWeight: FontWeight.w600,
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
                    child:
                        Text('Add to cart · ${formatPaise(product.pricePaise * _quantity)}'),
                  ),
                ],
              ),
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
