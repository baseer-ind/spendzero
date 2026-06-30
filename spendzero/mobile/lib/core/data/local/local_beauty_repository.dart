import '../contracts_beauty.dart';
import 'beauty_seed_data.dart';

/// On-device implementation of [BeautyRepository], serving the bundled
/// fictional skincare/makeup/haircare catalogue in `beauty_seed_data.dart`.
class LocalBeautyRepository implements BeautyRepository {
  @override
  Future<List<BeautyBrand>> fetchBrands({
    String? categoryFilter,
    String? sortBy,
  }) async {
    var results = List<BeautyBrand>.from(allBeautyBrands);

    if (categoryFilter != null && categoryFilter.isNotEmpty) {
      results = results
          .where((b) => b.categories
              .any((c) => c.toLowerCase() == categoryFilter.toLowerCase()))
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
  Future<List<BeautyProduct>> fetchProducts(String brandId) async {
    return productsForBrand(brandId);
  }

  @override
  Future<List<dynamic>> searchBeauty(String query) async {
    return searchBeautySeed(query);
  }

  @override
  Future<List<Review>> fetchReviews(String targetId) async {
    return beautyReviewsFor(targetId);
  }

  @override
  Future<List<BeautyProduct>> fetchTodaysOffers() async {
    return beautyTodaysOffers();
  }

  @override
  Future<List<BeautyBrand>> fetchTrending() async {
    return trendingBeautyBrands();
  }

  @override
  Future<List<BeautyProduct>> fetchBestSellers() async {
    return bestSellerBeautyProducts();
  }

  @override
  Future<BeautyBrand?> fetchBrand(String brandId) async {
    return findBeautyBrandById(brandId);
  }

  @override
  Future<BeautyProduct?> fetchProduct(String productId) async {
    return findBeautyProductById(productId);
  }
}
