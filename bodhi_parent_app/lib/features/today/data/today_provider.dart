import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/api/api_client.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'today_provider.g.dart';

@riverpod
class TodayTimelineData extends _$TodayTimelineData {

  String _getCacheKey(String studentId) => 'parent_today_cache_$studentId';

  @override
  FutureOr<Map<String, dynamic>> build(String studentId) async {
    return _fetchData(studentId: studentId, isInitial: true);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchData(studentId: studentId, isInitial: false));
  }

  Future<Map<String, dynamic>> _fetchData({required String studentId, required bool isInitial}) async {
    final prefs = await SharedPreferences.getInstance();
    final cacheKey = _getCacheKey(studentId);

    if (isInitial) {
      // Optimistically load from cache immediately
      final cachedString = prefs.getString(cacheKey);
      if (cachedString != null) {
        try {
          final cachedData = jsonDecode(cachedString);
          
          // Trigger a silent background refresh
          _silentlyRefresh(prefs, studentId, cacheKey);
          
          return cachedData;
        } catch (e) {
          // Cache corruption, ignore and fetch fresh
        }
      }
    }

    // Normal fetch
    final apiClient = ref.read(apiClientProvider);
    final response = await apiClient.get('parent/today', queryParameters: {'studentId': studentId});

    if (response.statusCode == 200 && response.data['success'] == true) {
      final data = response.data;
      // Update cache
      await prefs.setString(cacheKey, jsonEncode(data));
      return data;
    } else {
      throw Exception(response.data['error'] ?? 'Failed to fetch today timeline');
    }
  }

  Future<void> _silentlyRefresh(SharedPreferences prefs, String studentId, String cacheKey) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.get('parent/today', queryParameters: {'studentId': studentId});

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data;
        // Check if data changed
        final oldDataString = prefs.getString(cacheKey);
        final newDataString = jsonEncode(data);
        
        if (oldDataString != newDataString) {
          await prefs.setString(cacheKey, newDataString);
          // Yield the new data to the UI seamlessly
          state = AsyncValue.data(data);
        }
      }
    } catch (e) {
      // Silent fail, keep showing cached data
    }
  }
}
