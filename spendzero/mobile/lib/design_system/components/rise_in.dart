import 'package:flutter/widgets.dart';

import '../motion.dart';

/// Reproduces `animate-rise`: fade + translateY(14px) entrance, played once
/// on mount with an optional stagger delay (matches `animationDelay` in ms
/// on each Home section).
class RiseIn extends StatefulWidget {
  const RiseIn({super.key, required this.child, this.delayMs = 0});

  final Widget child;
  final int delayMs;

  @override
  State<RiseIn> createState() => _RiseInState();
}

class _RiseInState extends State<RiseIn> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _opacity;
  late final Animation<double> _translate;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: DSMotion.riseDuration);
    final curved = CurvedAnimation(parent: _controller, curve: DSMotion.riseCurve);
    _opacity = curved;
    _translate = Tween<double>(begin: DSMotion.riseTranslateY, end: 0).animate(curved);
    Future.delayed(Duration(milliseconds: widget.delayMs), () {
      if (mounted) _controller.forward();
    });
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
      builder: (context, child) => Opacity(
        opacity: _opacity.value.clamp(0.0, 1.0),
        child: Transform.translate(offset: Offset(0, _translate.value), child: child),
      ),
      child: widget.child,
    );
  }
}
