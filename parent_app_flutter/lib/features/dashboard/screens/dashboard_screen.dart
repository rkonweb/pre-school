import 'package:flutter/material.dart';
import 'package:parent_app_flutter/core/theme/app_theme.dart';
import 'package:parent_app_flutter/core/network/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../homework/screens/homework_screen.dart';
import '../../attendance/screens/attendance_screen.dart';
import '../../fees/screens/fees_screen.dart';
import '../../exams/screens/exams_screen.dart';
import '../../timetable/screens/timetable_screen.dart';
import '../../diary/screens/diary_screen.dart';
import '../../messages/screens/messages_screen.dart';
import '../../transport/screens/bus_tracker_screen.dart';

// Import New Dashboard Widgets
import '../widgets/hero_header_widget.dart';
import '../widgets/dashboard_stats_widget.dart';
import '../widgets/quick_actions_widget.dart';
import '../widgets/bus_tracker_widget.dart';
import '../widgets/schedule_widget.dart';
import '../widgets/grades_widget.dart';
import '../widgets/attendance_preview_widget.dart';
import '../widgets/homework_preview_widget.dart';
import '../widgets/fees_preview_widget.dart';
import '../widgets/diary_preview_widget.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? _studentData;
  Map<String, dynamic>? _stats;
  Map<String, dynamic>? _nextClass;
  List<dynamic>? _todaysSchedule;
  Map<String, dynamic>? _feePreview;
  Map<String, dynamic>? _diaryPreview;
  List<dynamic> _students = [];
  String _parentName = '';
  bool _isLoading = true;
  String _activeStudentId = '';

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    setState(() => _isLoading = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final userDataStr = prefs.getString('user_data');
      if (userDataStr != null) {
        final userData = jsonDecode(userDataStr);
        _students = userData['students'] ?? [];
        _parentName = userData['name'] ?? 'Parent';
      }
      
      _activeStudentId = prefs.getString('active_student_id') ?? '';
      
      if (_activeStudentId.isNotEmpty) {
          final response = await ApiClient.dio.get('/dashboard', queryParameters: {
             'studentId': _activeStudentId
          });
          
          if(response.data['success']) {
             setState(() {
                _studentData = response.data['data']['student'];
                _stats = response.data['data']['stats'];
                _nextClass = response.data['data']['nextClass'];
                _todaysSchedule = response.data['data']['todaysSchedule'];
                _feePreview = response.data['data']['feePreview'];
                _diaryPreview = response.data['data']['diaryPreview'];
             });
          }
      }
    } catch (e) {
      print('Failed to load dashboard: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _switchStudent(String id) async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('active_student_id', id);
      _loadDashboard();
  }

  void _navTo(Widget screen) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }

  void _openDiarySheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Padding(
        padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 40),
        child: const ClipRRect(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          child: DiaryScreen(),
        ),
      ),
    );
  }

  void _openHomeworkSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Padding(
        padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 40),
        child: const ClipRRect(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          child: HomeworkScreen(),
        ),
      ),
    );
  }

  void _openAttendanceSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Padding(
        padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 40),
        child: const ClipRRect(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          child: AttendanceScreen(),
        ),
      ),
    );
  }

  void _openMessagesSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Padding(
        padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 40),
        child: const ClipRRect(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          child: MessagesScreen(),
        ),
      ),
    );
  }

  void _openFeesSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Padding(
        padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 40),
        child: const ClipRRect(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          child: FeesScreen(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
       return const Center(child: CircularProgressIndicator(color: AppTheme.a1));
    }

    return Stack(
      children: [
        // 1. Hero Header Canvas (Fixed at the top, height 235)
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          height: 235,
          child: HeroHeaderWidget(
            studentData: _studentData,
            allStudents: _students,
            activeStudentId: _activeStudentId,
            parentName: _parentName,
            onStudentSwitch: _switchStudent,
          ),
        ),
        
        // 2. Scrollable Content Sheet
        Positioned.fill(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Transparent spacer to reveal the header underneath
                const SizedBox(height: 207), // 235 height - 28px overlap margin
                
                // The Grey Content Sheet
                Container(
                  decoration: const BoxDecoration(
                    color: Color(0xFFEBEBF0),
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(24),
                      topRight: Radius.circular(24),
                    ),
                    boxShadow: [
                      BoxShadow(color: Color(0x40000000), blurRadius: 28, offset: Offset(0, -10))
                    ],
                  ),
                  padding: const EdgeInsets.only(top: 14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // 3. Floating Stats Row
                      DashboardStatsWidget(stats: _stats),
                      
                      const SizedBox(height: 24),

                      // 4. Quick Actions
                      QuickActionsWidget(
                        onHomeworkTap: () => _openHomeworkSheet(),
                        onAttendanceTap: () => _openAttendanceSheet(),
                        onFeesTap: () => _openFeesSheet(),
                        onMessagesTap: () => _openMessagesSheet(),
                      ),

                      // 5. Bus Tracker Card
                      BusTrackerWidget(
                         onTap: () {
                           showModalBottomSheet(
                             context: context,
                             isScrollControlled: true,
                             backgroundColor: Colors.transparent,
                             builder: (context) => Padding(
                               padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 40),
                               child: const ClipRRect(
                                 borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                                 child: BusTrackerScreen(),
                               ),
                             ),
                           );
                         }
                      ),

                      // 6. Timetable Preview
                      ScheduleWidget(
                        nextClass: _nextClass,
                        todaysSchedule: _todaysSchedule,
                      ),
                      
                      // 7. Grades Tracker Preview
                      GradesWidget(stats: _stats),

                      // 8. Attendance Month Preview
                      AttendancePreviewWidget(
                         stats: _stats,
                         onTap: () => _openAttendanceSheet(),
                      ),

                      // 9. Homework Status Preview
                      HomeworkPreviewWidget(
                         stats: _stats,
                         onTap: () => _openHomeworkSheet(),
                      ),

                      // 10. Fee Summary Preview
                      FeesPreviewWidget(
                         feePreview: _feePreview,
                         onTap: () => _openFeesSheet(),
                      ),

                      // 11. School Diary Latest Entries
                      DiaryPreviewWidget(
                         diaryPreview: _diaryPreview,
                         onTap: () => _openDiarySheet(),
                      ),
                      
                      // Bottom padding to clear nav bar
                      const SizedBox(height: 90),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
