import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/api/api_client.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'dashboard_provider.g.dart';

@riverpod
class DashboardData extends _$DashboardData {
  static const String _cacheKey = 'parent_dashboard_cache';

  @override
  FutureOr<Map<String, dynamic>> build() async {
    return _fetchData(isInitial: true);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchData(isInitial: false));
  }

  Future<Map<String, dynamic>> _fetchData({required bool isInitial}) async {
    final prefs = await SharedPreferences.getInstance();

    if (isInitial) {
      // Optimistically load from cache immediately
      final cachedString = prefs.getString(_cacheKey);
      if (cachedString != null) {
        try {
          final cachedData = jsonDecode(cachedString);
          
          // Trigger a silent background refresh
          _silentlyRefresh(prefs);
          
          return cachedData;
        } catch (e) {
          // Cache corruption, ignore and fetch fresh
        }
      }
    }

    // Normal fetch
    final apiClient = ref.read(apiClientProvider);
    final response = await apiClient.get('parent/home');

    if (response.statusCode == 200 && response.data['success'] == true) {
      final data = response.data;
      // Update cache
      await prefs.setString(_cacheKey, jsonEncode(data));
      return data;
    } else {
      throw Exception(response.data['error'] ?? 'Failed to fetch dashboard data');
    }
  }

  Future<void> _silentlyRefresh(SharedPreferences prefs) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.get('parent/home');

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data;
        // Check if data changed
        final oldDataString = prefs.getString(_cacheKey);
        final newDataString = jsonEncode(data);
        
        if (oldDataString != newDataString) {
          await prefs.setString(_cacheKey, newDataString);
          // Yield the new data to the UI seamlessly
          state = AsyncValue.data(data);
        }
      }
    } catch (e) {
      // Silent fail, keep showing cached data
    }
  }
}
