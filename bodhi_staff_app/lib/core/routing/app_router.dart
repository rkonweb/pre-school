import 'package:bodhi_staff_app/ui/components/app_drawer.dart';
import '../widgets/global_header.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'transitions.dart';

// Screens
import '../../features/auth/splash_screen.dart';
import '../../features/auth/login_screen.dart';
import 'role_navigator_shell.dart';
import '../../features/dashboard/dashboard_screen.dart';
import '../../features/attendance/attendance_screen.dart';
import '../../features/timetable/timetable_screen.dart';
import '../../features/progress/progress_screen.dart';
import '../../features/health/health_screen.dart';
import '../../features/communication/communication_screen.dart';
import '../../features/chat/chat_screen.dart';
import '../../features/development/development_screen.dart';
import '../../features/diary/diary_create_screen.dart';
import '../../features/diary/diary_list_screen.dart';
import '../../features/diary/models/diary_entry.dart';
import '../../features/approvals/approvals_screen.dart';
import '../../features/transport/driver_route_screen.dart';

/// Global AppRouter configuration
class AppRouter {
  static final GlobalKey<NavigatorState> rootNavigatorKey =
      GlobalKey<NavigatorState>();
  static final GlobalKey<NavigatorState> shellNavigatorKey =
      GlobalKey<NavigatorState>();

  static final GoRouter router = GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/splash',
    routes: [
      // Splash / Loading
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // Auth Flow
      GoRoute(
        path: '/login',
        name: 'login',
        pageBuilder: (context, state) => TransitionRegistry.fadeThrough(
          context,
          state,
          const LoginScreen(),
        ),
      ),

      // Main Application Shell
      ShellRoute(
        navigatorKey: shellNavigatorKey,
        builder: (context, state, child) {
          return RoleNavigatorShell(child: child);
        },
        routes: [
          // ── Core ──
          GoRoute(
            path: '/home',
            name: 'home',
            pageBuilder: (context, state) =>
                TransitionRegistry.sharedAxisHorizontal(
              context, state, const DashboardScreen(),
            ),
          ),
          GoRoute(
            path: '/today',
            name: 'today',
            pageBuilder: (context, state) =>
                TransitionRegistry.sharedAxisHorizontal(
              context,
              state,
              const Scaffold(
                  body: Center(child: Text('Today Schedule Detail Screen'))),
            ),
          ),
          GoRoute(
            path: '/inbox',
            name: 'inbox',
            pageBuilder: (context, state) =>
                TransitionRegistry.sharedAxisHorizontal(
              context,
              state,
              Scaffold(
                drawer: const AppDrawer(),
                appBar: const GlobalHeader(title: 'Inbox'),
                body: const Center(child: Text('Inbox / Notifications')),
              ),
            ),
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            pageBuilder: (context, state) =>
                TransitionRegistry.sharedAxisHorizontal(
              context,
              state,
              Scaffold(
                drawer: const AppDrawer(),
                appBar: const GlobalHeader(title: 'My Profile'),
                body: const Center(child: Text('Staff Profile Detail Form')),
              ),
            ),
          ),

          // ── Academic Modules ──
          GoRoute(
            path: '/timetable',
            name: 'timetable',
            pageBuilder: (context, state) =>
                TransitionRegistry.sharedAxisHorizontal(
              context, state, const TimetableScreen(),
            ),
          ),
          GoRoute(
            path: '/attendance',
            name: 'attendance',
            pageBuilder: (context, state) =>
                TransitionRegistry.sharedAxisHorizontal(
              context, state, const AttendanceScreen(),
            ),
          ),
          GoRoute(
            path: '/diary',
            name: 'diary',
            pageBuilder: (context, state) => TransitionRegistry.fadeThrough(
              context, state, const DiaryListScreen(),
            ),
          ),
          GoRoute(
            path: '/diary/create',
            name: 'diary_create',
            pageBuilder: (context, state) => TransitionRegistry.fadeThrough(
              context, state, const DiaryCreateScreen(),
            ),
          ),
          GoRoute(
            path: '/diary/edit',
            name: 'diary_edit',
            pageBuilder: (context, state) {
              final entry = state.extra as DiaryEntry?;
              return TransitionRegistry.fadeThrough(
                context, state, DiaryCreateScreen(existingEntry: entry),
              );
            },
          ),
          GoRoute(
            path: '/progress',
            name: 'progress',
            pageBuilder: (context, state) =>
                TransitionRegistry.sharedAxisHorizontal(
              context, state, const ProgressScreen(),
            ),
          ),

          // ── Student Care ──
          GoRoute(
            path: '/development',
            name: 'development',
            pageBuilder: (context, state) =>
                TransitionRegistry.sharedAxisHorizontal(
              context, state, const DevelopmentScreen(),
            ),
          ),
          GoRoute(
            path: '/health',
            name: 'health',
            pageBuilder: (context, state) =>
                TransitionRegistry.sharedAxisHorizontal(
              context, state, const HealthScreen(),
            ),
          ),

          // ── Communication & Chat ──
          GoRoute(
            path: '/communication',
            name: 'communication',
            pageBuilder: (context, state) =>
                TransitionRegistry.sharedAxisHorizontal(
              context, state, const CommunicationScreen(),
            ),
          ),
          GoRoute(
            path: '/chat',
            name: 'chat',
            pageBuilder: (context, state) =>
                TransitionRegistry.sharedAxisHorizontal(
              context, state, const ChatScreen(),
            ),
          ),

          // ── Management / Transport / Admin ──
          GoRoute(
            path: '/approvals',
            name: 'approvals',
            pageBuilder: (context, state) =>
                TransitionRegistry.sharedAxisHorizontal(
              context, state, const ApprovalsScreen(),
            ),
          ),
          GoRoute(
            path: '/transport',
            name: 'transport',
            pageBuilder: (context, state) =>
                TransitionRegistry.sharedAxisHorizontal(
              context, state, const DriverRouteScreen(),
            ),
          ),

          // ── Deep Links (Detail Views) ──
          GoRoute(
            path: '/student/:id',
            name: 'student_profile',
            pageBuilder: (context, state) {
              final id = state.pathParameters['id'];
              return TransitionRegistry.sharedAxisHorizontal(
                context,
                state,
                Scaffold(
                  appBar: const GlobalHeader(title: 'Student Profile'),
                  body: Center(child: Text('Student Profile: $id')),
                ),
              );
            },
          ),
        ],
      ),
    ],
  );
}