import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/theme/app_theme.dart';
import '../../core/state/auth_state.dart';
import 'package:intl/intl.dart';

// Removed FutureProvider for thread messages to use manual state in widget

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

class _TeacherChatThreadViewState extends ConsumerState<TeacherChatThreadView> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isSending = false;
  Timer? _pollingTimer;
  List<ChatMessage> _messages = [];
  bool _isLoading = true;
  bool _isTyping = false;
  DateTime? _lastTypingPing;

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
              senderInitials: m['senderName'] != null && m['senderName'].isNotEmpty ? m['senderName'][0].toUpperCase() : 'U',
              date: DateFormat('EEEE, d MMM').format(dt),
              status: MessageStatus.delivered,
              isFlagged: m['isFlagged'] == true,
              isRead: m['isRead'] == true,
              deliveryStatus: m['deliveryStatus'] ?? 'SENT',
            );
          }).toList();
          
          final isTypingStatus = data['isTyping'] == true;
          
          bool hasChanges = newMessages.length != _messages.length || _messages.isEmpty || _isTyping != isTypingStatus || _isLoading;
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
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      _fetchMessages();
    });
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                  itemCount: _messages.length + (_isTyping ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == _messages.length && _isTyping) {
                      return _buildTypingIndicator();
                    }
                    
                    final msg = _messages[index];
                    bool showDate = true;
                    if (index > 0) {
                       showDate = _messages[index - 1].date != msg.date;
                    }
                    
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
        ],
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10, top: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFE2E8F0), Color(0xFFF1F5F9)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.person, size: 16, color: Color(0xFF94A3B8)),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFF1F5F9),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(20),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(3, (index) {
                return TweenAnimationBuilder(
                  tween: Tween<double>(begin: 0, end: 1),
                  duration: const Duration(milliseconds: 600),
                  curve: Curves.easeInOutSine,
                  builder: (context, double val, child) {
                    final delay = index * 0.2;
                    final offset = (val + delay) % 1.0;
                    final y = offset < 0.5 ? -4.0 * (1 - (offset * 2)) : 0.0;
                    
                    return Transform.translate(
                      offset: Offset(0, y),
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 2),
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: Color(0xFF94A3B8),
                          shape: BoxShape.circle,
                        ),
                      ),
                    );
                  },
                );
              }),
            ),
          ),
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
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            IconButton(
              onPressed: () {
                if (widget.onBack != null) {
                  widget.onBack!();
                } else {
                  Navigator.pop(context);
                }
              },
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
              child: widget.avatarUrl != null && widget.avatarUrl!.startsWith('http')
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        widget.avatarUrl!,
                        width: 38,
                        height: 38,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => widget.icon != null 
                          ? Icon(widget.icon, color: Colors.white, size: 20)
                          : Text(widget.title.isNotEmpty ? widget.title[0] : 'U', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                      ),
                    )
                  : widget.icon != null 
                      ? Icon(widget.icon, color: Colors.white, size: 20)
                      : Text(widget.title.isNotEmpty ? widget.title[0] : 'U', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
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

  Widget _buildMessageBubble(ChatMessage msg, ChatMessage? prevMsg, ChatMessage? nextMsg, int index) {
    final isConsecutive = prevMsg != null && prevMsg.isMe == msg.isMe;
    final isLastGroup = nextMsg == null || nextMsg.isMe != msg.isMe;
    final showAv = !msg.isMe && isLastGroup;
    final showName = (!msg.isMe && !isConsecutive);

    // Provide default gradient for Staff if not me and no local gradient (should be me though in Staff app)
    final meColorLeft = const Color(0xFF5B5EEB);
    final meColorRight = const Color(0xFF7C3AED);

    return Padding(
      padding: EdgeInsets.only(bottom: isLastGroup ? 10 : 2),
      child: Row(
        mainAxisAlignment: msg.isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!msg.isMe) ...[
             SizedBox(
               width: 30,
               child: showAv 
                 ? Container(
                     width: 30, height: 30,
                     decoration: BoxDecoration(
                       gradient: msg.senderGradient != null 
                          ? LinearGradient(colors: msg.senderGradient!)
                          : LinearGradient(colors: widget.gradient),
                       shape: BoxShape.circle,
                     ),
                     child: Center(
                       child: widget.avatarUrl != null && widget.avatarUrl!.startsWith('http')
                         ? ClipRRect(
                             borderRadius: BorderRadius.circular(15),
                             child: Image.network(
                               widget.avatarUrl!,
                               width: 30,
                               height: 30,
                               fit: BoxFit.cover,
                               errorBuilder: (context, error, stackTrace) => widget.icon != null 
                                 ? Icon(widget.icon, color: Colors.white, size: 16)
                                 : Text(
                                     msg.senderInitials ?? (widget.title.isNotEmpty ? widget.title[0] : 'U'), 
                                     style: const TextStyle(fontSize: 13, color: Colors.white, fontWeight: FontWeight.bold)
                                   ),
                             ),
                           )
                         : widget.icon != null 
                             ? Icon(widget.icon, color: Colors.white, size: 16)
                             : Text(
                                 msg.senderInitials ?? (widget.title.isNotEmpty ? widget.title[0] : 'U'), 
                                 style: const TextStyle(fontSize: 13, color: Colors.white, fontWeight: FontWeight.bold)
                               ),
                     ),
                   )
                 : const SizedBox(),
             ),
             const SizedBox(width: 6),
          ],
          
          Flexible(
            child: Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                if (msg.isMe && msg.isFlagged)
                  const Padding(
                    padding: EdgeInsets.only(right: 8),
                    child: Tooltip(
                      message: "Message flagged",
                      child: Icon(Icons.error_outline_rounded, size: 20, color: Color(0xFFEF4444)),
                    ),
                  ),
                StatefulBuilder(
                  builder: (context, setStateBubble) {
                    bool _isRevealed = false;
                    return Column(
                      crossAxisAlignment: msg.isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        if (showName && widget.title.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 3, left: 4),
                            child: Text(
                              widget.title.split(' ').take(2).join(' '),
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF6B7280),
                              ),
                            ),
                          ),
                        if (msg.isMe && msg.isFlagged)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 4, right: 4),
                            child: Text(
                              "Message flagged and not delivered",
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFFEF4444).withOpacity(0.9),
                              ),
                            ),
                          ),
                        GestureDetector(
                          onTap: () {
                            if (!msg.isMe && msg.isFlagged) {
                              setStateBubble(() => _isRevealed = !_isRevealed);
                            }
                          },
                          child: Container(
                            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.73),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: msg.isMe ? null : const Color(0xFFF8FAFC), 
                              gradient: msg.isMe 
                                  ? LinearGradient(colors: [meColorLeft, meColorRight], begin: Alignment.topLeft, end: Alignment.bottomRight) 
                                  : null,
                              border: msg.isMe ? null : Border.all(color: const Color(0xFFE2E8F0)),
                              borderRadius: BorderRadius.only(
                                topLeft: const Radius.circular(18),
                                topRight: const Radius.circular(18),
                                bottomLeft: Radius.circular((!msg.isMe && !isLastGroup) ? 4 : 18),
                                bottomRight: Radius.circular((msg.isMe && !isLastGroup) ? 4 : 18),
                              ),
                              boxShadow: [
                                if (msg.isMe) BoxShadow(color: meColorLeft.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4)),
                              ],
                            ),
                            child: Text(
                              msg.text,
                              style: TextStyle(
                                fontSize: 13,
                                fontStyle: FontStyle.normal,
                                fontWeight: FontWeight.w400,
                                color: msg.isMe 
                                  ? Colors.white 
                                  : const Color(0xFF0F0F23),
                                height: 1.5,
                              ),
                            ),
                          ),
                        ),
                        // Time stamp and ticks outside the bubble
                        Container(
                          margin: const EdgeInsets.only(top: 4, left: 4, right: 4),
                          alignment: msg.isMe ? Alignment.centerRight : Alignment.centerLeft,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                msg.time,
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF94A3B8),
                                ),
                              ),
                              if (msg.isMe) ...[
                                const SizedBox(width: 4),
                                Icon(
                                  msg.isRead ? Icons.done_all_rounded : (msg.deliveryStatus == 'DELIVERED' ? Icons.done_all_rounded : Icons.check_rounded),
                                  size: 14,
                                  color: msg.isRead ? const Color(0xFF22C55E) : const Color(0xFF94A3B8), // Green for read, Grey for others
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    );
                  }
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmojiBar() {
    final emojis = ['👍', '❤️', '😊', '🎉', '🙏', '👏', '😅', '✅', '🤩', '💪'];
    
    return Container(
      height: 44,
      color: Colors.white,
      padding: const EdgeInsets.only(top: 8, bottom: 4),
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: emojis.length,
        separatorBuilder: (context, index) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final emoji = emojis[index];
          return GestureDetector(
            onTap: () {
              final text = _messageController.text;
              _messageController.value = TextEditingValue(
                text: text + emoji,
                selection: TextSelection.collapsed(offset: text.length + emoji.length),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFF4F5F9), 
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0x12000000), width: 1.5),
              ),
              alignment: Alignment.center,
              child: Text(
                emoji,
                style: const TextStyle(fontSize: 16),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildComposer() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10).copyWith(bottom: 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0x146366F1), width: 1.5)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: const Color(0xFFF4F5F9),
                borderRadius: BorderRadius.circular(11),
                border: Border.all(color: const Color(0x12000000), width: 1.5),
              ),
              child: const Center(
                child: Icon(Icons.attach_file_rounded, color: Color(0xFF6B7280), size: 18),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF4F5F9),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: Colors.transparent, width: 1.5),
                ),
                child: TextField(
                  controller: _messageController,
                  style: const TextStyle(
                    fontSize: 15,
                    color: Colors.black87,
                    fontWeight: FontWeight.w500,
                  ),
                  cursorColor: const Color(0xFF6366F1),
                  onChanged: (_) => _onTyping(),
                  decoration: const InputDecoration(
                    hintText: 'Message...',
                    hintStyle: TextStyle(fontSize: 14, color: Colors.black54, fontWeight: FontWeight.w400),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    isDense: true,
                  ),
                  maxLines: null,
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: _sendMessage,
              child: Container(
                width: 40, height: 40,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: Color(0x6B6366F1), blurRadius: 14, offset: Offset(0, 4))],
                ),
                child: _isSending 
                  ? const Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Center(child: Icon(Icons.send_rounded, color: Colors.white, size: 16)),
              ),
            ),
          ],
        ),
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
