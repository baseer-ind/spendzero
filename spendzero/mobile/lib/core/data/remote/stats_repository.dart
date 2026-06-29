import '../../models/user_stats.dart';
import '../../network/api_client.dart';
import '../contracts.dart';

class ApiStatsRepository implements StatsRepository {
  ApiStatsRepository(this._client);

  final ApiClient _client;

  @override
  Future<UserStats> fetchStats() async {
    final json = await _client.get('/me/stats') as Map<String, dynamic>;
    return UserStats.fromJson(json);
  }
}
