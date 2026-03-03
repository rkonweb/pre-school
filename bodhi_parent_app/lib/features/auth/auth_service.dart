import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';

// Adjust based on actual parent API endpoints
const String baseUrl = 'http://localhost:3000/api/mobile/v1/auth';

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

class AuthService {
  final FlutterSecureStorage _storage;
  final Dio _dio = Dio();

  AuthService(this._storage);

  Future<bool> hasValidToken() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
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
  return AuthService(ref.read(secureStorageProvider));
});
