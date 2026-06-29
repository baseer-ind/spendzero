import 'local/grocery_seed_data.dart';

/// Contract for the "Grocery" vertical. Kept separate from `contracts.dart`
/// so the existing `Api*Repository` implementations never need to know
/// about it — this vertical is local-only for now (see
/// [LocalGroceryRepository]), with no remote/ counterpart required.
abstract class GroceryRepository {
  Future<List<GroceryStore>> fetchStores({
    String? categoryFilter,
    String? sortBy,
  });

  Future<List<GroceryProduct>> fetchProducts(String storeId);

  Future<List<dynamic>> searchGrocery(String query);

  Future<List<Review>> fetchReviews(String targetId);

  Future<List<GroceryProduct>> fetchTodaysOffers();

  Future<List<GroceryStore>> fetchTrending();

  Future<List<GroceryProduct>> fetchBestSellers();

  Future<GroceryStore?> fetchStore(String storeId);

  Future<GroceryProduct?> fetchProduct(String productId);
}
