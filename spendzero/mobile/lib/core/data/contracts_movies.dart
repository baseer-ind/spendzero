import 'local/movies_seed_data.dart';

/// Contract for the "Movies" vertical (cinemas + showtimes). Local-only for
/// now (see [LocalMoviesRepository]), no remote counterpart required.
abstract class MoviesRepository {
  Future<List<CinemaBrand>> fetchCinemas({
    String? categoryFilter,
    String? sortBy,
  });

  Future<List<Movie>> fetchMovies(String cinemaId);

  Future<List<dynamic>> searchMovies(String query);

  Future<List<Review>> fetchReviews(String targetId);

  Future<List<Movie>> fetchTodaysOffers();

  Future<List<CinemaBrand>> fetchTrending();

  Future<List<Movie>> fetchBestSellers();

  Future<CinemaBrand?> fetchCinema(String cinemaId);

  Future<Movie?> fetchMovie(String movieId);
}
