import 'package:flutter/widgets.dart';
import 'package:flutter/services.dart';

import '../blur.dart';
import '../colors.dart';
import '../gradients.dart';
import '../shadows.dart';
import '../spacing.dart';
import '../typography.dart';

enum DSNavTab { today, future, journey, me }

/// Reproduces `index.tsx`'s `BottomNav`: a floating glass pill, centered,
/// `max-w-380px`, blurred translucent gradient background, ring border,
/// drop shadow, a gold dot under the active label, and a radial-gradient
/// "+" center action button that floats above the pill.
class GlassBottomNav extends StatelessWidget {
  const GlassBottomNav({
    super.key,
    required this.active,
    required this.onTabSelected,
    required this.onCenterAction,
  });

  final DSNavTab active;
  final ValueChanged<DSNavTab> onTabSelected;
  final VoidCallback onCenterAction;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Padding(
        padding: const EdgeInsets.only(bottom: DSSpace.x5),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 380),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: DSSpace.x4),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: BackdropFilter(
                filter: DSBlur.filter(DSBlur.xl),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: DSSpace.x3, vertical: DSSpace.x2_5),
                  decoration: BoxDecoration(
                    gradient: DSGradients.navGlass,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: DSColors.whiteOpacity(0.1)),
                    boxShadow: DSShadows.bottomNav,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _NavItem(
                        label: 'Today',
                        active: active == DSNavTab.today,
                        onTap: () => onTabSelected(DSNavTab.today),
                      ),
                      _NavItem(
                        label: 'Future',
                        active: active == DSNavTab.future,
                        onTap: () => onTabSelected(DSNavTab.future),
                      ),
                      _CenterAction(onTap: onCenterAction),
                      _NavItem(
                        label: 'Journey',
                        active: active == DSNavTab.journey,
                        onTap: () => onTabSelected(DSNavTab.journey),
                      ),
                      _NavItem(
                        label: 'Me',
                        active: active == DSNavTab.me,
                        onTap: () => onTabSelected(DSNavTab.me),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({required this.label, required this.active, required this.onTap});

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          HapticFeedback.selectionClick();
          onTap();
        },
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: DSSpace.x3, vertical: DSSpace.x2),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: DSType.sans_(
                  11,
                  weight: FontWeight.w500,
                  letterSpacing: 1.98,
                  color: active ? DSColors.foreground : DSColors.mutedForegroundOpacity(0.7),
                ),
              ),
              const SizedBox(height: 6),
              SizedBox(
                height: 4,
                width: 4,
                child: active
                    ? const DecoratedBox(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: DSColors.gold,
                        ),
                      )
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CenterAction extends StatelessWidget {
  const _CenterAction({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.mediumImpact();
        onTap();
      },
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: DSGradients.navCenterAction,
          boxShadow: DSShadows.navCenterAction,
          border: Border.all(color: DSColors.whiteOpacity(0.4)),
        ),
        alignment: Alignment.center,
        child: CustomPaint(size: const Size(20, 20), painter: _PlusPainter()),
      ),
    );
  }
}

class _PlusPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = DSColors.background
      ..strokeWidth = 2.2
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(Offset(size.width / 2, 0), Offset(size.width / 2, size.height), paint);
    canvas.drawLine(Offset(0, size.height / 2), Offset(size.width, size.height / 2), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
