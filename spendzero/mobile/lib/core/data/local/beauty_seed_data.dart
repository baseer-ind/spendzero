/// Bundled, fully offline "Beauty" catalogue: fictional skincare, makeup,
/// and wellness brands with products and reviews. Mirrors the spirit of
/// `shopping_seed_data.dart` — hand-written, no network calls, no real
/// brands. Used by `LocalBeautyRepository` so the beauty vertical works
/// with zero backend.
library;

class BeautyBrand {
  const BeautyBrand({
    required this.id,
    required this.name,
    required this.brandTagline,
    required this.categories,
    required this.avgRating,
    required this.reviewCount,
    required this.deliveryTimeMins,
    required this.distanceKm,
    required this.priceTier,
    required this.isTrending,
    required this.isFeatured,
    required this.bannerColorSeed,
    required this.productIds,
  });

  final String id;
  final String name;
  final String brandTagline;
  final List<String> categories;
  final double avgRating;
  final int reviewCount;
  final int deliveryTimeMins;
  final double distanceKm;
  final String priceTier;
  final bool isTrending;
  final bool isFeatured;
  final String bannerColorSeed;
  final List<String> productIds;
}

class BeautyProduct {
  const BeautyProduct({
    required this.id,
    required this.brandId,
    required this.name,
    required this.description,
    required this.category,
    required this.variant,
    required this.pricePaise,
    this.mrpPaise,
    this.isBestSeller = false,
    this.isTrending = false,
    this.isNewArrival = false,
    required this.tags,
    required this.rating,
    required this.reviewCount,
  });

  final String id;
  final String brandId;
  final String name;
  final String description;
  final String category;
  final String variant;
  final int pricePaise;
  final int? mrpPaise;
  final bool isBestSeller;
  final bool isTrending;
  final bool isNewArrival;
  final List<String> tags;
  final double rating;
  final int reviewCount;

  int? get discountPercent {
    if (mrpPaise == null || mrpPaise! <= pricePaise) return null;
    return (((mrpPaise! - pricePaise) / mrpPaise!) * 100).round();
  }
}

class Review {
  const Review({
    required this.id,
    required this.targetId,
    required this.reviewerName,
    required this.reviewerInitials,
    required this.rating,
    required this.text,
    required this.daysAgo,
    required this.helpfulCount,
    required this.verifiedOrder,
  });

  final String id;
  final String targetId;
  final String reviewerName;
  final String reviewerInitials;
  final double rating;
  final String text;
  final int daysAgo;
  final int helpfulCount;
  final bool verifiedOrder;
}

const allBeautyBrands = <BeautyBrand>[
  BeautyBrand(
    id: 'bb-dermalumin',
    name: 'DermaLumin',
    brandTagline: 'Dermatologist-formulated skincare for every skin type',
    categories: ['Skincare', 'Suncare', 'Serums'],
    avgRating: 4.6,
    reviewCount: 2840,
    deliveryTimeMins: 45,
    distanceKm: 3.2,
    priceTier: '₹₹₹',
    isTrending: true,
    isFeatured: true,
    bannerColorSeed: 'dermalumin',
    productIds: ['bp-dl-1', 'bp-dl-2', 'bp-dl-3', 'bp-dl-4', 'bp-dl-5'],
  ),
  BeautyBrand(
    id: 'bb-velvetmuse',
    name: 'Velvet Muse',
    brandTagline: 'Bold makeup for everyday glam',
    categories: ['Makeup', 'Lip', 'Eyes'],
    avgRating: 4.4,
    reviewCount: 3960,
    deliveryTimeMins: 60,
    distanceKm: 4.5,
    priceTier: '₹₹',
    isTrending: true,
    isFeatured: true,
    bannerColorSeed: 'velvetmuse',
    productIds: ['bp-vm-1', 'bp-vm-2', 'bp-vm-3', 'bp-vm-4'],
  ),
  BeautyBrand(
    id: 'bb-purebloom',
    name: 'PureBloom',
    brandTagline: 'Clean beauty, plant-powered formulas',
    categories: ['Skincare', 'Haircare', 'Body Care'],
    avgRating: 4.7,
    reviewCount: 1520,
    deliveryTimeMins: 50,
    distanceKm: 2.8,
    priceTier: '₹₹',
    isTrending: false,
    isFeatured: true,
    bannerColorSeed: 'purebloom',
    productIds: ['bp-pb-1', 'bp-pb-2', 'bp-pb-3'],
  ),
  BeautyBrand(
    id: 'bb-luxeglow',
    name: 'LuxeGlow Atelier',
    brandTagline: 'Premium imported beauty, curated for India',
    categories: ['Makeup', 'Skincare', 'Fragrance'],
    avgRating: 4.5,
    reviewCount: 980,
    deliveryTimeMins: 70,
    distanceKm: 5.1,
    priceTier: '₹₹₹₹',
    isTrending: false,
    isFeatured: false,
    bannerColorSeed: 'luxeglow',
    productIds: ['bp-lg-1', 'bp-lg-2', 'bp-lg-3'],
  ),
  BeautyBrand(
    id: 'bb-curlcrush',
    name: 'CurlCrush',
    brandTagline: 'Haircare built for curls, waves and texture',
    categories: ['Haircare', 'Styling'],
    avgRating: 4.3,
    reviewCount: 1340,
    deliveryTimeMins: 55,
    distanceKm: 3.9,
    priceTier: '₹₹',
    isTrending: true,
    isFeatured: false,
    bannerColorSeed: 'curlcrush',
    productIds: ['bp-cc-1', 'bp-cc-2', 'bp-cc-3'],
  ),
];

