import 'dart:io';

import 'package:flutter/foundation.dart' show kIsWeb;

/// Centralized environment config. Nothing in this app should hardcode a
/// base URL, secret, or key outside this file.
///
/// Resolution order for the API base URL:
///   1. Explicit `--dart-define=API_BASE_URL=...` (e.g. a physical device's
///      LAN address, set automatically by scripts/run_mobile.sh).
///   2. `--dart-define-from-file=env/<name>.json` (development/staging/
///      production — see mobile/env/).
///   3. A sane per-platform fallback so `flutter run` "just works" on an
///      emulator/simulator with zero flags: 10.0.2.2 for the Android
///      emulator (its alias for the host loopback interface), localhost
///      everywhere else (iOS simulator and desktop share the host network).
///
/// Physical devices are the one case nothing here can infer automatically
/// — there is no way for the device to know the dev machine's LAN IP — so
/// scripts/run_mobile.sh detects that machine's IP and passes it via flag 1.
class Env {
  static const String envName = String.fromEnvironment('ENV_NAME', defaultValue: 'development');

  static const String _explicitApiBaseUrl = String.fromEnvironment('API_BASE_URL');

  static String get apiBaseUrl {
    if (_explicitApiBaseUrl.isNotEmpty) return _explicitApiBaseUrl;
    if (!kIsWeb && Platform.isAndroid) return 'http://10.0.2.2:8000/api/v1';
    return 'http://localhost:8000/api/v1';
  }

  static bool get isProduction => envName == 'production';
  static bool get isStaging => envName == 'staging';
  static bool get isDevelopment => envName == 'development';
}
