/// Bundled, fully offline "Movies / Cinemas" catalogue: fictional cinema
/// chains with bookable showtimes and reviews. Mirrors the spirit of
/// `travel_seed_data.dart` — hand-written, no network calls, no real
/// brands. Used by `LocalMoviesRepository` so the movies vertical works
/// with zero backend. Ticket quantity reuses the existing cart pipeline
/// the same way Travel reuses it for nights booked.
library;

class CinemaBrand {
  const CinemaBrand({
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
    required this.movieIds,
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
  final List<String> movieIds;
}

class Movie {
  const Movie({
    required this.id,
    required this.cinemaId,
    required this.title,
    required this.description,
    required this.genre,
    required this.language,
    required this.durationMins,
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
  final String cinemaId;
  final String title;
  final String description;
  final String genre;
  final String language;
  final int durationMins;
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

const allCinemaBrands = <CinemaBrand>[
  CinemaBrand(
    id: 'cb-starlight-multiplex',
    name: 'Starlight Multiplex',
    brandTagline: 'Big screens, bigger sound',
    location: 'MG Road',
    amenities: ['IMAX', 'Dolby Atmos', 'Recliner Seats', 'Food Court'],
    avgRating: 4.5,
    reviewCount: 3200,
    distanceKm: 2.1,
    priceTier: '₹₹',
    isTrending: true,
    isFeatured: true,
    bannerColorSeed: 'cb-starlight-multiplex',
    movieIds: ['mv-st-1', 'mv-st-2', 'mv-st-3', 'mv-st-4', 'mv-st-5'],
  ),
  CinemaBrand(
    id: 'cb-velvet-screens',
    name: 'Velvet Screens',
    brandTagline: 'Premium seats, premium cinema',
    location: 'Indiranagar',
    amenities: ['4DX', 'Luxury Lounge', 'Valet Parking', 'Bar'],
    avgRating: 4.7,
    reviewCount: 1850,
    distanceKm: 4.6,
    priceTier: '₹₹₹',
    isTrending: true,
    isFeatured: false,
    bannerColorSeed: 'cb-velvet-screens',
    movieIds: ['mv-vs-1', 'mv-vs-2', 'mv-vs-3', 'mv-vs-4'],
  ),
  CinemaBrand(
    id: 'cb-cornerplex-talkies',
    name: 'CornerPlex Talkies',
    brandTagline: 'The neighbourhood favourite',
    location: 'Jayanagar',
    amenities: ['2D', '3D', 'Snack Bar', 'Wheelchair Access'],
    avgRating: 4.1,
    reviewCount: 980,
    distanceKm: 1.4,
    priceTier: '₹',
    isTrending: false,
    isFeatured: true,
    bannerColorSeed: 'cb-cornerplex-talkies',
    movieIds: ['mv-cp-1', 'mv-cp-2', 'mv-cp-3'],
  ),
];

const allMovies = <Movie>[
  Movie(
    id: 'mv-st-1',
    cinemaId: 'cb-starlight-multiplex',
    title: 'Zenith: Edge of Tomorrow',
    description: 'A sci-fi epic about a pilot racing against time to stop a planetary collapse.',
    genre: 'Sci-Fi',
    language: 'English',
    durationMins: 148,
    pricePaise: 35000,
    mrpPaise: 40000,
    isBestSeller: true,
    tags: ['IMAX', 'Action', 'New Release'],
    rating: 4.6,
    reviewCount: 2100,
  ),
  Movie(
    id: 'mv-st-2',
    cinemaId: 'cb-starlight-multiplex',
    title: 'The Last Monsoon',
    description: 'A heartfelt drama set across three generations of a coastal family.',
    genre: 'Drama',
    language: 'Hindi',
    durationMins: 132,
    pricePaise: 28000,
    isTrending: true,
    tags: ['Drama', 'Family'],
    rating: 4.4,
    reviewCount: 1340,
  ),
  Movie(
    id: 'mv-st-3',
    cinemaId: 'cb-starlight-multiplex',
    title: 'Heistwave',
    description: 'A slick crew pulls off the impossible in a neon-lit metropolis.',
    genre: 'Thriller',
    language: 'English',
    durationMins: 121,
    pricePaise: 32000,
    mrpPaise: 38000,
    isNewArrival: true,
    tags: ['Thriller', 'Heist'],
    rating: 4.3,
    reviewCount: 760,
  ),
  Movie(
    id: 'mv-st-4',
    cinemaId: 'cb-starlight-multiplex',
    title: 'Laughing Stock',
    description: 'A washed-up comedian gets one last shot at a comeback tour.',
    genre: 'Comedy',
    language: 'English',
    durationMins: 105,
    pricePaise: 25000,
    tags: ['Comedy'],
    rating: 4.0,
    reviewCount: 540,
  ),
  Movie(
    id: 'mv-st-5',
    cinemaId: 'cb-starlight-multiplex',
    title: 'Skyforge Origins',
    description: 'An animated origin story for the Skyforge universe, for the whole family.',
    genre: 'Animation',
    language: 'English',
    durationMins: 98,
    pricePaise: 26000,
    isBestSeller: true,
    tags: ['Animation', 'Family'],
    rating: 4.5,
    reviewCount: 1900,
  ),
  Movie(
    id: 'mv-vs-1',
    cinemaId: 'cb-velvet-screens',
    title: 'Crimson Ledger',
    description: 'A forensic accountant uncovers a conspiracy that reaches the top of her firm.',
    genre: 'Thriller',
    language: 'English',
    durationMins: 138,
    pricePaise: 45000,
    mrpPaise: 50000,
    isBestSeller: true,
    tags: ['4DX', 'Thriller'],
    rating: 4.6,
    reviewCount: 870,
  ),
  Movie(
    id: 'mv-vs-2',
    cinemaId: 'cb-velvet-screens',
    title: 'Echoes of Avalon',
    description: 'A sweeping fantasy saga of a kingdom on the brink of war.',
    genre: 'Fantasy',
    language: 'English',
    durationMins: 162,
    pricePaise: 48000,
    isTrending: true,
    tags: ['Fantasy', 'Epic'],
    rating: 4.7,
    reviewCount: 1120,
  ),
  Movie(
    id: 'mv-vs-3',
    cinemaId: 'cb-velvet-screens',
    title: 'Midnight Reverie',
    description: 'A jazz musician\'s love story unfolds across one unforgettable night.',
    genre: 'Romance',
    language: 'Hindi',
    durationMins: 124,
    pricePaise: 40000,
    isNewArrival: true,
    tags: ['Romance', 'Music'],
    rating: 4.4,
    reviewCount: 430,
  ),
  Movie(
    id: 'mv-vs-4',
    cinemaId: 'cb-velvet-screens',
    title: 'Iron Tide',
    description: 'A submarine crew battles betrayal from within during a covert mission.',
    genre: 'Action',
    language: 'English',
    durationMins: 118,
    pricePaise: 42000,
    mrpPaise: 47000,
    tags: ['Action', 'Naval'],
    rating: 4.2,
    reviewCount: 360,
  ),
  Movie(
    id: 'mv-cp-1',
    cinemaId: 'cb-cornerplex-talkies',
    title: 'Auto Stand Diaries',
    description: 'A slice-of-life comedy following three auto drivers in a buzzing city.',
    genre: 'Comedy',
    language: 'Hindi',
    durationMins: 112,
    pricePaise: 15000,
    isBestSeller: true,
    tags: ['Comedy', 'Local'],
    rating: 4.3,
    reviewCount: 640,
  ),
  Movie(
    id: 'mv-cp-2',
    cinemaId: 'cb-cornerplex-talkies',
    title: 'Village Lantern',
    description: 'A young teacher rebuilds a school in a village forgotten by the city.',
    genre: 'Drama',
    language: 'Hindi',
    durationMins: 128,
    pricePaise: 14000,
    tags: ['Drama'],
    rating: 4.5,
    reviewCount: 410,
  ),
  Movie(
    id: 'mv-cp-3',
    cinemaId: 'cb-cornerplex-talkies',
    title: 'Bazaar Beats',
    description: 'A street musician forms an unlikely band with bazaar vendors.',
    genre: 'Musical',
    language: 'Hindi',
    durationMins: 119,
    pricePaise: 16000,
    isNewArrival: true,
    tags: ['Musical', 'Family'],
    rating: 4.1,
    reviewCount: 290,
  ),
];

const allMovieReviews = <Review>[
  Review(
    id: 'rv-mv-1',
    targetId: 'mv-st-1',
    reviewerName: 'Aarav Mehta',
    reviewerInitials: 'AM',
    rating: 5,
    text: 'The IMAX screen made the launch sequence feel real. Worth every rupee.',
    daysAgo: 2,
    helpfulCount: 41,
    verifiedOrder: true,
  ),
  Review(
    id: 'rv-mv-2',
    targetId: 'mv-st-2',
    reviewerName: 'Sneha Iyer',
    reviewerInitials: 'SI',
    rating: 4.5,
    text: 'Brought tears more than once. Stellar performances from the whole cast.',
    daysAgo: 6,
    helpfulCount: 22,
    verifiedOrder: true,
  ),
  Review(
    id: 'rv-mv-3',
    targetId: 'mv-vs-1',
    reviewerName: 'Karan Shah',
    reviewerInitials: 'KS',
    rating: 4.5,
    text: 'The 4DX seats added so much to the chase scenes. Velvet Screens never disappoints.',
    daysAgo: 3,
    helpfulCount: 33,
    verifiedOrder: true,
  ),
  Review(
    id: 'rv-mv-4',
    targetId: 'mv-vs-2',
    reviewerName: 'Priya Nair',
    reviewerInitials: 'PN',
    rating: 5,
    text: 'Visually stunning fantasy world-building, easily the best this year.',
    daysAgo: 9,
    helpfulCount: 58,
    verifiedOrder: false,
  ),
  Review(
    id: 'rv-mv-5',
    targetId: 'mv-cp-1',
    reviewerName: 'Ravi Kumar',
    reviewerInitials: 'RK',
    rating: 4,
    text: 'So relatable and funny — CornerPlex tickets are always a steal too.',
    daysAgo: 12,
    helpfulCount: 17,
    verifiedOrder: true,
  ),
  Review(
    id: 'rv-mv-6',
    targetId: 'mv-cp-3',
    reviewerName: 'Divya Rao',
    reviewerInitials: 'DR',
    rating: 4,
    text: 'Loved the soundtrack — small cinema, big heart.',
    daysAgo: 15,
    helpfulCount: 9,
    verifiedOrder: false,
  ),
];

List<Movie> moviesForCinema(String cinemaId) =>
    allMovies.where((m) => m.cinemaId == cinemaId).toList();

List<Review> movieReviewsFor(String targetId) =>
    allMovieReviews.where((r) => r.targetId == targetId).toList();

CinemaBrand? findCinemaBrandById(String id) =>
    allCinemaBrands.where((c) => c.id == id).firstOrNull;

Movie? findMovieById(String id) =>
    allMovies.where((m) => m.id == id).firstOrNull;

List<dynamic> searchMoviesSeed(String query) {
  final q = query.toLowerCase();
  final cinemas = allCinemaBrands.where((c) =>
      c.name.toLowerCase().contains(q) || c.location.toLowerCase().contains(q));
  final movies = allMovies.where((m) =>
      m.title.toLowerCase().contains(q) ||
      m.genre.toLowerCase().contains(q) ||
      m.tags.any((t) => t.toLowerCase().contains(q)));
  return [...cinemas, ...movies];
}

List<Movie> moviesTodaysOffers() =>
    allMovies.where((m) => m.discountPercent != null).toList();

List<CinemaBrand> trendingCinemaBrands() =>
    allCinemaBrands.where((c) => c.isTrending).toList();

List<Movie> bestSellerMovies() =>
    allMovies.where((m) => m.isBestSeller).toList();

List<Movie> bestRatedMovies() {
  final eligible = allMovies.where((m) => m.reviewCount >= 50).toList()
    ..sort((a, b) => b.rating.compareTo(a.rating));
  return eligible.take(12).toList();
}

List<Movie> hiddenGemMovies() {
  final eligible = allMovies
      .where((m) => m.rating >= 4.4 && m.reviewCount < 50)
      .toList()
    ..sort((a, b) => b.rating.compareTo(a.rating));
  return eligible.take(12).toList();
}

/// Fresh-on-screen titles — the "New Releases" collection.
List<Movie> newReleases() => allMovies.where((m) => m.isNewArrival).toList();

/// Family-friendly genres for a group outing.
List<Movie> familyWatch() =>
    allMovies.where((m) => m.genre == 'Family' || m.tags.contains('Family')).toList();

/// High-octane picks for the thrill-seekers.
List<Movie> actionPacked() => allMovies
    .where((m) => m.genre == 'Action' || m.tags.contains('Action'))
    .toList();

/// Big-format premium experiences (IMAX / 4DX).
List<Movie> premiumExperience() => allMovies
    .where((m) => m.tags.contains('IMAX') || m.tags.contains('4DX'))
    .toList();

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
