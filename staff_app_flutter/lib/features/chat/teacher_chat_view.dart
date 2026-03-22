import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import '../../core/theme/app_theme.dart';
import '../../core/state/auth_state.dart';
import '../../core/config/api_config.dart';
import '../../shared/components/module_popup_shell.dart';
import '../../shared/components/app_fab.dart';
import 'teacher_chat_thread_view.dart';

// ─── Design tokens ────────────────────────────────────────────────────────────
const _bg     = Color(0xFFF4F0FF);
const _ink    = Color(0xFF140E28);
const _ink3   = Color(0xFF7B7291);
const _ink4   = Color(0xFFB5B0C4);
const _tA     = Color(0xFFFF5733);
const _tGrad  = LinearGradient(
  colors: [Color(0xFFFF5733), Color(0xFFFF006E)],
  begin: Alignment.topLeft, end: Alignment.bottomRight,
);

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
            const [Color(0xFFFF5733), Color(0xFFFF006E)],
            const [Color(0xFF6366F1), Color(0xFF8B5CF6)],
            const [Color(0xFF0D9488), Color(0xFF06B6D4)],
            const [Color(0xFFEC4899), Color(0xFFF43F5E)],
            const [Color(0xFFD97706), Color(0xFFF59E0B)],
          ];

          DateTime time = DateTime.parse(c['lastMessageAt']).toLocal();
          String formattedTime =
              "${time.hour > 12 ? time.hour - 12 : time.hour == 0 ? 12 : time.hour}"
              ":${time.minute.toString().padLeft(2, '0')}"
              " ${time.hour >= 12 ? 'PM' : 'AM'}";

          String initials = "";
          if (c['student'] != null && c['student']['name'] != null) {
            List<String> parts = c['student']['name'].split(" ");
            if (parts.isNotEmpty) {
              initials = parts[0][0];
              if (parts.length > 1) initials += parts[1][0];
            }
          }

          return ChatConversation(
            id: c['id'],
            name: c['title'] ?? 'Unknown',
            lastMessage: c['latestMessage'] != null ? c['latestMessage']['content'] : 'No messages yet',
            time: formattedTime,
            unreadCount: 0,
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
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      ref.invalidate(staffConversationsProvider);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _closeChatThread() {
    setState(() => _currentThreadExtra = null);
    ref.invalidate(staffConversationsProvider);
  }

  void _openChatThread(Map<String, dynamic> extra) {
    setState(() => _currentThreadExtra = extra);
  }

  @override
  Widget build(BuildContext context) {
    if (_currentThreadExtra != null) {
      return ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        child: TeacherChatThreadView(
          title: _currentThreadExtra!['title'] ?? 'Chat',
          subtitle: _currentThreadExtra!['subtitle'] ?? '',
          gradient: _currentThreadExtra!['gradient'] ?? const [Color(0xFFFF5733), Color(0xFFFF006E)],
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
          color: _bg,
          child: Stack(
            children: [
              Column(children: [
                _buildHeader(),
                _buildSearchBar(),
                _buildFilters(),
                Expanded(
                  child: convosAsync.when(
                    data: (conversations) {
                      var filtered = conversations.where((c) {
                        final matchFilter = selectedFilter == 'All'
                            || (selectedFilter == 'Unread' && c.unreadCount > 0)
                            || (selectedFilter == 'Groups' && c.isGroup)
                            || (selectedFilter == 'Parents' && !c.isGroup);
                        final matchSearch = _searchQuery.isEmpty
                            || c.name.toLowerCase().contains(_searchQuery.toLowerCase())
                            || (c.lastMessage.toLowerCase().contains(_searchQuery.toLowerCase()));
                        return matchFilter && matchSearch;
                      }).toList();

                      if (filtered.isEmpty) return _buildEmptyState();

                      return ListView(
                        padding: const EdgeInsets.fromLTRB(0, 8, 0, 120),
                        children: [
                          _buildSectionLabel('RECENT'),
                          ...filtered.map((c) => _buildConversationRow(c)),
                        ],
                      );
                    },
                    loading: () => Center(child: CircularProgressIndicator(color: _tA, strokeWidth: 2.5)),
                    error: (e, _) => Center(child: Text('Error: $e', style: const TextStyle(color: _ink3))),
                  ),
                ),
              ]),
              // ── New Chat FAB — bottom left ──────────────────────────────
              Positioned(
                bottom: 24,
                left: 20,
                child: AppFab(
                  onTap: () => _showNewChatSelection(context),
                  icon: Icons.edit_rounded,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─── Header ───────────────────────────────────────────────────────────────
  Widget _buildHeader() {
    return ModulePageHeader(
      title: 'Messages',
      icon: Icons.forum_rounded,
    );
  }

  // ─── Search ───────────────────────────────────────────────────────────────
  Widget _buildSearchBar() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, 3))],
      ),
      child: Row(children: [
        const SizedBox(width: 14),
        const Icon(Icons.search_rounded, size: 20, color: _ink4),
        const SizedBox(width: 10),
        Expanded(
          child: TextField(
            controller: _searchController,
            style: const TextStyle(fontFamily: 'Satoshi', fontSize: 14,
                fontWeight: FontWeight.w500, color: _ink),
            cursorColor: _tA,
            onChanged: (v) => setState(() => _searchQuery = v),
            decoration: InputDecoration(
              hintText: 'Search messages, parents…',
              hintStyle: TextStyle(fontFamily: 'Satoshi', fontSize: 13,
                  fontWeight: FontWeight.w500, color: _ink4),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 14),
              isDense: true,
            ),
          ),
        ),
        if (_searchQuery.isNotEmpty)
          GestureDetector(
            onTap: () { _searchController.clear(); setState(() => _searchQuery = ''); },
            child: const Padding(
              padding: EdgeInsets.only(right: 12),
              child: Icon(Icons.close_rounded, size: 16, color: _ink4),
            ),
          )
        else
          const SizedBox(width: 14),
      ]),
    );
  }

  // ─── Filters ──────────────────────────────────────────────────────────────
  Widget _buildFilters() {
    final filters = [
      {'label': 'All',     'icon': Icons.all_inbox_rounded},
      {'label': 'Parents', 'icon': Icons.people_rounded},
      {'label': 'Groups',  'icon': Icons.groups_rounded},
      {'label': 'Unread',  'icon': Icons.mark_chat_unread_rounded},
    ];
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(children: filters.map((f) {
          final label = f['label'] as String;
          final icon = f['icon'] as IconData;
          final isSelected = selectedFilter == label;
          return GestureDetector(
            onTap: () {
              HapticFeedback.selectionClick();
              setState(() => selectedFilter = label);
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.only(right: 10),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                gradient: isSelected ? _tGrad : null,
                color: isSelected ? null : Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: isSelected
                    ? [BoxShadow(color: _tA.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 3))]
                    : [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 6)],
              ),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(icon, size: 14, color: isSelected ? Colors.white : _ink3),
                const SizedBox(width: 5),
                Text(label, style: TextStyle(
                  fontFamily: 'Satoshi', fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: isSelected ? Colors.white : _ink3,
                )),
              ]),
            ),
          );
        }).toList()),
      ),
    );
  }

  // ─── Section label ────────────────────────────────────────────────────────
  Widget _buildSectionLabel(String text) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 6),
      child: Row(children: [
        Container(width: 3, height: 12,
          decoration: BoxDecoration(
            gradient: _tGrad, borderRadius: BorderRadius.circular(2))),
        const SizedBox(width: 8),
        Text(text, style: const TextStyle(
          fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w900,
          color: _ink4, letterSpacing: 1.5)),
      ]),
    );
  }

  // ─── Conversation Row ─────────────────────────────────────────────────────
  Widget _buildConversationRow(ChatConversation conv) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        _openChatThread({
          'title': conv.name,
          'subtitle': conv.isGroup ? 'Group conversation' : 'Parent · tap to chat',
          'gradient': conv.gradient,
          'icon': conv.icon,
          'conversationId': conv.id,
          'rawStudentId': conv.rawStudentId,
          'avatarUrl': conv.avatarUrl,
        });
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 2))],
        ),
        child: Row(children: [
          // Avatar with gradient ring
          Stack(children: [
            Container(
              width: 52, height: 52,
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: conv.gradient,
                    begin: Alignment.topLeft, end: Alignment.bottomRight),
                borderRadius: BorderRadius.circular(conv.isGroup ? 16 : 26),
              ),
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: conv.gradient,
                      begin: Alignment.topLeft, end: Alignment.bottomRight),
                  borderRadius: BorderRadius.circular(conv.isGroup ? 14 : 24),
                ),
                alignment: Alignment.center,
                child: conv.isGroup && conv.icon != null
                    ? Icon(conv.icon, color: Colors.white, size: 22)
                    : Text(
                        conv.initials ?? 'U',
                        style: const TextStyle(
                          fontFamily: 'Cabinet Grotesk', color: Colors.white,
                          fontWeight: FontWeight.w900, fontSize: 16),
                      ),
              ),
            ),
            // Online dot
            Positioned(bottom: 1, right: 1,
              child: Container(
                width: 13, height: 13,
                decoration: BoxDecoration(
                  color: const Color(0xFF22C55E), shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2)),
              )),
          ]),
          const SizedBox(width: 13),
          // Content
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Expanded(child: Text(conv.name,
                style: const TextStyle(fontFamily: 'Satoshi', fontSize: 14.5,
                    fontWeight: FontWeight.w800, color: _ink),
                overflow: TextOverflow.ellipsis)),
              const SizedBox(width: 6),
              Text(conv.time, style: const TextStyle(
                fontFamily: 'Satoshi', fontSize: 10.5,
                fontWeight: FontWeight.w600, color: _ink4)),
            ]),
            const SizedBox(height: 4),
            Row(children: [
              Expanded(
                child: RichText(
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  text: TextSpan(
                    style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12.5,
                        fontWeight: FontWeight.w500, color: _ink3),
                    children: [
                      if (conv.senderIsYou)
                        TextSpan(
                          text: 'You: ',
                          style: TextStyle(color: _tA, fontWeight: FontWeight.w800)),
                      if (!conv.senderIsYou && conv.lastSender != null)
                        TextSpan(
                          text: '${conv.lastSender!.split(" ").first}: ',
                          style: const TextStyle(fontWeight: FontWeight.w700, color: _ink)),
                      if (conv.isFlagged) ...[
                        const WidgetSpan(
                          alignment: PlaceholderAlignment.middle,
                          child: Padding(
                            padding: EdgeInsets.only(right: 3),
                            child: Icon(Icons.flag_rounded, size: 11, color: Color(0xFFEF4444)),
                          ),
                        ),
                        const TextSpan(text: 'Message flagged',
                          style: TextStyle(fontStyle: FontStyle.italic, color: Color(0xFFEF4444))),
                      ] else
                        TextSpan(text: conv.lastMessage),
                    ],
                  ),
                ),
              ),
              if (conv.unreadCount > 0) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    gradient: _tGrad,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [BoxShadow(color: _tA.withOpacity(0.35), blurRadius: 8, offset: const Offset(0, 2))],
                  ),
                  child: Text(conv.unreadCount.toString(),
                    style: const TextStyle(fontFamily: 'Satoshi', color: Colors.white,
                        fontSize: 10, fontWeight: FontWeight.w900)),
                ),
              ],
            ]),
          ])),
        ]),
      ),
    );
  }

  // ─── Empty state ──────────────────────────────────────────────────────────
  Widget _buildEmptyState() {
    return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      Container(
        width: 72, height: 72,
        decoration: BoxDecoration(
          gradient: _tGrad, borderRadius: BorderRadius.circular(22),
          boxShadow: [BoxShadow(color: _tA.withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 6))]),
        child: const Icon(Icons.forum_rounded, color: Colors.white, size: 32)),
      const SizedBox(height: 16),
      const Text('No conversations yet', style: TextStyle(
        fontFamily: 'Cabinet Grotesk', fontSize: 17, fontWeight: FontWeight.w800, color: _ink)),
      const SizedBox(height: 6),
      Text('Tap the ✏️ button to start a new chat', style: TextStyle(
        fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w500, color: _ink3)),
    ]));
  }

  // ─── New chat sheet ───────────────────────────────────────────────────────
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
}

