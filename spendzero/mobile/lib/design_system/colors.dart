import 'package:flutter/widgets.dart';

/// Exact color tokens from the Lovable "Future_You" source
/// (`src/styles.css` `:root`), converted from oklch to sRGB hex.
/// This is the single source of truth for color in the app — do not
/// introduce new colors outside this file.
class DSColors {
  DSColors._();

  static const Color background = Color(0xFF0A0B0E);
  static const Color foreground = Color(0xFFF7F6F2);
  static const Color surface = Color(0xFF111318);
  static const Color surfaceElevated = Color(0xFF1A1D24);
  static const Color card = surface;
  static const Color cardForeground = foreground;
  static const Color popover = surface;

  static const Color primary = foreground;
  static const Color primaryForeground = background;
  static const Color secondary = surfaceElevated;
  static const Color secondaryForeground = foreground;
  static const Color muted = surfaceElevated;
  static const Color mutedForeground = Color(0xFF9A9CA5);
  static const Color accent = surfaceElevated;
  static const Color accentForeground = foreground;

  /// Champagne gold #D8B36A.
  static const Color gold = Color(0xFFD8B36A);
  static const Color goldSoft = Color(0xFFE8CC94);

  /// Electric blue #4DA3FF — "future" accent.
  static const Color future = Color(0xFF4DA3FF);

  static const Color destructive = Color(0xFFE25540);
  static const Color destructiveForeground = Color(0xFFFAFAFA);

  /// white @ 8% — card/input borders.
  static const Color border = Color(0x14FFFFFF);
  static const Color input = Color(0x1FFFFFFF);
  static const Color ring = Color(0x99D8B36A);

  // Convenience opacity helpers used throughout the Lovable markup
  // (foreground/80, white/10, black/30, gold/8, gold/30 etc.).
  static Color foregroundOpacity(double o) => foreground.withOpacity(o);
  static Color whiteOpacity(double o) => const Color(0xFFFFFFFF).withOpacity(o);
  static Color blackOpacity(double o) => const Color(0xFF000000).withOpacity(o);
  static Color goldOpacity(double o) => gold.withOpacity(o);
  static Color mutedForegroundOpacity(double o) => mutedForeground.withOpacity(o);
}
