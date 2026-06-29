import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/cart_repository.dart';
import '../data/category_repository.dart';
import '../data/craving_repository.dart';
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
  final repo = await ref.watch(statsRepositoryProvider.future);
  return repo.fetchStats();
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
