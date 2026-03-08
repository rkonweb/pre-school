import 'package:universal_io/io.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:go_router/go_router.dart';
import '../api/api_client.dart';
import '../router/router.dart';
import 'emergency_alarm_service.dart';

class NotificationService {
  final ApiClient apiClient;
  bool _initialized = false;

  NotificationService(this.apiClient);

  Future<void> init() async {
    try {
      if (Firebase.apps.isEmpty) {
        if (kDebugMode) print("Firebase not initialized. Skipping notification setup.");
        return;
      }

      // Initialize alarm service early
      await EmergencyAlarmService.instance.init();

      final fcm = FirebaseMessaging.instance;

      // Request permissions — including critical alerts for iOS (if Apple entitlement granted)
      await fcm.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        criticalAlert: true, // iOS critical alerts (needs Apple entitlement)
      );

      // Get the token
      final token = await fcm.getToken();
      if (token != null) {
        if (kDebugMode) print("FCM Token: $token");
        await _registerToken(token);
      }

      // Listen for token refreshes
      fcm.onTokenRefresh.listen(_registerToken);

      // ── Foreground messages ────────────────────────────────────────────────
      // When app is open, FCM doesn't auto-show heads-up — we handle it here
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        if (kDebugMode) print("Foreground message: ${message.notification?.title} | type: ${message.data['type']}");

        if (message.data['type'] == 'EMERGENCY_ALERT') {
          _triggerEmergencyAlarm(message);
        }
      });

      // ── Background / terminated: tapped notification ───────────────────────
      FirebaseMessaging.onMessageOpenedApp.listen(_handleMessage);

      // ── App launched from a notification ──────────────────────────────────
      final initialMessage = await FirebaseMessaging.instance.getInitialMessage();
      if (initialMessage != null) {
        _handleMessage(initialMessage);
      }

      _initialized = true;
    } catch (e) {
      if (kDebugMode) print("NotificationService init failed: $e");
    }
  }

  /// Starts the looping alarm and navigates to the full-screen alarm overlay.
  void _triggerEmergencyAlarm(RemoteMessage message) async {
    final title = message.notification?.title ?? message.data['title'] ?? '⚠️ Emergency Alert';
    final body = message.notification?.body ?? message.data['body'] ?? 'Please read the emergency notice.';
    final alertType = message.data['alertType'] ?? 'GENERAL';

    // Capture context BEFORE the async gap
    final context = navigatorKey.currentContext;

    await EmergencyAlarmService.instance.startAlarm(title: title, message: body);

    if (context != null && context.mounted) {
      context.push('/emergency-alarm', extra: {
        'title': title,
        'message': body,
        'alertType': alertType,
      });
    }
  }


  void _handleMessage(RemoteMessage message) {
    if (kDebugMode) print("Notification tapped: ${message.data}");

    final type = message.data['type'];
    final context = navigatorKey.currentContext;
    if (context == null) return;

    switch (type) {
      case 'EMERGENCY_ALERT':
        // If the alarm isn't already active (e.g. app was terminated), start it
        if (!EmergencyAlarmService.instance.isActive) {
          _triggerEmergencyAlarm(message);
        } else {
          context.push('/emergency-alarm', extra: {
            'title': message.notification?.title ?? 'Emergency Alert',
            'message': message.notification?.body ?? '',
            'alertType': message.data['alertType'] ?? 'GENERAL',
          });
        }
        break;
      case 'CIRCULAR':
        context.push('/circulars');
        break;
      case 'EVENT':
        context.push('/events');
        break;
      case 'BROADCAST':
      case 'FEE_REMINDER':
        context.push('/notifications');
        break;
      default:
        break;
    }
  }

  Future<void> _registerToken(String token) async {
    try {
      await apiClient.post('parent/register-device', data: {
        'token': token,
        'deviceType': Platform.isIOS ? 'ios' : (Platform.isMacOS ? 'macos' : 'android'),
      });
      if (kDebugMode) print("Device token registered");
    } catch (e) {
      if (kDebugMode) print("Failed to register device token: $e");
    }
  }
}
