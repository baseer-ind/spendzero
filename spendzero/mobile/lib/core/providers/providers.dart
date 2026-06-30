import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/contracts.dart';
import '../data/contracts_food.dart';
import '../data/contracts_grocery.dart';
import '../data/contracts_shopping.dart';
import '../data/local/food_seed_data.dart';
import '../data/local/grocery_seed_data.dart' hide Review;
import '../data/local/grocery_seed_data.dart' as grocery_seed show Review;
import '../data/local/shopping_seed_data.dart' hide Review;
import '../data/local/shopping_seed_data.dart' as shopping_seed show Review;
import '../data/local/local_cart_repository.dart';
import '../data/local/local_category_repository.dart';
import '../data/local/local_craving_repository.dart';
import '../data/local/local_feedback_repository.dart';
import '../data/local/local_food_repository.dart';
import '../data/local/local_goal_repository.dart';
import '../data/local/local_grocery_repository.dart';
import '../data/local/local_shopping_repository.dart';
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

final backendCartProvider = FutureProvider.family<Cart, String>((ref, categoryId) async {
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

/// The "Food Delivery" vertical is local-only for now — no `Api*` backend
/// counterpart exists yet, so this provider always returns [LocalFoodRepository]
/// regardless of [useLocalBackend].
final foodRepositoryProvider = Provider<FoodRepository>((ref) => LocalFoodRepository());

final foodRestaurantsProvider = FutureProvider<List<Restaurant>>((ref) async {
  final repo = ref.watch(foodRepositoryProvider);
  return repo.fetchRestaurants();
});

final foodTrendingProvider = FutureProvider<List<Restaurant>>((ref) async {
  final repo = ref.watch(foodRepositoryProvider);
  return repo.fetchTrending();
});

final foodTodaysOffersProvider = FutureProvider<List<MenuItem>>((ref) async {
  final repo = ref.watch(foodRepositoryProvider);
  return repo.fetchTodaysOffers();
});

final foodBestSellersProvider = FutureProvider<List<MenuItem>>((ref) async {
  final repo = ref.watch(foodRepositoryProvider);
  return repo.fetchBestSellers();
});

final menuItemsForRestaurantProvider =
    FutureProvider.family<List<MenuItem>, String>((ref, restaurantId) async {
  final repo = ref.watch(foodRepositoryProvider);
  return repo.fetchMenuItems(restaurantId);
});

final reviewsForProvider =
    FutureProvider.family<List<Review>, String>((ref, targetId) async {
  final repo = ref.watch(foodRepositoryProvider);
  return repo.fetchReviews(targetId);
});

final foodSearchProvider =
    FutureProvider.family<List<dynamic>, String>((ref, query) async {
  final repo = ref.watch(foodRepositoryProvider);
  return repo.searchFood(query);
});

/// The "Grocery" vertical is local-only for now — no `Api*` backend
/// counterpart exists yet, so this provider always returns
/// [LocalGroceryRepository] regardless of [useLocalBackend].
final groceryRepositoryProvider =
    Provider<GroceryRepository>((ref) => LocalGroceryRepository());

final groceryStoresProvider = FutureProvider<List<GroceryStore>>((ref) async {
  final repo = ref.watch(groceryRepositoryProvider);
  return repo.fetchStores();
});

final groceryTrendingProvider = FutureProvider<List<GroceryStore>>((ref) async {
  final repo = ref.watch(groceryRepositoryProvider);
  return repo.fetchTrending();
});

final groceryTodaysOffersProvider = FutureProvider<List<GroceryProduct>>((ref) async {
  final repo = ref.watch(groceryRepositoryProvider);
  return repo.fetchTodaysOffers();
});

final groceryBestSellersProvider = FutureProvider<List<GroceryProduct>>((ref) async {
  final repo = ref.watch(groceryRepositoryProvider);
  return repo.fetchBestSellers();
});

final productsForStoreProvider =
    FutureProvider.family<List<GroceryProduct>, String>((ref, storeId) async {
  final repo = ref.watch(groceryRepositoryProvider);
  return repo.fetchProducts(storeId);
});

final groceryReviewsForProvider =
    FutureProvider.family<List<grocery_seed.Review>, String>((ref, targetId) async {
  final repo = ref.watch(groceryRepositoryProvider);
  return repo.fetchReviews(targetId);
});

final grocerySearchProvider =
    FutureProvider.family<List<dynamic>, String>((ref, query) async {
  final repo = ref.watch(groceryRepositoryProvider);
  return repo.searchGrocery(query);
});

final groceryStoreByIdProvider =
    FutureProvider.family<GroceryStore?, String>((ref, storeId) async {
  final repo = ref.watch(groceryRepositoryProvider);
  return repo.fetchStore(storeId);
});

final groceryProductByIdProvider =
    FutureProvider.family<GroceryProduct?, String>((ref, productId) async {
  final repo = ref.watch(groceryRepositoryProvider);
  return repo.fetchProduct(productId);
});

/// The "Shopping" vertical (Fashion + Electronics) is local-only for now —
/// no `Api*` backend counterpart exists yet, so this provider always
/// returns [LocalShoppingRepository] regardless of [useLocalBackend].
final shoppingRepositoryProvider =
    Provider<ShoppingRepository>((ref) => LocalShoppingRepository());

final shoppingBrandsProvider = FutureProvider<List<ShoppingBrand>>((ref) async {
  final repo = ref.watch(shoppingRepositoryProvider);
  return repo.fetchBrands();
});

final shoppingTrendingProvider = FutureProvider<List<ShoppingBrand>>((ref) async {
  final repo = ref.watch(shoppingRepositoryProvider);
  return repo.fetchTrending();
});

final shoppingTodaysOffersProvider = FutureProvider<List<ShoppingProduct>>((ref) async {
  final repo = ref.watch(shoppingRepositoryProvider);
  return repo.fetchTodaysOffers();
});

final shoppingBestSellersProvider = FutureProvider<List<ShoppingProduct>>((ref) async {
  final repo = ref.watch(shoppingRepositoryProvider);
  return repo.fetchBestSellers();
});

final productsForBrandProvider =
    FutureProvider.family<List<ShoppingProduct>, String>((ref, brandId) async {
  final repo = ref.watch(shoppingRepositoryProvider);
  return repo.fetchProducts(brandId);
});

final shoppingReviewsForProvider =
    FutureProvider.family<List<shopping_seed.Review>, String>((ref, targetId) async {
  final repo = ref.watch(shoppingRepositoryProvider);
  return repo.fetchReviews(targetId);
});

final shoppingSearchProvider =
    FutureProvider.family<List<dynamic>, String>((ref, query) async {
  final repo = ref.watch(shoppingRepositoryProvider);
  return repo.searchShopping(query);
});

final shoppingBrandByIdProvider =
    FutureProvider.family<ShoppingBrand?, String>((ref, brandId) async {
  final repo = ref.watch(shoppingRepositoryProvider);
  return repo.fetchBrand(brandId);
});

final shoppingProductByIdProvider =
    FutureProvider.family<ShoppingProduct?, String>((ref, productId) async {
  final repo = ref.watch(shoppingRepositoryProvider);
  return repo.fetchProduct(productId);
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
