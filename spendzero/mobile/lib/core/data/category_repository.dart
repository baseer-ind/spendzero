import '../models/category.dart';
import '../models/listing.dart';
import '../network/api_client.dart';

class CategoryRepository {
  CategoryRepository(this._client);

  final ApiClient _client;

  Future<List<SpendCategory>> fetchCategories() async {
    final json = await _client.get('/categories') as List<dynamic>;
    return json
        .map((item) => SpendCategory.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<Listing>> fetchListings(String categoryId) async {
    final json = await _client.get('/categories/$categoryId/listings') as List<dynamic>;
    return json.map((item) => Listing.fromJson(item as Map<String, dynamic>)).toList();
  }
}
