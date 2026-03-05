import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

class HealthRecord {
  final String id;
  final double? height;
  final double? weight;
  final double? bmi;
  final String? visionLeft;
  final String? visionRight;
  final String? generalHealth;
  final String? bloodPressure;
  final int? pulseRate;
  final String? recordedAt;

  HealthRecord({
    required this.id,
    this.height,
    this.weight,
    this.bmi,
    this.visionLeft,
    this.visionRight,
    this.generalHealth,
    this.bloodPressure,
    this.pulseRate,
    this.recordedAt,
  });

  factory HealthRecord.fromJson(Map<String, dynamic> json) => HealthRecord(
    id: json['id'] ?? '',
    height: (json['height'] as num?)?.toDouble(),
    weight: (json['weight'] as num?)?.toDouble(),
    bmi: (json['bmi'] as num?)?.toDouble(),
    visionLeft: json['visionLeft'],
    visionRight: json['visionRight'],
    generalHealth: json['generalHealth'],
    bloodPressure: json['bloodPressure'],
    pulseRate: json['pulseRate'],
    recordedAt: json['recordedAt'],
  );
}

class HealthData {
  final String? bloodGroup;
  final String? allergies;
  final String? medicalConditions;
  final Map<String, dynamic>? emergencyContact;
  final List<HealthRecord> healthRecords;

  HealthData({
    this.bloodGroup,
    this.allergies,
    this.medicalConditions,
    this.emergencyContact,
    required this.healthRecords,
  });

  factory HealthData.fromJson(Map<String, dynamic> json) => HealthData(
    bloodGroup: json['bloodGroup'],
    allergies: json['allergies'],
    medicalConditions: json['medicalConditions'],
    emergencyContact: json['emergencyContact'] != null
        ? Map<String, dynamic>.from(json['emergencyContact'])
        : null,
    healthRecords: (json['healthRecords'] as List? ?? []).map((e) => HealthRecord.fromJson(e)).toList(),
  );
}

final healthDataProvider = FutureProvider.family<HealthData, String>((ref, studentId) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get(
    'parent/health',
    queryParameters: {'studentId': studentId},
  );

  if (response.data['success'] == true) {
    return HealthData.fromJson(response.data['data']);
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load health records');
  }
});
