import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app/app.dart';
import 'core/config/supabase_config.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Supabase powers sign-in (email + Google). Failing to initialize must not
  // brick the app — guest mode works without it — so we guard it.
  try {
    await Supabase.initialize(
      url: SupabaseConfig.url,
      anonKey: SupabaseConfig.anonKey,
    );
  } catch (e) {
    debugPrint('Supabase init failed (auth disabled, guest mode still works): $e');
  }

  // Placeholder crash hook: no Sentry/Crashlytics SDK is wired up yet (see
  // docs/22-release-readiness.md). Until then, at least surface uncaught
  // errors in release builds instead of silently swallowing them — this is
  // the single line to replace with a real reporter's capture call.
  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    if (kReleaseMode) {
      debugPrint('Uncaught error: ${details.exceptionAsString()}');
    }
  };
  runApp(const ProviderScope(child: ProjectFutureApp()));
}
