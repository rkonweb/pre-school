import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/components/quick_action_grid.dart';
import '../../shared/components/stat_tile.dart';
import '../../shared/components/period_chip.dart';
import '../../shared/components/class_attendance_hero.dart';
import '../../shared/components/pending_assignments_card.dart';
import '../../shared/components/notice_card.dart';
import '../circular/circular_provider.dart';
import '../../core/registry/module_registry.dart';
import '../../core/state/quick_actions_provider.dart';
import '../../core/state/auth_state.dart';
import '../../shared/components/all_modules_overlay.dart';
import '../../shared/components/customise_quick_actions_sheet.dart';
import '../schedule/teacher_schedule_view.dart';
import '../attendance/teacher_attendance_view.dart';
import '../profile/teacher_profile_view.dart';
import '../attendance/self_attendance_view.dart';
import '../diary/teacher_diary_view.dart';
import '../homework/teacher_homework_view.dart';
import '../leave/teacher_leave_view.dart';
import '../../shared/components/module_popup_shell.dart';
import '../ptm/staff_ptm_view.dart';
import '../circular/circular_list_view.dart';
import '../calendar/teacher_calendar_view.dart';
import '../library/staff_library_view.dart';
import '../../shared/components/birthday_section.dart';

// Placeholder empty views
Widget _mockView(String title) => Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text('Popup View for $title')),
    );

final hasSeenTeacherHintProvider = StateProvider<bool>((ref) => false);

class TeacherDashboardView extends ConsumerStatefulWidget {
  const TeacherDashboardView({super.key});
  @override
  ConsumerState<TeacherDashboardView> createState() => _TeacherDashboardViewState();
}

