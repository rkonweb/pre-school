import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SchoolBrandState {
  final Color primaryColor;
  final Color secondaryColor;
  final String schoolName;
  final String? schoolLogoUrl;
  final String? schoolSlug;
  final String parentName;
  final String? activeStudentPhotoUrl;
  final List<Map<String, dynamic>> activities;

  const SchoolBrandState({
    this.primaryColor = const Color(0xFF2563EB),
    this.secondaryColor = const Color(0xFFFACC15),
    this.schoolName = 'Bodhi Board Pre-School',
    this.schoolLogoUrl,
    this.schoolSlug,
    this.parentName = '',
    this.activeStudentPhotoUrl,
    this.activities = const [],
  });

  SchoolBrandState copyWith({
    Color? primaryColor,
    Color? secondaryColor,
    String? schoolName,
    String? schoolLogoUrl,
    String? schoolSlug,
    String? parentName,
    String? activeStudentPhotoUrl,
    List<Map<String, dynamic>>? activities,
  }) {
    return SchoolBrandState(
      primaryColor: primaryColor ?? this.primaryColor,
      secondaryColor: secondaryColor ?? this.secondaryColor,
      schoolName: schoolName ?? this.schoolName,
      schoolLogoUrl: schoolLogoUrl ?? this.schoolLogoUrl,
      schoolSlug: schoolSlug ?? this.schoolSlug,
      parentName: parentName ?? this.parentName,
      activeStudentPhotoUrl: activeStudentPhotoUrl ?? this.activeStudentPhotoUrl,
      activities: activities ?? this.activities,
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
  static const _keyParentName = 'parent_name';

  static const _keyStudentPhoto = 'active_student_photo';
  static const _keyActivities = 'dashboard_activities';

  Future<void> applyFromAuthResponse(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    final schoolData = data['school'] as Map<String, dynamic>? ?? {};
    final userData = data['user'] as Map<String, dynamic>? ?? {};
    final studentsData = data['students'] as List<dynamic>? ?? [];
    final rawActivities = data['activities'] as List<dynamic>? ?? [];

    final rawPrimary = schoolData['primaryColor'] as String? ?? schoolData['brandColor'] as String? ?? '';
    final rawSecondary = schoolData['secondaryColor'] as String? ?? '';
    final schoolName = schoolData['name'] as String? ?? 'School';
    final logoUrl = schoolData['logo'] as String? ?? '';
    final schoolSlug = schoolData['slug'] as String? ?? '';
    final parentName = userData['name'] as String? ?? '';
    
    String? studentPhotoUrl;
    if (studentsData.isNotEmpty) {
      studentPhotoUrl = studentsData.first['avatar'] as String?;
    }

    final primary = _parseHexColor(rawPrimary) ?? state.primaryColor;
    final secondary = _parseHexColor(rawSecondary) ?? state.secondaryColor;

    await prefs.setInt(_keyPrimary, primary.value);
    await prefs.setInt(_keySecondary, secondary.value);
    await prefs.setString(_keyName, schoolName);
    await prefs.setString(_keyLogo, logoUrl);
    await prefs.setString(_keySlug, schoolSlug);
    if (parentName.isNotEmpty) await prefs.setString(_keyParentName, parentName);
    if (studentPhotoUrl != null) await prefs.setString(_keyStudentPhoto, studentPhotoUrl);

    final activities = rawActivities.map((e) => e as Map<String, dynamic>).toList();
    await prefs.setString(_keyActivities, jsonEncode(activities));

    state = state.copyWith(
      primaryColor: primary,
      secondaryColor: secondary,
      schoolName: schoolName,
      schoolLogoUrl: logoUrl,
      schoolSlug: schoolSlug,
      parentName: parentName.isNotEmpty ? parentName : state.parentName,
      activeStudentPhotoUrl: studentPhotoUrl,
      activities: activities,
    );
  }

  Future<void> restoreFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final primaryVal = prefs.getInt(_keyPrimary);
    final secondaryVal = prefs.getInt(_keySecondary);
    final schoolName = prefs.getString(_keyName) ?? 'Bodhi Board';
    final logoUrl = prefs.getString(_keyLogo) ?? '';
    final schoolSlug = prefs.getString(_keySlug) ?? '';
    final parentName = prefs.getString(_keyParentName) ?? '';
    final studentPhotoUrl = prefs.getString(_keyStudentPhoto);
    final activitiesStr = prefs.getString(_keyActivities);

    List<Map<String, dynamic>> loadedActivities = [];
    if (activitiesStr != null && activitiesStr.isNotEmpty) {
      try {
        final decoded = jsonDecode(activitiesStr) as List;
        loadedActivities = decoded.map((e) => e as Map<String, dynamic>).toList();
      } catch (_) {}
    }

    if (primaryVal != null) {
      state = state.copyWith(
        primaryColor: Color(primaryVal),
        secondaryColor: secondaryVal != null ? Color(secondaryVal) : state.secondaryColor,
        schoolName: schoolName,
        schoolLogoUrl: logoUrl,
        schoolSlug: schoolSlug,
        parentName: parentName,
        activeStudentPhotoUrl: studentPhotoUrl,
        activities: loadedActivities,
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

final schoolBrandProvider = StateNotifierProvider<SchoolBrandNotifier, SchoolBrandState>(
  (ref) => SchoolBrandNotifier(),
);
