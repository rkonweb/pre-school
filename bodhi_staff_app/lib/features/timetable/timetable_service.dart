import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../auth/auth_service.dart';

final timetableServiceProvider = Provider<TimetableService>((ref) {
  return TimetableService(ref.read(authServiceProvider));
});

class TimetableService {
  final AuthService _auth;
  final Dio _dio = Dio();
  final String _baseUrl = 'http://localhost:3000/api/mobile/v1/staff/timetable';

  TimetableService(this._auth);

  Future<Options> _getOptions() async {
    final token = await _auth.getToken();
    return Options(headers: {'Authorization': 'Bearer $token'});
  }

  Future<Map<String, dynamic>> getTimetableData() async {
    try {
      final response = await _dio.get(
        _baseUrl,
        options: await _getOptions(),
      );
      if (response.data['success'] == true) {
        return response.data['data'];
      }
      throw Exception(response.data['error'] ?? 'Failed to fetch timetable');
    } catch (e) {
      rethrow;
    }
  }
}
