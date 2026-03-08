import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/school_brand_provider.dart';
import '../../core/routing/rbac.dart';
import '../../features/auth/auth_service.dart';
import '../../features/dashboard/data/dashboard_provider.dart';

class AppDrawer extends ConsumerStatefulWidget {
  const AppDrawer({Key? key}) : super(key: key);

  @override
  ConsumerState<AppDrawer> createState() => _AppDrawerState();
}

class _AppDrawerState extends ConsumerState<AppDrawer> {
  Map<String, dynamic>? _lastKnownData;

  // GlobalKeys to absolutely guarantee expansion state preservation
  final _academicsKey = GlobalKey();
  final _communicationKey = GlobalKey();
  final _schoolLifeKey = GlobalKey();
  final _manageKey = GlobalKey();
  final _accountKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    final brand = ref.watch(schoolBrandProvider);
    final rbac = ref.watch(rbacProvider);
    final dashboardAsync = ref.watch(dashboardDataProvider);

    if (dashboardAsync.hasValue && dashboardAsync.value != null) {
      _lastKnownData = dashboardAsync.value;
    }

    final dataToRender = _lastKnownData ?? dashboardAsync.valueOrNull;

    return Drawer(
      backgroundColor: AppTheme.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(right: Radius.circular(24)),
      ),
      child: dataToRender != null
          ? _buildDrawerContent(context, ref, dataToRender, rbac)
          : const Center(child: CircularProgressIndicator()),
    );
  }

  Widget _buildDrawerContent(BuildContext context, WidgetRef ref, Map<String, dynamic> data, RBACState rbac) {
    final students = data['students'] as List? ?? [];
    final activeStudentId = data['activeStudentId'];
    final activeStudent = students.firstWhere(
      (s) => s['id'] == activeStudentId,
      orElse: () => students.isNotEmpty ? students[0] : {},
    );
    
    final parentDetails = data['parentDetails'] as Map<String, dynamic>?;
    final parentName = parentDetails?['name'] ?? 'Parent';
    final parentInitials = parentDetails?['initials'] ?? 'P';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // ── sm-hd: Gradient Header ──
        Container(
          padding: const EdgeInsets.fromLTRB(20, 60, 20, 20),
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF1A2A6C),
                Color(0xFF2350DD),
                Color(0xFF00C9A7),
              ],
            ),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 23,
                    backgroundColor: Colors.white.withOpacity(0.22),
                    child: Text(
                      parentInitials, 
                      style: GoogleFonts.sora(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        parentName,
                        style: GoogleFonts.sora(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Parent • EduConnect',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.65),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.18),
                  border: Border.all(color: Colors.white.withOpacity(0.15)),
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Row(
                  children: [
                    _buildStudentAvatar(activeStudent),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        activeStudent['name'] ?? 'Student',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    Row(
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: Color(0xFF00E5C0),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'In School',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.65),
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(vertical: 8),
            children: [
              _buildExpansionSection(
                context: context,
                key: _academicsKey,
                label: 'ACADEMICS',
                icon: Icons.school_outlined,
                items: [
                  _buildDrawerItem(
                    icon: Icons.menu_book_rounded,
                    title: 'Diary & Homework',
                    subtitle: '3 tasks pending today',
                    color: const Color(0xFF3B6EF8),
                    backgroundColor: const Color(0xFFEEF3FF),
                    badge: '3 Due',
                    badgeColor: const Color(0xFFFF6B3D),
                    onTap: () {
                      context.pop();
                      context.push('/diary');
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.calendar_month_rounded,
                    title: 'Timetable',
                    subtitle: 'View class schedule',
                    color: const Color(0xFF00C9A7),
                    backgroundColor: const Color(0xFFF0FDF9),
                    onTap: () {
                      context.pop();
                      context.push('/timetable');
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.analytics_outlined,
                    title: 'Progress & Reports',
                    subtitle: 'Q3 report card available',
                    color: const Color(0xFF00C9A7),
                    backgroundColor: const Color(0xFFF0FDF9),
                    badge: 'New',
                    badgeColor: const Color(0xFF00C9A7),
                    onTap: () {},
                  ),
                ],
              ),
              
              if (rbac.hasPermission('messages.view'))
                _buildExpansionSection(
                  context: context,
                  key: _communicationKey,
                  label: 'COMMUNICATION',
                  icon: Icons.forum_outlined,
                  items: [
                    _buildDrawerItem(
                      icon: Icons.forum_rounded,
                      title: 'Messages',
                      subtitle: 'Direct chat with teachers',
                      color: const Color(0xFF8B5CF6),
                      backgroundColor: const Color(0xFFF5F0FF),
                      badge: '2 New',
                      badgeColor: const Color(0xFF3B6EF8),
                      onTap: () {
                        context.pop();
                        context.push('/messages');
                      },
                    ),
                    _buildDrawerItem(
                      icon: Icons.campaign_rounded,
                      title: 'Notifications',
                      subtitle: 'Latest circulars & alerts',
                      color: const Color(0xFFEF4444),
                      backgroundColor: const Color(0xFFfee2e2),
                      onTap: () {
                        context.pop();
                        context.push('/notifications');
                      },
                    ),
                  ],
                ),

              _buildExpansionSection(
                context: context,
                key: _schoolLifeKey,
                label: 'SCHOOL LIFE',
                icon: Icons.auto_awesome_outlined,
                items: [
                  _buildDrawerItem(
                    icon: Icons.how_to_reg_rounded,
                    title: 'Attendance & Leave',
                    subtitle: '94% this month • Excellent',
                    color: const Color(0xFFFF6B3D),
                    backgroundColor: const Color(0xFFFFF5EE),
                    onTap: () {
                      context.pop();
                      context.push('/attendance');
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.directions_bus_rounded,
                    title: 'Transport',
                    subtitle: 'Bus #7 • ETA 3:50 PM',
                    color: const Color(0xFF00C9A7),
                    backgroundColor: const Color(0xFFF0FDF9),
                    badge: '● Live',
                    badgeColor: const Color(0xFF00C9A7),
                    onTap: () {
                      context.pop();
                      context.push('/transport');
                    },
                  ),
                ],
              ),

              _buildExpansionSection(
                context: context,
                key: _manageKey,
                label: 'MANAGE',
                icon: Icons.wallet_outlined,
                items: [
                  _buildDrawerItem(
                    icon: Icons.account_balance_wallet_rounded,
                    title: 'Fees & Payments',
                    subtitle: '₹8,200 due • Nov 25',
                    color: const Color(0xFFFF6B3D),
                    backgroundColor: const Color(0xFFFFF5EE),
                    badge: 'Due',
                    badgeColor: const Color(0xFFFF6B3D),
                    onTap: () {
                      context.pop();
                      context.push('/finance');
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.fastfood_rounded,
                    title: 'Canteen & Store',
                    subtitle: 'Balance: ₹180 • Top up',
                    color: const Color(0xFF3B6EF8),
                    backgroundColor: const Color(0xFFEEF3FF),
                    onTap: () {
                      context.pop();
                      context.go('/canteen');
                    },
                  ),
                ],
              ),

              _buildExpansionSection(
                context: context,
                key: _accountKey,
                label: 'ACCOUNT',
                icon: Icons.person_outline_rounded,
                items: [
                  _buildDrawerItem(
                    icon: Icons.person_rounded,
                    title: 'Student Profile',
                    subtitle: 'View student details',
                    color: const Color(0xFF3B6EF8),
                    backgroundColor: const Color(0xFFEEF3FF),
                    onTap: () {
                      context.pop();
                      context.push('/profile');
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.settings_rounded,
                    title: 'Settings',
                    subtitle: 'Notifications & Preferences',
                    color: Colors.grey,
                    backgroundColor: Colors.grey.withOpacity(0.1),
                    onTap: () {},
                  ),
                ],
              ),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(border: Border(top: BorderSide(color: Colors.black.withOpacity(0.05)))),
          child: Row(
            children: [
              CircleAvatar(
                radius: 17,
                backgroundColor: const Color(0xFF3B6EF8),
                child: Text(parentInitials, style: GoogleFonts.sora(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(parentName, style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary)),
                    GestureDetector(onTap: () {}, child: const Text('Edit Profile', style: TextStyle(color: Color(0xFF3B6EF8), fontWeight: FontWeight.bold, fontSize: 11))),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.logout_rounded, color: Color(0xFFFF6B3D), size: 18),
                onPressed: () async {
                  Navigator.pop(context);
                  try {
                    await ref.read(authServiceProvider).logout();
                    if (context.mounted) context.go('/login');
                  } catch (e) {}
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildExpansionSection({
    Key? key,
    required BuildContext context,
    required String label,
    required IconData icon,
    required List<Widget> items,
  }) {
    return ExpansionTile(
      key: key,
      tilePadding: const EdgeInsets.symmetric(horizontal: 20),
      leading: Icon(icon, color: AppTheme.textTertiary, size: 20),
      title: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: AppTheme.textTertiary,
          letterSpacing: 0.8,
        ),
      ),
      iconColor: AppTheme.textTertiary,
      collapsedIconColor: AppTheme.textTertiary.withOpacity(0.5),
      children: items,
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required Color backgroundColor,
    String? badge,
    Color? badgeColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(color: backgroundColor, borderRadius: BorderRadius.circular(11)),
              child: Icon(icon, color: color, size: 17),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary)),
                  const SizedBox(height: 1),
                  Text(subtitle, style: TextStyle(fontSize: 10, color: AppTheme.textTertiary)),
                ],
              ),
            ),
            if (badge != null)
              Container(
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: badgeColor?.withOpacity(0.12), borderRadius: BorderRadius.circular(100)),
                child: Text(badge, style: GoogleFonts.dmSans(fontSize: 9, fontWeight: FontWeight.bold, color: badgeColor)),
              ),
            Icon(Icons.chevron_right_rounded, color: AppTheme.textTertiary, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildStudentAvatar(Map<String, dynamic> student) {
    final avatarPath = student['avatar']?.toString();
    final url = _getFinalUrl(avatarPath);
    
    if (url.isEmpty) {
      return const CircleAvatar(
        radius: 12,
        backgroundColor: Colors.white24,
        child: Icon(Icons.person, size: 14, color: Colors.white),
      );
    }

    return Container(
      width: 24,
      height: 24,
      decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white),
      padding: const EdgeInsets.all(1.5),
      child: ClipOval(
        child: url.toLowerCase().contains('svg')
            ? SvgPicture.network(url, fit: BoxFit.cover)
            : Image.network(
                url,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const Icon(Icons.person, size: 14),
              ),
      ),
    );
  }

  String _getFinalUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('data:')) return path;
    const String host = 'http://localhost:3000';
    return path.startsWith('/') ? '$host$path' : '$host/$path';
  }
}
