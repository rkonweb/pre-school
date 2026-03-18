import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../features/shell/app_shell.dart';
import '../features/dashboard/dashboard_screen.dart';
import '../features/attendance/teacher_attendance_view.dart';
import '../features/homework/teacher_homework_view.dart';
import '../features/schedule/teacher_schedule_view.dart';
import '../features/chat/teacher_chat_view.dart';
import '../features/chat/teacher_chat_thread_view.dart';
import '../features/profile/teacher_profile_view.dart';
import '../features/circular/circular_list_view.dart';
import '../features/circular/circular_detail_view.dart';
import '../features/circular/circular_create_view.dart';
import '../features/circular/circular_model.dart';
import '../features/auth/login_screen.dart';
import '../features/leave/teacher_leave_view.dart';
import '../features/diary/teacher_diary_view.dart';
import '../features/dashboard/admin_dashboard_view.dart' deferred as admin_dashboard;
import '../shared/components/generic_crud_page.dart' deferred as admin_crud;
import '../features/students/students_view.dart' deferred as admin_students;
import '../features/students/student_details_view.dart' deferred as admin_student_details;
import '../features/admissions/admissions_view.dart' deferred as admin_admissions;
import '../features/staff/admin_staff_directory_view.dart' deferred as admin_staff;
import '../features/staff/admin_staff_details_view.dart' deferred as admin_staff_details;
import 'state/auth_state.dart';
import '../features/attendance/self_attendance_view.dart' as staff_attendance;
import '../features/attendance/self_attendance_report_view.dart' as staff_attendance_report;

// Helper for lazy loading modules
class DeferredComponent extends StatefulWidget {
  final Future<void> loader;
  final Widget Function() builder;

  const DeferredComponent({super.key, required this.loader, required this.builder});

  @override
  State<DeferredComponent> createState() => _DeferredComponentState();
}

class _DeferredComponentState extends State<DeferredComponent> {
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    widget.loader.then((_) {
      if (mounted) setState(() => _loaded = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_loaded) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(
                width: 40,
                height: 40,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF140E28)),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Initializing Module...'.toUpperCase(),
                style: const TextStyle(
                  fontFamily: 'Satoshi',
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF7B7291),
                  letterSpacing: 1.2,
                ),
              ),
            ],
          ),
        ),
      );
    }
    return widget.builder().animate().fadeIn(duration: 400.ms);
  }
}

// Placeholder empty screens for routing definition
class PlaceholderScreen extends StatelessWidget {
  final String title;
  const PlaceholderScreen({super.key, required this.title});
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text(title)));
}

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'shell');

