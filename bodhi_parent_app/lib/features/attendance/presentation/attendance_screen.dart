import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../../core/api/api_client.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../../dashboard/data/dashboard_provider.dart';
import '../data/attendance_provider.dart';

class AttendanceScreen extends ConsumerStatefulWidget {
  const AttendanceScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends ConsumerState<AttendanceScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  @override
  void initState() {
    super.initState();
    _selectedDay = _focusedDay;
  }

  @override
  Widget build(BuildContext context) {
    final dashboardAsync = ref.watch(dashboardDataProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppHeader(
        title: 'Attendance',
        subtitle: DateFormat('MMMM yyyy').format(_focusedDay),
        showBackButton: false,
        showMenuButton: true,
        actions: [
          ElevatedButton(
            onPressed: () {}, 
            style: AppTheme.headerButtonStyle(),
            child: const Icon(Icons.calendar_month_outlined, size: 20),
          ),
        ],
      ),
      body: Consumer(
        builder: (context, ref, child) {
          final activeStudent = ref.watch(activeStudentProvider);

          if (activeStudent == null) {
            return const Center(child: Text('No students found.'));
          }

          final studentId = activeStudent['id']?.toString();
          if (studentId == null) {
            return const Center(child: Text('Student ID not found.'));
          }

          final attendanceAsync = ref.watch(attendanceDataProvider(studentId));

          return attendanceAsync.when(
            data: (records) {
              return _buildContent(records, studentId);
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => _buildErrorState(err.toString(), studentId),
          );
        },
      ),
    );
  }

  Widget _buildContent(List<AttendanceRecord> records, String studentId) {
    final presentCount = records.where((r) => r.status == 'PRESENT').length;
    final absentCount = records.where((r) => r.status == 'ABSENT').length;
    final excludeCount = records.where((r) => r.status != 'PRESENT' && r.status != 'ABSENT').length; // Leaves / Lates

    final totalActive = records.length;
    final rawPercentage = totalActive > 0 ? (presentCount / totalActive * 100) : 0.0;
    final percentage = rawPercentage.toInt();

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(attendanceDataProvider(studentId));
        await ref.read(attendanceDataProvider(studentId).future);
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 100), // extra padding for bottom nav
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 10),

            // Summary Stats (a1)
            Row(
              children: [
                Expanded(child: _buildStatBlock(presentCount.toString(), 'Present', const Color(0xFF00C9A7))),
                const SizedBox(width: 12),
                Expanded(child: _buildStatBlock(absentCount.toString(), 'Absent', const Color(0xFFFF6B3D))),
                const SizedBox(width: 12),
                Expanded(child: _buildStatBlock(excludeCount.toString(), 'Leave', const Color(0xFFF5A623))),
              ],
            ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.1),

            const SizedBox(height: 16),

            // Progress Card (a2)
            _buildProgressCard(percentage).animate().fadeIn(delay: 150.ms).slideY(begin: 0.1),

            const SizedBox(height: 24),

