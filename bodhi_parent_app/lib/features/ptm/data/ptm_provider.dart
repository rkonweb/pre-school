import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

class PtmSlot {
  final String id;
  final String teacherName;
  final String subject;
  final String date;
  final String startTime;
  final String endTime;
  final bool isBooked;
  final String? bookedBy;

  PtmSlot({
    required this.id,
    required this.teacherName,
    required this.subject,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.isBooked,
    this.bookedBy,
  });

  factory PtmSlot.fromJson(Map<String, dynamic> json) => PtmSlot(
    id: json['id'] ?? '',
    teacherName: json['teacherName'] ?? json['teacher']?['name'] ?? '',
    subject: json['subject'] ?? '',
    date: json['date'] ?? '',
    startTime: json['startTime'] ?? '',
    endTime: json['endTime'] ?? '',
    isBooked: json['isBooked'] ?? false,
    bookedBy: json['bookedBy'],
  );
}

class PtmBooking {
  final String id;
  final String teacherName;
  final String subject;
  final String date;
  final String startTime;
  final String endTime;
  final String status;

  PtmBooking({
    required this.id,
    required this.teacherName,
    required this.subject,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.status,
  });

  factory PtmBooking.fromJson(Map<String, dynamic> json) => PtmBooking(
    id: json['id'] ?? '',
    teacherName: json['teacherName'] ?? json['slot']?['teacher']?['name'] ?? '',
    subject: json['subject'] ?? json['slot']?['subject'] ?? '',
    date: json['date'] ?? json['slot']?['date'] ?? '',
    startTime: json['startTime'] ?? json['slot']?['startTime'] ?? '',
    endTime: json['endTime'] ?? json['slot']?['endTime'] ?? '',
    status: json['status'] ?? 'PENDING',
  );
}

final ptmSlotsProvider = FutureProvider.family<List<PtmSlot>, String>((ref, studentId) async {
  final api = ref.read(apiClientProvider);
  try {
    final r = await api.get('parent/ptm/slots', queryParameters: {'studentId': studentId});
    if (r.data['success'] == true) {
      return (r.data['slots'] as List? ?? []).map((e) => PtmSlot.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  } catch (_) {
    return [];
  }
});

final ptmBookingsProvider = FutureProvider.family<List<PtmBooking>, String>((ref, studentId) async {
  final api = ref.read(apiClientProvider);
  try {
    final r = await api.get('parent/ptm/bookings', queryParameters: {'studentId': studentId});
    if (r.data['success'] == true) {
      return (r.data['bookings'] as List? ?? []).map((e) => PtmBooking.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  } catch (_) {
    return [];
  }
});
