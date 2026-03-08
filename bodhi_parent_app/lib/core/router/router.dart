import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/auth/splash_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/consent_screen.dart';
import '../../features/today/presentation/today_screen.dart';
import '../../features/finance/presentation/finance_screen.dart';
import '../../features/messages/presentation/messages_screen.dart';
import '../../features/messages/presentation/conversation_screen.dart';
import '../../features/transport/presentation/transport_screen.dart';
import '../../features/attendance/presentation/attendance_screen.dart';
import '../../features/diary/presentation/diary_screen.dart';
import '../../features/library/presentation/library_screen.dart';
import '../../features/timetable/presentation/timetable_screen.dart';
import '../../features/progress/presentation/progress_screen.dart';
import '../../features/health/presentation/health_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/leave_request/presentation/leave_request_screen.dart';
import '../../features/documents/presentation/documents_screen.dart';
// Phase 2
import '../../features/events/presentation/events_screen.dart';
import '../../features/alerts/presentation/alerts_screen.dart';
import '../../features/alerts/presentation/emergency_alarm_screen.dart';
// CircularsScreen is defined in alerts_screen.dart
// Phase 3
import '../../features/ptm/presentation/ptm_screen.dart';
import '../../features/store/presentation/store_screen.dart';
import '../../features/payments/presentation/payments_screen.dart';
// Phase 4
import '../../features/canteen/presentation/canteen_screen.dart';
// Phase 5
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/hostel/presentation/hostel_screen.dart';
import 'package:bodhi_parent_app/features/extracurricular/presentation/extracurricular_screen.dart';
import 'app_scaffold.dart';

final navigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: navigatorKey,
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/consent',
        builder: (context, state) => const ConsentScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppScaffold(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/',
                builder: (context, state) => const DashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/attendance',
                builder: (context, state) => const AttendanceScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/diary',
                builder: (context, state) => const DiaryScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/timetable',
                builder: (context, state) => const TimetableScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/transport',
                builder: (context, state) => const TransportScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/canteen',
                builder: (context, state) => const CanteenScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/notifications',
                builder: (context, state) => const NotificationsScreen(),
              ),
            ],
          ),
        ],
      ),
      // ─── Secondary Routes ─────────────────────────────────────────
      GoRoute(
        path: '/today',
        builder: (context, state) => const TodayScreen(),
      ),
      GoRoute(
        path: '/finance',
        builder: (context, state) => const FinanceScreen(),
      ),
      GoRoute(
        path: '/messages',
        builder: (context, state) => const MessagesScreen(),
      ),
      GoRoute(
        path: '/messages/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          final title = state.extra as String? ?? 'Conversation';
          return ConversationScreen(conversationId: id, title: title);
        },
      ),
      GoRoute(
        path: '/library',
        builder: (context, state) => const LibraryScreen(),
      ),
      // ─── Phase 1 New Routes ───────────────────────────────────────
      GoRoute(
        path: '/progress',
        builder: (context, state) => const ProgressScreen(),
      ),
      GoRoute(
        path: '/health',
        builder: (context, state) => const HealthScreen(),
      ),
      GoRoute(
        path: '/leave-request',
        builder: (context, state) => const LeaveRequestScreen(),
      ),
      GoRoute(
        path: '/documents',
        builder: (context, state) => const DocumentsScreen(),
      ),
      // ─── Phase 2 New Routes ───────────────────────────────────────
      GoRoute(
        path: '/events',
        builder: (context, state) => const EventsScreen(),
      ),
      GoRoute(
        path: '/alerts',
        builder: (context, state) => const AlertsScreen(),
      ),
      GoRoute(
        path: '/circulars',
        builder: (context, state) => const CircularsScreen(),
      ),
      // ─── Phase 3 Routes ──────────────────────────────────────────
      GoRoute(
        path: '/ptm',
        builder: (context, state) => const PTMScreen(),
      ),
      GoRoute(
        path: '/store',
        builder: (context, state) => const SchoolStoreScreen(),
      ),
      GoRoute(
        path: '/payments',
        builder: (context, state) => const PaymentsScreen(),
      ),
      // ─── Phase 4 Routes ──────────────────────────────────────────
      // ─── Phase 5 Routes ──────────────────────────────────────────
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/hostel',
        builder: (context, state) => const HostelScreen(),
      ),
      // ─── Emergency Alarm (fullscreen, no shell chrome) ───────────
      GoRoute(
        path: '/emergency-alarm',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? {};
          return EmergencyAlarmScreen(
            title: extra['title'] as String? ?? '⚠️ Emergency Alert',
            message: extra['message'] as String? ?? 'Please check the school app.',
            alertType: extra['alertType'] as String? ?? 'GENERAL',
          );
        },
      ),
      GoRoute(
        path: '/extracurricular',
        builder: (context, state) => const ExtracurricularScreen(),
      ),
    ],
  );
});
