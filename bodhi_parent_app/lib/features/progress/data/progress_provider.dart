import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

// ─── Progress Data Models ────────────────────────────────────────────────────

class ReportCard {
  final String id;
  final String term;
  final Map<String, dynamic> marks;
  final String? comments;
  final String? publishedAt;

  ReportCard({required this.id, required this.term, required this.marks, this.comments, this.publishedAt});

  factory ReportCard.fromJson(Map<String, dynamic> json) => ReportCard(
    id: json['id'] ?? '',
    term: json['term'] ?? '',
    marks: Map<String, dynamic>.from(json['marks'] ?? {}),
    comments: json['comments'],
    publishedAt: json['publishedAt'],
  );
}

class ExamResult {
  final String id;
  final String? subject;
  final double? marks;
  final String? grade;
  final String? remarks;
  final Map<String, dynamic>? exam;

  ExamResult({required this.id, this.subject, this.marks, this.grade, this.remarks, this.exam});

  factory ExamResult.fromJson(Map<String, dynamic> json) => ExamResult(
    id: json['id'] ?? '',
    subject: json['subject'],
    marks: (json['marks'] as num?)?.toDouble(),
    grade: json['grade'],
    remarks: json['remarks'],
    exam: json['exam'] != null ? Map<String, dynamic>.from(json['exam']) : null,
  );
}

class DevelopmentDomain {
  final String domain;
  final String? color;
  final List<Map<String, dynamic>> milestones;

  DevelopmentDomain({required this.domain, this.color, required this.milestones});

  factory DevelopmentDomain.fromJson(Map<String, dynamic> json) => DevelopmentDomain(
    domain: json['domain'] ?? '',
    color: json['color'],
    milestones: List<Map<String, dynamic>>.from(json['milestones'] ?? []),
  );
}

class SkillDomain {
  final String domain;
  final String? color;
  final List<Map<String, dynamic>> skills;

  SkillDomain({required this.domain, this.color, required this.skills});

  factory SkillDomain.fromJson(Map<String, dynamic> json) => SkillDomain(
    domain: json['domain'] ?? '',
    color: json['color'],
    skills: List<Map<String, dynamic>>.from(json['skills'] ?? []),
  );
}

class ProgressData {
  final List<ReportCard> reportCards;
  final List<ExamResult> examResults;
  final List<Map<String, dynamic>> developmentReports;
  final List<DevelopmentDomain> milestonesByDomain;
  final List<SkillDomain> skillsByDomain;
  final List<Map<String, dynamic>> portfolio;

  ProgressData({
    required this.reportCards,
    required this.examResults,
    required this.developmentReports,
    required this.milestonesByDomain,
    required this.skillsByDomain,
    required this.portfolio,
  });

  factory ProgressData.fromJson(Map<String, dynamic> json) => ProgressData(
    reportCards: (json['reportCards'] as List? ?? []).map((e) => ReportCard.fromJson(e)).toList(),
    examResults: (json['examResults'] as List? ?? []).map((e) => ExamResult.fromJson(e)).toList(),
    developmentReports: List<Map<String, dynamic>>.from(json['developmentReports'] ?? []),
    milestonesByDomain: (json['milestonesByDomain'] as List? ?? []).map((e) => DevelopmentDomain.fromJson(e)).toList(),
    skillsByDomain: (json['skillsByDomain'] as List? ?? []).map((e) => SkillDomain.fromJson(e)).toList(),
    portfolio: List<Map<String, dynamic>>.from(json['portfolio'] ?? []),
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

final progressDataProvider = FutureProvider.family<ProgressData, String>((ref, studentId) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get(
    'parent/progress',
    queryParameters: {'studentId': studentId},
  );

  if (response.data['success'] == true) {
    return ProgressData.fromJson(response.data['data']);
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load progress');
  }
});
