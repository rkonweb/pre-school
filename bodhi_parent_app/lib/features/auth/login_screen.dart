import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'dart:async';
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
  late List<TextEditingController> _otpControllers;
  late List<FocusNode> _otpFocusNodes;

  int _resendCountdown = 0;
  Timer? _resendTimer;

  @override
  void initState() {
    super.initState();
    _otpControllers = List.generate(6, (_) => TextEditingController());
    _otpFocusNodes = List.generate(6, (_) => FocusNode());
  }

  @override
  void dispose() {
    _mobileController.dispose();
    for (var controller in _otpControllers) {
      controller.dispose();
    }
    for (var focusNode in _otpFocusNodes) {
      focusNode.dispose();
    }
    _resendTimer?.cancel();
    super.dispose();
  }

  void _startResendTimer() {
    setState(() => _resendCountdown = 30);
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() => _resendCountdown--);
      if (_resendCountdown == 0) {
        timer.cancel();
      }
    });
  }

  void _handleOtpInput(int index, String value) {
    if (value.isNotEmpty) {
      if (index < 5) {
        _otpFocusNodes[index + 1].requestFocus();
      } else {
        // All digits filled, auto-call verify
        _otpFocusNodes[index].unfocus();
        Future.delayed(const Duration(milliseconds: 200), _handleVerifyOtp);
      }
    }
  }

  void _handleOtpBackspace(int index, String value) {
    if (value.isEmpty && index > 0) {
      _otpFocusNodes[index - 1].requestFocus();
    }
  }

  Future<void> _handleRequestOtp() async {
    final mobile = _mobileController.text.trim();
    if (mobile.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      final success = await ref.read(authServiceProvider).requestOtp(mobile);
      if (success) {
        setState(() {
          _otpSent = true;
        });
        // Clear and reset OTP controllers
        for (var controller in _otpControllers) {
          controller.clear();
        }
        _otpFocusNodes[0].requestFocus();
        _startResendTimer();
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
    final code = _otpControllers.map((c) => c.text).join();
    if (code.isEmpty || code.length != 6) return;

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
                // 6-Digit OTP Input
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Enter OTP',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: List.generate(6, (index) {
                        return SizedBox(
                          width: 45,
                          height: 55,
                          child: RawKeyboardListener(
                            focusNode: FocusNode(),
                            onKey: (event) {
                              if (event is RawKeyDownEvent &&
                                  event.logicalKey == LogicalKeyboardKey.backspace &&
                                  _otpControllers[index].text.isEmpty) {
                                _handleOtpBackspace(index, '');
                              }
                            },
                            child: TextField(
                            controller: _otpControllers[index],
                            focusNode: _otpFocusNodes[index],
                            keyboardType: TextInputType.number,
                            textAlign: TextAlign.center,
                            maxLength: 1,
                            enabled: !_isLoading,
                            decoration: InputDecoration(
                              counterText: '',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              contentPadding: EdgeInsets.zero,
                            ),
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                            onChanged: (value) {
                              if (value.isNotEmpty && !value.characters.first.contains(RegExp(r'[0-9]'))) {
                                _otpControllers[index].clear();
                                return;
                              }
                              if (value.length > 1) {
                                _otpControllers[index].text = value[value.length - 1];
                              }
                              if (value.isNotEmpty) {
                                _handleOtpInput(index, value);
                              }
                            },
                          ),
                          ),
                        );
                      }),
                    ),
                  ],
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
              if (_otpSent)
                Column(
                  children: [
                    TextButton(
                      onPressed: _resendCountdown > 0 ? null : _handleRequestOtp,
                      child: Text(
                        _resendCountdown > 0
                            ? 'Resend OTP (${_resendCountdown}s)'
                            : 'Resend OTP',
                        style: TextStyle(color: brand.primaryColor),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () {
                        setState(() {
                          _otpSent = false;
                          for (var controller in _otpControllers) {
                            controller.clear();
                          }
                        });
                        _resendTimer?.cancel();
                      },
                      child: Text(
                        'Change Mobile Number',
                        style: TextStyle(color: brand.primaryColor),
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }
}
