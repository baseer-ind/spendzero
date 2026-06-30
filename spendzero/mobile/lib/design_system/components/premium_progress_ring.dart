import 'dart:math' as math;
import 'package:flutter/widgets.dart';

import '../colors.dart';
import '../motion.dart';
import '../typography.dart';

/// Reproduces the hero-card SVG `ProgressRing`: r=28 (in a 72x72 viewbox),
/// stroke 4, gold gradient stroke, draw-in animation (`animate-ring`,
/// 2.2s ease-out, stroke-dashoffset from full circumference to the percent
/// offset), centered percent label in Fraunces.
class PremiumProgressRing extends StatefulWidget {
  const PremiumProgressRing({super.key, required this.percent, this.size = 72});

  final int percent;
  final double size;

  @override
  State<PremiumProgressRing> createState() => _PremiumProgressRingState();
}

class _PremiumProgressRingState extends State<PremiumProgressRing>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _sweep;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: DSMotion.ringGrowDuration);
    _sweep = CurvedAnimation(parent: _controller, curve: DSMotion.ringGrowCurve);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          return CustomPaint(
            painter: _RingPainter(percent: widget.percent, progress: _sweep.value),
            child: Center(
              child: Text(
                '${widget.percent}%',
                style: DSType.display_(15, weight: FontWeight.w600, color: DSColors.foreground),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  _RingPainter({required this.percent, required this.progress});

  final int percent;
  final double progress;

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final r = (size.shortestSide / 2) * (28 / 36);
    final strokeWidth = (size.shortestSide / 36) * 4;

    final track = Paint()
      ..color = const Color(0x1FFFFFFF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;
    canvas.drawCircle(center, r, track);

    final fraction = (percent / 100).clamp(0.0, 1.0) * progress;
    final sweepAngle = fraction * 2 * math.pi;
    final shader = const LinearGradient(
      colors: [Color(0xFFF3DFA6), DSColors.gold],
    ).createShader(Rect.fromCircle(center: center, radius: r));
    final arc = Paint()
      ..shader = shader
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: r),
      -math.pi / 2,
      sweepAngle,
      false,
      arc,
    );
  }

  @override
  bool shouldRepaint(covariant _RingPainter oldDelegate) =>
      oldDelegate.percent != percent || oldDelegate.progress != progress;
}
