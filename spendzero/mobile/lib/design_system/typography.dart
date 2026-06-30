import 'package:flutter/widgets.dart';

import 'colors.dart';

/// Typography primitives matching Lovable's `font-display` (Fraunces) /
/// `font-sans` (Inter) split and the exact px sizes used in `index.tsx`
/// and sibling routes. Tailwind's arbitrary `text-[Npx]` values map 1:1 to
/// `fontSize: N`. Use these factories instead of `Theme.of(context).textTheme`
/// so every screen draws from the same exact-pixel source.
class DSType {
  DSType._();

  static const String display = 'Fraunces';
  static const String sans = 'Inter';

  static TextStyle display_(
    double size, {
    FontWeight weight = FontWeight.w600,
    double? height,
    double letterSpacing = -0.4,
    Color color = DSColors.foreground,
    FontStyle style = FontStyle.normal,
  }) {
    return TextStyle(
      fontFamily: display,
      fontSize: size,
      fontWeight: weight,
      height: height ?? 1.05,
      letterSpacing: letterSpacing,
      color: color,
      fontStyle: style,
    );
  }

  static TextStyle sans_(
    double size, {
    FontWeight weight = FontWeight.w400,
    double? height,
    double letterSpacing = 0,
    Color color = DSColors.foreground,
  }) {
    return TextStyle(
      fontFamily: sans,
      fontSize: size,
      fontWeight: weight,
      height: height,
      letterSpacing: letterSpacing,
      color: color,
    );
  }

  /// `text-[11px] uppercase tracking-[0.28em]` — eyebrow/overline labels.
  static TextStyle eyebrow({
    double size = 11,
    double trackingEm = 0.28,
    Color color = DSColors.mutedForeground,
    FontWeight weight = FontWeight.w500,
  }) {
    return sans_(size, weight: weight, letterSpacing: size * trackingEm, color: color);
  }
}
