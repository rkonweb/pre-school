import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

// ─── Models ──────────────────────────────────────────────────────────────────
class Period {
  final String id;
  final String startTime;
  final String endTime;
  final String subject;
  final String teacherName;
  final String? room;
  final int periodNumber;
  final String day;

  Period({
    required this.id,
    required this.startTime,
    required this.endTime,
    required this.subject,
    required this.teacherName,
    this.room,
    required this.periodNumber,
    required this.day,
  });

  factory Period.fromJson(Map<String, dynamic> json) => Period(
    id: json['id'] ?? '',
    startTime: json['startTime'] ?? '',
    endTime: json['endTime'] ?? '',
    subject: json['subject'] ?? json['subjectName'] ?? '',
    teacherName: json['teacherName'] ?? json['teacher']?['name'] ?? '',
    room: json['room'],
    periodNumber: json['periodNumber'] ?? json['order'] ?? 1,
    day: json['day'] ?? '',
  );
}

class TimetableData {
  final Map<String, List<Period>> schedule; // day -> periods

  TimetableData({required this.schedule});

  factory TimetableData.fromJson(Map<String, dynamic> json) {
    final schedule = <String, List<Period>>{};
    final days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (final day in days) {
      final dayData = json[day] ?? json[day.toLowerCase()] ?? [];
      schedule[day] = (dayData as List).map((e) => Period.fromJson(e as Map<String, dynamic>)).toList();
    }
    return TimetableData(schedule: schedule);
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
final timetableProvider = FutureProvider.family<TimetableData, String>((ref, studentId) async {
  final apiClient = ref.read(apiClientProvider);
  try {
    final response = await apiClient.get('parent/timetable', queryParameters: {'studentId': studentId});
    if (response.data['success'] == true) {
      return TimetableData.fromJson(response.data['data'] ?? response.data);
    }
    throw Exception(response.data['error'] ?? 'Failed to load timetable');
  } catch (e) {
    if (e.toString().contains('404')) return TimetableData(schedule: {});
    rethrow;
  }
});
