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
import '../features/shopping/presentation/brand_screen.dart';
import '../features/shopping/presentation/shopping_home_screen.dart';
import '../features/onboarding/presentation/splash_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(path: '/splash', builder: (context, state) => const SplashScreen()),
    GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
    GoRoute(path: '/goals', builder: (context, state) => const GoalsScreen()),
    GoRoute(
      path: '/checkout/:categoryId',
      builder: (context, state) => CheckoutScreen(category: state.extra as SpendCategory),
    ),
    GoRoute(
      path: '/food/:categoryId',
      builder: (context, state) => FoodHomeScreen(category: state.extra as SpendCategory),
    ),
    GoRoute(
      path: '/food/:categoryId/restaurant/:restaurantId',
      builder: (context, state) => RestaurantScreen(
        categoryId: state.pathParameters['categoryId']!,
        restaurantId: state.pathParameters['restaurantId']!,
      ),
    ),
    GoRoute(
      path: '/grocery/:categoryId',
      builder: (context, state) => GroceryHomeScreen(category: state.extra as SpendCategory),
    ),
    GoRoute(
      path: '/grocery/:categoryId/store/:storeId',
      builder: (context, state) => StoreScreen(
        categoryId: state.pathParameters['categoryId']!,
        storeId: state.pathParameters['storeId']!,
      ),
    ),
    GoRoute(
      path: '/shopping/:categoryId',
      builder: (context, state) => ShoppingHomeScreen(category: state.extra as SpendCategory),
    ),
    GoRoute(
      path: '/shopping/:categoryId/brand/:brandId',
      builder: (context, state) => BrandScreen(
        categoryId: state.pathParameters['categoryId']!,
        brandId: state.pathParameters['brandId']!,
      ),
    ),
    GoRoute(
      path: '/craving-completed',
      builder: (context, state) =>
          CravingCompletedScreen(result: state.extra as CravingCompleted),
    ),
    GoRoute(path: '/diagnostics', builder: (context, state) => const DiagnosticsScreen()),
  ],
);