const allBeautyProducts = <BeautyProduct>[
  // DermaLumin
  BeautyProduct(
    id: 'bp-dl-1',
    brandId: 'bb-dermalumin',
    name: 'Niacinamide 10% Serum',
    description: 'Reduces blemishes and tightens visible pores',
    category: 'Serums',
    variant: '30ml',
    pricePaise: 64900,
    mrpPaise: 79900,
    isBestSeller: true,
    tags: ['Oily skin', 'Cruelty-free'],
    rating: 4.6,
    reviewCount: 1240,
  ),
  BeautyProduct(
    id: 'bp-dl-2',
    brandId: 'bb-dermalumin',
    name: 'Hydra Boost Moisturizer',
    description: 'Lightweight gel-cream with hyaluronic acid',
    category: 'Skincare',
    variant: '50g',
    pricePaise: 54900,
    isTrending: true,
    tags: ['All skin types', 'Non-greasy'],
    rating: 4.5,
    reviewCount: 860,
  ),
  BeautyProduct(
    id: 'bp-dl-3',
    brandId: 'bb-dermalumin',
    name: 'SPF 50 Matte Sunscreen',
    description: 'No white cast, sweat-resistant sun protection',
    category: 'Suncare',
    variant: '50ml',
    pricePaise: 45900,
    mrpPaise: 55900,
    isBestSeller: true,
    tags: ['No white cast', 'Sweat-resistant'],
    rating: 4.7,
    reviewCount: 980,
  ),
  BeautyProduct(
    id: 'bp-dl-4',
    brandId: 'bb-dermalumin',
    name: 'Vitamin C Brightening Serum',
    description: '15% Vitamin C for an even, radiant tone',
    category: 'Serums',
    variant: '30ml',
    pricePaise: 69900,
    isNewArrival: true,
    tags: ['Brightening', 'Antioxidant'],
    rating: 4.4,
    reviewCount: 312,
  ),
  BeautyProduct(
    id: 'bp-dl-5',
    brandId: 'bb-dermalumin',
    name: 'Gentle Foaming Cleanser',
    description: 'Sulfate-free daily cleanser for sensitive skin',
    category: 'Skincare',
    variant: '120ml',
    pricePaise: 34900,
    tags: ['Sulfate-free', 'Sensitive skin'],
    rating: 4.3,
    reviewCount: 540,
  ),

  // Velvet Muse
  BeautyProduct(
    id: 'bp-vm-1',
    brandId: 'bb-velvetmuse',
    name: 'Velvet Matte Lipstick',
    description: 'Long-wear matte finish in 12 bold shades',
    category: 'Lip',
    variant: '3.5g',
    pricePaise: 39900,
    mrpPaise: 49900,
    isBestSeller: true,
    tags: ['Long-wear', 'Transfer-proof'],
    rating: 4.5,
    reviewCount: 1820,
  ),
  BeautyProduct(
    id: 'bp-vm-2',
    brandId: 'bb-velvetmuse',
    name: 'HD Liquid Foundation',
    description: 'Buildable medium-to-full coverage, 20 shades',
    category: 'Makeup',
    variant: '30ml',
    pricePaise: 79900,
    isTrending: true,
    tags: ['Full coverage', '20 shades'],
    rating: 4.3,
    reviewCount: 940,
  ),
  BeautyProduct(
    id: 'bp-vm-3',
    brandId: 'bb-velvetmuse',
    name: 'Smudge-Proof Kohl Kajal',
    description: 'Intense black pigment, 12-hour wear',
    category: 'Eyes',
    variant: '0.35g',
    pricePaise: 19900,
    mrpPaise: 24900,
    tags: ['Smudge-proof', '12-hour wear'],
    rating: 4.6,
    reviewCount: 2210,
  ),
  BeautyProduct(
    id: 'bp-vm-4',
    brandId: 'bb-velvetmuse',
    name: 'Eyeshadow Palette - Sunset',
    description: '9 warm-toned shades, matte and shimmer finishes',
    category: 'Eyes',
    variant: '9 x 1.2g',
    pricePaise: 99900,
    isNewArrival: true,
    tags: ['Warm tones', 'Blendable'],
    rating: 4.4,
    reviewCount: 188,
  ),

  // PureBloom
  BeautyProduct(
    id: 'bp-pb-1',
    brandId: 'bb-purebloom',
    name: 'Rosewater Hydrating Toner',
    description: 'Alcohol-free toner with real rose extract',
    category: 'Skincare',
    variant: '200ml',
    pricePaise: 34900,
    isBestSeller: true,
    tags: ['Alcohol-free', 'Plant-based'],
    rating: 4.8,
    reviewCount: 760,
  ),
  BeautyProduct(
    id: 'bp-pb-2',
    brandId: 'bb-purebloom',
    name: 'Argan Hair Repair Oil',
    description: 'Cold-pressed argan oil for dry, damaged hair',
    category: 'Haircare',
    variant: '100ml',
    pricePaise: 44900,
    mrpPaise: 54900,
    isTrending: true,
    tags: ['Cold-pressed', 'For dry hair'],
    rating: 4.6,
    reviewCount: 410,
  ),
  BeautyProduct(
    id: 'bp-pb-3',
    brandId: 'bb-purebloom',
    name: 'Shea Body Butter',
    description: 'Rich, fast-absorbing whipped shea butter',
    category: 'Body Care',
    variant: '200g',
    pricePaise: 39900,
    tags: ['Whipped texture', 'Plant-based'],
    rating: 4.5,
    reviewCount: 298,
  ),

  // LuxeGlow Atelier
  BeautyProduct(
    id: 'bp-lg-1',
    brandId: 'bb-luxeglow',
    name: 'Signature Eau de Parfum',
    description: 'Layered florals with a warm amber base',
    category: 'Fragrance',
    variant: '50ml',
    pricePaise: 349900,
    isBestSeller: true,
    tags: ['Long-lasting', 'Gift-ready'],
    rating: 4.7,
    reviewCount: 220,
  ),
  BeautyProduct(
    id: 'bp-lg-2',
    brandId: 'bb-luxeglow',
    name: 'Radiance Foundation Compact',
    description: 'Imported buildable compact for a luminous finish',
    category: 'Makeup',
    variant: '12g',
    pricePaise: 189900,
    isTrending: true,
    tags: ['Imported', 'Luminous finish'],
    rating: 4.5,
    reviewCount: 96,
  ),
  BeautyProduct(
    id: 'bp-lg-3',
    brandId: 'bb-luxeglow',
    name: 'Gold-Infused Night Cream',
    description: '24K gold-infused anti-aging night treatment',
    category: 'Skincare',
    variant: '50g',
    pricePaise: 259900,
    mrpPaise: 299900,
    isNewArrival: true,
    tags: ['Anti-aging', 'Luxury'],
    rating: 4.6,
    reviewCount: 64,
  ),

  // CurlCrush
  BeautyProduct(
    id: 'bp-cc-1',
    brandId: 'bb-curlcrush',
    name: 'Curl Defining Cream',
    description: 'Frizz-free definition without the crunch',
    category: 'Haircare',
    variant: '250ml',
    pricePaise: 49900,
    isBestSeller: true,
    tags: ['Frizz-free', 'Curl care'],
    rating: 4.4,
    reviewCount: 680,
  ),
  BeautyProduct(
    id: 'bp-cc-2',
    brandId: 'bb-curlcrush',
    name: 'Sulfate-Free Curl Shampoo',
    description: 'Gentle cleanse that preserves natural curl pattern',
    category: 'Haircare',
    variant: '300ml',
    pricePaise: 39900,
    mrpPaise: 47900,
    tags: ['Sulfate-free', 'Curl care'],
    rating: 4.3,
    reviewCount: 420,
  ),
  BeautyProduct(
    id: 'bp-cc-3',
    brandId: 'bb-curlcrush',
    name: 'Flexible Hold Curl Gel',
    description: 'All-day hold without stiffness or flaking',
    category: 'Styling',
    variant: '200ml',
    pricePaise: 34900,
    isNewArrival: true,
    tags: ['Flexible hold', 'No flaking'],
    rating: 4.2,
    reviewCount: 156,
  ),
];

