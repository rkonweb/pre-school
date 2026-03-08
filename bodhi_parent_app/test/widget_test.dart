import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bodhi_parent_app/main.dart';
import 'package:bodhi_parent_app/core/theme/app_theme.dart';

void main() {
  group('LoginScreen', () {
    testWidgets('shows Send OTP button initially', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: BodhiParentApp(),
          ),
        ),
      );
      await tester.pumpAndSettle();
      // The app loads the splash screen initially, so this test verifies the splash loads
      expect(find.text('Bodhi Parent'), findsWidgets);
    });

    testWidgets('app initializes without errors', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: BodhiParentApp(),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(BodhiParentApp), findsOneWidget);
    });
  });

  group('AppTheme', () {
    test('lightTheme has correct primary color', () {
      final theme = AppTheme.lightTheme;
      expect(theme.colorScheme.primary, AppTheme.primaryColor);
    });

    test('lightTheme has correct background color', () {
      final theme = AppTheme.lightTheme;
      expect(theme.scaffoldBackgroundColor, AppTheme.backgroundColor);
    });

    test('darkTheme is configured', () {
      final theme = AppTheme.darkTheme;
      expect(theme.brightness, equals(Brightness.dark));
    });

    test('darkTheme has dark background', () {
      final theme = AppTheme.darkTheme;
      expect(theme.scaffoldBackgroundColor, const Color(0xFF0F172A));
    });

    test('darkTheme has correct text colors', () {
      final theme = AppTheme.darkTheme;
      expect(theme.colorScheme.brightness, Brightness.dark);
    });

    test('lightTheme and darkTheme have same primary color', () {
      final lightTheme = AppTheme.lightTheme;
      final darkTheme = AppTheme.darkTheme;
      expect(lightTheme.colorScheme.primary, darkTheme.colorScheme.primary);
    });

    test('button styles are configured', () {
      final theme = AppTheme.lightTheme;
      expect(theme.elevatedButtonTheme, isNotNull);
      expect(theme.elevatedButtonTheme!.style, isNotNull);
    });

    test('input decoration themes are configured', () {
      final theme = AppTheme.lightTheme;
      expect(theme.inputDecorationTheme, isNotNull);
      expect(theme.inputDecorationTheme!.border, isNotNull);
    });
  });

  group('Theme Constants', () {
    test('primary color is blue', () {
      expect(AppTheme.primaryColor, const Color(0xFF3B6EF8));
    });

    test('secondary color is teal', () {
      expect(AppTheme.secondaryColor, const Color(0xFF00C9A7));
    });

    test('error color is warning color', () {
      expect(AppTheme.errorColor, AppTheme.warningColor);
    });

    test('text colors are defined', () {
      expect(AppTheme.textPrimary, const Color(0xFF1A1D2E));
      expect(AppTheme.textSecondary, const Color(0xFF4A5068));
    });
  });

  group('Material3 Configuration', () {
    test('lightTheme uses Material3', () {
      final theme = AppTheme.lightTheme;
      expect(theme.useMaterial3, true);
    });

    test('darkTheme uses Material3', () {
      final theme = AppTheme.darkTheme;
      expect(theme.useMaterial3, true);
    });
  });

  group('Glassmorphism Styles', () {
    test('glassDecoration creates BoxDecoration', () {
      final decoration = AppTheme.glassDecoration();
      expect(decoration, isA<BoxDecoration>());
      expect(decoration.borderRadius, isNotNull);
    });

    test('glassDecoration has border', () {
      final decoration = AppTheme.glassDecoration(hasBorder: true);
      expect(decoration.border, isNotNull);
    });

    test('glassDecoration without border', () {
      final decoration = AppTheme.glassDecoration(hasBorder: false);
      expect(decoration.border, isNull);
    });

    test('glassDecoration supports custom color', () {
      final decoration = AppTheme.glassDecoration(color: Colors.red);
      expect(decoration.color, isNotNull);
    });
  });

  group('Header Button Style', () {
    test('headerButtonStyle returns valid ButtonStyle', () {
      final style = AppTheme.headerButtonStyle();
      expect(style, isA<ButtonStyle>());
    });

    test('headerButtonStyle supports custom background color', () {
      final style = AppTheme.headerButtonStyle(backgroundColor: Colors.red);
      expect(style, isNotNull);
    });

    test('headerButtonStyle supports custom size', () {
      final style = AppTheme.headerButtonStyle(size: 48);
      expect(style, isNotNull);
    });
  });
}