class _TeacherDashboardViewState extends ConsumerState<TeacherDashboardView> {
  OverlayEntry? _hintEntry;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!ref.read(hasSeenTeacherHintProvider)) {
        ref.read(hasSeenTeacherHintProvider.notifier).state = true;
        _showHintBanner();
      }
      ref.read(quickActionsProvider.notifier).loadDefaultsForRole('TEACHER');
    });
  }

  void _showHintBanner() {
    _hintEntry = OverlayEntry(
      builder: (_) => _HintBanner(onDismiss: _dismissHintBanner),
    );
    Overlay.of(context).insert(_hintEntry!);
  }

  void _dismissHintBanner() {
    _hintEntry?.remove();
    _hintEntry = null;
  }

  @override
  void dispose() {
    _hintEntry?.remove();
    _hintEntry = null;
    super.dispose();
  }

  void _showAllModulesMenu(BuildContext context) {
    showAllModulesMenu(context);
  }

  void _handleNavigation(BuildContext context, String route) {
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
      case '/circular':
        targetView = const CircularListView();
        break;
      case '/calendar':
        targetView = const TeacherCalendarView();
        break;
      case '/library':
        targetView = const StaffLibraryView();
        break;
      default:
        context.push(route);
        return;
    }

    if (targetView != null) {
      showModulePopup(context, targetView);
    }
  }

  bool _canAccessModule(String moduleKey, UserProfile? user, String activeRole) {
    if (user == null) return false;
    final role = activeRole.toUpperCase();
    if (role == 'ADMIN' || role == 'SUPER_ADMIN') return true;
    
    if (user.permissions.isEmpty) {
      if (role == 'TEACHER' || role == 'STAFF') {
        const teacherModules = ['dashboard', 'attendance', 'self_attendance', 'homework', 'schedule', 'communication', 'leave', 'diary', 'ptm', 'calendar', 'library'];
        return teacherModules.contains(moduleKey);
      }
      if (role == 'DRIVER') {
        const driverModules = ['dashboard', 'transport', 'communication', 'leave'];
        return driverModules.contains(moduleKey);
      }
      return ['dashboard', 'leave', 'communication'].contains(moduleKey);
    }
    
    return user.permissions.any((p) => p.startsWith('$moduleKey.'));
  }

  List<Widget> _buildTodaysPeriods(Map<String, dynamic> data) {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    final dayName = dayNames[DateTime.now().weekday - 1];
    
    final mySchedule = (data['mySchedule'] as Map?)?.map((k, v) => MapEntry(k.toString(), v)) ?? {};
    final rawPeriods = mySchedule[dayName] as List? ?? [];
    
    if (rawPeriods.isEmpty) {
      return const [
        Center(child: Text("No periods scheduled for today.", style: TextStyle(color: Color(0xFF7B7291), fontSize: 13, fontFamily: 'Satoshi')))
      ];
    }

    final periods = rawPeriods.where((p) => (p['type'] ?? 'CLASS') != 'BREAK').toList();
    if (periods.isEmpty) {
      return const [
        Center(child: Text("No active classes today.", style: TextStyle(color: Color(0xFF7B7291), fontSize: 13, fontFamily: 'Satoshi')))
      ];
    }

    int mins(String t) {
      if (t.isEmpty) return 0;
      final parts = t.split(':');
      return int.parse(parts[0]) * 60 + (parts.length > 1 ? int.parse(parts[1]) : 0);
    }
    
    String fmtTime(String t) {
      if (t.isEmpty) return '';
      final parts = t.split(':');
      final h = int.parse(parts[0]);
      final m = parts.length > 1 ? int.parse(parts[1]) : 0;
      final suffix = h >= 12 ? 'pm' : 'am';
      final h12 = h > 12 ? h - 12 : (h == 0 ? 12 : h);
      return '$h12:${m.toString().padLeft(2, '0')}$suffix';
    }

    final now = DateTime.now();
    final curMin = now.hour * 60 + now.minute;
    
    List<Widget> chips = [];
    bool foundLive = false;
    bool foundNext = false;

    for (var i = 0; i < periods.length; i++) {
        final m = Map<String, dynamic>.from(periods[i] as Map);
        final start = (m['startTime'] ?? m['start'] ?? '') as String;
        final end   = (m['endTime']   ?? m['end']   ?? '') as String;
        final st = mins(start);
        final en = mins(end);
        
        final subj = ((m['subject'] ?? '') as String).trim();
        final cls  = ((m['className'] ?? m['class'] ?? '') as String).trim();
        
        PeriodStatus status = PeriodStatus.later;
        if (curMin >= en) {
            status = PeriodStatus.done;
        } else if (curMin >= st && curMin < en) {
            status = PeriodStatus.active;
            foundLive = true;
        } else if (curMin < st && !foundNext) {
            status = PeriodStatus.next;
            foundNext = true;
        }
        
        chips.add(PeriodChip(
            subject: subj.isEmpty ? 'Free' : subj, 
            className: cls.isEmpty ? '--' : cls,
            time: '${fmtTime(start)}–${fmtTime(end)}',
            status: status
        ));
        
        if (i < periods.length - 1) {
            chips.add(const SizedBox(width: 10));
        }
    }
    
    return chips;
  }

  @override
  Widget build(BuildContext context) {
    final activeQuickActionKeys = ref.watch(quickActionsProvider);
    final allModulesMap = {for (var m in ModuleRegistry.allModules) m.key: m};
    final user = ref.watch(userProfileProvider);
    final activeRole = ref.watch(activeRoleProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // ── Today's Attendance (TOP) ─────────────────────────────────────────
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Today's Attendance",
                style: TextStyle(
                  fontFamily: 'Cabinet Grotesk',
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF140E28),
                  letterSpacing: -0.3,
                ),
              ),
              Consumer(builder: (_, ref, __) => GestureDetector(
                onTap: () => ref.invalidate(classAttendanceProvider),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.teacherTheme.colors.first.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.refresh_rounded, size: 11, color: AppTheme.teacherTheme.colors.first),
                      const SizedBox(width: 4),
                      Text('Refresh',
                        style: TextStyle(
                          fontFamily: 'Satoshi', fontSize: 11.5, fontWeight: FontWeight.w700,
                          color: AppTheme.teacherTheme.colors.first,
                        )),
                    ],
                  ),
                ),
              )),
            ],
          ),
        ),
        const ClassAttendanceHero(),
        const SizedBox(height: 18),

        // ── Stat Tiles ───────────────────────────────────────────────────────
        Row(
          children: [
            Expanded(
              child: const StatTile(
                icon: Icons.access_time_rounded,
                numText: '6',
                label: 'Periods',
                chText: 'Today',
                chColor: Color(0xFFFF5733),
                hoverGradient: AppTheme.teacherTheme,
                iconGradient: AppTheme.iconSchedule,

              ),
            ),
            const SizedBox(width: 9),
            Expanded(
              child: const StatTile(
                icon: Icons.error_outline_rounded,
                numText: '3',
                label: 'Pending',
                chText: 'Homework',
                chColor: Color(0xFFF59E0B),
                hoverGradient: AppTheme.teacherTheme,
                iconGradient: AppTheme.iconHomework,
              ),
            ),
            const SizedBox(width: 9),
            Expanded(
              child: const StatTile(
                icon: Icons.star_outline_rounded,
                numText: '74%',
                label: 'Avg Score',
                chText: '↑ 3.1%',
                chColor: Color(0xFF16A34A),
                hoverGradient: AppTheme.teacherTheme,
                iconGradient: AppTheme.iconAttend,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Section header Quick Actions
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Quick Actions',
                style: TextStyle(
                  fontFamily: 'Cabinet Grotesk',
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF140E28),
                  letterSpacing: -0.3,
                ),
              ),
              GestureDetector(
                onTap: () => CustomiseQuickActionsSheet.show(context),
                child: Text(
                  'Customise',
                  style: TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.teacherTheme.colors.first,
                  ),
                ),
              ),
            ],
          ),
        ),
        
        QuickActionGrid(
          onReorder: (oldIndex, newIndex) {
            if (oldIndex == 0 || newIndex == 0) return;
            final actualOld = oldIndex - 1;
            final actualNew = newIndex - 1;
            
            final activeKeys = activeQuickActionKeys
                .where((k) => allModulesMap.containsKey(k) && _canAccessModule(k, user, activeRole))
                .toList();
                
            final keys = List<String>.from(ref.read(quickActionsProvider));
            
            if (actualOld >= 0 && actualOld < activeKeys.length && actualNew >= 0 && actualNew < activeKeys.length) {
                final oldKey = activeKeys[actualOld];
                final newKey = activeKeys[actualNew];
                
                final realOld = keys.indexOf(oldKey);
                final realNew = keys.indexOf(newKey);
                
                if (realOld != -1 && realNew != -1) {
                  final temp = keys[realOld];
                  keys[realOld] = keys[realNew];
                  keys[realNew] = temp;
                  ref.read(quickActionsProvider.notifier).saveActions(keys);
                }
            }
          },
          actions: [
            QuickActionItem(
              label: 'All Modules',
              icon: Icons.apps_rounded,
              baseColor: const Color(0xFF140E28),
              iconGradient: AppTheme.teacherTheme,
              onTap: () => _showAllModulesMenu(context),
              isDraggable: false,
            ),
            ...activeQuickActionKeys
              .where((k) => allModulesMap.containsKey(k) && _canAccessModule(k, user, activeRole))
              .map((key) {
              final module = allModulesMap[key]!;
              return QuickActionItem(
                label: module.label,
                icon: module.icon,
                baseColor: const Color(0xFF140E28),
                iconGradient: LinearGradient(
                  colors: [module.color.withOpacity(0.5), module.color],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                onTap: () {
                  if (module.route.isNotEmpty) {
                    _handleNavigation(context, module.route);
                  }
                },
              );
            }),
          ],
        ),

        const SizedBox(height: 18),

        // ── 🎂 Today's Birthdays ────────────────────────────────────────────
        const BirthdaySection(),

        const SizedBox(height: 18),

        // Section header Today's Timetable
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              "Today's Timetable",
              style: TextStyle(
                fontFamily: 'Cabinet Grotesk',
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: Color(0xFF140E28),
                letterSpacing: -0.3,
              ),
            ),
            TextButton(
              style: TextButton.styleFrom(
                backgroundColor: AppTheme.teacherTheme.colors.first.withOpacity(0.05),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              onPressed: () => _handleNavigation(context, '/timetable'),
              child: Text(
                'View all',
                style: TextStyle(
                  fontFamily: 'Satoshi',
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.teacherTheme.colors.first,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        
        // Horizontal Scroll for Periods linked to the provider
        SizedBox(
          height: 140, // Increased to 140px to solve overflow Renderflex bounds.
          child: Consumer(builder: (context, ref, _) {
            final activeSchedule = ref.watch(scheduleDataProvider);
            return activeSchedule.when(
              data: (data) => ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.only(bottom: 14),
                children: _buildTodaysPeriods(data),
              ),
              loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFFF5733))),
              error: (e, st) => const Center(child: Text('Failed to load schedule', style: TextStyle(color: Colors.red))),
            );
          }),
        ),

        const SizedBox(height: 18),

        // Assignments Header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Pending Assignments',
                style: TextStyle(
                  fontFamily: 'Cabinet Grotesk',
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF140E28),
                  letterSpacing: -0.3,
                ),
              ),
              TextButton(
                style: TextButton.styleFrom(
                  backgroundColor: AppTheme.teacherTheme.colors.first.withOpacity(0.05),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                onPressed: () {},
                child: Text(
                  'All 3',
                  style: TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 11.5,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.teacherTheme.colors.first,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        const PendingAssignmentsCard(),
        const SizedBox(height: 18),

        // Notices Header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Notices',
                style: TextStyle(
                  fontFamily: 'Cabinet Grotesk',
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF140E28),
                  letterSpacing: -0.3,
                ),
              ),
              TextButton(
                style: TextButton.styleFrom(
                  backgroundColor: AppTheme.teacherTheme.colors.first.withOpacity(0.05),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                onPressed: () {},
                child: Text(
                  'View all',
                  style: TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 11.5,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.teacherTheme.colors.first,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Consumer(builder: (context, ref, child) {
          final circularsAsync = ref.watch(recentCircularsProvider);
          return circularsAsync.when(
            data: (circulars) {
              if (circulars.isEmpty) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Text('No recent circulars', 
                      style: TextStyle(fontFamily: 'Satoshi', fontSize: 13, color: Color(0xFF64748B))),
                  ),
                );
              }
              return Column(
                children: circulars.map((c) => NoticeCard(
                  title: c.title,
                  date: c.publishedAt != null ? _formatDate(c.publishedAt!) : 'Recently',
                  body: c.subject ?? c.content ?? '',
                  icon: c.priority == 'URGENT' ? Icons.priority_high_rounded : Icons.notifications_none_rounded,
                  iconColor: c.priority == 'URGENT' ? const Color(0xFFEF4444) : const Color(0xFF7C3AED),
                  borderColor: c.priority == 'URGENT' ? const Color(0xFFEF4444) : const Color(0xFFFF5733),
                )).toList(),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => Center(child: Text('Error: $err')),
          );
        }),
        const SizedBox(height: 16),
      ],
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inDays == 0) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    return '${date.day}/${date.month}';
  }
}

