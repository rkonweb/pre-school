import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'chat_provider.dart';
import 'models/chat_models.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/global_header.dart';
import 'package:intl/intl.dart';
import 'chat_repository.dart';
import '../../../core/theme/school_brand_provider.dart';
import 'dart:async';

class MessageScreen extends ConsumerStatefulWidget {
  final String conversationId;
  final ChatConversation? conversation;

  const MessageScreen({
    Key? key,
    required this.conversationId,
    this.conversation,
  }) : super(key: key);

  @override
  ConsumerState<MessageScreen> createState() => _MessageScreenState();
}

class _MessageScreenState extends ConsumerState<MessageScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  Timer? _readReceiptTimer;

  @override
  void initState() {
    super.initState();
    _startReadReceiptTimer();
  }

  void _startReadReceiptTimer() {
    // Poll every 5 seconds to mark messages as read while screen is open
    _readReceiptTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      ref.read(chatRepositoryProvider).markAsRead(widget.conversationId);
    });
    // Fire immediately on mount
    ref.read(chatRepositoryProvider).markAsRead(widget.conversationId);
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

  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(messagesProvider(widget.conversationId));
    final schoolBrandState = ref.watch(schoolBrandProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: GlobalHeader(
        title: widget.conversation?.student?.fullName ?? 'Chat',
        showBackButton: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: messagesAsync.when(
              data: (messages) {
                WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
                if (messages.isEmpty) {
                  return const Center(child: Text('No messages yet.'));
                }
                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final msg = messages[index];
                    final isMe = msg.senderType == 'STAFF';
                    final bool isBlocked = msg.status == 'REJECTED';
                    final bool isFlagged = msg.isFlagged;
                    final String senderName = isMe ? 'You' : (msg.senderName.isNotEmpty ? msg.senderName : 'Parent');
                    // Hide flagged messages from the other party — only show sender's own flagged messages (in red)
                    if (msg.isFlagged && !isMe) return const SizedBox.shrink();
                    return _buildMessageBubble(
                        msg,
                        isMe,
                        DateFormat('hh:mm a').format(msg.createdAt),
                        isFlagged,
                        isBlocked,
                        senderName,
                        schoolBrandState.primaryColor,
                        schoolBrandState.secondaryColor,
                      );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
            ),
          ),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage msg, bool isMe, String time, bool isFlagged, bool isBlocked, String senderName, Color primaryColor, Color secondaryColor) {
    IconData? getDeliveryIcon() {
      if (!isMe) return null;
      if (msg.deliveryStatus == 'READ') return Icons.done_all; // Double tick for read
      if (msg.deliveryStatus == 'DELIVERED') return Icons.done_all; // Double tick for delivered
      return Icons.check; // Single tick for sent
    }

    Color getDeliveryColor() {
      if (msg.deliveryStatus == 'READ') return Colors.blue; // Blue for read
      return Colors.grey.shade400; // Grey for delivered/sent
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
              // Avatar for the other party
              if (!isMe) ...[
                CircleAvatar(
                  radius: 14,
                  backgroundColor: const Color(0xFFE2E8F0),
                  child: Text(
                    senderName[0].toUpperCase(),
                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                  ),
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
                        color: isBlocked
                            ? Colors.grey.shade300
                            : isFlagged
                                ? const Color(0xFFFFEBEB)
                                : isMe
                                    ? primaryColor
                                    : Colors.white,
                        border: isFlagged
                            ? Border.all(color: Colors.red.shade300, width: 1.5)
                            : null,
                        borderRadius: BorderRadius.only(
                          topLeft: const Radius.circular(20),
                          topRight: const Radius.circular(20),
                          bottomLeft: Radius.circular(isMe ? 20 : 0),
                          bottomRight: Radius.circular(isMe ? 0 : 20),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 5,
                            offset: const Offset(0, 2),
                          )
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Flagged label
                          if (isFlagged) ...[
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.warning_amber_rounded, size: 14, color: Colors.red.shade700),
                                const SizedBox(width: 4),
                                Text(
                                  'Message Flagged',
                                  style: TextStyle(color: Colors.red.shade700, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                          ],
                          // Blocked label
                          if (isBlocked) ...[
                            const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.block, size: 12, color: Colors.grey),
                                SizedBox(width: 4),
                                Text('Blocked by Admin', style: TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 4),
                          ],
                          // Poll or text content
                          if (msg.type == 'POLL' && msg.poll != null && !isBlocked)
                            _buildPollWidget(msg.poll!)
                          else
                            Text(
                              isBlocked ? 'This message was blocked by school policy.' : msg.content,
                              style: TextStyle(
                                color: isFlagged
                                    ? Colors.red.shade800
                                    : isMe && !isBlocked
                                        ? secondaryColor
                                        : Colors.black87,
                                fontStyle: isBlocked ? FontStyle.italic : null,
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
          // Name + Time + Tick row
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
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPollWidget(ChatPoll poll) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Poll',
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.blue),
        ),
        Text(
          poll.question,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
        const SizedBox(height: 8),
        ...poll.options.map((opt) {
          final count = poll.responses.where((r) => r.optionId == opt.id).length;
          final total = poll.responses.length;
          final percent = total > 0 ? count / total : 0.0;

          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(opt.text, style: const TextStyle(fontSize: 12)),
                    Text('$count votes', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                  ],
                ),
                const SizedBox(height: 4),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: percent,
                    minHeight: 6,
                    backgroundColor: Colors.white24,
                    valueColor: const AlwaysStoppedAnimation<Color>(Colors.blue),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: EdgeInsets.fromLTRB(8, 8, 8, MediaQuery.of(context).padding.bottom + 8),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 4, offset: Offset(0, -2))],
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => _showPollCreationDialog(),
            icon: const Icon(Icons.poll_outlined),
            color: Colors.blue,
            tooltip: 'Create Poll',
          ),
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(24),
              ),
              child: TextField(
                controller: _messageController,
                decoration: const InputDecoration(
                  hintText: 'Type a message...',
                  border: InputBorder.none,
                ),
                onSubmitted: (_) => _handleSend(),
              ),
            ),
          ),
          const SizedBox(width: 8),
          CircleAvatar(
            backgroundColor: AppTheme.primary,
            child: IconButton(
              onPressed: _handleSend,
              icon: const Icon(Icons.send, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }

  void _handleSend() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;
    
    // Unfocus keyboard
    FocusScope.of(context).unfocus();

    // Show loading dialog while generating options
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: Card(
          child: Padding(
            padding: EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Polishing your message...', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ),
      ),
    );

    try {
      final repository = ref.read(chatRepositoryProvider);
      final studentName = widget.conversation?.student?.firstName;
      final options = await repository.rewriteMessage(text, studentName: studentName);
      
      // Close loading dialog
      if (context.mounted) Navigator.of(context, rootNavigator: true).pop();

      if (!context.mounted) return;

      // Show options in a bottom sheet
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.white,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
        builder: (context) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            top: 24,
            left: 16,
            right: 16,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.auto_awesome, color: AppTheme.primary),
                  const SizedBox(width: 8),
                  const Text('Select a Professional Message', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 8),
              const Text('To maintain decorum, please choose one of these polite alternatives:', style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 16),
              ...options.map((optionText) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: InkWell(
                  onTap: () {
                    // Close the bottom sheet
                    Navigator.of(context).pop();
                    ref.read(messagesProvider(widget.conversationId).notifier).sendMessage(optionText);
                    _messageController.clear();
                    _scrollToBottom();
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      border: Border.all(color: Colors.grey.shade200),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(optionText, style: const TextStyle(fontSize: 15)),
                  ),
                ),
              )).toList(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      );
    } catch (e) {
      if (context.mounted) {
        Navigator.of(context, rootNavigator: true).pop(); // Close loading dialog
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to rewrite: $e')));
      }
    }
  }

  void _showPollCreationDialog() {
    showDialog(
      context: context,
      builder: (context) => _CreatePollDialog(
        onCreated: (question, options) {
          ref.read(messagesProvider(widget.conversationId).notifier).sendMessage(
            'Poll: $question',
            type: 'POLL',
            pollData: {
              'question': question,
              'options': options.map((o) => {'id': o.toLowerCase().replaceAll(' ', '_'), 'text': o}).toList(),
            },
          );
        },
      ),
    );
  }
}

