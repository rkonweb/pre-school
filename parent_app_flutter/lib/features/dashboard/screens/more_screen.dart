import 'package:flutter/material.dart';
import 'package:parent_app_flutter/core/theme/app_theme.dart';
import '../../fees/screens/fees_screen.dart';
import '../../exams/screens/exams_screen.dart';
import '../../timetable/screens/timetable_screen.dart';
import '../../diary/screens/diary_screen.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({Key? key}) : super(key: key);

  void _openDiarySheet(BuildContext context) {
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

  void _openFeesSheet(BuildContext context) {
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

  void _openExamsSheet(BuildContext context) {
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

  void _openTimetableSheet(BuildContext context) {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        title: const Text('More Modules', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 24, letterSpacing: -0.5, color: AppTheme.t1)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
      ),
      body: GridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.all(16),
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        children: [
          _buildActionBtn(Icons.payment, 'Fees', () => _openFeesSheet(context)),
          _buildActionBtn(Icons.assignment, 'Exams', () => _openExamsSheet(context)),
          _buildActionBtn(Icons.event, 'Timetable', () => _openTimetableSheet(context)),
          _buildActionBtn(Icons.book, 'Diary', () => _openDiarySheet(context)),
        ],
      ),
    );
  }

  Widget _buildActionBtn(IconData icon, String lbl, VoidCallback onTap) {
      return GestureDetector(
         onTap: onTap,
         child: Container(
            decoration: BoxDecoration(
               color: Colors.white,
               borderRadius: BorderRadius.circular(20),
               border: Border.all(color: const Color(0x0F000000)),
               boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 10, offset: Offset(0, 2))]
            ),
            child: Column(
               mainAxisAlignment: MainAxisAlignment.center,
               children: [
                   Icon(icon, color: AppTheme.t2, size: 40),
                   const SizedBox(height: 16),
                   Text(lbl, textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.t2)),
               ],
            ),
         ),
      );
  }
}
