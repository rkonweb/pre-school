import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../dashboard/data/dashboard_provider.dart';

// ─── Provider ─────────────────────────────────────────────────────────────────
final timetableProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, studentId) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get('parent/timetable', queryParameters: {'studentId': studentId});
  if (response.data['success'] == true) {
    return Map<String, dynamic>.from(response.data);
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load timetable');
  }
});

// ─── Screen ──────────────────────────────────────────────────────────────────
class TimetableScreen extends ConsumerStatefulWidget {
  const TimetableScreen({super.key});

  @override
  ConsumerState<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends ConsumerState<TimetableScreen> {
  int _selectedDay = DateTime.now().weekday; // 1=Mon..7=Sun

  static const _days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  static const _dayFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  static const _subjectColors = [
    Color(0xFF1565C0), Color(0xFF2E7D32), Color(0xFF6A1B9A),
    Color(0xFFF57C00), Color(0xFFC62828), Color(0xFF00695C),
    Color(0xFF4527A0), Color(0xFF283593),
  ];

  Color _colorForSubject(String name) {
    return _subjectColors[name.codeUnits.fold(0, (a, b) => a + b) % _subjectColors.length];
  }

  @override
  Widget build(BuildContext context) {
    final dashboardAsync = ref.watch(dashboardDataProvider);

    final studentId = dashboardAsync.maybeWhen(
      data: (d) => d['activeStudentId'] as String?,
      orElse: () => null,
    );

    if (studentId == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: ref.watch(timetableProvider(studentId)).when(
        data: (data) {
          if (data['data'] == null) {
            return _buildEmptyState(data['message'] ?? 'No timetable configured yet');
          }

          final timetableData = data['data'] as Map<String, dynamic>;
          final schedule = timetableData['config'] as Map<String, dynamic>? ?? {};
          final classroomName = timetableData['classroomName'] as String? ?? 'Class';
          final timetableName = timetableData['name'] as String? ?? 'Weekly Timetable';

          return CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              _buildSliverAppBar(classroomName, timetableName),
              SliverToBoxAdapter(
                child: _buildDaySelector(),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
                sliver: _buildDaySchedule(schedule, _selectedDay),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => _buildErrorState(err.toString(), studentId),
      ),
    );
  }

  Widget _buildSliverAppBar(String classroom, String title) {
    return SliverAppBar(
      expandedHeight: 180,
      pinned: true,
      stretch: true,
      backgroundColor: AppTheme.primaryColor,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          children: [
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF6B21A8), Color(0xFF9333EA)],
                ),
              ),
            ),
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 60, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      classroom.toUpperCase(),
                      style: GoogleFonts.sora(
                        color: Colors.white.withOpacity(0.7),
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      title,
                      style: GoogleFonts.sora(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        title: Text(
          'Timetable',
          style: GoogleFonts.sora(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        centerTitle: true,
      ),
      leading: Padding(
        padding: const EdgeInsets.all(8.0),
        child: ElevatedButton(
          onPressed: () => Navigator.pop(context),
          style: AppTheme.headerButtonStyle(
            backgroundColor: Colors.white.withOpacity(0.2),
            iconColor: Colors.white,
          ),
          child: const Icon(Icons.chevron_left_rounded, size: 22),
        ),
      ),
    );
  }

  Widget _buildDaySelector() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Row(
          children: List.generate(_days.length, (i) {
            final dayNum = i + 1;
            final isSelected = _selectedDay == dayNum;
            final isToday = DateTime.now().weekday == dayNum;
            return GestureDetector(
              onTap: () => setState(() => _selectedDay = dayNum),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.only(right: 12),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  color: isSelected ? AppTheme.textPrimary : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: isSelected 
                    ? [BoxShadow(color: AppTheme.textPrimary.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4))]
                    : [const BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _days[i],
                      style: GoogleFonts.sora(
                        color: isSelected ? Colors.white : AppTheme.textSecondary,
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                      ),
                    ),
                    if (isToday)
                      Container(
                        width: 4,
                        height: 4,
                        margin: const EdgeInsets.only(top: 4),
                        decoration: BoxDecoration(
                          color: isSelected ? Colors.white : AppTheme.primaryColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
              ),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.calendar_month_outlined, size: 80, color: AppTheme.borderColor),
          const SizedBox(height: 20),
          Text(message, style: GoogleFonts.dmSans(color: AppTheme.textTertiary)),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error, String studentId) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline_rounded, color: AppTheme.errorColor, size: 64),
          const SizedBox(height: 20),
          Text("Failed to load timetable", style: GoogleFonts.sora(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(error, style: GoogleFonts.dmSans(color: AppTheme.textTertiary), textAlign: TextAlign.center),
          const SizedBox(height: 24),
          ElevatedButton(onPressed: () => ref.refresh(timetableProvider(studentId)), child: const Text('Retry')),
        ],
      ),
    );
  }

  Widget _buildDaySchedule(Map<String, dynamic> schedule, int dayNum) {
    final dayKeys = [dayNum.toString(), _dayFull[dayNum - 1], _days[dayNum - 1]];
    List<dynamic> periods = [];
    for (final key in dayKeys) {
      if (schedule.containsKey(key)) {
        final val = schedule[key];
        if (val is List) { periods = val; break; }
      }
    }

    if (periods.isEmpty) {
      final nested = schedule['periods'] ?? schedule['schedule'] ?? schedule['days'];
      if (nested is Map) {
        for (final key in dayKeys) {
          if (nested.containsKey(key)) {
            final val = nested[key];
            if (val is List) { periods = val; break; }
          }
        }
      }
    }

    if (periods.isEmpty) {
      return SliverFillRemaining(
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.free_breakfast_outlined, size: 48, color: AppTheme.borderColor),
              const SizedBox(height: 16),
              Text('No classes on ${_dayFull[dayNum - 1]}', style: GoogleFonts.dmSans(color: AppTheme.textTertiary, fontSize: 15)),
            ],
          ),
        ),
      );
    }

    final now = TimeOfDay.now();
    final nowMinutes = now.hour * 60 + now.minute;

    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (ctx, i) {
          final period = periods[i] as Map<String, dynamic>? ?? {};
          final subject = period['subject'] as String? ?? period['name'] as String? ?? 'Period ${i + 1}';
          final teacher = period['teacher'] as String? ?? period['teacherName'] as String? ?? '';
          final startTime = period['startTime'] as String? ?? period['start'] as String? ?? '';
          final endTime = period['endTime'] as String? ?? period['end'] as String? ?? '';
          final room = period['room'] as String? ?? period['classroom'] as String? ?? '';

          bool isCurrent = false;
          if (startTime.isNotEmpty && endTime.isNotEmpty && DateTime.now().weekday == dayNum) {
            try {
              final sp = startTime.split(':');
              final ep = endTime.split(':');
              final start = int.parse(sp[0]) * 60 + int.parse(sp[1]);
              final end = int.parse(ep[0]) * 60 + int.parse(ep[1]);
              isCurrent = nowMinutes >= start && nowMinutes < end;
            } catch (_) {}
          }

          final color = _colorForSubject(subject);

          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: AppTheme.glassDecoration(
              opacity: isCurrent ? 0.95 : 0.05,
              color: isCurrent ? AppTheme.primaryColor : Colors.white,
            ),
            child: IntrinsicHeight(
              child: Row(
                children: [
                  // Time indicator
                  Container(
                    width: 70,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    decoration: BoxDecoration(
                      color: isCurrent ? Colors.white.withOpacity(0.1) : AppTheme.borderColor.withOpacity(0.2),
                      borderRadius: const BorderRadius.horizontal(left: Radius.circular(24)),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          startTime,
                          style: GoogleFonts.sora(
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                            color: isCurrent ? Colors.white : AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          endTime,
                          style: GoogleFonts.dmSans(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: isCurrent ? Colors.white70 : AppTheme.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Period Details
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  subject,
                                  style: GoogleFonts.sora(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 16,
                                    color: isCurrent ? Colors.white : AppTheme.textPrimary,
                                  ),
                                ),
                              ),
                              if (isCurrent)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    'ACTIVE',
                                    style: GoogleFonts.sora(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(Icons.person_outline_rounded, size: 14, color: isCurrent ? Colors.white70 : AppTheme.textTertiary),
                              const SizedBox(width: 6),
                              Text(
                                teacher,
                                style: GoogleFonts.dmSans(
                                  color: isCurrent ? Colors.white70 : AppTheme.textSecondary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(width: 16),
                              if (room.isNotEmpty) ...[
                                Icon(Icons.meeting_room_outlined, size: 14, color: isCurrent ? Colors.white70 : AppTheme.textTertiary),
                                const SizedBox(width: 6),
                                Text(
                                  room,
                                  style: GoogleFonts.dmSans(
                                    color: isCurrent ? Colors.white70 : AppTheme.textSecondary,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  // Side accent indicator
                  Container(
                    width: 4,
                    height: 24,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: isCurrent ? Colors.white30 : color,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ],
              ),
            ),
          ).animate().fadeIn(delay: (i * 100).ms).slideX(begin: 0.1);
        },
        childCount: periods.length,
      ),
    );
  }
}
