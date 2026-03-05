import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../data/conversation_provider.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import 'dart:async';

class ConversationScreen extends ConsumerStatefulWidget {
  final String conversationId;
  final String title;
  final String? studentAvatarParams;

  const ConversationScreen({
    Key? key,
    required this.conversationId,
    required this.title,
    this.studentAvatarParams,
  }) : super(key: key);

  @override
  ConsumerState<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends ConsumerState<ConversationScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isSending = false;
  Timer? _readReceiptTimer;

  @override
  void initState() {
    super.initState();
    _startReadReceiptTimer();
  }

  void _startReadReceiptTimer() {
    void pingReadReceipt() {
      try {
        final apiClient = ref.read(apiClientProvider);
        apiClient.post('parent/messages/${widget.conversationId}/mark-read', data: {});
      } catch (e) {
        // Silently fail if mark-read request drops
      }
    }

    _readReceiptTimer = Timer.periodic(const Duration(seconds: 5), (_) => pingReadReceipt());
    pingReadReceipt(); // Fire immediately upon screen mount
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _readReceiptTimer?.cancel();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() => _isSending = true);
    
    final error = await ref.read(conversationDataProvider(widget.conversationId).notifier).sendMessage(text);
    
    if (error == null) {
      _messageController.clear();
      Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(error),
            backgroundColor: Colors.red.shade800,
            duration: const Duration(seconds: 4),
        ));
      }
    }

    if (mounted) {
        setState(() => _isSending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final schoolBrandState = ref.watch(schoolBrandProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppHeader(
        titleWidget: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white.withOpacity(0.3), width: 1.5),
                image: widget.studentAvatarParams != null
                  ? DecorationImage(image: NetworkImage(widget.studentAvatarParams!), fit: BoxFit.cover)
                  : null,
              ),
              child: widget.studentAvatarParams == null 
                ? const Center(child: Icon(Icons.person, color: Colors.white, size: 20))
                : null,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    widget.title,
                    style: GoogleFonts.sora(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  Text(
                    'Online • Class Teacher',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {},
            style: AppTheme.headerButtonStyle(),
            child: const Icon(Icons.videocam_outlined, size: 20),
          ),
          ElevatedButton(
            onPressed: () {},
            style: AppTheme.headerButtonStyle(),
            child: const Icon(Icons.more_vert, size: 20),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Consumer(
              builder: (context, consumerRef, child) {
                final conversationAsync = consumerRef.watch(conversationDataProvider(widget.conversationId));
                
                return conversationAsync.when(
                  data: (data) {
                    final messages = data['messages'] as List? ?? [];
                    
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      if (_scrollController.hasClients && _scrollController.position.pixels == 0) {
                          _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
                      }
                    });

                    if (messages.isEmpty) {
                      return const Center(child: Text("No messages yet. Say hello!", style: TextStyle(color: Colors.grey)));
                    }

                    return ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                      itemCount: messages.length,
                      itemBuilder: (context, index) {
                        final msg = messages[index];
                        final isMe = msg['senderType'] == 'PARENT';
                        final date = DateTime.parse(msg['createdAt']);
                        
                        return _buildMessageBubble(
                          content: msg['content'],
                          time: DateFormat('h:mm a').format(date),
                          isMe: isMe,
                          senderName: isMe ? 'You' : msg['senderName'],
                          status: msg['status'] ?? 'SENT',
                          deliveryStatus: msg['deliveryStatus'] ?? 'SENT',
                          isFlagged: msg['isFlagged'] == true,
                          primaryColor: const Color(0xFF2350DD), // Premium Blue
                          secondaryColor: Colors.white,
                        );
                      },
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (err, stack) => Center(child: Text('Error: $err')),
                );
              },
            ),
          ),
          
          // Input Area Style: ci
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.04), offset: const Offset(0, -5), blurRadius: 15)
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.add, color: Color(0xFF64748B), size: 20),
                    onPressed: () {},
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: TextField(
                      controller: _messageController,
                      keyboardType: TextInputType.multiline,
                      textInputAction: TextInputAction.newline,
                      maxLines: null,
                      style: GoogleFonts.dmSans(fontSize: 14),
                      decoration: const InputDecoration(
                        hintText: 'Type your message...',
                        hintStyle: TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: _isSending ? null : _sendMessage,
                  child: Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2350DD), Color(0xFF1A2A6C)],
                      ),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF2350DD).withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: _isSending 
                      ? const Center(child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)))
                      : const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildMessageBubble({
    required String content, 
    required String time, 
    required bool isMe, 
    required String senderName,
    required Color primaryColor,
    required Color secondaryColor,
    String? status,
    String? deliveryStatus,
    bool isFlagged = false,
  }) {
    IconData? getDeliveryIcon() {
      if (!isMe) return null;
      if (status == 'PENDING_OFFLINE') return Icons.schedule; // Clock icon for pending
      if (deliveryStatus == 'READ') return Icons.done_all; // Double tick for read
      if (deliveryStatus == 'DELIVERED') return Icons.done_all; // Double tick for delivered
      return Icons.check; // Single tick for sent
    }
    
    Color getDeliveryColor() {
       if (deliveryStatus == 'READ') return Colors.blue; // Blue for read
       return const Color(0xFF94A3B8); // Gray for delivered, sent, pending
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (!isMe) ...[
                Container(
                  width: 32,
                  height: 32,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(colors: [Color(0xFF00C9A7), Color(0xFF00E5C0)]),
                  ),
                  child: Center(
                    child: Text(
                      senderName[0].toUpperCase(), 
                      style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)
                    ),
                  ),
                ),
                const SizedBox(width: 10),
              ],
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isFlagged
                        ? const Color(0xFFFFEBEB)
                        : (isMe ? null : Colors.white),
                    gradient: isFlagged
                        ? null
                        : (isMe ? LinearGradient(
                            colors: [primaryColor, const Color(0xFF1A2A6C)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ) : null),
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(18),
                      topRight: const Radius.circular(18),
                      bottomLeft: isMe ? const Radius.circular(18) : Radius.zero,
                      bottomRight: isMe ? Radius.zero : const Radius.circular(18),
                    ),
                    border: isFlagged
                        ? Border.all(color: Colors.red.shade300, width: 1.5)
                        : (isMe ? null : Border.all(color: const Color(0xFFE2E8F0))),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 5, offset: const Offset(0, 2))
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (isFlagged) ...[
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.warning_amber_rounded, size: 14, color: Colors.red.shade700),
                            const SizedBox(width: 4),
                            Text('Message Flagged', style: GoogleFonts.dmSans(color: Colors.red.shade700, fontSize: 11, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 4),
                      ],
                      Text(
                        content,
                        style: GoogleFonts.dmSans(
                          color: isFlagged ? Colors.red.shade800 : (isMe ? Colors.white : const Color(0xFF1E293B)),
                          fontSize: 14,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Padding(
            padding: EdgeInsets.only(
              left: isMe ? 0 : 42,
              right: isMe ? 4 : 0,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  time,
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.w500),
                ),
                if (isMe && getDeliveryIcon() != null) ...[
                  const SizedBox(width: 4),
                  Icon(getDeliveryIcon(), size: 12, color: getDeliveryColor()),
                ]
              ],
            ),
          )
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.1, end: 0);
  }
}
