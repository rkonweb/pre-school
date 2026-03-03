import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/school_brand_provider.dart';
import '../../core/routing/rbac.dart';
import '../../ui/components/app_drawer.dart';
import 'drawer_provider.dart';
import 'package:bodhi_staff_app/core/routing/navigation_tab_model.dart';
import 'custom_footer_provider.dart';

/// The Main Shell for the application. Renders dynamic tabs based on Staff role.
class RoleNavigatorShell extends ConsumerWidget {
  final Widget child;

  const RoleNavigatorShell({Key? key, required this.child}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rbac = ref.watch(rbacProvider);
    final brand = ref.watch(schoolBrandProvider);
    final scaffoldKey = ref.watch(shellScaffoldKeyProvider);

    // 1. Build the list of default allowed tabs dynamically
    final List<NavigationTabModel> defaultTabs = [];

    if (rbac.hasAnyPermission(tabPermissionsMapper['HomeTab']!)) {
      defaultTabs.add(NavigationTabModel(
        label: 'Home',
        icon: Icons.home_rounded,
        route: '/home',
      ));
    }

    defaultTabs.add(NavigationTabModel(
      label: 'Today',
      icon: Icons.calendar_today_rounded,
      route: '/today',
    ));
    
    if (rbac.hasAnyPermission(tabPermissionsMapper['AttendanceTab']!)) {
      defaultTabs.add(NavigationTabModel(
        label: 'Attendance',
        icon: Icons.how_to_reg_rounded,
        route: '/attendance',
      ));
    }

    // Actions Tab (Opens Command Palette directly on tap, no actual route)
    defaultTabs.add(NavigationTabModel(
      label: 'Actions',
      icon: Icons.flash_on_rounded, // Center prominent action
      route: '#actions', // Special marker
      isAction: true,
    ));

    if (rbac.hasAnyPermission(tabPermissionsMapper['MessagesTab']!)) {
      defaultTabs.add(NavigationTabModel(
        label: 'Inbox',
        icon: Icons.inbox_rounded,
        route: '/inbox',
      ));
    }

    // 2. Fetch custom tabs if any, fallback to defaultTabs
    final List<NavigationTabModel> customTabs = ref.watch(customFooterProvider);
    final customFooterNotifier = ref.watch(customFooterProvider.notifier);
    
    // Set initial defaults if provider is loaded but empty and hasn't saved custom tabs
    if (customFooterNotifier.isLoaded && !customFooterNotifier.hasCustomTabs && customTabs.isEmpty && defaultTabs.isNotEmpty) {
      Future.microtask(() {
        if (context.mounted) {
          ref.read(customFooterProvider.notifier).setInitialDefaultTabsIfEmpty(defaultTabs);
        }
      });
    }

    final tabs = customTabs.isNotEmpty ? customTabs : defaultTabs;

    if (tabs.isEmpty) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    // 3. Determine Current Index based on URL
    final String location = GoRouterState.of(context).uri.toString();
    int currentIndex = tabs.indexWhere((t) => location.startsWith(t.route));
    if (currentIndex == -1) currentIndex = 0; // Default

    return Scaffold(
      key: scaffoldKey,
      drawer: const AppDrawer(),
      body: child, // The Nested GoRouter Navigator
      bottomNavigationBar: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              color: brand.secondaryColor.withOpacity(0.9),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
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

                    Widget tabWidget;
                    if (tab.isAction) {
                      tabWidget = _buildActionTabButton(context, brand);
                    } else {
                      tabWidget = _buildTabButton(context, tab, isSelected, brand);
                    }

                    // Wrap with DragTarget to receive dropped Modules
                    return DragTarget<NavigationTabModel>(
                      onWillAcceptWithDetails: (details) => true,
                      onAcceptWithDetails: (details) {
                        ref.read(customFooterProvider.notifier).replaceTab(index, details.data);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${details.data.label} added to Footer Menu'),
                            backgroundColor: brand.primaryColor,
                            duration: const Duration(seconds: 2),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
                      builder: (context, candidateData, rejectedData) {
                        final isHovered = candidateData.isNotEmpty;
                        return AnimatedScale(
                          scale: isHovered ? 1.1 : 1.0,
                          duration: const Duration(milliseconds: 200),
                          child: Container(
                            decoration: isHovered
                                ? BoxDecoration(
                                    color: Colors.white.withOpacity(0.2),
                                    borderRadius: AppTheme.radiusMedium,
                                  )
                                : null,
                            child: tabWidget,
                          ),
                        );
                      },
                    );
                  }),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTabButton(
      BuildContext context, NavigationTabModel tab, bool isSelected, SchoolBrandState brand) {
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
          color: Colors.transparent,
          borderRadius: AppTheme.radiusMedium,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              tab.icon,
              color: isSelected ? brand.primaryColor : Colors.white,
              size: 24,
            ),
            const SizedBox(height: 2),
            Text(
              tab.label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? brand.primaryColor : Colors.white,
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
      backgroundColor: Colors.white.withOpacity(0.2),
      child: const Icon(Icons.flash_on_rounded, color: Colors.white, size: 28),
    );
  }
}
