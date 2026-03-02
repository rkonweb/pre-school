import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/services/notification_service.dart';
import 'timetable_service.dart';

class TimetablePeriod {
  final String time;
  final String startTime;
  final String endTime;
  final String type;
  final String subject;
  final String? className;
  final String? classId;
  final String? teacherId;
  final String? teacherName;

  TimetablePeriod({
    required this.time,
    this.startTime = '',
    this.endTime = '',
    this.type = 'CLASS',
    required this.subject,
    this.className,
    this.classId,
    this.teacherId,
    this.teacherName,
  });

  factory TimetablePeriod.fromJson(Map<String, dynamic> json) {
    return TimetablePeriod(
      time: json['time'] ?? 'N/A',
      startTime: json['startTime'] ?? '',
      endTime: json['endTime'] ?? '',
      type: json['type'] ?? 'CLASS',
      subject: json['subject'] ?? 'Activity',
      className: json['className'],
      classId: json['classId'],
      teacherId: json['teacherId'],
      teacherName: json['teacherName'],
    );
  }
}

class TimetableClassroom {
  final String id;
  final String name;
  final Map<String, List<TimetablePeriod>> schedule;

  TimetableClassroom({
    required this.id,
    required this.name,
    required this.schedule,
  });

  factory TimetableClassroom.fromJson(Map<String, dynamic> json) {
    final scheduleMap = <String, List<TimetablePeriod>>{};
    if (json['timetable'] != null && json['timetable'] is List) {
      for (var dayObj in json['timetable']) {
        final day = dayObj['day'] as String;
        final periods = (dayObj['periods'] as List? ?? [])
            .map((p) => TimetablePeriod.fromJson(p))
            .toList();
        scheduleMap[day] = periods;
      }
    }
    return TimetableClassroom(
      id: json['id'],
      name: json['name'],
      schedule: scheduleMap,
    );
  }
}

class TimetableState {
  final Map<String, List<TimetablePeriod>> mySchedule;
  final List<TimetableClassroom> classrooms;
  final String selectedView; // 'MY' or classroomId
  final String selectedDay;
  final bool isLoading;
  final String? error;

  TimetableState({
    this.mySchedule = const {},
    this.classrooms = const [],
    this.selectedView = 'MY',
    this.selectedDay = 'Monday',
    this.isLoading = false,
    this.error,
  });

  TimetableState copyWith({
    Map<String, List<TimetablePeriod>>? mySchedule,
    List<TimetableClassroom>? classrooms,
    String? selectedView,
    String? selectedDay,
    bool? isLoading,
    String? error,
  }) {
    return TimetableState(
      mySchedule: mySchedule ?? this.mySchedule,
      classrooms: classrooms ?? this.classrooms,
      selectedView: selectedView ?? this.selectedView,
      selectedDay: selectedDay ?? this.selectedDay,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }

  List<TimetablePeriod> get currentPeriods {
    if (selectedView == 'MY') {
      return mySchedule[selectedDay] ?? [];
    } else {
      final cls = classrooms.firstWhere((c) => c.id == selectedView);
      return cls.schedule[selectedDay] ?? [];
    }
  }
}

class TimetableNotifier extends StateNotifier<TimetableState> {
  final TimetableService _service;

  TimetableNotifier(this._service) : super(TimetableState(selectedDay: _getCurrentDay())) {
    loadTimetable();
  }

  static String _getCurrentDay() {
    final now = DateTime.now();
    final days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    // JS getDay() is 0-Sunday, Dart weekday is 1-Monday, 7-Sunday
    return days[now.weekday - 1];
  }

  Future<void> loadTimetable() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _service.getTimetableData();
      
      final myScheduleMap = <String, List<TimetablePeriod>>{};
      if (data['mySchedule'] != null) {
        (data['mySchedule'] as Map).forEach((day, periods) {
          myScheduleMap[day.toString()] = (periods as List)
              .map((p) => TimetablePeriod.fromJson(p))
              .toList();
        });
      }

      final classrooms = (data['classrooms'] as List? ?? [])
          .map((c) => TimetableClassroom.fromJson(c))
          .toList();

      state = state.copyWith(
        mySchedule: myScheduleMap,
        classrooms: classrooms,
        isLoading: false,
      );
      
      _scheduleNotifications(myScheduleMap);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> _scheduleNotifications(Map<String, List<TimetablePeriod>> mySchedule) async {
    final notificationService = NotificationService();
    await notificationService.cancelAllNotifications();

    final now = DateTime.now();
    final todayStr = _getCurrentDay();
    final todayPeriods = mySchedule[todayStr] ?? [];

    int id = 0;
    for (var period in todayPeriods) {
      if (period.type == 'CLASS' && period.startTime.isNotEmpty) {
        try {
          final parts = period.startTime.split(':');
          if (parts.length == 2) {
            final hour = int.parse(parts[0]);
            final min = int.parse(parts[1]);
            
            var scheduleTime = DateTime(now.year, now.month, now.day, hour, min).subtract(const Duration(minutes: 5));
            
            if (scheduleTime.isAfter(now)) {
              await notificationService.schedulePeriodNotification(
                id: id++,
                title: 'Upcoming Class: ${period.subject}',
                body: 'Your class for ${period.className ?? "Unknown Room"} starts in 5 minutes.',
                scheduledDate: scheduleTime,
              );
            }
          }
        } catch (e) {
          // ignore parsing errors
        }
      }
    }
  }

  void selectDay(String day) {
    state = state.copyWith(selectedDay: day);
  }

  void selectView(String view) {
    state = state.copyWith(selectedView: view);
  }
}

final timetableProvider = StateNotifierProvider<TimetableNotifier, TimetableState>((ref) {
  return TimetableNotifier(ref.read(timetableServiceProvider));
});
