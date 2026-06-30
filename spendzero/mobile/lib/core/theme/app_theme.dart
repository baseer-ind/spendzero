import 'package:flutter/material.dart';

/// Design tokens per docs/07-design-system.md. App-shell palette only —
/// per-brand accents are applied within category screens, not here.
class AppTheme {
  static const Color primary = Color(0xFF1E8E6B); // Project Future Green
  static const Color secondary = Color(0xFFFFB23F); // Warm Amber
  static const Color cravingCompletedAccent = Color(0xFFFF6F61); // Coral

  static const _pageTransitions = PageTransitionsTheme(
    builders: {
      TargetPlatform.android: _PremiumPageTransitionsBuilder(),
      TargetPlatform.iOS: _PremiumPageTransitionsBuilder(),
    },
  );

  static TextTheme _textTheme(ColorScheme colors) {
    final base = Typography.material2021(platform: TargetPlatform.android)
        .black
        .apply(displayColor: colors.onSurface, bodyColor: colors.onSurface);
    return base.copyWith(
      displayLarge: base.displayLarge?.copyWith(fontWeight: FontWeight.w700, letterSpacing: -1.5),
      displayMedium: base.displayMedium?.copyWith(fontWeight: FontWeight.w700, letterSpacing: -1),
      headlineMedium: base.headlineMedium?.copyWith(fontWeight: FontWeight.w700, letterSpacing: -0.5),
      headlineSmall: base.headlineSmall?.copyWith(fontWeight: FontWeight.w700, letterSpacing: -0.3),
      titleLarge: base.titleLarge?.copyWith(fontWeight: FontWeight.w700, letterSpacing: -0.2),
      titleMedium: base.titleMedium?.copyWith(fontWeight: FontWeight.w600),
      labelLarge: base.labelLarge?.copyWith(fontWeight: FontWeight.w600, letterSpacing: 0.1),
      bodyLarge: base.bodyLarge?.copyWith(height: 1.4),
      bodyMedium: base.bodyMedium?.copyWith(height: 1.4),
    );
  }

  static ThemeData _build(ColorScheme colors) {
    final textTheme = _textTheme(colors);
    return ThemeData(
      useMaterial3: true,
      colorScheme: colors,
      scaffoldBackgroundColor: colors.surface,
      textTheme: textTheme,
      pageTransitionsTheme: _pageTransitions,
      splashFactory: InkSparkle.splashFactory,
      visualDensity: VisualDensity.standard,
      appBarTheme: AppBarTheme(
        backgroundColor: colors.surface,
        foregroundColor: colors.onSurface,
        elevation: 0,
        scrolledUnderElevation: 0.5,
        centerTitle: false,
        titleTextStyle: textTheme.titleLarge?.copyWith(fontSize: 20),
      ),
      cardTheme: CardTheme(
        elevation: 0,
        color: colors.surfaceContainerHighest.withOpacity(0.6),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        clipBehavior: Clip.antiAlias,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          textStyle: textTheme.labelLarge,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          side: BorderSide(color: colors.outlineVariant),
          textStyle: textTheme.labelLarge,
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: colors.surfaceContainerHighest,
        selectedColor: colors.primaryContainer,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        side: BorderSide.none,
        labelStyle: textTheme.labelLarge?.copyWith(fontSize: 13),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colors.surfaceContainerHighest.withOpacity(0.5),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: colors.primary,
        linearTrackColor: colors.surfaceContainerHighest,
      ),
      dividerTheme: DividerThemeData(color: colors.outlineVariant.withOpacity(0.5)),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: colors.surface,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        showDragHandle: true,
      ),
    );
  }

  static ThemeData get light => _build(
        ColorScheme.fromSeed(seedColor: primary, secondary: secondary, brightness: Brightness.light),
      );

  static ThemeData get dark => _build(
        ColorScheme.fromSeed(seedColor: primary, secondary: secondary, brightness: Brightness.dark),
      );
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
