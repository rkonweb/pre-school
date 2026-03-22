import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/state/auth_state.dart';
import '../../shared/components/all_modules_overlay.dart';
import '../../shared/components/module_popup_shell.dart';
import '../../shared/components/floating_shapes_background.dart';
import '../../core/state/alert_state.dart';
import '../../core/services/alert_engine.dart';
import '../../core/services/biometric_service.dart';
import '../auth/biometric_lock_screen.dart';
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

class _AppShellState extends ConsumerState<AppShell> with WidgetsBindingObserver {
  int? _activeBottomSheetIndex;
  BiometricService? _biometricSvc; // cached so we never call ref after dispose

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initBiometricState();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  Future<void> _initBiometricState() async {
    _biometricSvc = ref.read(biometricServiceProvider);
    final enabled = await _biometricSvc!.isEnabled();
    if (mounted) ref.read(biometricEnabledProvider.notifier).state = enabled;
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final svc = _biometricSvc;
    if (svc == null) return; // not yet initialised
    if (state == AppLifecycleState.resumed) {
      _checkSessionOnResume(svc);
    } else if (state == AppLifecycleState.paused ||
               state == AppLifecycleState.inactive) {
      svc.recordActivity();
    }
  }

  Future<void> _checkSessionOnResume(BiometricService svc) async {
    final enabled = await svc.isEnabled();
    if (!enabled || !mounted) return;
    final expired = await svc.isSessionExpired();
    if (expired && mounted) {
      ref.read(appLockedProvider.notifier).state = true;
    }
  }

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

    return Listener(
      // Record activity on any touch so the 15-min timeout resets
      onPointerDown: (_) => ref.read(biometricServiceProvider).recordActivity(),
      child: Consumer(
        builder: (context, ref, _) {
          final isLocked = ref.watch(appLockedProvider);
          return Stack(
            children: [
              Scaffold(
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
                              _buildStatBar(context, ref, location),
                            Expanded(child: widget.child),
                            _buildBotNav(context, currentIndex, ref),
                          ],
                        ),
                      ),
                    ),
                    // ── Animated blur overlay (blurs dashboard before popup opens) ──
                    Positioned.fill(
                      child: IgnorePointer(
                        child: ValueListenableBuilder<bool>(
                          valueListenable: dashboardBlurNotifier,
                          builder: (_, isBlurred, __) => TweenAnimationBuilder<double>(
                            tween: Tween(end: isBlurred ? 14.0 : 0.0),
                            duration: const Duration(milliseconds: 220),
                            curve: Curves.easeOut,
                            builder: (_, sigma, __) {
                              if (sigma < 0.1) return const SizedBox.expand();
                              return BackdropFilter(
                                filter: ImageFilter.blur(sigmaX: sigma, sigmaY: sigma),
                                child: Container(
                                  color: Colors.black.withOpacity(0.18 * (sigma / 14.0)),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    ),
                    // ── Animated All Modules FAB ──
                    Positioned(
                      bottom: 30, left: 0, right: 0,
                      child: Center(
                        child: _AllModulesFAB(
                          onTap: () => showAllModulesMenu(context),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Biometric Lock Screen overlay
              if (isLocked)
                const BiometricLockScreen(),
            ],
          );
        },
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
    showModulePopup(context, child).then((_) {
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

// ─── Animated All Modules FAB ─────────────────────────────────────────────────
class _AllModulesFAB extends StatefulWidget {
  final VoidCallback onTap;
  const _AllModulesFAB({required this.onTap});

  @override
  State<_AllModulesFAB> createState() => _AllModulesFABState();
}

class _AllModulesFABState extends State<_AllModulesFAB>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _scale;
  late final Animation<double> _glowSize;
  late final Animation<double> _glowOpacity;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );

    // Button shrinks to 0.87 then bounces back to 1.05 then settles at 1.0
    _scale = TweenSequence([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.87).chain(CurveTween(curve: Curves.easeOut)), weight: 35),
      TweenSequenceItem(tween: Tween(begin: 0.87, end: 1.08).chain(CurveTween(curve: Curves.easeOut)), weight: 40),
      TweenSequenceItem(tween: Tween(begin: 1.08, end: 1.0).chain(CurveTween(curve: Curves.easeOut)), weight: 25),
    ]).animate(_ctrl);

    // Glow ring expands from 56→90px
    _glowSize = Tween(begin: 56.0, end: 90.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOut),
    );

    // Glow ring fades in then out
    _glowOpacity = TweenSequence([
      TweenSequenceItem(tween: Tween(begin: 0.0, end: 0.55), weight: 30),
      TweenSequenceItem(tween: Tween(begin: 0.55, end: 0.0), weight: 70),
    ]).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _handleTap() async {
    dashboardBlurNotifier.value = true;  // blur immediately on tap — before animation
    HapticFeedback.mediumImpact();
    await _ctrl.forward(from: 0); // wait for full 300ms bounce animation
    widget.onTap();               // open popup (blur is already set)
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _handleTap,
      child: AnimatedBuilder(
        animation: _ctrl,
        builder: (_, __) => SizedBox(
          width: 90, height: 90,
          child: Stack(alignment: Alignment.center, children: [
            // ── Expanding glow ring ──
            Opacity(
              opacity: _glowOpacity.value,
              child: Container(
                width: _glowSize.value,
                height: _glowSize.value,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular((_glowSize.value / 56) * 20),
                  gradient: AppTheme.teacherTheme,
                ),
              ),
            ),
            // ── FAB ──
            Transform.scale(
              scale: _scale.value,
              child: Container(
                width: 56, height: 56,
                decoration: BoxDecoration(
                  gradient: AppTheme.teacherTheme,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.22),
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
          ]),
        ),
      ),
    );
  }
}
