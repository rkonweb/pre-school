import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/school_brand_provider.dart';
import '../../core/routing/rbac.dart';
import '../../features/auth/auth_service.dart';
import 'package:bodhi_staff_app/core/routing/navigation_tab_model.dart';

/// Branded side navigation drawer.
/// Shown when the hamburger menu icon is tapped.
class AppDrawer extends ConsumerWidget {
  const AppDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brand = ref.watch(schoolBrandProvider);
    final rbac = ref.watch(rbacProvider);

    return Drawer(
      width: MediaQuery.of(context).size.width * 0.78,
      backgroundColor: Colors.white,
      child: Column(
        children: [
          // ── Branded Header ──
          Container(
            width: double.infinity,
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 24,
              left: 24,
              right: 24,
              bottom: 24,
            ),
            decoration: BoxDecoration(
              color: brand.primaryColor,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(28),
                bottomRight: Radius.circular(28),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Column(
                    children: [
                      // Staff Photo or Initials
                      CircleAvatar(
                        radius: 36,
                        backgroundColor: brand.secondaryColor.withOpacity(0.15),
                        child: ClipOval(
                          child: brand.fullStaffPhotoUrl != null
                              ? Image.network(
                                  brand.fullStaffPhotoUrl!,
                                  width: 72,
                                  height: 72,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) =>
                                      Center(
                                    child: Text(
                                      brand.staffInitials,
                                      style: TextStyle(
                                          color: brand.secondaryColor,
                                          fontSize: 24,
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                )
                              : Center(
                                  child: Text(
                                    brand.staffInitials,
                                    style: TextStyle(
                                        color: brand.secondaryColor,
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        brand.staffName.isNotEmpty
                            ? brand.staffName
                            : 'Staff Member',
                        style: TextStyle(
                          color: brand.secondaryColor,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Navigation Items ──
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                _sectionHeader(context, 'MAIN'),
                _navItem(context, icon: Icons.dashboard_rounded, label: 'Dashboard', route: '/home', brand: brand),
                _navItem(context, icon: Icons.calendar_today_rounded, label: 'Today\'s Schedule', route: '/today', brand: brand),
                _navItem(context, icon: Icons.inbox_rounded, label: 'Inbox', route: '/inbox', brand: brand),

                if (rbac.hasPermission('timetable.view')) ...[
                  _sectionHeader(context, 'ACADEMIC'),
                  _navItem(context, icon: Icons.schedule_rounded, label: 'My Timetable', route: '/timetable', brand: brand),
                ],

                if (rbac.hasPermission('attendance.mark')) ...[
                  if (!rbac.hasPermission('timetable.view')) _sectionHeader(context, 'ACADEMIC'),
                  _navItem(context, icon: Icons.how_to_reg_rounded, label: 'Attendance', route: '/attendance', brand: brand),
                ],

                if (rbac.hasPermission('diary.create'))
                  _navItem(context, icon: Icons.edit_calendar_rounded, label: 'Diary', route: '/diary', brand: brand),

                if (rbac.hasPermission('progress.view'))
                  _navItem(context, icon: Icons.analytics_rounded, label: 'Progress Reports', route: '/progress', brand: brand),

                if (rbac.hasPermission('development.view')) ...[
                  _sectionHeader(context, 'STUDENT CARE'),
                  _navItem(context, icon: Icons.psychology_rounded, label: 'Development', route: '/development', brand: brand),
                ],

                if (rbac.hasPermission('health.view')) ...[
                  if (!rbac.hasPermission('development.view')) _sectionHeader(context, 'STUDENT CARE'),
                  _navItem(context, icon: Icons.medical_services_rounded, label: 'Health', route: '/health', brand: brand),
                ],

                if (rbac.hasPermission('transport.route.start')) ...[
                  _sectionHeader(context, 'TRANSPORT'),
                  _navItem(context, icon: Icons.directions_bus_rounded, label: 'My Route', route: '/transport', brand: brand),
                ],

                if (rbac.hasPermission('communication.view')) ...[
                  _sectionHeader(context, 'COMMUNICATION'),
                  _navItem(context, icon: Icons.forum_rounded, label: 'Announcements', route: '/communication', brand: brand),
                ],

                if (rbac.hasPermission('chat.view'))
                  _navItem(context, icon: Icons.chat_bubble_rounded, label: 'Chat', route: '/chat', brand: brand),

                if (rbac.hasPermission('approvals.view')) ...[
                  _sectionHeader(context, 'MANAGEMENT'),
                  _navItem(context, icon: Icons.fact_check_rounded, label: 'Approvals', route: '/approvals', brand: brand),
                ],

                const Divider(height: 32, indent: 24, endIndent: 24),

                _navItem(context, icon: Icons.person_rounded, label: 'My Profile', route: '/profile', brand: brand),
              ],
            ),
          ),

          // ── Logout Footer ──
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
            child: ListTile(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              tileColor: Colors.red.shade50,
              leading: const Icon(Icons.logout_rounded, color: Colors.red),
              title: const Text('Logout', style: TextStyle(color: Colors.red, fontWeight: FontWeight.w600)),
              onTap: () async {
                Navigator.of(context).pop(); // close drawer
                final authService = ProviderScope.containerOf(context).read(authServiceProvider);
                await authService.logout();
                if (context.mounted) context.go('/login');
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 24, right: 16, top: 16, bottom: 4),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.5,
          color: Colors.grey.shade400,
        ),
      ),
    );
  }

  Widget _navItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String route,
    required SchoolBrandState brand,
  }) {
    final currentLocation = GoRouterState.of(context).uri.path;
    final isActive = currentLocation == route || currentLocation.startsWith('$route/');

    final tile = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        tileColor: isActive ? brand.primaryColor.withOpacity(0.15) : Colors.transparent,
        leading: Icon(
          icon,
          color: isActive ? brand.primaryColor : Colors.grey.shade600,
          size: 22,
        ),
        title: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
            color: isActive ? brand.primaryColor : AppTheme.textPrimary,
          ),
        ),
        onTap: () {
          Navigator.of(context).pop(); // close drawer first
          context.go(route);
        },
      ),
    );

    return LongPressDraggable<NavigationTabModel>(
      data: NavigationTabModel(
        label: label,
        icon: icon,
        route: route,
      ),
      onDragStarted: () {
        if (Navigator.canPop(context)) {
          Navigator.of(context).pop();
        }
      },
      feedback: Material(
        color: Colors.transparent,
        child: Opacity(
          opacity: 0.9,
          child: Container(
            width: MediaQuery.of(context).size.width * 0.7,
            decoration: BoxDecoration(
              color: brand.primaryColor.withOpacity(0.95),
              borderRadius: BorderRadius.circular(12),
              boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 10, offset: Offset(0, 4))],
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Icon(icon, color: Colors.white, size: 24),
                const SizedBox(width: 16),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      childWhenDragging: Opacity(
        opacity: 0.3,
        child: tile,
      ),
      child: tile,
    );
  }

  Widget _buildLogoWidget(SchoolBrandState brand, {double size = 64}) {
    final logoUrl = brand.schoolLogoUrl ?? '';
    if (logoUrl.isEmpty) {
      return Icon(Icons.school_rounded, color: brand.secondaryColor, size: size);
    }
    if (logoUrl.startsWith('data:')) {
      try {
        final commaIdx = logoUrl.indexOf(',');
        if (commaIdx == -1) return Icon(Icons.school_rounded, color: brand.secondaryColor, size: size);
        final Uint8List bytes = base64Decode(logoUrl.substring(commaIdx + 1));
        return SizedBox(
          width: size, height: size,
          child: Image.memory(bytes, fit: BoxFit.contain,
            errorBuilder: (_, __, ___) => Icon(Icons.school_rounded, color: brand.secondaryColor, size: size)),
        );
      } catch (_) {
        return Icon(Icons.school_rounded, color: brand.secondaryColor, size: size);
      }
    }
    return SizedBox(
      width: size, height: size,
      child: Image.network(logoUrl, fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => Icon(Icons.school_rounded, color: brand.secondaryColor, size: size)),
    );
  }
}
