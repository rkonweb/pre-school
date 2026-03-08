import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

class ExtracurricularEnrollment {
  final String id;
  final String status;
  final String activityName;
  final String activityCategory;

  ExtracurricularEnrollment({
    required this.id,
    required this.status,
    required this.activityName,
    required this.activityCategory,
  });

  factory ExtracurricularEnrollment.fromJson(Map<String, dynamic> json) {
    return ExtracurricularEnrollment(
      id: json['id'],
      status: json['status'],
      activityName: json['activity']['name'],
      activityCategory: json['activity']['category'],
    );
  }
}

class ExtracurricularAward {
  final String id;
  final String title;
  final String date;
  final String activityName;
  final String? description;

  ExtracurricularAward({
    required this.id,
    required this.title,
    required this.date,
    required this.activityName,
    this.description,
  });

  factory ExtracurricularAward.fromJson(Map<String, dynamic> json) {
    return ExtracurricularAward(
      id: json['id'],
      title: json['title'],
      date: json['date'] ?? json['createdAt'],
      activityName: json['activity']['name'],
      description: json['description'],
    );
  }
}

class ExtracurricularPerformance {
  final String id;
  final String metrics;
  final String score;
  final String activityName;
  final String date;

  ExtracurricularPerformance({
    required this.id,
    required this.metrics,
    required this.score,
    required this.activityName,
    required this.date,
  });

  factory ExtracurricularPerformance.fromJson(Map<String, dynamic> json) {
    return ExtracurricularPerformance(
      id: json['id'],
      metrics: json['metrics'],
      score: json['score'],
      activityName: json['activity']['name'],
      date: json['createdAt'],
    );
  }
}

class ExtracurricularAttendance {
  final String id;
  final String status;
  final String date;
  final String activityName;
  final String? notes;

  ExtracurricularAttendance({
    required this.id,
    required this.status,
    required this.date,
    required this.activityName,
    this.notes,
  });

  factory ExtracurricularAttendance.fromJson(Map<String, dynamic> json) {
    return ExtracurricularAttendance(
      id: json['id'],
      status: json['status'],
      date: json['date'],
      activityName: json['activityName'],
      notes: json['notes'],
    );
  }
}

class ExtracurricularData {
  final List<ExtracurricularEnrollment> enrollments;
  final List<ExtracurricularAward> awards;
  final List<ExtracurricularPerformance> performance;
  final List<ExtracurricularAttendance> attendance;

  ExtracurricularData({
    required this.enrollments,
    required this.awards,
    required this.performance,
    required this.attendance,
  });

  factory ExtracurricularData.fromJson(Map<String, dynamic> json) {
    return ExtracurricularData(
      enrollments: (json['enrollments'] as List)
          .map((e) => ExtracurricularEnrollment.fromJson(e))
          .toList(),
      awards: (json['awards'] as List)
          .map((e) => ExtracurricularAward.fromJson(e))
          .toList(),
      performance: (json['performance'] as List)
          .map((e) => ExtracurricularPerformance.fromJson(e))
          .toList(),
      attendance: (json['attendance'] as List)
          .map((e) => ExtracurricularAttendance.fromJson(e))
          .toList(),
    );
  }
}

final extracurricularDataProvider = FutureProvider.family<ExtracurricularData, String>((ref, studentId) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get(
    'parent/extracurricular',
    queryParameters: {'studentId': studentId},
  );

  if (response.data['success']) {
    return ExtracurricularData.fromJson(response.data['data']);
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load extracurricular data');
  }
});
