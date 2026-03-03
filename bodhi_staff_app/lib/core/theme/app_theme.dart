import 'package:flutter/material.dart';

/// World-Class Premium Theme: "Modern Education Ops"
/// Features soft glass, clean cards, subtle gradients, no heavy neon.
/// Follows a strict 8pt grid spacing and high-readability typography.
class AppTheme {
  // System Tokens (Colors)
  static const Color primary = Color(0xFF6366F1); // Soft Indigo
  static const Color primaryLight = Color(0xFF818CF8);
  static const Color primaryDark = Color(0xFF4F46E5);

  static const Color surface = Color(0xFFFFFFFF);
  static const Color background = Color(0xFFF8FAFC); // Slate 50

  static const Color textPrimary = Color(0xFF0F172A); // Slate 900
  static const Color textMuted = Color(0xFF64748B); // Slate 500

  static const Color success = Color(0xFF10B981); // Emerald
  static const Color warning = Color(0xFFF59E0B); // Amber
  static const Color danger = Color(0xFFEF4444); // Red

  // Border & Dividers
  static const Color border = Color(0xFFE2E8F0); // Slate 200

  // Spacing Tokens (8pt Grid)
  static const double s4 = 4.0;
  static const double s8 = 8.0;
  static const double s12 = 12.0;
  static const double s16 = 16.0;
  static const double s20 = 20.0;
  static const double s24 = 24.0;
  static const double s32 = 32.0;
  static const double s48 = 48.0;

  // BorderRadius
  static final BorderRadius radiusSmall = BorderRadius.circular(8.0);
  static final BorderRadius radiusMedium = BorderRadius.circular(16.0);
  static final BorderRadius radiusLarge = BorderRadius.circular(24.0);

  // Shadows (Soft, Premium)
  static final List<BoxShadow> softShadow = [
    BoxShadow(
      color: const Color(0xFF0F172A).withOpacity(0.04),
      blurRadius: 10,
      offset: const Offset(0, 4),
    ),
  ];

  /// The overarching Material Theme Data
  static ThemeData get lightTheme {
    return ThemeData(
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        primary: primary,
        background: background,
        surface: surface,
        error: danger,
      ),
      scaffoldBackgroundColor: background,
      textTheme: ThemeData.light().textTheme.copyWith(
            displayLarge: const TextStyle(
                color: textPrimary, fontWeight: FontWeight.bold),
            titleLarge: const TextStyle(
                color: textPrimary, fontWeight: FontWeight.w700, fontSize: 20),
            bodyLarge: const TextStyle(color: textPrimary, fontSize: 16),
            bodyMedium: const TextStyle(color: textMuted, fontSize: 14),
          ),
      appBarTheme: const AppBarTheme(
        backgroundColor: background,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: textPrimary),
        titleTextStyle: TextStyle(
            color: textPrimary, fontSize: 22, fontWeight: FontWeight.bold),
      ),
      cardTheme: CardTheme(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: radiusMedium,
          side: const BorderSide(color: border, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: s24, vertical: s16),
          shape: RoundedRectangleBorder(borderRadius: radiusMedium),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
      iconTheme: const IconThemeData(
        color: textMuted,
        size: 24,
      ),
    );
  }
}
