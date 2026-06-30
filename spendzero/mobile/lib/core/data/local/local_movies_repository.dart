import '../contracts_movies.dart';
import 'movies_seed_data.dart';

/// On-device implementation of [MoviesRepository], serving the bundled
/// fictional cinema/showtime catalogue in `movies_seed_data.dart`.
class LocalMoviesRepository implements MoviesRepository {
  @override
  Future<List<CinemaBrand>> fetchCinemas({
    String? categoryFilter,
    String? sortBy,
  }) async {
    var results = List<CinemaBrand>.from(allCinemaBrands);

    if (categoryFilter != null && categoryFilter.isNotEmpty) {
      results = results
          .where((c) => c.amenities
              .any((a) => a.toLowerCase() == categoryFilter.toLowerCase()))
          .toList();
    }

    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.avgRating.compareTo(a.avgRating));
        break;
      case 'distance':
        results.sort((a, b) => a.distanceKm.compareTo(b.distanceKm));
        break;
      default:
        break;
    }

    return results;
  }

  @override
  Future<List<Movie>> fetchMovies(String cinemaId) async {
    return moviesForCinema(cinemaId);
  }

  @override
  Future<List<dynamic>> searchMovies(String query) async {
    return searchMoviesSeed(query);
  }

  @override
  Future<List<Review>> fetchReviews(String targetId) async {
    return movieReviewsFor(targetId);
  }

  @override
  Future<List<Movie>> fetchTodaysOffers() async {
    return moviesTodaysOffers();
  }

  @override
  Future<List<CinemaBrand>> fetchTrending() async {
    return trendingCinemaBrands();
  }

  @override
  Future<List<Movie>> fetchBestSellers() async {
    return bestSellerMovies();
  }

  @override
  Future<CinemaBrand?> fetchCinema(String cinemaId) async {
    return findCinemaBrandById(cinemaId);
  }

  @override
  Future<Movie?> fetchMovie(String movieId) async {
    return findMovieById(movieId);
  }
}
