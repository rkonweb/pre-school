import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
import 'state/auth_state.dart';

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
          pageBuilder: (context, state) => const NoTransitionPage(
            child: DashboardScreen(),
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
                return NoTransitionPage(
                  child: TeacherChatThreadView(
                    title: extra['title'] ?? 'Chat',
                    subtitle: extra['subtitle'] ?? '',
                    gradient: extra['gradient'] ?? const [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                    icon: extra['icon'],
                  ),
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
