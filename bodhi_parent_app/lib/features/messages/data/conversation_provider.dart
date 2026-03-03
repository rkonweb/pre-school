import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/api/api_client.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/sync/offline_sync_service.dart';
import '../../../core/sync/sync_provider.dart';

part 'conversation_provider.g.dart';

@riverpod
class ConversationData extends _$ConversationData {

  String _getCacheKey(String conversationId) => 'parent_conversation_$conversationId';

  @override
  FutureOr<Map<String, dynamic>> build(String conversationId) async {
    final timer = Timer.periodic(const Duration(seconds: 5), (_) async {
      final prefs = await SharedPreferences.getInstance();
      _silentlyRefresh(prefs, conversationId, _getCacheKey(conversationId));
    });
    ref.onDispose(() => timer.cancel());
    return _fetchData(conversationId: conversationId, isInitial: true);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchData(conversationId: conversationId, isInitial: false));
  }

  Future<Map<String, dynamic>> _fetchData({required String conversationId, required bool isInitial}) async {
    final prefs = await SharedPreferences.getInstance();
    final cacheKey = _getCacheKey(conversationId);

    if (isInitial) {
      final cachedString = prefs.getString(cacheKey);
      if (cachedString != null) {
        try {
          final cachedData = jsonDecode(cachedString);
          _silentlyRefresh(prefs, conversationId, cacheKey);
          return cachedData;
        } catch (e) {
          // ignore
        }
      }
    }

    final apiClient = ref.read(apiClientProvider);
    final response = await apiClient.get('parent/messages/$conversationId');

    if (response.statusCode == 200 && response.data['success'] == true) {
      final data = response.data;
      await prefs.setString(cacheKey, jsonEncode(data));
      return data;
    } else {
      throw Exception(response.data['error'] ?? 'Failed to fetch conversation');
    }
  }

  Future<void> _silentlyRefresh(SharedPreferences prefs, String conversationId, String cacheKey) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.get('parent/messages/$conversationId');

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

  Future<String?> sendMessage(String content) async {
    final syncService = ref.read(offlineSyncServiceProvider);
    
    // Create optimistic message object
    final tempId = 'temp_${DateTime.now().millisecondsSinceEpoch}';
    final newMessage = {
      'id': tempId,
      'content': content,
      'senderId': 'parent', // simplified
      'senderType': 'PARENT',
      'createdAt': DateTime.now().toIso8601String(),
      'status': 'SENDING'
    };

    // Optimistically update state
    if (state.value != null) {
      final currentState = state.value!;
      final currentMessages = List<dynamic>.from(currentState['messages'] ?? []);
      currentMessages.add(newMessage);
      state = AsyncValue.data({...currentState, 'messages': currentMessages});
    }

    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.post(
          'parent/messages/$conversationId', 
          data: {'content': content}
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        // Replace temp message with real one from server
        final serverMessage = response.data['message'];
        if (state.value != null) {
          final currentState = state.value!;
          final currentMessages = List<dynamic>.from(currentState['messages'] ?? []);
          final index = currentMessages.indexWhere((m) => m['id'] == tempId);
          if (index != -1) {
            currentMessages[index] = serverMessage;
            state = AsyncValue.data({...currentState, 'messages': currentMessages});
          }
        }
        return null; // Success
      } else {
         throw Exception(response.data['error'] ?? "Server failed");
      }
    } catch (e) {
      // Remove optimistic message if explicit error
      final errorMessage = e.toString().replaceAll('Exception: ', '');
      if (state.value != null) {
        final currentState = state.value!;
        final currentMessages = List<dynamic>.from(currentState['messages'] ?? []);
        currentMessages.removeWhere((m) => m['id'] == tempId);
        state = AsyncValue.data({...currentState, 'messages': currentMessages});
      }
      return errorMessage;
    }
  }
}
