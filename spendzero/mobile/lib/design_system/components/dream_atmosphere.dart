import 'dart:math' as math;
import 'package:flutter/widgets.dart';

import '../colors.dart';

/// There is no bundled photography per user-created dream (titles are
/// free text — "My Japan Trip", "The MacBook" — so we can't ship a stock
/// photo per dream the way the Lovable mock can for its two fixed
/// examples). This paints a deterministic, dream-specific atmospheric
/// gradient + grain field instead of a flat color box, so every dream still
/// reads as a richly art-directed "place", not a placeholder swatch.
class DreamAtmosphere extends StatelessWidget {
  const DreamAtmosphere({super.key, required this.seed});

  final String seed;

  @override
  Widget build(BuildContext context) {
    final palette = _paletteFor(seed);
    return CustomPaint(
      painter: _AtmospherePainter(palette: palette, seed: seed.hashCode),
      child: const SizedBox.expand(),
    );
  }
}

List<Color> _paletteFor(String seed) {
  const palettes = [
    [Color(0xFF2A1E3D), Color(0xFF4A2F5C), Color(0xFFD8B36A)],
    [Color(0xFF12222E), Color(0xFF1F3B4D), Color(0xFF4DA3FF)],
    [Color(0xFF2E1A1A), Color(0xFF4A2A23), Color(0xFFE8CC94)],
    [Color(0xFF12241F), Color(0xFF1E3A30), Color(0xFFD8B36A)],
    [Color(0xFF231830), Color(0xFF3C2750), Color(0xFF8C9EFF)],
  ];
  final i = seed.hashCode.abs() % palettes.length;
  return palettes[i];
}

class _AtmospherePainter extends CustomPainter {
  _AtmospherePainter({required this.palette, required this.seed});

  final List<Color> palette;
  final int seed;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final base = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [palette[0], palette[1]],
      ).createShader(rect);
    canvas.drawRect(rect, base);

    final rng = math.Random(seed);
    for (var i = 0; i < 5; i++) {
      final cx = rng.nextDouble() * size.width;
      final cy = rng.nextDouble() * size.height * 0.7;
      final radius = size.shortestSide * (0.25 + rng.nextDouble() * 0.3);
      final glow = Paint()
        ..shader = RadialGradient(
          colors: [palette[2].withOpacity(0.22), palette[2].withOpacity(0.0)],
        ).createShader(Rect.fromCircle(center: Offset(cx, cy), radius: radius));
      canvas.drawCircle(Offset(cx, cy), radius, glow);
    }

    final vignette = Paint()
      ..shader = RadialGradient(
        center: Alignment.center,
        radius: 1.1,
        colors: [const Color(0x00000000), DSColors.background.withOpacity(0.55)],
      ).createShader(rect);
    canvas.drawRect(rect, vignette);
  }

  @override
  bool shouldRepaint(covariant _AtmospherePainter oldDelegate) =>
      oldDelegate.palette != palette || oldDelegate.seed != seed;
}
