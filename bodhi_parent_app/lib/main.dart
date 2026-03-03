import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/notifications/notification_provider.dart';
import 'core/router/router.dart';
import 'core/theme/app_theme.dart';

import 'package:shared_preferences/shared_preferences.dart';
import 'core/sync/sync_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  final prefs = await SharedPreferences.getInstance();

  try {
    // On MacOS/iOS, initializeApp often requires options if native configs are missing.
    // We catch and log to prevent the red screen of death.
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint("Firebase initialization failed (likely missing configuration): $e");
  }

  runApp(
    ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
      child: Consumer(
        builder: (context, ref, child) {
          // Initialize notifications & sync services
          ref.read(notificationServiceProvider).init();
          ref.read(offlineSyncServiceProvider); // Trigger lazy init
          return const BodhiParentApp();
        },
      ),
    ),
  );
}

class BodhiParentApp extends ConsumerWidget {
  const BodhiParentApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Bodhi Parent',
      theme: AppTheme.lightTheme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
