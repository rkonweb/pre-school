import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';

// You can swap this with your production URL later
const String baseUrl = 'http://localhost:3000/api/mobile/v1/staff/auth';

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

final localAuthProvider = Provider<LocalAuthentication>((ref) {
  return LocalAuthentication();
});

class AuthService {
  final FlutterSecureStorage _storage;
  final LocalAuthentication _localAuth;
  final Dio _dio = Dio();

  AuthService(this._storage, this._localAuth);

  Future<bool> hasValidToken() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  Future<String?> getToken() async {
    if (kIsWeb || Platform.isMacOS) {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString('jwt_token');
    }
    try {
      return await _storage.read(key: 'jwt_token');
    } catch (e) {
      print('Secure Storage read failed: \$e. Falling back to SharedPreferences.');
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString('jwt_token');
    }
  }

  Future<void> saveToken(String token) async {
    if (kIsWeb || Platform.isMacOS) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', token);
      return;
    }
    try {
      await _storage.write(key: 'jwt_token', value: token);
    } catch (e) {
      print('Secure Storage write failed: \$e. Falling back to SharedPreferences.');
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', token);
    }
  }

  Future<void> logout() async {
    if (kIsWeb || Platform.isMacOS) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('jwt_token');
      return;
    }
    try {
      await _storage.delete(key: 'jwt_token');
    } catch (e) {
      print('Secure Storage delete failed: \$e. Falling back to SharedPreferences.');
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('jwt_token');
    }
    // Clear local DB tables if necessary (Users, etc.)
  }

  /// Request OTP from Next.js Backend
  Future<bool> requestOtp(String mobile) async {
    try {
      print('=== REQUESTING OTP FOR ' + mobile + ' ===');
      final response = await _dio.post(baseUrl + '/request-otp', data: {
        'mobile': mobile,
      });
      print('OTP Response: ');
      print(response.data);
      return response.data['success'] == true;
    } on DioException catch (e) {
      print('=== DIO EXCEPTION START ===');
      print('Type: ');
      print(e.type);
      print('Message: ');
      print(e.message);
      print('Error: ');
      print(e.error);
      if (e.response != null) {
        print('Response Data: ');
        print(e.response!.data);
        print('Response Status: ');
        print(e.response!.statusCode);
      }
      print('=== DIO EXCEPTION END ===');
      
      String errorMsg = 'Failed to request OTP';
      if (e.response?.data is Map<String, dynamic>) {
          errorMsg = e.response!.data['error'] ?? e.message ?? errorMsg;
      } else {
          errorMsg = e.message ?? errorMsg;
      }
      throw Exception(errorMsg);
    } catch (e) {
      print('Unknown Error: ');
      print(e);
      throw Exception('Unexpected error: ' + e.toString());
    }
  }

  /// Verify OTP & Receive JWT
  Future<Map<String, dynamic>> verifyOtp(String mobile, String code) async {
    try {
      print('=== VERIFYING OTP FOR ' + mobile + ' ===');
      final response = await _dio.post(baseUrl + '/verify-otp', data: {
        'mobile': mobile,
        'code': code,
      });
      print('Verify Response: ');
      print(response.data);

      if (response.data['success'] == true) {
        final token = response.data['token'];
        await saveToken(token);
        return response.data;
      }
      throw Exception('Failed to verify OTP');
    } on DioException catch (e) {
      print('=== DIO EXCEPTION START ===');
      print('Type: ');
      print(e.type);
      print('Message: ');
      print(e.message);
      print('Error: ');
      print(e.error);
      if (e.response != null) {
        print('Response Data: ');
        print(e.response!.data);
        print('Response Status: ');
        print(e.response!.statusCode);
      }
      print('=== DIO EXCEPTION END ===');
      
      String errorMsg = 'Verification Failed';
      if (e.response?.data is Map<String, dynamic>) {
          errorMsg = e.response!.data['error'] ?? e.message ?? errorMsg;
      } else {
          errorMsg = e.message ?? errorMsg;
      }
      throw Exception(errorMsg);
    } catch (e) {
      print('Unknown Error: ');
      print(e);
      throw Exception('Unexpected error: ' + e.toString());
    }
  }

  /// Fetch current user + school branding using the stored JWT token.
  /// Returns the full response map (with `school` object) on success, or null on failure.
  Future<Map<String, dynamic>?> fetchBranding() async {
    try {
      final token = await getToken();
      if (token == null || token.isEmpty) return null;
      final response = await _dio.get(
        baseUrl + '/me',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      if (response.data['success'] == true) {
        return response.data as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      print('fetchBranding error: $e');
      return null;
    }
  }

  /// Attempts generic biometric authentication (FaceID / TouchID / Fingerprint)
  Future<bool> authenticateBiometrics(String reason) async {
    try {
      final isAvailable = await _localAuth.canCheckBiometrics ||
          await _localAuth.isDeviceSupported();
      if (!isAvailable)
        return true; // Fallback to PIN/Password if device doesn't support biometrics

      return await _localAuth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: false,
        ),
      );
    } catch (e) {
      print('Biometric Error: \$e');
      return false;
    }
  }
}

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(
      ref.read(secureStorageProvider), ref.read(localAuthProvider));
});
