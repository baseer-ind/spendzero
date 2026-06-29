import 'local/food_seed_data.dart';

/// Contract for the "Food Delivery" vertical. Kept separate from
/// `contracts.dart` so the existing `Api*Repository` implementations never
/// need to know about it — this vertical is local-only for now (see
/// [LocalFoodRepository]), with no remote/ counterpart required.
abstract class FoodRepository {
  Future<List<Restaurant>> fetchRestaurants({
    String? cuisineFilter,
    String? dietFilter,
    String? sortBy,
  });

  Future<List<MenuItem>> fetchMenuItems(String restaurantId);

  Future<List<dynamic>> searchFood(String query);

  Future<List<Review>> fetchReviews(String targetId);

  Future<List<MenuItem>> fetchTodaysOffers();

  Future<List<Restaurant>> fetchTrending();

  Future<List<MenuItem>> fetchBestSellers();
}
