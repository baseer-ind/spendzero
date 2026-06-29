import '../models/user_stats.dart';
import '../network/api_client.dart';

class StatsRepository {
  StatsRepository(this._client);

  final ApiClient _client;

  Future<UserStats> fetchStats() async {
    final json = await _client.get('/me/stats') as Map<String, dynamic>;
    return UserStats.fromJson(json);
  }
}
