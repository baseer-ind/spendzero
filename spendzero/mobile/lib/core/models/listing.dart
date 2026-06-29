class Listing {
  const Listing({
    required this.id,
    required this.brandId,
    required this.title,
    required this.pricePaise,
    this.rating,
  });

  final String id;
  final String brandId;
  final String title;
  final int pricePaise;
  final double? rating;

  factory Listing.fromJson(Map<String, dynamic> json) => Listing(
        id: json['id'] as String,
        brandId: json['brand_id'] as String,
        title: json['title'] as String,
        pricePaise: json['price_paise'] as int,
        rating: (json['rating'] as num?)?.toDouble(),
      );
}
