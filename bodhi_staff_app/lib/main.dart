import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/routing/app_router.dart';
import 'sync/background.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Background Sync Engine for offline pushes
  initializeBackgroundSync();

  runApp(
    const ProviderScope(
      child: BodhiStaffApp(),
    ),
  );
}

class BodhiStaffApp extends StatelessWidget {
  const BodhiStaffApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Bodhi Board Staff',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      // Router configuration matching our shared-axis transitions
      routerConfig: AppRouter.router,
    );
  }
}
