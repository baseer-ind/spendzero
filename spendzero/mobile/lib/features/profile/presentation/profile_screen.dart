import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../auth/presentation/login_screen.dart';
import '../../feedback/presentation/feedback_sheet.dart';

/// Minimal, offline-first per the Experience Blueprint. Shows the signed-in
/// account (or a prompt to sign in for guests), the badge cabinet, feedback,
/// and app info.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _signOut(BuildContext context) async {
    try {
      await Supabase.instance.client.auth.signOut();
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(guestModeKey, false);
    if (context.mounted) context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    final session = Supabase.instance.client.auth.currentSession;
    final email = session?.user.email;
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 8),
        children: [
          const _ProfileHeader(),
          const SizedBox(height: 8),
          if (email != null)
            ListTile(
              leading: const Icon(Icons.account_circle_outlined),
              title: Text(email),
              subtitle: const Text('Signed in'),
              trailing: TextButton(
                onPressed: () => _signOut(context),
                child: const Text('Sign out'),
              ),
            )
          else
            ListTile(
              leading: const Icon(Icons.login),
              title: const Text('You\'re browsing as a guest'),
              subtitle: const Text('Sign in to save your dreams to your account'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.go('/login'),
            ),
          const Divider(height: 24),
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
