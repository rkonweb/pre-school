import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/api/api_client.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'messages_provider.g.dart';

@riverpod
class MessagesThreadData extends _$MessagesThreadData {

  String _getCacheKey(String studentId) => 'parent_messages_threads_$studentId';

  @override
  FutureOr<Map<String, dynamic>> build(String studentId) async {
    final timer = Timer.periodic(const Duration(seconds: 15), (_) async {
      final prefs = await SharedPreferences.getInstance();
      _silentlyRefresh(prefs, studentId, _getCacheKey(studentId));
    });
    ref.onDispose(() => timer.cancel());
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
      final cachedString = prefs.getString(cacheKey);
      if (cachedString != null) {
        try {
          final cachedData = jsonDecode(cachedString);
          _silentlyRefresh(prefs, studentId, cacheKey);
          return cachedData;
        } catch (e) {
          // ignore
        }
      }
    }

    final apiClient = ref.read(apiClientProvider);
    final response = await apiClient.get('parent/messages', queryParameters: {'studentId': studentId});

    if (response.statusCode == 200 && response.data['success'] == true) {
      final data = response.data;
      await prefs.setString(cacheKey, jsonEncode(data));
      return data;
    } else {
      throw Exception(response.data['error'] ?? 'Failed to fetch messages');
    }
  }

  Future<void> _silentlyRefresh(SharedPreferences prefs, String studentId, String cacheKey) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.get('parent/messages', queryParameters: {'studentId': studentId});

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data;
        final oldDataString = prefs.getString(cacheKey);
        final newDataString = jsonEncode(data);
        
        if (oldDataString != newDataString) {
          await prefs.setString(cacheKey, newDataString);
          state = AsyncValue.data(data);
        }
      }
    } catch (e) {
      // ignore
    }
  }
}
