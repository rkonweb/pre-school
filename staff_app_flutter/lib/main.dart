import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router.dart';
import 'core/theme/app_theme.dart';
import 'shared/components/iphone_frame_wrapper.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase & Local DB here in Phase 5
  
  runApp(
    const ProviderScope(
      child: StaffHybridApp(),
    ),
  );
}

class StaffHybridApp extends ConsumerWidget {
  const StaffHybridApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'EduSphere Staff',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system, // Supports automatic dark mode
      
      builder: (context, child) {
        // Automatically enable the iPhone frame only on wide screens (i.e. Web/Desktop viewers)
        final isWideScreen = MediaQuery.of(context).size.width > 600;
        return IphoneFrameWrapper(
          isEnabled: isWideScreen,
          child: child ?? const SizedBox(),
        );
      },

      // GoRouter Configuration
      routerConfig: appRouter,
    );
  }
}