const _beautyReviews = <Review>[
  Review(
    id: 'rv-bb-dermalumin-1',
    targetId: 'bb-dermalumin',
    reviewerName: 'Ishita Sharma',
    reviewerInitials: 'IS',
    rating: 4.7,
    text: 'The niacinamide serum visibly shrank my pores in three weeks. Worth every rupee.',
    daysAgo: 4,
    helpfulCount: 38,
    verifiedOrder: true,
  ),
  Review(
    id: 'rv-bb-dermalumin-2',
    targetId: 'bb-dermalumin',
    reviewerName: 'Naina Verma',
    reviewerInitials: 'NV',
    rating: 4.5,
    text: 'Finally a sunscreen with zero white cast. Doesn\'t feel sticky in humidity either.',
    daysAgo: 12,
    helpfulCount: 27,
    verifiedOrder: true,
  ),
  Review(
    id: 'rv-bb-velvetmuse-1',
    targetId: 'bb-velvetmuse',
    reviewerName: 'Pooja Reddy',
    reviewerInitials: 'PR',
    rating: 4.4,
    text: 'The matte lipstick lasted through an entire wedding without touch-ups.',
    daysAgo: 7,
    helpfulCount: 31,
    verifiedOrder: true,
  ),
  Review(
    id: 'rv-bb-purebloom-1',
    targetId: 'bb-purebloom',
    reviewerName: 'Tanvi Joshi',
    reviewerInitials: 'TJ',
    rating: 4.8,
    text: 'The rosewater toner smells incredible and calmed my redness almost instantly.',
    daysAgo: 9,
    helpfulCount: 22,
    verifiedOrder: true,
  ),
  Review(
    id: 'rv-bb-luxeglow-1',
    targetId: 'bb-luxeglow',
    reviewerName: 'Ananya Kapoor',
    reviewerInitials: 'AK',
    rating: 4.6,
    text: 'The fragrance lasted all day and the packaging felt genuinely premium.',
    daysAgo: 15,
    helpfulCount: 14,
    verifiedOrder: false,
  ),
  Review(
    id: 'rv-bb-curlcrush-1',
    targetId: 'bb-curlcrush',
    reviewerName: 'Meera Pillai',
    reviewerInitials: 'MP',
    rating: 4.4,
    text: 'First curl cream that actually defines my 3A curls without crunch. Repurchasing.',
    daysAgo: 6,
    helpfulCount: 19,
    verifiedOrder: true,
  ),
];

