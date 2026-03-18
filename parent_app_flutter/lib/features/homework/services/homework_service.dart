import '../../../core/network/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';

class HomeworkService {
  static Future<Map<String, dynamic>?> fetchHomework(String studentId) async {
    try {
      final response = await ApiClient.dio.get('/homework', queryParameters: {
        'studentId': studentId,
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw Exception(response.data['error'] ?? 'Unknown backend error');
      }
    } catch (e) {
      if (e is DioException && e.response?.data != null) {
          throw Exception(e.response?.data['error'] ?? 'Failed to fetch homework');
      }
      throw Exception('Failed to fetch homework: $e');
    }
  }
}
