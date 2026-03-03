import 'dart:convert';
import 'dart:typed_data';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/school_brand_provider.dart';
import '../../core/routing/rbac.dart';
import '../../ui/components/today_timeline_card.dart';
import '../../ui/components/quick_action_tile.dart';
import '../../core/routing/drawer_provider.dart';

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

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppTheme.background,
      
      body: Stack(
        children: [
          // ───── Stunning Graphical Background ─────
          Positioned.fill(child: _buildStunningBackground(brand)),

          // ───── Scrollable Content ─────
          Positioned.fill(
            child: SingleChildScrollView(
              padding: const EdgeInsets.only(
                top: 190,
                left: AppTheme.s24,
                right: AppTheme.s24,
                bottom: AppTheme.s24,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Upcoming Events card
                  ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                      child: Container(
                        padding: const EdgeInsets.all(AppTheme.s24),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.35),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: Colors.white.withOpacity(0.5), width: 1.5),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 10,
                              spreadRadius: -2,
                            )
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.8),
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.05),
                                    blurRadius: 5,
                                    offset: const Offset(0, 2),
                                  )
                                ],
                              ),
                              child: Icon(Icons.menu_book_rounded,
                                  size: 28, color: brand.primaryColor),
                            ),
                        const SizedBox(width: AppTheme.s16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Upcoming Events',
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleMedium
                                      ?.copyWith(fontWeight: FontWeight.bold)),
                              const SizedBox(height: AppTheme.s4),
                              Text(
                                'Your next class (Math 10A) starts in 15 mins. Room 302.',
                                style: Theme.of(context).textTheme.bodySmall,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: AppTheme.s8),
                              Row(
                                children: [
                                  Icon(Icons.arrow_forward,
                                      size: 16, color: brand.primaryColor),
                                  const SizedBox(width: 4),
                                  Text('View Details',
                                      style: TextStyle(
                                          color: brand.primaryColor,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold)),
                                ],
                              )
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                  ),
                  ),
                  const SizedBox(height: AppTheme.s24),

                  // Quick Action Grid
                  _buildQuickActionGrid(context, rbac),
                  const SizedBox(height: AppTheme.s24),

                  // Today's Schedule
                  Text("Today's Schedule",
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: AppTheme.s16),
                  TodayTimelineCard(
                    events: [
                      TimelineEvent(
                          time: '08:00 AM',
                          title: 'Start of Day',
                          isActive: false),
                      TimelineEvent(
                          time: '09:00 AM',
                          title: 'Math 10A',
                          subtitle: 'Room 302',
                          isActive: true),
                      TimelineEvent(
                          time: '11:00 AM',
                          title: 'Staff Meeting',
                          subtitle: 'Conference Room B',
                          isActive: false),
                    ],
                    primaryButtonText: 'Start Math 10A (Take Attendance)',
                    onPrimaryAction: () => context.go('/attendance'),
                  ),
                  const SizedBox(height: AppTheme.s48),
                ],
              ),
            ),
          ),

          // ───── Sticky Golden Header ─────
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
              ),
              padding: const EdgeInsets.only(
                  top: 48, left: AppTheme.s24, right: AppTheme.s24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Bar: Menu / Logo / Notification
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Hamburger — opens drawer
                      IconButton(
                        onPressed: () => ref.read(shellScaffoldKeyProvider).currentState?.openDrawer(),
                        icon: Icon(Icons.menu, color: brand.secondaryColor),
                        splashRadius: 24,
                      ),
                      // School logo
                      Expanded(
                        child: Center(
                            child: _SchoolLogoWidget(
                                logoUrl: brand.schoolLogoUrl ?? '',
                                schoolName: brand.schoolName,
                                brandSecondary: brand.secondaryColor,
                            ),
                         ),
                      ),
                      // Notifications — goes to inbox
                      IconButton(
                        onPressed: () => context.go('/inbox'),
                        icon: Icon(Icons.notifications_none, color: brand.secondaryColor),
                        splashRadius: 24,
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

  Widget _buildQuickActionGrid(BuildContext context, RBACState rbac) {
    List<Widget> tiles = [];

    if (rbac.hasPermission('timetable.view')) {
      tiles.add(QuickActionTile(
        label: 'My Scheduled',
        icon: Icons.calendar_today_rounded,
        color: const Color(0xFFFFD166),
        onTap: () => context.go('/timetable'),
      ));
    }

    if (rbac.hasPermission('diary.create')) {
      tiles.add(QuickActionTile(
        label: 'My Calendar',
        icon: Icons.event_note,
        color: const Color(0xFFFFB5A7),
        onTap: () => context.go('/diary'),
      ));
    }

    if (rbac.hasPermission('attendance.mark')) {
      tiles.add(QuickActionTile(
        label: 'My Attendance',
        icon: Icons.how_to_reg,
        color: const Color(0xFF90DBE4),
        onTap: () => context.go('/attendance'),
      ));
    }

    if (rbac.hasPermission('progress.view')) {
      tiles.add(QuickActionTile(
        label: 'Progress Report',
        icon: Icons.analytics,
        color: const Color(0xFFCDB4DB),
        onTap: () => context.go('/progress'),
      ));
    }

    if (rbac.hasPermission('development.view')) {
      tiles.add(QuickActionTile(
        label: 'Development',
        icon: Icons.psychology_rounded,
        color: const Color(0xFFA2D2FF),
        onTap: () => context.go('/development'),
      ));
    }

    if (rbac.hasPermission('health.view')) {
      tiles.add(QuickActionTile(
        label: 'Health',
        icon: Icons.medical_services_rounded,
        color: const Color(0xFFFFCAD4),
        onTap: () => context.go('/health'),
      ));
    }

    if (rbac.hasPermission('communication.view')) {
      tiles.add(QuickActionTile(
        label: 'Comms',
        icon: Icons.forum_rounded,
        color: const Color(0xFFB9FBC0),
        onTap: () => context.go('/communication'),
      ));
    }

    if (rbac.hasPermission('chat.view')) {
      tiles.add(QuickActionTile(
        label: 'Chat',
        icon: Icons.chat_bubble_rounded,
        color: const Color(0xFFFDE2E4),
        onTap: () => context.go('/chat'),
      ));
    }

    if (tiles.isEmpty) {
      return const Text('No quick actions assigned.',
          style: TextStyle(color: AppTheme.textMuted));
    }

    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: AppTheme.s16,
      mainAxisSpacing: AppTheme.s16,
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
              color: brand.primaryColor.withOpacity(0.4),
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
              color: const Color(0xFF90DBE4).withOpacity(0.4),
            ),
          ),
        ),
        Positioned(
          bottom: -50,
          left: 50,
          child: Container(
            width: 250,
            height: 250,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFFFFB5A7).withOpacity(0.4),
            ),
          ),
        ),
        Positioned.fill(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 60, sigmaY: 60),
            child: Container(color: Colors.transparent),
          ),
        ),
      ],
    );
  }
}

