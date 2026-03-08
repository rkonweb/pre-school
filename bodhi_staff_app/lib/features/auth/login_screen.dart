import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/school_brand_provider.dart';
import 'auth_service.dart';
import '../../core/routing/rbac.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  bool _isLoading = false;
  bool _otpSent = false;

  final TextEditingController _mobileController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();

  @override
  void dispose() {
    _mobileController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _handleRequestOtp() async {
    final mobile = _mobileController.text.trim();
    if (mobile.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      final success = await ref.read(authServiceProvider).requestOtp(mobile);
      if (success) {
        setState(() => _otpSent = true);
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString()), backgroundColor: AppTheme.danger));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleVerifyOtp() async {
    final mobile = _mobileController.text.trim();
    final code = _otpController.text.trim();
    if (code.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      final data = await ref.read(authServiceProvider).verifyOtp(mobile, code);

      // Initialize RBAC with the role and permissions returned from the backend
      final role = data['user']['role'] ?? 'STAFF';
      final List<dynamic>? backendPermissions = data['user']['permissions'];
      
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

      // Apply school brand colors from the auth response
      await ref.read(schoolBrandProvider.notifier).applyFromAuthResponse(data);

      if (!mounted) return;
      context.go('/home');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString()), backgroundColor: AppTheme.danger));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.s24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Welcome Back',
                style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppTheme.s8),
              const Text(
                'Sign in to your staff portal',
                style: TextStyle(fontSize: 16, color: AppTheme.textMuted),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppTheme.s48),

              TextField(
                controller: _mobileController,
                keyboardType: TextInputType.phone,
                enabled: !_otpSent,
                decoration: InputDecoration(
                  labelText: 'Mobile Number',
                  border: const OutlineInputBorder(),
                  prefixIcon: const Icon(Icons.phone),
                  suffixIcon: _otpSent
                      ? const Icon(Icons.check_circle, color: AppTheme.success)
                      : null,
                ),
              ),
              const SizedBox(height: AppTheme.s16),

              if (_otpSent) ...[
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: '6-Digit OTP',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.lock_clock),
                  ),
                ),
                const SizedBox(height: AppTheme.s32),
              ] else
                const SizedBox(height: AppTheme.s16),

              ElevatedButton(
                onPressed: _isLoading
                    ? null
                    : (_otpSent ? _handleVerifyOtp : _handleRequestOtp),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(56),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2))
                    : Text(_otpSent ? 'Verify & Sign In' : 'Send OTP',
                        style: const TextStyle(fontSize: 18)),
              ),

              const SizedBox(height: AppTheme.s24),
              // Biometric Login Option
              TextButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.fingerprint,
                    size: 32, color: AppTheme.primary),
                label: const Text('Login with Biometrics',
                    style: TextStyle(color: AppTheme.primary)),
              )
            ],
          ),
        ),
      ),
    );
  }
}
