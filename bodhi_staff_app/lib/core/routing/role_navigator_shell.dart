import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/school_brand_provider.dart';
import '../../core/routing/rbac.dart';

/// The Main Shell for the application. Renders dynamic tabs based on Staff role.
class RoleNavigatorShell extends ConsumerWidget {
  final Widget child;

  const RoleNavigatorShell({Key? key, required this.child}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rbac = ref.watch(rbacProvider);
    final brand = ref.watch(schoolBrandProvider);

    // 1. Build the list of allowed tabs dynamically
    final List<_NavigationTab> tabs = [];

    if (rbac.hasAnyPermission(tabPermissionsMapper['HomeTab']!)) {
      tabs.add(_NavigationTab(
        label: 'Home',
        icon: Icons.home_rounded,
        route: '/home',
      ));
    }

    tabs.add(_NavigationTab(
      label: 'Today',
      icon: Icons.calendar_today_rounded,
      route: '/today',
    ));
    
    if (rbac.hasAnyPermission(tabPermissionsMapper['AttendanceTab']!)) {
      tabs.add(_NavigationTab(
        label: 'Attendance',
        icon: Icons.how_to_reg_rounded,
        route: '/attendance',
      ));
    }

    // Actions Tab (Opens Command Palette directly on tap, no actual route)
    tabs.add(_NavigationTab(
      label: 'Actions',
      icon: Icons.flash_on_rounded, // Center prominent action
      route: '#actions', // Special marker
      isAction: true,
    ));

    if (rbac.hasAnyPermission(tabPermissionsMapper['MessagesTab']!)) {
      tabs.add(_NavigationTab(
        label: 'Inbox',
        icon: Icons.inbox_rounded,
        route: '/inbox',
      ));
    }

    if (rbac.hasAnyPermission(tabPermissionsMapper['ProfileTab']!)) {
      tabs.add(_NavigationTab(
        label: 'Profile',
        icon: Icons.person_rounded,
        route: '/profile',
      ));
    }

    // Fallback if no permissions loaded yet (e.g. Guest)
    if (tabs.isEmpty)
      return const Scaffold(body: Center(child: CircularProgressIndicator()));

    // 2. Determine Current Index based on URL
    final String location = GoRouterState.of(context).uri.toString();
    int currentIndex = tabs.indexWhere((t) => location.startsWith(t.route));
    if (currentIndex == -1) currentIndex = 0; // Default

    return Scaffold(
      body: child, // The Nested GoRouter Navigator
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppTheme.surface,
          boxShadow: [
            BoxShadow(
              color: AppTheme.textPrimary.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -4),
            )
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(
                horizontal: AppTheme.s8, vertical: AppTheme.s8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(tabs.length, (index) {
                final tab = tabs[index];
                final isSelected = index == currentIndex;

                if (tab.isAction) {
                  return _buildActionTabButton(context, brand);
                }

                return _buildTabButton(context, tab, isSelected, brand);
              }),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTabButton(
      BuildContext context, _NavigationTab tab, bool isSelected, SchoolBrandState brand) {
    return InkWell(
      onTap: () => context.go(tab.route),
      borderRadius: AppTheme.radiusMedium,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? AppTheme.s16 : AppTheme.s8,
          vertical: AppTheme.s8,
        ),
        decoration: BoxDecoration(
          color: isSelected
              ? brand.primaryColor.withOpacity(0.1)
              : Colors.transparent,
          borderRadius: AppTheme.radiusMedium,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              tab.icon,
              color: isSelected ? brand.primaryColor : AppTheme.textMuted,
              size: 24,
            ),
            const SizedBox(height: 2),
            Text(
              tab.label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? brand.primaryColor : AppTheme.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionTabButton(BuildContext context, SchoolBrandState brand) {
    return FloatingActionButton(
      onPressed: () {},
      elevation: 0,
      backgroundColor: brand.primaryColor,
      child: const Icon(Icons.flash_on_rounded, color: Colors.white, size: 28),
    );
  }
}

class _NavigationTab {
  final String label;
  final IconData icon;
  final String route;
  final bool isAction;

  _NavigationTab({
    required this.label,
    required this.icon,
    required this.route,
    this.isAction = false,
  });
}
