import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/dio_client.dart';

final timetableServiceProvider = Provider<TimetableService>((ref) {
  return TimetableService();
});

class TimetableService {
  final Dio _dio = DioClient.instance;

  Future<Map<String, dynamic>> getTimetableData() async {
    try {
      final response = await _dio.get('timetable');
      if (response.data is Map && response.data['success'] == true) {
        return response.data['data'];
      }
      throw Exception((response.data is Map ? response.data['error'] : null) ?? 'Failed to fetch timetable');
    } catch (e) {
      if (e is DioException && e.response != null) {
        final data = e.response?.data;
        throw Exception((data is Map ? data['error'] : null) ?? 'Network error');
      }
       throw Exception('Network error: $e');
    }
  }
}
