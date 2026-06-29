/// Backend base URL. Override per-environment with:
///   flutter run --dart-define=API_BASE_URL=https://api.spendzero.app/api/v1
class Env {
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8000/api/v1',
  );
}
