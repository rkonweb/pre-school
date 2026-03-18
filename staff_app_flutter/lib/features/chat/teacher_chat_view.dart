import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import '../../core/theme/app_theme.dart';
import '../../core/state/auth_state.dart';
import '../../core/config/api_config.dart';
import 'teacher_chat_thread_view.dart';

final staffConversationsProvider = FutureProvider.autoDispose<List<ChatConversation>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) return [];
  try {
    final res = await http.get(
      Uri.parse('$apiBase/api/mobile/v1/staff/messages'),
      headers: {'Authorization': 'Bearer ${user!.token}'},
    ).timeout(const Duration(seconds: 10));
    
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['success'] == true) {
        return (data['conversations'] as List).map((c) {
          final isGroup = c['type'] == 'GROUP';
          final gradientIndex = c['id'].hashCode % 5;
          final List<List<Color>> randomGradients = [
            const [Color(0xFF6366F1), Color(0xFF8B5CF6)],
            const [Color(0xFFFF5722), Color(0xFFFF9800)],
            const [Color(0xFF0D9488), Color(0xFF06B6D4)],
            const [Color(0xFFEC4899), Color(0xFFF43F5E)],
            const [Color(0xFFD97706), Color(0xFFF59E0B)],
          ];
          
          DateTime time = DateTime.parse(c['lastMessageAt']).toLocal();
          String formattedTime = "${time.hour > 12 ? time.hour - 12 : time.hour == 0 ? 12 : time.hour}:${time.minute.toString().padLeft(2, '0')} ${time.hour >= 12 ? 'PM' : 'AM'}";
          
          String initials = "";
          if (c['student'] != null && c['student']['name'] != null) {
            List<String> parts = c['student']['name'].split(" ");
            if (parts.isNotEmpty) {
              initials = parts[0][0];
              if (parts.length > 1) {
                initials += parts[1][0];
              }
            }
          }

          int unreadCount = 0; // We can integrate unread logic if available
          
          return ChatConversation(
            id: c['id'],
            name: c['title'] ?? 'Unknown',
            lastMessage: c['latestMessage'] != null ? c['latestMessage']['content'] : 'No messages yet',
            time: formattedTime,
            unreadCount: unreadCount,
            isGroup: isGroup,
            initials: initials.isNotEmpty ? initials.toUpperCase() : 'U',
            gradient: randomGradients[gradientIndex],
            icon: isGroup ? Icons.groups_rounded : Icons.person_rounded,
            lastSender: c['latestMessage'] != null ? c['latestMessage']['senderName'] : null,
            senderIsYou: c['latestMessage'] != null && c['latestMessage']['senderType'] == 'STAFF',
            rawStudentId: c['student']?['id'],
            isFlagged: c['latestMessage'] != null && c['latestMessage']['isFlagged'] == true,
            avatarUrl: c['student']?['avatar'],
          );
        }).toList().cast<ChatConversation>();
      }
    }
  } catch (e) {
    debugPrint("Error fetching teacher chats: $e");
  }
  return [];
});

class TeacherChatView extends ConsumerStatefulWidget {
  const TeacherChatView({super.key});

  @override
  ConsumerState<TeacherChatView> createState() => _TeacherChatViewState();
}

class _TeacherChatViewState extends ConsumerState<TeacherChatView> {
  String selectedFilter = 'All';
  Timer? _timer;
  Map<String, dynamic>? _currentThreadExtra;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      ref.invalidate(staffConversationsProvider);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _closeChatThread() {
    setState(() {
      _currentThreadExtra = null;
    });
    ref.invalidate(staffConversationsProvider);
  }

  @override
  Widget build(BuildContext context) {
    if (_currentThreadExtra != null) {
      return ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        child: TeacherChatThreadView(
          title: _currentThreadExtra!['title'] ?? 'Chat',
          subtitle: _currentThreadExtra!['subtitle'] ?? '',
          gradient: _currentThreadExtra!['gradient'] ?? const [Color(0xFF6366F1), Color(0xFF8B5CF6)],
          icon: _currentThreadExtra!['icon'],
          conversationId: _currentThreadExtra!['conversationId'] ?? '',
          rawStudentId: _currentThreadExtra!['rawStudentId'] ?? '',
          avatarUrl: _currentThreadExtra!['avatarUrl'],
          onBack: _closeChatThread,
        ),
      );
    }
    
