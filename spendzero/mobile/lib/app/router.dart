import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/models/category.dart';
import '../core/models/craving_completed.dart';
import '../features/app_home/presentation/app_home_screen.dart';
import '../features/beauty/presentation/beauty_home_screen.dart';
import '../features/beauty/presentation/brand_screen.dart' as beauty;
import '../features/movies/presentation/movies_home_screen.dart';
import '../features/movies/presentation/cinema_screen.dart';
import '../features/cart/presentation/cart_screen.dart';
import '../features/checkout/presentation/checkout_screen.dart';
import '../features/checkout/presentation/craving_completed_screen.dart';
import '../features/dashboard/presentation/dashboard_screen.dart';
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
import '../features/travel/presentation/stay_screen.dart';
import '../features/travel/presentation/travel_home_screen.dart';
import '../features/vertical_launcher/presentation/vertical_launcher_screen.dart';

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
      path: '/dashboard',
      pageBuilder: (c, s) => _slide(c, s, const DashboardScreen()),
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
      path: '/beauty/:categoryId',
      pageBuilder: (c, s) =>
          _slide(c, s, BeautyHomeScreen(category: s.extra as SpendCategory)),
    ),
    GoRoute(
      path: '/beauty/:categoryId/brand/:brandId',
      pageBuilder: (c, s) => _slide(
        c,
        s,
        beauty.BrandScreen(
          categoryId: s.pathParameters['categoryId']!,
          brandId: s.pathParameters['brandId']!,
        ),
      ),
    ),
    GoRoute(
      path: '/travel/:categoryId',
      pageBuilder: (c, s) =>
          _slide(c, s, TravelHomeScreen(category: s.extra as SpendCategory)),
    ),
    GoRoute(
      path: '/travel/:categoryId/stay/:stayId',
      pageBuilder: (c, s) => _slide(
        c,
        s,
        StayScreen(
          categoryId: s.pathParameters['categoryId']!,
          stayId: s.pathParameters['stayId']!,
        ),
      ),
    ),
    GoRoute(
      path: '/movies/:categoryId',
      pageBuilder: (c, s) =>
          _slide(c, s, MoviesHomeScreen(category: s.extra as SpendCategory)),
    ),
    GoRoute(
      path: '/movies/:categoryId/cinema/:cinemaId',
      pageBuilder: (c, s) => _slide(
        c,
        s,
        CinemaScreen(
          categoryId: s.pathParameters['categoryId']!,
          cinemaId: s.pathParameters['cinemaId']!,
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
    // ── App-within-app: vertical launcher ──────────────────────────────────
    GoRoute(
      path: '/vertical/:vertical/:categoryId',
      pageBuilder: (c, s) {
        final vertical = s.pathParameters['vertical']!;
        final categoryId = s.pathParameters['categoryId']!;
        final (title, subtitle, icon) = _verticalMeta(vertical);
        return _slide(
          c,
          s,
          VerticalLauncherScreen(
            vertical: vertical,
            categoryId: categoryId,
            title: title,
            subtitle: subtitle,
            headerIcon: icon,
          ),
        );
      },
    ),
    // ── Fictional app home (themed per-app experience) ─────────────────────
    GoRoute(
      path: '/vertical/:vertical/:categoryId/app/:appId',
      pageBuilder: (c, s) => _slide(
        c,
        s,
        AppHomeScreen(
          appId: s.pathParameters['appId']!,
          categoryId: s.pathParameters['categoryId']!,
        ),
      ),
    ),
    // ── Cart ───────────────────────────────────────────────────────────────
    GoRoute(
      path: '/cart',
      pageBuilder: (c, s) => _slide(c, s, const CartScreen()),
    ),
  ],
);

/// Returns (title, subtitle, icon) for a given vertical identifier.
(String, String, IconData) _verticalMeta(String vertical) {
  return switch (vertical) {
    'food' => ('Food Delivery', 'Order from top restaurants', Icons.fastfood),
    'grocery' => ('Grocery', 'Fresh produce delivered fast', Icons.shopping_basket),
    'shopping' => ('Shopping', 'Fashion, electronics & more', Icons.shopping_bag),
    'travel' => ('Travel', 'Flights, hotels & holiday packages', Icons.flight_takeoff),
    'beauty' => ('Beauty', 'Skincare, makeup & wellness', Icons.face_retouching_natural),
    'electronics' => ('Electronics', 'Gadgets & smart devices', Icons.devices),
    _ => (vertical, 'Explore $vertical', Icons.category),
  };
}
