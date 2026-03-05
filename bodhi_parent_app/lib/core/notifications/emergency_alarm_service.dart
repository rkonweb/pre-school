import 'dart:io';
import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

/// Singleton service that controls the emergency alarm:
/// - Plays a looping siren through the alarm audio stream (bypasses DND/silent on Android)
/// - Shows a full-screen notification even on a locked screen (Android full-screen intent)
/// - Activates the wake lock so the screen turns on
class EmergencyAlarmService {
  EmergencyAlarmService._();
  static final EmergencyAlarmService instance = EmergencyAlarmService._();

  final _player = AudioPlayer();
  final _localNotifications = FlutterLocalNotificationsPlugin();
  bool _isActive = false;
  bool _initialized = false;

  static const _channelId = 'emergency_alarm_channel';
  static const _channelName = 'Emergency Alarms';
  static const _notificationId = 9999;

  Future<void> init() async {
    if (_initialized) return;
    try {
      // ── Android alarm channel ──────────────────────────────────────────────
      // AudioAttributesUsage.alarm bypasses silent/vibrate/DND on Android
      const androidChannel = AndroidNotificationChannel(
        _channelId,
        _channelName,
        description: 'Full-volume emergency alerts that bypass silent mode',
        importance: Importance.max,
        playSound: true,
        enableVibration: true,
        enableLights: true,
        ledColor: Color.fromARGB(255, 255, 0, 0),
        audioAttributesUsage: AudioAttributesUsage.alarm,
      );

      await _localNotifications
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(androidChannel);

      const initSettings = InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: DarwinInitializationSettings(
          requestAlertPermission: true,
          requestBadgePermission: true,
          requestSoundPermission: true,
          requestCriticalPermission: true, // if Apple entitlement granted
        ),
      );

      await _localNotifications.initialize(initSettings);
      
      // Configure audioplayer for alarm usage
      await _player.setReleaseMode(ReleaseMode.loop);
      await _player.setPlayerMode(PlayerMode.mediaPlayer);
      
      _initialized = true;
      if (kDebugMode) print('[EmergencyAlarmService] Initialized');
    } catch (e) {
      if (kDebugMode) print('[EmergencyAlarmService] Init error: $e');
    }
  }

  bool get isActive => _isActive;

  Future<void> startAlarm({
    required String title,
    required String message,
  }) async {
    if (_isActive) return; // already ringing
    await init();

    try {
      _isActive = true;

      // 1. Wake the screen
      await WakelockPlus.enable();

      // 2. Play looping alarm sound at max volume
      await _player.setVolume(1.0);
      await _player.play(AssetSource('sounds/emergency_alarm.wav'));

      // 3. Show full-screen intent notification (covers lock screen on Android)
      if (Platform.isAndroid) {
        const androidDetails = AndroidNotificationDetails(
          _channelId,
          _channelName,
          channelDescription: 'Emergency alert that bypasses silent mode',
          importance: Importance.max,
          priority: Priority.max,
          fullScreenIntent: true,
          ongoing: true,
          autoCancel: false,
          enableVibration: true,
          playSound: true,
          audioAttributesUsage: AudioAttributesUsage.alarm,
          color: Color.fromARGB(255, 211, 47, 47),
          ledColor: Color.fromARGB(255, 255, 0, 0),
          ledOnMs: 300,
          ledOffMs: 300,
          visibility: NotificationVisibility.public,
          category: AndroidNotificationCategory.alarm,
        );

        await _localNotifications.show(
          _notificationId,
          '🚨 $title',
          message,
          const NotificationDetails(android: androidDetails),
        );
      }

      if (kDebugMode) print('[EmergencyAlarmService] Alarm started: $title');
    } catch (e) {
      _isActive = false;
      if (kDebugMode) print('[EmergencyAlarmService] startAlarm error: $e');
    }
  }

  Future<void> stopAlarm() async {
    if (!_isActive) return;
    try {
      _isActive = false;
      await _player.stop();
      await WakelockPlus.disable();
      await _localNotifications.cancel(_notificationId);
      if (kDebugMode) print('[EmergencyAlarmService] Alarm stopped');
    } catch (e) {
      if (kDebugMode) print('[EmergencyAlarmService] stopAlarm error: $e');
    }
  }

  Future<void> dispose() async {
    await stopAlarm();
    await _player.dispose();
  }
}
