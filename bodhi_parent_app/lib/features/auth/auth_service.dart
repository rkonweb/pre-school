import 'package:universal_io/io.dart' show Platform;
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'dart:convert';
import 'dart:typed_data';
import '../../../core/config/app_config.dart';
import '../../../core/config/school_config_service.dart';
import '../../../core/api/api_client.dart';

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

class AuthService {
  final FlutterSecureStorage _storage;
  final Ref? _ref;
  final Dio _dio = Dio();

  AuthService(this._storage, [this._ref]);

  String get baseUrl => '${AppConfig.apiBaseUrl}auth';

  // Decode JWT payload (base64url middle segment)
  Map<String, dynamic>? _decodeJwtPayload(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;
      String payload = parts[1];
      // Pad base64
      switch (payload.length % 4) {
        case 2: payload += '=='; break;
        case 3: payload += '='; break;
      }
      final decoded = base64Url.decode(payload);
      return jsonDecode(utf8.decode(decoded)) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  bool isTokenExpired(String token) {
    final payload = _decodeJwtPayload(token);
    if (payload == null) return true;
    final exp = payload['exp'];
    if (exp == null) return false;
    final expSeconds = exp is int ? exp : int.tryParse(exp.toString()) ?? 0;
    final nowSeconds = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    return nowSeconds >= expSeconds;
  }

  Future<bool> hasValidToken() async {
    final token = await getToken();
    if (token == null || token.isEmpty) return false;
    return !isTokenExpired(token);
  }

  Future<String?> getToken() async {
    if (kIsWeb || Platform.isMacOS) {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString('parent_jwt_token');
    }
    try {
      return await _storage.read(key: 'parent_jwt_token');
    } catch (e) {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString('parent_jwt_token');
    }
  }

  Future<void> saveToken(String token) async {
    if (kIsWeb || Platform.isMacOS) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('parent_jwt_token', token);
      return;
    }
    try {
      await _storage.write(key: 'parent_jwt_token', value: token);
    } catch (e) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('parent_jwt_token', token);
    }
  }

  Future<void> logout() async {
    // Clear school config cache so next login fetches fresh keys
    await SchoolConfigService.clear();
    if (_ref != null) {
      _ref!.read(schoolConfigProvider.notifier).state = SchoolConfig.defaults;
    }

    if (kIsWeb || Platform.isMacOS) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('parent_jwt_token');
      return;
    }
    try {
      await _storage.delete(key: 'parent_jwt_token');
    } catch (e) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('parent_jwt_token');
    }
  }

  Future<bool> requestOtp(String mobile) async {
    try {
      final response = await _dio.post('$baseUrl/request-otp', data: {
        'phone': mobile,
        'type': 'PARENT'
      });
      return response.data['success'] == true;
    } on DioException catch (e) {
      String errorMsg = 'Failed to request OTP';
      if (e.response?.data is Map<String, dynamic>) {
          errorMsg = e.response!.data['error'] ?? e.message ?? errorMsg;
      }
      throw Exception(errorMsg);
    }
  }

  Future<Map<String, dynamic>> verifyOtp(String mobile, String code) async {
    try {
      final response = await _dio.post('$baseUrl/verify-otp', data: {
        'phone': mobile,
        'otp': code,
      });

      if (response.data['success'] == true) {
        final token = response.data['token'];
        await saveToken(token);

        // ── Fetch school config from ERP settings ──────────────────────────
        // The school admin configures Razorpay key, Maps key, feature flags,
        // etc. in the ERP Login Settings page. We fetch that config now and
        // cache it so the rest of the app reads live keys instead of stubs.
        try {
          if (_ref != null) {
            final apiClient = _ref!.read(apiClientProvider);
            final config = await SchoolConfigService.fetchAndCache(apiClient);
            // Notify reactive providers so UI can update (e.g., feature flags)
            _ref!.read(schoolConfigProvider.notifier).state = config;
          }
        } catch (e) {
          // Non-fatal — the app works with cached or default config
          debugPrint('AuthService: school config fetch failed: $e');
        }

        return response.data;
      }
      throw Exception('Failed to verify OTP');
    } on DioException catch (e) {
      String errorMsg = 'Verification Failed';
      if (e.response?.data is Map<String, dynamic>) {
          errorMsg = e.response!.data['error'] ?? e.message ?? errorMsg;
      }
      throw Exception(errorMsg);
    }
  }

  Future<Map<String, dynamic>?> fetchBranding() async {
    try {
      final token = await getToken();
      if (token == null || token.isEmpty) return null;
      final response = await _dio.get(
        '$baseUrl/me',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      if (response.data['success'] == true) {
        return response.data as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.read(secureStorageProvider), ref);
});
