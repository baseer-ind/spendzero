import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/data/local/fictional_apps_seed.dart';
import '../../../core/data/local/persistent_cart_store.dart';
import '../../../core/models/cart_item.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  bool _isCheckingOut = false;
  final TextEditingController _couponController = TextEditingController();
  String? _appliedCoupon;
  int _couponDiscountPaise = 0;

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  void _applyCoupon() {
    final code = _couponController.text.trim().toUpperCase();
    final coupons = {
      'ZERO10': 10,
      'SAVE20': 20,
      'CRAVE15': 15,
      'FIRST50': 50,
      'DREAM25': 25,
    };
    final discount = coupons[code];
    if (discount != null) {
      final total = ref.read(cartProvider).fold(0, (s, e) => s + e.totalPaise);
      setState(() {
        _appliedCoupon = code;
        _couponDiscountPaise = (total * discount / 100).round();
      });
      HapticFeedback.mediumImpact();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content:
                Text('$discount% off applied! You save ${formatPaise(_couponDiscountPaise)}')),
      );
    } else {
      setState(() {
        _appliedCoupon = null;
        _couponDiscountPaise = 0;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid coupon code.')),
      );
    }
  }

  Future<void> _checkout(List<CartItem> items, int totalPaise) async {
    setState(() => _isCheckingOut = true);
    HapticFeedback.mediumImpact();
    try {
      final repo = await ref.read(cravingRepositoryProvider.future);
      final categoryId = items.first.categoryId;
      final result = await repo.checkout(
        categoryId: categoryId,
        items: items
            .map((e) => {
                  'listing_id': e.listingId,
                  'quantity': e.quantity,
                  'unit_price_paise': e.unitPricePaise,
                })
            .toList(),
      );
      ref.read(cartProvider.notifier).clearAll();
      if (!mounted) return;
      context.pushReplacement('/craving-completed', extra: result);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Checkout failed. Please try again.")),
        );
      }
    } finally {
      if (mounted) setState(() => _isCheckingOut = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = ref.watch(cartProvider);
    final total = items.fold(0, (s, e) => s + e.totalPaise);
    final finalTotal = (total - _couponDiscountPaise).clamp(0, total);

    if (items.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Your cart')),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.shopping_cart_outlined,
                  size: 64,
                  color: Theme.of(context).colorScheme.onSurfaceVariant),
              const SizedBox(height: 16),
              Text('Your cart is empty',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Text('Add items from any app to get started.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant)),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => context.pop(),
                child: const Text('Browse apps'),
              ),
            ],
          ),
        ),
      );
    }

    // Group items by app
    final grouped = <String, List<CartItem>>{};
    for (final item in items) {
      grouped.putIfAbsent(item.appId, () => []).add(item);
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Cart (${items.fold(0, (s, e) => s + e.quantity)} items)'),
        actions: [
          TextButton(
            onPressed: () {
              ref.read(cartProvider.notifier).clearAll();
              setState(() {
                _appliedCoupon = null;
                _couponDiscountPaise = 0;
              });
            },
            child: const Text('Clear all'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Items grouped by fictional app
          for (final entry in grouped.entries) ...[
            _AppGroupHeader(appId: entry.key),
            const SizedBox(height: 8),
            for (final item in entry.value)
              _CartItemTile(
                item: item,
                onIncrement: () => ref
                    .read(cartProvider.notifier)
                    .setQuantity(item.listingId, item.appId, item.quantity + 1),
                onDecrement: () => ref
                    .read(cartProvider.notifier)
                    .setQuantity(item.listingId, item.appId, item.quantity - 1),
                onRemove: () {
                  HapticFeedback.mediumImpact();
                  ref
                      .read(cartProvider.notifier)
                      .removeItem(item.listingId, item.appId);
                },
              ),
            const SizedBox(height: 16),
          ],

          // Coupon
          _CouponSection(
            controller: _couponController,
            appliedCoupon: _appliedCoupon,
            onApply: _applyCoupon,
            onRemove: () => setState(() {
              _appliedCoupon = null;
              _couponDiscountPaise = 0;
              _couponController.clear();
            }),
          ),
          const SizedBox(height: 16),

          // Summary
          _BillSummary(
            subtotal: total,
            discount: _couponDiscountPaise,
            finalTotal: finalTotal,
          ),
          const SizedBox(height: 100),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.savings_outlined,
                        color: Theme.of(context).colorScheme.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Checking out means you\'re resisting this craving — and saving ${formatPaise(finalTotal)}!',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Theme.of(context).colorScheme.primary,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed:
                      _isCheckingOut ? null : () => _checkout(items, finalTotal),
                  child: _isCheckingOut
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(
                          'Checkout · ${formatPaise(finalTotal)}',
                          style: const TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AppGroupHeader extends StatelessWidget {
  const _AppGroupHeader({required this.appId});

  final String appId;

  @override
  Widget build(BuildContext context) {
    final app = findFictionalAppById(appId);
    if (app == null) return const SizedBox.shrink();
    return Row(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: app.logoBgGradient),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(app.logoIcon, color: Colors.white, size: 16),
        ),
        const SizedBox(width: 8),
        Text(app.name,
            style: Theme.of(context)
                .textTheme
                .labelLarge
                ?.copyWith(fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _CartItemTile extends StatelessWidget {
  const _CartItemTile({
    required this.item,
    required this.onIncrement,
    required this.onDecrement,
    required this.onRemove,
  });

  final CartItem item;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final hue = (item.imageColorSeed.isEmpty
            ? item.listingId
            : item.imageColorSeed)
        .codeUnits
        .fold<int>(0, (a, b) => a + b) %
        360;
    final thumbColor =
        HSLColor.fromAHSL(1, hue.toDouble(), 0.45, 0.85).toColor();

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          // Thumbnail
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: thumbColor,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(Icons.shopping_bag_outlined,
                color: colors.onSurfaceVariant, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  formatPaise(item.unitPricePaise),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: colors.onSurfaceVariant,
                      ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                formatPaise(item.totalPaise),
                style: Theme.of(context)
                    .textTheme
                    .titleSmall
                    ?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  _StepBtn(
                    icon: item.quantity == 1
                        ? Icons.delete_outline
                        : Icons.remove,
                    color: item.quantity == 1 ? colors.error : colors.primary,
                    onTap: item.quantity == 1 ? onRemove : onDecrement,
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Text('${item.quantity}',
                        style: Theme.of(context).textTheme.bodyMedium),
                  ),
                  _StepBtn(
                      icon: Icons.add,
                      color: colors.primary,
                      onTap: onIncrement),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StepBtn extends StatelessWidget {
  const _StepBtn(
      {required this.icon, required this.color, required this.onTap});

  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          border: Border.all(color: color.withOpacity(0.4)),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Icon(icon, size: 16, color: color),
      ),
    );
  }
}

class _CouponSection extends StatelessWidget {
  const _CouponSection({
    required this.controller,
    required this.appliedCoupon,
    required this.onApply,
    required this.onRemove,
  });

  final TextEditingController controller;
  final String? appliedCoupon;
  final VoidCallback onApply;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.local_offer_outlined,
                  color: colors.primary, size: 18),
              const SizedBox(width: 6),
              Text('Apply coupon',
                  style: Theme.of(context).textTheme.titleSmall),
            ],
          ),
          const SizedBox(height: 8),
          if (appliedCoupon != null)
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: colors.primaryContainer,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    appliedCoupon!,
                    style: TextStyle(
                        color: colors.primary, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 8),
                Text('Applied ✓',
                    style:
                        TextStyle(color: colors.primary, fontSize: 13)),
                const Spacer(),
                TextButton(onPressed: onRemove, child: const Text('Remove')),
              ],
            )
          else
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller,
                    textCapitalization: TextCapitalization.characters,
                    decoration: InputDecoration(
                      hintText: 'Enter coupon code',
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton.tonal(
                  onPressed: onApply,
                  child: const Text('Apply'),
                ),
              ],
            ),
          const SizedBox(height: 6),
          Text(
            'Try: ZERO10 · SAVE20 · CRAVE15 · DREAM25',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: colors.onSurfaceVariant,
                ),
          ),
        ],
      ),
    );
  }
}

class _BillSummary extends StatelessWidget {
  const _BillSummary({
    required this.subtotal,
    required this.discount,
    required this.finalTotal,
  });

  final int subtotal;
  final int discount;
  final int finalTotal;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Bill details',
              style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: 10),
          _Row(label: 'Item total', value: formatPaise(subtotal)),
          if (discount > 0)
            _Row(
              label: 'Coupon discount',
              value: '- ${formatPaise(discount)}',
              valueColor: colors.primary,
            ),
          const Divider(height: 20),
          _Row(
            label: 'You would have spent',
            value: formatPaise(finalTotal),
            bold: true,
          ),
          const SizedBox(height: 4),
          Text(
            'By checking out you\'re recording this craving — not spending real money!',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: colors.onSurfaceVariant,
                ),
          ),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({
    required this.label,
    required this.value,
    this.bold = false,
    this.valueColor,
  });

  final String label;
  final String value;
  final bool bold;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    final style = bold
        ? Theme.of(context)
            .textTheme
            .bodyMedium
            ?.copyWith(fontWeight: FontWeight.bold)
        : Theme.of(context).textTheme.bodyMedium;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: style),
          Text(value, style: style?.copyWith(color: valueColor)),
        ],
      ),
    );
  }
}
