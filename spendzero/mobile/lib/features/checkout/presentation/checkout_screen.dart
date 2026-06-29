import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/category.dart';
import '../../../core/models/listing.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';
import 'product_card.dart';

/// Browse a category's simulated listings, build a cart, and run the fake
/// checkout. Customization/options are a later milestone — this covers the
/// end-to-end craving -> savings loop with real per-item quantities.
class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key, required this.category});

  final SpendCategory category;

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final Map<String, int> _quantities = {};
  bool _isCheckingOut = false;
  String? _checkoutError;
  bool _cartRestored = false;
  Timer? _saveDebounce;

  @override
  void dispose() {
    _saveDebounce?.cancel();
    super.dispose();
  }

  void _restoreCartOnce(AsyncValue<dynamic> cartAsync) {
    if (_cartRestored) return;
    final cart = cartAsync.value;
    if (cart == null) return;
    _cartRestored = true;
    final restored = {
      for (final item in cart.items) item.listingId as String: item.quantity as int,
    };
    if (restored.isNotEmpty) {
      setState(() => _quantities.addAll(restored));
    }
  }

  void _setQuantity(String listingId, int quantity) {
    setState(() {
      if (quantity <= 0) {
        _quantities.remove(listingId);
      } else {
        _quantities[listingId] = quantity;
      }
    });
    _scheduleCartSave();
  }

  void _scheduleCartSave() {
    _saveDebounce?.cancel();
    _saveDebounce = Timer(const Duration(milliseconds: 500), () async {
      try {
        final repo = await ref.read(cartRepositoryProvider.future);
        await repo.saveItems(
          widget.category.id,
          _quantities.entries
              .map((e) => {'listing_id': e.key, 'quantity': e.value})
              .toList(),
        );
      } catch (_) {
        // Best-effort persistence; the in-memory selection still drives checkout.
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final listingsAsync = ref.watch(categoryListingsProvider(widget.category.id));
    _restoreCartOnce(ref.watch(cartProvider(widget.category.id)));

    return Scaffold(
      appBar: AppBar(title: Text(widget.category.name)),
      body: listingsAsync.when(
        data: (listings) => _buildListings(context, listings),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Couldn\'t load ${widget.category.name} listings.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => ref.invalidate(categoryListingsProvider(widget.category.id)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _quantities.isEmpty
          ? null
          : _buildCheckoutBar(context, listingsAsync.value ?? const []),
    );
  }

  Widget _buildListings(BuildContext context, List<Listing> listings) {
    if (listings.isEmpty) {
      return Center(
        child: Text(
          'No ${widget.category.name} listings yet — check back soon.',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: listings.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final listing = listings[index];
        return ProductCard(
          listing: listing,
          quantity: _quantities[listing.id] ?? 0,
          onQuantityChanged: (qty) => _setQuantity(listing.id, qty),
        );
      },
    );
  }

  Widget _buildCheckoutBar(BuildContext context, List<Listing> listings) {
    final listingsById = {for (final l in listings) l.id: l};
    final total = _quantities.entries.fold<int>(0, (sum, e) {
      final listing = listingsById[e.key];
      return listing == null ? sum : sum + listing.pricePaise * e.value;
    });

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_checkoutError != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  _checkoutError!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              ),
            FilledButton(
              onPressed: _isCheckingOut ? null : () => _checkout(listingsById),
              child: _isCheckingOut
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text('Checkout · ${formatPaise(total)}'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _checkout(Map<String, Listing> listingsById) async {
    setState(() {
      _isCheckingOut = true;
      _checkoutError = null;
    });
    try {
      final repo = await ref.read(cravingRepositoryProvider.future);
      final result = await repo.checkout(
        categoryId: widget.category.id,
        items: _quantities.entries
            .where((e) => listingsById.containsKey(e.key))
            .map((e) => {'listing_id': e.key, 'quantity': e.value})
            .toList(),
      );
      _saveDebounce?.cancel();
      ref.invalidate(cartProvider(widget.category.id));
      if (!mounted) return;
      context.push('/craving-completed', extra: result);
    } catch (_) {
      setState(() => _checkoutError = 'Checkout failed. Please try again.');
    } finally {
      if (mounted) setState(() => _isCheckingOut = false);
    }
  }
}
