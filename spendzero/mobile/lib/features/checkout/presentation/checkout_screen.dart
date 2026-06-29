import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/category.dart';
import '../../../core/models/listing.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/money.dart';

/// Browse a category's simulated listings, build a cart, and run the fake
/// checkout. Customization/options and multi-quantity carts are a later
/// milestone — this covers the end-to-end craving -> savings loop.
class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key, required this.category});

  final SpendCategory category;

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final Set<String> _selectedListingIds = {};
  bool _isCheckingOut = false;
  String? _checkoutError;

  @override
  Widget build(BuildContext context) {
    final listingsAsync = ref.watch(categoryListingsProvider(widget.category.id));

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
      bottomNavigationBar: _selectedListingIds.isEmpty
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
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final listing = listings[index];
        final selected = _selectedListingIds.contains(listing.id);
        return CheckboxListTile(
          value: selected,
          title: Text(listing.title),
          subtitle: Text(formatPaise(listing.pricePaise)),
          onChanged: (value) => setState(() {
            if (value == true) {
              _selectedListingIds.add(listing.id);
            } else {
              _selectedListingIds.remove(listing.id);
            }
          }),
        );
      },
    );
  }

  Widget _buildCheckoutBar(BuildContext context, List<Listing> listings) {
    final selected = listings.where((l) => _selectedListingIds.contains(l.id));
    final total = selected.fold<int>(0, (sum, l) => sum + l.pricePaise);

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
              onPressed: _isCheckingOut ? null : () => _checkout(selected.toList()),
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

  Future<void> _checkout(List<Listing> selected) async {
    setState(() {
      _isCheckingOut = true;
      _checkoutError = null;
    });
    try {
      final repo = await ref.read(cravingRepositoryProvider.future);
      final result = await repo.checkout(
        categoryId: widget.category.id,
        items: selected.map((l) => {'listing_id': l.id, 'quantity': 1}).toList(),
      );
      if (!mounted) return;
      context.push('/craving-completed', extra: result);
    } catch (_) {
      setState(() => _checkoutError = 'Checkout failed. Please try again.');
    } finally {
      if (mounted) setState(() => _isCheckingOut = false);
    }
  }
}
