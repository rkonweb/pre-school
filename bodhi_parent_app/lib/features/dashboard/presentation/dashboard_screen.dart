import 'dart:typed_data';
import 'dart:ui';
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
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
      extendBodyBehindAppBar: true,
      backgroundColor: AppTheme.backgroundColor,
      drawer: _buildDrawer(context, brand, dashboardAsync, rbac),
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
                  top: 180,
                  left: 20,
                  right: 20,
                  bottom: 40,
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

    final String sFirstName = activeStudent['firstName']?.toString() ?? 'Student';
    final String sStatus = activeStudent['safetyStatus']?.toString() ?? 'AT_HOME';
    final String? sTimeStr = activeStudent['safetyStatusTime']?.toString();
    
    String statusText = '✓ $sFirstName is at home';
    Color statusColor = const Color(0xFF00E5C0);
    
    if (sStatus == 'IN_SCHOOL') {
      statusText = '✓ $sFirstName is safely in school';
      statusColor = const Color(0xFF00E5C0);
    } else if (sStatus == 'IN_TRANSIT') {
      statusText = '🚌 $sFirstName is on the bus';
      statusColor = const Color(0xFFF5A623);
    } else if (sStatus == 'AT_HOME') {
      statusText = '🏠 $sFirstName is at home';
      statusColor = Colors.grey.shade300;
    } else if (sStatus == 'ABSENT') {
      statusText = '❌ $sFirstName is absent today';
      statusColor = const Color(0xFFFF6B3D);
    }
    
    String timeDisplay = '';
    if (sTimeStr != null && sTimeStr.isNotEmpty) {
      try {
        final dt = DateTime.parse(sTimeStr).toLocal();
        timeDisplay = 'Since ${DateFormat('h:mm a').format(dt)}';
      } catch (e) {
        timeDisplay = '';
      }
    }

    final messages = data['messagesSnippet'] as List? ?? [
      {
        'id': '1',
        'senderName': 'Mrs. Ritu Sharma',
        'senderRole': 'Class Teacher • Grade 8B',
        'text': 'Emma showed excellent improvement in her Science project...',
        'time': '10:23 AM',
        'unread': true,
        'initials': 'RS',
        'gradient': [const Color(0xFF667EEA), const Color(0xFF764BA2)],
      },
      {
        'id': '2',
        'senderName': 'School Admin',
        'senderRole': 'Administration',
        'text': "Annual Day 2024 — Please confirm Emma's participation by Nov 25th.",
        'time': '9:15 AM',
        'unread': true,
        'initials': 'AN',
        'gradient': [const Color(0xFFF093FB), const Color(0xFFF5576C)],
      }
    ];

    final upcomingEvents = data['upcomingEvents'] as List? ?? [
      {
        'title': 'Science Quiz',
        'date': '21',
        'month': 'NOV',
        'sub': 'Chapter 5 & 6 • Prepare now',
        'tag': '2 days',
        'color': const Color(0xFF3B6EF8),
        'bg': const Color(0xFFEEF3FF),
      },
      {
        'title': 'Fee Due Date',
        'date': '25',
        'month': 'NOV',
        'sub': '₹8,200 • Pay before Nov 25',
        'tag': '6 days',
        'color': const Color(0xFFFF6B3D),
        'bg': const Color(0xFFFFF5EE),
      },
      {
        'title': 'Annual Day 🎭',
        'date': '28',
        'month': 'NOV',
        'sub': 'Confirm participation slip',
        'tag': '9 days',
        'color': const Color(0xFF00C9A7),
        'bg': const Color(0xFFF0FDF9),
      }
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // ── dh-hero: Premium Hero Section ──
        Container(
          margin: const EdgeInsets.only(top: 8),
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(26),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF2346C8),
                Color(0xFF3B6EF8),
                Color(0xFF0EA5C0),
                Color(0xFF00C9A7),
              ],
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF3B6EF8).withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Good Morning ☀️',
                        style: GoogleFonts.dmSans(
                          fontSize: 13,
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                      Text(
                        data['parentDetails']?['name'] ?? 'Parent',
                        style: GoogleFonts.sora(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: Colors.white.withOpacity(0.28),
                    child: Text(data['parentDetails']?['initials'] ?? 'P', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              // dh-chips: Kid Switcher
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    for (var student in (data['students'] as List))
                      _buildKidChip(student, student['id'] == activeStudent['id']),
                    _buildAddKidChip(),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              // dh-safe: Safety Status
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.18),
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(color: Colors.white10),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                    ).animate(onPlay: (c) => c.repeat()).scale(
                      begin: const Offset(1, 1), end: const Offset(2, 2),
                      duration: 1.5.seconds,
                    ).fadeOut(),
                    const SizedBox(width: 8),
                    Text(
                      statusText,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12),
                    ),
                    const Spacer(),
                    if (timeDisplay.isNotEmpty)
                      Text(
                        timeDisplay,
                        style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 10),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ).animate().fadeIn().slideY(begin: 0.1),

        const SizedBox(height: 12),
        
        // ── dh-stats: 4-column stats row ──
        _buildStatsRow(data),
        
        const SizedBox(height: 24),

        // ── dh-bus: Premium Live bus tracking ──
        if (rbac.hasPermission('transport.view')) ...[
          _buildSectionLabel("🚌 School Bus • Live"),
          _buildLiveBusCard(data),
          const SizedBox(height: 24),
        ],

        // ── dh-diary: Today's Diary ──
        _buildSectionLabel("📖 Today's Diary"),
        _buildDiarySection(data),
        
        const SizedBox(height: 24),

        // ── dh-msgs: Direct Messages ──
        _buildSectionLabel("💬 Direct Messages"),
        _buildMessagesSection(messages),


        // ── dh-events: Upcoming ──
        _buildSectionLabel("📅 Upcoming"),
        _buildUpcomingEvents(upcomingEvents),

        const SizedBox(height: 48),
      ],
    );
  }

  Widget _buildSectionLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 12),
      child: Text(
        label,
        style: GoogleFonts.sora(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: AppTheme.textPrimary,
        ),
      ),
    );
  }

  Widget _buildDiarySection(Map<String, dynamic> data) {
    final timeline = data['timelineSnippet'] as List? ?? [
      {'time': '8:00 AM', 'title': '📐 Math — HW Submitted ✓', 'sub': 'Quadratic Equations • Chapter 7', 'color': const Color(0xFF3B6EF8)},
      {'time': '12:30 PM', 'title': '🍱 Lunch — Dal Rice & Salad', 'sub': 'Ate well • Canteen record', 'color': const Color(0xFF00C9A7)},
      {'time': '1:15 PM', 'title': '🎨 Art — Leading her group!', 'sub': 'Annual Day backdrop painting • Live now', 'color': const Color(0xFFF5A623)},
    ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: AppTheme.glassDecoration(color: Colors.white, opacity: 0.1),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Tuesday, Nov 19", style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textSecondary)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: const Color(0xFFEEF3FF), borderRadius: BorderRadius.circular(100)),
                child: const Text("3 entries", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF3B6EF8))),
              ),
            ],
          ),
          const SizedBox(height: 20),
          for (var item in timeline) ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 65,
                  child: Text(item['time'].toString(), style: TextStyle(fontSize: 11, color: AppTheme.textTertiary, fontWeight: FontWeight.w600)),
                ),
                Column(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(color: item['color'] as Color? ?? Colors.blue, shape: BoxShape.circle),
                    ),
                    if (timeline.indexOf(item) != timeline.length - 1)
                      Container(width: 1.5, height: 40, color: Colors.black.withOpacity(0.05)),
                  ],
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item['title'].toString(), style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary)),
                      const SizedBox(height: 2),
                      Text(item['sub']?.toString() ?? '', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    ],
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFF5A623).withOpacity(0.2))),
            child: Row(
              children: [
                const Icon(Icons.stars_rounded, color: Color(0xFFF5A623), size: 16),
                const SizedBox(width: 8),
                Text("Science quiz on Friday — Chapter 5 & 6", style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF92400E))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessagesSection(List messages) {
    return Container(
      decoration: AppTheme.glassDecoration(color: Colors.white, opacity: 0.1),
      child: Column(
        children: [
          for (var i = 0; i < messages.length; i++) ...[
            _buildMessageItem(messages[i]),
            if (i != messages.length - 1) Divider(height: 1, indent: 70, color: Colors.black.withOpacity(0.05)),
          ],
          InkWell(
            onTap: () => context.push('/messages'),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              alignment: Alignment.center,
              child: Text("View all messages →", style: GoogleFonts.dmSans(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF3B6EF8))),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageItem(Map<String, dynamic> msg) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: msg['gradient'] as List<Color>),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(msg['initials'].toString(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(msg['senderName'].toString(), style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary)),
                    Text(msg['time'].toString(), style: TextStyle(fontSize: 10, color: AppTheme.textTertiary)),
                  ],
                ),
                Text(msg['senderRole'].toString(), style: TextStyle(fontSize: 10, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
                const SizedBox(height: 4),
                Text(msg['text'].toString(), maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
              ],
            ),
          ),
          if (msg['unread'] == true)
            Container(width: 8, height: 8, margin: const EdgeInsets.only(left: 8), decoration: const BoxDecoration(color: Color(0xFF3B6EF8), shape: BoxShape.circle)),
        ],
      ),
    );
  }

  Widget _buildUpcomingEvents(List events) {
    return Column(
      children: [
        for (var ev in events) ...[
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(14),
            decoration: AppTheme.glassDecoration(color: Colors.white, opacity: 0.1),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 54,
                  decoration: BoxDecoration(color: ev['bg'] as Color, borderRadius: BorderRadius.circular(12)),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(ev['month'].toString(), style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.textTertiary)),
                      Text(ev['date'].toString(), style: GoogleFonts.sora(fontSize: 20, fontWeight: FontWeight.bold, color: ev['color'] as Color)),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(ev['title'].toString(), style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textPrimary)),
                      const SizedBox(height: 2),
                      Text(ev['sub'].toString(), style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(color: const Color(0xFFFFF5EE), borderRadius: BorderRadius.circular(100)),
                  child: Text(ev['tag'].toString(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFFF6B3D))),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildEmptyTimelineState(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      decoration: AppTheme.glassDecoration(opacity: 0.05, blur: 5),
      child: Column(
        children: [
          Icon(Icons.auto_awesome_rounded, 
              color: AppTheme.primaryColor.withOpacity(0.2), size: 64),
          const SizedBox(height: 20),
          Text(
            'The day is just beginning',
            textAlign: TextAlign.center,
            style: GoogleFonts.sora(
              color: AppTheme.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "Your child's daily story will bloom here moment by moment.",
            textAlign: TextAlign.center,
            style: GoogleFonts.dmSans(
              color: AppTheme.textSecondary,
              fontSize: 14,
              height: 1.5,
            ),
          ),
        ],
      ),
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

  Widget _buildDrawer(BuildContext context, SchoolBrandState brand, AsyncValue<Map<String, dynamic>> dashboardAsync, RBACState rbac) {
    return Drawer(
      backgroundColor: AppTheme.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(right: Radius.circular(24)),
      ),
      child: dashboardAsync.when(
        data: (data) {
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
                    _buildDrawerSectionLabel('ACADEMICS'),
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
                      icon: Icons.analytics_outlined,
                      title: 'Progress & Reports',
                      subtitle: 'Q3 report card available',
                      color: const Color(0xFF00C9A7),
                      backgroundColor: const Color(0xFFF0FDF9),
                      badge: 'New',
                      badgeColor: const Color(0xFF00C9A7),
                      onTap: () {},
                    ),
                    _buildDrawerItem(
                      icon: Icons.stars_rounded,
                      title: 'Achievements',
                      subtitle: '2 new badges earned',
                      color: const Color(0xFFF5A623),
                      backgroundColor: const Color(0xFFFFFBEB),
                      onTap: () {},
                    ),
                    if (rbac.hasPermission('messages.view')) ...[
                      const Padding(padding: EdgeInsets.symmetric(horizontal: 18), child: Divider(height: 24)),
                      _buildDrawerSectionLabel('COMMUNICATION'),
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
                    ],
                    const Padding(padding: EdgeInsets.symmetric(horizontal: 18), child: Divider(height: 24)),
                    _buildDrawerSectionLabel('SCHOOL LIFE'),
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
                    const Padding(padding: EdgeInsets.symmetric(horizontal: 18), child: Divider(height: 24)),
                    _buildDrawerSectionLabel('MANAGE'),
                    _buildDrawerItem(
                      icon: Icons.account_balance_wallet_rounded,
                      title: 'Fees & Payments',
                      subtitle: '₹8,200 due • Nov 25',
                      color: const Color(0xFFF5A623),
                      backgroundColor: const Color(0xFFFFFBEB),
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
                    _buildDrawerItem(
                      icon: Icons.home_work_rounded,
                      title: 'Hostel',
                      subtitle: 'Room A-204 · Block A · Status',
                      color: const Color(0xFF8B5CF6),
                      backgroundColor: const Color(0xFFF5F0FF),
                      badge: '● In School',
                      badgeColor: const Color(0xFF00C9A7),
                      onTap: () {
                        context.pop();
                        context.push('/hostel');
                      },
                    ),
                    const Padding(padding: EdgeInsets.symmetric(horizontal: 18), child: Divider(height: 24)),
                    _buildDrawerSectionLabel('ACCOUNT'),
                    _buildDrawerItem(
                      icon: Icons.person_rounded,
                      title: 'Student Profile',
                      subtitle: 'View & update student details',
                      color: const Color(0xFF3B6EF8),
                      backgroundColor: const Color(0xFFEEF3FF),
                      onTap: () {
                        context.pop();
                        context.push('/profile');
                      },
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
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text("Error loading drawer")),
      ),
    );
  }

  Widget _buildDrawerSectionLabel(String label) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 4),
      child: Text(
        label,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textTertiary, letterSpacing: 0.8),
      ),
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
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
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
                  Text(subtitle, style: TextStyle(fontSize: 11, color: AppTheme.textTertiary)),
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

  Widget _buildStudentSelector(Map<String, dynamic> activeStudent, List students) {
    if (students.length <= 1) return const SizedBox.shrink();
    
    final avatarUrl = activeStudent['avatar']?.toString();
    
    return GestureDetector(
      onTap: () {
        // Implement student picker sheet
      },
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: AppTheme.glassDecoration(
          opacity: 0.1,
          color: Colors.white,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
             if (avatarUrl != null && avatarUrl.isNotEmpty)
              CircleAvatar(
                radius: 18,
                backgroundImage: NetworkImage(avatarUrl),
              )
            else
              const CircleAvatar(
                radius: 18,
                backgroundColor: Color(0xFFE2E8F0),
                child: Icon(Icons.person, size: 20, color: Color(0xFF64748B)),
              ),
            const SizedBox(width: 8),
            const Icon(Icons.keyboard_arrow_down_rounded, size: 20, color: Color(0xFF1E293B)),
            const SizedBox(width: 4),
          ],
        ),
      ),
    ).animate().scale(delay: 500.ms);
  }

  Widget _buildHeaderSchoolLogo(SchoolBrandState brand) {
    final String logoUrl = _getFinalUrl(brand.schoolLogoUrl);

    Widget fallbackIcon() => Icon(
      Icons.school_rounded,
      color: brand.secondaryColor,
      size: 26,
    );

    if (logoUrl.isEmpty) return fallbackIcon();

    Widget imageWidget;
    if (logoUrl.isEmpty) {
      imageWidget = fallbackIcon();
    } else if (logoUrl.startsWith('data:')) {
      try {
        final commaIdx = logoUrl.indexOf(',');
        if (commaIdx != -1) {
          imageWidget = Image.memory(
            base64Decode(logoUrl.substring(commaIdx + 1)),
            fit: BoxFit.contain,
            errorBuilder: (_, __, ___) => fallbackIcon(),
          );
        } else {
          imageWidget = fallbackIcon();
        }
      } catch (_) {
        imageWidget = fallbackIcon();
      }
    } else {
      imageWidget = Image.network(
        logoUrl,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => fallbackIcon(),
        loadingBuilder: (_, child, progress) => progress == null ? child : fallbackIcon(),
      );
    }

    return Container(
      width: 88,
      height: 88,
      clipBehavior: Clip.antiAlias,
      decoration: const BoxDecoration(),
      child: imageWidget,
    );
  }

  String _getFinalUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('data:')) return path;
    const String host = 'http://localhost:3000'; // Define host for paths
    return path.startsWith('/') ? '$host$path' : '$host/$path';
  }

  Widget _buildDrawerStudentAvatar(Map<String, dynamic> data, SchoolBrandState brand) {
    final activeStudent = (data['students'] as List).firstWhere(
      (s) => s['id'] == data['activeStudentId'],
      orElse: () => data['students'][0],
    );
    final String? avatarPath = activeStudent['avatar'] as String?;
    final avatarUrl = _getFinalUrl(avatarPath);
    final studentName = activeStudent['firstName'] as String? ?? 'Student';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (avatarUrl.isNotEmpty)
          Container(
            width: 72,
            height: 72,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
            ),
            padding: const EdgeInsets.all(4),
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
                          Icon(Icons.person, color: brand.primaryColor, size: 36),
                    ),
            ),
          )
        else
          CircleAvatar(
            backgroundColor: Colors.white,
            radius: 36,
            child: Icon(Icons.person, color: brand.primaryColor, size: 36),
          ),
        const SizedBox(height: 16),
        Text(
          studentName,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionGrid(BuildContext context, RBACState rbac) {
    List<Widget> actions = [];

    if (rbac.hasPermission('attendance.view')) {
      actions.add(_buildQuickActionBtn(
        label: 'Leave',
        icon: Icons.calendar_today_rounded,
        color: const Color(0xFF3B6EF8),
        bgColor: const Color(0xFFEEF3FF),
        onTap: () {},
      ));
    }

    if (rbac.hasPermission('fees.view')) {
      actions.add(_buildQuickActionBtn(
        label: 'Pay Fees',
        icon: Icons.account_balance_wallet_rounded,
        color: const Color(0xFFFF6B3D),
        bgColor: const Color(0xFFFFF5EE),
        onTap: () => context.push('/finance'),
      ));
    }

    actions.add(_buildQuickActionBtn(
      label: 'Call',
      icon: Icons.call_rounded,
      color: const Color(0xFF00C9A7),
      bgColor: const Color(0xFFF0FDF9),
      onTap: () {},
    ));

    actions.add(_buildQuickActionBtn(
      label: 'AI Help',
      icon: Icons.bolt_rounded,
      color: const Color(0xFF8B5CF6),
      bgColor: const Color(0xFFF5F0FF),
      onTap: () {},
    ));

    actions.add(_buildQuickActionBtn(
      label: 'Canteen',
      icon: Icons.restaurant_rounded,
      color: const Color(0xFFF5A623),
      bgColor: const Color(0xFFFFFBEB),
      onTap: () {},
    ));

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      clipBehavior: Clip.none,
      child: Row(
        children: actions,
      ),
    );
  }

  Widget _buildQuickActionBtn({
    required String label,
    required IconData icon,
    required Color color,
    required Color bgColor,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(right: 16),
      child: GestureDetector(
        onTap: onTap,
        child: Column(
          children: [
            Container(
              width: 58,
              height: 58,
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: GoogleFonts.dmSans(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppTheme.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsRow(Map<String, dynamic> data) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 18),
      child: Row(
        children: [
          _buildStatCard('94%', 'Attendance', const Color(0xFF3B6EF8), Icons.how_to_reg_rounded),
          const SizedBox(width: 8),
          _buildStatCard('12', 'Diary', const Color(0xFF00C9A7), Icons.menu_book_rounded),
          const SizedBox(width: 8),
          _buildStatCard('4', 'Homework', const Color(0xFFFF6B3D), Icons.history_edu_rounded),
          const SizedBox(width: 8),
          _buildStatCard('2', 'Events', const Color(0xFFF5A623), Icons.event_available_rounded),
        ],
      ),
    );
  }

  Widget _buildStatCard(String value, String label, Color accent, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.borderColor),
          boxShadow: [
            BoxShadow(
              color: AppTheme.primaryColor.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: accent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(9),
              ),
              child: Icon(icon, color: accent, size: 15),
            ),
            const SizedBox(height: 7),
            Text(
              value,
              style: GoogleFonts.sora(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(color: AppTheme.textTertiary, fontSize: 9, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 7),
            Container(
              height: 3,
              width: double.infinity,
              decoration: BoxDecoration(color: AppTheme.surfaceColor2, borderRadius: BorderRadius.circular(2)),
              child: FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: 0.94,
                child: Container(
                  decoration: BoxDecoration(color: accent, borderRadius: BorderRadius.circular(2)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLiveBusCard(Map<String, dynamic> data) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(20),
      decoration: AppTheme.glassDecoration(
        color: const Color(0xFF0F172A),
        opacity: 0.95,
        shadow: BoxShadow(
          color: AppTheme.primaryColor.withOpacity(0.2),
          blurRadius: 20,
          offset: const Offset(0, 8),
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF00FFD1).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    const CircleAvatar(radius: 3, backgroundColor: Color(0xFF00FFD1)),
                    const SizedBox(width: 6),
                    Text(
                      'LIVE TRACKING',
                      style: GoogleFonts.sora(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF00FFD1),
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '#BT-104',
                style: GoogleFonts.dmSans(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.white.withOpacity(0.5),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  shape: BoxShape.circle,
                ),
                child: const Center(child: Text('🚌', style: TextStyle(fontSize: 24))),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Near Central Mall',
                      style: GoogleFonts.sora(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'ETA: 12 mins',
                      style: GoogleFonts.dmSans(
                        fontSize: 14,
                        color: const Color(0xFF00FFD1),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => context.push('/transport'),
                icon: const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white, size: 18),
              ),
            ],
          ),
        ],
      ),
    ).animate().slideX(begin: 1, duration: 400.ms, curve: Curves.easeOut);
  }

  Widget _buildStunningBackground(SchoolBrandState brand) {
    return Container(color: AppTheme.backgroundColor);
  }

  Widget _buildStudentAvatar(Map<String, dynamic> student) {
    final avatar = student['avatar'] as String?;
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white.withOpacity(0.5), width: 2),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4))
        ],
      ),
      child: ClipOval(
        child: _buildDynamicImage(avatar),
      ),
    );
  }

  Widget _buildDynamicImage(String? imageUrl) {
    if (imageUrl == null || imageUrl.isEmpty) {
      return const Icon(Icons.person, color: AppTheme.primaryColor);
    }

    final finalUrl = _getFinalUrl(imageUrl);

    if (finalUrl.startsWith('http')) {
      if (finalUrl.toLowerCase().contains('svg')) {
        return SvgPicture.network(finalUrl, fit: BoxFit.cover);
      }
      return Image.network(
        finalUrl,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => const Icon(Icons.person, color: AppTheme.primaryColor),
      );
    }

    if (finalUrl.startsWith('data:')) {
      try {
        final commaIdx = finalUrl.indexOf(',');
        if (commaIdx != -1) {
          return Image.memory(base64Decode(finalUrl.substring(commaIdx + 1)), fit: BoxFit.cover);
        }
      } catch (_) {}
    }

    try {
      return Image.memory(base64Decode(finalUrl), fit: BoxFit.cover);
    } catch (_) {
      return const Icon(Icons.person, color: AppTheme.primaryColor);
    }
  }

  Widget _buildKidChip(Map<String, dynamic> student, bool isSelected) {
    return GestureDetector(
      onTap: () {
        debugPrint('Switching to student: ${student['id']}');
      },
      child: Container(
        margin: const EdgeInsets.only(right: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.white10,
          borderRadius: BorderRadius.circular(100),
          border: Border.all(color: isSelected ? Colors.white10 : Colors.white.withOpacity(0.05)),
        ),
        child: Text(
          student['firstName'] ?? 'Student',
          style: GoogleFonts.dmSans(
            color: isSelected ? AppTheme.primaryColor : Colors.white60,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildAddKidChip() {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: Colors.white10,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: const Icon(Icons.add, color: Colors.white70, size: 16),
    );
  }
}