/// Displays the school logo in the header.
/// Supports base64 data URIs and remote URLs.
class _SchoolLogoWidget extends StatelessWidget {
  final String logoUrl;
  final String schoolName;
  final Color brandSecondary;

  const _SchoolLogoWidget({
    required this.logoUrl,
    required this.schoolName,
    required this.brandSecondary,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 88,
      height: 88,
      clipBehavior: Clip.antiAlias,
      decoration: const BoxDecoration(),
      child: _buildImage(),
    );
  }

  Widget _buildImage() {
    if (logoUrl.isEmpty) return _fallbackIcon();

    if (logoUrl.startsWith('data:')) {
      try {
        final commaIdx = logoUrl.indexOf(',');
        if (commaIdx == -1) return _fallbackIcon();
        final Uint8List bytes = base64Decode(logoUrl.substring(commaIdx + 1));
        return Image.memory(
          bytes,
          fit: BoxFit.contain,
          errorBuilder: (_, __, ___) => _fallbackIcon(),
        );
      } catch (_) {
        return _fallbackIcon();
      }
    }

    return Image.network(
      logoUrl,
      fit: BoxFit.contain,
      errorBuilder: (_, __, ___) => _fallbackIcon(),
      loadingBuilder: (_, child, progress) =>
          progress == null ? child : _fallbackIcon(),
    );
  }

  Widget _fallbackIcon() => Icon(
        Icons.school_rounded,
        color: brandSecondary,
        size: 26,
      );
}
