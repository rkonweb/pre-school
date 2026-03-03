import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../data/conversation_provider.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/school_brand_provider.dart';
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
        _messageController.clear();
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
    final conversationAsync = ref.watch(conversationDataProvider(widget.conversationId));
    final schoolBrandState = ref.watch(schoolBrandProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        title: Text(widget.title, style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Colors.black87),
        actions: [
          IconButton(icon: const Icon(Icons.info_outline), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: conversationAsync.when(
              data: (data) {
                final messages = data['messages'] as List? ?? [];
                
                // Add tiny delay to scroll to bottom on first load
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
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final msg = messages[index];
                    final isMe = msg['senderType'] == 'PARENT';
                    final date = DateTime.parse(msg['createdAt']);
                    
                    return _buildMessageBubble(
                      content: msg['content'],
                      time: DateFormat('hh:mm a').format(date),
                      isMe: isMe,
                      senderName: isMe ? 'You' : msg['senderName'],
                      status: msg['status'] ?? 'SENT',
                      deliveryStatus: msg['deliveryStatus'] ?? 'SENT',
                      isFlagged: msg['isFlagged'] == true,
                      primaryColor: schoolBrandState.primaryColor,
                      secondaryColor: schoolBrandState.secondaryColor,
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text('Error: $err')),
            ),
          ),
          
          // Input Area
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.05), offset: const Offset(0, -4), blurRadius: 10)
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.attach_file, color: Colors.grey),
                    onPressed: () {},
                  ),
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: TextField(
                        controller: _messageController,
                        maxLines: null,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _sendMessage(),
                        decoration: const InputDecoration(
                          hintText: 'Type a message...',
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: _isSending ? null : _sendMessage,
                    child: CircleAvatar(
                      radius: 24,
                      backgroundColor: const Color(0xFF2563EB),
                      child: _isSending 
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Icon(Icons.send, color: Colors.white, size: 20),
                    ),
                  )
                ],
              ),
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
       return Colors.grey.shade400; // Grey for delivered, sent, pending
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
                CircleAvatar(
                  radius: 14,
                  backgroundColor: const Color(0xFFB9FBC0),
                  child: Text(senderName[0].toUpperCase(), style: const TextStyle(fontSize: 12, color: Color(0xFF2E7D32), fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 8),
              ],
              Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: isFlagged
                            ? const Color(0xFFFFEBEB)
                            : (isMe ? primaryColor : Colors.white),
                        border: isFlagged
                            ? Border.all(color: Colors.red.shade300, width: 1.5)
                            : null,
                        borderRadius: BorderRadius.only(
                          topLeft: const Radius.circular(20),
                          topRight: const Radius.circular(20),
                          bottomLeft: isMe ? const Radius.circular(20) : Radius.zero,
                          bottomRight: isMe ? Radius.zero : const Radius.circular(20),
                        ),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 5, offset: const Offset(0, 2))
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
                                Text('Message Flagged', style: TextStyle(color: Colors.red.shade700, fontSize: 11, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 4),
                          ],
                          Text(
                            content,
                            style: TextStyle(
                              color: isFlagged ? Colors.red.shade800 : (isMe ? secondaryColor : Colors.black87),
                              fontSize: 15,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Padding(
            padding: EdgeInsets.only(
              left: isMe ? 0 : 36,
              right: isMe ? 4 : 0,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '$senderName • $time',
                  style: TextStyle(color: Colors.grey.shade500, fontSize: 11, fontWeight: FontWeight.w500),
                ),
                if (isMe && getDeliveryIcon() != null) ...[
                  const SizedBox(width: 4),
                  Icon(getDeliveryIcon(), size: 14, color: getDeliveryColor()),
                ]
              ],
            ),
          )
        ],
      ),
    );
  }
}
