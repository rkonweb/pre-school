import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'attendance_service.dart';

// ── Data models ──────────────────────────────────────────────

class AttendanceTodayStats {
  final int total, present, absent, late, unmarked, presentRate;
  AttendanceTodayStats({
    required this.total,
    required this.present,
    required this.absent,
    required this.late,
    required this.unmarked,
    required this.presentRate,
  });
  factory AttendanceTodayStats.fromJson(Map<String, dynamic> j) =>
      AttendanceTodayStats(
        total: j['total'] ?? 0,
        present: j['present'] ?? 0,
        absent: j['absent'] ?? 0,
        late: j['late'] ?? 0,
        unmarked: j['unmarked'] ?? 0,
        presentRate: j['presentRate'] ?? 0,
      );
}

class ClassBreakdown {
  final String id, name;
  final int total, present, absent, late, unmarked, rate;
  ClassBreakdown({
    required this.id,
    required this.name,
    required this.total,
    required this.present,
    required this.absent,
    required this.late,
    required this.unmarked,
    required this.rate,
  });
  factory ClassBreakdown.fromJson(Map<String, dynamic> j) => ClassBreakdown(
        id: j['id'] ?? '',
        name: j['name'] ?? '',
        total: j['total'] ?? 0,
        present: j['present'] ?? 0,
        absent: j['absent'] ?? 0,
        late: j['late'] ?? 0,
        unmarked: j['unmarked'] ?? 0,
        rate: j['rate'] ?? 0,
      );
}

class WeeklyTrendPoint {
  final String date, dayLabel;
  final int present, total, rate;
  WeeklyTrendPoint({
    required this.date,
    required this.dayLabel,
    required this.present,
    required this.total,
    required this.rate,
  });
  factory WeeklyTrendPoint.fromJson(Map<String, dynamic> j) =>
      WeeklyTrendPoint(
        date: j['date'] ?? '',
        dayLabel: j['dayLabel'] ?? '',
        present: j['present'] ?? 0,
        total: j['total'] ?? 0,
        rate: j['rate'] ?? 0,
      );
}

class AbsenteeAlert {
  final String id, name, className;
  final String? avatar;
  final int absences, absentRate;
  AbsenteeAlert({
    required this.id,
    required this.name,
    required this.className,
    this.avatar,
    required this.absences,
    required this.absentRate,
  });
  factory AbsenteeAlert.fromJson(Map<String, dynamic> j) => AbsenteeAlert(
        id: j['id'] ?? '',
        name: j['name'] ?? '',
        className: j['className'] ?? '',
        avatar: j['avatar'],
        absences: j['absences'] ?? 0,
        absentRate: j['absentRate'] ?? 0,
      );
}

// ── Dashboard State ────────────────────────────────────────────

class AttendanceDashboardState {
  final bool isLoading;
  final String? error;
  final AttendanceTodayStats? todayStats;
  final List<ClassBreakdown> classBreakdown;
  final List<WeeklyTrendPoint> weeklyTrend;
  final List<AbsenteeAlert> alerts;

  AttendanceDashboardState({
    this.isLoading = false,
    this.error,
    this.todayStats,
    this.classBreakdown = const [],
    this.weeklyTrend = const [],
    this.alerts = const [],
  });

  AttendanceDashboardState copyWith({
    bool? isLoading,
    String? error,
    AttendanceTodayStats? todayStats,
    List<ClassBreakdown>? classBreakdown,
    List<WeeklyTrendPoint>? weeklyTrend,
    List<AbsenteeAlert>? alerts,
  }) =>
      AttendanceDashboardState(
        isLoading: isLoading ?? this.isLoading,
        error: error,
        todayStats: todayStats ?? this.todayStats,
        classBreakdown: classBreakdown ?? this.classBreakdown,
        weeklyTrend: weeklyTrend ?? this.weeklyTrend,
        alerts: alerts ?? this.alerts,
      );
}

// ── Notifier ─────────────────────────────────────────────────

class AttendanceDashboardNotifier
    extends StateNotifier<AttendanceDashboardState> {
  final AttendanceService _service;

  AttendanceDashboardNotifier(this._service)
      : super(AttendanceDashboardState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true);
    try {
      final data = await _service.getDashboardStats();
      state = state.copyWith(
        isLoading: false,
        todayStats: AttendanceTodayStats.fromJson(
            Map<String, dynamic>.from(data['todayStats'] ?? {})),
        classBreakdown: (data['classBreakdown'] as List? ?? [])
            .map((e) => ClassBreakdown.fromJson(Map<String, dynamic>.from(e)))
            .toList(),
        weeklyTrend: (data['weeklyTrend'] as List? ?? [])
            .map((e) => WeeklyTrendPoint.fromJson(Map<String, dynamic>.from(e)))
            .toList(),
        alerts: (data['alerts'] as List? ?? [])
            .map((e) => AbsenteeAlert.fromJson(Map<String, dynamic>.from(e)))
            .toList(),
      );
    } catch (e) {
      state = state.copyWith(
          isLoading: false, error: e.toString().replaceAll('Exception: ', ''));
    }
  }
}

final attendanceDashboardProvider = StateNotifierProvider<
    AttendanceDashboardNotifier, AttendanceDashboardState>((ref) {
  return AttendanceDashboardNotifier(ref.read(attendanceServiceProvider));
});
