import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart'; // Added for kIsWeb
import 'core/notifications/notification_provider.dart';
import 'core/router/router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'core/config/school_config_service.dart';

import 'package:shared_preferences/shared_preferences.dart';
import 'core/sync/sync_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final prefs = await SharedPreferences.getInstance();

  // Load cached school config (Razorpay key, feature flags, etc.) set by the
  // school admin in the ERP Login Settings page. This is fast (SharedPreferences
  // read) and ensures keys are available before the first frame.
  await SchoolConfigService.loadCached();

  try {
    // On MacOS/iOS, initializeApp often requires options if native configs are missing.
    // On Web, without options it throws Null check format errors.
    if (kIsWeb) {
      debugPrint("Skipping Firebase initialization on Web due to missing options.");
    } else {
      await Firebase.initializeApp();
    }
  } catch (e) {
    debugPrint("Firebase initialization failed (likely missing configuration): $e");
  }

  runApp(
    ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
        // Seed schoolConfigProvider with whatever is in the cache so widgets
        // that depend on it don't need to wait for an async fetch.
        schoolConfigProvider.overrideWith(
          (ref) => SchoolConfigService.current,
        ),
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
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp.router(
      title: 'Bodhi Parent',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
