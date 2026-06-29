import 'package:go_router/go_router.dart';

import '../core/models/category.dart';
import '../core/models/craving_completed.dart';
import '../features/checkout/presentation/checkout_screen.dart';
import '../features/checkout/presentation/craving_completed_screen.dart';
import '../features/diagnostics/presentation/diagnostics_screen.dart';
import '../features/goals/presentation/goals_screen.dart';
import '../features/home/presentation/home_screen.dart';
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
      path: '/craving-completed',
      builder: (context, state) =>
          CravingCompletedScreen(result: state.extra as CravingCompleted),
    ),
    GoRoute(path: '/diagnostics', builder: (context, state) => const DiagnosticsScreen()),
  ],
);
