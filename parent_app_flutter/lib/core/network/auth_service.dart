import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../network/api_client.dart';
import 'dart:convert';

class AuthService {
  static Future<bool> requestOtp(String mobile) async {
    try {
      final response = await ApiClient.dio.post('/auth/request-otp', data: {
        'mobile': mobile,
      });
      return response.data['success'] == true;
    } catch (e) {
       print('Error requesting OTP: $e');
       return false;
    }
  }

  static Future<Map<String, dynamic>?> verifyOtp(String mobile, String code) async {
    try {
      final response = await ApiClient.dio.post('/auth/verify-otp', data: {
        'mobile': mobile,
        'code': code,
      });

      if (response.data['success'] == true && response.data['token'] != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', response.data['token']);
        
        // Save user data (including linked students)
        await prefs.setString('user_data', jsonEncode(response.data['user']));
        await prefs.setString('school_data', jsonEncode(response.data['school']));

        // By default, select the first student
        final students = response.data['user']['students'] as List<dynamic>;
        if (students.isNotEmpty) {
           await prefs.setString('active_student_id', students[0]['id']);
        }

        return response.data;
      }
      return null;
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
         throw Exception(e.response?.data['error'] ?? 'Invalid or expired OTP');
      }
      print('Error verifying OTP: $e');
      throw Exception('Network error');
    }
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
    await prefs.remove('school_data');
    await prefs.remove('active_student_id');
  }

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token') != null;
  }
}