class _CreatePollDialog extends StatefulWidget {
  final Function(String question, List<String> options) onCreated;
  const _CreatePollDialog({required this.onCreated});

  @override
  _CreatePollDialogState createState() => _CreatePollDialogState();
}

class _CreatePollDialogState extends State<_CreatePollDialog> {
  final TextEditingController _questionController = TextEditingController();
  final List<TextEditingController> _optionControllers = [
    TextEditingController(),
    TextEditingController(),
  ];

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Create Poll'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _questionController,
              decoration: const InputDecoration(labelText: 'Question', hintText: 'e.g., What time should the trip start?'),
            ),
            const SizedBox(height: 20),
            const Text('Options', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            ..._optionControllers.asMap().entries.map((e) => Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: TextField(
                controller: e.value,
                decoration: InputDecoration(
                  labelText: 'Option ${e.key + 1}',
                  suffixIcon: e.key > 1 ? IconButton(
                    icon: const Icon(Icons.remove_circle_outline, color: Colors.red),
                    onPressed: () => setState(() => _optionControllers.removeAt(e.key)),
                  ) : null,
                ),
              ),
            )),
            TextButton.icon(
              onPressed: () => setState(() => _optionControllers.add(TextEditingController())),
              icon: const Icon(Icons.add),
              label: const Text('Add Option'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        ElevatedButton(
          onPressed: () {
            final options = _optionControllers.map((c) => c.text.trim()).where((t) => t.isNotEmpty).toList();
            if (_questionController.text.isNotEmpty && options.length >= 2) {
              widget.onCreated(_questionController.text.trim(), options);
              Navigator.pop(context);
            }
          },
          child: const Text('Create'),
        ),
      ],
    );
  }
}
