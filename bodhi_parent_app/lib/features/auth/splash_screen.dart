import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
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

    // 2. Check DPDP Consent
    final prefs = await SharedPreferences.getInstance();
    final hasConsent = prefs.getBool('dpdp_consent_given') ?? false;

    if (!mounted) return;

    if (!hasConsent) {
      // User hasn't accepted consent yet
      if (mounted) context.go('/consent');
      return;
    }

    // 3. Check Auth Status
    final authService = ref.read(authServiceProvider);
    final hasToken = await authService.hasValidToken();

    if (!mounted) return;

    if (hasToken) {
      // 4. Restore saved brand colors immediately
      await ref.read(schoolBrandProvider.notifier).restoreFromStorage();

      // 5. Fetch fresh branding
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

      // 6. Initialize RBAC
      ref.read(rbacProvider.notifier).initializeWith('PARENT', [
        'dashboard.view',
        'attendance.view',
        'academics.view',
        'fees.view',
        'transport.view',
        'media.view',
        'messages.view',
      ]);

      if (mounted) context.go('/');
    } else {
      if (mounted) context.go('/login');
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
            Container(
              width: 100,
              height: 100,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.school_rounded,
                  size: 60, color: brand.primaryColor),
            ),
            const SizedBox(height: 24),
            const Text(
              'Bodhi Board',
              style: TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Parent Portal',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 18,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
