import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:flutter/foundation.dart';

// Provides the initialized remote configuration
final remoteConfigProvider = FutureProvider<FirebaseRemoteConfig>((ref) async {
  // Wait to ensure Firebase is initialized in main before calling this
  final remoteConfig = FirebaseRemoteConfig.instance;

  await remoteConfig.setConfigSettings(RemoteConfigSettings(
    fetchTimeout: const Duration(minutes: 1),
    minimumFetchInterval: kDebugMode ? const Duration(hours: 1) : const Duration(minutes: 15),
  ));

  // Default configuration definitions matching design system features
  await remoteConfig.setDefaults(const {
    "dashboard_hero_enabled": true,
    "announcements_visible": true,
    "feature_role_switching": true,
  });

  await remoteConfig.fetchAndActivate();

  return remoteConfig;
});

// A stream provider simulating a WebSocket / FCM connection for Realtime alerts
final realTimeAlertsProvider = StreamProvider<String>((ref) async* {
  // In a real application, this would bind to FirebaseMessaging.instance.onMessage
  // For the architectural prototype, we yield a periodic mock ping every minute.
  yield "Connected to secure socket";
  
  while (true) {
    await Future.delayed(const Duration(minutes: 1));
    yield "Check your latest attendance reports!";
  }
});
