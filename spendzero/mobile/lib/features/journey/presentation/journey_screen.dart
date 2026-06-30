import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/providers.dart';
import '../../../core/widgets/activity_row.dart';

const _months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/// Full chronological record of every redirected craving, grouped by month —
/// the "Journey" tab from the Experience Blueprint. Dashboard/"My Future"
/// shows only the 5 most recent; this is the complete story.
class JourneyScreen extends ConsumerWidget {
  const JourneyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final history = ref.watch(savingsHistoryProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Your Journey')),
      body: history.when(
        data: (entries) {
          if (entries.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Text(
                  'Your future starts with one decision.\nSkip a craving to begin your journey.',
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }
          final sorted = [...entries]..sort((a, b) => (b['completed_at'] as String)
              .compareTo(a['completed_at'] as String));
          final grouped = <String, List<Map<String, dynamic>>>{};
          for (final e in sorted) {
            final date = DateTime.parse(e['completed_at'] as String);
            final key = '${_months[date.month - 1]} ${date.year}';
            grouped.putIfAbsent(key, () => []).add(e);
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              for (final group in grouped.entries) ...[
                Padding(
                  padding: const EdgeInsets.only(bottom: 10, top: 6),
                  child: Text(group.key, style: Theme.of(context).textTheme.titleMedium),
                ),
                ...group.value.map((e) => ActivityRow(entry: e)),
                const SizedBox(height: 8),
              ],
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text("Couldn't load your journey. Pull to retry.")),
      ),
    );
  }
}
