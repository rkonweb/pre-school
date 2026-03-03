import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/auth/splash_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/today/presentation/today_screen.dart';
import '../../features/finance/presentation/finance_screen.dart';
import '../../features/messages/presentation/messages_screen.dart';
import '../../features/messages/presentation/conversation_screen.dart';
import '../../features/transport/presentation/transport_screen.dart';
import '../../features/attendance/presentation/attendance_screen.dart';
import '../../features/diary/presentation/diary_screen.dart';
import '../../features/timetable/presentation/timetable_screen.dart';
import 'app_scaffold.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
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
        ],
      ),
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
    ],
  );
});
