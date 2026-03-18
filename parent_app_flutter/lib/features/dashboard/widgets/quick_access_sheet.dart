import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:parent_app_flutter/core/theme/app_theme.dart';
import 'package:parent_app_flutter/core/network/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../homework/screens/homework_screen.dart';
import '../../attendance/screens/attendance_screen.dart';
import '../../fees/screens/fees_screen.dart';
import '../../exams/screens/exams_screen.dart';
import '../../timetable/screens/timetable_screen.dart';
import '../../diary/screens/diary_screen.dart';
import '../../messages/screens/messages_screen.dart';
import '../../transport/screens/bus_tracker_screen.dart';

class QuickAccessSheet extends StatefulWidget {
  const QuickAccessSheet({Key? key}) : super(key: key);

  @override
  _QuickAccessSheetState createState() => _QuickAccessSheetState();
}

class _QuickAccessSheetState extends State<QuickAccessSheet> {
  int _pendingHomework = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchBadges();
  }

  Future<void> _fetchBadges() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final activeStudentId = prefs.getString('active_student_id') ?? '';
      if (activeStudentId.isNotEmpty) {
        final res = await ApiClient.dio.get('/dashboard', queryParameters: {'studentId': activeStudentId});
        if (res.data['success'] && mounted) {
          setState(() {
            _pendingHomework = res.data['data']['stats']['pendingHomework'] ?? 0;
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _openBusTrackerSheet() {
    Navigator.pop(context); // Close quick access sheet first
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

  void _openExamsSheet() {
    Navigator.pop(context); // Close quick access sheet first
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Padding(
        padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 40),
        child: const ClipRRect(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          child: ExamsScreen(),
        ),
      ),
    );
  }

  void _openTimetableSheet() {
    Navigator.pop(context); // Close quick access sheet first
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Padding(
        padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 40),
        child: const ClipRRect(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          child: TimetableScreen(),
        ),
      ),
    );
  }

  void _openDiarySheet() {
    Navigator.pop(context); // Close quick access sheet first
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
    Navigator.pop(context); // Close quick access sheet first
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
    Navigator.pop(context); // Close quick access sheet first
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
    Navigator.pop(context); // Close quick access sheet first
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
    Navigator.pop(context); // Close quick access sheet first
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
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFAF4F4F9), // rgba(250,250,255,0.98) visual equivalent
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(22),
          topRight: Radius.circular(22),
        ),
      ),
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Drag handle
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0x59B49B78), // rgba(180,155,120,0.35)
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Quick Access',
                        style: TextStyle(
                          fontFamily: 'Outfit',
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0D1117),
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'All modules · Tap to open',
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      width: 30,
                      height: 30,
                      decoration: BoxDecoration(
                        color: AppTheme.bg2,
                        border: Border.all(color: const Color(0xFFE5E7EB)),
                        borderRadius: BorderRadius.circular(9),
                      ),
                      child: const Center(
                        child: Icon(Icons.close, color: AppTheme.t2, size: 16),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Search Box
              Container(
                height: 36,
                decoration: BoxDecoration(
                  color: AppTheme.bg2,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE5E7EB), width: 1.5),
                ),
                child: Row(
                  children: [
                    const SizedBox(width: 12),
                    const Icon(Icons.search, size: 14, color: AppTheme.t4),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppTheme.t1, fontFamily: 'Outfit'),
                        decoration: const InputDecoration(
                          hintText: 'Search modules…',
                          hintStyle: TextStyle(fontSize: 12, color: AppTheme.t4, fontWeight: FontWeight.w500),
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.zero,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Core Modules
              _buildSectionLabel('CORE MODULES'),
              _buildGridRow([
                _buildQuickActionItem('Homework', Icons.menu_book_rounded, const [Color(0xFFF97316), Color(0xFFEF4444)], () => _openHomeworkSheet(), badge: _pendingHomework),
                _buildQuickActionItem('Attendance', Icons.check_circle_outline, const [Color(0xFF10B981), Color(0xFF059669)], () => _openAttendanceSheet()),
                _buildQuickActionItem('Bus Track', Icons.directions_bus_filled, const [Color(0xFF3B82F6), Color(0xFF1D4ED8)], () => _openBusTrackerSheet()),
                _buildQuickActionItem('Messages', Icons.mail_outline, const [Color(0xFF8B5CF6), Color(0xFF6D28D9)], () => _openMessagesSheet(), badge: 4),
              ]),
              _buildGridRow([
                _buildQuickActionItem('Diary', Icons.book, const [Color(0xFFEC4899), Color(0xFFBE185D)], () => _openDiarySheet(), badge: 2),
                _buildQuickActionItem('Pay Fees', Icons.receipt_long, const [Color(0xFFF59E0B), Color(0xFFD97706)], () => _openFeesSheet()),
                _buildQuickActionItem('Calendar', Icons.calendar_month, const [Color(0xFF6366F1), Color(0xFF4338CA)], () => null),
                _buildQuickActionItem('Alerts', Icons.notifications_none, const [Color(0xFFF43F5E), Color(0xFFBE123C)], () => null, badge: 5),
              ]),

              const SizedBox(height: 10),

              // Academics
              _buildSectionLabel('ACADEMICS'),
              _buildGridRow([
                _buildQuickActionItem('Grades', Icons.bar_chart, const [Color(0xFF0EA5E9), Color(0xFF0369A1)], () => null),
                _buildQuickActionItem('Timetable', Icons.calendar_today_outlined, const [Color(0xFF22C55E), Color(0xFF15803D)], () => _openTimetableSheet()),
                _buildQuickActionItem('Report Card', Icons.recent_actors_outlined, const [Color(0xFFA855F7), Color(0xFF7E22CE)], () => null),
                _buildQuickActionItem('Exam Sched', Icons.event_note, const [Color(0xFFF97316), Color(0xFFC2410C)], () => _openExamsSheet()),
              ]),
              
              const SizedBox(height: 10),

              // School Life
              _buildSectionLabel('SCHOOL LIFE'),
              _buildGridRow([
                _buildQuickActionItem('Events', Icons.emoji_events_outlined, const [Color(0xFFEAB308), Color(0xFFA16207)], () => null),
                _buildQuickActionItem('Gallery', Icons.photo_library_outlined, const [Color(0xFFEC4899), Color(0xFF9D174D)], () => null),
                _buildQuickActionItem('Clubs', Icons.groups_outlined, const [Color(0xFF14B8A6), Color(0xFF0F766E)], () => null),
                _buildQuickActionItem('Health', Icons.favorite_border, const [Color(0xFFF43F5E), Color(0xFF9F1239)], () => null),
              ]),

              const SizedBox(height: 14),

              // Settings & Support Row
              _buildSectionLabel('SETTINGS & SUPPORT'),
              Row(
                children: [
                  _buildUtilityBtn('Settings', 'Account & Prefs', Icons.settings_outlined, const [Color(0xFF64748B), Color(0xFF334155)]),
                  const SizedBox(width: 8),
                  _buildUtilityBtn('Help', 'FAQs & Support', Icons.help_outline, const [Color(0xFF3B82F6), Color(0xFF1E40AF)]),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8, top: 4),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.w700,
          color: AppTheme.t4,
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  Widget _buildGridRow(List<Widget> children) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children.map((e) => Expanded(child: e)).toList(),
      ),
    );
  }

  Widget _buildQuickActionItem(String label, IconData icon, List<Color> bgGradient, VoidCallback onTap, {int? badge}) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: bgGradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [BoxShadow(color: Color(0x40000000), blurRadius: 14, offset: Offset(0, 4))],
                ),
                child: Center(
                  child: Icon(icon, color: Colors.white, size: 22),
                ),
              ),
              if (badge != null && badge > 0)
                Positioned(
                  top: -6,
                  right: -6,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFFFF4D6D), Color(0xFFF87171)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.white.withOpacity(0.9), width: 1.5),
                      boxShadow: const [BoxShadow(color: Color(0x66EF4444), blurRadius: 6, offset: Offset(0, 2))],
                    ),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Center(
                      child: Text(
                        '$badge',
                        style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w700,
              color: AppTheme.t2,
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUtilityBtn(String label, String sub, IconData icon, List<Color> bgGradient) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFE5E7EB)),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: bgGradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
                borderRadius: BorderRadius.circular(10),
                boxShadow: const [BoxShadow(color: Color(0x38000000), blurRadius: 14, offset: Offset(0, 4))],
              ),
              child: Center(child: Icon(icon, color: Colors.white, size: 16)),
            ),
            const SizedBox(width: 9),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.t1)),
                  const SizedBox(height: 1),
                  Text(sub, style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w500, color: AppTheme.t3)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
