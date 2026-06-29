class CartItem {
  const CartItem({
    required this.listingId,
    required this.quantity,
    required this.unitPricePaise,
  });

  final String listingId;
  final int quantity;
  final int unitPricePaise;

  factory CartItem.fromJson(Map<String, dynamic> json) => CartItem(
        listingId: json['listing_id'] as String,
        quantity: json['quantity'] as int,
        unitPricePaise: json['unit_price_paise'] as int,
      );
}

class Cart {
  const Cart({required this.id, required this.categoryId, required this.items});

  final String id;
  final String categoryId;
  final List<CartItem> items;

  factory Cart.fromJson(Map<String, dynamic> json) => Cart(
        id: json['id'] as String,
        categoryId: json['category_id'] as String,
        items: (json['items'] as List)
            .map((e) => CartItem.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
