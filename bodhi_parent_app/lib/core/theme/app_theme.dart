import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // ── Premium Color Palette (Synced with HTML) ──
  static const Color primaryColor = Color(0xFF3B6EF8); // --accent
  static const Color primaryAccent = Color(0xFF4F7EFF); 
  static const Color secondaryColor = Color(0xFF00C9A7); // --teal
  static const Color accentColor = Color(0xFF8B5CF6); // Purple
  static const Color warningColor = Color(0xFFFF6B3D); // --warn
  static const Color errorColor = Color(0xFFFF6B3D); // --error
  static const Color successColor = secondaryColor; // --success
  static const Color goldColor = Color(0xFFF5A623); // --gold
  
  static const Color backgroundColor = Color(0xFFF5F7FF); // --bg
  static const Color darkBgColor = Color(0xFF0D0F1C);
  static const Color surfaceColor = Colors.white; // --surface
  static const Color surfaceColor2 = Color(0xFFEEF2FF); // --surface2
  
  static const Color textPrimary = Color(0xFF1A1D2E); // --text
  static const Color textSecondary = Color(0xFF4A5068); // --text2
  static const Color textTertiary = Color(0xFF8891B0); // --text3
  
  static const Color borderColor = Color(0x1F3B6EF8); // --border (rgba(59,110,248,.12))
  
  // ── Glassmorphism Styles (Optimized for Flutter Visibility) ──
  static BoxDecoration glassDecoration({
    double blur = 20.0, // Increased for premium feel
    double opacity = 0.1,
    Color color = Colors.white,
    BorderRadius? borderRadius,
    bool hasBorder = true,
    BoxShadow? shadow,
  }) {
    return BoxDecoration(
      color: color.withOpacity(opacity),
      borderRadius: borderRadius ?? BorderRadius.circular(24),
      border: hasBorder ? Border.all(
        color: primaryColor.withOpacity(0.12),
        width: 1.5,
      ) : null,
      boxShadow: [
        shadow ?? BoxShadow(
          color: primaryColor.withOpacity(0.07),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
      ],
    );
  }

  static ButtonStyle headerButtonStyle({
    Color backgroundColor = Colors.white,
    Color iconColor = textSecondary,
    double size = 36,
  }) {
    return ElevatedButton.styleFrom(
      backgroundColor: backgroundColor,
      foregroundColor: iconColor,
      minimumSize: Size(size, size),
      fixedSize: Size(size, size),
      padding: EdgeInsets.zero,
      elevation: 0,
      shadowColor: primaryColor.withOpacity(0.07),
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: borderColor),
      ),
    ).copyWith(
      elevation: MaterialStateProperty.resolveWith<double>((states) {
        if (states.contains(MaterialState.pressed)) return 2;
        return 4; // subtle shadow like `ibtn`
      }),
    );
  }

  static ThemeData get lightTheme {
    final textTheme = GoogleFonts.dmSansTextTheme().copyWith(
      headlineLarge: GoogleFonts.sora(
        fontSize: 32,
        fontWeight: FontWeight.w800,
        letterSpacing: -1,
        color: textPrimary,
      ),
      headlineMedium: GoogleFonts.sora(
        fontSize: 24,
        fontWeight: FontWeight.w800,
        color: textPrimary,
      ),
      titleLarge: GoogleFonts.sora(
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: textPrimary,
      ),
      titleMedium: GoogleFonts.dmSans(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: textPrimary,
      ),
      bodyLarge: GoogleFonts.dmSans(
        fontSize: 16,
        color: textSecondary,
      ),
      bodyMedium: GoogleFonts.dmSans(
        fontSize: 14,
        color: textSecondary,
      ),
      labelLarge: GoogleFonts.sora(
        fontSize: 12,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.2,
        color: textTertiary,
      ),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: accentColor,
        error: warningColor,
        surface: surfaceColor,
        background: backgroundColor,
      ),
      scaffoldBackgroundColor: backgroundColor,
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: textPrimary,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.sora(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: textPrimary,
        ),
      ),
      textTheme: textTheme,
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 56),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          textStyle: GoogleFonts.dmSans(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceColor,
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        labelStyle: GoogleFonts.dmSans(color: textSecondary),
        hintStyle: GoogleFonts.dmSans(color: textTertiary),
      ),
    );
  }
}
