import 'package:flutter/material.dart';

class AppTheme {
  // Brand
  static const Color a1 = Color(0xFF6366F1);
  static const Color a2 = Color(0xFF818CF8);
  static const Color a3 = Color(0xFF4F46E5);

  // Backgrounds
  static const Color bg = Color(0xFFF7F9FF);
  static const Color bg2 = Color(0xFFEEF3FF);
  // Using #EBEBF0 for main background as in HTML body
  static const Color canvas = Color(0xFFEBEBF0);
  
  // Text
  static const Color t1 = Color(0xFF0F0F23);
  static const Color t2 = Color(0xFF1E1B4B);
  static const Color t3 = Color(0xFF6B7280);
  static const Color t4 = Color(0xFF9CA3AF);

  // Vibrant Card Palette (Backgrounds)
  static const Color sageBg = Color(0xFFECFDF5);
  static const Color sageText = Color(0xFF065F46);
  static const Color sageAcc = Color(0xFF10B981);
  static const Color sageBorder = Color(0x4010B981); // approx 25% opacity

  static const Color lavenderBg = Color(0xFFF5F3FF);
  static const Color lavenderText = Color(0xFF4C1D95);
  static const Color lavenderAcc = Color(0xFF8B5CF6);
  static const Color lavenderBorder = Color(0x408B5CF6);

  static const Color peachBg = Color(0xFFFFF7ED);
  static const Color peachText = Color(0xFF9A3412);
  static const Color peachAcc = Color(0xFFF97316);
  static const Color peachBorder = Color(0x40F97316);

  static const Color skyBg = Color(0xFFEFF6FF);
  static const Color skyText = Color(0xFF1E40AF);
  static const Color skyAcc = Color(0xFF3B82F6);
  static const Color skyBorder = Color(0x403B82F6);

  static const Color roseBg = Color(0xFFFFF1F2);
  static const Color roseText = Color(0xFF881337);
  static const Color roseAcc = Color(0xFFF43F5E);
  static const Color roseBorder = Color(0x40F43F5E);

  static const Color mintBg = Color(0xFFF0FDF4);
  static const Color mintText = Color(0xFF14532D);
  static const Color mintAcc = Color(0xFF22C55E);
  static const Color mintBorder = Color(0x4022C55E);

  static const Color goldBg = Color(0xFFFFFBEB);
  static const Color goldText = Color(0xFF713F12);
  static const Color goldAcc = Color(0xFFEAB308);
  static const Color goldBorder = Color(0x40EAB308);

  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: a1,
      scaffoldBackgroundColor: canvas,
      colorScheme: const ColorScheme.light(
        primary: a1,
        secondary: a2,
        background: canvas,
        surface: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: t1,
        elevation: 0,
      ),
    );
  }
}
