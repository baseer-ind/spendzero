import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/contracts.dart';
import '../data/local/local_cart_repository.dart';
import '../data/local/local_category_repository.dart';
import '../data/local/local_craving_repository.dart';
import '../data/local/local_feedback_repository.dart';
import '../data/local/local_goal_repository.dart';
import '../data/local/local_stats_repository.dart';
import '../data/local/local_store.dart';
import '../data/remote/cart_repository.dart';
import '../data/remote/category_repository.dart';
import '../data/remote/craving_repository.dart';
import '../data/remote/feedback_repository.dart';
import '../data/remote/goal_repository.dart';
import '../data/remote/stats_repository.dart';
import '../models/cart.dart';
import '../models/category.dart';
import '../models/goal.dart';
import '../models/listing.dart';
import '../models/user_stats.dart';
import '../network/api_client.dart';
import '../network/device_id.dart';

/// Single switch point: true uses on-device SharedPreferences-backed
/// repositories (the V1 MVP default — no backend required), false uses
/// the FastAPI-backed `Api*Repository` implementations kept in `remote/`
/// for when a backend is wired back in.
const useLocalBackend = true;

final localStoreProvider = Provider<LocalStore>((ref) => LocalStore());

final deviceIdProvider = FutureProvider<String>((ref) => getOrCreateDeviceId());

final apiClientProvider = FutureProvider<ApiClient>((ref) async {
  final deviceId = await ref.watch(deviceIdProvider.future);
  return ApiClient(deviceId: deviceId);
});

final categoryRepositoryProvider = FutureProvider<CategoryRepository>((ref) async {
  if (useLocalBackend) {
    return LocalCategoryRepository();
  }
  final client = await ref.watch(apiClientProvider.future);
  return ApiCategoryRepository(client);
});

final goalRepositoryProvider = FutureProvider<GoalRepository>((ref) async {
  if (useLocalBackend) {
    return LocalGoalRepository(ref.watch(localStoreProvider));
  }
  final client = await ref.watch(apiClientProvider.future);
  return ApiGoalRepository(client);
});

final cravingRepositoryProvider = FutureProvider<CravingRepository>((ref) async {
  if (useLocalBackend) {
    final store = ref.watch(localStoreProvider);
    return LocalCravingRepository(LocalGoalRepository(store), store);
  }
  final client = await ref.watch(apiClientProvider.future);
  return ApiCravingRepository(client);
});

final categoriesProvider = FutureProvider<List<SpendCategory>>((ref) async {
  final repo = await ref.watch(categoryRepositoryProvider.future);
  return repo.fetchCategories();
});

final goalsProvider = FutureProvider<List<SavingsGoal>>((ref) async {
  final repo = await ref.watch(goalRepositoryProvider.future);
  return repo.fetchGoals();
});

final categoryListingsProvider =
    FutureProvider.family<List<Listing>, String>((ref, categoryId) async {
  final repo = await ref.watch(categoryRepositoryProvider.future);
  return repo.fetchListings(categoryId);
});

/// (categoryId, search query) — kept separate from [categoryListingsProvider]
/// so the unfiltered list stays cached while the user types a search term.
final categoryListingsSearchProvider =
    FutureProvider.family<List<Listing>, (String, String)>((ref, args) async {
  final (categoryId, query) = args;
  final repo = await ref.watch(categoryRepositoryProvider.future);
  return repo.fetchListings(categoryId, query: query);
});

final cartRepositoryProvider = FutureProvider<CartRepository>((ref) async {
  if (useLocalBackend) {
    return LocalCartRepository(ref.watch(localStoreProvider));
  }
  final client = await ref.watch(apiClientProvider.future);
  return ApiCartRepository(client);
});

final cartProvider = FutureProvider.family<Cart, String>((ref, categoryId) async {
  final repo = await ref.watch(cartRepositoryProvider.future);
  return repo.fetchCart(categoryId);
});

final statsRepositoryProvider = FutureProvider<StatsRepository>((ref) async {
  if (useLocalBackend) {
    return LocalStatsRepository(ref.watch(localStoreProvider));
  }
  final client = await ref.watch(apiClientProvider.future);
  return ApiStatsRepository(client);
});

final statsProvider = FutureProvider<UserStats>((ref) async {
  final repo = await ref.watch(statsRepositoryProvider.future);
  return repo.fetchStats();
});

final feedbackRepositoryProvider = FutureProvider<FeedbackRepository>((ref) async {
  if (useLocalBackend) {
    return LocalFeedbackRepository(ref.watch(localStoreProvider));
  }
  final client = await ref.watch(apiClientProvider.future);
  final deviceId = await ref.watch(deviceIdProvider.future);
  return ApiFeedbackRepository(client, deviceId);
});

/// Pings `/health` so the diagnostics screen can show a live API status
/// instead of just the configured base URL. Diagnostics-only — always
/// reports unreachable while [useLocalBackend] is true.
final apiHealthProvider = FutureProvider<bool>((ref) async {
  final client = await ref.watch(apiClientProvider.future);
  try {
    final result = await client.get('/health') as Map<String, dynamic>;
    return result['status'] == 'ok';
  } catch (_) {
    return false;
  }
});
