import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../dashboard/data/dashboard_provider.dart';
import '../data/attendance_provider.dart';

import 'package:table_calendar/table_calendar.dart';

class AttendanceScreen extends ConsumerStatefulWidget {
  const AttendanceScreen({super.key});

  @override
  ConsumerState<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends ConsumerState<AttendanceScreen> {
  CalendarFormat _calendarFormat = CalendarFormat.month;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  @override
  Widget build(BuildContext context) {
    final dashboardAsync = ref.watch(dashboardDataProvider);
    final brand = ref.watch(schoolBrandProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text('Attendance'),
        backgroundColor: brand.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: dashboardAsync.when(
        data: (data) {
          final students = data['students'] as List?;
          if (students == null || students.isEmpty) {
            return const Center(child: Text('No students found.'));
          }
          final studentId = students[0]['id'];
          final attendanceAsync = ref.watch(attendanceDataProvider(studentId));

          return attendanceAsync.when(
            data: (records) => RefreshIndicator(
              onRefresh: () => ref.refresh(attendanceDataProvider(studentId).future),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  children: [
                    _buildSummaryHeader(brand, records),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: _buildCalendarCard(records, brand),
                    ),
                    _buildStatusLegend(),
                    const SizedBox(height: 16),
                    _buildRecordList(records, _selectedDay ?? _focusedDay, brand),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => _buildErrorState(err.toString(), studentId),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildSummaryHeader(SchoolBrandState brand, List<AttendanceRecord> records) {
    final presentCount = records.where((r) => r.status == 'PRESENT').length;
    final total = records.length;
    final percentage = total > 0 ? (presentCount / total * 100).toStringAsFixed(1) : '0';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: brand.primaryColor,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildSummaryItem('Total Days', total.toString()),
          _buildSummaryItem('Present', presentCount.toString()),
          _buildSummaryItem('Attendance', '$percentage%'),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: 14,
          ),
        ),
      ],
    );
  }

  Widget _buildCalendarCard(List<AttendanceRecord> records, SchoolBrandState brand) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TableCalendar(
        firstDay: DateTime.now().subtract(const Duration(days: 365)),
        lastDay: DateTime.now().add(const Duration(days: 30)),
        focusedDay: _focusedDay,
        calendarFormat: _calendarFormat,
        selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
        onDaySelected: (selectedDay, focusedDay) {
          setState(() {
            _selectedDay = selectedDay;
            _focusedDay = focusedDay;
          });
        },
        onFormatChanged: (format) {
          setState(() {
            _calendarFormat = format;
          });
        },
        calendarStyle: CalendarStyle(
          todayDecoration: BoxDecoration(
            color: brand.primaryColor.withOpacity(0.3),
            shape: BoxShape.circle,
          ),
          selectedDecoration: BoxDecoration(
            color: brand.primaryColor,
            shape: BoxShape.circle,
          ),
        ),
        headerStyle: const HeaderStyle(
          formatButtonVisible: false,
          titleCentered: true,
        ),
        calendarBuilders: CalendarBuilders(
          defaultBuilder: (context, day, focusedDay) {
            final record = _getRecordForDay(records, day);
            if (record != null) {
              final color = record.status == 'PRESENT' ? Colors.green : Colors.red;
              return Container(
                margin: const EdgeInsets.all(4),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                  border: Border.all(color: color.withOpacity(0.5)),
                ),
                child: Text(
                  '${day.day}',
                  style: TextStyle(color: color, fontWeight: FontWeight.bold),
                ),
              );
            }
            return null;
          },
        ),
      ),
    );
  }

  Widget _buildStatusLegend() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildLegendItem(Colors.green, 'Present'),
          const SizedBox(width: 16),
          _buildLegendItem(Colors.red, 'Absent'),
        ],
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color.withOpacity(0.2),
            shape: BoxShape.circle,
            border: Border.all(color: color),
          ),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }

  Widget _buildRecordList(List<AttendanceRecord> records, DateTime date, SchoolBrandState brand) {
    final record = _getRecordForDay(records, date);
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            DateFormat('EEEE, d MMM yyyy').format(date),
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 8),
          if (record != null)
            _buildAttendanceCard(record, brand)
          else
            const Card(
              child: ListTile(
                title: Text('No record for this day'),
                trailing: Icon(Icons.info_outline, color: Colors.grey),
              ),
            ),
        ],
      ),
    );
  }

  AttendanceRecord? _getRecordForDay(List<AttendanceRecord> records, DateTime day) {
    try {
      return records.firstWhere((r) {
        final rDate = DateTime.parse(r.date);
        return isSameDay(rDate, day);
      });
    } catch (_) {
      return null;
    }
  }

  Widget _buildAttendanceCard(AttendanceRecord record, SchoolBrandState brand) {
    final isPresent = record.status == 'PRESENT';
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: (isPresent ? Colors.green : Colors.red).withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            isPresent ? Icons.check_circle : Icons.cancel,
            color: isPresent ? Colors.green : Colors.red,
            size: 24,
          ),
        ),
        title: Text(
          record.status,
          style: TextStyle(
            color: isPresent ? Colors.green : Colors.red,
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: record.notes != null ? Text(record.notes!) : const Text('Daily Attendance'),
        trailing: record.notes == null ? const Icon(Icons.history, size: 16, color: Colors.grey) : null,
      ),
    );
  }

  Widget _buildErrorState(String error, String studentId) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: Colors.red),
          const SizedBox(height: 16),
          Text(error),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => ref.refresh(attendanceDataProvider(studentId)),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}
