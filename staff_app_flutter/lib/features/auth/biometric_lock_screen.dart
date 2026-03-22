import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';
import '../../core/services/biometric_service.dart';
import '../../core/state/auth_state.dart';
import 'package:go_router/go_router.dart';

class BiometricLockScreen extends ConsumerStatefulWidget {
  const BiometricLockScreen({super.key});
  @override ConsumerState<BiometricLockScreen> createState() => _BiometricLockScreenState();
}

class _BiometricLockScreenState extends ConsumerState<BiometricLockScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulse;
  bool _authenticating = false;
  bool _failed = false;
  List<BiometricType> _types = [];

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))
      ..repeat(reverse: true);
    _loadTypes();
    // auto-trigger on open
    WidgetsBinding.instance.addPostFrameCallback((_) => _authenticate());
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  Future<void> _loadTypes() async {
    final svc = ref.read(biometricServiceProvider);
    final types = await svc.availableTypes();
    if (mounted) setState(() => _types = types);
  }

  bool get _hasFace => _types.contains(BiometricType.face);

  Future<void> _authenticate() async {
    if (_authenticating) return;
    setState(() { _authenticating = true; _failed = false; });

    final svc = ref.read(biometricServiceProvider);
    final ok = await svc.authenticate(
      reason: 'Use biometrics or Face ID to unlock EduSphere Staff',
    );

    if (!mounted) return;

    if (ok) {
      await svc.recordActivity();
      ref.read(appLockedProvider.notifier).state = false;
    } else {
      setState(() { _authenticating = false; _failed = true; });
    }
  }

  void _logout() {
    ref.read(isAuthenticatedProvider.notifier).state = false;
    ref.read(userProfileProvider.notifier).state = null;
    ref.read(appLockedProvider.notifier).state = false;
    context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(userProfileProvider);
    final initials = (user?.name ?? 'U')
        .trim().split(' ').where((w) => w.isNotEmpty)
        .take(2).map((w) => w[0].toUpperCase()).join();

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Blurred gradient background
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF0F0E1A), Color(0xFF1A0E3A), Color(0xFF2D1458)],
                begin: Alignment.topLeft, end: Alignment.bottomRight,
              ),
            ),
          ),
          // Glass circles deco
          _decoCircle(top: -60, left: -40, size: 220, color: const Color(0xFFFF5733), opacity: 0.08),
          _decoCircle(top: 100, right: -60, size: 180, color: const Color(0xFF6366F1), opacity: 0.1),
          _decoCircle(bottom: 60, left: -30, size: 160, color: const Color(0xFF10B981), opacity: 0.06),

          // Main content
          SafeArea(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(),

                // ── Avatar ──────────────────────────────────────────────────
                AnimatedBuilder(
                  animation: _pulse,
                  builder: (_, child) => Container(
                    width: 110, height: 110,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFFF5733).withOpacity(0.15 + _pulse.value * 0.2),
                          blurRadius: 30 + _pulse.value * 20,
                          spreadRadius: 4,
                        ),
                      ],
                    ),
                    child: child,
                  ),
                  child: Container(
                    width: 110, height: 110,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: [Color(0xFFFF5733), Color(0xFFFF006E)],
                        begin: Alignment.topLeft, end: Alignment.bottomRight,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Text(initials, style: const TextStyle(
                      fontFamily: 'Cabinet Grotesk', fontSize: 36,
                      fontWeight: FontWeight.w900, color: Colors.white)),
                  ),
                ),

                const SizedBox(height: 22),

                // Name & school
                Text(user?.name ?? 'Staff', style: const TextStyle(
                  fontFamily: 'Cabinet Grotesk', fontSize: 22,
                  fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 4),
                Text(user?.schoolName ?? 'EduSphere', style: TextStyle(
                  fontFamily: 'Satoshi', fontSize: 13,
                  color: Colors.white.withOpacity(0.55))),

                const SizedBox(height: 48),

                // ── Lock icon + unlock button ────────────────────────────────
                GestureDetector(
                  onTap: _authenticating ? null : _authenticate,
                  child: AnimatedBuilder(
                    animation: _pulse,
                    builder: (_, child) => Container(
                      width: 76, height: 76,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          colors: [Color(0xFFFF5733), Color(0xFFFF006E)],
                          begin: Alignment.topLeft, end: Alignment.bottomRight,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFFF5733).withOpacity(0.3 + _pulse.value * 0.25),
                            blurRadius: 24 + _pulse.value * 12,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: child,
                    ),
                    child: _authenticating
                      ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5)
                      : Icon(
                          _hasFace ? Icons.face_retouching_natural_rounded : Icons.fingerprint_rounded,
                          color: Colors.white, size: 34),
                  ),
                ),

                const SizedBox(height: 18),

                // Status text
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: _authenticating
                    ? Text(
                        _hasFace ? 'Scanning Face ID…' : 'Scanning Fingerprint…',
                        key: const ValueKey('scanning'),
                        style: TextStyle(fontFamily: 'Satoshi', fontSize: 14,
                          color: Colors.white.withOpacity(0.7)))
                    : _failed
                      ? Column(
                          key: const ValueKey('failed'),
                          children: [
                            const Text('Authentication failed', style: TextStyle(
                              fontFamily: 'Satoshi', fontSize: 14, color: Color(0xFFFF5733))),
                            const SizedBox(height: 8),
                            GestureDetector(
                              onTap: _authenticate,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                                decoration: BoxDecoration(
                                  border: Border.all(color: const Color(0xFFFF5733).withOpacity(0.6)),
                                  borderRadius: BorderRadius.circular(14)),
                                child: const Text('Try Again', style: TextStyle(
                                  fontFamily: 'Satoshi', fontSize: 13,
                                  fontWeight: FontWeight.w700, color: Color(0xFFFF5733))),
                              ),
                            ),
                          ],
                        )
                      : Text(
                          _hasFace ? 'Tap to use Face ID' : 'Tap to use fingerprint',
                          key: const ValueKey('idle'),
                          style: TextStyle(fontFamily: 'Satoshi', fontSize: 14,
                            color: Colors.white.withOpacity(0.7))),
                ),

                const Spacer(),

                // ── Sign out option ──────────────────────────────────────────
                GestureDetector(
                  onTap: _logout,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 32),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(Icons.logout_rounded, size: 15, color: Colors.white.withOpacity(0.35)),
                      const SizedBox(width: 6),
                      Text('Sign out instead', style: TextStyle(
                        fontFamily: 'Satoshi', fontSize: 13,
                        color: Colors.white.withOpacity(0.35))),
                    ]),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _decoCircle({double? top, double? bottom, double? left, double? right,
      required double size, required Color color, required double opacity}) {
    return Positioned(
      top: top, bottom: bottom, left: left, right: right,
      child: Container(
        width: size, height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color.withOpacity(opacity),
        ),
      ),
    );
  }
}
