import 'dart:convert';

class ChatConversation {
  final String id;
  final String studentId;
  final String type;
  final String participantType;
  final String? title;
  final DateTime lastMessageAt;
  final ChatStudent? student;
  final ChatMessage? lastMessage;

  ChatConversation({
    required this.id,
    required this.studentId,
    required this.type,
    required this.participantType,
    this.title,
    required this.lastMessageAt,
    this.student,
    this.lastMessage,
  });

  factory ChatConversation.fromJson(Map<String, dynamic> json) {
    return ChatConversation(
      id: json['id'],
      studentId: json['studentId'],
      type: json['type'],
      participantType: json['participantType'] ?? 'BOTH',
      title: json['title'],
      lastMessageAt: DateTime.parse(json['lastMessageAt']),
      student: json['student'] != null ? ChatStudent.fromJson(json['student']) : null,
      lastMessage: (json['messages'] != null && (json['messages'] as List).isNotEmpty)
          ? ChatMessage.fromJson(json['messages'][0])
          : null,
    );
  }
}

class ChatMessage {
  final String id;
  final String content;
  final String type;
  final String senderType;
  final String? senderId;
  final String senderName;
  final String conversationId;
  final DateTime createdAt;
  final String deliveryStatus;
  final bool isRead;
  final String status;
  final bool isFlagged;
  final String? flaggedReason;
  final ChatPoll? poll;

  ChatMessage({
    required this.id,
    required this.content,
    required this.type,
    required this.senderType,
    this.senderId,
    required this.senderName,
    required this.conversationId,
    required this.createdAt,
    required this.deliveryStatus,
    required this.isRead,
    required this.status,
    this.isFlagged = false,
    this.flaggedReason,
    this.poll,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'],
      content: json['content'],
      type: json['type'] ?? 'TEXT',
      senderType: json['senderType'],
      senderId: json['senderId'],
      senderName: json['senderName'],
      conversationId: json['conversationId'],
      createdAt: DateTime.parse(json['createdAt']),
      deliveryStatus: json['deliveryStatus'] ?? 'DELIVERED',
      isRead: json['isRead'] ?? false,
      status: json['status'] ?? 'SENT',
      isFlagged: json['isFlagged'] ?? false,
      flaggedReason: json['flaggedReason'],
      poll: json['poll'] != null ? ChatPoll.fromJson(json['poll']) : null,
    );
  }
}

class ChatPoll {
  final String id;
  final String question;
  final List<ChatPollOption> options;
  final DateTime? expiresAt;
  final List<ChatPollResponse> responses;

  ChatPoll({
    required this.id,
    required this.question,
    required this.options,
    this.expiresAt,
    this.responses = const [],
  });

  factory ChatPoll.fromJson(Map<String, dynamic> json) {
    var optionsList = jsonDecode(json['options'] as String) as List;
    return ChatPoll(
      id: json['id'],
      question: json['question'],
      options: optionsList.map((i) => ChatPollOption.fromJson(i)).toList(),
      expiresAt: json['expiresAt'] != null ? DateTime.parse(json['expiresAt']) : null,
      responses: (json['responses'] as List?)?.map((i) => ChatPollResponse.fromJson(i)).toList() ?? [],
    );
  }
}

class ChatPollOption {
  final String id;
  final String text;

  ChatPollOption({required this.id, required this.text});

  factory ChatPollOption.fromJson(Map<String, dynamic> json) {
    return ChatPollOption(id: json['id'], text: json['text']);
  }
}

class ChatPollResponse {
  final String id;
  final String userId;
  final String optionId;

  ChatPollResponse({required this.id, required this.userId, required this.optionId});

  factory ChatPollResponse.fromJson(Map<String, dynamic> json) {
    return ChatPollResponse(id: json['id'], userId: json['userId'], optionId: json['optionId']);
  }
}

class ChatBroadcast {
  final String id;
  final String title;
  final String content;
  final String status;
  final bool isFlagged;
  final String? flaggedReason;
  final DateTime createdAt;

  ChatBroadcast({
    required this.id,
    required this.title,
    required this.content,
    required this.status,
    this.isFlagged = false,
    this.flaggedReason,
    required this.createdAt,
  });

  factory ChatBroadcast.fromJson(Map<String, dynamic> json) {
    return ChatBroadcast(
      id: json['id'],
      title: json['title'],
      content: json['content'],
      status: json['status'],
      isFlagged: json['isFlagged'] ?? false,
      flaggedReason: json['flaggedReason'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

class ChatStudent {
  final String id;
  final String firstName;
  final String lastName;
  final String? avatar;

  ChatStudent({required this.id, required this.firstName, required this.lastName, this.avatar});

  factory ChatStudent.fromJson(Map<String, dynamic> json) {
    return ChatStudent(
      id: json['id'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      avatar: json['avatar'],
    );
  }

  String get fullName => '$firstName $lastName';
}
