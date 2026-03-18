import 'package:flutter_riverpod/flutter_riverpod.dart';

class SchoolAlert {
  final String id;
  final String title;
  final String message;
  final AlertSeverity severity;
  final DateTime timestamp;
  bool isRead;

  SchoolAlert({
    required this.id,
    required this.title,
    required this.message,
    this.severity = AlertSeverity.info,
    required this.timestamp,
    this.isRead = false,
  });
}

enum AlertSeverity { info, warning, critical }

class AlertNotifier extends StateNotifier<List<SchoolAlert>> {
  AlertNotifier() : super([]);

  void addAlert(SchoolAlert alert) {
    state = [alert, ...state];
  }

  void markAsRead(String id) {
    state = state.map((a) => a.id == id ? SchoolAlert(
      id: a.id,
      title: a.title,
      message: a.message,
      severity: a.severity,
      timestamp: a.timestamp,
      isRead: true,
    ) : a).toList();
  }

  void clearAll() {
    state = [];
  }
}

final alertsProvider = StateNotifierProvider<AlertNotifier, List<SchoolAlert>>((ref) {
  return AlertNotifier();
});

final unreadAlertsCountProvider = Provider<int>((ref) {
  return ref.watch(alertsProvider).where((a) => !a.isRead).length;
});
