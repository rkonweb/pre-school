import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
import '../../features/circular/circular_list_view.dart';
import '../../features/calendar/teacher_calendar_view.dart';
import '../../features/library/staff_library_view.dart';
import 'module_popup_shell.dart';

Widget _mockView(String title) => Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text('Popup View for $title')),
    );

class AllModulesOverlay extends ConsumerWidget {
  final ScrollController? scrollController;
  const AllModulesOverlay({super.key, this.scrollController});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProfileProvider);
    final activeRole = ref.watch(activeRoleProvider);

    return Column(children: [
      // ── Standard gradient header ──
      ModulePageHeader(
        title: 'All Modules',
        icon: Icons.grid_view_rounded,
      ),

      // ── Scrollable body ──
      Expanded(
        child: Container(
          color: const Color(0xFFF4F6FB),
          child: ListView(
            controller: scrollController,
            padding: EdgeInsets.fromLTRB(
              16, 16, 16,
              MediaQuery.of(context).padding.bottom + 24,
            ),
            children: [
              _buildSearchBar(),
              const SizedBox(height: 20),
              _buildSectionLabel('⚡  QUICK ACTIONS'),
              const SizedBox(height: 12),
              _buildQuickActionsGrid(context),
              const SizedBox(height: 20),
              _buildSectionLabel('📚  TEACHING & MANAGEMENT'),
              const SizedBox(height: 12),
              _buildTeachingCards(context),
              if (activeRole.toUpperCase().trim() == 'ADMIN') ...[
                const SizedBox(height: 20),
                _buildSectionLabel('🛡️  ADMIN MODULES'),
                const SizedBox(height: 12),
                _buildAdminGrid(context, ref, activeRole, user),
              ],
            ],
          ),
        ),
      ),
    ]);
  }

  // ── Profile Card ──────────────────────────────────────────────────────────
  Widget _buildProfileCard(WidgetRef ref) {
    final user = ref.watch(userProfileProvider);
    final initials = _getInitials(user?.name);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF140E28), Color(0xFF2A1A5E)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF140E28).withOpacity(0.3),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(children: [
        // Avatar
        Container(
          width: 52, height: 52,
          decoration: BoxDecoration(
            gradient: AppTheme.teacherTheme,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: AppTheme.teacherTheme.colors.first.withOpacity(0.4),
                blurRadius: 12, offset: const Offset(0, 4),
              ),
            ],
          ),
          alignment: Alignment.center,
          child: Text(initials,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
        ),
        const SizedBox(width: 14),
        // Info
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(user?.name ?? 'Staff Member',
              style: const TextStyle(fontFamily: 'Clash Display', fontSize: 17,
                  fontWeight: FontWeight.w700, color: Colors.white)),
          const SizedBox(height: 2),
          Text(user?.dept ?? 'EduSphere Staff',
              style: TextStyle(fontFamily: 'Satoshi', fontSize: 12,
                  fontWeight: FontWeight.w500, color: Colors.white.withOpacity(0.55))),
        ])),
        // Online badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: const Color(0xFF22C55E).withOpacity(0.18),
            borderRadius: BorderRadius.circular(100),
            border: Border.all(color: const Color(0xFF22C55E).withOpacity(0.35)),
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Container(width: 6, height: 6,
                decoration: const BoxDecoration(color: Color(0xFF22C55E), shape: BoxShape.circle)),
            const SizedBox(width: 5),
            const Text('Online',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF22C55E))),
          ]),
        ),
      ]),
    );
  }

  // ── Search Bar ────────────────────────────────────────────────────────────
  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      height: 50,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE8EAF0), width: 1.5),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 3)),
        ],
      ),
      child: Row(children: [
        const Icon(Icons.search_rounded, size: 20, color: Color(0xFF94A3B8)),
        const SizedBox(width: 12),
        Expanded(
          child: TextField(
            decoration: InputDecoration(
              hintText: 'Search menus, modules...',
              hintStyle: TextStyle(
                fontFamily: 'Satoshi', fontSize: 14,
                fontWeight: FontWeight.w500, color: Colors.grey.shade400,
              ),
              border: InputBorder.none, isDense: true,
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(8)),
          child: const Text('⌘K', style: TextStyle(fontFamily: 'Satoshi', fontSize: 10,
              fontWeight: FontWeight.w700, color: Color(0xFF94A3B8))),
        ),
      ]),
    );
  }

  // ── Section Label ─────────────────────────────────────────────────────────
  Widget _buildSectionLabel(String title) {
    return Text(title,
        style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11,
            fontWeight: FontWeight.w900, letterSpacing: 0.8, color: Color(0xFF94A3B8)));
  }

  // ── Quick Actions Grid (3-col) ────────────────────────────────────────────
  Widget _buildQuickActionsGrid(BuildContext context) {
    final items = [
      _QAItem('Attendance', Icons.calendar_today_rounded, const Color(0xFF10B981), '/attendance'),
      _QAItem('Homework', Icons.book_rounded, const Color(0xFFF59E0B), '/homework'),
      _QAItem('Leave', Icons.check_circle_outline_rounded, const Color(0xFFF97316), '/leave'),
      _QAItem('PTM', Icons.people_alt_rounded, const Color(0xFF7C3AED), '/ptm'),
      _QAItem('Timetable', Icons.calendar_month_rounded, const Color(0xFF3B82F6), '/timetable'),
      _QAItem('Diary', Icons.edit_note_rounded, const Color(0xFFEC4899), '/diary'),
    ];
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 3,
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 0.95,
      children: items.map((item) => _buildQACard(context, item)).toList(),
    );
  }

  Widget _buildQACard(BuildContext context, _QAItem item) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        _handleNavigation(context, item.route);
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFEEF0F6), width: 1.5),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 3)),
          ],
        ),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
            width: 46, height: 46,
            decoration: BoxDecoration(
              color: item.color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(item.icon, size: 22, color: item.color),
          ),
          const SizedBox(height: 8),
          Text(item.label,
              textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12,
                  fontWeight: FontWeight.w800, color: Color(0xFF140E28))),
        ]),
      ),
    );
  }

  // ── Teaching List ─────────────────────────────────────────────────────────
  Widget _buildTeachingCards(BuildContext context) {
    final items = [
      _TeachItem('My Timetable', 'View your weekly class schedule', Icons.calendar_month_rounded,
          const Color(0xFFF59E0B), '/schedule'),
      _TeachItem('Homework Tracker', '3 pending corrections · 2 overdue', Icons.book_outlined,
          const Color(0xFFFB923C), '/homework', badge: '3'),
      _TeachItem('PTM Scheduler', 'Manage parent-teacher meetings', Icons.people_alt_rounded,
          const Color(0xFF7C3AED), '/ptm'),
      _TeachItem('Tests & Quizzes', 'Next test: Fri 14 Mar', Icons.assignment_rounded,
          const Color(0xFF8B5CF6), ''),
      _TeachItem('Class Diary', 'Today\'s notes & observations', Icons.edit_note_rounded,
          const Color(0xFFEC4899), '/diary'),
      _TeachItem('Leave Requests', 'Manage your leave applications', Icons.check_circle_outline_rounded,
          const Color(0xFFF97316), '/leave'),
      _TeachItem('School Calendar', 'Holidays, events & school timings', Icons.calendar_month_rounded,
          const Color(0xFF0EA5E9), '/calendar'),
      _TeachItem('Library', 'Track issued books & overdue alerts', Icons.local_library_rounded,
          const Color(0xFF4F46E5), '/library'),
    ];

    return Column(
      children: items.map((item) => _buildTeachCard(context, item)).toList(),
    );
  }

  Widget _buildTeachCard(BuildContext context, _TeachItem item) {
    return GestureDetector(
      onTap: () {
        if (item.route.isNotEmpty) {
          HapticFeedback.selectionClick();
          _handleNavigation(context, item.route);
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFEEF0F6), width: 1.5),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 3)),
          ],
        ),
        child: Row(children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
              color: item.color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(13),
            ),
            child: Icon(item.icon, size: 22, color: item.color),
          ),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(item.title,
                style: const TextStyle(fontFamily: 'Satoshi', fontSize: 14,
                    fontWeight: FontWeight.w800, color: Color(0xFF140E28))),
            const SizedBox(height: 2),
            Text(item.subtitle,
                style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11,
                    fontWeight: FontWeight.w500, color: Color(0xFF94A3B8))),
          ])),
          if (item.badge != null)
            Container(
              padding: const EdgeInsets.all(6),
              margin: const EdgeInsets.only(right: 6),
              decoration: const BoxDecoration(color: Color(0xFFF43F5E), shape: BoxShape.circle),
              child: Text(item.badge!,
                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
            ),
          Icon(Icons.chevron_right_rounded, size: 20,
              color: item.route.isNotEmpty ? const Color(0xFFCBD5E1) : Colors.transparent),
        ]),
      ),
    );
  }

  // ── Admin Grid ────────────────────────────────────────────────────────────
  Widget _buildAdminGrid(BuildContext context, WidgetRef ref, String activeRole, UserProfile? user) {
    final modules = ModuleRegistry.allModules
        .where((m) => _canAccessModule(m, user, activeRole))
        .toList();
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3, crossAxisSpacing: 10, mainAxisSpacing: 10, childAspectRatio: 0.9,
      ),
      itemCount: modules.length,
      itemBuilder: (context, i) => _buildAdminCard(context, modules[i]),
    );
  }

  Widget _buildAdminCard(BuildContext context, ModuleItem module) {
    return GestureDetector(
      onTap: () {
        if (module.route.isNotEmpty) _handleNavigation(context, module.route);
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFEEF0F6), width: 1.5),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 3)),
          ],
        ),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
              color: module.color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(module.icon, size: 22, color: module.color),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: Text(module.label,
                textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10,
                    fontWeight: FontWeight.w800, color: Color(0xFF140E28), height: 1.2)),
          ),
        ]),
      ),
    );
  }



  // ── Navigation ────────────────────────────────────────────────────────────
  void _handleNavigation(BuildContext context, String route) {
    Navigator.pop(context);
    Widget? targetView;
    switch (route) {
      case '/profile': targetView = const TeacherProfileView(); break;
      case '/attendance': targetView = const TeacherAttendanceView(); break;
      case '/homework': targetView = TeacherHomeworkView(); break;
      case '/schedule': case '/timetable': targetView = TeacherScheduleView(); break;
      case '/leave': targetView = TeacherLeaveView(); break;
      case '/self-attendance': targetView = const StaffSelfAttendanceView(); break;
      case '/diary': targetView = TeacherDiaryView(); break;
      case '/ptm': targetView = const StaffPTMView(); break;
      case '/circular': targetView = const CircularListView(); break;
      case '/calendar': targetView = const TeacherCalendarView(); break;
      case '/library': targetView = const StaffLibraryView(); break;
      default: context.push(route); return;
    }
    if (targetView != null) showModulePopup(context, targetView);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  String _getInitials(String? name) {
    if (name == null || name.isEmpty) return 'U';
    final parts = name.split(' ').where((e) => e.isNotEmpty);
    if (parts.isEmpty) return 'U';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  bool _canAccessModule(ModuleItem m, UserProfile? user, String activeRole) {
    if (user == null) return false;
    final role = activeRole.toUpperCase();
    if (role == 'ADMIN' || role == 'SUPER_ADMIN') return true;
    if (user.permissions.isEmpty) {
      if (role == 'TEACHER' || role == 'STAFF') {
        const teacherModules = ['dashboard', 'attendance', 'self_attendance', 'homework',
            'schedule', 'communication', 'leave', 'diary', 'calendar', 'library'];
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
}

// ─── Data models ─────────────────────────────────────────────────────────────
class _QAItem {
  final String label, route;
  final IconData icon;
  final Color color;
  const _QAItem(this.label, this.icon, this.color, this.route);
}

class _TeachItem {
  final String title, subtitle, route;
  final IconData icon;
  final Color color;
  final String? badge;
  const _TeachItem(this.title, this.subtitle, this.icon, this.color, this.route, {this.badge});
}

// ─── Helper ───────────────────────────────────────────────────────────────────
Future<void> showAllModulesMenu(BuildContext context) async {
  dashboardBlurNotifier.value = true;          // blur dashboard instantly
  await showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useRootNavigator: true,
    useSafeArea: false,
    backgroundColor: Colors.transparent,
    barrierColor: Colors.black.withOpacity(0.4),
    sheetAnimationStyle: AnimationStyle(
      duration: const Duration(milliseconds: 800),
      reverseDuration: const Duration(milliseconds: 500),
      curve: Curves.easeInCubic,
    ),
    builder: (context) => DraggableScrollableSheet(
      initialChildSize: 1.0,
      maxChildSize: 1.0,
      minChildSize: 0.6,
      snap: true,
      snapSizes: const [0.6, 1.0],
      builder: (_, controller) => ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        child: AllModulesOverlay(scrollController: controller),
      ),
    ),
  );
  dashboardBlurNotifier.value = false;         // unblur when menu closes
}
