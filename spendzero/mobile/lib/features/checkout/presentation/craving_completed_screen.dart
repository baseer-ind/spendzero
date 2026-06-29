import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/money.dart';

/// Shown after every simulated checkout. Never "Order Successful" — the
/// celebration is always framed around the money the user chose not to
/// spend, per the SpendZero product vision.
class CravingCompletedScreen extends StatelessWidget {
  const CravingCompletedScreen({super.key, required this.amountPaise});

  final int amountPaise;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cravingCompletedAccent.withOpacity(0.08),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('🎉', style: TextStyle(fontSize: 48)),
                const SizedBox(height: 12),
                Text(
                  'Craving Completed',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text('You chose not to spend', style: Theme.of(context).textTheme.bodyMedium),
                Text(
                  formatPaise(amountPaise),
                  style: Theme.of(context)
                      .textTheme
                      .displaySmall
                      ?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 32),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => context.go('/'),
                        child: const Text('Maybe Later'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(
                        onPressed: () => context.go('/'),
                        child: const Text('I Saved It'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
