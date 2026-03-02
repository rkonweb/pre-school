import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../auth/auth_service.dart';

final attendanceServiceProvider = Provider<AttendanceService>((ref) {
  return AttendanceService(ref.read(authServiceProvider));
});

class AttendanceService {
  final AuthService _auth;
  final Dio _dio = Dio();
  final String _baseUrl = 'http://localhost:3000/api/mobile/v1/staff/attendance';

  AttendanceService(this._auth);

  Future<Options> _getOptions() async {
    final token = await _auth.getToken();
    return Options(headers: {'Authorization': 'Bearer $token'});
  }

  Future<List<Map<String, dynamic>>> getClassrooms() async {
    try {
      final response = await _dio.get(
        '$_baseUrl/classrooms',
        options: await _getOptions(),
      );
      if (response.data['success'] == true) {
        return List<Map<String, dynamic>>.from(response.data['classrooms']);
      }
      throw Exception(response.data['error'] ?? 'Failed to fetch classrooms');
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getStudents(
      String slug, String classroomId, String date) async {
    try {
      final response = await _dio.get(
        '$_baseUrl/students',
        queryParameters: {
          'slug': slug,
          'classroomId': classroomId,
          'date': date,
        },
        options: await _getOptions(),
      );
      if (response.data['success'] == true) {
        return List<Map<String, dynamic>>.from(response.data['students']);
      }
      throw Exception(response.data['error'] ?? 'Failed to fetch students');
    } catch (e) {
      rethrow;
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
        '$_baseUrl/mark',
        data: {
          'slug': slug,
          'studentId': studentId,
          'date': date,
          'status': status,
          'notes': notes,
          'academicYearId': academicYearId,
        },
        options: await _getOptions(),
      );
      return response.data['success'] == true;
    } catch (e) {
      rethrow;
    }
  }
}
