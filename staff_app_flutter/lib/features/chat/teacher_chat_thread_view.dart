import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/theme/app_theme.dart';
import '../../core/state/auth_state.dart';
import 'package:intl/intl.dart';

class TeacherChatThreadView extends ConsumerStatefulWidget {
  final String title;
  final String subtitle;
  final List<Color> gradient;
  final IconData? icon;
  final String conversationId;
  final String rawStudentId;
  final String? avatarUrl;
  final VoidCallback? onBack;

  const TeacherChatThreadView({
    super.key,
    required this.title,
    required this.subtitle,
    required this.gradient,
    this.icon,
    required this.conversationId,
    required this.rawStudentId,
    this.avatarUrl,
    this.onBack,
  });

  @override
  ConsumerState<TeacherChatThreadView> createState() => _TeacherChatThreadViewState();
}

class _TeacherChatThreadViewState extends ConsumerState<TeacherChatThreadView>
    with TickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isSending = false;
  Timer? _pollingTimer;
  List<ChatMessage> _messages = [];
  bool _isLoading = true;
  bool _isTyping = false;
  DateTime? _lastTypingPing;
  bool _showEmoji = false;

  // ─── Brand warm gradient ─────────────────────────────────────────────────
  static const _meGrad = LinearGradient(
    colors: [Color(0xFFFF5733), Color(0xFFFF006E)],
    begin: Alignment.topLeft, end: Alignment.bottomRight,
  );
  static const _meColor1 = Color(0xFFFF5733);

  @override
  void initState() {
    super.initState();
    _fetchMessages();
    _startPolling();
  }

  Future<void> _fetchMessages() async {
    final user = ref.read(userProfileProvider);
    if (user?.token == null || widget.conversationId.isEmpty) return;
    try {
      final res = await http.get(
        Uri.parse('http://localhost:3000/api/mobile/v1/staff/messages/${widget.conversationId}'),
        headers: {'Authorization': 'Bearer ${user!.token}'},
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && mounted) {
          final newMessages = (data['messages'] as List).map((m) {
            final isMe = m['senderType'] == 'STAFF';
            DateTime dt = DateTime.parse(m['createdAt']).toLocal();
            return ChatMessage(
              text: m['content'],
              time: DateFormat('h:mm a').format(dt),
              isMe: isMe,
              senderInitials: m['senderName'] != null && m['senderName'].isNotEmpty
                  ? m['senderName'][0].toUpperCase() : 'U',
              date: DateFormat('EEEE, d MMM').format(dt),
              status: MessageStatus.delivered,
              isFlagged: m['isFlagged'] == true,
              isRead: m['isRead'] == true,
              deliveryStatus: m['deliveryStatus'] ?? 'SENT',
            );
          }).toList();

          final isTypingStatus = data['isTyping'] == true;
          bool hasChanges = newMessages.length != _messages.length ||
              _messages.isEmpty || _isTyping != isTypingStatus || _isLoading;
          if (!hasChanges) {
            for (int i = 0; i < newMessages.length; i++) {
              if (newMessages[i].isRead != _messages[i].isRead ||
                  newMessages[i].deliveryStatus != _messages[i].deliveryStatus ||
                  newMessages[i].isFlagged != _messages[i].isFlagged) {
                hasChanges = true;
                break;
              }
            }
          }
          if (hasChanges) {
            final oldLength = _messages.length;
            setState(() {
              _messages = newMessages;
              _isTyping = isTypingStatus;
              _isLoading = false;
            });
            if (newMessages.length > oldLength) {
              Future.delayed(const Duration(milliseconds: 100), () {
                if (_scrollController.hasClients) {
                  _scrollController.animateTo(
                    _scrollController.position.maxScrollExtent,
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeOut,
                  );
                }
              });
            }
          }
          _markAsReadQuietly();
        }
      }
    } catch (e) {
      debugPrint("Error fetching messages: $e");
      if (mounted && _isLoading) setState(() => _isLoading = false);
    }
  }

  void _startPolling() {
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (_) => _fetchMessages());
  }

  Future<void> _markAsReadQuietly() async {
    final user = ref.read(userProfileProvider);
    if (user?.token == null || widget.conversationId.isEmpty) return;
    try {
      await http.post(
        Uri.parse('http://localhost:3000/api/mobile/v1/staff/messages/${widget.conversationId}/mark-read'),
        headers: {'Authorization': 'Bearer ${user!.token}'},
      );
    } catch (_) {}
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onTyping() {
    final user = ref.read(userProfileProvider);
    if (user?.token == null || widget.conversationId.isEmpty) return;
    final now = DateTime.now();
    if (_lastTypingPing == null || now.difference(_lastTypingPing!).inSeconds >= 3) {
      _lastTypingPing = now;
      http.post(
        Uri.parse('http://localhost:3000/api/mobile/v1/shared/messages/${widget.conversationId}/typing'),
        headers: {'Authorization': 'Bearer ${user!.token}'},
      ).catchError((_) => http.Response('', 500));
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _isSending) return;
    HapticFeedback.lightImpact();
    setState(() => _isSending = true);
    final user = ref.read(userProfileProvider);
    try {
      final res = await http.post(
        Uri.parse('http://localhost:3000/api/mobile/v1/staff/messages/${widget.conversationId}'),
        headers: {
          'Authorization': 'Bearer ${user!.token}',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'content': text}),
      );
      if (res.statusCode == 200) {
        _messageController.clear();
        _fetchMessages();
        Future.delayed(const Duration(milliseconds: 300), () {
          if (_scrollController.hasClients) {
            _scrollController.animateTo(
              _scrollController.position.maxScrollExtent,
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOut,
            );
          }
        });
      }
    } catch (e) {
      debugPrint("Error sending message: $e");
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  // ─── Build ────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F0FF),
      body: Column(children: [
        _buildHeader(),
        Expanded(
          child: _isLoading
              ? Center(child: CircularProgressIndicator(color: _meColor1, strokeWidth: 2.5))
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
                  itemCount: _messages.length + (_isTyping ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == _messages.length && _isTyping) {
                      return _buildTypingIndicator();
                    }
                    final msg = _messages[index];
                    bool showDate = index == 0 || _messages[index - 1].date != msg.date;
                    final prevMsg = index > 0 ? _messages[index - 1] : null;
                    final nextMsg = index < _messages.length - 1 ? _messages[index + 1] : null;
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (showDate && msg.date != null) _buildDateDivider(msg.date!),
                        _buildMessageBubble(msg, prevMsg, nextMsg, index),
                      ],
                    );
                  },
                ),
        ),
        _buildEmojiBar(),
        _buildComposer(),
      ]),
    );
  }

  // ─── Header ───────────────────────────────────────────────────────────────
  Widget _buildHeader() {
    return Container(
      decoration: const BoxDecoration(
        gradient: _meGrad,
        borderRadius: BorderRadius.zero,
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 10, 16, 14),
          child: Row(children: [
            // Back
            GestureDetector(
              onTap: () {
                if (widget.onBack != null) widget.onBack!();
                else Navigator.pop(context);
              },
              child: Container(
                width: 36, height: 36,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.chevron_left_rounded, color: Colors.white, size: 24),
              ),
            ),
            const SizedBox(width: 10),
            // Avatar
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.25),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white.withOpacity(0.5), width: 2),
              ),
              child: ClipOval(
                child: widget.avatarUrl != null && widget.avatarUrl!.startsWith('http')
                    ? Image.network(widget.avatarUrl!, fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _headerInitial())
                    : _headerInitial(),
              ),
            ),
            const SizedBox(width: 10),
            // Name
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(widget.title, style: const TextStyle(
                fontFamily: 'Clash Display', fontSize: 16,
                fontWeight: FontWeight.w800, color: Colors.white)),
              Text(widget.subtitle, style: TextStyle(
                fontFamily: 'Satoshi', fontSize: 11,
                fontWeight: FontWeight.w600, color: Colors.white.withOpacity(0.7))),
            ])),
            // Online dot + info
            Column(children: [
              Container(
                width: 32, height: 32,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.more_vert_rounded, color: Colors.white, size: 18),
              ),
              const SizedBox(height: 4),
              Row(mainAxisSize: MainAxisSize.min, children: [
                Container(width: 6, height: 6,
                    decoration: const BoxDecoration(color: Color(0xFF4ADE80), shape: BoxShape.circle)),
                const SizedBox(width: 3),
                Text('Online', style: TextStyle(
                  fontFamily: 'Satoshi', fontSize: 8, fontWeight: FontWeight.w700,
                  color: Colors.white.withOpacity(0.8))),
              ]),
            ]),
          ]),
        ),
      ),
    );
  }

  Widget _headerInitial() {
    return Container(
      color: Colors.white.withOpacity(0.3),
      alignment: Alignment.center,
      child: Text(
        widget.title.isNotEmpty ? widget.title[0].toUpperCase() : 'U',
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16),
      ),
    );
  }

  // ─── Date Divider ─────────────────────────────────────────────────────────
  Widget _buildDateDivider(String date) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(children: [
        Expanded(child: Container(height: 1, color: const Color(0xFFD8D0F0))),
        const SizedBox(width: 10),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(100),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 8)],
          ),
          child: Text(date, style: const TextStyle(
            fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w700,
            color: Color(0xFF7B7291))),
        ),
        const SizedBox(width: 10),
        Expanded(child: Container(height: 1, color: const Color(0xFFD8D0F0))),
      ]),
    );
  }

  // ─── Message Bubble ───────────────────────────────────────────────────────
  Widget _buildMessageBubble(ChatMessage msg, ChatMessage? prevMsg, ChatMessage? nextMsg, int index) {
    final isConsecutive = prevMsg != null && prevMsg.isMe == msg.isMe;
    final isLastGroup   = nextMsg == null || nextMsg.isMe != msg.isMe;
    final showAv   = !msg.isMe && isLastGroup;
    final showName = !msg.isMe && !isConsecutive;

    return Padding(
      padding: EdgeInsets.only(bottom: isLastGroup ? 12 : 2),
      child: Row(
        mainAxisAlignment: msg.isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // Other avatar
          if (!msg.isMe) ...[
            SizedBox(
              width: 32,
              child: showAv
                  ? Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: widget.gradient),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 1.5),
                      ),
                      child: ClipOval(
                        child: widget.avatarUrl != null && widget.avatarUrl!.startsWith('http')
                            ? Image.network(widget.avatarUrl!, fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => _bubbleAvatar(msg))
                            : _bubbleAvatar(msg),
                      ),
                    )
                  : const SizedBox(),
            ),
            const SizedBox(width: 6),
          ],

          // Bubble content
          Flexible(
            child: Column(
              crossAxisAlignment: msg.isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                // Sender name
                if (showName)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 3, left: 12),
                    child: Text(
                      widget.title.split(' ').take(2).join(' '),
                      style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10,
                          fontWeight: FontWeight.w800, color: Color(0xFF7B7291)),
                    ),
                  ),
                // Flag notice
                if (msg.isMe && msg.isFlagged)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4, right: 4),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      const Icon(Icons.flag_rounded, size: 11, color: Color(0xFFEF4444)),
                      const SizedBox(width: 4),
                      Text('Not delivered',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700,
                          color: const Color(0xFFEF4444).withOpacity(0.9))),
                    ]),
                  ),
                // Bubble
                Container(
                  constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.70),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    gradient: msg.isMe ? _meGrad : null,
                    color: msg.isMe ? null : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(20),
                      topRight: const Radius.circular(20),
                      bottomLeft: Radius.circular(!msg.isMe && !isLastGroup ? 5 : 20),
                      bottomRight: Radius.circular(msg.isMe && !isLastGroup ? 5 : 20),
                    ),
                    border: msg.isMe ? null : Border.all(color: const Color(0xFFE8E0FF), width: 1.5),
                    boxShadow: msg.isMe
                        ? [BoxShadow(color: _meColor1.withOpacity(0.28), blurRadius: 14, offset: const Offset(0, 5))]
                        : [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
                  ),
                  child: Text(msg.text,
                    style: TextStyle(
                      fontFamily: 'Satoshi',
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: msg.isMe ? Colors.white : const Color(0xFF140E28),
                      height: 1.45,
                    )),
                ),
                // Timestamp + ticks
                Padding(
                  padding: const EdgeInsets.only(top: 4, left: 4, right: 4),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Text(msg.time, style: const TextStyle(
                      fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w600,
                      color: Color(0xFF94A3B8))),
                    if (msg.isMe) ...[
                      const SizedBox(width: 4),
                      Icon(
                        msg.isRead ? Icons.done_all_rounded
                            : (msg.deliveryStatus == 'DELIVERED' ? Icons.done_all_rounded : Icons.check_rounded),
                        size: 14,
                        color: msg.isRead ? const Color(0xFF22C55E) : const Color(0xFFCBD5E1),
                      ),
                    ],
                  ]),
                ),
              ],
            ),
          ),
          if (msg.isMe) const SizedBox(width: 4),
        ],
      ),
    );
  }

  Widget _bubbleAvatar(ChatMessage msg) => Container(
    alignment: Alignment.center,
    decoration: BoxDecoration(gradient: LinearGradient(colors: widget.gradient)),
    child: Text(
      msg.senderInitials ?? widget.title[0],
      style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w800),
    ),
  );

  // ─── Typing Indicator ─────────────────────────────────────────────────────
  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, top: 2),
      child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
        Container(
          width: 32, height: 32,
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: widget.gradient), shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 1.5),
          ),
          child: widget.icon != null
              ? Icon(widget.icon, size: 16, color: Colors.white)
              : Center(child: Text(widget.title.isNotEmpty ? widget.title[0] : 'U',
                  style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold))),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(20), topRight: Radius.circular(20),
              bottomLeft: Radius.circular(5), bottomRight: Radius.circular(20),
            ),
            border: Border.all(color: const Color(0xFFE8E0FF), width: 1.5),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            _dot(0), _dot(1), _dot(2),
          ]),
        ),
      ]),
    );
  }

  Widget _dot(int idx) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 800),
      curve: Curves.easeInOut,
      builder: (_, val, __) {
        final offset = ((val + idx * 0.25) % 1.0);
        final y = offset < 0.5 ? -5.0 * (1 - offset * 2) : 0.0;
        return Transform.translate(
          offset: Offset(0, y),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 2),
            width: 7, height: 7,
            decoration: BoxDecoration(
              gradient: _meGrad, shape: BoxShape.circle,
            ),
          ),
        );
      },
    );
  }

  // ─── Emoji Bar ────────────────────────────────────────────────────────────
  Widget _buildEmojiBar() {
    final emojis = ['👍', '❤️', '😊', '🎉', '🙏', '👏', '😅', '✅', '🤩', '💪'];
    return Container(
      height: 50,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFF0EAFA), width: 1.5)),
      ),
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        scrollDirection: Axis.horizontal,
        itemCount: emojis.length,
        separatorBuilder: (_, __) => const SizedBox(width: 6),
        itemBuilder: (_, i) => GestureDetector(
          onTap: () {
            final t = _messageController.text;
            _messageController.value = TextEditingValue(
              text: t + emojis[i],
              selection: TextSelection.collapsed(offset: t.length + emojis[i].length),
            );
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8F5FF),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE8E0FF), width: 1.5),
            ),
            alignment: Alignment.center,
            child: Text(emojis[i], style: const TextStyle(fontSize: 17)),
          ),
        ),
      ),
    );
  }

  // ─── Composer ─────────────────────────────────────────────────────────────
  Widget _buildComposer() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFF0EAFA), width: 1.5)),
      ),
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
      child: SafeArea(
        top: false,
        child: Row(children: [
          // Attach
          GestureDetector(
            onTap: () {},
            child: Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFFF8F5FF),
                borderRadius: BorderRadius.circular(13),
                border: Border.all(color: const Color(0xFFE8E0FF), width: 1.5),
              ),
              child: const Icon(Icons.attach_file_rounded, color: Color(0xFFFF5733), size: 19),
            ),
          ),
          const SizedBox(width: 8),
          // Text field
          Expanded(
            child: Container(
              constraints: const BoxConstraints(minHeight: 44),
              decoration: BoxDecoration(
                color: const Color(0xFFF8F5FF),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFE8E0FF), width: 1.5),
              ),
              child: TextField(
                controller: _messageController,
                style: const TextStyle(
                  fontFamily: 'Satoshi', fontSize: 14,
                  fontWeight: FontWeight.w500, color: Color(0xFF140E28)),
                cursorColor: const Color(0xFFFF5733),
                onChanged: (_) => _onTyping(),
                decoration: InputDecoration(
                  hintText: 'Type a message...',
                  hintStyle: TextStyle(fontFamily: 'Satoshi', fontSize: 14,
                      fontWeight: FontWeight.w400, color: Colors.grey.shade400),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
                  isDense: true,
                ),
                maxLines: null,
                textInputAction: TextInputAction.newline,
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Send
          GestureDetector(
            onTap: _sendMessage,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 44, height: 44,
              decoration: BoxDecoration(
                gradient: _meGrad,
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: _meColor1.withOpacity(0.35), blurRadius: 14, offset: const Offset(0, 4))],
              ),
              child: _isSending
                  ? const Padding(padding: EdgeInsets.all(12),
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.send_rounded, color: Colors.white, size: 18),
            ),
          ),
        ]),
      ),
    );
  }
}

// ─── Models ───────────────────────────────────────────────────────────────────
enum MessageStatus { sent, delivered, read }

class ChatMessage {
  final String text;
  final String time;
  final bool isMe;
  final String? senderInitials;
  final List<Color>? senderGradient;
  final String? date;
  final MessageStatus status;
  final bool isFlagged;
  final bool isRead;
  final String deliveryStatus;

  ChatMessage({
    required this.text,
    required this.time,
    required this.isMe,
    this.senderInitials,
    this.senderGradient,
    this.date,
    this.status = MessageStatus.delivered,
    this.isFlagged = false,
    this.isRead = false,
    this.deliveryStatus = 'SENT',
  });
}
