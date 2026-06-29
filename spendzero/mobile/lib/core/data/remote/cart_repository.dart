import '../../models/cart.dart';
import '../../network/api_client.dart';
import '../contracts.dart';

/// Persists the in-progress selection for a category's cart server-side, so
/// an abandoned cart can be resumed instead of being lost on app restart.
class ApiCartRepository implements CartRepository {
  ApiCartRepository(this._client);

  final ApiClient _client;

  @override
  Future<Cart> fetchCart(String categoryId) async {
    final json = await _client.get('/carts/$categoryId') as Map<String, dynamic>;
    return Cart.fromJson(json);
  }

  @override
  Future<Cart> saveItems(
    String categoryId,
    List<Map<String, dynamic>> items,
  ) async {
    final json = await _client.put('/carts/$categoryId/items', body: items)
        as Map<String, dynamic>;
    return Cart.fromJson(json);
  }
}
