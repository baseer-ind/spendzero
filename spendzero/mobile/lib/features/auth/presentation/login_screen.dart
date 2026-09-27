import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/config/supabase_config.dart';

const guestModeKey = 'project_future_guest_mode';

/// Sign in / create account with email+password or Google, or continue as a
/// guest. Auth runs directly against Supabase; guest mode needs no network.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _isSignUp = false;
  bool _busy = false;
  String? _error;
  String? _notice;
  StreamSubscription<AuthState>? _authSub;
  bool _navigated = false;

  @override
  void initState() {
    super.initState();
    // Catches the Google/OAuth browser flow returning via deep link.
    _authSub = Supabase.instance.client.auth.onAuthStateChange.listen((data) {
      if (data.event == AuthChangeEvent.signedIn) _onSignedIn();
    });
  }

  @override
  void dispose() {
    _authSub?.cancel();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  SupabaseClient get _auth => Supabase.instance.client;

  Future<void> _continueAsGuest() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(guestModeKey, true);
    if (mounted) context.go('/');
  }

  Future<void> _submitEmail() async {
    final email = _email.text.trim();
    final password = _password.text;
    if (email.isEmpty || password.length < 6) {
      setState(() => _error = 'Enter your email and a password of at least 6 characters.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
      _notice = null;
    });
    try {
      if (_isSignUp) {
        final res = await _auth.auth.signUp(email: email, password: password);
        if (res.session == null) {
          // Email confirmation is on — no session yet.
          setState(() => _notice = 'Check your inbox to confirm your email, then sign in.');
          return;
        }
      } else {
        await _auth.auth.signInWithPassword(email: email, password: password);
      }
      await _onSignedIn();
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Something went wrong. Please try again.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _google() async {
    setState(() {
      _busy = true;
      _error = null;
      _notice = null;
    });
    try {
      await _auth.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: SupabaseConfig.oauthRedirect,
      );
      // The browser flow returns via deep link; auth state change routes on.
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Google sign-in isn\'t available yet. Use email, or continue as guest.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _onSignedIn() async {
    if (_navigated) return;
    _navigated = true;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(guestModeKey, false);
    if (mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text('Project Future',
                      style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text(
                    _isSignUp ? 'Create your account' : 'Welcome back',
                    style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                  ),
                  const SizedBox(height: 28),
                  TextField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    autofillHints: const [AutofillHints.email],
                    decoration: const InputDecoration(labelText: 'Email'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _password,
                    obscureText: true,
                    autofillHints: const [AutofillHints.password],
                    decoration: const InputDecoration(labelText: 'Password'),
                    onSubmitted: (_) => _busy ? null : _submitEmail(),
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(_error!, style: TextStyle(color: theme.colorScheme.error)),
                  ],
                  if (_notice != null) ...[
                    const SizedBox(height: 12),
                    Text(_notice!, style: TextStyle(color: theme.colorScheme.primary)),
                  ],
                  const SizedBox(height: 20),
                  FilledButton(
                    onPressed: _busy ? null : _submitEmail,
                    child: _busy
                        ? const SizedBox(
                            height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                        : Text(_isSignUp ? 'Create account' : 'Sign in'),
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    onPressed: _busy ? null : _google,
                    icon: const Icon(Icons.g_mobiledata, size: 28),
                    label: const Text('Continue with Google'),
                  ),
                  const SizedBox(height: 6),
                  TextButton(
                    onPressed: _busy
                        ? null
                        : () => setState(() {
                              _isSignUp = !_isSignUp;
                              _error = null;
                              _notice = null;
                            }),
                    child: Text(_isSignUp
                        ? 'Already have an account? Sign in'
                        : "New here? Create an account"),
                  ),
                  const Divider(height: 32),
                  TextButton(
                    onPressed: _busy ? null : _continueAsGuest,
                    child: const Text('Continue as guest'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
