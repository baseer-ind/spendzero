import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../feedback/presentation/feedback_sheet.dart';

/// Minimal, offline-first per the Experience Blueprint — no account
/// settings, since the app has no accounts. Just the few things a user
/// might genuinely want: their badge cabinet, feedback, and app info.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 8),
        children: [
          const _ProfileHeader(),
          const SizedBox(height: 8),
          ListTile(
            leading: const Icon(Icons.emoji_events_outlined),
            title: const Text('Victories & badges'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/achievements'),
          ),
          ListTile(
            leading: const Icon(Icons.flag_outlined),
            title: const Text('Manage My Future'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/goals'),
          ),
          ListTile(
            leading: const Icon(Icons.chat_bubble_outline),
            title: const Text('Send feedback'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => showFeedbackSheet(context),
          ),
          const Divider(height: 24),
          const ListTile(
            leading: Icon(Icons.lock_outline),
            title: Text('Privacy'),
            subtitle: Text('Everything stays on this device. Nothing is ever uploaded.'),
          ),
          const ListTile(
            leading: Icon(Icons.info_outline),
            title: Text('About Project Future'),
            subtitle: Text('An Intentional Living app — fully offline, no real money.'),
          ),
        ],
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader();

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Row(
        children: [
          CircleAvatar(
            radius: 26,
            backgroundColor: colors.primaryContainer,
            child: const Text('🙋', style: TextStyle(fontSize: 24)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Your Future', style: Theme.of(context).textTheme.titleLarge),
                Text(
                  'Built one intentional choice at a time.',
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: colors.onSurfaceVariant),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
