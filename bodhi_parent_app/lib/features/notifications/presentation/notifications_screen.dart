import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../data/notifications_provider.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});
  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  int _currentPage = 1;
  String _activeFilter = 'all';
  bool _showSettings = false;

  // Filter tab definitions
  static const _filters = [
    {'key': 'all', 'label': 'All', 'count': '12'},
    {'key': 'unread', 'label': 'Unread', 'count': '8'},
    {'key': 'alerts', 'label': '🚨 Alerts', 'count': '2'},
    {'key': 'academic', 'label': '📚 Academic', 'count': '3'},
    {'key': 'transport', 'label': '🚌 Transport', 'count': '2'},
    {'key': 'finance', 'label': '💰 Finance', 'count': '2'},
    {'key': 'events', 'label': '📅 Events', 'count': '3'},
  ];

  // Mock notification data matching HTML spec
  static final _mockTodayNotifications = [
    {
      'type': 'alerts', 'accent': const Color(0xFFef4444),
      'icon': Icons.warning_rounded, 'iconBg': Color(0xFFfee2e2),
      'tag': '🚨 Emergency', 'tagColor': Color(0xFFef4444), 'tagBg': Color(0xFFfee2e2),
      'time': '2 min ago', 'title': 'Fire Drill — All Students Must Assemble',
      'body': "Scheduled fire drill today at 2:00 PM. Emma's class will assemble at Ground B, Gate 3.",
      'actions': [
        {'label': 'Acknowledged', 'style': 'danger'},
        {'label': 'View Details', 'style': 'secondary'},
      ], 'unread': true, 'pinned': true,
    },
    {
      'type': 'transport', 'accent': const Color(0xFFFF6B3D),
      'icon': Icons.directions_bus_rounded, 'iconBg': Color(0xFFFFF5EE),
      'tag': '🚌 Transport', 'tagColor': Color(0xFFFF6B3D), 'tagBg': Color(0xFFFFF5EE),
      'time': '14 min ago', 'title': 'Bus #7 Delayed — New ETA 4:05 PM',
      'body': "Heavy traffic near MG Road Junction. Original ETA 3:50 PM delayed by ~12 minutes. Emma is safe on board.",
      'actions': [
        {'label': 'Track Live', 'style': 'primary_orange'},
        {'label': 'Call Driver', 'style': 'secondary'},
      ], 'unread': true, 'pinned': false,
    },
    {
      'type': 'finance', 'accent': const Color(0xFFF5A623),
      'icon': Icons.account_balance_wallet_rounded, 'iconBg': Color(0xFFFFFBEB),
      'tag': '💰 Fee Reminder', 'tagColor': Color(0xFFF5A623), 'tagBg': Color(0xFFFFFBEB),
      'time': '1 hr ago', 'title': 'Q3 Tuition Fee Due in 5 Days',
      'body': '₹8,200 due by Nov 25. Late fee of ₹500 applies after the due date. Pay online or at school counter.',
      'actions': [
        {'label': 'Pay ₹8,200 Now', 'style': 'primary_amber'},
        {'label': 'Set Reminder', 'style': 'secondary'},
      ], 'unread': true, 'pinned': false,
    },
    {
      'type': 'academic', 'accent': const Color(0xFF00C9A7),
      'icon': Icons.check_circle_rounded, 'iconBg': Color(0xFFF0FDF9),
      'tag': '✅ Attendance', 'tagColor': Color(0xFF00C9A7), 'tagBg': Color(0xFFF0FDF9),
      'time': '8:32 AM', 'title': 'Emma Marked Present Today',
      'body': 'Emma scanned in at 8:28 AM at Gate A. Attendance for Nov 20 confirmed. Monthly: 94% ↑ excellent.',
      'actions': null, 'unread': true, 'pinned': false,
    },
    {
      'type': 'academic', 'accent': const Color(0xFF3B6EF8),
      'icon': Icons.description_rounded, 'iconBg': Color(0xFFEEF3FF),
      'tag': '📊 Academic', 'tagColor': Color(0xFF3B6EF8), 'tagBg': Color(0xFFEEF3FF),
      'time': '9:15 AM', 'title': 'Science Test Results — 47 / 50 ⭐',
      'body': "Emma scored 47/50 (A+) in the Chapter 6 Science test. Top 3 in class. Mrs. Sharma has added feedback.",
      'actions': [
        {'label': 'View Report', 'style': 'success'},
        {'label': 'Message Teacher', 'style': 'secondary'},
      ], 'unread': true, 'pinned': false,
    },
    {
      'type': 'academic', 'accent': const Color(0xFF8B5CF6),
      'icon': Icons.menu_book_rounded, 'iconBg': Color(0xFFF5F0FF),
      'tag': '📚 Diary Update', 'tagColor': Color(0xFF8B5CF6), 'tagBg': Color(0xFFF5F0FF),
      'time': '10:00 AM', 'title': 'Mrs. Sharma Added 2 Homework Tasks',
      'body': 'Math: Chapter 7 exercises 1–15 (due Nov 22). Science: Lab report on photosynthesis experiment (due Nov 25).',
      'actions': [
        {'label': 'Open Diary', 'style': 'primary_purple'},
      ], 'unread': true, 'pinned': false,
    },
    {
      'type': 'academic', 'accent': const Color(0xFFec4899),
      'icon': Icons.health_and_safety_rounded, 'iconBg': Color(0xFFfce7f3),
      'tag': '🩺 Health', 'tagColor': Color(0xFFec4899), 'tagBg': Color(0xFFfce7f3),
      'time': '11:30 AM', 'title': 'Vaccination Reminder — Tdap Booster Due',
      'body': 'Tdap booster is due March 2025 (4 months). School mandates updated records by Feb 28.',
      'actions': [
        {'label': 'View Records', 'style': 'secondary'},
        {'label': 'Dismiss', 'style': 'secondary'},
      ], 'unread': true, 'pinned': false,
    },
  ];

  static final _mockYesterdayNotifications = [
    {
      'type': 'events', 'accent': const Color(0xFF3B6EF8),
      'icon': Icons.event_rounded, 'iconBg': Color(0xFFEEF3FF),
      'tag': '📅 Event', 'tagColor': Color(0xFF3B6EF8), 'tagBg': Color(0xFFEEF3FF),
      'time': 'Yesterday 2:00 PM', 'title': 'Annual Sports Day — Nov 28',
      'body': "Mark your calendar! Annual Sports Day is scheduled for Nov 28. Emma is participating in 100m sprint.",
      'actions': [{'label': 'View Details', 'style': 'secondary'}],
      'unread': false, 'pinned': false,
    },
    {
      'type': 'transport', 'accent': const Color(0xFF00C9A7),
      'icon': Icons.directions_bus_rounded, 'iconBg': Color(0xFFF0FDF9),
      'tag': '🚌 Transport', 'tagColor': Color(0xFF00C9A7), 'tagBg': Color(0xFFF0FDF9),
      'time': 'Yesterday 3:40 PM', 'title': 'Emma Arrived Home Safely',
      'body': 'Bus #7 dropped Emma off at South Colony stop. All students accounted for. Arrival time: 3:40 PM.',
      'actions': null, 'unread': false, 'pinned': false,
    },
  ];

  List<Map<String, dynamic>> get _filteredToday {
    if (_activeFilter == 'all') return _mockTodayNotifications;
    if (_activeFilter == 'unread') return _mockTodayNotifications.where((n) => n['unread'] == true).toList();
    return _mockTodayNotifications.where((n) => n['type'] == _activeFilter).toList();
  }

  List<Map<String, dynamic>> get _filteredYesterday {
    if (_activeFilter == 'all') return _mockYesterdayNotifications;
    if (_activeFilter == 'unread') return [];
    return _mockYesterdayNotifications.where((n) => n['type'] == _activeFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = int.parse(_filters.firstWhere((f) => f['key'] == 'unread')['count']!);
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppHeader(
        title: 'Notifications',
        subtitle: '$unreadCount unread updates today',
        actions: [
          ElevatedButton(
            onPressed: () {},
            style: AppTheme.headerButtonStyle(),
            child: const Icon(Icons.search_rounded, size: 20),
          ),
          ElevatedButton(
            onPressed: () => setState(() => _showSettings = !_showSettings),
            style: AppTheme.headerButtonStyle(),
            child: Stack(children: [
              const Icon(Icons.settings_rounded, size: 20),
              Positioned(top: -2, right: -2, child: Container(width: 8, height: 8, decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFEF4444)))),
            ]),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilterTabs(),
          Expanded(
            child: _showSettings ? _buildSettingsPanel() : _buildFeed(),
          ),
        ],
      ),
    );
  }

  // ── FILTER TABS ─────────────────────────────────────────────────────────
  Widget _buildFilterTabs() {
    return Container(
      color: Colors.white,
      child: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Row(
              children: _filters.map((f) {
                final sel = _activeFilter == f['key'];
                return GestureDetector(
                  onTap: () => setState(() { _activeFilter = f['key']!; _showSettings = false; }),
                  child: Container(
                    margin: const EdgeInsets.only(right: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: sel ? const Color(0xFF2350DD) : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(children: [
                      Text(f['label']!, style: GoogleFonts.dmSans(
                        color: sel ? Colors.white : const Color(0xFF64748B),
                        fontWeight: FontWeight.w600, fontSize: 12,
                      )),
                      const SizedBox(width: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(color: sel ? Colors.white.withOpacity(0.2) : const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(20)),
                        child: Text(f['count']!, style: TextStyle(color: sel ? Colors.white : const Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.bold)),
                      ),
                    ]),
                  ),
                );
              }).toList(),
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),
        ],
      ),
    );
  }

  // ── FEED ──────────────────────────────────────────────────────────────────
  Widget _buildFeed() {
    final today = _filteredToday;
    final yesterday = _filteredYesterday;
    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 32),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Mark all read bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          color: const Color(0xFFF8FAFC),
          child: Row(children: [
            Text('8 unread notifications', style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF64748B))),
            const Spacer(),
            GestureDetector(
              onTap: () => ref.invalidate(notificationsProvider(1)),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(color: const Color(0xFFEEF3FF), borderRadius: BorderRadius.circular(20)),
                child: Text('Mark all read', style: GoogleFonts.dmSans(color: const Color(0xFF2350DD), fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ),
          ]),
        ),
        // AI Digest
        _buildAiDigest(),
        // Today group
        if (today.isNotEmpty) ...[
          _buildGroupDivider('Today', today.length),
          ...today.map((n) => _buildNotifCard(n)),
        ],
        // Yesterday group
        if (yesterday.isNotEmpty) ...[
          _buildGroupDivider('Yesterday', yesterday.length),
          ...yesterday.map((n) => _buildNotifCard(n, dimmed: true)),
        ],
      ]),
    );
  }

  Widget _buildAiDigest() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF0F2027), Color(0xFF1A2A6C)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: const Color(0xFF1A2A6C).withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Row(children: [
        Container(width: 40, height: 40, decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(12)), child: const Center(child: Icon(Icons.bolt_rounded, color: Color(0xFFF5A623), size: 22))),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text('AI Daily Digest', style: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(width: 8),
            Text('Nov 20', style: GoogleFonts.dmSans(color: Colors.white54, fontSize: 11)),
          ]),
          const SizedBox(height: 3),
          Text('Emma had a great day. 1 urgent fee alert, bus delayed 12 min, science test results in.', style: GoogleFonts.dmSans(color: Colors.white70, fontSize: 11), maxLines: 2),
          const SizedBox(height: 8),
          Wrap(spacing: 4, runSpacing: 4, children: ['⚠ 1 Urgent', '✅ Present', '🚌 Delayed', '🏆 A+ Test'].map((t) => Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withOpacity(0.2))),
            child: Text(t, style: GoogleFonts.dmSans(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600)),
          )).toList()),
        ])),
      ]),
    );
  }

  Widget _buildGroupDivider(String label, int count) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Row(children: [
        Text(label, style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13, color: const Color(0xFF1E293B))),
        const SizedBox(width: 8),
        Container(width: 60, height: 1, color: const Color(0xFFE2E8F0)),
        const SizedBox(width: 8),
        Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2), decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(20)), child: Text('$count', style: GoogleFonts.dmSans(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF64748B)))),
      ]),
    );
  }

  Widget _buildNotifCard(Map<String, dynamic> n, {bool dimmed = false}) {
    final accent = n['accent'] as Color;
    final isUnread = n['unread'] as bool;
    final isPinned = (n['pinned'] as bool?) ?? false;
    final actions = n['actions'] as List<Map<String, dynamic>>?;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      decoration: BoxDecoration(
        color: dimmed ? const Color(0xFFF8FAFC) : (isUnread ? Colors.white : const Color(0xFFF8FAFC)),
        borderRadius: BorderRadius.circular(16),
        border: Border(left: BorderSide(color: accent, width: 3)),
        boxShadow: isUnread ? [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))] : [],
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (isPinned) Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(children: [
              const Icon(Icons.push_pin_rounded, size: 12, color: Color(0xFF94A3B8)),
              const SizedBox(width: 4),
              Text('Pinned', style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8))),
            ]),
          ),
          Row(children: [
            Container(width: 40, height: 40, decoration: BoxDecoration(color: n['iconBg'] as Color, borderRadius: BorderRadius.circular(12)), child: Icon(n['icon'] as IconData, color: accent, size: 20)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2), decoration: BoxDecoration(color: n['tagBg'] as Color, borderRadius: BorderRadius.circular(20)), child: Text(n['tag'] as String, style: TextStyle(color: n['tagColor'] as Color, fontSize: 9, fontWeight: FontWeight.bold))),
                const Spacer(),
                Text(n['time'] as String, style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8))),
                if (isUnread) ...[const SizedBox(width: 6), Container(width: 8, height: 8, decoration: BoxDecoration(shape: BoxShape.circle, color: accent))],
              ]),
              const SizedBox(height: 5),
              Text(n['title'] as String, style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13, color: const Color(0xFF1E293B))),
            ])),
          ]),
          const SizedBox(height: 6),
          Text(n['body'] as String, style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF64748B)), maxLines: 3, overflow: TextOverflow.ellipsis),
          if (actions != null) ...[
            const SizedBox(height: 10),
            Row(children: actions.map((a) {
              final s = a['style'] as String;
              Color bg; Color fg;
              if (s == 'danger') { bg = const Color(0xFFfee2e2); fg = const Color(0xFFEF4444); }
              else if (s == 'primary_orange') { bg = const Color(0xFFFF6B3D); fg = Colors.white; }
              else if (s == 'primary_amber') { bg = const Color(0xFFF5A623); fg = Colors.white; }
              else if (s == 'primary_purple') { bg = const Color(0xFF8B5CF6); fg = Colors.white; }
              else if (s == 'success') { bg = const Color(0xFF00C9A7); fg = Colors.white; }
              else { bg = const Color(0xFFF1F5F9); fg = const Color(0xFF64748B); }
              return Expanded(child: Container(
                margin: const EdgeInsets.only(right: 6),
                padding: const EdgeInsets.symmetric(vertical: 7),
                decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
                child: Text(a['label'] as String, textAlign: TextAlign.center, style: GoogleFonts.dmSans(color: fg, fontWeight: FontWeight.bold, fontSize: 11)),
              ));
            }).toList()),
          ],
        ]),
      ),
    );
  }

  // ── SETTINGS PANEL ────────────────────────────────────────────────────────
  Widget _buildSettingsPanel() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Notification Settings', style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 18, color: const Color(0xFF1E293B))),
        const SizedBox(height: 16),
        _settingsToggle('Push Notifications', 'Real-time alerts on your device', true, Icons.notifications_active_rounded, const Color(0xFF3B6EF8)),
        _settingsToggle('SMS Alerts', 'Emergency-only SMS alerts', false, Icons.sms_rounded, const Color(0xFF00C9A7)),
        _settingsToggle('Email Digest', 'Daily summary via email', true, Icons.email_rounded, const Color(0xFF8B5CF6)),
        const SizedBox(height: 16),
        Text('Notification Frequency', style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 14, color: const Color(0xFF1E293B))),
        const SizedBox(height: 10),
        _settingsToggle('AI Smart Grouping', 'AI clusters related alerts (e.g. bus delay + ETA update) into one notification', true, Icons.auto_awesome_rounded, const Color(0xFFF5A623)),
        const SizedBox(height: 32),
      ]),
    );
  }

  Widget _settingsToggle(String title, String subtitle, bool value, IconData icon, Color color) => Container(
    margin: const EdgeInsets.only(bottom: 10),
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFE2E8F0))),
    child: Row(children: [
      Container(width: 38, height: 38, decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)), child: Icon(icon, color: color, size: 18)),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13)),
        Text(subtitle, style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF94A3B8))),
      ])),
      Switch(value: value, onChanged: (_) {}, activeColor: color, materialTapTargetSize: MaterialTapTargetSize.shrinkWrap),
    ]),
  );
}
