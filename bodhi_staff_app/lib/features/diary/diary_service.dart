import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import 'models/diary_entry.dart';

class DiaryService {
  final Dio _dio = DioClient.instance;

  Future<List<Map<String, dynamic>>> getClassrooms() async {
    try {
      final response = await _dio.get('attendance/classrooms');
      if (response.data is Map && response.data['success'] == true) {
        return List<Map<String, dynamic>>.from(response.data['classrooms']);
      }
      throw Exception((response.data is Map ? response.data['error'] : null) ?? 'Failed to fetch classrooms');
    } catch (e) {
      if (e is DioException && e.response != null) {
        final data = e.response?.data;
        final errorMsg = (data is Map ? data['error'] : null) ?? 'Network error';
        throw Exception(errorMsg);
      }
      throw Exception('Network error: $e');
    }
  }

  Future<List<DiaryEntry>> getEntries({String? classroomId, String? month, String? date, String? type, bool onlyMine = false}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (classroomId != null && classroomId.isNotEmpty) queryParams['classroomId'] = classroomId;
      if (month != null && month.isNotEmpty) queryParams['month'] = month;
      if (date != null && date.isNotEmpty) queryParams['date'] = date;
      if (type != null && type.isNotEmpty && type != 'ALL') queryParams['type'] = type;
      if (onlyMine) queryParams['onlyMine'] = 'true';

      final response = await _dio.get('diary', queryParameters: queryParams);
      if (response.data is Map && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => DiaryEntry.fromJson(json)).toList();
      }
      throw Exception((response.data is Map ? response.data['error'] : null) ?? 'Failed to fetch diary entries');
    } catch (e) {
      if (e is DioException) {
        if (e.type == DioExceptionType.receiveTimeout ||
            e.type == DioExceptionType.connectionTimeout ||
            e.type == DioExceptionType.sendTimeout) {
          throw Exception('Server took too long to respond. Please try again.');
        }
        if (e.response != null) {
          final data = e.response?.data;
          throw Exception((data is Map ? data['error'] : null) ?? 'Network error');
        }
        throw Exception('Cannot connect to server. Check your connection.');
      }
      throw Exception('Network error: $e');
    }
  }
  Future<DiaryEntry> createEntry(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('diary', data: data);
      if (response.data is Map && response.data['success'] == true) {
        return DiaryEntry.fromJson(response.data['data']);
      }
      throw Exception((response.data is Map ? response.data['error'] : null) ?? 'Failed to create entry');
    } catch (e) {
      if (e is DioException && e.response != null) {
        final data = e.response?.data;
        final errorMsg = (data is Map ? data['error'] : null) ?? 'Network error';
        throw Exception(errorMsg);
      }
      throw Exception('Network error: $e');
    }
  }

  Future<DiaryEntry> updateEntry(String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.put('diary/$id', data: data);
      if (response.data is Map && response.data['success'] == true) {
        return DiaryEntry.fromJson(response.data['data']);
      }
      throw Exception((response.data is Map ? response.data['error'] : null) ?? 'Failed to update entry');
    } catch (e) {
      if (e is DioException && e.response != null) {
        final data = e.response?.data;
        final errorMsg = (data is Map ? data['error'] : null) ?? 'Network error';
        throw Exception(errorMsg);
      }
      throw Exception('Network error: $e');
    }
  }

  Future<void> deleteEntry(String id) async {
    try {
      final response = await _dio.delete('diary/$id');
      if (response.data is Map && response.data['success'] != true) {
        throw Exception(response.data['error'] ?? 'Failed to delete entry');
      }
    } catch (e) {
      if (e is DioException && e.response != null) {
        final data = e.response?.data;
        final errorMsg = (data is Map ? data['error'] : null) ?? 'Network error';
        throw Exception(errorMsg);
      }
      throw Exception('Network error: $e');
    }
  }
}
