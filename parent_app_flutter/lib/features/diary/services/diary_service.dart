import 'package:parent_app_flutter/core/network/api_client.dart';

class DiaryService {
  static Future<List<dynamic>> fetchDiaryEntries(String studentId) async {
    try {
      final response = await ApiClient.dio.get('/diary', queryParameters: {
        'studentId': studentId
      });
      if (response.data['success']) {
        return response.data['data'] as List<dynamic>;
      } else {
        throw Exception(response.data['error'] ?? 'Failed to load diary');
      }
    } catch (e) {
      throw Exception('Failed to communicate with server: $e');
    }
  }

  // Future backend endpoint for adding note & acknowledging
}
