import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/components/quick_action_grid.dart';
import '../../shared/components/custom_list_item.dart';
import '../../shared/components/stat_tile.dart';
import '../../shared/components/notice_card.dart';
import '../../shared/components/all_modules_overlay.dart';
import '../../core/state/auth_state.dart';
import '../../core/registry/module_registry.dart';
import '../../core/state/quick_actions_provider.dart';
import '../../shared/components/customise_quick_actions_sheet.dart';
import '../../shared/components/admin_fee_hero.dart';

class AdminDashboardView extends ConsumerWidget {
  const AdminDashboardView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Onboarding Hint for first-time Admin login
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!ref.read(hasSeenAdminHintProvider)) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('New: Access all 25+ school modules via the "All Modules" quick action or bottom bar!'),
            action: SnackBarAction(label: 'GOT IT', textColor: Colors.white, onPressed: () {}),
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.only(bottom: 100, left: 20, right: 20), // Above bottom nav
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        ref.read(hasSeenAdminHintProvider.notifier).state = true;
      }
      ref.read(quickActionsProvider.notifier).loadDefaultsForRole('ADMIN');
    });

    final activeQuickActionKeys = ref.watch(quickActionsProvider);
    final allModulesMap = {for (var m in ModuleRegistry.allModules) m.key: m};

    return ListView(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 100), // Extra bottom padding for FAB/Nav
        children: [
          // ── Fee Collection Hero ─────────────────────────────────────────────
          const Padding(
            padding: EdgeInsets.only(bottom: 24),
            child: AdminFeeHero(),
          ),

          // ── School Overview Metrics ──────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Text(
              'School Overview',
              style: const TextStyle(
                fontFamily: 'Cabinet Grotesk',
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: Color(0xFF140E28),
                letterSpacing: -0.3,
              ),
            ),
          ),
          Row(
            children: [
              Expanded(
                child: StatTile(
                  icon: Icons.people_alt_rounded,
                  numText: '1,240',
                  label: 'Students',
                  chText: '↑ 12 this month',
                  chColor: const Color(0xFF16A34A),
                  hoverGradient: AppTheme.adminTheme,
                  iconGradient: AppTheme.iconAttend,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: StatTile(
                  icon: Icons.payments_rounded,
                  numText: '₹14.2L',
                  label: 'Collection',
                  chText: '82% of target',
                  chColor: const Color(0xFFF59E0B),
                  hoverGradient: AppTheme.adminTheme,
                  iconGradient: AppTheme.iconMarks,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // ── Admin Quick Actions ──────────────────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Quick Actions',
                style: const TextStyle(
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
                    color: AppTheme.adminTheme.colors.first,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          QuickActionGrid(
            onReorder: (oldIndex, newIndex) {
              if (oldIndex == 0 || newIndex == 0) return;
              final actualOld = oldIndex - 1;
              final actualNew = newIndex - 1;
              
              final activeKeys = activeQuickActionKeys.where((k) => allModulesMap.containsKey(k)).toList();
                  
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
                iconGradient: AppTheme.teacherTheme, // Standout gradient
                onTap: () => showAllModulesMenu(context),
                isDraggable: false,
              ),
              ...activeQuickActionKeys.where((k) => allModulesMap.containsKey(k)).map((key) {
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
                      context.push(module.route);
                    }
                  },
                );
              }),
            ],
          ),
          const SizedBox(height: 32),

          // ── School Happenings (Alert Feed) ───────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'School Happenings',
                style: const TextStyle(
                  fontFamily: 'Cabinet Grotesk',
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF140E28),
                  letterSpacing: -0.3,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text(
                  '3 NEW',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFFEF4444)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildHappeningsFeed(),
        ],
    );
  }

  Widget _buildHappeningsFeed() {
    return Column(
      children: [
        CustomListItem(
          title: 'High Staff Absenteeism',
          subtitle: '8 staff members are on leave today. Review substitution plan.',
          time: '15 mins ago',
          icon: Icons.warning_amber_rounded,
          themeGradient: AppTheme.iconMarks,
          onTap: () {},
        ),
        const SizedBox(height: 12),
        CustomListItem(
          title: 'New Admission Inquiry',
          subtitle: 'Parent of "Rahul S" (Grade 2) submitted a new inquiry.',
          time: '1 hr ago',
          icon: Icons.person_add_rounded,
          themeGradient: AppTheme.iconAttend,
          onTap: () {},
        ),
        const SizedBox(height: 12),
        CustomListItem(
          title: 'Fee Collection Milestone',
          subtitle: 'Daily target of ₹50,000 reached. Collection: ₹54,200.',
          time: '3 hrs ago',
          icon: Icons.stars_rounded,
          themeGradient: AppTheme.iconAttend,
          onTap: () {},
        ),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () {},
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('VIEW ALL ACTIVITY', style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF7B7291))),
              SizedBox(width: 4),
              Icon(Icons.arrow_forward_ios_rounded, size: 10, color: Color(0xFF7B7291)),
            ],
          ),
        ),
      ],
    );
  }
}
