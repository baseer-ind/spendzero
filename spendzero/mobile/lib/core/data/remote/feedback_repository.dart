import '../../config/env.dart';
import '../../network/api_client.dart';
import '../contracts.dart';

class ApiFeedbackRepository implements FeedbackRepository {
  ApiFeedbackRepository(this._client, this._deviceId);

  final ApiClient _client;
  final String _deviceId;

  @override
  Future<void> submit({
    required String message,
    String category = 'general',
    int? rating,
  }) async {
    await _client.post('/feedback', body: {
      'message': message,
      'category': category,
      'rating': rating,
      'app_version': appVersion,
      'environment': Env.envName,
      'device_id': _deviceId,
    });
  }
}