            // Calendar Card (a3)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 5))
                ],
              ),
              child: _buildCalendar(records),
            ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1),

            const SizedBox(height: 16),

            // Legend
            _buildLegend(),

            const SizedBox(height: 24),

            // Selected Day Record
            _buildDailyRecordCard(records, _selectedDay ?? _focusedDay).animate().fadeIn(delay: 250.ms).slideY(begin: 0.1),

            const SizedBox(height: 24),

            // Apply for Leave button (a5)
            ElevatedButton.icon(
              onPressed: () => _showLeaveSheet(),
              icon: const Icon(Icons.edit_document),
              label: const Text('Apply for Leave', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1E293B),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
            ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.1),
          ],
        ),
      ),
    );
  }

  Widget _buildStatBlock(String number, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 2))
        ],
      ),
      child: Column(
        children: [
          Text(number, style: GoogleFonts.sora(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 4),
          Text(label, style: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF64748B), fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildProgressCard(int percentage) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 6))
        ],
      ),
      child: Row(
        children: [
          SizedBox(
            width: 70,
            height: 70,
            child: Stack(
              fit: StackFit.expand,
              children: [
                CircularProgressIndicator(
                  value: 1.0,
                  strokeWidth: 7,
                  color: const Color(0xFFF1F5F9), // background track
                ),
                CircularProgressIndicator(
                  value: percentage / 100,
                  strokeWidth: 7,
                  strokeCap: StrokeCap.round,
                  color: const Color(0xFF00C9A7), // teal
                ),
                Center(
                  child: Text(
                    '$percentage%',
                    style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.w800, color: const Color(0xFF1E293B)),
                  ),
                )
              ],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  percentage >= 90 ? 'Excellent!' : percentage >= 75 ? 'Good!' : 'Needs Attention',
                  style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                ),
                const SizedBox(height: 4),
                Text(
                  'No missed days this week. Keep it up!',
                  style: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF64748B)),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF00C9A7).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '↑ Above school avg 88%',
                    style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF009176)),
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildCalendar(List<AttendanceRecord> records) {
    return TableCalendar(
      firstDay: DateTime.now().subtract(const Duration(days: 365)),
      lastDay: DateTime.now().add(const Duration(days: 30)),
      focusedDay: _focusedDay,
      calendarFormat: CalendarFormat.month,
      selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
      onDaySelected: (selectedDay, focusedDay) {
        setState(() {
          _selectedDay = selectedDay;
          _focusedDay = focusedDay;
        });
      },
      onPageChanged: (focusedDay) {
        setState(() {
          _focusedDay = focusedDay;
        });
      },
      headerStyle: HeaderStyle(
        formatButtonVisible: false,
        titleCentered: false,
        leftChevronIcon: const Icon(Icons.chevron_left_rounded, color: Color(0xFF334155)),
        rightChevronIcon: const Icon(Icons.chevron_right_rounded, color: Color(0xFF334155)),
        titleTextStyle: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
      ),
      daysOfWeekStyle: DaysOfWeekStyle(
        weekdayStyle: GoogleFonts.dmSans(fontSize: 13, fontWeight: FontWeight.w700, color: const Color(0xFF94A3B8)),
        weekendStyle: GoogleFonts.dmSans(fontSize: 13, fontWeight: FontWeight.w700, color: const Color(0xFF94A3B8)),
      ),
      calendarBuilders: CalendarBuilders(
        defaultBuilder: (context, day, focusedDay) {
          final record = _getRecordForDay(records, day);
          if (record != null) {
            Color pColor = const Color(0xFF00C9A7); // Present
            if (record.status == 'ABSENT') {
              pColor = const Color(0xFFFF6B3D); // Absent
            } else if (record.status != 'PRESENT') {
              pColor = const Color(0xFFF5A623); // Leave/Late
            }
            return Container(
              margin: const EdgeInsets.all(6),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: pColor.withOpacity(0.15), // translucent background
                shape: BoxShape.circle,
              ),
              child: Text(
                '${day.day}',
                style: GoogleFonts.dmSans(color: pColor.withOpacity(1), fontWeight: FontWeight.bold, fontSize: 14),
              ),
            );
          }
           return Container(
              margin: const EdgeInsets.all(6),
              alignment: Alignment.center,
              child: Text(
                '${day.day}',
                style: GoogleFonts.dmSans(color: const Color(0xFF1E293B), fontWeight: FontWeight.w500, fontSize: 14),
              ),
            );
        },
        selectedBuilder: (context, day, focusedDay) {
            return Container(
              margin: const EdgeInsets.all(6),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFF2350DD), width: 2), // Ring for selected
                shape: BoxShape.circle,
              ),
              child: Text(
                '${day.day}',
                style: GoogleFonts.dmSans(color: const Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 14),
              ),
            );
        },
      ),
    );
  }

  Widget _buildLegend() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildLegendItem(const Color(0xFF00C9A7), 'Present'),
        const SizedBox(width: 14),
        _buildLegendItem(const Color(0xFFFF6B3D), 'Absent'),
        const SizedBox(width: 14),
        _buildLegendItem(const Color(0xFFF5A623), 'Leave'),
        const SizedBox(width: 14),
        _buildLegendItem(const Color(0xFF2350DD), 'Selected'),
      ],
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color.withOpacity(0.3), border: Border.all(color: color), borderRadius: BorderRadius.circular(3))),
        const SizedBox(width: 6),
        Text(label, style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF64748B), fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _buildDailyRecordCard(List<AttendanceRecord> records, DateTime date) {
    final record = _getRecordForDay(records, date);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.event_available_rounded, size: 18, color: Color(0xFF94A3B8)),
            const SizedBox(width: 8),
            Text(
              DateFormat('EEEE, MMM d, yyyy').format(date).toUpperCase(),
              style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF94A3B8), letterSpacing: 0.5),
            )
          ],
        ),
        const SizedBox(height: 12),
        if (record != null)
           Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
            ),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: (record.status == 'PRESENT' ? const Color(0xFF00C9A7) : const Color(0xFFFF6B3D)).withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    record.status == 'PRESENT' ? Icons.check_circle_rounded : Icons.cancel_rounded,
                    color: record.status == 'PRESENT' ? const Color(0xFF00C9A7) : const Color(0xFFFF6B3D),
                    size: 26,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        record.status == 'PRESENT' ? 'Present' : record.status == 'ABSENT' ? 'Absent' : 'Leave',
                        style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        record.notes != null && record.notes!.isNotEmpty ? record.notes! : 'Attendance marked successfully by teacher.',
                        style: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF64748B)),
                      )
                    ],
                  ),
                )
              ],
            ),
          )
        else
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0), style: BorderStyle.solid),
            ),
            child: Row(
              children: [
                const Icon(Icons.do_not_disturb_alt_rounded, color: Color(0xFF94A3B8)),
                const SizedBox(width: 12),
                Text('No specific record available for this date.', style: GoogleFonts.dmSans(color: const Color(0xFF64748B), fontWeight: FontWeight.w500)),
              ],
            ),
          )
      ],
    );
  }

  void _showLeaveSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          String selectedReason = 'Unwell';
          final notesController = TextEditingController();
          bool isLoading = false;

          return Container(
            padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
            ),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(child: Container(width: 40, height: 5, decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(10)))),
                  const SizedBox(height: 24),
                  Text('Apply for Leave', style: GoogleFonts.sora(fontSize: 22, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
                  const SizedBox(height: 8),
                  Text('Select a reason', style: GoogleFonts.dmSans(fontSize: 14, color: const Color(0xFF64748B))),
                  const SizedBox(height: 20),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      _buildSelectableLeaveChip('Unwell', selectedReason == 'Unwell', () {
                        setState(() => selectedReason = 'Unwell');
                      }),
                      _buildSelectableLeaveChip('Travel', selectedReason == 'Travel', () {
                        setState(() => selectedReason = 'Travel');
                      }),
                      _buildSelectableLeaveChip('Family Event', selectedReason == 'Family Event', () {
                        setState(() => selectedReason = 'Family Event');
                      }),
                      _buildSelectableLeaveChip('Medical', selectedReason == 'Medical', () {
                        setState(() => selectedReason = 'Medical');
                      }),
                      _buildSelectableLeaveChip('Other', selectedReason == 'Other', () {
                        setState(() => selectedReason = 'Other');
                      }),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: TextField(
                      controller: notesController,
                      maxLines: 4,
                      enabled: !isLoading,
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        hintText: 'Add a note for the teacher (optional)...',
                        hintStyle: TextStyle(color: Color(0xFF94A3B8)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: isLoading ? null : () => _submitLeaveRequest(selectedReason, notesController.text, () => Navigator.pop(context)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF3B6EF8),
                      disabledBackgroundColor: const Color(0xFFCBD5E1),
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    child: isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)),
                          )
                        : const Text('Submit Leave Request', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSelectableLeaveChip(String text, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
        ),
        child: Text(text, style: GoogleFonts.dmSans(fontSize: 14, fontWeight: FontWeight.w600, color: isSelected ? Colors.white : const Color(0xFF475569))),
      ),
    );
  }

  Future<void> _submitLeaveRequest(String reason, String notes, VoidCallback onSuccess) async {
    final apiClient = ref.read(apiClientProvider);
    final activeStudent = ref.read(activeStudentProvider);

    if (activeStudent == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Student not found')),
      );
      return;
    }

    final studentId = activeStudent['id']?.toString();
    if (studentId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Student ID not found')),
      );
      return;
    }

    try {
      final today = DateTime.now();
      final dateStr = DateFormat('yyyy-MM-dd').format(today);

      final response = await apiClient.post(
        'parent/attendance/leave',
        data: {
          'studentId': studentId,
          'startDate': dateStr,
          'endDate': dateStr,
          'reason': reason,
          'notes': notes,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Leave request submitted successfully'),
            backgroundColor: Color(0xFF00C9A7),
          ),
        );
        onSuccess();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response.data['error'] ?? 'Failed to submit leave request')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }

  Widget _leaveChip(String text, bool isSelected) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: isSelected ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isSelected ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
      ),
      child: Text(text, style: GoogleFonts.dmSans(fontSize: 14, fontWeight: FontWeight.w600, color: isSelected ? Colors.white : const Color(0xFF475569))),
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
