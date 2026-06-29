import 'package:flutter/material.dart';

/// Design tokens per docs/07-design-system.md. App-shell palette only —
/// per-brand accents are applied within category screens, not here.
class AppTheme {
  static const Color primary = Color(0xFF1E8E6B); // SpendZero Green
  static const Color secondary = Color(0xFFFFB23F); // Warm Amber
  static const Color cravingCompletedAccent = Color(0xFFFF6F61); // Coral

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: primary,
          secondary: secondary,
          brightness: Brightness.light,
        ),
      );

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: primary,
          secondary: secondary,
          brightness: Brightness.dark,
        ),
      );
}
