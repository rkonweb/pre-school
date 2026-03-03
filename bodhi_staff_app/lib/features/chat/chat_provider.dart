import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'chat_repository.dart';
import 'models/chat_models.dart';

final chatProvider = Provider((ref) => ref.read(chatRepositoryProvider));

final conversationsProvider = StateNotifierProvider<ConversationsNotifier, AsyncValue<List<ChatConversation>>>((ref) {
  return ConversationsNotifier(ref.read(chatRepositoryProvider));
});

class ConversationsNotifier extends StateNotifier<AsyncValue<List<ChatConversation>>> {
  final ChatRepository _repository;
  Timer? _timer;

  ConversationsNotifier(this._repository) : super(const AsyncValue.loading()) {
    fetchConversations();
    // Start polling for conversations
    _timer = Timer.periodic(const Duration(seconds: 15), (_) => fetchConversations(silent: true));
  }

  Future<void> fetchConversations({bool silent = false}) async {
    if (!silent) state = const AsyncValue.loading();
    try {
      final conversations = await _repository.getConversations();
      state = AsyncValue.data(conversations);
    } catch (e, st) {
      if (!silent) state = AsyncValue.error(e, st);
    }
  }

  Future<ChatConversation> createConversation(String studentId, String participantType) async {
    final conversation = await _repository.createConversation(studentId, participantType);
    await fetchConversations(silent: true);
    return conversation;
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

final messagesProvider = StateNotifierProvider.family<MessagesNotifier, AsyncValue<List<ChatMessage>>, String>((ref, conversationId) {
  return MessagesNotifier(ref.read(chatRepositoryProvider), conversationId);
});

class MessagesNotifier extends StateNotifier<AsyncValue<List<ChatMessage>>> {
  final ChatRepository _repository;
  final String conversationId;
  Timer? _timer;

  MessagesNotifier(this._repository, this.conversationId) : super(const AsyncValue.loading()) {
    fetchMessages();
    // Start polling for messages in active chat
    _timer = Timer.periodic(const Duration(seconds: 5), (_) => fetchMessages(silent: true));
  }

  Future<void> fetchMessages({bool silent = false}) async {
    try {
      final messages = await _repository.getMessages(conversationId);
      state = AsyncValue.data(messages);
    } catch (e, st) {
      if (!silent) state = AsyncValue.error(e, st);
    }
  }

  Future<void> sendMessage(String content, {String type = 'TEXT', Map<String, dynamic>? pollData}) async {
    try {
      final newMessage = await _repository.sendMessage(conversationId, content, type: type, pollData: pollData);
      if (state.hasValue) {
        state = AsyncValue.data([...state.value!, newMessage]);
      }
    } catch (e) {
       // Error handled by UI or logging
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

final broadcastsProvider = FutureProvider<List<ChatBroadcast>>((ref) async {
  return ref.read(chatRepositoryProvider).getBroadcasts();
});

final studentsForChatProvider = FutureProvider<List<ChatStudent>>((ref) async {
  // We can fetch this from the shared database or existing student repository if available.
  // For now, we'll fetch from conversations or a dedicated students endpoint if we have one.
  // Actually, let's just list students available to the teacher.
  // We'll use the DioClient to fetch students.
  final dio = ref.read(chatRepositoryProvider).dio;
  final response = await dio.get('/api/mobile/v1/staff/students');
  if (response.data['success'] == true) {
    return (response.data['data'] as List).map((e) => ChatStudent.fromJson(e)).toList();
  }
  return [];
});
