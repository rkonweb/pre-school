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
import '../../shared/components/all_modules_overlay.dart';
import '../../shared/components/customise_quick_actions_sheet.dart';

final hasSeenTeacherHintProvider = StateProvider<bool>((ref) => false);

class TeacherDashboardView extends ConsumerWidget {
  const TeacherDashboardView({super.key});

  void _showAllModulesMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const AllModulesOverlay(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!ref.read(hasSeenTeacherHintProvider)) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('New: Access all your modules easily via "All Modules" quick action!'),
            action: SnackBarAction(label: 'GOT IT', textColor: Colors.white, onPressed: () {}),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        ref.read(hasSeenTeacherHintProvider.notifier).state = true;
      }
      ref.read(quickActionsProvider.notifier).loadDefaultsForRole('TEACHER');
    });

    final activeQuickActionKeys = ref.watch(quickActionsProvider);
    final allModulesMap = {for (var m in ModuleRegistry.allModules) m.key: m};

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // ── Today's Attendance (TOP) ─────────────────────────────────────────
        Padding(
          padding: const EdgeInsets.fromLTRB(18, 0, 18, 8),
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
                    color: AppTheme.teacherTheme.colors.first.withValues(alpha: 0.08),
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
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Expanded(
                child: StatTile(
                  icon: Icons.access_time_rounded,
                  numText: '6',
                  label: 'Periods',
                  chText: 'Today',
                  chColor: Color(0xFFFF5733),
                  hoverGradient: AppTheme.teacherTheme,
                  iconGradient: AppTheme.iconSchedule,
                ),
              ),
              SizedBox(width: 9),
              Expanded(
                child: StatTile(
                  icon: Icons.error_outline_rounded,
                  numText: '3',
                  label: 'Pending',
                  chText: 'Homework',
                  chColor: Color(0xFFF59E0B),
                  hoverGradient: AppTheme.teacherTheme,
                  iconGradient: AppTheme.iconHomework,
                ),
              ),
              SizedBox(width: 9),
              Expanded(
                child: StatTile(
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
        ),
        const SizedBox(height: 14),

        // Section header Quick Actions
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
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
          actions: [
            QuickActionItem(
              label: 'All Modules',
              icon: Icons.apps_rounded,
              baseColor: const Color(0xFF140E28),
              iconGradient: AppTheme.teacherTheme,
              onTap: () => _showAllModulesMenu(context),
            ),
            ...activeQuickActionKeys.where((k) => allModulesMap.containsKey(k)).map((key) {
              final module = allModulesMap[key]!;
              return QuickActionItem(
                label: module.label,
                icon: module.icon,
                baseColor: const Color(0xFF140E28),
                iconGradient: LinearGradient(
                  colors: [module.color.withValues(alpha: 0.5), module.color],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                onTap: () {
                  if (module.route.isNotEmpty) {
                    context.push(module.route);
                  }
                },
              );
            }),
          ],
        ),
        
        const SizedBox(height: 18),
        // Section header Today's Timetable
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18),
          child: Row(
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
                  backgroundColor: AppTheme.teacherTheme.colors.first.withValues(alpha: 0.05),
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
        
        // Horizontal Scroll for Periods
        SizedBox(
          height: 130,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
            children: const [
              PeriodChip(subject: 'Maths', className: '7-B', time: '8:00–8:45', status: PeriodStatus.done),
              SizedBox(width: 10),
              PeriodChip(subject: 'Maths', className: '6-A', time: '8:45–9:30', status: PeriodStatus.done),
              SizedBox(width: 10),
              PeriodChip(subject: 'Maths', className: '8-A', time: '9:30–10:15', status: PeriodStatus.active),
              SizedBox(width: 10),
              PeriodChip(subject: 'Maths', className: '9-C', time: '10:30–11:15', status: PeriodStatus.next),
              SizedBox(width: 10),
              PeriodChip(subject: 'Maths', className: '10-A', time: '11:15–12:00', status: PeriodStatus.later),
            ],
          ),
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
                  backgroundColor: AppTheme.teacherTheme.colors.first.withValues(alpha: 0.05),
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
                  backgroundColor: AppTheme.teacherTheme.colors.first.withValues(alpha: 0.05),
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
