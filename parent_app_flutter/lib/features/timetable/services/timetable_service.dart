import '../../../core/network/api_client.dart';

class TimetableService {
  static Future<Map<String, dynamic>?> fetchTimetable(String studentId) async {
    try {
      final response = await ApiClient.dio.get('/timetable', queryParameters: {
        'studentId': studentId,
      });

      if (response.data['success'] == true) {
        return response.data['data'];
      }
      return null;
    } catch (e) {
      print('Error fetching timetable: $e');
      throw Exception('Failed to fetch timetable');
    }
  }
}
