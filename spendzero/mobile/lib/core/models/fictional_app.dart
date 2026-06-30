import 'package:flutter/material.dart';

/// Represents one fictional app inside a SpendZero vertical (e.g. "Zwigato"
/// inside the Food vertical). Each app has its own brand identity — colors,
/// icon, tagline — and maps to a subset of the vertical's content.
class FictionalApp {
  const FictionalApp({
    required this.id,
    required this.vertical,
    required this.name,
    required this.tagline,
    required this.primaryColor,
    required this.accentColor,
    required this.surfaceColor,
    required this.logoIcon,
    required this.logoBgGradient,
    required this.heroBadge,
    required this.heroOffer,
    required this.entityIds,
  });

  /// Unique identifier, e.g. 'zwigato'.
  final String id;

  /// Vertical this app belongs to: 'food' | 'grocery' | 'shopping' |
  /// 'travel' | 'beauty' | 'electronics'.
  final String vertical;

  final String name;
  final String tagline;

  /// Brand primary color (used as seed for the Material color scheme).
  final Color primaryColor;

  /// Brand accent / highlight color.
  final Color accentColor;

  /// Light surface tint for cards and backgrounds.
  final Color surfaceColor;

  /// Icon drawn inside the app's logo tile.
  final IconData logoIcon;

  /// Two-stop gradient for the logo background (list of two Colors).
  final List<Color> logoBgGradient;

  /// Short promo badge shown on the launcher card, e.g. '🔥 Trending'.
  final String heroBadge;

  /// Offer/hook shown on the launcher card, e.g. '50% off first order'.
  final String heroOffer;

  /// IDs of restaurants / stores / brands belonging to this app.
  final List<String> entityIds;

  /// Derives a full Material 3 ThemeData from this app's primary color.
  ThemeData themeData(Brightness brightness) => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: primaryColor,
          brightness: brightness,
        ),
      );
}
