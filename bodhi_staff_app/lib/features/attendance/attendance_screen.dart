import 'package:bodhi_staff_app/ui/components/app_drawer.dart';
import 'package:bodhi_staff_app/ui/components/app_drawer.dart';
import 'package:flutter/material.dart';
import 'package:bodhi_staff_app/core/widgets/global_header.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import 'attendance_card.dart';
import 'attendance_provider.dart';

class AttendanceScreen extends ConsumerWidget {
  const AttendanceScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(attendanceProvider);
    final notifier = ref.read(attendanceProvider.notifier);

    ref.listen<AttendanceState>(attendanceProvider, (previous, next) {
      if (next.error != null && next.error != previous?.error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: AppTheme.danger,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    });

    return Scaffold(
      
      
      drawer: const AppDrawer(),
      appBar: GlobalHeader(
        title: 'Attendance',
        actions: [
          IconButton(
             icon: const Icon(Icons.refresh, color: AppTheme.primary),
             onPressed: () => notifier.loadStudents(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Header / Filters
          Container(
            padding: const EdgeInsets.all(AppTheme.s16),
            color: AppTheme.surface,
            child: Column(
              children: [
                Row(
                  children: [
                    // Classroom Dropdown
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: AppTheme.background,
                          borderRadius: AppTheme.radiusSmall,
                          border: Border.all(color: AppTheme.border),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: state.selectedClassroomId,
                            hint: const Text('Select Class'),
                            isExpanded: true,
                            items: state.classrooms.map((c) {
                              return DropdownMenuItem<String>(
                                value: c['id'],
                                child: Text(c['name']),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) notifier.selectClassroom(val);
                            },
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppTheme.s16),
                    // Date Picker
                    GestureDetector(
                      onTap: () async {
                        final date = await showDatePicker(
                          context: context,
                          initialDate: state.selectedDate,
                          firstDate: DateTime.now().subtract(const Duration(days: 365)),
                          lastDate: DateTime.now(),
                        );
                        if (date != null) notifier.selectDate(date);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppTheme.background,
                          borderRadius: AppTheme.radiusSmall,
                          border: Border.all(color: AppTheme.border),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.calendar_today, size: 16, color: AppTheme.primary),
                            const SizedBox(width: 8),
                            Text(
                              DateFormat('MMM dd').format(state.selectedDate),
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppTheme.s16),
                // Stats Summary
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatItem('Total', state.students.length.toString(), AppTheme.primary),
                    _buildStatItem('P', state.students.where((s) => s.status == 'PRESENT').length.toString(), AppTheme.success),
                    _buildStatItem('A', state.students.where((s) => s.status == 'ABSENT').length.toString(), AppTheme.danger),
                    _buildStatItem('L', state.students.where((s) => s.status == 'LATE').length.toString(), AppTheme.warning),
                    _buildStatItem('?', state.students.where((s) => s.status == null).length.toString(), AppTheme.textMuted),
                  ],
                ),
              ],
            ),
          ),

          // Student List
          Expanded(
            child: state.isLoading && state.students.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : state.students.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.people_outline, size: 64, color: AppTheme.textMuted.withOpacity(0.5)),
                            const SizedBox(height: 16),
                            Text(
                              state.selectedClassroomId == null ? 'Please select a classroom' : 'No students found',
                              style: TextStyle(color: AppTheme.textMuted, fontSize: 16),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => notifier.loadStudents(),
                        child: ListView.builder(
                          padding: const EdgeInsets.only(bottom: 80),
                          itemCount: state.students.length,
                          itemBuilder: (context, index) {
                            final student = state.students[index];
                            return AttendanceStudentCard(
                              studentName: student.name,
                              rollNumber: student.rollNo,
                              avatarUrl: student.avatar,
                              status: student.status,
                              onMarked: (status) {
                                notifier.markAttendance(student.id, status);
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color),
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
        ),
      ],
    );
  }
}
