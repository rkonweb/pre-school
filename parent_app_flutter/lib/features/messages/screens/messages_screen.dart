import 'package:flutter/material.dart';
import 'package:parent_app_flutter/core/theme/app_theme.dart';
import 'package:parent_app_flutter/core/network/api_client.dart';
import 'package:intl/intl.dart';
import 'dart:async';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({Key? key}) : super(key: key);

  @override
  _MessagesScreenState createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  bool _isLoading = true;
  String _error = '';
  List<dynamic> _conversations = [];

  // Active Thread Data
  String? _currentThreadId;
  String? _currentThreadTitle;
  String? _currentThreadRole;
  Color? _currentThreadColor;
  String? _currentThreadAvatar;
  bool _isLoadingThread = false;
  List<dynamic> _messages = [];
  bool _isTyping = false;
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _loadConversations();
    _refreshTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (_currentThreadId == null) {
        // Refresh conversation list quietly
        _loadConversationsQuietly();
      } else {
        // Refresh thread quietly
        _loadThreadQuietly(_currentThreadId!);
      }
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadConversationsQuietly() async {
    try {
      final response = await ApiClient.dio.get('/messages');
      if (response.statusCode == 200 && response.data['success'] == true) {
        if (mounted) {
          setState(() {
            _conversations = response.data['conversations'] ?? [];
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _loadThreadQuietly(String conversationId) async {
    try {
      final response = await ApiClient.dio.get('/messages/$conversationId');
      if (response.statusCode == 200 && response.data['success'] == true) {
        if (mounted && _currentThreadId == conversationId) {
          final newMessages = response.data['messages'] ?? [];
          final isTypingStatus = response.data['isTyping'] == true;
          
          bool hasChanges = newMessages.length != _messages.length || _isTyping != isTypingStatus;
          if (!hasChanges) {
            for (int i = 0; i < newMessages.length; i++) {
               if (newMessages[i]['isRead'] != _messages[i]['isRead'] || 
                   newMessages[i]['deliveryStatus'] != _messages[i]['deliveryStatus']) {
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
            });
            if (newMessages.length > oldLength) {
              _scrollToBottom();
            }
          }
          
          // Mark as read in the background
          _markAsReadQuietly(conversationId);
        }
      }
    } catch (_) {}
  }

  Future<void> _loadConversations() async {
    setState(() {
      _isLoading = true;
      _isTyping = false;
      _error = '';
    });
    try {
      final response = await ApiClient.dio.get('/messages');
      if (response.statusCode == 200) {
        final data = response.data;
        if (data['success'] == true) {
          setState(() {
            _conversations = data['conversations'] ?? [];
            _isLoading = false;
          });
        } else {
          setState(() {
            _error = data['error'] ?? 'Failed to load';
            _isLoading = false;
          });
        }
      } else {
        setState(() {
          _error = 'Server error: ${response.statusCode}';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Network error: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _loadThread(String conversationId, String title, String role, Color color, String avatar) async {
    setState(() {
      _currentThreadId = conversationId;
      _currentThreadTitle = title;
      _currentThreadRole = role;
      _currentThreadColor = color;
      _currentThreadAvatar = avatar;
      _isLoadingThread = true;
      _messages = [];
    });
    
    try {
      final response = await ApiClient.dio.get('/messages/$conversationId');
      if (response.statusCode == 200) {
        final data = response.data;
        if (data['success'] == true) {
          setState(() {
            _messages = data['messages'] ?? [];
            _isTyping = data['isTyping'] == true;
            _isLoadingThread = false;
          });
          _scrollToBottom();
          
          // Mark as read in the background
          _markAsReadQuietly(conversationId);
        }
      }
    } catch (e) {
      setState(() {
        _isLoadingThread = false;
      });
      print('Failed to load messages $e');
    }
  }

  Future<void> _markAsReadQuietly(String conversationId) async {
    try {
      await ApiClient.dio.post('/messages/$conversationId/mark-read');
    } catch (_) {}
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _currentThreadId == null) return;
    
    _messageController.clear();
    
    // Optimistic insert
    final newMsg = {
      'content': text,
      'senderType': 'PARENT',
      'isMe': true,
      'createdAt': DateTime.now().toIso8601String(),
    };
    setState(() {
      _messages.add(newMsg);
    });
    _scrollToBottom();
    
    try {
      final response = await ApiClient.dio.post('/messages/$_currentThreadId', data: {
        'content': text,
      });
      if (response.statusCode == 200 && response.data['success'] == true) {
        // Replace optimistic msg with real msg? For now it's fine.
        _loadConversations(); // refresh snippet list
      }
    } catch (e) {
      print('Failed to send message: $e');
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  String _formatTime(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      final now = DateTime.now();
      if (dt.year == now.year && dt.month == now.month && dt.day == now.day) {
        return DateFormat('h:mm a').format(dt);
      }
      return DateFormat('MMM d').format(dt);
    } catch (e) {
      return '';
    }
  }
  
  Color _mapTypeToColor(String type) {
    switch (type.toUpperCase()) {
      case 'HOMEWORK': return AppTheme.peachAcc;
      case 'ATTENDANCE': return AppTheme.sageAcc;
      case 'TEACHER': return AppTheme.skyAcc;
      default: return const Color(0xFF0891B2);
    }
  }

  String _mapTypeToEmoji(String type) {
    switch (type.toUpperCase()) {
      case 'HOMEWORK': return '📚';
      case 'ATTENDANCE': return '✅';
      case 'TEACHER': return '👩‍🏫';
      default: return '💬';
    }
  }

  DateTime? _lastTypingPing;

  void _onTyping() {
    if (_currentThreadId == null) return;
    
    final now = DateTime.now();
    // Only send a ping every 3 seconds to avoid spamming the backend
    if (_lastTypingPing == null || now.difference(_lastTypingPing!).inSeconds >= 3) {
      _lastTypingPing = now;
      ApiClient.dio.post('/shared/messages/$_currentThreadId/typing').catchError((_) => null);
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
            child: _currentThreadId == null ? _buildConversationList() : _buildThreadView(),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      padding: const EdgeInsets.fromLTRB(18, 0, 18, 12),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            const SizedBox(height: 10),
            // Drag Handle
            Container(
               width: 36, height: 4, 
               decoration: BoxDecoration(
                 color: const Color(0x59B49B78), // rgba(180,155,120,0.35)
                 borderRadius: BorderRadius.circular(2),
               ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                if (_currentThreadId != null)
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _currentThreadId = null;
                      });
                      _loadConversations();
                    },
                    child: Container(
                      width: 38, height: 38,
                      margin: const EdgeInsets.only(right: 12),
                      decoration: BoxDecoration(
                        color: AppTheme.bg2,
                        border: Border.all(color: const Color(0xFFE5E7EB)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(
                        child: Icon(Icons.arrow_back_ios_new, color: AppTheme.t1, size: 16),
                      ),
                    ),
                  )
                else
                  Container(
                    width: 38, height: 38,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: AppTheme.skyBg,
                      border: Border.all(color: AppTheme.skyBorder),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Center(
                      child: Icon(Icons.forum_outlined, color: AppTheme.skyAcc, size: 20),
                    ),
                  ),

                // Title Section
                Expanded(
                  child: _currentThreadId != null
                    ? Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              _currentThreadAvatar != null && _currentThreadAvatar!.startsWith('http')
                                ? ClipRRect(
                                    borderRadius: BorderRadius.circular(15),
                                    child: Image.network(
                                      _currentThreadAvatar!,
                                      width: 24,
                                      height: 24,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) => const Text('💬', style: TextStyle(fontSize: 14)),
                                    ),
                                  )
                                : Text(
                                    _currentThreadAvatar ?? '💬', 
                                    style: const TextStyle(fontSize: 14)
                                  ),
                              const SizedBox(width: 6),
                              Text(_currentThreadTitle ?? '', style: const TextStyle(fontFamily: 'Outfit', color: AppTheme.t1, fontSize: 15, fontWeight: FontWeight.w800)),
                            ],
                          ),
                          Text(_currentThreadRole ?? 'Teacher', style: const TextStyle(color: AppTheme.t4, fontSize: 10.5, fontWeight: FontWeight.w600)),
                        ],
                      )
                    : const Text(
                        'Messages',
                        style: TextStyle(
                          fontFamily: 'Outfit',
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.t1,
                        ),
                      ),
                ),

                // Close Button
                GestureDetector(
                  onTap: () {
                    if (Navigator.canPop(context)) {
                      Navigator.pop(context);
                    }
                  },
                  child: Container(
                    width: 30, height: 30,
                    decoration: BoxDecoration(
                      color: AppTheme.bg2,
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: const Center(
                      child: Icon(Icons.close, color: AppTheme.t2, size: 16),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildConversationList() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error.isNotEmpty) {
      return Center(child: Text(_error, style: const TextStyle(color: Colors.red)));
    }
    if (_conversations.isEmpty) {
      return const Center(child: Text('No active conversations.', style: TextStyle(color: AppTheme.t3)));
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
      itemCount: _conversations.length,
      itemBuilder: (context, index) {
        final c = _conversations[index];
        final snippet = c['latestMessage'];
        final isUnread = snippet != null && snippet['isRead'] == false && snippet['senderType'] != 'PARENT';
        final isFlagged = snippet != null && snippet['isFlagged'] == true;
        final emoji = _mapTypeToEmoji(c['type'] ?? '');
        final color = _mapTypeToColor(c['type'] ?? '');
        final role = '${c['type']?.toString().capitalize() ?? 'Staff'} · ${c['studentName']}';
        
        final avatarUrl = c['avatar'];
        
        return GestureDetector(
          onTap: () => _loadThread(c['id'], c['title'], role, color, avatarUrl ?? emoji),
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 1),
            padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 6),
            decoration: BoxDecoration(
              border: index == _conversations.length - 1 ? null : const Border(bottom: BorderSide(color: Color(0x0A000000))),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                Container(
                  width: 46, height: 46,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Stack(
                    children: [
                      Center(
                        child: Text(emoji, style: const TextStyle(fontSize: 22)),
                      ),
                      // Mock online dot logic since real realtime status is undefined for now
                      Positioned(
                        bottom: 1, right: 1,
                        child: Container(
                          width: 11, height: 11,
                          decoration: BoxDecoration(
                            color: const Color(0xFF22C55E),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                        ),
                      )
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        c['title'] ?? 'Teacher',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F0F23)),
                      ),
                      const SizedBox(height: 3),
                      if (isFlagged)
                        Row(
                          children: [
                            const Icon(Icons.error_outline_rounded, size: 12, color: Color(0xFFEF4444)),
                            const SizedBox(width: 4),
                            const Expanded(
                              child: Text(
                                'Message flagged',
                                style: TextStyle(fontSize: 11.5, color: Color(0xFFEF4444), fontStyle: FontStyle.italic),
                              ),
                            ),
                          ],
                        )
                      else
                        Text(
                          snippet != null ? snippet['content'] : 'No messages yet.',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 11.5, color: Color(0xFF6B7280)),
                        ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      _formatTime(c['lastMessageAt']),
                      style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8)),
                    ),
                    if (isUnread) ...[
                      const SizedBox(height: 5),
                      Container(
                        constraints: const BoxConstraints(minWidth: 18),
                        height: 18,
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(
                           gradient: const LinearGradient(
                             colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                             begin: Alignment.topLeft,
                             end: Alignment.bottomRight,
                           ),
                           borderRadius: BorderRadius.circular(9),
                           boxShadow: const [BoxShadow(color: Color(0x596366F1), blurRadius: 8, offset: Offset(0, 2))],
                        ),
                        child: const Center(
                          child: Text('1', style: TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.w900)), 
                        ),
                      ),
                    ]
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildThreadView() {
    return Column(
      children: [
        Expanded(
          child: _isLoadingThread
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                  itemCount: _messages.length + (_isTyping ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == _messages.length && _isTyping) {
                      return _buildTypingIndicator();
                    }
                    
                    final m = _messages[index];
                    final isMe = m['senderType'] == 'PARENT' || m['isMe'] == true;
                    final isParent = m['senderType'] == 'PARENT';
                    
                    final prevMsg = index > 0 ? _messages[index - 1] : null;
                    final nextMsg = index < _messages.length - 1 ? _messages[index + 1] : null;

                    final prevIsSame = prevMsg != null && (prevMsg['senderType'] == 'PARENT' || prevMsg['isMe'] == true) == isMe;
                    final nextIsSame = nextMsg != null && (nextMsg['senderType'] == 'PARENT' || nextMsg['isMe'] == true) == isMe;

                    final isConsecutive = prevIsSame;
                    final isLastGroup = !nextIsSame;
                    final showName = (!isParent && !isConsecutive);

                    return _buildChatBubble(
                       text: m['content'] ?? '',
                       time: _formatTime(m['createdAt']),
                       isMe: isMe,
                       senderName: m['senderName'] ?? '',
                       isConsecutive: isConsecutive,
                       isLastGroup: isLastGroup,
                       showName: showName,
                       isFlagged: m['isFlagged'] == true,
                       isRead: m['isRead'] == true,
                       deliveryStatus: m['deliveryStatus'] ?? 'SENT',
                    );
                  },
                ),
        ),
        if (_currentThreadId != null) _buildEmojiBar(),
        if (_currentThreadId != null) _buildChatInput(),
      ],
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          SizedBox(
            width: 30,
            child: Container(
              width: 30, height: 30,
              decoration: BoxDecoration(
                color: (_currentThreadColor ?? const Color(0xFF6366F1)).withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  _currentThreadAvatar ?? '💬', 
                  style: const TextStyle(fontSize: 16)
                ),
              ),
            ),
          ),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(18),
                topRight: Radius.circular(18),
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(18),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(3, (index) {
                return TweenAnimationBuilder<double>(
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
                          color: Color(0xFF6B7280),
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
  
  Widget _buildChatBubble({
    required String text, 
    required String time, 
    required bool isMe, 
    required String senderName,
    required bool isConsecutive,
    required bool isLastGroup,
    required bool showName,
    bool isFlagged = false,
    bool isRead = false,
    String deliveryStatus = 'SENT',
  }) {
    final showAv = !isMe && isLastGroup;

    return Padding(
      padding: EdgeInsets.only(bottom: isLastGroup ? 10 : 2),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
             SizedBox(
               width: 30,
               child: showAv 
                 ? Container(
                     width: 30, height: 30,
                     decoration: BoxDecoration(
                       color: (_currentThreadColor ?? const Color(0xFF6366F1)).withOpacity(0.15),
                       shape: BoxShape.circle,
                     ),
                     child: Center(
                       child: _currentThreadAvatar != null && _currentThreadAvatar!.startsWith('http')
                         ? ClipRRect(
                             borderRadius: BorderRadius.circular(15),
                             child: Image.network(
                               _currentThreadAvatar!,
                               width: 30,
                               height: 30,
                               fit: BoxFit.cover,
                               errorBuilder: (context, error, stackTrace) => const Text('💬', style: TextStyle(fontSize: 16)),
                             ),
                           )
                         : Text(
                             _currentThreadAvatar ?? '💬', 
                             style: const TextStyle(fontSize: 16)
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
                if (isMe && isFlagged)
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
                      crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        if (showName && senderName.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 3, left: 4),
                            child: Text(
                              senderName.split(' ').take(2).join(' '), // First 2 words max
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF6B7280),
                              ),
                            ),
                          ),
                        if (isMe && isFlagged)
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
                            if (!isMe && isFlagged) {
                              setStateBubble(() => _isRevealed = !_isRevealed);
                            }
                          },
                          child: Container(
                            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.73),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: isMe ? null : const Color(0xFFF8FAFC), 
                              gradient: isMe 
                                  ? const LinearGradient(colors: [Color(0xFF5B5EEB), Color(0xFF7C3AED)], begin: Alignment.topLeft, end: Alignment.bottomRight) 
                                  : null,
                              border: isMe ? null : Border.all(color: const Color(0xFFE2E8F0)),
                              borderRadius: BorderRadius.only(
                                topLeft: const Radius.circular(18),
                                topRight: const Radius.circular(18),
                                bottomLeft: Radius.circular((!isMe && !isLastGroup) ? 4 : 18),
                                bottomRight: Radius.circular((isMe && !isLastGroup) ? 4 : 18),
                              ),
                              boxShadow: [
                                if (isMe) const BoxShadow(color: Color(0x336366F1), blurRadius: 10, offset: Offset(0, 4)),
                              ],
                            ),
                            child: Text(
                              text,
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 13,
                                fontStyle: FontStyle.normal,
                                fontWeight: FontWeight.w400,
                                color: isMe 
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
                          alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                time,
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF94A3B8),
                                ),
                              ),
                              if (isMe) ...[
                                const SizedBox(width: 4),
                                Icon(
                                  isRead ? Icons.done_all_rounded : (deliveryStatus == 'DELIVERED' ? Icons.done_all_rounded : Icons.check_rounded),
                                  size: 14,
                                  color: isRead ? const Color(0xFF22C55E) : const Color(0xFF94A3B8), // Green for read, Grey for others
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
              // Append to message controller
              final text = _messageController.text;
              _messageController.value = TextEditingValue(
                text: text + emoji,
                selection: TextSelection.collapsed(offset: text.length + emoji.length),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFF4F5F9), // Background matching the attach button
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
  
  Widget _buildChatInput() {
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
                child: const Center(
                  child: Icon(Icons.send_rounded, color: Colors.white, size: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

extension StringExtension on String {
  String capitalize() {
    return "${this[0].toUpperCase()}${this.substring(1).toLowerCase()}";
  }
}
