import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'attendance_service.dart';
import 'attendance_service.dart';
import '../../core/widgets/student_avatar.dart';
import '../../core/widgets/global_header.dart';

// ── State ─────────────────────────────────────────────────────────

class MonthlyReportState {
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? student;
  final List<Map<String, dynamic>> days;
  final Map<String, dynamic>? summary;

  MonthlyReportState({
    this.isLoading = false,
    this.error,
    this.student,
    this.days = const [],
    this.summary,
  });

  MonthlyReportState copyWith({
    bool? isLoading,
    String? error,
    Map<String, dynamic>? student,
    List<Map<String, dynamic>>? days,
    Map<String, dynamic>? summary,
  }) =>
      MonthlyReportState(
        isLoading: isLoading ?? this.isLoading,
        error: error,
        student: student ?? this.student,
        days: days ?? this.days,
        summary: summary ?? this.summary,
      );
}

class MonthlyReportNotifier extends StateNotifier<MonthlyReportState> {
  final AttendanceService _service;
  final String studentId;
  DateTime _month;

  MonthlyReportNotifier(this._service, this.studentId, this._month)
      : super(MonthlyReportState()) {
    load();
  }

  DateTime get currentMonth => _month;

  Future<void> load() async {
    state = state.copyWith(isLoading: true);
    try {
      final monthStr =
          '${_month.year}-${_month.month.toString().padLeft(2, '0')}';
      final data = await _service.getStudentMonthlyReport(studentId, monthStr);
      state = state.copyWith(
        isLoading: false,
        student: Map<String, dynamic>.from(data['student'] ?? {}),
        days: (data['days'] as List? ?? [])
            .map((e) => Map<String, dynamic>.from(e))
            .toList(),
        summary: Map<String, dynamic>.from(data['summary'] ?? {}),
      );
    } catch (e) {
      state = state.copyWith(
          isLoading: false, error: e.toString().replaceAll('Exception: ', ''));
    }
  }

  void prevMonth() {
    _month = DateTime(_month.year, _month.month - 1, 1);
    load();
  }

  void nextMonth() {
    final now = DateTime.now();
    final next = DateTime(_month.year, _month.month + 1, 1);
    if (next.isBefore(DateTime(now.year, now.month + 1, 1))) {
      _month = next;
      load();
    }
  }
}

// ── Provider factory (keyed by studentId) ─────────────────────────

final monthlyReportProviderFamily = StateNotifierProvider.family<
    MonthlyReportNotifier, MonthlyReportState, String>(
  (ref, studentId) => MonthlyReportNotifier(
    ref.read(attendanceServiceProvider),
    studentId,
    DateTime(DateTime.now().year, DateTime.now().month, 1),
  ),
);

// ── Screen ────────────────────────────────────────────────────────

class StudentMonthlyReportScreen extends ConsumerWidget {
  final String studentId;
  const StudentMonthlyReportScreen({Key? key, required this.studentId})
      : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(monthlyReportProviderFamily(studentId));
    final notifier = ref.read(monthlyReportProviderFamily(studentId).notifier);
    final brandYellow = const Color(0xFFFFC107);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: GlobalHeader(
        title: state.student?['name'] ?? 'Monthly Report',
        showBackButton: true,
        backgroundColor: Colors.white,
        actions: [
          if (state.student != null)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: StudentAvatar(
                name: state.student!['name'] ?? '',
                avatarUrl: state.student!['avatar'],
                radius: 18,
              ),
            ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? _buildError(state.error!, notifier)
              : SingleChildScrollView(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Month Selector
                      _MonthSelector(
                          notifier: notifier, brandYellow: brandYellow),
                      const SizedBox(height: 20),

                      // Summary Stats
                      if (state.summary != null)
                        _SummaryStrip(summary: state.summary!),
                      const SizedBox(height: 20),

                      // Calendar Grid
                      _CalendarGrid(days: state.days),
                      const SizedBox(height: 20),

                      // Legend
                      _Legend(),
                    ],
                  ),
                ),
    );
  }

  Widget _buildError(String error, MonthlyReportNotifier notifier) {
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.error_outline, size: 48, color: Colors.grey[300]),
        const SizedBox(height: 12),
        Text(error,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey[500])),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: notifier.load, child: const Text('Retry')),
      ]),
    );
  }
}

// ── Month Selector ────────────────────────────────────────────────

class _MonthSelector extends StatelessWidget {
  final MonthlyReportNotifier notifier;
  final Color brandYellow;
  const _MonthSelector({required this.notifier, required this.brandYellow});

  @override
  Widget build(BuildContext context) {
    final month = notifier.currentMonth;
    final months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    final isCurrentMonth = month.year == DateTime.now().year &&
        month.month == DateTime.now().month;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 12,
              offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          _NavBtn(
            icon: Icons.chevron_left_rounded,
            onTap: notifier.prevMonth,
          ),
          Expanded(
            child: Column(
              children: [
                Text(
                  months[month.month - 1],
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(
                  '${month.year}',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey[400],
                      fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
          _NavBtn(
            icon: Icons.chevron_right_rounded,
            onTap: isCurrentMonth ? null : notifier.nextMonth,
            disabled: isCurrentMonth,
          ),
        ],
      ),
    );
  }
}

class _NavBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  final bool disabled;
  const _NavBtn({required this.icon, this.onTap, this.disabled = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: disabled ? Colors.grey[100] : Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon,
            size: 22,
            color: disabled ? Colors.grey[300] : Colors.grey[700]),
      ),
    );
  }
}

