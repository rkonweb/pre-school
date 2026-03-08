// lib/core/config/app_config.dart
//
// Two-tier configuration:
//   1. Build-time defaults  — set via --dart-define (CI secrets, local.properties)
//   2. Runtime overrides    — fetched from the school's ERP after login, cached in
//                             SharedPreferences by SchoolConfigService.
//
// Always use the getter form (AppConfig.razorpayKeyId) rather than the const
// (AppConfig.razorpayKeyIdFallback) so you automatically get the runtime value.

import 'package:flutter/foundation.dart';
import 'school_config_service.dart';

class AppConfig {
  // ── Build-time base URL (Android emulator default vs Web default) ───────────
  static String get apiBaseUrl {
    const defaultApi = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (defaultApi.isNotEmpty) return defaultApi;
    return kIsWeb
        ? 'http://localhost:3000/api/mobile/v1/'
        : 'http://10.0.2.2:3000/api/mobile/v1/';
  }

  static String get wsBaseUrl {
    const defaultWs = String.fromEnvironment('WS_BASE_URL', defaultValue: '');
    if (defaultWs.isNotEmpty) return defaultWs;
    return kIsWeb ? 'ws://localhost:3000' : 'ws://10.0.2.2:3000';
  }

  static const bool isProduction = bool.fromEnvironment(
    'IS_PRODUCTION',
    defaultValue: false,
  );

  // ── Build-time Razorpay fallback (override by ERP school config) ───────────
  // This is used ONLY when SchoolConfig hasn't been fetched yet (e.g., first
  // launch before login). After login, AppConfig.razorpayKeyId returns the
  // key configured by the school admin in the ERP settings.
  static const String razorpayKeyIdFallback = String.fromEnvironment(
    'RAZORPAY_KEY',
    defaultValue: 'rzp_test_XXXXXXXXXX',
  );

  // ── Runtime getters — prefer these everywhere ──────────────────────────────

  /// Razorpay publishable key — set by school admin in ERP Login Settings.
  /// Falls back to the build-time RAZORPAY_KEY if config hasn't loaded yet.
  static String get razorpayKeyId =>
      SchoolConfigService.current.razorpayKeyId;

  /// Google Maps API key — set by school admin in ERP settings.
  /// On Android the key must also be in local.properties / CI secret
  /// (AndroidManifest reads it at native startup via manifestPlaceholders).
  /// On iOS this value is passed to GMSServices.provideAPIKey() at runtime.
  static String? get googleMapsKey =>
      SchoolConfigService.current.googleMapsKey;

  /// Effective API base URL — uses the ERP-configured URL if provided,
  /// otherwise falls back to the build-time constant.
  static String get effectiveApiBaseUrl =>
      SchoolConfigService.current.apiBaseUrl ?? apiBaseUrl;

  /// Effective WebSocket base URL.
  static String get effectiveWsBaseUrl =>
      SchoolConfigService.current.wsBaseUrl ?? wsBaseUrl;

  /// School display name from ERP config.
  static String get schoolName => SchoolConfigService.current.schoolName;
}
