import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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
          content: Text(e.toString()), backgroundColor: Colors.red));
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

      final role = data['user']['role'] ?? 'PARENT';
      ref.read(rbacProvider.notifier).initializeWith(role, [
        'dashboard.view',
        'attendance.view',
        'academics.view',
        'fees.view',
        'transport.view',
        'media.view',
        'messages.view',
      ]);

      // Fetch the full branding payload using the newly acquired token
      final brandData = await ref.read(authServiceProvider).fetchBranding();
      if (brandData != null) {
        await ref.read(schoolBrandProvider.notifier).applyFromAuthResponse(brandData);
      } else {
        await ref.read(schoolBrandProvider.notifier).applyFromAuthResponse(data);
      }

      if (!mounted) return;
      context.go('/');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString()), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final brand = ref.watch(schoolBrandProvider);
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 100),
              const Text(
                'Welcome',
                style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Sign in to your parent portal',
                style: TextStyle(fontSize: 16, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),

              TextField(
                controller: _mobileController,
                keyboardType: TextInputType.phone,
                enabled: !_otpSent,
                decoration: InputDecoration(
                  labelText: 'Mobile Number',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  prefixIcon: const Icon(Icons.phone),
                  suffixIcon: _otpSent
                      ? const Icon(Icons.check_circle, color: Colors.green)
                      : null,
                ),
              ),
              const SizedBox(height: 16),

              if (_otpSent) ...[
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: '6-Digit OTP',
                    border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                    prefixIcon: const Icon(Icons.lock_clock),
                  ),
                ),
                const SizedBox(height: 32),
              ] else
                const SizedBox(height: 16),

              ElevatedButton(
                onPressed: _isLoading
                    ? null
                    : (_otpSent ? _handleVerifyOtp : _handleRequestOtp),
                style: ElevatedButton.styleFrom(
                  backgroundColor: brand.primaryColor,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
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

              const SizedBox(height: 24),
              TextButton(
                onPressed: () {
                  if (_otpSent) {
                    setState(() {
                      _otpSent = false;
                      _otpController.clear();
                    });
                  }
                },
                child: Text(
                  _otpSent ? 'Change Mobile Number' : '',
                  style: TextStyle(color: brand.primaryColor),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
