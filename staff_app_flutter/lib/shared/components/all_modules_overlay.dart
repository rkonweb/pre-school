import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/state/auth_state.dart';
import '../../core/registry/module_registry.dart';
import '../../features/attendance/teacher_attendance_view.dart';
import '../../features/profile/teacher_profile_view.dart';
import '../../features/attendance/self_attendance_view.dart';
import '../../features/diary/teacher_diary_view.dart';
import '../../features/homework/teacher_homework_view.dart';
import '../../features/leave/teacher_leave_view.dart';
import '../../features/schedule/teacher_schedule_view.dart';
import '../../features/ptm/staff_ptm_view.dart';
import 'module_popup_shell.dart';

// Placeholder empty views for not-yet-fetched modules so the app doesn't crash
Widget _mockView(String title) => Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text('Popup View for $title')),
    );

class AllModulesOverlay extends ConsumerWidget {
  const AllModulesOverlay({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFF9FAFB),
        borderRadius: BorderRadius.vertical(top: Radius.circular(36)),
      ),
      child: Column(
        children: [
          // Drag Handle
          const SizedBox(height: 12),
          Container(
            width: 48,
            height: 5,
            decoration: BoxDecoration(
              color: const Color(0xFFE2E8F0),
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          const SizedBox(height: 24),

          Expanded(
            child: Stack(
              children: [
                ListView(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                  children: [
                    _buildProfileSection(ref),
                    const SizedBox(height: 24),
                    _buildSearchBar(),
                    const SizedBox(height: 32),
                    _buildSectionHeader(Icons.electric_bolt_rounded, 'QUICK ACTIONS', const Color(0xFFFFD60A)),
                    const SizedBox(height: 16),
                    _buildQuickActionsRow(context),
                    const SizedBox(height: 32),
                    _buildSectionHeader(Icons.menu_book_rounded, 'TEACHING', const Color(0xFF6366F1)),
                    const SizedBox(height: 16),
                    _buildTeachingList(),
                    const SizedBox(height: 32),
                    _buildSectionHeader(Icons.window_rounded, 'MODULES', const Color(0xFF94A3B8), showAll: true),
                    const SizedBox(height: 16),
                    _buildModulesMiniRow(),
                    if (ref.watch(activeRoleProvider).toUpperCase().trim() == 'ADMIN') ...[
                      const SizedBox(height: 32),
                      _buildSectionHeader(Icons.admin_panel_settings_rounded, 'ADMINISTRATOR', const Color(0xFF140E28)),
                      const SizedBox(height: 16),
                      _buildAdminModulesGrid(),
                    ],
                  ],
                ),
                
                // Sticky Footer
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: _buildFooter(context, ref),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getInitials(String? name) {
    if (name == null || name.isEmpty) return 'U';
    final parts = name.split(' ').where((e) => e.isNotEmpty);
    if (parts.isEmpty) return 'U';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  Widget _buildProfileSection(WidgetRef ref) {
    final user = ref.watch(userProfileProvider);
    return Row(
      children: [
        // Avatar
        Container(
          width: 54,
          height: 54,
          decoration: BoxDecoration(
            gradient: AppTheme.teacherTheme,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: AppTheme.teacherTheme.colors.first.withOpacity(0.3),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          alignment: Alignment.center,
          child: Text(
            _getInitials(user?.name),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                user?.name ?? 'User',
                style: const TextStyle(
                  fontFamily: 'Clash Display',
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF140E28),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                user?.dept ?? 'EduSphere Staff',
                style: const TextStyle(
                  fontFamily: 'Satoshi',
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF7B7291),
                ),
              ),
            ],
          ),
        ),
        // Online Badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFF0FDF4),
            borderRadius: BorderRadius.circular(100),
            border: Border.all(color: const Color(0xFFDCFCE7)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: Color(0xFF22C55E),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              const Text(
                'Online',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF166534),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _handleNavigation(BuildContext context, String route) {
    Navigator.pop(context); // close the overlay first
    
    Widget? targetView;
    switch (route) {
      case '/profile':
        targetView = const TeacherProfileView();
        break;
      case '/attendance':
        targetView = const TeacherAttendanceView();
        break;
      case '/homework':
        targetView = TeacherHomeworkView();
        break;
      case '/schedule':
      case '/timetable':
        targetView = TeacherScheduleView();
        break;
      case '/leave':
        targetView = TeacherLeaveView();
        break;
      case '/self-attendance':
        targetView = const StaffSelfAttendanceView();
        break;
      case '/diary':
        targetView = TeacherDiaryView();
        break;
      case '/ptm':
        targetView = const StaffPTMView();
        break;
      default:
        // For unknown routes, just push as temporary fallback
        context.push(route);
        return;
    }

    if (targetView != null) {
      showModulePopup(context, targetView);
    }
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      height: 52,
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          const Icon(Icons.grid_view_rounded, size: 20, color: Color(0xFF94A3B8)),
          const SizedBox(width: 12),
          const Expanded(
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search menus, modules...',
                hintStyle: TextStyle(
                  fontFamily: 'Satoshi',
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF94A3B8),
                ),
                border: InputBorder.none,
                isDense: true,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(IconData icon, String title, Color iconColor, {bool showAll = false}) {
    return Row(
      children: [
        Icon(icon, size: 14, color: iconColor),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontFamily: 'Satoshi',
            fontSize: 11,
            fontWeight: FontWeight.w900,
            letterSpacing: 0.8,
            color: Color(0xFF94A3B8),
          ),
        ),
        if (showAll) ...[
          const Spacer(),
          const Text(
            'All',
            style: TextStyle(
              fontFamily: 'Satoshi',
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: Color(0xFFF43F5E),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildQuickActionsRow(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: [
          _buildQuickActionItem('Attendance', Icons.calendar_today_rounded, const Color(0xFF10B981), () => _handleNavigation(context, '/attendance')),
          _buildQuickActionItem('Marks', Icons.description_rounded, const Color(0xFF8B5CF6), () { Navigator.pop(context); }),
          _buildQuickActionItem('Homework', Icons.book_rounded, const Color(0xFFF59E0B), () => _handleNavigation(context, '/homework')),
          _buildQuickActionItem('Quiz/Test', Icons.assignment_turned_in_rounded, const Color(0xFF3B82F6), () { Navigator.pop(context); }),
          _buildQuickActionItem('Leave', Icons.check_circle_outline_rounded, const Color(0xFFF97316), () => _handleNavigation(context, '/leave')),
          _buildQuickActionItem('PTM', Icons.people_alt_rounded, const Color(0xFF7C3AED), () => _handleNavigation(context, '/ptm')),
        ],
      ),
    );
  }

  Widget _buildQuickActionItem(String label, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 80,
        margin: const EdgeInsets.only(right: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF140E28).withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontFamily: 'Satoshi',
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: Color(0xFF140E28),
            ),
          ),
        ],
      ),
    ));
  }

  Widget _buildTeachingList() {
    return Builder(builder: (context) => Column(
      children: [
        GestureDetector(
          onTap: () => _handleNavigation(context, '/schedule'),
          child: _buildTeachingTile('My Timetable', 'Tap to view your weekly schedule', Icons.calendar_month_rounded, const Color(0xFFF59E0B)),
        ),
        GestureDetector(
          onTap: () => _handleNavigation(context, '/homework'),
          child: _buildTeachingTile('Homework Tracker', '3 pending corrections · 2 overdue', Icons.book_outlined, const Color(0xFFFB923C), badge: '3'),
        ),
        _buildTeachingTile('Tests & Quizzes', 'Next test: Fri 14 Mar', Icons.assignment_rounded, const Color(0xFF8B5CF6)),
        _buildTeachingTile('Top Performers', '3 students above 90% this week', Icons.workspace_premium_rounded, const Color(0xFFFCD34D), badge: '3'),
        _buildTeachingTile('Class Analytics', 'Avg 74.2% · ↑2.1% vs last week', Icons.analytics_rounded, const Color(0xFF6366F1)),
        GestureDetector(
          onTap: () => _handleNavigation(context, '/ptm'),
          child: _buildTeachingTile('PTM Scheduler', 'Manage parent-teacher meetings', Icons.people_alt_rounded, const Color(0xFF7C3AED)),
        ),
      ],
    ));
  }

  Widget _buildTeachingTile(String title, String sub, IconData icon, Color iconColor, {String? badge}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, size: 22, color: iconColor),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF140E28),
                  ),
                ),
                Text(
                  sub,
                  style: const TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF94A3B8),
                  ),
                ),
              ],
            ),
          ),
          if (badge != null)
            Container(
              padding: const EdgeInsets.all(6),
              decoration: const BoxDecoration(
                color: Color(0xFFF43F5E),
                shape: BoxShape.circle,
              ),
              child: Text(
                badge,
                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
              ),
            ),
          const SizedBox(width: 8),
          const Icon(Icons.chevron_right_rounded, color: Color(0xFFE2E8F0)),
        ],
      ),
    );
  }

  Widget _buildModulesMiniRow() {
    return Row(
      children: [
        _buildModuleMiniItem(const Color(0xFFFFF7ED), const Color(0xFFF97316), Icons.person_rounded),
        const SizedBox(width: 12),
        _buildModuleMiniItem(const Color(0xFFEFF6FF), const Color(0xFF3B82F6), Icons.school_rounded),
        const SizedBox(width: 12),
        _buildModuleMiniItem(const Color(0xFFF5F3FF), const Color(0xFF8B5CF6), Icons.import_contacts_rounded, badge: '2'),
      ],
    );
  }

  Widget _buildModuleMiniItem(Color bg, Color color, IconData icon, {String? badge}) {
    return Expanded(
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            height: 60,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFF1F5F9)),
            ),
            alignment: Alignment.center,
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: bg,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Icon(icon, size: 16, color: color),
            ),
          ),
          if (badge != null)
            Positioned(
              top: -4,
              right: 18,
              child: Container(
                padding: const EdgeInsets.all(5),
                decoration: const BoxDecoration(
                  color: Color(0xFFF43F5E),
                  shape: BoxShape.circle,
                ),
                child: Text(
                  badge,
                  style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800),
                ),
              ),
            ),
        ],
      ),
    );
  }

  bool _canAccessModule(ModuleItem m, UserProfile? user, String activeRole) {
    if (user == null) return false;
    final role = activeRole.toUpperCase();
    if (role == 'ADMIN' || role == 'SUPER_ADMIN') return true;
    
    if (user.permissions.isEmpty) {
      if (role == 'TEACHER' || role == 'STAFF') {
        const teacherModules = ['dashboard', 'attendance', 'self_attendance', 'homework', 'schedule', 'communication', 'leave', 'diary'];
        return teacherModules.contains(m.key);
      }
      if (role == 'DRIVER') {
        const driverModules = ['dashboard', 'transport', 'communication', 'leave'];
        return driverModules.contains(m.key);
      }
      return ['dashboard', 'leave', 'communication'].contains(m.key);
    }
    
    return user.permissions.any((p) => p.startsWith('${m.key}.'));
  }

  Widget _buildAdminModulesGrid() {
    return Consumer(builder: (context, ref, child) {
      final user = ref.watch(userProfileProvider);
      final activeRole = ref.watch(activeRoleProvider);
      final modules = ModuleRegistry.allModules.where((m) => _canAccessModule(m, user, activeRole)).toList();
      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.85,
        ),
        itemCount: modules.length,
        itemBuilder: (context, index) {
          final module = modules[index];
          return _buildAdminModuleItem(context, module);
        },
      );
    });
  }

  Widget _buildAdminModuleItem(BuildContext context, ModuleItem module) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF140E28).withOpacity(0.02),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            if (module.route.isNotEmpty) {
              // we don't pop context explicitly here, as _handleNavigation does it, 
              // BUT it might throw error if context is not valid anymore... 
              // Better let _handleNavigation handle the pop.
              _handleNavigation(context, module.route);
            }
          },
          borderRadius: BorderRadius.circular(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: module.color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(module.icon, size: 24, color: module.color),
              ),
              const SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Text(
                  module.label,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF140E28),
                    height: 1.1,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFooter(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB).withOpacity(0.95),
        border: const Border(top: BorderSide(color: Color(0xFFF1F5F9))),
      ),
      child: Row(
        children: [
          // Sign Out
          Expanded(
            flex: 4,
            child: Container(
              height: 54,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: InkWell(
                borderRadius: BorderRadius.circular(20),
                onTap: () async {
                  // Show confirmation dialog
                  final confirmed = await showDialog<bool>(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      title: const Text('Sign Out',
                        style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w800)),
                      content: const Text('Are you sure you want to sign out?',
                        style: TextStyle(fontFamily: 'Satoshi')),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(ctx, false),
                          child: const Text('Cancel'),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFDC2626),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: () => Navigator.pop(ctx, true),
                          child: const Text('Sign Out', style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  );
                  if (confirmed == true && context.mounted) {
                    // Clear auth state
                    ref.read(userProfileProvider.notifier).state = null;
                    ref.read(isAuthenticatedProvider.notifier).state = false;
                    // Close overlay and navigate to login
                    Navigator.pop(context);
                    context.go('/login');
                  }
                },
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.logout_rounded, size: 18, color: Color(0xFF475569)),
                    SizedBox(width: 8),
                    Text(
                      'Sign Out',
                      style: TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF140E28),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          // Dashboard
          Expanded(
            flex: 6,
            child: Container(
              height: 54,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFF3366), Color(0xFFFF00CC)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFFF3366).withOpacity(0.35),
                    blurRadius: 15,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: InkWell(
                onTap: () => Navigator.pop(context),
                borderRadius: BorderRadius.circular(20),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.grid_view_rounded, size: 18, color: Colors.white),
                    SizedBox(width: 8),
                    Text(
                      'Dashboard',
                      style: TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Helper specific to showing this modal
Future<void> showAllModulesMenu(BuildContext context) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    barrierColor: Colors.black.withOpacity(0.4),
    builder: (context) => DraggableScrollableSheet(
      initialChildSize: 0.9,
      maxChildSize: 0.92,
      minChildSize: 0.6,
      builder: (_, controller) => const AllModulesOverlay(),
    ),
  );
}
