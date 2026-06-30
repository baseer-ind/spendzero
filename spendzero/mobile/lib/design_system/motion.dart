import 'package:flutter/animation.dart';

/// Motion vocabulary lifted verbatim from `styles.css` keyframes.
class DSMotion {
  DSMotion._();

  /// `animate-rise`: fade + translateY(14px), 0.9s, cubic-bezier(.2,.7,.2,1).
  static const Duration riseDuration = Duration(milliseconds: 900);
  static const Curve riseCurve = Cubic(0.2, 0.7, 0.2, 1.0);
  static const double riseTranslateY = 14;

  /// Stagger delays used by Home sections (`animationDelay`), in ms.
  static const int riseDelayGreeting = 0;
  static const int riseDelayHero = 120;
  static const int riseDelayNudge = 240;
  static const int riseDelayCollection = 340;
  static const int riseDelayMomentum = 440;
  static const int riseDelayWhisper = 560;

  /// `text-shimmer-gold` sweep, 6s linear infinite.
  static const Duration shimmerDuration = Duration(seconds: 6);

  /// `animate-ring`: stroke draws in, 2.2s ease-out.
  static const Duration ringGrowDuration = Duration(milliseconds: 2200);
  static const Curve ringGrowCurve = Curves.easeOut;

  /// `animate-petal`: 12-20s linear infinite fall + rotate (per-petal dur).
  static int petalDurationSeconds(int i) => 12 + ((i * 7) % 8);
  static double petalDelaySeconds(int i) => (i * 1.3) % 14;
}
