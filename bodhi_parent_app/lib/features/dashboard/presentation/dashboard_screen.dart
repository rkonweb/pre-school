import 'dart:ui';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/routing/rbac.dart';
import '../../../ui/components/today_timeline_card.dart';
import '../../../ui/components/quick_action_tile.dart';
import '../../auth/auth_service.dart';
import 'package:go_router/go_router.dart';
import '../data/dashboard_provider.dart';
import 'widgets/ai_summary_card.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    final rbac = ref.watch(rbacProvider);
    final brand = ref.watch(schoolBrandProvider);
    final dashboardAsync = ref.watch(dashboardDataProvider);

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: _buildDrawer(context, brand),
      body: Stack(
        children: [
          // ───── Graphical Background ─────
          Positioned.fill(child: _buildStunningBackground(brand)),

          // ───── Scrollable Content ─────
          Positioned.fill(
            child: RefreshIndicator(
              onRefresh: () => ref.read(dashboardDataProvider.notifier).refresh(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.only(
                  top: 190,
                  left: 24,
                  right: 24,
                  bottom: 24,
                ),
                  child: dashboardAsync.when(
                    data: (data) {
                      // ───── Performance: Prefetch Student Avatars ─────
                      if (data['students'] != null) {
                        for (var student in (data['students'] as List)) {
                          final avatarUrl = student['avatar']?.toString();
                          if (avatarUrl != null && avatarUrl.isNotEmpty) {
                            precacheImage(NetworkImage(avatarUrl), context);
                          }
                        }
                      }
                      return _buildContent(context, data, rbac);
                    },
                    loading: () => _buildSkeletonLoader(),
                    error: (error, stack) => Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline, color: Colors.red, size: 48),
                          const SizedBox(height: 16),
                          Text('Oops! Something went wrong', 
                              style: Theme.of(context).textTheme.titleMedium),
                          const SizedBox(height: 8),
                          Text(error.toString(), 
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: Colors.grey, fontSize: 12)),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: () => ref.read(dashboardDataProvider.notifier).refresh(),
                            icon: const Icon(Icons.refresh),
                            label: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  ),
              ),
            ),
          ),

          // ───── Sticky Header ─────
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 180,
            child: Container(
              decoration: BoxDecoration(
                color: brand.primaryColor,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(40),
                  bottomRight: Radius.circular(40),
                ),
                boxShadow: [
                  BoxShadow(
                    color: brand.primaryColor.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  )
                ],
              ),
              padding: const EdgeInsets.only(top: 48, left: 24, right: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        onPressed: () => _scaffoldKey.currentState?.openDrawer(),
                        icon: Icon(Icons.menu, color: brand.secondaryColor),
                      ),
                      Expanded(
                        child: Center(
                          child: dashboardAsync.when(
                            data: (data) => _buildHeaderStudentAvatar(data),
                            loading: () => const CircleAvatar(backgroundColor: Colors.white24, radius: 30),
                            error: (_, __) => const SizedBox(),
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () {},
                        icon: Icon(Icons.notifications_none, color: brand.secondaryColor),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context, Map<String, dynamic> data, RBACState rbac) {
    if (data['students'] == null || (data['students'] as List).isEmpty) {
      return const Center(child: Text("No active students found"));
    }
    
    final activeStudent = (data['students'] as List).firstWhere(
      (s) => s['id'] == data['activeStudentId'],
      orElse: () => data['students'][0],
    );

    final timeline = data['timelineSnippet'] as List? ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Greeting & Student Selector Placeholder
        _buildGreetingSection(activeStudent),
        const SizedBox(height: 16),
        
        // AI Daily Summary
        AISummaryCard(
          studentId: activeStudent['id']?.toString() ?? '',
          schoolSlug: (data['school']?['slug'] ?? 'school').toString(),
        ),
        
        const SizedBox(height: 24),

        // Quick Action Grid
        _buildQuickActionGrid(context, rbac),
        const SizedBox(height: 24),

        // Activities Timeline
        Text("Today's Top Events",
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 16),
        if (timeline.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
            decoration: BoxDecoration(
              color: Colors.grey.withOpacity(0.05),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.grey.withOpacity(0.1)),
            ),
            child: Column(
              children: [
                Icon(Icons.auto_awesome_motion_outlined, 
                    color: Colors.grey.withOpacity(0.3), size: 48),
                const SizedBox(height: 16),
                Text(
                  'Your child\'s daily story will appear here as the day unfolds.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey.shade600,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          )
        else
          TodayTimelineCard(
            events: timeline.map((act) => TimelineEvent(
              time: act['time']?.toString() ?? '',
              title: act['title']?.toString() ?? '',
              subtitle: act['type']?.toString(),
              isActive: act['status'] == 'COMPLETED',
            )).toList(),
            primaryButtonText: 'View Timeline',
            onPrimaryAction: () {
              context.push('/today');
            },
          ),
        const SizedBox(height: 48),
      ],
    );
  }

  Widget _buildSkeletonLoader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(width: 200, height: 30, color: Colors.grey.withOpacity(0.2)),
        const SizedBox(height: 8),
        Container(width: 150, height: 20, color: Colors.grey.withOpacity(0.2)),
        const SizedBox(height: 24),
        GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.1,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          children: List.generate(4, (index) => Container(
            decoration: BoxDecoration(
              color: Colors.grey.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16)
            ),
          )),
        ),
      ],
    );
  }

  Widget _buildDrawer(BuildContext context, SchoolBrandState brand) {
    final rbac = ref.watch(rbacProvider);
    
    return Drawer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(color: brand.primaryColor),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (brand.schoolLogoUrl != null && brand.schoolLogoUrl!.isNotEmpty)
                  Container(
                    width: 72,
                    height: 72,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                    ),
                    padding: const EdgeInsets.all(4),
                    child: ClipOval(
                      child: brand.schoolLogoUrl!.startsWith('data:image')
                          ? Image.memory(
                              base64Decode(brand.schoolLogoUrl!.split(',').last),
                              fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) => Icon(Icons.school, color: brand.primaryColor, size: 36),
                            )
                          : Image.network(
                              brand.schoolLogoUrl!,
                              fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) => Icon(Icons.school, color: brand.primaryColor, size: 36),
                            ),
                    ),
                  )
                else
                  CircleAvatar(
                    backgroundColor: Colors.white,
                    radius: 36,
                    child: Icon(Icons.school, color: brand.primaryColor, size: 36),
                  ),
                const SizedBox(height: 16),
                Text(
                  brand.schoolName,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                ListTile(
                  leading: Icon(Icons.dashboard_outlined, color: brand.primaryColor),
                  title: const Text('Dashboard'),
                  onTap: () => Navigator.pop(context),
                ),
                
                if (rbac.hasPermission('attendance.view'))
                  ListTile(
                    leading: Icon(Icons.how_to_reg_outlined, color: brand.primaryColor),
                    title: const Text('Attendance'),
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/attendance');
                    },
                  ),
                  
                if (rbac.hasPermission('dashboard.view')) // Today's Story
                  ListTile(
                    leading: Icon(Icons.auto_awesome_motion_outlined, color: brand.primaryColor),
                    title: const Text('Today\'s Story'),
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/today');
                    },
                  ),
                  
                if (rbac.hasPermission('fees.view'))
                  ListTile(
                    leading: Icon(Icons.account_balance_wallet_outlined, color: brand.primaryColor),
                    title: const Text('Fees & Finance'),
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/finance');
                    },
                  ),
                  
                if (rbac.hasPermission('transport.view'))
                  ListTile(
                    leading: Icon(Icons.directions_bus_outlined, color: brand.primaryColor),
                    title: const Text('Bus Tracking'),
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/transport');
                    },
                  ),
                  
                if (rbac.hasPermission('messages.view'))
                  ListTile(
                    leading: Icon(Icons.forum_outlined, color: brand.primaryColor),
                    title: const Text('Messages'),
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/messages');
                    },
                  ),

                const Divider(),
                
                ListTile(
                  leading: Icon(Icons.person_outline, color: brand.primaryColor),
                  title: const Text('My Profile'),
                  onTap: () {
                    Scaffold.of(context).closeDrawer();
                  },
                ),
                ListTile(
                  leading: Icon(Icons.settings_outlined, color: brand.primaryColor),
                  title: const Text('Settings'),
                  onTap: () {
                    Scaffold.of(context).closeDrawer();
                  },
                ),
              ],
            ),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Sign Out', style: TextStyle(color: Colors.red)),
            onTap: () async {
              Navigator.pop(context);
              try {
                await ref.read(authServiceProvider).logout();
                if (context.mounted) {
                  context.go('/login');
                }
              } catch (e) {
                // Ignore
              }
            },
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildGreetingSection(Map<String, dynamic> student) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Hello, ${student['firstName'] ?? 'Parent'}',
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A),
                ),
              ),
              Row(
                children: [
                  Icon(
                    student['safetyStatus'] == 'IN_SCHOOL' 
                      ? Icons.check_circle 
                      : Icons.info_outline, 
                    color: student['safetyStatus'] == 'IN_SCHOOL' ? Colors.green : Colors.orange, 
                    size: 16
                  ),
                  const SizedBox(width: 4),
                  Text(
                    student['safetyStatus'] == 'IN_SCHOOL' 
                      ? '${student['firstName']} is safely in school'
                      : '${student['firstName']} is currently ${student['safetyStatus'].toString().toLowerCase().replaceAll('_', ' ')}',
                    style: TextStyle(
                      fontSize: 14,
                      color: student['safetyStatus'] == 'IN_SCHOOL' ? Colors.green.shade700 : Colors.orange.shade700,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHeaderStudentAvatar(Map<String, dynamic> data) {
    final activeStudent = (data['students'] as List).firstWhere(
      (s) => s['id'] == data['activeStudentId'],
      orElse: () => data['students'][0],
    );
    final avatarUrl = activeStudent['avatar'] as String?;

    if (avatarUrl != null && avatarUrl.isNotEmpty) {
      return Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 3),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipOval(
          child: avatarUrl.toLowerCase().contains('svg')
              ? SvgPicture.network(
                  avatarUrl,
                  fit: BoxFit.cover,
                )
              : Image.network(
                  avatarUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) =>
                      Container(
                        color: Colors.white,
                        child: const Icon(Icons.person, color: Colors.indigo, size: 30),
                      ),
                ),
        ),
      );
    } else {
      return Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white,
          border: Border.all(color: Colors.white, width: 3),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const Icon(Icons.person, color: Colors.indigo, size: 30),
      );
    }
  }

  Widget _buildQuickActionGrid(BuildContext context, RBACState rbac) {
    List<Widget> tiles = [];

    if (rbac.hasPermission('attendance.view')) {
      tiles.add(QuickActionTile(
        label: 'Attendance',
        icon: Icons.how_to_reg,
        color: const Color(0xFF90DBE4),
        onTap: () {},
      ));
    }

    if (rbac.hasPermission('academics.view')) {
      tiles.add(QuickActionTile(
        label: 'Academics',
        icon: Icons.calendar_today_rounded,
        color: const Color(0xFFFFD166),
        onTap: () {},
      ));
    }

    if (rbac.hasPermission('fees.view')) {
      tiles.add(QuickActionTile(
        label: 'Fees',
        icon: Icons.account_balance_wallet_rounded,
        color: const Color(0xFFFFB5A7),
        onTap: () {
          context.push('/finance');
        },
      ));
    }

    if (rbac.hasPermission('transport.view')) {
      tiles.add(QuickActionTile(
        label: 'Bus',
        icon: Icons.directions_bus_rounded,
        color: const Color(0xFFFDE68A),
        onTap: () {
          context.push('/transport');
        },
      ));
    }

    if (rbac.hasPermission('media.view')) {
      tiles.add(QuickActionTile(
        label: 'Media',
        icon: Icons.photo_library_rounded,
        color: const Color(0xFFCDB4DB),
        onTap: () {},
      ));
    }

    if (rbac.hasPermission('messages.view')) {
      tiles.add(QuickActionTile(
        label: 'Messages',
        icon: Icons.forum_rounded,
        color: const Color(0xFFB9FBC0),
        onTap: () {
          context.push('/messages');
        },
      ));
    }

    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.1,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: tiles,
    );
  }

  Widget _buildStunningBackground(SchoolBrandState brand) {
    return Stack(
      children: [
        Positioned(
          top: 100,
          left: -50,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: brand.primaryColor.withOpacity(0.1),
            ),
          ),
        ),
        Positioned(
          top: 400,
          right: -100,
          child: Container(
            width: 350,
            height: 350,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFF90DBE4).withOpacity(0.1),
            ),
          ),
        ),
        Positioned.fill(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
            child: Container(color: Colors.transparent),
          ),
        ),
      ],
    );
  }
}


