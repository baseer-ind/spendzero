import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/cart_repository.dart';
import '../data/category_repository.dart';
import '../data/craving_repository.dart';
import '../data/demo_data.dart';
import '../data/feedback_repository.dart';
import '../data/goal_repository.dart';
import '../data/stats_repository.dart';
import '../models/cart.dart';
import '../models/category.dart';
import '../models/goal.dart';
import '../models/listing.dart';
import '../models/user_stats.dart';
import '../network/api_client.dart';
import '../network/device_id.dart';

/// True whenever the backend was unreachable and the app fell back to
/// bundled demo data instead of showing a broken screen. Watched by
/// [demoModeRetryProvider] to periodically retry the live API in the
/// background, and by the UI to show a "Demo Mode" hint.
final demoModeProvider = StateProvider<bool>((ref) => false);

/// Kept alive for the lifetime of the app (watched once in `app.dart`).
/// While [demoModeProvider] is true, periodically re-invalidates the
/// data providers so the app seamlessly switches back to live data the
/// moment the backend becomes reachable again.
final demoModeRetryProvider = Provider<void>((ref) {
  Timer? timer;
  ref.listen<bool>(demoModeProvider, (previous, isDemo) {
    if (isDemo) {
      timer ??= Timer.periodic(const Duration(seconds: 15), (_) {
        ref.invalidate(categoriesProvider);
        ref.invalidate(goalsProvider);
        ref.invalidate(statsProvider);
      });
    } else {
      timer?.cancel();
      timer = null;
    }
  }, fireImmediately: true);
  ref.onDispose(() => timer?.cancel());
});

final deviceIdProvider = FutureProvider<String>((ref) => getOrCreateDeviceId());

final apiClientProvider = FutureProvider<ApiClient>((ref) async {
  final deviceId = await ref.watch(deviceIdProvider.future);
  return ApiClient(deviceId: deviceId);
});

final categoryRepositoryProvider = FutureProvider<CategoryRepository>((ref) async {
  final client = await ref.watch(apiClientProvider.future);
  return CategoryRepository(client);
});

final goalRepositoryProvider = FutureProvider<GoalRepository>((ref) async {
  final client = await ref.watch(apiClientProvider.future);
  return GoalRepository(client);
});

final cravingRepositoryProvider = FutureProvider<CravingRepository>((ref) async {
  final client = await ref.watch(apiClientProvider.future);
  return CravingRepository(client);
});

final categoriesProvider = FutureProvider<List<SpendCategory>>((ref) async {
  try {
    final repo = await ref.watch(categoryRepositoryProvider.future);
    final result = await repo.fetchCategories();
    ref.read(demoModeProvider.notifier).state = false;
    return result;
  } catch (_) {
    ref.read(demoModeProvider.notifier).state = true;
    return demoCategories;
  }
});

final goalsProvider = FutureProvider<List<SavingsGoal>>((ref) async {
  try {
    final repo = await ref.watch(goalRepositoryProvider.future);
    return await repo.fetchGoals();
  } catch (_) {
    ref.read(demoModeProvider.notifier).state = true;
    return demoGoals;
  }
});

final categoryListingsProvider =
    FutureProvider.family<List<Listing>, String>((ref, categoryId) async {
  try {
    final repo = await ref.watch(categoryRepositoryProvider.future);
    return await repo.fetchListings(categoryId);
  } catch (_) {
    ref.read(demoModeProvider.notifier).state = true;
    return demoListingsFor(categoryId);
  }
});

/// (categoryId, search query) — kept separate from [categoryListingsProvider]
/// so the unfiltered list stays cached while the user types a search term.
final categoryListingsSearchProvider =
    FutureProvider.family<List<Listing>, (String, String)>((ref, args) async {
  final (categoryId, query) = args;
  try {
    final repo = await ref.watch(categoryRepositoryProvider.future);
    return await repo.fetchListings(categoryId, query: query);
  } catch (_) {
    ref.read(demoModeProvider.notifier).state = true;
    final lowerQuery = query.toLowerCase();
    return demoListingsFor(categoryId)
        .where((listing) => listing.title.toLowerCase().contains(lowerQuery))
        .toList();
  }
});

final cartRepositoryProvider = FutureProvider<CartRepository>((ref) async {
  final client = await ref.watch(apiClientProvider.future);
  return CartRepository(client);
});

final cartProvider = FutureProvider.family<Cart, String>((ref, categoryId) async {
  final repo = await ref.watch(cartRepositoryProvider.future);
  return repo.fetchCart(categoryId);
});

final statsRepositoryProvider = FutureProvider<StatsRepository>((ref) async {
  final client = await ref.watch(apiClientProvider.future);
  return StatsRepository(client);
});

final statsProvider = FutureProvider<UserStats>((ref) async {
  try {
    final repo = await ref.watch(statsRepositoryProvider.future);
    return await repo.fetchStats();
  } catch (_) {
    ref.read(demoModeProvider.notifier).state = true;
    return demoStats;
  }
});

final feedbackRepositoryProvider = FutureProvider<FeedbackRepository>((ref) async {
  final client = await ref.watch(apiClientProvider.future);
  final deviceId = await ref.watch(deviceIdProvider.future);
  return FeedbackRepository(client, deviceId);
});

/// Pings `/health` so the diagnostics screen can show a live API status
/// instead of just the configured base URL.
final apiHealthProvider = FutureProvider<bool>((ref) async {
  final client = await ref.watch(apiClientProvider.future);
  try {
    final result = await client.get('/health') as Map<String, dynamic>;
    return result['status'] == 'ok';
  } catch (_) {
    return false;
  }
});
