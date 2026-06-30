import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app/app.dart';

void main() {
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
