import '../contracts_travel.dart';
import 'travel_seed_data.dart';

/// On-device implementation of [TravelRepository], serving the bundled
/// fictional stay/room catalogue in `travel_seed_data.dart`. No network
/// calls, no artificial delay — mirrors the synchronous-under-the-hood
/// style of the other `Local*Repository` classes.
class LocalTravelRepository implements TravelRepository {
  @override
  Future<List<TravelStay>> fetchStays({
    String? categoryFilter,
    String? sortBy,
  }) async {
    var results = List<TravelStay>.from(allTravelStays);

    if (categoryFilter != null && categoryFilter.isNotEmpty) {
      results = results
          .where((s) => s.amenities.any(
              (a) => a.toLowerCase() == categoryFilter.toLowerCase()))
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
  Future<List<TravelRoom>> fetchRooms(String stayId) async {
    return roomsForStay(stayId);
  }

  @override
  Future<List<dynamic>> searchTravel(String query) async {
    return searchTravelSeed(query);
  }

  @override
  Future<List<Review>> fetchReviews(String targetId) async {
    return travelReviewsFor(targetId);
  }

  @override
  Future<List<TravelRoom>> fetchTodaysOffers() async {
    return travelTodaysOffers();
  }

  @override
  Future<List<TravelStay>> fetchTrending() async {
    return trendingTravelStays();
  }

  @override
  Future<List<TravelRoom>> fetchBestSellers() async {
    return bestSellerTravelRooms();
  }

  @override
  Future<TravelStay?> fetchStay(String stayId) async {
    return findTravelStayById(stayId);
  }

  @override
  Future<TravelRoom?> fetchRoom(String roomId) async {
    return findTravelRoomById(roomId);
  }
}
