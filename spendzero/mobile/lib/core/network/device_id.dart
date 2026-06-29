import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

const _deviceIdKey = 'spendzero_device_id';

/// Stable per-install identity used for guest mode — no sign-in required.
/// Matches `guest_devices.device_id` on the backend (see
/// docs/04-database-schema.md) and is sent as the `X-Device-Id` header.
Future<String> getOrCreateDeviceId() async {
  final prefs = await SharedPreferences.getInstance();
  final existing = prefs.getString(_deviceIdKey);
  if (existing != null && existing.isNotEmpty) return existing;

  final generated = const Uuid().v4();
  await prefs.setString(_deviceIdKey, generated);
  return generated;
}