final GoRouter appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/login',
  redirect: (context, state) {
    final container = ProviderScope.containerOf(context);
    final isAuthenticated = container.read(isAuthenticatedProvider);
    final isLoggingIn = state.matchedLocation == '/login';

    if (!isAuthenticated && !isLoggingIn) {
      return '/login';
    }

    if (isAuthenticated && isLoggingIn) {
      return '/dashboard';
    }

    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/',
      redirect: (_, __) => '/dashboard',
    ),
    // ── Routes rendered INSIDE the shell (shows status bar + bottom nav) ─
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) {
        return AppShell(child: child);
      },
      routes: [
        GoRoute(
          path: '/dashboard',
          pageBuilder: (context, state) => NoTransitionPage(
            child: Consumer(
              builder: (context, ref, child) {
                final role = ref.watch(activeRoleProvider);
                if (role == 'ADMIN') {
                  return DeferredComponent(
                    loader: admin_dashboard.loadLibrary(),
                    builder: () => admin_dashboard.AdminDashboardView(),
                  );
                }
                return const DashboardScreen();
              },
            ),
          ),
        ),
        GoRoute(
          path: '/attendance',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: TeacherAttendanceView(),
          ),
        ),
        GoRoute(
          path: '/homework',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: TeacherHomeworkView(),
          ),
        ),
        GoRoute(
          path: '/schedule',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: TeacherScheduleView(),
          ),
        ),
        GoRoute(
          path: '/leave',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: TeacherLeaveView(),
          ),
        ),
        GoRoute(
          path: '/tasks',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: PlaceholderScreen(title: 'Tasks'),
          ),
        ),
        GoRoute(
          path: '/messages',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: TeacherChatView(),
          ),
          routes: [
            GoRoute(
              path: 'thread',
              pageBuilder: (context, state) {
                final extra = state.extra as Map<String, dynamic>? ?? {};
                return CustomTransitionPage(
                  key: state.pageKey,
                  child: TeacherChatThreadView(
                    title: extra['title'] ?? 'Chat',
                    subtitle: extra['subtitle'] ?? '',
                    gradient: extra['gradient'] ?? const [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                    icon: extra['icon'],
                    conversationId: extra['conversationId'] ?? '',
                    rawStudentId: extra['rawStudentId'] ?? '',
                    avatarUrl: extra['avatarUrl'],
                  ),
                  transitionsBuilder: (context, animation, secondaryAnimation, child) {
                    const begin = Offset(0.0, 1.0);
                    const end = Offset.zero;
                    const curve = Curves.bounceOut;

                    var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));

                    return SlideTransition(
                      position: animation.drive(tween),
                      child: child,
                    );
                  },
                  transitionDuration: const Duration(milliseconds: 600),
                );
              },
            ),
          ],
        ),
        GoRoute(
          path: '/reports',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: PlaceholderScreen(title: 'Reports'),
          ),
        ),
        GoRoute(
          path: '/profile',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: TeacherProfileView(),
          ),
        ),
        GoRoute(
          path: '/self-attendance',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: staff_attendance.StaffSelfAttendanceView(),
          ),
          routes: [
            GoRoute(
              path: 'report',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: staff_attendance_report.StaffAttendanceReportView(),
              ),
            ),
          ],
        ),
        // ── Admin Generic CRUD Routes ────────────────────────────────────────
        GoRoute(
          path: '/admissions',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_admissions.loadLibrary(),
              builder: () => admin_admissions.AdmissionsView(),
            ),
          ),
        ),
        GoRoute(
          path: '/staff',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_staff.loadLibrary(),
              builder: () => admin_staff.AdminStaffDirectoryView(),
            ),
          ),
        ),
        GoRoute(
          path: '/staff/details',
          pageBuilder: (context, state) {
            final Map<String, dynamic> data = (state.extra as Map<String, dynamic>?) ?? {};
            return NoTransitionPage(
              child: DeferredComponent(
                loader: admin_staff_details.loadLibrary(),
                builder: () => admin_staff_details.AdminStaffDetailsView(staffData: data),
              ),
            );
          },
        ),
        GoRoute(
          path: '/billing',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'billing'),
            ),
          ),
        ),
        GoRoute(
          path: '/inventory',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'inventory'),
            ),
          ),
        ),
        GoRoute(
          path: '/settings',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'settings'),
            ),
          ),
        ),
        GoRoute(
          path: '/students',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_students.loadLibrary(),
              builder: () => admin_students.StudentsView(),
            ),
          ),
          routes: [
            GoRoute(
              path: ':id',
              pageBuilder: (context, state) {
                final id = state.pathParameters['id']!;
                return NoTransitionPage(
                  child: DeferredComponent(
                    loader: admin_student_details.loadLibrary(),
                    builder: () => admin_student_details.StudentDetailsView(studentId: id),
                  ),
                );
              },
            ),
          ],
        ),
        GoRoute(
          path: '/academics',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'academics'),
            ),
          ),
        ),
        GoRoute(
          path: '/diary',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: TeacherDiaryView(),
          ),
        ),
        GoRoute(
          path: '/accounts',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'accounts'),
            ),
          ),
        ),
        GoRoute(
          path: '/hr',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'hr'),
            ),
          ),
        ),
        GoRoute(
          path: '/extracurricular',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'extracurricular'),
            ),
          ),
        ),
        GoRoute(
          path: '/ptm',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'ptm'),
            ),
          ),
        ),
        GoRoute(
          path: '/parent-requests',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'parent-requests'),
            ),
          ),
        ),
        GoRoute(
          path: '/canteen',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'canteen'),
            ),
          ),
        ),
        GoRoute(
          path: '/hostel',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'hostel'),
            ),
          ),
        ),
        GoRoute(
          path: '/store',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'store'),
            ),
          ),
        ),
        GoRoute(
          path: '/training',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'training'),
            ),
          ),
        ),
        GoRoute(
          path: '/marketing',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'marketing'),
            ),
          ),
        ),
        GoRoute(
          path: '/events',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'events'),
            ),
          ),
        ),
        GoRoute(
          path: '/documents',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'documents'),
            ),
          ),
        ),
        GoRoute(
          path: '/library',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'library'),
            ),
          ),
        ),
        GoRoute(
          path: '/transport',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'transport'),
            ),
          ),
        ),
        // ── Remaining Module placeholders ─
        GoRoute(
          path: '/reports-all',
          pageBuilder: (context, state) => NoTransitionPage(
            child: DeferredComponent(
              loader: admin_crud.loadLibrary(),
              builder: () => admin_crud.GenericCrudPage(moduleKey: 'reports'),
            ),
          ),
        ),
        GoRoute(
          path: '/circular',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: CircularListView(),
          ),
          routes: [
            GoRoute(
              path: 'detail',
              builder: (context, state) {
                final circular = state.extra as CircularModel;
                return CircularDetailView(circular: circular);
              },
            ),
            GoRoute(
              path: 'create',
              builder: (context, state) => const CircularCreateView(),
            ),
          ],
        ),
      ],
    ),
  ],
);
