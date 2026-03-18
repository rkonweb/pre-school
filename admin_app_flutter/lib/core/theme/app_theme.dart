import 'package:flutter/material.dart';

/// Centralized Design System for the Staff Staff App.
/// Maps to the UI design file specified typography and role themes.
class AppTheme {
  // --- Colors ---
  static const Color backgroundLight = Color(0xFFF8FAFC);
  static const Color backgroundDark = Color(0xFF0F172A);
  
  static const Color surfaceLight = Colors.white;
  static const Color surfaceDark = Color(0xFF1E293B);

  static const Color mistLayer = Color(0x33FFFFFF);
  static const Color dividerLight = Color(0xFFE2E8F0);
  static const Color dividerDark = Color(0xFF334155);

  static const Color textPrimaryLight = Color(0xFF0F172A);
  static const Color textSecondaryLight = Color(0xFF64748B);
  
  // --- Role Themes (Gradients) ---
  static const LinearGradient teacherTheme = LinearGradient(
    colors: [Color(0xFFFF5733), Color(0xFFFF006E)], // Tangerine + Hot Pink from HTML
  );

  static const LinearGradient driverTheme = LinearGradient(
    colors: [Color(0xFF006BFF), Color(0xFF00D4AA)], // Electric Blue + Mint
  );

  static const LinearGradient adminTheme = LinearGradient(
    colors: [Color(0xFFFF9500), Color(0xFFFFCC02)], // Amber + Emerald
  );

  static const LinearGradient accountManagerTheme = LinearGradient(
    colors: [Color(0xFF4F46E5), Color(0xFF8B5CF6)], // Indigo + Violet
  );

  static const LinearGradient hrManagerTheme = LinearGradient(
    colors: [Color(0xFF0D9488), Color(0xFF10B981)], // Teal + Emerald
  );

  static const LinearGradient securityOfficerTheme = LinearGradient(
    colors: [Color(0xFF1E3A8A), Color(0xFFE11D48)], // Navy + Crimson
  );

  static const LinearGradient transportManagerTheme = LinearGradient(
    colors: [Color(0xFF166534), Color(0xFFF59E0B)], // Forest Green + Amber
  );

  // --- Icon Gradients ---
  static const LinearGradient iconAttend = LinearGradient(
    colors: [Color(0xFF4ECDC4), Color(0xFF44CF6C)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient iconMarks = LinearGradient(
    colors: [Color(0xFFA78BFA), Color(0xFF60A5FA)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient iconHomework = LinearGradient(
    colors: [Color(0xFFFB923C), Color(0xFFFBBF24)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient iconLeave = LinearGradient(
    colors: [Color(0xFF38BDF8), Color(0xFF818CF8)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient iconCircular = LinearGradient(
    colors: [Color(0xFFF472B6), Color(0xFFFB923C)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient iconParents = LinearGradient(
    colors: [Color(0xFF4ECDC4), Color(0xFF38BDF8)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient iconSchedule = LinearGradient(
    colors: [Color(0xFFFBBF24), Color(0xFFF472B6)], // Yellow to Pink (from nav-log)
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient iconReports = LinearGradient(
    colors: [Color(0xFF818CF8), Color(0xFFC084FC)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  // Helper to fetch the active theme gradient based on role
  static LinearGradient getRoleGradient(String role) {
    switch (role.toLowerCase()) {
      case 'teacher':
      case 'staff': return teacherTheme;
      case 'driver': return driverTheme;
      case 'admin': return adminTheme;
      case 'accountmanager': return accountManagerTheme;
      case 'hrmanager': return hrManagerTheme;
      case 'securityofficer': return securityOfficerTheme;
      case 'transportmanager': return transportManagerTheme;
      default: return adminTheme; 
    }
  }

  // --- Typography Guidelines ---
  // Note: These expect the fonts to be declared in pubspec.yaml
  // Headings -> Clash Display
  // UI Text -> Satoshi
  // Titles -> Cabinet Grotesk
  // System -> DM Mono

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      primaryColor: const Color(0xFF3B82F6),
      scaffoldBackgroundColor: backgroundLight,
      fontFamily: 'Satoshi', 
      cardColor: surfaceLight,
      dividerColor: dividerLight,
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontFamily: 'Clash Display', fontWeight: FontWeight.bold, color: textPrimaryLight),
        displayMedium: TextStyle(fontFamily: 'Clash Display', fontWeight: FontWeight.bold, color: textPrimaryLight),
        titleLarge: TextStyle(fontFamily: 'Cabinet Grotesk', fontWeight: FontWeight.w700, color: textPrimaryLight),
        bodyLarge: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.normal, color: textPrimaryLight),
        bodyMedium: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.normal, color: textSecondaryLight),
        labelSmall: TextStyle(fontFamily: 'DM Mono', color: textSecondaryLight),
      ),
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF3B82F6), brightness: Brightness.light),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: const Color(0xFF3B82F6),
      scaffoldBackgroundColor: backgroundDark,
      fontFamily: 'Satoshi',
      cardColor: surfaceDark,
      dividerColor: dividerDark,
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontFamily: 'Clash Display', fontWeight: FontWeight.bold, color: Colors.white),
        displayMedium: TextStyle(fontFamily: 'Clash Display', fontWeight: FontWeight.bold, color: Colors.white),
        titleLarge: TextStyle(fontFamily: 'Cabinet Grotesk', fontWeight: FontWeight.w700, color: Colors.white),
        bodyLarge: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.normal, color: Colors.white),
        bodyMedium: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.normal, color: Colors.white70),
        labelSmall: TextStyle(fontFamily: 'DM Mono', color: Colors.white54),
      ),
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF3B82F6), brightness: Brightness.dark),
    );
  }
}
