import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Holds the school's current branding colors and the logged-in staff member's info.
class SchoolBrandState {
  final Color primaryColor;
  final Color secondaryColor;
  final String schoolName;
  final String? schoolLogoUrl;
  final String? schoolSlug;
  // Staff member info
  final String staffName;
  final String? staffPhotoUrl;

  const SchoolBrandState({
    this.primaryColor = const Color(0xFFFFD500),
    this.secondaryColor = const Color(0xFF2B2B2B),
    this.schoolName = 'Bodhi Board Pre-School',
    this.schoolLogoUrl,
    this.schoolSlug,
    this.staffName = '',
    this.staffPhotoUrl,
  });

  /// Full URL for the staff photo, prepending the base URL if it's a relative path.
  String? get fullStaffPhotoUrl {
    if (staffPhotoUrl == null || staffPhotoUrl!.isEmpty) return null;
    if (staffPhotoUrl!.startsWith('http')) return staffPhotoUrl;
    // Prepend the dev/production base URL
    return 'http://localhost:3000${staffPhotoUrl!.startsWith('/') ? '' : '/'}$staffPhotoUrl';
  }

  /// Returns 1-2 uppercase initials from the staff name.
  String get staffInitials {
    if (staffName.isEmpty) return 'ST';
    final parts = staffName.trim().split(RegExp(r'\s+'));
    if (parts.length == 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1))
        .toUpperCase();
  }

  SchoolBrandState copyWith({
    Color? primaryColor,
    Color? secondaryColor,
    String? schoolName,
    String? schoolLogoUrl,
    String? schoolSlug,
    String? staffName,
    String? staffPhotoUrl,
  }) {
    return SchoolBrandState(
      primaryColor: primaryColor ?? this.primaryColor,
      secondaryColor: secondaryColor ?? this.secondaryColor,
      schoolName: schoolName ?? this.schoolName,
      schoolLogoUrl: schoolLogoUrl ?? this.schoolLogoUrl,
      schoolSlug: schoolSlug ?? this.schoolSlug,
      staffName: staffName ?? this.staffName,
      staffPhotoUrl: staffPhotoUrl ?? this.staffPhotoUrl,
    );
  }
}

class SchoolBrandNotifier extends StateNotifier<SchoolBrandState> {
  SchoolBrandNotifier() : super(const SchoolBrandState());

  static const _keyPrimary = 'school_primary_color';
  static const _keySecondary = 'school_secondary_color';
  static const _keyName = 'school_name';
  static const _keyLogo = 'school_logo_url';
  static const _keySlug = 'school_slug';
  static const _keyStaffName = 'staff_name';
  static const _keyStaffPhoto = 'staff_photo_url';

  /// Called after a successful login/me fetch with server response data.
  Future<void> applyFromAuthResponse(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();

    final schoolData = data['school'] as Map<String, dynamic>? ?? {};
    final userData = data['user'] as Map<String, dynamic>? ?? {};

    final rawPrimary = schoolData['primaryColor'] as String? ??
                       schoolData['brandColor'] as String? ?? '';
    final rawSecondary = schoolData['secondaryColor'] as String? ?? '';
    final schoolName = schoolData['name'] as String? ??
                       userData['schoolName'] as String? ?? 'School';
    final logoUrl = schoolData['logo'] as String? ?? '';
    final schoolSlug = schoolData['slug'] as String? ??
                       userData['schoolSlug'] as String? ?? '';

    // Staff info from user object
    final staffName = userData['name'] as String? ?? '';
    final staffPhotoUrl = userData['photo'] as String? ?? '';

    final primary = _parseHexColor(rawPrimary) ?? state.primaryColor;
    final secondary = _parseHexColor(rawSecondary) ?? state.secondaryColor;

    // Persist all values
    await prefs.setInt(_keyPrimary, primary.value);
    await prefs.setInt(_keySecondary, secondary.value);
    await prefs.setString(_keyName, schoolName);
    await prefs.setString(_keyLogo, logoUrl);
    await prefs.setString(_keySlug, schoolSlug);
    if (staffName.isNotEmpty) await prefs.setString(_keyStaffName, staffName);
    if (staffPhotoUrl.isNotEmpty) await prefs.setString(_keyStaffPhoto, staffPhotoUrl);

    state = state.copyWith(
      primaryColor: primary,
      secondaryColor: secondary,
      schoolName: schoolName,
      schoolLogoUrl: logoUrl,
      schoolSlug: schoolSlug,
      staffName: staffName.isNotEmpty ? staffName : state.staffName,
      staffPhotoUrl: staffPhotoUrl.isNotEmpty ? staffPhotoUrl : state.staffPhotoUrl,
    );
  }

  /// Restore all persisted values from SharedPreferences on app start.
  Future<void> restoreFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final primaryVal = prefs.getInt(_keyPrimary);
    final secondaryVal = prefs.getInt(_keySecondary);
    final schoolName = prefs.getString(_keyName) ?? 'Bodhi Board Pre-School';
    final logoUrl = prefs.getString(_keyLogo) ?? '';
    final schoolSlug = prefs.getString(_keySlug) ?? '';
    final staffName = prefs.getString(_keyStaffName) ?? '';
    final staffPhotoUrl = prefs.getString(_keyStaffPhoto) ?? '';

    if (primaryVal != null) {
      state = state.copyWith(
        primaryColor: Color(primaryVal),
        secondaryColor: secondaryVal != null ? Color(secondaryVal) : state.secondaryColor,
        schoolName: schoolName,
        schoolLogoUrl: logoUrl,
        schoolSlug: schoolSlug,
        staffName: staffName,
        staffPhotoUrl: staffPhotoUrl.isNotEmpty ? staffPhotoUrl : null,
      );
    }
  }

  Color? _parseHexColor(String? hex) {
    if (hex == null || hex.isEmpty) return null;
    final clean = hex.replaceAll('#', '').replaceAll('0x', '');
    if (clean.length == 6) {
      final val = int.tryParse('FF$clean', radix: 16);
      return val != null ? Color(val) : null;
    }
    if (clean.length == 8) {
      final val = int.tryParse(clean, radix: 16);
      return val != null ? Color(val) : null;
    }
    return null;
  }
}

final schoolBrandProvider =
    StateNotifierProvider<SchoolBrandNotifier, SchoolBrandState>(
  (ref) => SchoolBrandNotifier(),
);
