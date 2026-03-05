import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import 'notch_painter.dart';

class PremiumBottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const PremiumBottomNav({
    Key? key,
    required this.currentIndex,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: 400.ms,
      height: 86, // Exact --nav-h from HTML
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // ── Glass Background with Notch ──
          Positioned.fill(
            child: ClipPath(
              clipper: _NotchClipper(),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 40, sigmaY: 40), // --nav-blur
                child: CustomPaint(
                  painter: NotchPainter(
                    color: Colors.white.withOpacity(0.85),
                    blur: 40,
                  ),
                ),
              ),
            ),
          ),
          
          // ── Navigation Items ──
          Positioned.fill(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Expanded(child: _buildNavItem(0, Icons.home_rounded, 'Home')),
                  Expanded(child: _buildNavItem(1, Icons.how_to_reg_rounded, 'Attendance')),
                  const SizedBox(width: 64), // FAB space
                  Expanded(child: _buildNavItem(2, Icons.menu_book_rounded, 'Diary')),
                  Expanded(child: _buildNavItem(3, Icons.directions_bus_rounded, 'Transport')),
                ],
              ),
            ),
          ),
          
          // ── Central FAB (Floating Action Button) ──
          Positioned(
            top: -28, // --ni-fab margin-top: -28px
            left: 0,
            right: 0,
            child: Center(
              child: _buildFab(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFab(BuildContext context) {
    return GestureDetector(
      onTap: () => _showQuickMenu(context),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              // Pulse Animation Layer
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.primaryColor.withOpacity(0.3),
                ),
              ).animate(onPlay: (c) => c.repeat()).scale(
                begin: const Offset(1, 1),
                end: const Offset(1.6, 1.6),
                duration: 2.seconds,
                curve: Curves.easeOut,
              ).fadeOut(),
              
              // Main Disc
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Color(0xFF2E5FE8),
                      Color(0xFF4F7EFF),
                      Color(0xFF00C9A7),
                    ],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withOpacity(0.44),
                      blurRadius: 20,
                      offset: const Offset(0, 4),
                    ),
                    const BoxShadow(
                      color: Colors.black12,
                      blurRadius: 3,
                      offset: Offset(0, 1),
                    ),
                  ],
                ),
                child: const Icon(Icons.add_rounded, color: Colors.white, size: 26),
              ).animate(onPlay: (c) => c.repeat(reverse: true)).shimmer(
                duration: 3.seconds,
                color: Colors.white24,
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showQuickMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      useRootNavigator: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.72,
        minChildSize: 0.5,
        maxChildSize: 0.93,
        builder: (context, scrollCtrl) => Container(
          decoration: const BoxDecoration(
            color: Color(0xFFF8FAFC),
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            children: [
              // ── Drag handle ──
              Container(
                margin: const EdgeInsets.only(top: 12, bottom: 4),
                width: 40, height: 4,
                decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(2)),
              ),
              // ── Header ──
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
                child: Row(children: [
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Quick Access', style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 18, color: const Color(0xFF1E293B))),
                    Text('Tap any module to open', style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF94A3B8))),
                  ]),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(width: 32, height: 32, decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.close_rounded, size: 16, color: Color(0xFF64748B))),
                  ),
                ]),
              ),
              const Divider(height: 1, color: Color(0xFFE2E8F0)),
              // ── Scrollable Grid ──
              Expanded(
                child: ListView(
                  controller: scrollCtrl,
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
                  children: [
                    _menuSection(context, '📚 ACADEMICS', [
                      _menuItem(context, Icons.menu_book_rounded, 'Diary & Homework', '3 tasks pending', const Color(0xFF3B6EF8), const Color(0xFFEEF3FF), '/diary'),
                      _menuItem(context, Icons.calendar_month_rounded, 'Timetable', 'Today: 7 periods', const Color(0xFF00C9A7), const Color(0xFFF0FDF9), '/timetable'),
                      _menuItem(context, Icons.analytics_outlined, 'Progress', 'Q3 report available', const Color(0xFF8B5CF6), const Color(0xFFF5F0FF), '/progress'),
                      _menuItem(context, Icons.local_library_rounded, 'Library', '2 books due soon', const Color(0xFFF5A623), const Color(0xFFFFFBEB), '/library'),
                    ]),
                    const SizedBox(height: 12),
                    _menuSection(context, '🏫 SCHOOL LIFE', [
                      _menuItem(context, Icons.how_to_reg_rounded, 'Attendance', '94% this month', const Color(0xFFFF6B3D), const Color(0xFFFFF5EE), '/attendance'),
                      _menuItem(context, Icons.directions_bus_rounded, 'Transport', 'Bus #7 • ETA 3:50 PM', const Color(0xFF00C9A7), const Color(0xFFF0FDF9), '/transport'),
                      _menuItem(context, Icons.home_work_rounded, 'Hostel', 'Room A-204 • Block A', const Color(0xFF8B5CF6), const Color(0xFFF5F0FF), '/hostel'),
                      _menuItem(context, Icons.health_and_safety_rounded, 'Health', 'Medical records', const Color(0xFFec4899), const Color(0xFFfce7f3), '/health'),
                      _menuItem(context, Icons.event_available_rounded, 'Events', '2 upcoming events', const Color(0xFF3B6EF8), const Color(0xFFEEF3FF), '/events'),
                      _menuItem(context, Icons.people_rounded, 'PTM', 'Book appointment', const Color(0xFFF5A623), const Color(0xFFFFFBEB), '/ptm'),
                    ]),
                    const SizedBox(height: 12),
                    _menuSection(context, '💳 MANAGE', [
                      _menuItem(context, Icons.account_balance_wallet_rounded, 'Fees & Payments', '₹8,200 due Nov 25', const Color(0xFFFF6B3D), const Color(0xFFFFF5EE), '/finance'),
                      _menuItem(context, Icons.fastfood_rounded, 'Canteen', 'Balance: ₹180', const Color(0xFF3B6EF8), const Color(0xFFEEF3FF), '/canteen'),
                      _menuItem(context, Icons.file_copy_rounded, 'Documents', 'TC, ID, Records', const Color(0xFF00C9A7), const Color(0xFFF0FDF9), '/documents'),
                      _menuItem(context, Icons.edit_calendar_rounded, 'Leave Request', 'Apply for leave', const Color(0xFF8B5CF6), const Color(0xFFF5F0FF), '/leave-request'),
                    ]),
                    const SizedBox(height: 12),
                    _menuSection(context, '💬 COMMUNICATION', [
                      _menuItem(context, Icons.forum_rounded, 'Messages', '2 unread • Teachers', const Color(0xFF8B5CF6), const Color(0xFFF5F0FF), '/messages'),
                      _menuItem(context, Icons.campaign_rounded, 'Notifications', '8 new alerts', const Color(0xFFEF4444), const Color(0xFFfee2e2), '/notifications'),
                      _menuItem(context, Icons.contact_emergency_rounded, 'Emergency', 'SOS alert', const Color(0xFFEF4444), const Color(0xFFfee2e2), '/emergency-alarm'),
                    ]),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _menuSection(BuildContext context, String label, List<Widget> items) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(
        padding: const EdgeInsets.only(left: 4, bottom: 8),
        child: Text(label, style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF94A3B8), letterSpacing: 0.8)),
      ),
      GridView.count(
        crossAxisCount: 3,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 0.85,
        children: items,
      ),
    ]);
  }

  Widget _menuItem(BuildContext context, IconData icon, String label, String sub, Color color, Color bgColor, String route) {
    return GestureDetector(
      onTap: () {
        Navigator.pop(context);
        GoRouter.of(context).go(route);
      },
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(width: 38, height: 38, decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(11)), child: Icon(icon, color: color, size: 18)),
          const SizedBox(height: 8),
          Text(label, style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 11, color: const Color(0xFF1E293B)), maxLines: 2, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(sub, style: GoogleFonts.dmSans(fontSize: 9, color: const Color(0xFF94A3B8)), maxLines: 1, overflow: TextOverflow.ellipsis),
        ]),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isSelected = currentIndex == index;
    return GestureDetector(
      onTap: () => onTap(index),
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: double.infinity,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: 300.ms,
              width: 44,
              height: 28,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                color: isSelected ? AppTheme.primaryColor.withOpacity(0.1) : Colors.transparent,
              ),
              child: Icon(
                icon,
                color: isSelected ? AppTheme.primaryColor : AppTheme.textTertiary,
                size: 20,
              ),
            ).animate(target: isSelected ? 1 : 0).scale(begin: const Offset(1, 1), end: const Offset(1.1, 1.1)),
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.dmSans(
                fontSize: 9,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? AppTheme.primaryColor : AppTheme.textTertiary,
              ),
            ),
            if (isSelected)
              Container(
                margin: const EdgeInsets.only(top: 2),
                width: 24,
                height: 3,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(2),
                  gradient: const LinearGradient(
                    colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                  ),
                ),
              ).animate().scaleX(begin: 0, end: 1),
          ],
        ),
      ),
    );
  }
}

class _NotchClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    const double notchWidth = 80;
    const double notchHeight = 35;
    final double centerX = size.width / 2;

    path.moveTo(0, 0);
    path.lineTo(centerX - notchWidth / 2 - 20, 0);
    path.quadraticBezierTo(centerX - notchWidth / 2, 0, centerX - notchWidth / 2, 10);
    path.arcToPoint(
      Offset(centerX + notchWidth / 2, 10),
      radius: const Radius.circular(notchWidth / 2),
      clockwise: false,
    );
    path.quadraticBezierTo(centerX + notchWidth / 2, 0, centerX + notchWidth / 2 + 20, 0);
    path.lineTo(size.width, 0);
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => false;
}
