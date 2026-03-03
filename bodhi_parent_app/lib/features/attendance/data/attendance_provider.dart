import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

class AttendanceRecord {
  final String id;
  final String date;
  final String status;
  final String? notes;

  AttendanceRecord({
    required this.id,
    required this.date,
    required this.status,
    this.notes,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    return AttendanceRecord(
      id: json['id'],
      date: json['date'],
      status: json['status'],
      notes: json['notes'],
    );
  }
}

final attendanceDataProvider = FutureProvider.family<List<AttendanceRecord>, String>((ref, studentId) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get(
    'parent/attendance',
    queryParameters: {'studentId': studentId},
  );

  if (response.data['success']) {
    final List<dynamic> data = response.data['records'];
    return data.map((r) => AttendanceRecord.fromJson(r)).toList();
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load attendance');
  }
});
