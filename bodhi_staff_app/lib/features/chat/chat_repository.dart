import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/dio_client.dart';
import 'models/chat_models.dart';

final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  final mainDio = DioClient.instance;
  // Create a chat-specific Dio that points to the root API instead of staff v1
  final baseUrl = mainDio.options.baseUrl.split('/api/')[0]; 
  final chatDio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: mainDio.options.connectTimeout,
    receiveTimeout: mainDio.options.receiveTimeout,
  ));
  
  // Reuse interceptors for auth token
  chatDio.interceptors.addAll(mainDio.interceptors);
  
  return ChatRepository(chatDio);
});

class ChatRepository {
  final Dio dio;
  
  ChatRepository(this.dio);

  Future<List<ChatConversation>> getConversations() async {
    final response = await dio.get('/api/chat/conversations');
    if (response.data['success'] == true) {
      return (response.data['conversations'] as List)
          .map((e) => ChatConversation.fromJson(e))
          .toList();
    }
    throw Exception(response.data['error'] ?? 'Failed to fetch conversations');
  }

  Future<ChatConversation> createConversation(String studentId, String participantType) async {
    final response = await dio.post('/api/chat/conversations', data: {
      'studentId': studentId,
      'participantType': participantType,
    });
    if (response.data['success'] == true) {
      return ChatConversation.fromJson(response.data['conversation']);
    }
    throw Exception(response.data['error'] ?? 'Failed to create conversation');
  }

  Future<List<ChatMessage>> getMessages(String conversationId) async {
    final response = await dio.get('/api/chat/messages', queryParameters: {
      'conversationId': conversationId,
    });
    if (response.data['success'] == true) {
      return (response.data['messages'] as List)
          .map((e) => ChatMessage.fromJson(e))
          .toList();
    }
    throw Exception(response.data['error'] ?? 'Failed to fetch messages');
  }

  Future<void> markAsRead(String conversationId) async {
    try {
      await dio.post('/api/chat/mark-read', data: {
        'conversationId': conversationId,
      });
    } catch (e) {
      // Sliently fail if read receipt fails
    }
  }

  Future<List<String>> rewriteMessage(String content, {String? studentName}) async {
    final response = await dio.post('/api/chat/rewrite-polite', data: {
      'text': content,
      if (studentName != null) 'studentName': studentName,
    });
    if (response.data['success'] == true && response.data['options'] != null) {
      return List<String>.from(response.data['options']);
    }
    throw Exception(response.data['error'] ?? 'Failed to rewrite message');
  }

  Future<ChatMessage> sendMessage(String conversationId, String content, {String type = 'TEXT', Map<String, dynamic>? pollData}) async {
    final response = await dio.post('/api/chat/messages', data: {
      'conversationId': conversationId,
      'content': content,
      'type': type,
      if (pollData != null) 'pollData': pollData,
    });
    if (response.data['success'] == true) {
      return ChatMessage.fromJson(response.data['message']);
    }
    throw Exception(response.data['error'] ?? 'Failed to send message');
  }

  Future<List<ChatBroadcast>> getBroadcasts() async {
    final response = await dio.get('/api/chat/broadcasts');
    if (response.data['success'] == true) {
      return (response.data['broadcasts'] as List)
          .map((e) => ChatBroadcast.fromJson(e))
          .toList();
    }
    throw Exception(response.data['error'] ?? 'Failed to fetch broadcasts');
  }

  Future<ChatBroadcast> createBroadcast(String title, String content) async {
    final response = await dio.post('/api/chat/broadcasts', data: {
      'title': title,
      'content': content,
    });
    if (response.data['success'] == true) {
      return ChatBroadcast.fromJson(response.data['broadcast']);
    }
    throw Exception(response.data['error'] ?? 'Failed to create broadcast');
  }
}
