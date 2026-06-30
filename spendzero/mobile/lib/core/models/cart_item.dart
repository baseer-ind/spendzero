/// A single item in the user's active craving cart.
/// Persisted to SharedPreferences so it survives app restarts.
class CartItem {
  CartItem({
    required this.listingId,
    required this.name,
    required this.unitPricePaise,
    required this.quantity,
    required this.appId,
    required this.categoryId,
    required this.imageColorSeed,
  });

  final String listingId;
  final String name;
  final int unitPricePaise;
  int quantity;
  final String appId;
  final String categoryId;
  final String imageColorSeed;

  int get totalPaise => unitPricePaise * quantity;

  Map<String, dynamic> toJson() => {
        'listing_id': listingId,
        'name': name,
        'unit_price_paise': unitPricePaise,
        'quantity': quantity,
        'app_id': appId,
        'category_id': categoryId,
        'image_color_seed': imageColorSeed,
      };

  factory CartItem.fromJson(Map<String, dynamic> json) => CartItem(
        listingId: json['listing_id'] as String,
        name: json['name'] as String,
        unitPricePaise: json['unit_price_paise'] as int,
        quantity: json['quantity'] as int,
        appId: json['app_id'] as String,
        categoryId: json['category_id'] as String,
        imageColorSeed: json['image_color_seed'] as String? ?? '',
      );
}
