import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/state/auth_state.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/components/gradient_hero_card.dart';
import 'teacher_dashboard_view.dart';
import 'driver_dashboard_view.dart';
import 'admin_dashboard_view.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeRole = ref.watch(activeRoleProvider);
    final String r = activeRole.toUpperCase();
    final themeGradient = AppTheme.getRoleGradient(activeRole);

    return ListView(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 100),
      children: [
        // Only show static hero for non-teacher roles
        // Teacher/Staff get ClassAttendanceHero inside TeacherDashboardView
        if (r != 'STAFF' && r != 'TEACHER') ...[
          _buildRoleHero(r, themeGradient),
          const SizedBox(height: 32),
        ],

        // Role-specific Dashboards
        if (r == 'DRIVER')
          const DriverDashboardView()
        else if (r == 'ADMIN')
          const AdminDashboardView()
        else if (r == 'STAFF' || r == 'TEACHER')
          const TeacherDashboardView()
        else 
          Center(
            child: Padding(
               padding: const EdgeInsets.symmetric(vertical: 40),
               child: Text('Coming Soon:\n$activeRole Dashboard',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                     fontFamily: 'Clash Display',
                     fontSize: 18,
                     fontWeight: FontWeight.w700,
                     color: Color(0xFF9BA5BF)
                  )
               ),
            ),
          ),
      ],
    );
  }

  Widget _buildRoleHero(String r, LinearGradient themeGradient) {
     return GradientHeroCard(
       pillText: (r == 'STAFF' || r == 'TEACHER') ? "Class 8-A · Today" :
                 r == 'DRIVER' ? "Route 42 · Morning" :
                 r == 'ADMIN' ? "System Overview" : "$r Panel",
       value: (r == 'STAFF' || r == 'TEACHER') ? "38" :
              r == 'DRIVER' ? "12" :
              r == 'ADMIN' ? "\$42k" : "100",
       subValue: (r == 'STAFF' || r == 'TEACHER') ? " / 42" :
                 r == 'DRIVER' ? " / 40" :
                 r == 'ADMIN' ? " Today" : "%",
       subtitle: (r == 'STAFF' || r == 'TEACHER') ? "90.5% present · 4 students absent" :
                 r == 'DRIVER' ? "Next Stop: Elm St" : "This Month",
       progress: (r == 'STAFF' || r == 'TEACHER') ? 0.905 :
                 r == 'DRIVER' ? 0.30 :
                 r == 'ADMIN' ? 0.8 : 1.0,
       icon: (r == 'STAFF' || r == 'TEACHER') ? Icons.bar_chart_rounded :
             r == 'DRIVER' ? Icons.directions_bus : Icons.manage_accounts_rounded,
       themeGradient: themeGradient,
     );
  }
}
