import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:bodhi_staff_app/main.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  testWidgets('Staff App Initialization Test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      const ProviderScope(
        child: BodhiStaffApp(),
      ),
    );

    // Verify that the splash screen text exists
    expect(find.text('Bodhi Board'), findsOneWidget);
  });
}