List<BeautyProduct> productsForBrand(String brandId) =>
    allBeautyProducts.where((p) => p.brandId == brandId).toList();

List<Review> beautyReviewsFor(String targetId) =>
    _beautyReviews.where((r) => r.targetId == targetId).toList();

BeautyBrand? findBeautyBrandById(String id) {
  for (final b in allBeautyBrands) {
    if (b.id == id) return b;
  }
  return null;
}

BeautyProduct? findBeautyProductById(String id) {
  for (final p in allBeautyProducts) {
    if (p.id == id) return p;
  }
  return null;
}

List<dynamic> searchBeautySeed(String query) {
  final q = query.trim().toLowerCase();
  if (q.isEmpty) return const [];
  final results = <dynamic>[];
  for (final b in allBeautyBrands) {
    if (b.name.toLowerCase().contains(q) ||
        b.categories.any((c) => c.toLowerCase().contains(q))) {
      results.add(b);
    }
  }
  for (final p in allBeautyProducts) {
    if (p.name.toLowerCase().contains(q) ||
        p.category.toLowerCase().contains(q) ||
        p.tags.any((t) => t.toLowerCase().contains(q))) {
      results.add(p);
    }
  }
  return results;
}

List<BeautyProduct> beautyTodaysOffers() =>
    allBeautyProducts.where((p) => p.mrpPaise != null && p.mrpPaise! > p.pricePaise).toList();

List<BeautyBrand> trendingBeautyBrands() => allBeautyBrands.where((b) => b.isTrending).toList();

List<BeautyProduct> bestSellerBeautyProducts() => allBeautyProducts.where((p) => p.isBestSeller).toList();
