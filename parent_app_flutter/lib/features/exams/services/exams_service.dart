import '../../../core/network/api_client.dart';

class ExamsService {
  static Future<Map<String, dynamic>?> fetchExams(String studentId) async {
    try {
      final response = await ApiClient.dio.get('/exams', queryParameters: {
        'studentId': studentId,
      });

      if (response.data['success'] == true) {
        return response.data['data'];
      }
      return null;
    } catch (e) {
      print('Error fetching exams: $e');
      throw Exception('Failed to fetch exams');
    }
  }
}
