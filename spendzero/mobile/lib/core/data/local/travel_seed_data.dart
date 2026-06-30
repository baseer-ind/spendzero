/// Bundled, fully offline "Travel / Stays" catalogue: fictional hotels,
/// resorts, and homestays with bookable room types and reviews. Mirrors the
/// spirit of `grocery_seed_data.dart` — hand-written, no network calls, no
/// real brands. Used by `LocalTravelRepository` so the travel vertical works
/// with zero backend.
library;

class TravelStay {
  const TravelStay({
    required this.id,
    required this.name,
    required this.brandTagline,
    required this.location,
    required this.amenities,
    required this.avgRating,
    required this.reviewCount,
    required this.distanceKm,
    required this.priceTier,
    required this.isTrending,
    required this.isFeatured,
    required this.bannerColorSeed,
    required this.roomIds,
  });

  final String id;
  final String name;
  final String brandTagline;
  final String location;
  final List<String> amenities;
  final double avgRating;
  final int reviewCount;
  final double distanceKm;
  final String priceTier;
  final bool isTrending;
  final bool isFeatured;
  final String bannerColorSeed;
  final List<String> roomIds;
}

class TravelRoom {
  const TravelRoom({
    required this.id,
    required this.stayId,
    required this.name,
    required this.description,
    required this.category,
    required this.unit,
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
  final String stayId;
  final String name;
  final String description;
  final String category;
  final String unit;
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

const allTravelStays = <TravelStay>[
  TravelStay(
    id: 'ts-nestview-residency',
    name: 'NestView Residency',
    brandTagline: 'Boutique comfort in the heart of the hills',
    location: 'Coorg, Karnataka',
    amenities: ['Free Wi-Fi', 'Pool', 'Breakfast Included', 'Mountain View'],
    avgRating: 4.6,
    reviewCount: 1840,
    distanceKm: 2.1,
    priceTier: '₹₹₹',
    isTrending: true,
    isFeatured: true,
    bannerColorSeed: 'nestview-residency',
    roomIds: ['tr-nv-1', 'tr-nv-2', 'tr-nv-3', 'tr-nv-4'],
  ),
  TravelStay(
    id: 'ts-harbour-pearl-suites',
    name: 'Harbour Pearl Suites',
    brandTagline: 'Wake up to the sea, every single morning',
    location: 'Goa',
    amenities: ['Sea View', 'Pool', 'Free Wi-Fi', 'Spa', 'Bar'],
    avgRating: 4.5,
    reviewCount: 2960,
    distanceKm: 0.4,
    priceTier: '₹₹₹₹',
    isTrending: true,
    isFeatured: true,
    bannerColorSeed: 'harbour-pearl-suites',
    roomIds: ['tr-hp-1', 'tr-hp-2', 'tr-hp-3', 'tr-hp-4', 'tr-hp-5'],
  ),
  TravelStay(
    id: 'ts-cedar-grove-cottages',
    name: 'Cedar Grove Cottages',
    brandTagline: 'Wooden cottages tucked inside a pine forest',
    location: 'Manali, Himachal Pradesh',
    amenities: ['Bonfire', 'Free Wi-Fi', 'Mountain View', 'Breakfast Included'],
    avgRating: 4.7,
    reviewCount: 1320,
    distanceKm: 5.6,
    priceTier: '₹₹',
    isTrending: false,
    isFeatured: true,
    bannerColorSeed: 'cedar-grove-cottages',
    roomIds: ['tr-cg-1', 'tr-cg-2', 'tr-cg-3'],
  ),
  TravelStay(
    id: 'ts-azure-bay-resort',
    name: 'Azure Bay Resort',
    brandTagline: 'A private slice of beachfront luxury',
    location: 'Alibaug, Maharashtra',
    amenities: ['Private Beach', 'Pool', 'Spa', 'Free Wi-Fi', 'Bar'],
    avgRating: 4.4,
    reviewCount: 980,
    distanceKm: 1.8,
    priceTier: '₹₹₹₹',
    isTrending: false,
    isFeatured: false,
    bannerColorSeed: 'azure-bay-resort',
    roomIds: ['tr-ab-1', 'tr-ab-2', 'tr-ab-3', 'tr-ab-4'],
  ),
  TravelStay(
    id: 'ts-rajwada-haveli',
    name: 'Rajwada Haveli',
    brandTagline: 'A restored heritage haveli with royal charm',
    location: 'Udaipur, Rajasthan',
    amenities: ['Heritage Property', 'Rooftop Dining', 'Pool', 'Free Wi-Fi'],
    avgRating: 4.8,
    reviewCount: 2140,
    distanceKm: 3.2,
    priceTier: '₹₹₹',
    isTrending: true,
    isFeatured: true,
    bannerColorSeed: 'rajwada-haveli',
    roomIds: ['tr-rh-1', 'tr-rh-2', 'tr-rh-3', 'tr-rh-4'],
  ),
  TravelStay(
    id: 'ts-backwater-bamboo-stay',
    name: 'Backwater Bamboo Stay',
    brandTagline: 'Floating cottages on Kerala\'s calm backwaters',
    location: 'Alleppey, Kerala',
    amenities: ['Lake View', 'Free Wi-Fi', 'Breakfast Included', 'Kayaking'],
    avgRating: 4.6,
    reviewCount: 1110,
    distanceKm: 0.9,
    priceTier: '₹₹',
    isTrending: false,
    isFeatured: true,
    bannerColorSeed: 'backwater-bamboo-stay',
    roomIds: ['tr-bb-1', 'tr-bb-2', 'tr-bb-3'],
  ),
];

const allTravelRooms = <TravelRoom>[
  // NestView Residency
  TravelRoom(
    id: 'tr-nv-1',
    stayId: 'ts-nestview-residency',
    name: 'Deluxe Hill View Room',
    description: 'Spacious room with a private balcony overlooking the coffee estates',
    category: 'Deluxe',
    unit: 'per night',
    pricePaise: 480000,
    mrpPaise: 600000,
    isBestSeller: true,
    tags: ['Free cancellation', 'Breakfast included'],
    rating: 4.6,
    reviewCount: 612,
  ),
  TravelRoom(
    id: 'tr-nv-2',
    stayId: 'ts-nestview-residency',
    name: 'Premium Pool View Suite',
    description: 'Suite with a king bed and direct pool access',
    category: 'Suite',
    unit: 'per night',
    pricePaise: 720000,
    isTrending: true,
    tags: ['Pool access', 'Late checkout'],
    rating: 4.7,
    reviewCount: 318,
  ),
  TravelRoom(
    id: 'tr-nv-3',
    stayId: 'ts-nestview-residency',
    name: 'Standard Garden Room',
    description: 'Cosy room facing the landscaped garden',
    category: 'Standard',
    unit: 'per night',
    pricePaise: 320000,
    mrpPaise: 380000,
    tags: ['Free cancellation'],
    rating: 4.3,
    reviewCount: 401,
  ),
  TravelRoom(
    id: 'tr-nv-4',
    stayId: 'ts-nestview-residency',
    name: 'Family Cottage',
    description: 'Two-bedroom cottage ideal for families, with a private sit-out',
    category: 'Cottage',
    unit: 'per night',
    pricePaise: 950000,
    isNewArrival: true,
    tags: ['Sleeps 4', 'Breakfast included'],
    rating: 4.8,
    reviewCount: 96,
  ),

  // Harbour Pearl Suites
  TravelRoom(
    id: 'tr-hp-1',
    stayId: 'ts-harbour-pearl-suites',
    name: 'Sea View Deluxe Room',
    description: 'Floor-to-ceiling windows facing the Arabian Sea',
    category: 'Deluxe',
    unit: 'per night',
    pricePaise: 650000,
    mrpPaise: 800000,
    isBestSeller: true,
    tags: ['Sea view', 'Free cancellation'],
    rating: 4.5,
    reviewCount: 890,
  ),
  TravelRoom(
    id: 'tr-hp-2',
    stayId: 'ts-harbour-pearl-suites',
    name: 'Pearl Suite with Jacuzzi',
    description: 'Top-floor suite with a private jacuzzi and ocean views',
    category: 'Suite',
    unit: 'per night',
    pricePaise: 1450000,
    isTrending: true,
    tags: ['Jacuzzi', 'Butler service'],
    rating: 4.8,
    reviewCount: 224,
  ),
  TravelRoom(
    id: 'tr-hp-3',
    stayId: 'ts-harbour-pearl-suites',
    name: 'Garden View Room',
    description: 'Quiet room overlooking the tropical garden',
    category: 'Standard',
    unit: 'per night',
    pricePaise: 420000,
    tags: ['Free cancellation'],
    rating: 4.2,
    reviewCount: 510,
  ),
  TravelRoom(
    id: 'tr-hp-4',
    stayId: 'ts-harbour-pearl-suites',
    name: 'Honeymoon Pool Villa',
    description: 'Private villa with a plunge pool, perfect for couples',
    category: 'Villa',
    unit: 'per night',
    pricePaise: 1850000,
    mrpPaise: 2200000,
    isNewArrival: true,
    tags: ['Private pool', 'Romantic setup'],
    rating: 4.9,
    reviewCount: 142,
  ),
  TravelRoom(
    id: 'tr-hp-5',
    stayId: 'ts-harbour-pearl-suites',
    name: 'Beachfront Cabana',
    description: 'Cabana steps away from the private beach',
    category: 'Cabana',
    unit: 'per night',
    pricePaise: 980000,
    isBestSeller: true,
    tags: ['Beachfront', 'Breakfast included'],
    rating: 4.6,
    reviewCount: 387,
  ),

  // Cedar Grove Cottages
  TravelRoom(
    id: 'tr-cg-1',
    stayId: 'ts-cedar-grove-cottages',
    name: 'Pine Cabin for Two',
    description: 'Wooden cabin with a fireplace and forest view',
    category: 'Cabin',
    unit: 'per night',
    pricePaise: 380000,
    mrpPaise: 450000,
    isBestSeller: true,
    tags: ['Fireplace', 'Free cancellation'],
    rating: 4.7,
    reviewCount: 460,
  ),
  TravelRoom(
    id: 'tr-cg-2',
    stayId: 'ts-cedar-grove-cottages',
    name: 'Family Lodge',
    description: 'Two-bedroom lodge with a private bonfire pit',
    category: 'Lodge',
    unit: 'per night',
    pricePaise: 620000,
    isTrending: true,
    tags: ['Bonfire pit', 'Sleeps 5'],
    rating: 4.8,
    reviewCount: 198,
  ),
  TravelRoom(
    id: 'tr-cg-3',
    stayId: 'ts-cedar-grove-cottages',
    name: 'Cosy Attic Room',
    description: 'Compact attic-style room with a snow-peak view',
    category: 'Standard',
    unit: 'per night',
    pricePaise: 260000,
    tags: ['Mountain view'],
    rating: 4.4,
    reviewCount: 220,
  ),

  // Azure Bay Resort
  TravelRoom(
    id: 'tr-ab-1',
    stayId: 'ts-azure-bay-resort',
    name: 'Beachfront Deluxe Room',
    description: 'Steps from the private beach with a private balcony',
    category: 'Deluxe',
    unit: 'per night',
    pricePaise: 880000,
    mrpPaise: 1050000,
    isBestSeller: true,
    tags: ['Private beach', 'Breakfast included'],
    rating: 4.5,
    reviewCount: 312,
  ),
  TravelRoom(
    id: 'tr-ab-2',
    stayId: 'ts-azure-bay-resort',
    name: 'Ocean Pool Villa',
    description: 'Villa with an infinity pool overlooking the bay',
    category: 'Villa',
    unit: 'per night',
    pricePaise: 1650000,
    isTrending: true,
    tags: ['Infinity pool', 'Butler service'],
    rating: 4.7,
    reviewCount: 158,
  ),
  TravelRoom(
    id: 'tr-ab-3',
    stayId: 'ts-azure-bay-resort',
    name: 'Garden Bungalow',
    description: 'Single-storey bungalow set in a tropical garden',
    category: 'Bungalow',
    unit: 'per night',
    pricePaise: 540000,
    tags: ['Free cancellation'],
    rating: 4.3,
    reviewCount: 204,
  ),
  TravelRoom(
    id: 'tr-ab-4',
    stayId: 'ts-azure-bay-resort',
    name: 'Spa Retreat Suite',
    description: 'Suite with complimentary access to the resort spa',
    category: 'Suite',
    unit: 'per night',
    pricePaise: 1120000,
    mrpPaise: 1300000,
    isNewArrival: true,
    tags: ['Spa access', 'Sea view'],
    rating: 4.6,
    reviewCount: 87,
  ),

  // Rajwada Haveli
  TravelRoom(
    id: 'tr-rh-1',
    stayId: 'ts-rajwada-haveli',
    name: 'Heritage Royal Room',
    description: 'Hand-painted walls and antique furnishings',
    category: 'Heritage',
    unit: 'per night',
    pricePaise: 560000,
    mrpPaise: 680000,
    isBestSeller: true,
    tags: ['Heritage decor', 'Free cancellation'],
    rating: 4.8,
    reviewCount: 540,
  ),
  TravelRoom(
    id: 'tr-rh-2',
    stayId: 'ts-rajwada-haveli',
    name: 'Maharaja Suite',
    description: 'The haveli\'s flagship suite with a private courtyard',
    category: 'Suite',
    unit: 'per night',
    pricePaise: 1380000,
    isTrending: true,
    tags: ['Private courtyard', 'Butler service'],
    rating: 4.9,
    reviewCount: 210,
  ),
  TravelRoom(
    id: 'tr-rh-3',
    stayId: 'ts-rajwada-haveli',
    name: 'Lake View Room',
    description: 'Room with sweeping views of Lake Pichola',
    category: 'Deluxe',
    unit: 'per night',
    pricePaise: 720000,
    tags: ['Lake view'],
    rating: 4.7,
    reviewCount: 366,
  ),
  TravelRoom(
    id: 'tr-rh-4',
    stayId: 'ts-rajwada-haveli',
    name: 'Courtyard Standard Room',
    description: 'Quiet room facing the inner courtyard',
    category: 'Standard',
    unit: 'per night',
    pricePaise: 380000,
    mrpPaise: 440000,
    tags: ['Free cancellation', 'Breakfast included'],
    rating: 4.4,
    reviewCount: 298,
  ),

  // Backwater Bamboo Stay
  TravelRoom(
    id: 'tr-bb-1',
    stayId: 'ts-backwater-bamboo-stay',
    name: 'Floating Bamboo Cottage',
    description: 'Cottage built on stilts above the backwaters',
    category: 'Cottage',
    unit: 'per night',
    pricePaise: 420000,
    mrpPaise: 500000,
    isBestSeller: true,
    tags: ['Lake view', 'Free cancellation'],
    rating: 4.6,
    reviewCount: 280,
  ),
  TravelRoom(
    id: 'tr-bb-2',
    stayId: 'ts-backwater-bamboo-stay',
    name: 'Premium Deck Suite',
    description: 'Suite with a private deck and kayak access',
    category: 'Suite',
    unit: 'per night',
    pricePaise: 680000,
    isTrending: true,
    tags: ['Kayak included', 'Breakfast included'],
    rating: 4.8,
    reviewCount: 122,
  ),
  TravelRoom(
    id: 'tr-bb-3',
    stayId: 'ts-backwater-bamboo-stay',
    name: 'Standard Bamboo Room',
    description: 'Simple, breezy room steps from the water',
    category: 'Standard',
    unit: 'per night',
    pricePaise: 260000,
    tags: ['Free cancellation'],
    rating: 4.3,
    reviewCount: 154,
  ),
];

const _travelReviews = <Review>[
  Review(
    id: 'rv-ts-nestview-1',
    targetId: 'ts-nestview-residency',
    reviewerName: 'Aarav Mehta',
    reviewerInitials: 'AM',
    rating: 4.5,
    text: 'The hill view from our balcony was unreal. Staff went out of their way to arrange a sunrise trek.',
    daysAgo: 6,
    helpfulCount: 34,
    verifiedOrder: true,
  ),
  Review(
    id: 'rv-ts-nestview-2',
    targetId: 'ts-nestview-residency',
    reviewerName: 'Priya Nair',
    reviewerInitials: 'PN',
    rating: 5,
    text: 'Best coffee-estate stay we\'ve had. The pool suite was spotless and breakfast was generous.',
    daysAgo: 14,
    helpfulCount: 51,
    verifiedOrder: true,
  ),
  Review(
    id: 'rv-ts-harbour-1',
    targetId: 'ts-harbour-pearl-suites',
    reviewerName: 'Rohan Kapoor',
    reviewerInitials: 'RK',
    rating: 4.7,
    text: 'Woke up to the sound of waves every morning. The jacuzzi suite was worth every rupee.',
    daysAgo: 3,
    helpfulCount: 22,
    verifiedOrder: true,
  ),
  Review(
    id: 'rv-ts-harbour-2',
    targetId: 'ts-harbour-pearl-suites',
    reviewerName: 'Sneha Iyer',
    reviewerInitials: 'SI',
    rating: 4.3,
    text: 'Gorgeous property, the beachfront cabana was a highlight. Slightly pricey but worth it for a special trip.',
    daysAgo: 20,
    helpfulCount: 18,
    verifiedOrder: false,
  ),
  Review(
    id: 'rv-ts-cedar-1',
    targetId: 'ts-cedar-grove-cottages',
    reviewerName: 'Vikram Singh',
    reviewerInitials: 'VS',
    rating: 4.8,
    text: 'The bonfire and pine cabin combo was magical. Felt like a movie set in the mountains.',
    daysAgo: 9,
    helpfulCount: 29,
    verifiedOrder: true,
  ),
  Review(
    id: 'rv-ts-azure-1',
    targetId: 'ts-azure-bay-resort',
    reviewerName: 'Anjali Rao',
    reviewerInitials: 'AR',
    rating: 4.4,
    text: 'Private beach access made all the difference. The infinity pool villa was stunning at sunset.',
    daysAgo: 11,
    helpfulCount: 27,
    verifiedOrder: true,
  ),
  Review(
    id: 'rv-ts-rajwada-1',
    targetId: 'ts-rajwada-haveli',
    reviewerName: 'Karan Malhotra',
    reviewerInitials: 'KM',
    rating: 5,
    text: 'Felt like royalty. The Maharaja Suite and the rooftop dinner under the stars were unforgettable.',
    daysAgo: 5,
    helpfulCount: 44,
    verifiedOrder: true,
  ),
  Review(
    id: 'rv-ts-rajwada-2',
    targetId: 'ts-rajwada-haveli',
    reviewerName: 'Divya Menon',
    reviewerInitials: 'DM',
    rating: 4.6,
    text: 'Heritage charm everywhere you look. The lake view room was the perfect spot to watch the sunset.',
    daysAgo: 17,
    helpfulCount: 19,
    verifiedOrder: false,
  ),
  Review(
    id: 'rv-ts-backwater-1',
    targetId: 'ts-backwater-bamboo-stay',
    reviewerName: 'Nikhil Joseph',
    reviewerInitials: 'NJ',
    rating: 4.7,
    text: 'Falling asleep to the sound of water against the bamboo cottage was so peaceful. Kayaking was a great add-on.',
    daysAgo: 8,
    helpfulCount: 25,
    verifiedOrder: true,
  ),
];

List<TravelRoom> roomsForStay(String stayId) =>
    allTravelRooms.where((r) => r.stayId == stayId).toList();

List<Review> travelReviewsFor(String targetId) =>
    _travelReviews.where((r) => r.targetId == targetId).toList();

TravelStay? findTravelStayById(String id) {
  for (final s in allTravelStays) {
    if (s.id == id) return s;
  }
  return null;
}

TravelRoom? findTravelRoomById(String id) {
  for (final r in allTravelRooms) {
    if (r.id == id) return r;
  }
  return null;
}

List<dynamic> searchTravelSeed(String query) {
  final q = query.trim().toLowerCase();
  if (q.isEmpty) return const [];
  final results = <dynamic>[];
  for (final s in allTravelStays) {
    if (s.name.toLowerCase().contains(q) ||
        s.location.toLowerCase().contains(q) ||
        s.amenities.any((a) => a.toLowerCase().contains(q))) {
      results.add(s);
    }
  }
  for (final r in allTravelRooms) {
    if (r.name.toLowerCase().contains(q) ||
        r.category.toLowerCase().contains(q) ||
        r.tags.any((t) => t.toLowerCase().contains(q))) {
      results.add(r);
    }
  }
  return results;
}

List<TravelRoom> travelTodaysOffers() =>
    allTravelRooms.where((r) => r.mrpPaise != null && r.mrpPaise! > r.pricePaise).toList();

List<TravelStay> trendingTravelStays() => allTravelStays.where((s) => s.isTrending).toList();

/// Bestseller rooms — the "Travel Must-Haves" collection.
List<TravelRoom> travelMustHaves() => allTravelRooms.where((r) => r.isBestSeller).toList();

/// Rooms tagged for couples — the "Romantic Getaways" collection.
List<TravelRoom> romanticGetaways() =>
    allTravelRooms.where((r) => r.tags.contains('Romantic setup')).toList();

/// Pool or spa amenity rooms — the "Pool & Spa Escapes" collection.
List<TravelRoom> poolAndSpaEscapes() => allTravelRooms
    .where((r) => r.tags.contains('Pool access') || r.tags.contains('Spa access'))
    .toList();

/// Free-cancellation rooms for the indecisive planner.
List<TravelRoom> flexiblePlans() =>
    allTravelRooms.where((r) => r.tags.contains('Free cancellation')).toList();

List<TravelRoom> bestSellerTravelRooms() => allTravelRooms.where((r) => r.isBestSeller).toList();
