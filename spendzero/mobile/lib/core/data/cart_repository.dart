import '../models/cart.dart';
import '../network/api_client.dart';

/// Persists the in-progress selection for a category's cart server-side, so
/// an abandoned cart can be resumed instead of being lost on app restart.
class CartRepository {
  CartRepository(this._client);

  final ApiClient _client;

  Future<Cart> fetchCart(String categoryId) async {
    final json = await _client.get('/carts/$categoryId') as Map<String, dynamic>;
    return Cart.fromJson(json);
  }

  Future<Cart> saveItems(
    String categoryId,
    List<Map<String, dynamic>> items,
  ) async {
    final json = await _client.put('/carts/$categoryId/items', body: items)
        as Map<String, dynamic>;
    return Cart.fromJson(json);
  }
}
