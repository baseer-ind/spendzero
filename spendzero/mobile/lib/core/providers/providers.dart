import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/category_repository.dart';
import '../data/craving_repository.dart';
import '../data/goal_repository.dart';
import '../models/category.dart';
import '../models/goal.dart';
import '../models/listing.dart';
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
