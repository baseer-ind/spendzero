import '../contracts_shopping.dart';
import 'shopping_seed_data.dart';

/// On-device implementation of [ShoppingRepository], serving the bundled
/// fictional Fashion + Electronics catalogue in `shopping_seed_data.dart`.
/// No network calls, no artificial delay — mirrors the synchronous-under-
/// the-hood style of the other `Local*Repository` classes, which also
/// resolve instantly from in-memory/SharedPreferences data.
class LocalShoppingRepository implements ShoppingRepository {
  @override
  Future<List<ShoppingBrand>> fetchBrands({
    String? categoryFilter,
    String? sortBy,
  }) async {
    var results = List<ShoppingBrand>.from(allShoppingBrands);

    if (categoryFilter != null && categoryFilter.isNotEmpty) {
      results = results
          .where((b) => b.categories.any(
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
  Future<List<ShoppingProduct>> fetchProducts(String brandId) async {
    return productsForBrand(brandId);
  }

  @override
  Future<List<dynamic>> searchShopping(String query) async {
    return searchShoppingSeed(query);
  }

  @override
  Future<List<Review>> fetchReviews(String targetId) async {
    return shoppingReviewsFor(targetId);
  }

  @override
  Future<List<ShoppingProduct>> fetchTodaysOffers() async {
    return shoppingTodaysOffers();
  }

  @override
  Future<List<ShoppingBrand>> fetchTrending() async {
    return trendingShoppingBrands();
  }

  @override
  Future<List<ShoppingProduct>> fetchBestSellers() async {
    return bestSellerShoppingProducts();
  }

  @override
  Future<ShoppingBrand?> fetchBrand(String brandId) async {
    return findShoppingBrandById(brandId);
  }

  @override
  Future<ShoppingProduct?> fetchProduct(String productId) async {
    return findShoppingProductById(productId);
  }
}
