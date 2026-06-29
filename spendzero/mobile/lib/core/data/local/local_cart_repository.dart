import '../../models/cart.dart';
import '../contracts.dart';
import 'local_seed_data.dart';
import 'local_store.dart';

const _cartsKey = 'local_carts_v1';

/// Persists the in-progress selection for a category's cart on-device, so
/// an abandoned cart can be resumed instead of being lost on app restart.
class LocalCartRepository implements CartRepository {
  LocalCartRepository(this._store);

  final LocalStore _store;

  @override
  Future<Cart> fetchCart(String categoryId) async {
    final carts = await _store.readMap(_cartsKey) ?? {};
    final rawItems = (carts[categoryId] as List?) ?? const [];
    final items = rawItems
        .map((e) => CartItem.fromJson(e as Map<String, dynamic>))
        .toList();
    return Cart(id: categoryId, categoryId: categoryId, items: items);
  }

  @override
  Future<Cart> saveItems(
    String categoryId,
    List<Map<String, dynamic>> items,
  ) async {
    final carts = await _store.readMap(_cartsKey) ?? {};
    final enriched = items.map((item) {
      if (item.containsKey('unit_price_paise')) return item;
      final listing = findSeedListingById(item['listing_id'] as String);
      return {
        ...item,
        'unit_price_paise': listing?.pricePaise ?? 0,
      };
    }).toList();
    carts[categoryId] = enriched;
    await _store.writeMap(_cartsKey, carts);
    return fetchCart(categoryId);
  }
}
