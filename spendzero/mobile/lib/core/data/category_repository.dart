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

  Future<List<Listing>> fetchListings(String categoryId, {String? query}) async {
    final path = query == null || query.isEmpty
        ? '/categories/$categoryId/listings'
        : '/categories/$categoryId/listings?q=${Uri.encodeQueryComponent(query)}';
    final json = await _client.get(path) as List<dynamic>;
    return json.map((item) => Listing.fromJson(item as Map<String, dynamic>)).toList();
  }
}
