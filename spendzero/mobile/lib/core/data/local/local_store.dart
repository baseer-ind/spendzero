import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

/// Thin JSON read/write helper over SharedPreferences, used by every
/// `Local*Repository` so on-device persistence has one consistent shape.
class LocalStore {
  Future<SharedPreferences> get _prefs => SharedPreferences.getInstance();

  Future<List<Map<String, dynamic>>> readList(String key) async {
    final prefs = await _prefs;
    final raw = prefs.getString(key);
    if (raw == null) return [];
    return (jsonDecode(raw) as List).map((e) => e as Map<String, dynamic>).toList();
  }

  Future<void> writeList(String key, List<Map<String, dynamic>> value) async {
    final prefs = await _prefs;
    await prefs.setString(key, jsonEncode(value));
  }

  Future<Map<String, dynamic>?> readMap(String key) async {
    final prefs = await _prefs;
    final raw = prefs.getString(key);
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  Future<void> writeMap(String key, Map<String, dynamic> value) async {
    final prefs = await _prefs;
    await prefs.setString(key, jsonEncode(value));
  }
}
