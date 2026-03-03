import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_client.dart';
import 'offline_sync_service.dart';

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError(); // Initialized in main.dart override
});

final offlineSyncServiceProvider = Provider<OfflineSyncService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final prefs = ref.watch(sharedPreferencesProvider);
  return OfflineSyncService(apiClient, prefs);
});
