import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../design_system/blur.dart';
import '../design_system/colors.dart';
import '../design_system/gradients.dart';
import '../design_system/shadows.dart';
import '../design_system/typography.dart';

/// Persistent bottom navigation per the Experience Blueprint's information
/// architecture: Home, My Future, Journey, Profile. "My Future" — not
/// "Dashboard" — is the emotional center of the app.
///
/// Visual treatment matches the Lovable reference's floating glass pill nav
/// (`Shell.tsx` `BottomNav`) — structure/routes are unchanged, only the look.
class RootShell extends StatelessWidget {
  const RootShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  static const _items = ['Today', 'Future', 'Journey', 'Me'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: navigationShell,
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(20, 0, 20, 16),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: BackdropFilter(
            filter: DSBlur.filter(DSBlur.xl),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              decoration: BoxDecoration(
                gradient: DSGradients.navGlass,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: DSColors.whiteOpacity(0.1)),
                boxShadow: DSShadows.bottomNav,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  for (var i = 0; i < _items.length; i++)
                    _NavItem(
                      label: _items[i],
                      selected: navigationShell.currentIndex == i,
                      onTap: () => navigationShell.goBranch(
                        i,
                        initialLocation: i == navigationShell.currentIndex,
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? DSColors.foreground : DSColors.mutedForegroundOpacity(0.7);
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label.toUpperCase(),
              style: DSType.sans_(11, weight: FontWeight.w500, letterSpacing: 1.98, color: color),
            ),
            const SizedBox(height: 6),
            SizedBox(
              height: 4,
              width: 4,
              child: selected
                  ? const DecoratedBox(
                      decoration: BoxDecoration(shape: BoxShape.circle, color: DSColors.gold),
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}