    final convosAsync = ref.watch(staffConversationsProvider);
    
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        child: Container(
          color: Colors.white,
          child: Column(
            children: [
              _buildHeader(),
              _buildSearchBar(),
              _buildFilters(),
              Expanded(
                child: convosAsync.when(
                  data: (conversations) {
                    if (conversations.isEmpty) {
                      return const Center(child: Text("No conversations found."));
                    }
                    
                    // Client-side filtering
                    List<ChatConversation> filtered = conversations;
                    if (selectedFilter == 'Unread') {
                      filtered = conversations.where((c) => c.unreadCount > 0).toList();
                    } else if (selectedFilter == 'Groups') {
                      filtered = conversations.where((c) => c.isGroup).toList();
                    }
                    
                    return ListView(
                      padding: EdgeInsets.zero,
                      children: [
                        _buildSectionLabel('💬 RECENT'),
                        ...filtered.map((c) => _buildConversationRow(c)),
                        const SizedBox(height: 120),
                      ],
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, st) => Center(child: Text('Error: $e')),
                ),
              ),
            ],
          ),
        ),
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
                Container(
                  width: 38, height: 38,
                  margin: const EdgeInsets.only(right: 12),
                  decoration: BoxDecoration(
                    color: AppTheme.teacherTheme.colors.first.withOpacity(0.1),
                    border: Border.all(color: AppTheme.teacherTheme.colors.first.withOpacity(0.2)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Icon(Icons.forum_outlined, color: AppTheme.teacherTheme.colors.first, size: 20),
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Messages', style: TextStyle(fontFamily: 'Outfit', color: Color(0xFF140E28), fontSize: 18, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 2),
                      const Text('Recent conversations', style: TextStyle(fontFamily: 'Satoshi', color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () => _showNewChatSelection(context),
                  child: Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      gradient: AppTheme.teacherTheme,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.edit_note_rounded, color: Colors.white, size: 22),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }


  Widget _buildSearchBar() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
      ),
      child: const Row(
        children: [
          Icon(Icons.search_rounded, size: 18, color: Color(0xFF94A3B8)),
          SizedBox(width: 10),
          Expanded(
            child: TextField(
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF1E293B),
                fontWeight: FontWeight.w500,
              ),
              cursorColor: Color(0xFFFF5733),
              decoration: InputDecoration(
                hintText: 'Search messages, parents, staff...',
                hintStyle: TextStyle(
                  fontSize: 13,
                  color: Color(0xFF94A3B8),
                  fontWeight: FontWeight.w500,
                ),
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    final filters = ['All', 'Parents', 'Groups', 'Unread'];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 18),
      child: Row(
        children: filters.map((f) {
          final isSelected = selectedFilter == f;
          return GestureDetector(
            onTap: () => setState(() => selectedFilter = f),
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFFFFF1F2) : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? const Color(0xFFFF5733).withOpacity(0.3) : const Color(0xFFE2E8F0),
                  width: 1.5,
                ),
              ),
              child: Text(
                f,
                style: TextStyle(
                  color: isSelected ? const Color(0xFFFF5733) : const Color(0xFF64748B),
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Future<void> _showNewChatSelection(BuildContext context) async {
    final result = await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const _NewChatBottomSheet(),
    );

    if (result != null && result is Map<String, dynamic>) {
      if (!context.mounted) return;
      _openChatThread(result);
    }
  }

  void _openChatThread(Map<String, dynamic> extra) {
    setState(() {
      _currentThreadExtra = extra;
    });
  }

  Widget _buildSectionLabel(String text) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 6),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          color: Color(0xFF94A3B8),
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildConversationRow(ChatConversation conv) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          _openChatThread({
            'title': conv.name,
            'subtitle': conv.isGroup ? '8 members · 5 online' : 'Parent of ${conv.name}',
            'gradient': conv.gradient,
            'icon': conv.icon,
            'conversationId': conv.id,
            'rawStudentId': conv.rawStudentId,
            'avatarUrl': conv.avatarUrl,
          });
        },
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
          child: Row(
            children: [
              // Avatar
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: conv.gradient,
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(conv.isGroup ? 14 : 24),
                ),
                alignment: Alignment.center,
                child: conv.isGroup && conv.icon != null
                    ? Icon(conv.icon, color: Colors.white, size: 22)
                    : Text(
                        conv.initials ?? '',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 15,
                          fontFamily: 'Cabinet Grotesk',
                        ),
                      ),
              ),
              const SizedBox(width: 12),
              // Body
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          conv.name,
                          style: const TextStyle(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF140E28),
                          ),
                        ),
                        Text(
                          conv.time,
                          style: const TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF94A3B8),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Expanded(
                          child: RichText(
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            text: TextSpan(
                              style: TextStyle(
                                fontSize: 13,
                                color: (conv.unreadCount > 0) ? const Color(0xFF1E293B) : const Color(0xFF64748B),
                                fontWeight: (conv.unreadCount > 0) ? FontWeight.w700 : FontWeight.w500,
                              ),
                              children: [
                                if (conv.senderIsYou)
                                  const TextSpan(
                                    text: 'You: ',
                                    style: TextStyle(color: Color(0xFFFF5733), fontWeight: FontWeight.w700),
                                  )
                                else if (conv.lastSender != null)
                                  TextSpan(
                                    text: '${conv.lastSender}: ',
                                    style: const TextStyle(fontWeight: FontWeight.w700),
                                  ),
                                if (conv.isFlagged) ...[
                                  const WidgetSpan(
                                    child: Padding(
                                      padding: EdgeInsets.only(right: 4, bottom: 1),
                                      child: Icon(Icons.error_outline_rounded, size: 12, color: Color(0xFFEF4444)),
                                    ),
                                    alignment: PlaceholderAlignment.middle,
                                  ),
                                  const TextSpan(
                                    text: 'Message flagged',
                                    style: TextStyle(fontStyle: FontStyle.italic, color: Color(0xFFEF4444)),
                                  ),
                                ] else
                                  TextSpan(text: conv.lastMessage),
                              ],
                            ),
                          ),
                        ),
                        if (conv.unreadCount > 0)
                          Container(
                            margin: const EdgeInsets.only(left: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFF5733),
                              borderRadius: BorderRadius.circular(10),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFFF5733).withOpacity(0.3),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Text(
                              conv.unreadCount.toString(),
                              style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w900),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NewChatBottomSheet extends ConsumerStatefulWidget {
  const _NewChatBottomSheet();

  @override
  ConsumerState<_NewChatBottomSheet> createState() => _NewChatBottomSheetState();
}

class _NewChatBottomSheetState extends ConsumerState<_NewChatBottomSheet> {
  List<dynamic> _contacts = [];
  List<dynamic> _filteredContacts = [];
  bool _isLoading = true;
  String _error = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchContacts();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _filterContacts(String query) {
    if (query.isEmpty) {
      setState(() => _filteredContacts = List.from(_contacts));
      return;
    }
    final q = query.toLowerCase();
    setState(() {
      _filteredContacts = _contacts.where((c) {
        final name = (c['name'] ?? '').toString().toLowerCase();
        final roll = (c['rollNo'] ?? '').toString().toLowerCase();
        return name.contains(q) || roll.contains(q);
      }).toList();
    });
  }

  Future<void> _fetchContacts() async {
    final user = ref.read(userProfileProvider);
    if (user?.token == null) return;
    try {
      final res = await http.get(
        Uri.parse('$apiBase/api/mobile/v1/staff/chat-contacts'),
        headers: {'Authorization': 'Bearer ${user!.token}'},
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success']) {
          setState(() {
            _contacts = data['contacts'];
            _filteredContacts = List.from(_contacts);
            _isLoading = false;
          });
          return;
        }
      }
      setState(() {
        _error = 'Failed to load contacts';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Error loading contacts: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _startChat(String studentId, String studentName) async {
    final user = ref.read(userProfileProvider);
    if (user?.token == null) return;

    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(child: CircularProgressIndicator()),
      );

      final res = await http.post(
        Uri.parse('$apiBase/api/mobile/v1/staff/messages/init'),
        headers: {
          'Authorization': 'Bearer ${user!.token}',
          'Content-Type': 'application/json'
        },
        body: jsonEncode({'studentId': studentId}),
      );

      if (!mounted) return;
      if (!mounted) return;
      // Close loading dialog
      Navigator.of(context, rootNavigator: true).pop();

      print("Start Chat API Response: ${res.statusCode} ${res.body}");

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success']) {
          if (!mounted) return;
          // Close bottom sheet and pass result
          Navigator.of(context).pop({
            'title': data['conversation']['title'],
            'subtitle': 'Parent of $studentName',
            'gradient': const [Color(0xFF6366F1), Color(0xFF8B5CF6)],
            'icon': Icons.person_rounded,
            'conversationId': data['conversation']['id'],
            'rawStudentId': studentId,
            'avatarUrl': data['conversation']?['student']?['avatar'],
          });
        } else {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: ${data['error']}')));
        }
      } else {
         ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error ${res.statusCode}: Failed to start chat')));
      }
    } catch (e) {
      if (mounted) {
        // Close loading dialog on error
        Navigator.of(context, rootNavigator: true).pop();
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Exception: $e')));
      }
      debugPrint("Error starting chat: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 20),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: const Color(0xFFE2E8F0),
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              'New Chat',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: Color(0xFF1E293B),
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Search Bar
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 18),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFCBD5E1), width: 1.5),
            ),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, size: 20, color: Color(0xFF64748B)),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    onChanged: _filterContacts,
                    style: const TextStyle(
                      fontSize: 16,
                      color: Colors.black87,
                      fontWeight: FontWeight.w500,
                    ),
                    cursorColor: const Color(0xFFFF5733),
                    decoration: const InputDecoration(
                      hintText: 'Search student or roll no...',
                      hintStyle: TextStyle(
                        fontSize: 15,
                        color: Colors.black54,
                        fontWeight: FontWeight.w400,
                      ),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _error.isNotEmpty
                    ? Center(child: Text(_error))
                    : _filteredContacts.isEmpty
                        ? const Center(child: Text('No available contacts'))
                        : ListView.builder(
                            itemCount: _filteredContacts.length,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemBuilder: (ctx, index) {
                              final contact = _filteredContacts[index];
                              return ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: const Color(0xFFF1F5F9),
                                  child: Text(
                                    contact['name'] != null && contact['name'].toString().isNotEmpty ? contact['name'][0].toUpperCase() : 'U',
                                    style: const TextStyle(
                                      color: Color(0xFF64748B),
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                title: Text(
                                  contact['name'] ?? 'Unknown',
                                  style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF0D1326), fontSize: 16),
                                ),
                                subtitle: Text(
                                  contact['rollNo'] ?? 'Parent',
                                  style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                                ),
                                onTap: () => _startChat(contact['id'], contact['name'] ?? 'Unknown'),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}

class ChatConversation {
  final String id;
  final String name;
  final String lastMessage;
  final String time;
  final int unreadCount;
  final bool isGroup;
  final String? initials;
  final List<Color> gradient;
  final IconData? icon;
  final String? lastSender;
  final bool senderIsYou;
  final String? rawStudentId;
  final bool isFlagged;
  final String? avatarUrl;

  ChatConversation({
    required this.id,
    required this.name,
    required this.lastMessage,
    required this.time,
    required this.unreadCount,
    this.isGroup = false,
    this.initials,
    required this.gradient,
    this.icon,
    this.lastSender,
    this.senderIsYou = false,
    this.rawStudentId,
    this.isFlagged = false,
    this.avatarUrl,
  });
}