// ─── New Chat Bottom Sheet ────────────────────────────────────────────────────
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

  final List<List<Color>> _avatarGrads = const [
    [Color(0xFFFF5733), Color(0xFFFF006E)],
    [Color(0xFF6366F1), Color(0xFF8B5CF6)],
    [Color(0xFF0D9488), Color(0xFF06B6D4)],
    [Color(0xFFEC4899), Color(0xFFF43F5E)],
    [Color(0xFFD97706), Color(0xFFF59E0B)],
  ];

  @override
  void initState() { super.initState(); _fetchContacts(); }
  @override
  void dispose() { _searchController.dispose(); super.dispose(); }

  void _filterContacts(String query) {
    if (query.isEmpty) { setState(() => _filteredContacts = List.from(_contacts)); return; }
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
      if (!mounted) return;
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success']) {
          if (mounted) setState(() { _contacts = data['contacts']; _filteredContacts = List.from(_contacts); _isLoading = false; });
          return;
        }
      }
      if (mounted) setState(() { _error = 'Failed to load contacts'; _isLoading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = 'Error: $e'; _isLoading = false; });
    }
  }

  Future<void> _startChat(String studentId, String studentName, List<Color> grad) async {
    final user = ref.read(userProfileProvider);
    if (user?.token == null) return;
    try {
      showDialog(context: context, barrierDismissible: false,
          builder: (_) => Center(child: CircularProgressIndicator(color: _tA, strokeWidth: 2.5)));
      final res = await http.post(
        Uri.parse('$apiBase/api/mobile/v1/staff/messages/init'),
        headers: {'Authorization': 'Bearer ${user!.token}', 'Content-Type': 'application/json'},
        body: jsonEncode({'studentId': studentId}),
      );
      if (!mounted) return;
      Navigator.of(context, rootNavigator: true).pop();
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success']) {
          if (!mounted) return;
          Navigator.of(context).pop({
            'title': data['conversation']['title'],
            'subtitle': 'Parent of $studentName',
            'gradient': grad,
            'icon': Icons.person_rounded,
            'conversationId': data['conversation']['id'],
            'rawStudentId': studentId,
            'avatarUrl': data['conversation']?['student']?['avatar'],
          });
        }
      }
    } catch (e) {
      if (mounted) {
        Navigator.of(context, rootNavigator: true).pop();
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: _bg,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(children: [
        // Header
        Container(
          decoration: const BoxDecoration(
            gradient: _tGrad,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          child: Column(children: [
            Center(child: Container(width: 36, height: 4,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.4),
                borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 14),
            Row(children: [
              const Icon(Icons.person_add_rounded, color: Colors.white, size: 22),
              const SizedBox(width: 10),
              const Text('New Conversation', style: TextStyle(
                fontFamily: 'Clash Display', fontSize: 17,
                fontWeight: FontWeight.w800, color: Colors.white)),
              const Spacer(),
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  width: 32, height: 32,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.close_rounded, color: Colors.white, size: 18)),
              ),
            ]),
          ]),
        ),
        // Search
        Container(
          margin: const EdgeInsets.fromLTRB(16, 14, 16, 0),
          decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(18),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, 3))],
          ),
          child: Row(children: [
            const SizedBox(width: 14),
            const Icon(Icons.search_rounded, size: 20, color: _ink4),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: _searchController,
                onChanged: _filterContacts,
                style: const TextStyle(fontFamily: 'Satoshi', fontSize: 14, fontWeight: FontWeight.w500, color: _ink),
                cursorColor: _tA,
                decoration: InputDecoration(
                  hintText: 'Search student or roll no…',
                  hintStyle: TextStyle(fontFamily: 'Satoshi', fontSize: 13, color: _ink4),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 14), isDense: true,
                ),
              ),
            ),
          ]),
        ),
        const SizedBox(height: 12),
        // List
        Expanded(
          child: _isLoading
              ? Center(child: CircularProgressIndicator(color: _tA, strokeWidth: 2.5))
              : _error.isNotEmpty
                  ? Center(child: Text(_error, style: const TextStyle(color: _ink3)))
                  : _filteredContacts.isEmpty
                      ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Icon(Icons.search_off_rounded, size: 40, color: _ink4),
                          const SizedBox(height: 10),
                          const Text('No contacts found', style: TextStyle(fontFamily: 'Satoshi', color: _ink3)),
                        ]))
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                          itemCount: _filteredContacts.length,
                          itemBuilder: (_, i) {
                            final c = _filteredContacts[i];
                            final grad = _avatarGrads[i % _avatarGrads.length];
                            final name = (c['name'] ?? 'U').toString();
                            final initials = name.trim().split(' ').where((w) => w.isNotEmpty)
                                .take(2).map((w) => w[0].toUpperCase()).join();
                            return GestureDetector(
                              onTap: () => _startChat(c['id'], name, grad),
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white, borderRadius: BorderRadius.circular(18),
                                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04),
                                      blurRadius: 8, offset: const Offset(0, 2))]),
                                child: Row(children: [
                                  Container(
                                    width: 44, height: 44,
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(colors: grad,
                                          begin: Alignment.topLeft, end: Alignment.bottomRight),
                                      borderRadius: BorderRadius.circular(14)),
                                    alignment: Alignment.center,
                                    child: Text(initials, style: const TextStyle(
                                      fontFamily: 'Cabinet Grotesk', color: Colors.white,
                                      fontWeight: FontWeight.w900, fontSize: 15)),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                    Text(name, style: const TextStyle(fontFamily: 'Satoshi',
                                        fontSize: 14, fontWeight: FontWeight.w800, color: _ink)),
                                    const SizedBox(height: 2),
                                    Text(c['rollNo'] ?? 'Student',
                                      style: const TextStyle(fontFamily: 'Satoshi',
                                          fontSize: 11, fontWeight: FontWeight.w600, color: _ink3)),
                                  ])),
                                  Container(
                                    width: 32, height: 32,
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(colors: grad,
                                          begin: Alignment.topLeft, end: Alignment.bottomRight),
                                      borderRadius: BorderRadius.circular(10)),
                                    child: const Icon(Icons.arrow_forward_ios_rounded,
                                        color: Colors.white, size: 13)),
                                ]),
                              ),
                            );
                          }),
        ),
      ]),
    );
  }
}

// ─── Model ────────────────────────────────────────────────────────────────────
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
    required this.id, required this.name, required this.lastMessage,
    required this.time, required this.unreadCount,
    this.isGroup = false, this.initials, required this.gradient,
    this.icon, this.lastSender, this.senderIsYou = false,
    this.rawStudentId, this.isFlagged = false, this.avatarUrl,
  });
}
