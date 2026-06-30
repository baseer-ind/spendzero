import 'package:flutter/widgets.dart';

import 'colors.dart';

/// Gradients reproduced exactly from inline `style={{ background: ... }}`
/// in the Lovable source.
class DSGradients {
  DSGradients._();

  /// Home ambient wash:
  /// radial(120% 60% at 50% 0%, gold/10, transparent 60%),
  /// radial(80% 40% at 20% 100%, future/8, transparent 70%).
  static const Color ambientGold = Color(0x1AD8B36A); // gold @ 10%
  static const Color ambientFuture = Color(0x144DA3FF); // future @ 8%

  /// Hero image scrim:
  /// linear 180deg, bg 15% -> 25% (35%) -> 85% (78%) -> 98% (100%).
  static const List<Color> heroScrim = [
    Color(0x260A0B0E), // 15%
    Color(0x400A0B0E), // 25%
    Color(0xD90A0B0E), // 85%
    Color(0xFA0A0B0E), // 98%
  ];
  static const List<double> heroScrimStops = [0.0, 0.35, 0.78, 1.0];

  /// Dream card scrim: linear 180deg, 5% -> 55% (60%) -> 95% (100%).
  static const List<Color> dreamCardScrim = [
    Color(0x0D0A0B0E),
    Color(0x8C0A0B0E),
    Color(0xF20A0B0E),
  ];
  static const List<double> dreamCardScrimStops = [0.0, 0.6, 1.0];

  /// Gold progress fill: linear 90deg, gold -> #f3dfa6.
  static const LinearGradient goldFill = LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [DSColors.gold, Color(0xFFF3DFA6)],
  );

  /// Bottom nav center-action radial button.
  static const RadialGradient navCenterAction = RadialGradient(
    center: Alignment(-0.4, -0.4),
    colors: [Color(0xFFF5E1AA), DSColors.gold, Color(0xFFA8853D)],
    stops: [0.0, 0.55, 1.0],
  );

  /// Hero card "Active Dream" open-button radial accent (NavBar variant).
  static const RadialGradient heroOpenAccent = RadialGradient(
    center: Alignment(-0.4, -0.4),
    colors: [Color(0xFFEBC98C), Color(0xFFB8923F)],
  );

  /// Bottom nav glass background: linear 180deg surfaceElevated/85 -> surface/85.
  static const LinearGradient navGlass = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xD91A1D24), Color(0xD9111318)],
  );

  /// Weekly momentum bar: non-peak day fill.
  static const LinearGradient momentumBarIdle = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0x40FFFFFF), Color(0x14FFFFFF)],
  );

  /// Weekly momentum bar: peak day fill.
  static const LinearGradient momentumBarPeak = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [DSColors.gold, Color(0xFFB8923F)],
  );

  /// `text-shimmer-gold`: gold-soft -> gold -> #fff3d6 -> gold -> gold-soft.
  static const List<Color> textShimmerGold = [
    DSColors.goldSoft,
    DSColors.gold,
    Color(0xFFFFF3D6),
    DSColors.gold,
    DSColors.goldSoft,
  ];
  static const List<double> textShimmerStops = [0.0, 0.4, 0.5, 0.6, 1.0];
}
