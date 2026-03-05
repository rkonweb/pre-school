import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

class AppNotification {
  final String id;
  final String title;
  final String message;
  final String type;
  final bool isRead;
  final String? readAt;
  final String createdAt;
  final String? actionUrl;

  AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    this.readAt,
    required this.createdAt,
    this.actionUrl,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
    id: json['id'] ?? '',
    title: json['title'] ?? '',
    message: json['message'] ?? '',
    type: json['type'] ?? 'INFO',
    isRead: json['isRead'] ?? false,
    readAt: json['readAt'],
    createdAt: json['createdAt'] ?? DateTime.now().toIso8601String(),
    actionUrl: json['actionUrl'],
  );
}

class NotificationsState {
  final List<AppNotification> notifications;
  final int unreadCount;
  final int totalPages;
  final int currentPage;

  NotificationsState({
    required this.notifications,
    required this.unreadCount,
    required this.totalPages,
    required this.currentPage,
  });
}

final notificationsProvider = FutureProvider.family<NotificationsState, int>((ref, page) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get(
    'parent/notifications',
    queryParameters: {'page': page.toString()},
  );

  if (response.data['success'] == true) {
    final data = response.data['data'];
    return NotificationsState(
      notifications: (data['notifications'] as List? ?? [])
          .map((e) => AppNotification.fromJson(e)).toList(),
      unreadCount: data['unreadCount'] ?? 0,
      totalPages: data['totalPages'] ?? 1,
      currentPage: data['currentPage'] ?? 1,
    );
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load notifications');
  }
});