// ─── Animated hint banner (slide-up appear, slide-down dismiss) ─────────────
class _HintBanner extends StatefulWidget {
  final VoidCallback onDismiss;
  const _HintBanner({required this.onDismiss});
  @override
  State<_HintBanner> createState() => _HintBannerState();
}

class _HintBannerState extends State<_HintBanner> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<Offset> _slide;
  late final Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 420));
    _slide = Tween<Offset>(begin: const Offset(0, 1.5), end: Offset.zero)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));
    _fade = Tween<double>(begin: 0, end: 1)
        .animate(CurvedAnimation(parent: _ctrl, curve: const Interval(0, 0.5)));
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _dismiss() async {
    await _ctrl.animateTo(
      0,
      duration: const Duration(milliseconds: 360),
      curve: Curves.easeInCubic,
    );
    widget.onDismiss();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: 16,
      right: 16,
      bottom: MediaQuery.of(context).padding.bottom + 20,
      child: SlideTransition(
        position: _slide,
        child: FadeTransition(
          opacity: _fade,
          child: Material(
            color: Colors.transparent,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFF5733), Color(0xFFFF006E), Color(0xFFC77DFF)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFFF5733).withOpacity(0.4),
                    blurRadius: 28,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Row(children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.apps_rounded, color: Colors.white, size: 22),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Tip: Use "All Modules" to access everything quickly!',
                    style: TextStyle(
                      fontFamily: 'Satoshi',
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      height: 1.35,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: _dismiss,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(11),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8, offset: const Offset(0, 2)),
                      ],
                    ),
                    child: const Text(
                      'GOT IT',
                      style: TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFFFF5733),
                        letterSpacing: 0.6,
                      ),
                    ),
                  ),
                ),
              ]),
            ),
          ),
        ),
      ),
    );
  }
}
