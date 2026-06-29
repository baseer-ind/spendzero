import '../contracts_grocery.dart';
import 'grocery_seed_data.dart';

/// On-device implementation of [GroceryRepository], serving the bundled
/// fictional store/product catalogue in `grocery_seed_data.dart`. No
/// network calls, no artificial delay — mirrors the synchronous-under-the-
/// hood style of the other `Local*Repository` classes, which also resolve
/// instantly from in-memory/SharedPreferences data.
class LocalGroceryRepository implements GroceryRepository {
  @override
  Future<List<GroceryStore>> fetchStores({
    String? categoryFilter,
    String? sortBy,
  }) async {
    var results = List<GroceryStore>.from(allGroceryStores);

    if (categoryFilter != null && categoryFilter.isNotEmpty) {
      results = results
          .where((s) => s.categories.any(
              (c) => c.toLowerCase() == categoryFilter.toLowerCase()))
          .toList();
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
  Future<List<GroceryProduct>> fetchProducts(String storeId) async {
    return productsForStore(storeId);
  }

  @override
  Future<List<dynamic>> searchGrocery(String query) async {
    return searchGrocerySeed(query);
  }

  @override
  Future<List<Review>> fetchReviews(String targetId) async {
    return groceryReviewsFor(targetId);
  }

  @override
  Future<List<GroceryProduct>> fetchTodaysOffers() async {
    return groceryTodaysOffers();
  }

  @override
  Future<List<GroceryStore>> fetchTrending() async {
    return trendingGroceryStores();
  }

  @override
  Future<List<GroceryProduct>> fetchBestSellers() async {
    return bestSellerGroceryProducts();
  }

  @override
  Future<GroceryStore?> fetchStore(String storeId) async {
    return findGroceryStoreById(storeId);
  }

  @override
  Future<GroceryProduct?> fetchProduct(String productId) async {
    return findGroceryProductById(productId);
  }
}
