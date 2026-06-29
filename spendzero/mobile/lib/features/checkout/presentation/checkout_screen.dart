import 'dart:math';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/utils/money.dart';

/// A minimal simulated checkout for one category. Browsing, cart, and
/// customization flows will be built out per category in later milestones;
/// this lets the end-to-end craving -> savings loop be tested today.
class CheckoutScreen extends StatelessWidget {
  const CheckoutScreen({super.key, required this.categorySlug});

  final String categorySlug;

  @override
  Widget build(BuildContext context) {
    final mockPricePaise = (200 + Random(categorySlug.hashCode).nextInt(1800)) * 100;

    return Scaffold(
      appBar: AppBar(title: Text(categorySlug)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Your simulated cart',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                formatPaise(mockPricePaise),
                style: Theme.of(context).textTheme.displaySmall,
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => context.push(
                  '/craving-completed',
                  extra: mockPricePaise,
                ),
                child: const Text('Checkout (simulated)'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
