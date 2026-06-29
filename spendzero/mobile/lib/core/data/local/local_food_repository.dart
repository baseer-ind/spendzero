import '../contracts_food.dart';
import 'food_seed_data.dart';

/// On-device implementation of [FoodRepository], serving the bundled
/// fictional restaurant/menu catalogue in `food_seed_data.dart`. No network
/// calls, no artificial delay — mirrors the synchronous-under-the-hood
/// style of the other `Local*Repository` classes, which also resolve
/// instantly from in-memory/SharedPreferences data.
class LocalFoodRepository implements FoodRepository {
  @override
  Future<List<Restaurant>> fetchRestaurants({
    String? cuisineFilter,
    String? dietFilter,
    String? sortBy,
  }) async {
    var results = List<Restaurant>.from(allRestaurants);

    if (cuisineFilter != null && cuisineFilter.isNotEmpty) {
      results = results
          .where((r) => r.cuisines.any(
              (c) => c.toLowerCase() == cuisineFilter.toLowerCase()))
          .toList();
    }

    if (dietFilter != null && dietFilter.isNotEmpty) {
      final wantVeg = dietFilter.toLowerCase() == 'veg';
      results = results.where((r) {
        final items = menuItemsForRestaurant(r.id);
        if (items.isEmpty) return true;
        return items.any((m) => wantVeg
            ? (m.dietaryTag == DietaryTag.veg || m.dietaryTag == DietaryTag.vegan)
            : true);
      }).toList();
    }

    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.avgRating.compareTo(a.avgRating));
        break;
      case 'delivery_time':
        results.sort((a, b) => a.deliveryTimeMins.compareTo(b.deliveryTimeMins));
        break;
      case 'distance':
        results.sort((a, b) => a.distanceKm.compareTo(b.distanceKm));
        break;
      default:
        break;
    }

    return results;
  }

  @override
  Future<List<MenuItem>> fetchMenuItems(String restaurantId) async {
    return menuItemsForRestaurant(restaurantId);
  }

  @override
  Future<List<dynamic>> searchFood(String query) async {
    return searchFoodSeed(query);
  }

  @override
  Future<List<Review>> fetchReviews(String targetId) async {
    return reviewsFor(targetId);
  }

  @override
  Future<List<MenuItem>> fetchTodaysOffers() async {
    return todaysOffers();
  }

  @override
  Future<List<Restaurant>> fetchTrending() async {
    return trendingRestaurants();
  }

  @override
  Future<List<MenuItem>> fetchBestSellers() async {
    return bestSellerMenuItems();
  }
}
