import '../../models/category.dart';
import '../../models/listing.dart';
import '../contracts.dart';
import 'local_seed_data.dart';

/// Categories/listings are bundled seed content — there's no on-device
/// "catalog" to manage in the offline MVP, so this just serves the seed.
class LocalCategoryRepository implements CategoryRepository {
  @override
  Future<List<SpendCategory>> fetchCategories() async => seedCategories;

  @override
  Future<List<Listing>> fetchListings(String categoryId, {String? query}) async {
    final listings = seedListingsFor(categoryId);
    if (query == null || query.isEmpty) return listings;
    final lowerQuery = query.toLowerCase();
    return listings
        .where((listing) => listing.title.toLowerCase().contains(lowerQuery))
        .toList();
  }
}
