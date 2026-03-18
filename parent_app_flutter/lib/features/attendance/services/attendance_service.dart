import '../../../core/network/api_client.dart';

class AttendanceService {
  static Future<Map<String, dynamic>?> fetchAttendance(String studentId, {int? month, int? year}) async {
    try {
      final Map<String, dynamic> queryParams = {
        'studentId': studentId,
      };
      if (month != null) queryParams['month'] = month;
      if (year != null) queryParams['year'] = year;

      final response = await ApiClient.dio.get('/attendance', queryParameters: queryParams);

      if (response.data['success'] == true) {
        return response.data['data'];
      }
      return null;
    } catch (e) {
      print('Error fetching attendance: $e');
      throw Exception('Failed to fetch attendance');
    }
  }
}
