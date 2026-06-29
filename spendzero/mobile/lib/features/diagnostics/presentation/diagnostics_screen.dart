import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config/env.dart';
import '../../../core/data/feedback_repository.dart';
import '../../../core/providers/providers.dart';

/// Beta-tester support screen: surfaces exactly what we'd need to ask a
/// tester for over chat (app version, env, device id, whether the API is
/// reachable) so they can just screenshot this instead.
class DiagnosticsScreen extends ConsumerWidget {
  const DiagnosticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deviceId = ref.watch(deviceIdProvider);
    final apiHealth = ref.watch(apiHealthProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Diagnostics')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _Row(label: 'App version', value: appVersion),
          _Row(label: 'Environment', value: Env.envName),
          _Row(label: 'API base URL', value: Env.apiBaseUrl),
          deviceId.when(
            data: (id) => _Row(label: 'Device ID', value: id),
            loading: () => const _Row(label: 'Device ID', value: 'Loading…'),
            error: (_, __) => const _Row(label: 'Device ID', value: 'Unavailable'),
          ),
          apiHealth.when(
            data: (ok) => _Row(
              label: 'API status',
              value: ok ? 'Reachable' : 'Unreachable',
              valueColor: ok ? Colors.green : Colors.red,
            ),
            loading: () => const _Row(label: 'API status', value: 'Checking…'),
            error: (_, __) => const _Row(
              label: 'API status',
              value: 'Unreachable',
              valueColor: Colors.red,
            ),
          ),
          const SizedBox(height: 24),
          OutlinedButton.icon(
            onPressed: () => ref.invalidate(apiHealthProvider),
            icon: const Icon(Icons.refresh),
            label: const Text('Re-check API status'),
          ),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.label, required this.value, this.valueColor});

  final String label;
  final String value;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: Theme.of(context).textTheme.bodyMedium),
          ),
          Expanded(
            child: SelectableText(
              value,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w600, color: valueColor),
            ),
          ),
        ],
      ),
    );
  }
}
