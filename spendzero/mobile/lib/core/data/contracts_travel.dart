import 'local/travel_seed_data.dart';

abstract class TravelRepository {
  Future<List<TravelStay>> fetchStays({String? categoryFilter, String? sortBy});
  Future<List<TravelRoom>> fetchRooms(String stayId);
  Future<List<dynamic>> searchTravel(String query);
  Future<List<Review>> fetchReviews(String targetId);
  Future<List<TravelRoom>> fetchTodaysOffers();
  Future<List<TravelStay>> fetchTrending();
  Future<List<TravelRoom>> fetchBestSellers();
  Future<TravelStay?> fetchStay(String stayId);
  Future<TravelRoom?> fetchRoom(String roomId);
}
