import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../state/alert_state.dart';
import '../state/auth_state.dart';

class AlertEngine {
  final Ref ref;
  Timer? _timer;

  AlertEngine(this.ref);

  void start() {
    // Only start for ADMIN role
    final role = ref.read(activeRoleProvider);
    if (role.toUpperCase().trim() != 'ADMIN') return;

    // Simulate periodic alerts for demonstration
    _timer = Timer.periodic(const Duration(minutes: 5), (timer) {
      _generateMockAlert();
    });

    // Generate one immediately for demo if Admin just logged in
    Future.delayed(const Duration(seconds: 5), () {
      _generateMockAlert();
    });
  }

  void stop() {
    _timer?.cancel();
  }

  void _generateMockAlert() {
    final alerts = [
      SchoolAlert(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: 'New Admission Inquiry',
        message: 'A new inquiry has been received for Grade 1. Tap to review.',
        severity: AlertSeverity.info,
        timestamp: DateTime.now(),
      ),
      SchoolAlert(
        id: (DateTime.now().millisecondsSinceEpoch + 1).toString(),
        title: 'Fee Collection Update',
        message: 'Daily collection target of ₹50,000 has been reached!',
        severity: AlertSeverity.info,
        timestamp: DateTime.now(),
      ),
      SchoolAlert(
        id: (DateTime.now().millisecondsSinceEpoch + 2).toString(),
        title: 'High Staff Absence',
        message: '5 staff members are absent today. Check substitution status.',
        severity: AlertSeverity.warning,
        timestamp: DateTime.now(),
      ),
    ];

    // Pick one randomly
    final alert = (alerts..shuffle()).first;
    ref.read(alertsProvider.notifier).addAlert(alert);
  }
}

final alertEngineProvider = Provider<AlertEngine>((ref) {
  return AlertEngine(ref);
});
