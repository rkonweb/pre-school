import '../../../core/network/api_client.dart';

class FeesService {
  static Future<Map<String, dynamic>?> fetchFees(String studentId) async {
    try {
      final response = await ApiClient.dio.get('/fees', queryParameters: {
        'studentId': studentId,
      });

      if (response.data['success'] == true) {
        return response.data['data'];
      }
      return null;
    } catch (e) {
      print('Error fetching fees: $e');
      throw Exception('Failed to fetch fees');
    }
  }
}
