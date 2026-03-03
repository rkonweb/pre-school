import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/dio_client.dart';

final attendanceServiceProvider = Provider<AttendanceService>((ref) {
  return AttendanceService();
});

class AttendanceService {
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
        throw Exception((data is Map ? data['error'] : null) ?? 'Network error');
      }
      throw Exception('Network error: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getStudents(
      String slug, String classroomId, String date) async {
    try {
      final response = await _dio.get(
        'attendance/students',
        queryParameters: {
          'slug': slug,
          'classroomId': classroomId,
          'date': date,
        },
      );
      if (response.data is Map && response.data['success'] == true) {
        return List<Map<String, dynamic>>.from(response.data['students']);
      }
      throw Exception((response.data is Map ? response.data['error'] : null) ?? 'Failed to fetch students');
    } catch (e) {
      if (e is DioException && e.response != null) {
        final data = e.response?.data;
        throw Exception((data is Map ? data['error'] : null) ?? 'Network error');
      }
      throw Exception('Network error: $e');
    }
  }

  Future<bool> markAttendance({
    required String slug,
    required String studentId,
    required String date,
    required String status,
    String? notes,
    String? academicYearId,
  }) async {
    try {
      final response = await _dio.post(
        'attendance/mark',
        data: {
          'slug': slug,
          'studentId': studentId,
          'date': date,
          'status': status,
          'notes': notes,
          'academicYearId': academicYearId,
        },
      );
      return response.data is Map && response.data['success'] == true;
    } catch (e) {
       if (e is DioException && e.response != null) {
        final data = e.response?.data;
        throw Exception((data is Map ? data['error'] : null) ?? 'Network error');
      }
      throw Exception('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> getDashboardStats() async {
    try {
      final response = await _dio.get('attendance/dashboard');
      if (response.data is Map && response.data['success'] == true) {
        return Map<String, dynamic>.from(response.data);
      }
      throw Exception((response.data is Map ? response.data['error'] : null) ?? 'Failed to load dashboard');
    } catch (e) {
      if (e is DioException && e.response != null) {
        final data = e.response?.data;
        throw Exception((data is Map ? data['error'] : null) ?? 'Network error');
      }
      throw Exception('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> getStudentMonthlyReport(String studentId, String month) async {
    try {
      final response = await _dio.get(
        'attendance/monthly',
        queryParameters: {'studentId': studentId, 'month': month},
      );
      if (response.data is Map && response.data['success'] == true) {
        return Map<String, dynamic>.from(response.data);
      }
      throw Exception((response.data is Map ? response.data['error'] : null) ?? 'Failed to load report');
    } catch (e) {
      if (e is DioException && e.response != null) {
        final data = e.response?.data;
        throw Exception((data is Map ? data['error'] : null) ?? 'Network error');
      }
      throw Exception('Network error: $e');
    }
  }
}
