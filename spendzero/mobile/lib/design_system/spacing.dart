/// Radius + spacing scale from Lovable `--radius: 1.25rem` (20px) base:
/// sm = radius-4, md = radius-2, lg = radius, xl = radius+4, 2xl = radius+8,
/// 3xl = radius+12 (Tailwind `@theme inline` block in `styles.css`).
class DSRadius {
  DSRadius._();

  static const double sm = 16;
  static const double md = 18;
  static const double lg = 20;
  static const double xl = 24;
  static const double xxl = 28;
  static const double xxxl = 32;

  /// Bottom-sheet handle radius used across the reference (top corners).
  static const double sheet = xxl;
}

/// Tailwind spacing scale (`px-N` = N * 4px) used verbatim across the
/// Lovable routes — keep numeric Tailwind units here so screen code can
/// read `DSSpace.x6` the same way the source reads `px-6`.
class DSSpace {
  DSSpace._();

  static const double x0_5 = 2;
  static const double x1 = 4;
  static const double x1_5 = 6;
  static const double x2 = 8;
  static const double x2_5 = 10;
  static const double x3 = 12;
  static const double x4 = 16;
  static const double x5 = 20;
  static const double x6 = 24;
  static const double x7 = 28;
  static const double x9 = 36;
  static const double x10 = 40;
  static const double x12 = 48;
  static const double x36 = 144;
}
