import 'dart:math';

import 'package:flutter/material.dart';

/// Lightweight, dependency-free confetti burst used to make "Craving
/// Completed" feel like a real celebration rather than a receipt screen.
/// Plays once on mount and disposes itself — no external package needed.
class ConfettiBurst extends StatefulWidget {
  const ConfettiBurst({super.key, this.particleCount = 60});

  final int particleCount;

  @override
  State<ConfettiBurst> createState() => _ConfettiBurstState();
}

class _Particle {
  _Particle(Random random)
      : color = _palette[random.nextInt(_palette.length)],
        xStart = random.nextDouble(),
        fallDelay = random.nextDouble() * 0.3,
        fallDuration = 0.5 + random.nextDouble() * 0.4,
        drift = (random.nextDouble() - 0.5) * 0.4,
        size = 6 + random.nextDouble() * 6,
        spinSpeed = (random.nextDouble() - 0.5) * 10;

  static const _palette = [
    Color(0xFFFFC857),
    Color(0xFFFF6B6B),
    Color(0xFF4ECDC4),
    Color(0xFF7B61FF),
    Color(0xFF06D6A0),
  ];

  final Color color;
  final double xStart;
  final double fallDelay;
  final double fallDuration;
  final double drift;
  final double size;
  final double spinSpeed;
}

class _ConfettiBurstState extends State<ConfettiBurst> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final List<_Particle> _particles;

  @override
  void initState() {
    super.initState();
    final random = Random();
    _particles = List.generate(widget.particleCount, (_) => _Particle(random));
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))
      ..forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) => CustomPaint(
          painter: _ConfettiPainter(_particles, _controller.value),
          size: Size.infinite,
        ),
      ),
    );
  }
}

class _ConfettiPainter extends CustomPainter {
  _ConfettiPainter(this.particles, this.t);

  final List<_Particle> particles;
  final double t;

  @override
  void paint(Canvas canvas, Size size) {
    for (final p in particles) {
      final localT = ((t - p.fallDelay) / p.fallDuration).clamp(0.0, 1.0);
      if (localT <= 0) continue;
      final opacity = localT > 0.8 ? (1 - localT) * 5 : 1.0;
      final dx = (p.xStart + p.drift * localT) * size.width;
      final dy = localT * (size.height * 0.7);
      final paint = Paint()..color = p.color.withOpacity(opacity.clamp(0, 1));
      canvas.save();
      canvas.translate(dx, dy);
      canvas.rotate(localT * p.spinSpeed);
      canvas.drawRect(Rect.fromCenter(center: Offset.zero, width: p.size, height: p.size * 0.6), paint);
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant _ConfettiPainter oldDelegate) => true;
}
