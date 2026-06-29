class Listing {
  const Listing({
    required this.id,
    required this.brandId,
    required this.title,
    required this.pricePaise,
    this.mrpPaise,
    this.rating,
    this.reviewCount = 0,
    this.images,
  });

  final String id;
  final String brandId;
  final String title;
  final int pricePaise;
  final int? mrpPaise;
  final double? rating;
  final int reviewCount;
  final List<String>? images;

  int? get discountPercent {
    if (mrpPaise == null || mrpPaise! <= pricePaise) return null;
    return (((mrpPaise! - pricePaise) / mrpPaise!) * 100).round();
  }

  factory Listing.fromJson(Map<String, dynamic> json) => Listing(
        id: json['id'] as String,
        brandId: json['brand_id'] as String,
        title: json['title'] as String,
        pricePaise: json['price_paise'] as int,
        mrpPaise: json['mrp_paise'] as int?,
        rating: (json['rating'] as num?)?.toDouble(),
        reviewCount: json['review_count'] as int? ?? 0,
        images: (json['images'] as List?)?.map((e) => e as String).toList(),
      );
}
