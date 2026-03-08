// lib/core/config/school_config_service.dart
//
// Fetches school configuration from the ERP's settings endpoint after login.
// The school admin configures keys (Razorpay, Maps, etc.) in the ERP Login
// Settings page; this service pulls them down and caches them in SharedPreferences
// so every part of the app can read them synchronously.

import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_client.dart';
import 'app_config.dart';

// ─── Model ────────────────────────────────────────────────────────────────────

class SchoolConfig {
  /// School identity
  final String schoolName;
  final String? schoolLogoUrl;
  final String? schoolAddress;
  final String? supportPhone;
  final String? supportEmail;

  /// Payment gateway — Razorpay key set in ERP Settings → Payment Gateway
  final String razorpayKeyId;

  /// Maps — Google Maps API key (used on iOS at runtime via GMSServices)
  final String? googleMapsKey;

  /// Feature flags — controls which modules are visible in the parent app
  final bool enableTransport;
  final bool enableStore;
  final bool enablePayments;
  final bool enablePtm;
  final bool enableLibrary;
  final bool enableHostel;
  final bool enableHealth;

  /// Server config (may differ per deployment)
  final String? apiBaseUrl;
  final String? wsBaseUrl;

  /// Raw config map for forward-compatibility
  final Map<String, dynamic> raw;

  const SchoolConfig({
    required this.schoolName,
    this.schoolLogoUrl,
    this.schoolAddress,
    this.supportPhone,
    this.supportEmail,
    required this.razorpayKeyId,
    this.googleMapsKey,
    this.enableTransport = true,
    this.enableStore = true,
    this.enablePayments = true,
    this.enablePtm = true,
    this.enableLibrary = true,
    this.enableHostel = false,
    this.enableHealth = true,
    this.apiBaseUrl,
    this.wsBaseUrl,
    this.raw = const {},
  });

  factory SchoolConfig.fromJson(Map<String, dynamic> json) {
    final features = json['features'] as Map<String, dynamic>? ?? {};
    final payment = json['payment'] as Map<String, dynamic>? ?? {};
    final maps = json['maps'] as Map<String, dynamic>? ?? {};

    return SchoolConfig(
      schoolName: json['schoolName'] as String? ?? 'Little Chanakyass',
      schoolLogoUrl: json['schoolLogo'] as String?,
      schoolAddress: json['schoolAddress'] as String?,
      supportPhone: json['supportPhone'] as String?,
      supportEmail: json['supportEmail'] as String?,
      razorpayKeyId: payment['razorpayKeyId'] as String?
          ?? json['razorpayKeyId'] as String?
          ?? AppConfig.razorpayKeyIdFallback,
      googleMapsKey: maps['googleMapsKey'] as String?
          ?? json['googleMapsKey'] as String?,
      enableTransport: features['transport'] as bool? ?? true,
      enableStore: features['store'] as bool? ?? true,
      enablePayments: features['payments'] as bool? ?? true,
      enablePtm: features['ptm'] as bool? ?? true,
      enableLibrary: features['library'] as bool? ?? true,
      enableHostel: features['hostel'] as bool? ?? false,
      enableHealth: features['health'] as bool? ?? true,
      apiBaseUrl: json['apiBaseUrl'] as String?,
      wsBaseUrl: json['wsBaseUrl'] as String?,
      raw: json,
    );
  }

  Map<String, dynamic> toJson() => raw.isNotEmpty ? raw : {
    'schoolName': schoolName,
    'schoolLogo': schoolLogoUrl,
    'schoolAddress': schoolAddress,
    'supportPhone': supportPhone,
    'supportEmail': supportEmail,
    'payment': {'razorpayKeyId': razorpayKeyId},
    'maps': {'googleMapsKey': googleMapsKey},
    'features': {
      'transport': enableTransport,
      'store': enableStore,
      'payments': enablePayments,
      'ptm': enablePtm,
      'library': enableLibrary,
      'hostel': enableHostel,
      'health': enableHealth,
    },
  };

  /// Fallback config used when the server hasn't responded yet
  static const SchoolConfig defaults = SchoolConfig(
    schoolName: 'Little Chanakyass',
    razorpayKeyId: 'rzp_test_XXXXXXXXXX',
  );
}

// ─── Service ──────────────────────────────────────────────────────────────────

class SchoolConfigService {
  static const _cacheKey = 'school_config_json';
  static SchoolConfig? _cached;

  /// Returns the in-memory cached config, or defaults if not yet loaded.
  static SchoolConfig get current => _cached ?? SchoolConfig.defaults;

  /// Loads config from SharedPreferences (fast, sync-like via await).
  /// Call this in app startup before the first frame.
  static Future<SchoolConfig> loadCached() async {
    if (_cached != null) return _cached!;
    try {
      final prefs = await SharedPreferences.getInstance();
      final json = prefs.getString(_cacheKey);
      if (json != null) {
        _cached = SchoolConfig.fromJson(
          jsonDecode(json) as Map<String, dynamic>,
        );
        return _cached!;
      }
    } catch (e) {
      debugPrint('SchoolConfigService.loadCached error: $e');
    }
    return SchoolConfig.defaults;
  }

  /// Fetches fresh config from the ERP and caches it.
  /// Called automatically after successful login.
  static Future<SchoolConfig> fetchAndCache(ApiClient apiClient) async {
    try {
      final response = await apiClient.get('school/config');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'] as Map<String, dynamic>?
            ?? response.data as Map<String, dynamic>;
        final config = SchoolConfig.fromJson(data);
        await _persist(config);
        _cached = config;
        return config;
      }
    } catch (e) {
      debugPrint('SchoolConfigService.fetchAndCache error: $e');
    }
    // Return whatever is cached (or defaults) — don't crash on network errors
    return current;
  }

  static Future<void> _persist(SchoolConfig config) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_cacheKey, jsonEncode(config.toJson()));
    } catch (e) {
      debugPrint('SchoolConfigService._persist error: $e');
    }
  }

  /// Clears the cache on logout so the next login fetches fresh config.
  static Future<void> clear() async {
    _cached = null;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_cacheKey);
    } catch (_) {}
  }
}

// ─── Riverpod Provider ────────────────────────────────────────────────────────

/// Reactive provider — notified when config is refreshed after login.
/// Use [ref.watch(schoolConfigProvider)] to react to config changes in UI.
final schoolConfigProvider = StateProvider<SchoolConfig>((ref) {
  return SchoolConfigService.current;
});

/// Convenience provider to check if a feature is enabled.
final featureProvider = Provider.family<bool, String>((ref, feature) {
  final config = ref.watch(schoolConfigProvider);
  switch (feature) {
    case 'transport':  return config.enableTransport;
    case 'store':      return config.enableStore;
    case 'payments':   return config.enablePayments;
    case 'ptm':        return config.enablePtm;
    case 'library':    return config.enableLibrary;
    case 'hostel':     return config.enableHostel;
    case 'health':     return config.enableHealth;
    default:           return true;
  }
});
