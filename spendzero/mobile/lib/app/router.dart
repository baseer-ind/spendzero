import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/models/category.dart';
import '../core/models/craving_completed.dart';
import '../features/checkout/presentation/checkout_screen.dart';
import '../features/checkout/presentation/craving_completed_screen.dart';
import '../features/diagnostics/presentation/diagnostics_screen.dart';
import '../features/food/presentation/food_home_screen.dart';
import '../features/food/presentation/restaurant_screen.dart';
import '../features/goals/presentation/goals_screen.dart';
import '../features/grocery/presentation/grocery_home_screen.dart';
import '../features/grocery/presentation/store_screen.dart';
import '../features/home/presentation/home_screen.dart';
import '../features/onboarding/presentation/splash_screen.dart';
import '../features/shopping/presentation/brand_screen.dart';
import '../features/shopping/presentation/shopping_home_screen.dart';

Page<void> _slide(BuildContext context, GoRouterState state, Widget child) =>
    CustomTransitionPage(
      key: state.pageKey,
      child: child,
      transitionDuration: const Duration(milliseconds: 280),
      reverseTransitionDuration: const Duration(milliseconds: 220),
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        final tween = Tween<Offset>(begin: const Offset(1, 0), end: Offset.zero)
            .chain(CurveTween(curve: Curves.easeOutCubic));
        final fadeTween = Tween<double>(begin: 0.0, end: 1.0)
            .chain(CurveTween(curve: const Interval(0, 0.4)));
        return FadeTransition(
          opacity: animation.drive(fadeTween),
          child: SlideTransition(position: animation.drive(tween), child: child),
        );
      },
    );

final appRouter = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      pageBuilder: (c, s) => _slide(c, s, const SplashScreen()),
    ),
    GoRoute(
      path: '/',
      pageBuilder: (c, s) => _slide(c, s, const HomeScreen()),
    ),
    GoRoute(
      path: '/goals',
      pageBuilder: (c, s) => _slide(c, s, const GoalsScreen()),
    ),
    GoRoute(
      path: '/checkout/:categoryId',
      pageBuilder: (c, s) =>
          _slide(c, s, CheckoutScreen(category: s.extra as SpendCategory)),
    ),
    GoRoute(
      path: '/food/:categoryId',
      pageBuilder: (c, s) =>
          _slide(c, s, FoodHomeScreen(category: s.extra as SpendCategory)),
    ),
    GoRoute(
      path: '/food/:categoryId/restaurant/:restaurantId',
      pageBuilder: (c, s) => _slide(
        c,
        s,
        RestaurantScreen(
          categoryId: s.pathParameters['categoryId']!,
          restaurantId: s.pathParameters['restaurantId']!,
        ),
      ),
    ),
    GoRoute(
      path: '/grocery/:categoryId',
      pageBuilder: (c, s) =>
          _slide(c, s, GroceryHomeScreen(category: s.extra as SpendCategory)),
    ),
    GoRoute(
      path: '/grocery/:categoryId/store/:storeId',
      pageBuilder: (c, s) => _slide(
        c,
        s,
        StoreScreen(
          categoryId: s.pathParameters['categoryId']!,
          storeId: s.pathParameters['storeId']!,
        ),
      ),
    ),
    GoRoute(
      path: '/shopping/:categoryId',
      pageBuilder: (c, s) =>
          _slide(c, s, ShoppingHomeScreen(category: s.extra as SpendCategory)),
    ),
    GoRoute(
      path: '/shopping/:categoryId/brand/:brandId',
      pageBuilder: (c, s) => _slide(
        c,
        s,
        BrandScreen(
          categoryId: s.pathParameters['categoryId']!,
          brandId: s.pathParameters['brandId']!,
        ),
      ),
    ),
    GoRoute(
      path: '/craving-completed',
      pageBuilder: (c, s) =>
          _slide(c, s, CravingCompletedScreen(result: s.extra as CravingCompleted)),
    ),
    GoRoute(
      path: '/diagnostics',
      pageBuilder: (c, s) => _slide(c, s, const DiagnosticsScreen()),
    ),
  ],
);
