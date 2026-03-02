import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import 'models/diary_entry.dart';

class DiaryService {
  final Dio _dio = DioClient.instance;

  Future<List<Map<String, dynamic>>> getClassrooms() async {
    try {
      final response = await _dio.get('/staff/attendance/classrooms');
      if (response.data['success'] == true) {
        return List<Map<String, dynamic>>.from(response.data['classrooms']);
      }
      throw Exception(response.data['error'] ?? 'Failed to fetch classrooms');
    } catch (e) {
      if (e is DioException && e.response != null) {
        final errorMsg = e.response?.data['error'] ?? 'Network error';
        throw Exception(errorMsg);
      }
      throw Exception('Network error: $e');
    }
  }

  Future<List<DiaryEntry>> getEntries({String? classroomId, String? month, String? type}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (classroomId != null && classroomId.isNotEmpty) queryParams['classroomId'] = classroomId;
      if (month != null && month.isNotEmpty) queryParams['month'] = month;
      if (type != null && type.isNotEmpty && type != 'ALL') queryParams['type'] = type;

      final response = await _dio.get('/staff/diary', queryParameters: queryParams);
      if (response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => DiaryEntry.fromJson(json)).toList();
      }
      throw Exception(response.data['error'] ?? 'Failed to fetch diary entries');
    } catch (e) {
      if (e is DioException && e.response != null) {
        final errorMsg = e.response?.data['error'] ?? 'Network error';
        throw Exception(errorMsg);
      }
      throw Exception('Network error: $e');
    }
  }

  Future<DiaryEntry> createEntry(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/staff/diary', data: data);
      if (response.data['success'] == true) {
        return DiaryEntry.fromJson(response.data['data']);
      }
      throw Exception(response.data['error'] ?? 'Failed to create entry');
    } catch (e) {
      if (e is DioException && e.response != null) {
        final errorMsg = e.response?.data['error'] ?? 'Network error';
        throw Exception(errorMsg);
      }
      throw Exception('Network error: $e');
    }
  }

  Future<DiaryEntry> updateEntry(String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.put('/staff/diary/$id', data: data);
      if (response.data['success'] == true) {
        return DiaryEntry.fromJson(response.data['data']);
      }
      throw Exception(response.data['error'] ?? 'Failed to update entry');
    } catch (e) {
      if (e is DioException && e.response != null) {
        final errorMsg = e.response?.data['error'] ?? 'Network error';
        throw Exception(errorMsg);
      }
      throw Exception('Network error: $e');
    }
  }

  Future<void> deleteEntry(String id) async {
    try {
      final response = await _dio.delete('/staff/diary/$id');
      if (response.data['success'] != true) {
        throw Exception(response.data['error'] ?? 'Failed to delete entry');
      }
    } catch (e) {
      if (e is DioException && e.response != null) {
        final errorMsg = e.response?.data['error'] ?? 'Network error';
        throw Exception(errorMsg);
      }
      throw Exception('Network error: $e');
    }
  }
}
