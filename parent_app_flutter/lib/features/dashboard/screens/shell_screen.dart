import 'package:flutter/material.dart';
import 'package:parent_app_flutter/core/theme/app_theme.dart';
import 'dashboard_screen.dart';
import '../../homework/screens/homework_screen.dart';
import '../../attendance/screens/attendance_screen.dart';
import '../../notifications/screens/notification_screen.dart';
import '../../timetable/screens/timetable_screen.dart';
import 'more_screen.dart';
import '../widgets/quick_access_sheet.dart';

class ShellScreen extends StatefulWidget {
  const ShellScreen({Key? key}) : super(key: key);

  @override
  _ShellScreenState createState() => _ShellScreenState();
}

class _ShellScreenState extends State<ShellScreen> {
  int _currentIndex = 0;

  void _openSheet(Widget screen) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(top: MediaQuery.of(ctx).padding.top + 40),
        child: ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          child: screen,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEBEBF0),
      body: Stack(
        children: [
          // Always show dashboard
          const DashboardScreen(),
          
          // Custom Bottom Navigation Bar
          Positioned(
            bottom: 0, left: 0, right: 0,
            child: _buildCustomBottomNav(),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.95),
        border: const Border(top: BorderSide(color: Color(0x1F00D4FF), width: 1)),
        boxShadow: const [
          BoxShadow(color: Color(0x0F000000), blurRadius: 20, offset: Offset(0, -4))
        ],
      ),
      padding: const EdgeInsets.fromLTRB(6, 8, 6, 20),
      child: SafeArea(
        top: false,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            _buildNavTab(0, Icons.home_outlined, 'Home', const Color(0xFF00B8D9), onTap: () {}),
            _buildNavTab(1, Icons.people_outline, 'Attend.', AppTheme.sageAcc, onTap: () => _openSheet(const AttendanceScreen())),
            
            // Center Floating Button
            _buildCenterNavTab(),
            
            _buildNavTab(3, Icons.notifications_none, 'Alerts', AppTheme.roseAcc, badge: 5, onTap: () => _openSheet(const NotificationScreen())),
            _buildNavTab(4, Icons.calendar_today_outlined, 'Timetable', AppTheme.skyAcc, onTap: () => _openSheet(const TimetableScreen())),
          ],
        ),
      ),
    );
  }

  Widget _buildNavTab(int index, IconData icon, String label, Color activeColor, {int? badge, VoidCallback? onTap}) {
    final isSelected = _currentIndex == index;
    
    return Expanded(
      child: GestureDetector(
        onTap: onTap ?? () {},
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: 44,
                  height: 34,
                  decoration: BoxDecoration(
                    color: isSelected ? activeColor.withOpacity(0.12) : Colors.transparent,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: isSelected 
                        ? [BoxShadow(color: activeColor.withOpacity(0.28), blurRadius: 14, offset: const Offset(0, 4))] 
                        : [],
                  ),
                  child: Center(
                    child: Icon(
                      icon,
                      color: isSelected ? activeColor : AppTheme.t4,
                      size: 22,
                    ),
                  ),
                ),
                if (badge != null)
                  Positioned(
                    top: -2,
                    right: -2,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFFFF4D6D), Color(0xFFF87171)]),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.white, width: 1.5),
                        boxShadow: const [BoxShadow(color: Color(0x66EF4444), blurRadius: 6, offset: Offset(0, 2))],
                      ),
                      child: Text(
                        '$badge',
                        style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 5),
            Text(
              label,
              style: TextStyle(
                fontSize: 9,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w700,
                color: isSelected ? activeColor : AppTheme.t4,
                letterSpacing: 0.15,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCenterNavTab() {
    return GestureDetector(
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          barrierColor: const Color(0x730F0E1A), // rgba(15,14,26,0.45)
          builder: (context) => const QuickAccessSheet(),
        );
      },
      child: Container(
        width: 60,
        margin: const EdgeInsets.symmetric(horizontal: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Transform.translate(
              offset: const Offset(0, -14),
              child: Container(
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: [Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFFA78BFA)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  border: Border.all(color: Colors.white, width: 3),
                  boxShadow: const [
                    BoxShadow(color: Color(0x73000000), blurRadius: 32, offset: Offset(0, 10)),
                    BoxShadow(color: Color(0x5900D4FF), blurRadius: 16, offset: Offset(0, 4)),
                  ],
                ),
                child: const Center(
                  child: Icon(Icons.grid_view_rounded, color: Colors.white, size: 24),
                ),
              ),
            ),
            Transform.translate(
              offset: const Offset(0, -10),
              child: const Text(
                'All Apps',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0094FF),
                  letterSpacing: 0.1,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
