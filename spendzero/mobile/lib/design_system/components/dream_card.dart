import 'package:flutter/widgets.dart';

import '../colors.dart';
import '../gradients.dart';
import '../spacing.dart';
import '../typography.dart';

/// Reproduces `DreamCard` from `index.tsx`'s `CollectionRow`: a 230x300
/// image card with a bottom scrim, tag/title/amount/percent, and a thin
/// gold progress bar.
class DSDreamCard extends StatelessWidget {
  const DSDreamCard({
    super.key,
    required this.background,
    required this.tag,
    required this.title,
    required this.amount,
    required this.percent,
    this.onTap,
  });

  final Widget background;
  final String tag;
  final String title;
  final String amount;
  final int percent;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 230,
        height: 300,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: DSColors.whiteOpacity(0.1)),
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            background,
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: DSGradients.dreamCardScrim,
                  stops: DSGradients.dreamCardScrimStops,
                ),
              ),
            ),
            Align(
              alignment: Alignment.bottomLeft,
              child: Padding(
                padding: const EdgeInsets.all(DSSpace.x4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(tag, style: DSType.eyebrow(size: 10, color: DSColors.whiteOpacity(0.6))),
                    const SizedBox(height: 4),
                    Text(title, style: DSType.display_(20, color: const Color(0xFFFFFFFF))),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('$amount to go',
                            style: DSType.sans_(12, color: DSColors.whiteOpacity(0.7))),
                        Text('$percent%', style: DSType.sans_(11, color: DSColors.gold)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(2),
                      child: SizedBox(
                        height: 2,
                        child: Stack(
                          children: [
                            Container(color: DSColors.whiteOpacity(0.1)),
                            FractionallySizedBox(
                              widthFactor: (percent / 100).clamp(0.0, 1.0),
                              child: const DecoratedBox(
                                decoration: BoxDecoration(gradient: DSGradients.goldFill),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Reproduces `AddDreamCard`: dashed-border ghost button, 160x300.
class DSAddDreamCard extends StatelessWidget {
  const DSAddDreamCard({super.key, this.onTap});

  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 160,
        height: 300,
        child: CustomPaint(
          painter: _DashedBorderPainter(radius: 22, color: DSColors.whiteOpacity(0.15)),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: DSColors.mutedForegroundOpacity(0.55)),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '+',
                    style: DSType.display_(20, color: DSColors.mutedForegroundOpacity(0.55)),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'NEW FUTURE',
                  style: DSType.eyebrow(size: 12, trackingEm: 0.18, color: DSColors.mutedForegroundOpacity(0.55)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DashedBorderPainter extends CustomPainter {
  _DashedBorderPainter({required this.radius, required this.color});

  final double radius;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final rrect = RRect.fromRectAndRadius(
        Offset.zero & size, Radius.circular(radius));
    final path = Path()..addRRect(rrect);
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    const dashWidth = 5.0;
    const gapWidth = 4.0;
    for (final metric in path.computeMetrics()) {
      double distance = 0;
      while (distance < metric.length) {
        final next = distance + dashWidth;
        canvas.drawPath(metric.extractPath(distance, next.clamp(0, metric.length)), paint);
        distance = next + gapWidth;
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
