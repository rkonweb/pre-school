import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../ui/components/premium_bottom_nav.dart';
import '../../ui/components/app_drawer.dart';
import '../../features/dashboard/data/dashboard_provider.dart';
import '../widgets/connectivity_banner.dart';

final GlobalKey<ScaffoldState> appScaffoldKey = GlobalKey<ScaffoldState>();

class AppScaffold extends ConsumerStatefulWidget {
  const AppScaffold({
    super.key,
    required this.navigationShell,
  });

  final StatefulNavigationShell navigationShell;

  @override
  ConsumerState<AppScaffold> createState() => _AppScaffoldState();
}

class _AppScaffoldState extends ConsumerState<AppScaffold> {
  // Use global key

  void _onTap(int index) {
    widget.navigationShell.goBranch(
      index,
      initialLocation: index == widget.navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: appScaffoldKey,
      extendBody: true,
      drawer: const AppDrawer(),
      body: Column(
        children: [
          const ConnectivityBanner(),
          Expanded(child: _buildBody()),
        ],
      ),
      bottomNavigationBar: PremiumBottomNav(
        currentIndex: widget.navigationShell.currentIndex,
        onTap: _onTap,
      ),
    );
  }

  Widget _buildBody() {
    return Consumer(
      builder: (context, ref, child) {
        final dashAsync = ref.watch(dashboardDataProvider);
        final activeIdx = ref.watch(activeStudentIndexProvider);

        return Stack(
          children: [
            widget.navigationShell,
            // Student switcher chip — only show if multiple students
            dashAsync.when(
              data: (data) {
                final students = data['students'] as List?;
                if (students == null || students.isEmpty || students.length < 2) {
                  return const SizedBox.shrink();
                }

                final activeStudent = students[activeIdx.clamp(0, students.length - 1)];
                final studentName = activeStudent['name'] ?? 'Student';

                return Positioned(
                  top: 16,
                  right: 16,
                  child: GestureDetector(
                    onTap: () => _showStudentSwitcher(context, ref, students, activeIdx),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircleAvatar(
                            radius: 16,
                            backgroundColor: Colors.blue.shade200,
                            child: Text(
                              studentName[0].toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            studentName,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Icon(
                            Icons.expand_more,
                            size: 20,
                            color: Colors.grey.shade600,
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ],
        );
      },
    );
  }

  void _showStudentSwitcher(
    BuildContext context,
    WidgetRef ref,
    List<dynamic> students,
    int currentIdx,
  ) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.only(top: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Text(
                  'Select Student',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ),
              Flexible(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: students.length,
                  itemBuilder: (context, idx) {
                    final student = students[idx];
                    final name = student['name'] ?? 'Student';
                    final className = student['class'] ?? 'Class';
                    final isSelected = idx == currentIdx;

                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isSelected ? Colors.blue : Colors.grey.shade200,
                        child: Text(
                          name[0].toUpperCase(),
                          style: TextStyle(
                            color: isSelected ? Colors.white : Colors.grey.shade800,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      title: Text(
                        name,
                        style: TextStyle(
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          color: isSelected ? Colors.blue : Colors.black87,
                        ),
                      ),
                      subtitle: Text(className),
                      trailing: isSelected ? const Icon(Icons.check, color: Colors.blue) : null,
                      onTap: () {
                        ref.read(activeStudentIndexProvider.notifier).state = idx;
                        Navigator.pop(context);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
