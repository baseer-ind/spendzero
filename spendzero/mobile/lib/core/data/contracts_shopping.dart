import 'local/shopping_seed_data.dart';

/// Contract for the "Shopping" vertical (Fashion + Electronics). Kept
/// separate from `contracts.dart` so the existing `Api*Repository`
/// implementations never need to know about it — this vertical is
/// local-only for now (see [LocalShoppingRepository]), with no remote/
/// counterpart required.
abstract class ShoppingRepository {
  Future<List<ShoppingBrand>> fetchBrands({
    String? categoryFilter,
    String? sortBy,
  });

  Future<List<ShoppingProduct>> fetchProducts(String brandId);

  Future<List<dynamic>> searchShopping(String query);

  Future<List<Review>> fetchReviews(String targetId);

  Future<List<ShoppingProduct>> fetchTodaysOffers();

  Future<List<ShoppingBrand>> fetchTrending();

  Future<List<ShoppingProduct>> fetchBestSellers();

  Future<ShoppingBrand?> fetchBrand(String brandId);

  Future<ShoppingProduct?> fetchProduct(String productId);
}
