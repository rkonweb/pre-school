import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class TeacherChatThreadView extends StatefulWidget {
  final String title;
  final String subtitle;
  final List<Color> gradient;
  final IconData? icon;

  const TeacherChatThreadView({
    super.key,
    required this.title,
    required this.subtitle,
    required this.gradient,
    this.icon,
  });

  @override
  State<TeacherChatThreadView> createState() => _TeacherChatThreadViewState();
}

class _TeacherChatThreadViewState extends State<TeacherChatThreadView> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<ChatMessage> messages = [
    ChatMessage(
      text: 'Reminder: PTM is on Saturday, March 15. Please update all student progress reports by Friday EOD.',
      time: '10:02 AM',
      isMe: false,
      senderInitials: 'AM',
      senderGradient: [const Color(0xFFD97706), const Color(0xFFF59E0B)],
      date: 'Monday, 3 Mar',
    ),
    ChatMessage(
      text: 'Noted! Also, please collect signed leave forms from staff who applied for the 14th.',
      time: '10:17 AM',
      isMe: false,
      senderInitials: 'MP',
      senderGradient: [const Color(0xFF0D9488), const Color(0xFF06B6D4)],
    ),
    ChatMessage(
      text: "Got it. I'll update 8-A progress reports today itself.",
      time: '10:24 AM',
      isMe: true,
      status: MessageStatus.read,
    ),
    ChatMessage(
      text: 'Good morning everyone 👋 Staff meeting today has been moved to 4:30 PM — Conference Hall B.',
      time: '8:58 AM',
      isMe: false,
      senderInitials: 'AM',
      senderGradient: [const Color(0xFFD97706), const Color(0xFFF59E0B)],
      date: 'Today',
    ),
    ChatMessage(
      text: 'Thanks for the heads up!',
      time: '9:03 AM',
      isMe: false,
      senderInitials: 'RG',
      senderGradient: [const Color(0xFF7C3AED), const Color(0xFFA78BFA)],
    ),
    ChatMessage(
      text: 'Will the Q4 exam schedule also be shared today?',
      time: '9:15 AM',
      isMe: false,
      senderInitials: 'MP',
      senderGradient: [const Color(0xFF0D9488), const Color(0xFF06B6D4)],
    ),
    ChatMessage(
      text: 'Yes — exam dates, PTM slots, and annual day committee assignments. Please come prepared.',
      time: '9:41 AM',
      isMe: false,
      senderInitials: 'AM',
      senderGradient: [const Color(0xFFD97706), const Color(0xFFF59E0B)],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          _buildHeader(),
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                itemCount: messages.length,
                itemBuilder: (context, index) {
                  final msg = messages[index];
                  final showDate = msg.date != null;
                  
                  return Column(
                    children: [
                      if (showDate) _buildDateDivider(msg.date!),
                      _buildMessageBubble(msg),
                      if (index == messages.length - 1) _buildTypingIndicator(),
                    ],
                  );
                },
              ),
            ),
            _buildComposer(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0), width: 1.5)),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.chevron_left_rounded, color: Color(0xFF64748B), size: 28),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
          const SizedBox(width: 8),
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: widget.gradient),
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: widget.icon != null 
              ? Icon(widget.icon, color: Colors.white, size: 20)
              : const Text('SL', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF140E28),
                  ),
                ),
                Text(
                  widget.subtitle,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.info_outline_rounded, color: Color(0xFF64748B), size: 18),
          ),
        ],
      ),
    );
  }

  Widget _buildDateDivider(String date) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(100),
            border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
          ),
          child: Text(
            date,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: Color(0xFF64748B),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage msg) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: msg.isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!msg.isMe) ...[
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: msg.senderGradient ?? [Colors.grey, Colors.grey]),
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Text(
                msg.senderInitials ?? '',
                style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800),
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment: msg.isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: msg.isMe ? null : Colors.white,
                    gradient: msg.isMe ? AppTheme.teacherTheme : null,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(18),
                      topRight: const Radius.circular(18),
                      bottomLeft: Radius.circular(msg.isMe ? 18 : 6),
                      bottomRight: Radius.circular(msg.isMe ? 6 : 18),
                    ),
                    border: msg.isMe ? null : Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                    boxShadow: msg.isMe ? [
                      BoxShadow(
                        color: const Color(0xFFFF5733).withValues(alpha: 0.2),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      )
                    ] : [],
                  ),
                  child: Text(
                    msg.text,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: msg.isMe ? Colors.white : const Color(0xFF1E293B),
                      height: 1.4,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      msg.time,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: msg.isMe ? const Color(0xFFFF5733).withValues(alpha: 0.6) : const Color(0xFF94A3B8),
                      ),
                    ),
                    if (msg.isMe) ...[
                      const SizedBox(width: 4),
                      Icon(
                        Icons.done_all_rounded,
                        size: 14,
                        color: const Color(0xFFFF5733).withValues(alpha: 0.6),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          if (msg.isMe) const SizedBox(width: 8),
        ],
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Row(
        children: [
          Container(
            width: 26,
            height: 26,
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFFA78BFA)]),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: const Text('RG', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w800)),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
            ),
            child: Row(
              children: [
                _buildTypingDot(0),
                _buildTypingDot(0.2),
                _buildTypingDot(0.4),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypingDot(double delay) {
    return Container(
      width: 6,
      height: 6,
      margin: const EdgeInsets.symmetric(horizontal: 1.5),
      decoration: const BoxDecoration(
        color: Color(0xFF94A3B8),
        shape: BoxShape.circle,
      ),
    );
  }

  Widget _buildComposer() {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFF1F5F9), width: 1.5)),
      ),
      child: Row(
        children: [
          const Icon(Icons.attach_file_rounded, color: Color(0xFF94A3B8), size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: const InputDecoration(
                        hintText: 'Message Staff Lounge...',
                        hintStyle: TextStyle(fontSize: 13, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500),
                        border: InputBorder.none,
                      ),
                      maxLines: null,
                    ),
                  ),
                  const Text('😊', style: TextStyle(fontSize: 18)),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              gradient: AppTheme.teacherTheme,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFFF5733).withValues(alpha: 0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
          ),
        ],
      ),
    );
  }
}

enum MessageStatus { sent, delivered, read }

class ChatMessage {
  final String text;
  final String time;
  final bool isMe;
  final String? senderInitials;
  final List<Color>? senderGradient;
  final String? date;
  final MessageStatus status;

  ChatMessage({
    required this.text,
    required this.time,
    required this.isMe,
    this.senderInitials,
    this.senderGradient,
    this.date,
    this.status = MessageStatus.delivered,
  });
}
