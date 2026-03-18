import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/state/auth_state.dart';
import '../../shared/components/all_modules_overlay.dart';
import '../../shared/components/floating_shapes_background.dart';
import '../../core/state/alert_state.dart';
import '../../core/services/alert_engine.dart';
import '../chat/teacher_chat_view.dart';
import '../attendance/teacher_attendance_view.dart';
import '../profile/teacher_profile_view.dart';
import '../notifications/notifications_view.dart';

class AppShell extends ConsumerStatefulWidget {
  final Widget child;
  static final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  const AppShell({super.key, required this.child});

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
  int? _activeBottomSheetIndex;

  @override
  Widget build(BuildContext context) {
    final ref = this.ref;
    // Initialize Alert Engine for Admin
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(alertEngineProvider).start();
    });

    // Listen for new alerts to show prompts
    ref.listen<List<SchoolAlert>>(alertsProvider, (previous, next) {
      if (next.isNotEmpty && (previous == null || next.length > previous.length)) {
        final newAlert = next.first;
        if (!newAlert.isRead && context.mounted) {
          _showInAppPrompt(context, newAlert);
        }
      }
    });

    // Current route to highlight the correct sub-menu
    final String location = GoRouterState.of(context).uri.path;
    
    int baseIndex = 0;
    if (location.startsWith('/attendance')) baseIndex = 1;
    if (location.startsWith('/messages')) baseIndex = 2;
    if (location.startsWith('/profile')) baseIndex = 4;

    int currentIndex = _activeBottomSheetIndex ?? baseIndex;

    return Scaffold(
      key: AppShell.scaffoldKey,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Stack(
        children: [
          // Background layer and content
          Positioned.fill(
            child: FloatingShapesBackground(
              child: Column(
                children: [
                  if (location != '/profile')
                    // Custom iOS Status Bar Replacement
                    _buildStatBar(context, ref, location),
                  
                  // Main content
                  Expanded(
                    child: widget.child,
                  ),
                  
                  // Custom Bottom Nav Replacement
                  _buildBotNav(context, currentIndex, ref),
                ],
              ),
            ),
          ),
          
          // Floating Action Button Overlay for "All Modules"
          Positioned(
            bottom: 30,
            left: 0,
            right: 0,
            child: Center(
              child: GestureDetector(
                onTap: () => showAllModulesMenu(context),
                child: Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: AppTheme.teacherTheme,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(Icons.grid_view_rounded, color: Colors.white, size: 28),
                  ),
                ),
              ),
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

  Widget _buildStatBar(BuildContext context, WidgetRef ref, String location) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 14),
      decoration: const BoxDecoration(
        color: Color.fromRGBO(250, 251, 254, 0.94),
        border: Border(bottom: BorderSide(color: Color.fromRGBO(20, 14, 40, 0.04), width: 1.5)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // 1. Dedicated System Status Bar Space (Time, Signal, Battery)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '9:41',
                  style: TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF140E28),
                  ),
                ),
                // Signal & Battery Icons
                Row(
                  children: [
                    _buildSignalIcon(),
                    const SizedBox(width: 6),
                    _buildBatteryIcon(),
                  ],
                ),
              ],
            ),
          ),
            
            // Header Content: Greet & Name on Left, Avatar on Right
            if (['/dashboard', '/attendance', '/messages', '/profile', '/route'].contains(location))
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Left Profile Info
                  Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              if (location == '/dashboard')
                                const Icon(Icons.wb_sunny_outlined, size: 11, color: Color(0xFF7B7291)),
                              if (location == '/dashboard')
                                const SizedBox(width: 3),
                               Text(
                                location.startsWith('/messages') ? 'EduSphere Messaging' : (ref.watch(userProfileProvider)?.schoolName ?? 'EduSphere School'),
                                style: const TextStyle(
                                  fontFamily: 'Satoshi',
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFFFF5733),
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                          if (location.startsWith('/messages'))
                            const Text(
                              'Chat',
                              style: TextStyle(
                                fontFamily: 'Clash Display',
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF140E28),
                                letterSpacing: -0.4,
                              ),
                            )
                          else
                            RichText(
                              text: TextSpan(
                                text: 'Ms. ',
                                style: const TextStyle(
                                  fontFamily: 'Clash Display',
                                  fontSize: 19,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF140E28),
                                  letterSpacing: -0.4,
                                ),
                                children: [
                                  WidgetSpan(
                                    alignment: PlaceholderAlignment.baseline,
                                    baseline: TextBaseline.alphabetic,
                                    child: ShaderMask(
                                      blendMode: BlendMode.srcIn,
                                      shaderCallback: (bounds) => AppTheme.teacherTheme.createShader(
                                        Rect.fromLTWH(0, 0, bounds.width, bounds.height),
                                      ),
                                      child: Text(
                                        ref.watch(userProfileProvider)?.name ?? 'User',
                                        style: const TextStyle(
                                          fontFamily: 'Clash Display',
                                          fontSize: 19,
                                          fontWeight: FontWeight.w700,
                                          letterSpacing: -0.4,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                  
                  // Right actions (Bell and Avatar)
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => _showBottomSheet(context, const NotificationsView(), 3),
                        child: Consumer(
                          builder: (context, ref, _) {
                            final notifsAsync = ref.watch(staffNotificationsProvider);
                            final unread = notifsAsync.valueOrNull?.where((n) => !n.read).length ?? 0;
                            return _buildTopBtnWithBadge(
                              Icons.notifications_none_outlined,
                              unread > 0 ? '$unread' : '',
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      InkWell(
                        onTap: () => context.go('/profile'),
                        child: Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            gradient: AppTheme.teacherTheme,
                            borderRadius: BorderRadius.circular(13),
                            border: Border.all(color: const Color.fromRGBO(20, 14, 40, 0.07), width: 1.5),
                          ),
                          child: Center(
                            child: Text(
                              _getInitials(ref.watch(userProfileProvider)?.name),
                              style: const TextStyle(
                                fontFamily: 'Clash Display',
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
        ],
      ),
    );
  }

  Widget _buildSignalIcon() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: List.generate(4, (index) {
        return Container(
          width: 3,
          height: (index + 1) * 3.0 + 2,
          margin: const EdgeInsets.only(left: 1.5),
          decoration: BoxDecoration(
            color: const Color(0xFF140E28),
            borderRadius: BorderRadius.circular(1),
          ),
        );
      }),
    );
  }

  Widget _buildBatteryIcon() {
    return Container(
      width: 22,
      height: 11,
      padding: const EdgeInsets.all(1.5),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFF140E28).withOpacity(0.3), width: 1),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF140E28),
          borderRadius: BorderRadius.circular(1),
        ),
      ),
    );
  }

  Widget _buildTopBtn(IconData icon) {
    return Container(
      width: 38,
      height: 38,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(13),
        border: Border.all(color: const Color.fromRGBO(20, 14, 40, 0.07), width: 1.5),
        boxShadow: const [
          BoxShadow(color: Color.fromRGBO(20, 14, 40, 0.06), blurRadius: 8, offset: Offset(0, 2)),
        ],
      ),
      child: Icon(icon, size: 18, color: const Color(0xFF140E28)),
    );
  }

  Widget _buildTopBtnWithBadge(IconData icon, String badge) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        _buildTopBtn(icon),
        if (badge.isNotEmpty)
          Positioned(
            top: -4,
            right: -4,
            child: Container(
              width: 18,
              height: 18,
              decoration: BoxDecoration(
                color: const Color(0xFFFF3264),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFFAFBFE), width: 2.5),
              ),
              child: Center(
                child: Text(
                  badge,
                  style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildBotNav(BuildContext context, int currentIndex, WidgetRef ref) {
    final roleValue = ref.watch(activeRoleProvider).toUpperCase().trim();

    return Container(
      height: 82,
      padding: const EdgeInsets.fromLTRB(8, 6, 8, 18),
      decoration: const BoxDecoration(
        color: Color.fromRGBO(250, 251, 254, 0.96),
        border: Border(top: BorderSide(color: Color.fromRGBO(20, 14, 40, 0.07), width: 1.5)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(context, 0, currentIndex, Icons.home_filled, 'Home', const SizedBox()),
          if (roleValue == 'DRIVER')
            _buildNavItem(context, 1, currentIndex, Icons.map_outlined, 'Route', const SizedBox())
          else if (roleValue == 'ADMIN')
            _buildNavItem(
              context, 
              1, 
              currentIndex, 
              Icons.grid_view_rounded, 
              'Modules', 
              const SizedBox(),
              onTapOverride: () {
                setState(() => _activeBottomSheetIndex = 1);
                showAllModulesMenu(context).then((_) {
                  if (mounted && _activeBottomSheetIndex == 1) setState(() => _activeBottomSheetIndex = null);
                });
              },
            )
          else
            _buildNavItem(context, 1, currentIndex, Icons.fact_check_outlined, 'Attend.', const TeacherAttendanceView()),
          const SizedBox(width: 56),
          _buildNavItem(
            context, 
            2, 
            currentIndex, 
            Icons.chat_bubble_outline_rounded, 
            'Chat', 
            const TeacherChatView(), 
            badgeText: '5',
          ),
          _buildNavItem(context, 4, currentIndex, Icons.person_outline_rounded, 'Me', const TeacherProfileView()),
        ],
      ),
    );
  }

  void _showBottomSheet(BuildContext context, Widget child, int index) {
    setState(() => _activeBottomSheetIndex = index);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Padding(
        padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 40),
        child: ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          child: Container(
            color: Theme.of(context).scaffoldBackgroundColor,
            child: child,
          ),
        ),
      ),
    ).then((_) {
      if (mounted && _activeBottomSheetIndex == index) {
        setState(() => _activeBottomSheetIndex = null);
      }
    });
  }

  Widget _buildNavItem(BuildContext context, int index, int currentIndex, IconData icon, String label, Widget view, {String? badgeText, VoidCallback? onTapOverride}) {
    final isSelected = index == currentIndex;
    
    Widget iconWidget = Icon(
      icon,
      size: 22,
      color: isSelected ? AppTheme.teacherTheme.colors.first : const Color(0xFFB5B0C4),
    );

    if (badgeText != null) {
      iconWidget = Stack(
        clipBehavior: Clip.none,
        children: [
          iconWidget,
          Positioned(
            top: -4,
            right: -6,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
              decoration: BoxDecoration(
                color: const Color(0xFFFF3264),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.white, width: 1.5),
                boxShadow: [
                  BoxShadow(color: const Color(0xFFFF3264).withOpacity(0.35), blurRadius: 4, offset: const Offset(0, 2)),
                ],
              ),
              child: Text(
                badgeText,
                style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.white),
              ),
            ),
          ),
        ],
      );
    }

    return GestureDetector(
      onTap: onTapOverride ?? () {
        if (index == 0) {
          setState(() => _activeBottomSheetIndex = null);
          context.go('/dashboard');
        } else {
          _showBottomSheet(context, view, index);
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 7, horizontal: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.teacherTheme.colors.first.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            iconWidget,
            const SizedBox(height: 3),
            Text(
              label.toUpperCase(),
              style: TextStyle(
                fontFamily: 'Satoshi',
                fontSize: 9.5,
                fontWeight: FontWeight.w800,
                color: isSelected ? AppTheme.teacherTheme.colors.first : const Color(0xFFB5B0C4),
                letterSpacing: 0.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showInAppPrompt(BuildContext context, SchoolAlert alert) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: Colors.transparent,
        elevation: 0,
        content: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: alert.severity == AlertSeverity.critical 
              ? const Color(0xFFDC2626) 
              : const Color(0xFF1E1B4B),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 15,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  alert.severity == AlertSeverity.warning ? Icons.warning_rounded : Icons.notifications_active_rounded,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      alert.title,
                      style: const TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      alert.message,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
