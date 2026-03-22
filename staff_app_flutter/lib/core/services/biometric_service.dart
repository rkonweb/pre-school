// ─── Biometric Service ─────────────────────────────────────────────────────
// Manages biometric enrollment state, OTP verification, and lock/unlock flow.
// SharedPrefs keys:
//   biometric_lock         → bool: whether biometric lock is enabled
//   biometric_enrolled_at  → String (ISO): when biometric was enrolled
//   session_last_active    → String (ISO): last recorded activity timestamp

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ─── Providers ────────────────────────────────────────────────────────────────

final biometricServiceProvider = Provider<BiometricService>((ref) => BiometricService());

/// Is biometric lock currently enabled?
final biometricEnabledProvider = StateProvider<bool>((ref) => false);

/// Is the app currently locked (needs biometric unlock)?
final appLockedProvider = StateProvider<bool>((ref) => false);

// ─── Session Timeout ──────────────────────────────────────────────────────────

const _sessionTimeoutMinutes = 15;

// ─── Service ──────────────────────────────────────────────────────────────────

class BiometricService {
  final _auth = LocalAuthentication();

  // ── Availability ────────────────────────────────────────────────────────────

  Future<bool> isAvailable() async {
    try {
      final canCheck = await _auth.canCheckBiometrics;
      final isSupported = await _auth.isDeviceSupported();
      return canCheck || isSupported;
    } catch (_) {
      return false;
    }
  }

  Future<List<BiometricType>> availableTypes() async {
    try {
      return await _auth.getAvailableBiometrics();
    } catch (_) {
      return [];
    }
  }

  // ── Prefs ────────────────────────────────────────────────────────────────────

  Future<bool> isEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('biometric_lock') ?? false;
  }

  Future<void> enable() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('biometric_lock', true);
    await prefs.setString('biometric_enrolled_at', DateTime.now().toIso8601String());
    await recordActivity(); // start session immediately
  }

  Future<void> disable() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('biometric_lock', false);
    await prefs.remove('biometric_enrolled_at');
  }

  // ── Session management ────────────────────────────────────────────────────────

  Future<void> recordActivity() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('session_last_active', DateTime.now().toIso8601String());
  }

  Future<bool> isSessionExpired() async {
    final enabled = await isEnabled();
    if (!enabled) return false;

    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('session_last_active');
    if (raw == null) return true; // never recorded → treat as expired

    final last = DateTime.tryParse(raw);
    if (last == null) return true;

    final elapsed = DateTime.now().difference(last);
    return elapsed.inMinutes >= _sessionTimeoutMinutes;
  }

  // ── Authenticate with device biometrics ───────────────────────────────────

  Future<bool> authenticate({String reason = 'Verify your identity to continue'}) async {
    try {
      return await _auth.authenticate(localizedReason: reason);
    } catch (_) {
      return false;
    }
  }
}
