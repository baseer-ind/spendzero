import 'package:flutter/widgets.dart';

import '../gradients.dart';
import '../motion.dart';

/// Reproduces `.text-shimmer-gold`: a gold gradient sweeping across the text
/// fill, looping every 6s linearly, `background-size: 200% 100%`.
class ShimmerGoldText extends StatefulWidget {
  const ShimmerGoldText(this.text, {super.key, required this.style});

  final String text;
  final TextStyle style;

  @override
  State<ShimmerGoldText> createState() => _ShimmerGoldTextState();
}

class _ShimmerGoldTextState extends State<ShimmerGoldText>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: DSMotion.shimmerDuration)
      ..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        // background-position sweeps -200% -> 200% over one loop: slide a
        // gradient twice the text's width left-to-right across it.
        final t = _controller.value;
        return ShaderMask(
          shaderCallback: (bounds) {
            final width = bounds.width;
            final dx = -width * 2 + t * width * 4;
            return LinearGradient(
              colors: DSGradients.textShimmerGold,
              stops: DSGradients.textShimmerStops,
            ).createShader(Rect.fromLTWH(dx, 0, width * 2, bounds.height));
          },
          child: child,
        );
      },
      child: Text(widget.text, style: widget.style),
    );
  }
}
