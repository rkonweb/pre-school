import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/state/auth_state.dart';
import '../../shared/components/class_attendance_hero.dart';
import '../../shared/components/birthday_section.dart';
import '../circular/circular_provider.dart';
import '../schedule/teacher_schedule_view.dart';
import 'teacher_dashboard_view.dart';
import 'driver_dashboard_view.dart';
import 'admin_dashboard_view.dart';
import 'principal_dashboard_view.dart';
import 'canteen_dashboard_view.dart';
import 'receptionist_dashboard_view.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  // Invalidate all async dashboard providers to force re-fetch
  Future<void> _onRefresh(WidgetRef ref) async {
    ref.invalidate(classAttendanceProvider);
    ref.invalidate(scheduleDataProvider);
    ref.invalidate(recentCircularsProvider);
    ref.invalidate(birthdayProvider);
    await Future.delayed(const Duration(milliseconds: 900));
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeRole = ref.watch(activeRoleProvider);
    final String r = activeRole.toUpperCase().trim();

    return RefreshIndicator(
      onRefresh: () => _onRefresh(ref),
      color: const Color(0xFFFF5733),
      backgroundColor: Colors.white,
      strokeWidth: 2.5,
      displacement: 60,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 100),
        children: [
          // Role-specific dashboard — each view owns its own hero
          if (r == 'DRIVER')
            const DriverDashboardView()
          else if (r == 'ADMIN')
            const AdminDashboardView()
          else if (r == 'PRINCIPAL')
            const PrincipalDashboardView()
          else if (r == 'CANTEEN')
            const CanteenDashboardView()
          else if (r == 'RECEPTIONIST')
            const ReceptionistDashboardView()
          else // TEACHER / STAFF and any unhandled role
            const TeacherDashboardView(),
        ],
      ),
    );
  }
}
