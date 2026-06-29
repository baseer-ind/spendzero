import '../config/env.dart';
import '../network/api_client.dart';

class FeedbackRepository {
  FeedbackRepository(this._client, this._deviceId);

  final ApiClient _client;
  final String _deviceId;

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

/// Kept in one place so it's easy to bump per release without chasing
/// every call site. No `package_info_plus` dependency yet — see
/// docs/22-release-readiness.md.
const appVersion = '0.1.0';
