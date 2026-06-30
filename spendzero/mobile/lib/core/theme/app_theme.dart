import 'package:flutter/material.dart';

/// Design tokens lifted from the Lovable "Project Future" visual reference
/// (Midnight + Champagne Gold). Per the founder's explicit direction, the
/// Lovable project is the visual source of truth ONLY — business logic,
/// routing, and storage are untouched; only colors/typography/spacing/motion
/// are replaced. The reference design has no separate light variant, so this
/// app is intentionally dark-only.
class AppTheme {
  // Midnight surfaces.
  static const Color background = Color(0xFF0A0B0E);
  static const Color surface = Color(0xFF111318);
  static const Color surfaceElevated = Color(0xFF1A1D24);
  static const Color foreground = Color(0xFFF7F6F2);

  // Champagne gold — primary accent (redirected value, victories, CTAs).
  static const Color gold = Color(0xFFD8B36A);
  static const Color goldSoft = Color(0xFFE8CC94);

  // Electric blue — "future"/secondary accent (progress, My Future).
  static const Color future = Color(0xFF4DA3FF);

  static const Color destructive = Color(0xFFE2553D);
  static const Color mutedForeground = Color(0xFF9A9CA5);
  static const Color border = Color(0x14FFFFFF); // white @ 8%
  static const Color cravingCompletedAccent = gold;

  static const _pageTransitions = PageTransitionsTheme(
    builders: {
      TargetPlatform.android: _PremiumPageTransitionsBuilder(),
      TargetPlatform.iOS: _PremiumPageTransitionsBuilder(),
    },
  );

  static TextTheme get _textTheme {
    const display = 'Fraunces';
    const sans = 'Inter';
    final base = Typography.material2021(platform: TargetPlatform.android)
        .white
        .apply(displayColor: foreground, bodyColor: foreground, fontFamily: sans);
    return base.copyWith(
      displayLarge: base.displayLarge?.copyWith(
          fontFamily: display, fontWeight: FontWeight.w600, letterSpacing: -0.8),
      displayMedium: base.displayMedium?.copyWith(
          fontFamily: display, fontWeight: FontWeight.w600, letterSpacing: -0.6),
      headlineMedium: base.headlineMedium?.copyWith(
          fontFamily: display, fontWeight: FontWeight.w600, letterSpacing: -0.4),
      headlineSmall: base.headlineSmall?.copyWith(
          fontFamily: display, fontWeight: FontWeight.w600, letterSpacing: -0.3),
      titleLarge: base.titleLarge?.copyWith(
          fontFamily: display, fontWeight: FontWeight.w600, letterSpacing: -0.2),
      titleMedium: base.titleMedium?.copyWith(fontWeight: FontWeight.w600),
      labelLarge: base.labelLarge?.copyWith(fontWeight: FontWeight.w600, letterSpacing: 0.2),
      labelSmall: base.labelSmall?.copyWith(letterSpacing: 1.4), // eyebrow/overline labels
      bodyLarge: base.bodyLarge?.copyWith(height: 1.45, color: foreground),
      bodyMedium: base.bodyMedium?.copyWith(height: 1.45, color: mutedForeground),
      bodySmall: base.bodySmall?.copyWith(height: 1.4, color: mutedForeground),
    );
  }

  static ThemeData get _theme {
    final textTheme = _textTheme;
    final colors = ColorScheme.fromSeed(
      seedColor: gold,
      brightness: Brightness.dark,
      surface: surface,
      onSurface: foreground,
      primary: gold,
      onPrimary: background,
      secondary: future,
      onSecondary: background,
      tertiary: goldSoft,
      error: destructive,
    );
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: colors,
      scaffoldBackgroundColor: background,
      textTheme: textTheme,
      fontFamily: 'Inter',
      pageTransitionsTheme: _pageTransitions,
      splashFactory: InkSparkle.splashFactory,
      visualDensity: VisualDensity.standard,
      appBarTheme: AppBarTheme(
        backgroundColor: background,
        foregroundColor: foreground,
        elevation: 0,
        scrolledUnderElevation: 0.5,
        centerTitle: false,
        titleTextStyle: textTheme.titleLarge?.copyWith(fontSize: 20),
      ),
      cardTheme: CardTheme(
        elevation: 0,
        color: surfaceElevated,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: border),
        ),
        clipBehavior: Clip.antiAlias,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: gold,
          foregroundColor: background,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          textStyle: textTheme.labelLarge,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: foreground,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          side: const BorderSide(color: border),
          textStyle: textTheme.labelLarge,
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: surfaceElevated,
        selectedColor: gold.withOpacity(0.18),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(999)),
          side: BorderSide(color: border),
        ),
        side: BorderSide.none,
        labelStyle: textTheme.labelLarge?.copyWith(fontSize: 13),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceElevated,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: border),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: gold,
        linearTrackColor: surfaceElevated,
      ),
      dividerTheme: const DividerThemeData(color: border),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        showDragHandle: true,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: surface,
        indicatorColor: gold.withOpacity(0.16),
        labelTextStyle: WidgetStateProperty.all(
          textTheme.labelSmall?.copyWith(letterSpacing: 0.2, fontSize: 11),
        ),
      ),
    );
  }

  /// The reference design is dark-only — both slots point at the same
  /// midnight theme so the app reads identically regardless of system
  /// brightness setting.
  static ThemeData get light => _theme;
  static ThemeData get dark => _theme;
}

/// A softer, slightly slower fade+scale transition than Material's default —
/// reads as "premium" rather than the stock Android slide-up.
class _PremiumPageTransitionsBuilder extends PageTransitionsBuilder {
  const _PremiumPageTransitionsBuilder();

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    final curved = CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
    return FadeTransition(
      opacity: curved,
      child: ScaleTransition(
        scale: Tween<double>(begin: 0.98, end: 1).animate(curved),
        child: child,
      ),
    );
  }
}
