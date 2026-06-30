import 'local/beauty_seed_data.dart';

/// Contract for the "Beauty" vertical (skincare/makeup/haircare brands).
/// Local-only for now (see [LocalBeautyRepository]), no remote counterpart
/// required.
abstract class BeautyRepository {
  Future<List<BeautyBrand>> fetchBrands({
    String? categoryFilter,
    String? sortBy,
  });

  Future<List<BeautyProduct>> fetchProducts(String brandId);

  Future<List<dynamic>> searchBeauty(String query);

  Future<List<Review>> fetchReviews(String targetId);

  Future<List<BeautyProduct>> fetchTodaysOffers();

  Future<List<BeautyBrand>> fetchTrending();

  Future<List<BeautyProduct>> fetchBestSellers();

  Future<BeautyBrand?> fetchBrand(String brandId);

  Future<BeautyProduct?> fetchProduct(String productId);
}
