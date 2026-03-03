import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import '../api/api_client.dart';

class NotificationService {
  final ApiClient apiClient;
  bool _initialized = false;

  NotificationService(this.apiClient);

  Future<void> init() async {
    try {
      // Check if Firebase is initialized
      if (Firebase.apps.isEmpty) {
        if (kDebugMode) {
          print("Firebase not initialized. Skipping notification setup.");
        }
        return;
      }

      final fcm = FirebaseMessaging.instance;

      // Request permissions for platforms that need it
      if (Platform.isIOS || Platform.isMacOS) {
        await fcm.requestPermission(
          alert: true,
          badge: true,
          sound: true,
        );
      }

      // Get the token
      String? token = await fcm.getToken();
      if (token != null) {
        if (kDebugMode) {
          print("FCM Token: $token");
        }
        await _registerToken(token);
      }

      // Listen for token refreshes
      fcm.onTokenRefresh.listen((newToken) {
        _registerToken(newToken);
      });

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        if (kDebugMode) {
          print("Received foreground message: ${message.notification?.title}");
        }
      });

      // Handle background/terminated state messages clicking
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        if (kDebugMode) {
          print("User clicked on notification: ${message.data}");
        }
      });

      _initialized = true;
    } catch (e) {
      if (kDebugMode) {
        print("NotificationService init failed: $e");
      }
    }
  }

  Future<void> _registerToken(String token) async {
    try {
      await apiClient.post('parent/register-device', data: {
        'token': token,
        'deviceType': Platform.isIOS ? 'ios' : (Platform.isMacOS ? 'macos' : 'android'),
      });
      if (kDebugMode) {
        print("Successfully registered device token with backend");
      }
    } catch (e) {
      if (kDebugMode) {
        print("Failed to register device token: $e");
      }
    }
  }
}
