import 'dart:convert';
import 'package:http/http.dart' as http;
import '../state/auth_state.dart';

class GenericCrudService {
  final String? token;
  static final String baseUrl = 'http://localhost:3000/api/mobile/v1/staff/crud';

  GenericCrudService({this.token});

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (token != null) 'Authorization': 'Bearer $token',
  };

  Future<List<Map<String, dynamic>>> fetchRecords(String moduleKey) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/$moduleKey'), headers: _headers);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return List<Map<String, dynamic>>.from(data['data']);
        }
      }
      throw Exception('Failed to fetch $moduleKey: ${response.body}');
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createRecord(String moduleKey, Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/$moduleKey'),
        headers: _headers,
        body: jsonEncode(data),
      );
      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded['success'] == true) {
          return Map<String, dynamic>.from(decoded['data']);
        }
        throw Exception(decoded['error'] ?? 'Server error');
      }
      throw Exception('Failed to create $moduleKey: ${response.body}');
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteRecord(String moduleKey, String id) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/$moduleKey?id=$id'),
        headers: _headers,
      );
      if (response.statusCode != 200) {
        throw Exception('Failed to delete $moduleKey: ${response.body}');
      }
    } catch (e) {
      rethrow;
    }
  }
}
