import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';

class TeacherChatView extends StatefulWidget {
  const TeacherChatView({super.key});

  @override
  State<TeacherChatView> createState() => _TeacherChatViewState();
}

class _TeacherChatViewState extends State<TeacherChatView> {
  String selectedFilter = 'All';

  final List<ChatConversation> pinnedConversations = [
    ChatConversation(
      name: '📚 Staff Lounge',
      lastMessage: 'Staff meeting moved to 4:30 PM today',
      time: '9:41 AM',
      unreadCount: 3,
      isGroup: true,
      lastSender: 'Arjun',
      gradient: const [Color(0xFF6366F1), Color(0xFF8B5CF6)],
      icon: Icons.groups_rounded,
    ),
    ChatConversation(
      name: '🏫 Class 8-A Parents',
      lastMessage: 'Unit test results will be shared by Friday',
      time: '8:15 AM',
      unreadCount: 0,
      isGroup: true,
      senderIsYou: true,
      gradient: const [Color(0xFFFF5722), Color(0xFFFF9800)],
      icon: Icons.school_rounded,
    ),
  ];

  final List<ChatConversation> recentConversations = [
    ChatConversation(
      name: 'Meera Krishnan',
      lastMessage: 'Ananya was unwell last week. Can she redo the...',
      time: 'Today',
      unreadCount: 1,
      initials: 'AK',
      gradient: const [Color(0xFF6366F1), Color(0xFF8B5CF6)],
    ),
    ChatConversation(
      name: 'Meera Pillai',
      lastMessage: 'Got it, will submit by EOD. Thanks!',
      time: 'Yesterday',
      unreadCount: 0,
      senderIsYou: true,
      initials: 'MP',
      gradient: const [Color(0xFF0D9488), Color(0xFF06B6D4)],
    ),
    ChatConversation(
      name: 'Suresh Mehta',
      lastMessage: "Thank you for the detailed feedback, ma'am!",
      time: 'Mon',
      unreadCount: 1,
      initials: 'RM',
      gradient: const [Color(0xFF8B5CF6), Color(0xFFA78BFA)],
    ),
    ChatConversation(
      name: 'Arjun Mehra',
      lastMessage: 'Leave for 15–16 Mar has been approved ✅',
      time: 'Mon',
      unreadCount: 0,
      initials: 'AM',
      gradient: const [Color(0xFFD97706), Color(0xFFF59E0B)],
    ),
    ChatConversation(
      name: 'Lata Patil',
      lastMessage: 'Sneha did really well in the practicals 🌟',
      time: 'Sun',
      unreadCount: 0,
      senderIsYou: true,
      initials: 'SP',
      gradient: const [Color(0xFFEC4899), Color(0xFFF43F5E)],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Stack(
        children: [
          Column(
            children: [
              _buildSearchBar(),
              _buildFilters(),
              Expanded(
                child: ListView(
                  padding: EdgeInsets.zero,
                  children: [
                    _buildSectionLabel('📌 PINNED'),
                    ...pinnedConversations.map((c) => _buildConversationRow(c)),
                    _buildSectionLabel('💬 RECENT'),
                    ...recentConversations.map((c) => _buildConversationRow(c)),
                    const SizedBox(height: 120), // Height for BottomNav + FAB
                  ],
                ),
              ),
            ],
          ),
          // Floating Action Button
          Positioned(
            bottom: 100, // Above bottom nav
            right: 18,
            child: GestureDetector(
              onTap: () {
                // Open new chat selection
              },
              child: Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  gradient: AppTheme.teacherTheme,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFFF5733).withOpacity(0.35),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(Icons.edit_note_rounded, color: Colors.white, size: 28),
              ),
            ),
          ),
        ],
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
    final filters = ['All', 'Parents', 'Staff', 'Groups', 'Unread'];
    return Container(
      height: 48,
      margin: const EdgeInsets.only(bottom: 10),
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 18),
        scrollDirection: Axis.horizontal,
        itemCount: filters.length,
        itemBuilder: (context, index) {
          final isSelected = selectedFilter == filters[index];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () => setState(() => selectedFilter = filters[index]),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFFFFF7ED) : Colors.white,
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(
                    color: isSelected ? const Color(0xFFFFE4D1) : const Color(0xFFE2E8F0),
                    width: 1.5,
                  ),
                  boxShadow: isSelected
                      ? [BoxShadow(color: const Color(0xFFFF5733).withOpacity(0.12), blurRadius: 8, offset: const Offset(0, 2))]
                      : [],
                ),
                alignment: Alignment.center,
                child: Row(
                  children: [
                    Text(
                      filters[index],
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: isSelected ? const Color(0xFFFF5733) : const Color(0xFF64748B),
                        fontFamily: 'Satoshi',
                      ),
                    ),
                    if (filters[index] == 'Unread') ...[
                      const SizedBox(width: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFF5733),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text('5', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
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
          context.push(
            '/messages/thread',
            extra: {
              'title': conv.name,
              'subtitle': conv.isGroup ? '8 members · 5 online' : 'Parent of Ananya Krishnan · Roll #01',
              'gradient': conv.gradient,
              'icon': conv.icon,
            },
          );
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
                        if (pinnedConversations.contains(conv))
                          Container(
                            margin: const EdgeInsets.only(left: 8),
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: Color(0xFFFF5733),
                              shape: BoxShape.circle,
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

class ChatConversation {
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

  ChatConversation({
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
  });
}
