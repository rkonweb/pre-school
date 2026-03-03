import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import 'notification_service.dart';

final notificationServiceProvider = Provider<NotificationService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return NotificationService(apiClient);
});
