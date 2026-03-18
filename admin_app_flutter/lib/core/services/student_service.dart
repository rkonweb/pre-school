import 'dart:convert';
import 'package:http/http.dart' as http;

class StudentService {
  final String baseUrl = 'http://localhost:3000/api/mobile/v1/staff/students';
  final String? token;

  StudentService({this.token});

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (token != null) 'Authorization': 'Bearer $token',
  };

  Future<List<Map<String, dynamic>>> fetchStudents({String? search, String? grade}) async {
    try {
      final queryParams = <String, String>{};
      if (search != null && search.isNotEmpty) queryParams['search'] = search;
      if (grade != null && grade.isNotEmpty) queryParams['grade'] = grade;
      
      final uri = Uri.parse(baseUrl).replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);

      final response = await http.get(uri, headers: _headers);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return List<Map<String, dynamic>>.from(data['data']);
        }
      }
      throw Exception('Failed to fetch students: ${response.body}');
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchStudentDetails(String id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/$id'), headers: _headers);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return Map<String, dynamic>.from(data['data']);
        }
      }
      throw Exception('Failed to fetch student details: ${response.body}');
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createStudent(Map<String, dynamic> studentData) async {
    try {
      // Map frontend field names to backend if necessary
      // GenericCrudForm uses keys like 'studentName', backend might want 'firstName', 'lastName'
      // For now, we assume keys are aligned or handled in the provider/registry
      final response = await http.post(
        Uri.parse(baseUrl),
        headers: _headers,
        body: jsonEncode(studentData),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return Map<String, dynamic>.from(data['data']);
        }
      }
      throw Exception('Failed to create student: ${response.body}');
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> updateStudent(String id, Map<String, dynamic> studentData) async {
    try {
      final response = await http.patch(
        Uri.parse(baseUrl),
        headers: _headers,
        body: jsonEncode({'id': id, ...studentData}),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return Map<String, dynamic>.from(data['data']);
        }
      }
      throw Exception('Failed to update student: ${response.body}');
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteStudent(String id) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl?id=$id'),
        headers: _headers,
      );
      if (response.statusCode != 200) {
        throw Exception('Failed to delete student: ${response.body}');
      }
    } catch (e) {
      rethrow;
    }
  }
}