// ── Summary Stats Strip ───────────────────────────────────────────

class _SummaryStrip extends StatelessWidget {
  final Map<String, dynamic> summary;
  const _SummaryStrip({required this.summary});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _Pill(label: 'Present', value: summary['present'] ?? 0,
            color: const Color(0xFF22C55E)),
        const SizedBox(width: 8),
        _Pill(label: 'Absent', value: summary['absent'] ?? 0,
            color: const Color(0xFFEF4444)),
        const SizedBox(width: 8),
        _Pill(label: 'Late', value: summary['late'] ?? 0,
            color: const Color(0xFFF59E0B)),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Text(
            '${summary['attendanceRate'] ?? 0}%',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ],
    );
  }
}

class _Pill extends StatelessWidget {
  final String label;
  final int value;
  final Color color;
  const _Pill({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Text('$value',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: color,
                  height: 1)),
          Text(label,
              style: TextStyle(
                  fontSize: 9, fontWeight: FontWeight.w700, color: color)),
        ],
      ),
    );
  }
}

// ── Calendar Grid ─────────────────────────────────────────────────

class _CalendarGrid extends StatelessWidget {
  final List<Map<String, dynamic>> days;
  const _CalendarGrid({required this.days});

  @override
  Widget build(BuildContext context) {
    if (days.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 16,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        children: [
          // Day headers
          Row(
            children: ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) {
              return Expanded(
                child: Center(
                  child: Text(d,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: Colors.grey[400],
                      )),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 8),

          // Grid — build weeks
          Builder(builder: (_) {
            // Find what day of week the month starts (0=Sun)
            final firstDay = days.first;
            final firstDate = DateTime.parse(firstDay['date']);
            final startOffset = firstDate.weekday % 7; // 0=Sun

            final allCells = <Map<String, dynamic>?>[];
            for (int i = 0; i < startOffset; i++) {
              allCells.add(null);
            }
            allCells.addAll(days.map((d) => d));
            // Pad to full weeks
            while (allCells.length % 7 != 0) {
              allCells.add(null);
            }

            final rows = <Widget>[];
            for (int i = 0; i < allCells.length; i += 7) {
              final week = allCells.sublist(i, i + 7);
              rows.add(Row(
                children: week.map((d) {
                  if (d == null) return Expanded(child: const SizedBox(height: 48));
                  return Expanded(child: _DayCell(day: d));
                }).toList(),
              ));
              rows.add(const SizedBox(height: 4));
            }
            return Column(children: rows);
          }),
        ],
      ),
    );
  }
}

class _DayCell extends StatelessWidget {
  final Map<String, dynamic> day;
  const _DayCell({required this.day});

  @override
  Widget build(BuildContext context) {
    final date = DateTime.parse(day['date']);
    final status = day['status'] as String?;
    final isWeekend = day['isWeekend'] == true;
    final isFuture = date.isAfter(DateTime.now());

    Color bg, textColor;
    IconData? icon;

    if (isFuture) {
      bg = Colors.grey[50]!;
      textColor = Colors.grey[300]!;
    } else if (isWeekend) {
      bg = Colors.grey[50]!;
      textColor = Colors.grey[300]!;
    } else if (status == null) {
      bg = Colors.grey[100]!;
      textColor = Colors.grey[400]!;
    } else {
      switch (status) {
        case 'PRESENT':
          bg = const Color(0xFFDCFCE7);
          textColor = const Color(0xFF16A34A);
          icon = Icons.check_rounded;
          break;
        case 'ABSENT':
          bg = const Color(0xFFFEE2E2);
          textColor = const Color(0xFFDC2626);
          icon = Icons.close_rounded;
          break;
        case 'LATE':
          bg = const Color(0xFFFEF3C7);
          textColor = const Color(0xFFD97706);
          icon = Icons.schedule_rounded;
          break;
        case 'HALF_DAY':
          bg = const Color(0xFFEDE9FE);
          textColor = const Color(0xFF7C3AED);
          icon = Icons.looks_one_rounded;
          break;
        case 'EXCUSED':
          bg = const Color(0xFFDBEAFE);
          textColor = const Color(0xFF1D4ED8);
          icon = Icons.verified_outlined;
          break;
        default:
          bg = Colors.grey[100]!;
          textColor = Colors.grey[400]!;
      }
    }

    return Padding(
      padding: const EdgeInsets.all(2),
      child: Container(
        height: 48,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '${date.day}',
              style: TextStyle(
                  fontSize: 11, fontWeight: FontWeight.w800, color: textColor),
            ),
            if (icon != null)
              Icon(icon, size: 11, color: textColor),
          ],
        ),
      ),
    );
  }
}

// ── Legend ────────────────────────────────────────────────────────

class _Legend extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final items = [
      ('Present', const Color(0xFF22C55E)),
      ('Absent', const Color(0xFFEF4444)),
      ('Late', const Color(0xFFF59E0B)),
      ('Half Day', const Color(0xFF7C3AED)),
      ('Excused', const Color(0xFF1D4ED8)),
    ];
    return Wrap(
      spacing: 12,
      runSpacing: 8,
      children: items.map((item) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              color: item.$2,
              borderRadius: BorderRadius.circular(3),
            ),
          ),
          const SizedBox(width: 4),
          Text(item.$1,
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[500])),
        ],
      )).toList(),
    );
  }
}
