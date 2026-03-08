import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/school_brand_provider.dart';
import 'auth_service.dart';
import '../../core/routing/rbac.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _bootstrapApp();
  }

  Future<void> _bootstrapApp() async {
    try {
      await _bootstrapAppInternal().timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          // Safety net: if everything takes too long, go to login
          if (mounted) context.go('/login');
        },
      );
    } catch (_) {
      if (mounted) context.go('/login');
    }
  }

  Future<void> _bootstrapAppInternal() async {
    // 1. Minimum display time for premium feel
    await Future.delayed(const Duration(milliseconds: 1500));

    // 2. Check Auth Status
    final authService = ref.read(authServiceProvider);
    final hasToken = await authService.hasValidToken();

    if (!mounted) return;

    if (hasToken) {
      // 3. Restore saved brand colors immediately (fast, from SharedPreferences)
      await ref.read(schoolBrandProvider.notifier).restoreFromStorage();

      // 4. Fetch fresh branding (with 5s timeout — don't block splash if server is slow)
      try {
        final brandData = await authService.fetchBranding().timeout(
          const Duration(seconds: 5),
        );
        if (brandData != null && mounted) {
          await ref.read(schoolBrandProvider.notifier).applyFromAuthResponse(brandData);
        }
      } catch (_) {
        // Timeout or error — proceed with cached brand colors
      }

      // 5. Initialize RBAC from fetched brandData if available, otherwise use defaults
      final String role = brandData?['user']?['role'] ?? 'STAFF';
      final List<dynamic>? backendPermissions = brandData?['user']?['permissions'];
      
      final List<String> permissions = backendPermissions?.map((e) => e.toString()).toList() ?? [
        'dashboard.view',
        'tasks.view',
        'communication.view',
        'profile.view',
        'attendance.mark',
        'diary.create',
        'transport.route.start',
        'approvals.view',
        'timetable.view',
        'progress.view',
        'development.view',
        'health.view',
        'chat.view',
      ];

      ref.read(rbacProvider.notifier).initializeWith(role, permissions);

      // Navigate to Home/Dashboard
      if (mounted) context.go('/home');
    } else {
      // Navigate to Login
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final brand = ref.watch(schoolBrandProvider);
    return Scaffold(
      backgroundColor: brand.primaryColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo placeholder
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.school,
                  size: 48, color: brand.primaryColor),
            ),
            const SizedBox(height: AppTheme.s24),
            const Text(
              'Bodhi Board',
              style: TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: AppTheme.s8),
            const Text(
              'Staff Portal',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
