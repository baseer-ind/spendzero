import '../../models/goal.dart';
import '../../network/api_client.dart';
import '../contracts.dart';

class ApiGoalRepository implements GoalRepository {
  ApiGoalRepository(this._client);

  final ApiClient _client;

  @override
  Future<List<SavingsGoal>> fetchGoals() async {
    final json = await _client.get('/goals') as List<dynamic>;
    return json
        .map((item) => SavingsGoal.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<SavingsGoal> createGoal({
    required String title,
    required String emoji,
    required int targetPaise,
  }) async {
    final json = await _client.post('/goals', body: {
      'title': title,
      'icon_key': emoji,
      'target_amount_paise': targetPaise,
    }) as Map<String, dynamic>;
    return SavingsGoal.fromJson(json);
  }
}
