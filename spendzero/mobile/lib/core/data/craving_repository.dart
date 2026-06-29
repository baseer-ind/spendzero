import '../models/craving_completed.dart';
import '../network/api_client.dart';

class CravingRepository {
  CravingRepository(this._client);

  final ApiClient _client;

  Future<CravingCompleted> checkout({
    required String categoryId,
    String? brandId,
    required List<Map<String, dynamic>> items,
  }) async {
    final json = await _client.post('/craving-sessions/checkout', body: {
      'category_id': categoryId,
      'brand_id': brandId,
      'items': items,
    }) as Map<String, dynamic>;
    return CravingCompleted.fromJson(json);
  }

  Future<void> recordOutcome({
    required String cravingSessionId,
    required String outcome,
    String? goalId,
  }) async {
    await _client.post('/craving-sessions/$cravingSessionId/outcome', body: {
      'outcome': outcome,
      'goal_id': goalId,
    });
  }
}
