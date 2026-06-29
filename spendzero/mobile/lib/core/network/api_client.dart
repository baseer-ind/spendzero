import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/env.dart';

class ApiException implements Exception {
  ApiException(this.statusCode, this.message);

  final int statusCode;
  final String message;

  @override
  String toString() => 'ApiException($statusCode): $message';
}

/// Thin REST client shared by all repositories. Attaches the guest device
/// id to every request so the backend can resolve/create the user without
/// requiring sign-in.
class ApiClient {
  ApiClient({required this.deviceId, http.Client? client})
      : _client = client ?? http.Client();

  final String deviceId;
  final http.Client _client;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'X-Device-Id': deviceId,
      };

  Future<dynamic> get(String path) async {
    final response = await _client
        .get(Uri.parse('${Env.apiBaseUrl}$path'), headers: _headers)
        .timeout(const Duration(seconds: 10));
    return _decode(response);
  }

  Future<dynamic> post(String path, {Object? body}) async {
    final response = await _client
        .post(
          Uri.parse('${Env.apiBaseUrl}$path'),
          headers: _headers,
          body: body == null ? null : jsonEncode(body),
        )
        .timeout(const Duration(seconds: 10));
    return _decode(response);
  }

  dynamic _decode(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    }
    throw ApiException(response.statusCode, response.body);
  }
}
