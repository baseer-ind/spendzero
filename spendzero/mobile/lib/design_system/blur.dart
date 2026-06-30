import 'dart:ui';

/// Backdrop-blur sigmas matching Tailwind's `backdrop-blur-*` scale and the
/// explicit `backdrop-filter: blur(20px)` on the bottom nav.
class DSBlur {
  DSBlur._();

  static const double md = 12; // backdrop-blur-md (status chips)
  static const double xl = 20; // backdrop-blur-xl / explicit blur(20px) on nav

  static ImageFilter filter(double sigma) =>
      ImageFilter.blur(sigmaX: sigma, sigmaY: sigma);
}
