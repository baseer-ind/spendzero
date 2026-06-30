import 'package:flutter/widgets.dart';

import '../motion.dart';

/// Reproduces `Petals`/`animate-petal`: 9 small radial-gradient circles
/// falling top-to-bottom with rotation, looping 12-20s each, staggered
/// delays, used as ambient texture over the hero dream photo.
class FallingPetals extends StatefulWidget {
  const FallingPetals({super.key, this.count = 9});

  final int count;

  @override
  State<FallingPetals> createState() => _FallingPetalsState();
}

class _FallingPetalsState extends State<FallingPetals>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 20))
      ..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: ClipRect(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, _) {
            return Stack(
              children: List.generate(widget.count, (i) {
                final left = ((i * 11 + 7) % 100) / 100;
                final delay = DSMotion.petalDelaySeconds(i);
                final dur = DSMotion.petalDurationSeconds(i).toDouble();
                final size = (6 + ((i * 3) % 5)).toDouble();
                final elapsed = _controller.value * 20;
                final localT = ((elapsed - delay) % dur) / dur;
                if (localT < 0) return const SizedBox.shrink();
                final top = -0.1 + localT * 1.2;
                final dx = localT * 40;
                final opacity = localT < 0.1
                    ? (localT / 0.1) * 0.8
                    : (localT > 0.9 ? (1 - localT) / 0.1 * 0.8 : 0.7);
                return Positioned.fill(
                  child: FractionalTranslation(
                    translation: Offset(0, top),
                    child: Align(
                      alignment: Alignment(left * 2 - 1, -1),
                      child: Transform.translate(
                        offset: Offset(dx, 0),
                        child: Transform.rotate(
                          angle: localT * 6.28319,
                          child: Opacity(
                            opacity: opacity.clamp(0.0, 1.0),
                            child: Container(
                              width: size,
                              height: size,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: RadialGradient(
                                  center: Alignment(-0.4, -0.4),
                                  colors: [
                                    Color(0xFFFFD2E0),
                                    Color(0xFFE89BB4),
                                    Color(0x00E89BB4),
                                  ],
                                  stops: [0.0, 0.7, 0.71],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }),
            );
          },
        ),
      ),
    );
  }
}
