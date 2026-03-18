import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/theme/app_theme.dart';
import '../../core/state/auth_state.dart';
import '../../core/config/api_config.dart';

// ─── Data Model ────────────────────────────────────────────────
class StaffNotification {
  final String id;
  final String title;
  final String body;
  final String type;       // DIARY, SYSTEM, ATTENDANCE, etc.
  final DateTime createdAt;
  final bool read;

  StaffNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.createdAt,
    required this.read,
  });

  factory StaffNotification.fromJson(Map<String, dynamic> j) {
    return StaffNotification(
      id: j['id'] ?? '',
      title: j['title'] ?? 'Notification',
      body: j['body'] ?? j['message'] ?? '',
      type: j['type'] ?? 'SYSTEM',
      createdAt: DateTime.tryParse(j['createdAt'] ?? '') ?? DateTime.now(),
      read: j['read'] ?? j['isRead'] ?? false,
    );
  }
}

// ─── Provider ──────────────────────────────────────────────────
final staffNotificationsProvider = FutureProvider.autoDispose<List<StaffNotification>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) return [];
  try {
    final res = await http.get(
      Uri.parse('$apiBase/api/mobile/v1/staff/notifications?limit=50'),
      headers: {'Authorization': 'Bearer ${user!.token}'},
    ).timeout(const Duration(seconds: 10));

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['success'] == true && data['notifications'] != null) {
        return (data['notifications'] as List)
            .map((n) => StaffNotification.fromJson(n))
            .toList();
      }
    }
  } catch (e) {
    debugPrint("Error fetching notifications: $e");
  }
  return [];
});

// ─── Notification Overlay View (matches v12 design) ───────────
class NotificationsView extends ConsumerStatefulWidget {
  const NotificationsView({super.key});

  @override
  ConsumerState<NotificationsView> createState() => _NotificationsViewState();
}

class _NotificationsViewState extends ConsumerState<NotificationsView> {
  String _activeFilter = 'All';
  final Set<String> _localReadIds = {};
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _pollTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      ref.invalidate(staffNotificationsProvider);
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  // ─── Category helpers ──────────────────────────────────────
  static const _categories = ['All', 'Academic', 'Alerts', 'Messages', 'Admin'];

  IconData _iconForType(String type) {
    switch (type.toUpperCase()) {
      case 'DIARY':
      case 'HOMEWORK':
        return Icons.menu_book_rounded;
      case 'ATTENDANCE':
        return Icons.fact_check_outlined;
      case 'ALERT':
        return Icons.warning_amber_rounded;
      case 'MESSAGE':
      case 'CHAT':
        return Icons.chat_bubble_outline_rounded;
      case 'ADMIN':
        return Icons.admin_panel_settings_outlined;
      case 'FEE':
      case 'PAYMENT':
        return Icons.payment_rounded;
      default:
        return Icons.notifications_outlined;
    }
  }

  Color _colorForType(String type) {
    switch (type.toUpperCase()) {
      case 'DIARY':
      case 'HOMEWORK':
        return const Color(0xFFFF5733);
      case 'ATTENDANCE':
        return const Color(0xFF16A34A);
      case 'ALERT':
        return const Color(0xFFD97706);
      case 'MESSAGE':
      case 'CHAT':
        return const Color(0xFF2563EB);
      case 'ADMIN':
        return const Color(0xFF7C3AED);
      case 'FEE':
      case 'PAYMENT':
        return const Color(0xFFF97316);
      default:
        return const Color(0xFFFF5733);
    }
  }

  String _catForType(String type) {
    switch (type.toUpperCase()) {
      case 'DIARY':
      case 'HOMEWORK':
      case 'ATTENDANCE':
        return 'Academic';
      case 'ALERT':
        return 'Alerts';
      case 'MESSAGE':
      case 'CHAT':
        return 'Messages';
      case 'ADMIN':
      case 'SYSTEM':
        return 'Admin';
      default:
        return 'Admin';
    }
  }

  String _tagForType(String type) {
    switch (type.toUpperCase()) {
      case 'DIARY':
        return 'Notice';
      case 'HOMEWORK':
        return 'Homework';
      case 'ATTENDANCE':
        return 'Attendance';
      case 'ALERT':
        return 'Alert';
      case 'MESSAGE':
      case 'CHAT':
        return 'Chat';
      case 'FEE':
      case 'PAYMENT':
        return 'Finance';
      case 'ADMIN':
        return 'Admin';
      default:
        return 'System';
    }
  }

  String _dateLabel(DateTime dt) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final d = DateTime(dt.year, dt.month, dt.day);
    if (d == today) return 'Today';
    if (d == yesterday) return 'Yesterday';
    return '${dt.day}/${dt.month}/${dt.year}';
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dt.day}/${dt.month}';
  }

  bool _isUnread(StaffNotification n) => !n.read && !_localReadIds.contains(n.id);

  void _markRead(String id) {
    setState(() => _localReadIds.add(id));
    // Fire-and-forget API call to mark as read (optional endpoint)
  }

  void _markAllRead(List<StaffNotification> all) {
    setState(() {
      for (final n in all) {
        _localReadIds.add(n.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final notifsAsync = ref.watch(staffNotificationsProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        child: Container(
          color: const Color(0xFFFAFBFE),
          child: notifsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error loading notifications')),
            data: (allNotifs) => _buildContent(allNotifs),
          ),
        ),
      ),
    );
  }

  Widget _buildContent(List<StaffNotification> allNotifs) {
    // Filter
    final filtered = _activeFilter == 'All'
        ? allNotifs
        : allNotifs.where((n) => _catForType(n.type) == _activeFilter).toList();

    final unreadCount = allNotifs.where(_isUnread).length;
    final totalRead = allNotifs.length - unreadCount;

    return Column(
      children: [
        // ─── Header ────────────────────────────────────────────
        _buildHeader(allNotifs, unreadCount),
        // ─── Summary Stats ─────────────────────────────────────
        _buildSummary(allNotifs.length, unreadCount, totalRead),
        // ─── Filter Chips ──────────────────────────────────────
        _buildFilterChips(allNotifs),
        // ─── Items List ────────────────────────────────────────
        Expanded(
          child: filtered.isEmpty
              ? _buildEmpty()
              : _buildNotifList(filtered),
        ),
      ],
    );
  }

  Widget _buildHeader(List<StaffNotification> all, int unreadCount) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFFAFBFE),
        border: Border(bottom: BorderSide(color: Color.fromRGBO(20, 14, 40, 0.06), width: 1.5)),
      ),
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            const SizedBox(height: 10),
            Container(
              width: 36, height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(100),
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                // Back button
                GestureDetector(
                  onTap: () => Navigator.of(context).pop(),
                  child: Container(
                    width: 34, height: 34,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.arrow_back_ios_new_rounded, size: 14, color: Color(0xFF140E28)),
                  ),
                ),
                const SizedBox(width: 10),
                // Title + badge
                Expanded(
                  child: Row(
                    children: [
                      const Text(
                        'Notifications',
                        style: TextStyle(
                          fontFamily: 'Outfit',
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF140E28),
                        ),
                      ),
                      if (unreadCount > 0) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [Color(0xFFFF5733), Color(0xFFFF006E)]),
                            borderRadius: BorderRadius.circular(100),
                          ),
                          child: Text(
                            '$unreadCount',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                // Mark all read
                GestureDetector(
                  onTap: () => _markAllRead(all),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF0EE),
                      borderRadius: BorderRadius.circular(100),
                      border: Border.all(color: const Color(0xFFFF5733).withOpacity(0.2)),
                    ),
                    child: const Text(
                      'Mark all read',
                      style: TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFFFF5733),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _buildSummary(int total, int unread, int read) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 10, 16, 4),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
      ),
      child: Row(
        children: [
          _summaryItem('$total', 'Total'),
          _summaryDiv(),
          _summaryItem('$unread', 'Unread'),
          _summaryDiv(),
          _summaryItem('$read', 'Read'),
        ],
      ),
    );
  }

  Widget _summaryItem(String num, String label) {
    return Expanded(
      child: Column(
        children: [
          Text(num, style: const TextStyle(fontFamily: 'Outfit', fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFFFF5733))),
          const SizedBox(height: 2),
          Text(label.toUpperCase(), style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8), letterSpacing: 0.4)),
        ],
      ),
    );
  }

  Widget _summaryDiv() {
    return Container(width: 1, height: 32, color: const Color(0xFFE2E8F0));
  }

  Widget _buildFilterChips(List<StaffNotification> all) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      child: Row(
        children: _categories.map((cat) {
          final isActive = _activeFilter == cat;
          final count = cat == 'All'
              ? all.where(_isUnread).length
              : all.where((n) => _catForType(n.type) == cat && _isUnread(n)).length;

          return GestureDetector(
            onTap: () => setState(() => _activeFilter = cat),
            child: Container(
              margin: const EdgeInsets.only(right: 6),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
              decoration: BoxDecoration(
                gradient: isActive ? const LinearGradient(colors: [Color(0xFFFF5733), Color(0xFFFF006E)]) : null,
                color: isActive ? null : Colors.white,
                borderRadius: BorderRadius.circular(100),
                border: isActive ? null : Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                boxShadow: isActive
                    ? [BoxShadow(color: const Color(0xFFFF5733).withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 3))]
                    : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    cat,
                    style: TextStyle(
                      fontFamily: 'Satoshi',
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: isActive ? Colors.white : const Color(0xFF64748B),
                    ),
                  ),
                  if (count > 0) ...[
                    const SizedBox(width: 5),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: BoxDecoration(
                        color: isActive ? Colors.white.withOpacity(0.3) : const Color(0xFFE2E8F0),
                        borderRadius: BorderRadius.circular(100),
                      ),
                      child: Text(
                        '$count',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: isActive ? Colors.white : const Color(0xFF64748B),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildNotifList(List<StaffNotification> items) {
    // Group by date
    final Map<String, List<StaffNotification>> groups = {};
    for (final n in items) {
      final label = _dateLabel(n.createdAt);
      groups.putIfAbsent(label, () => []).add(n);
    }

    return ListView(
      padding: const EdgeInsets.only(bottom: 120),
      children: groups.entries.expand((entry) {
        return [
          // Date separator
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 6),
            child: Row(
              children: [
                Text(
                  entry.key,
                  style: const TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF94A3B8),
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(child: Container(height: 1, color: const Color(0xFFE2E8F0))),
              ],
            ),
          ),
          // Items
          ...entry.value.map((n) => _buildNotifItem(n)),
        ];
      }).toList(),
    );
  }

  Widget _buildNotifItem(StaffNotification n) {
    final isUnread = _isUnread(n);
    final color = _colorForType(n.type);

    return GestureDetector(
      onTap: () => _markRead(n.id),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isUnread ? const Color(0xFFFFF5F3) : Colors.transparent,
          border: Border(
            left: isUnread
                ? const BorderSide(color: Color(0xFFFF5733), width: 3)
                : BorderSide.none,
            bottom: BorderSide(color: const Color(0xFFE2E8F0).withOpacity(0.5)),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon
            Container(
              width: 42, height: 42,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Center(child: Icon(_iconForType(n.type), size: 20, color: color)),
                  Positioned(
                    top: -3, right: -3,
                    child: Container(
                      width: 12, height: 12,
                      decoration: BoxDecoration(
                        color: color,
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFFFAFBFE), width: 2),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Body
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title + Tag row
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          n.title,
                          style: TextStyle(
                            fontFamily: 'Satoshi',
                            fontSize: 13.5,
                            fontWeight: isUnread ? FontWeight.w800 : FontWeight.w700,
                            color: const Color(0xFF140E28),
                            height: 1.3,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(100),
                        ),
                        child: Text(
                          _tagForType(n.type),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: color,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (n.body.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(
                      n.body,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF64748B),
                        height: 1.4,
                      ),
                    ),
                  ],
                  const SizedBox(height: 5),
                  Text(
                    _timeAgo(n.createdAt),
                    style: const TextStyle(
                      fontFamily: 'Satoshi',
                      fontSize: 10.5,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
            ),
            // Unread dot
            if (isUnread) ...[
              const SizedBox(width: 8),
              Container(
                width: 8, height: 8,
                margin: const EdgeInsets.only(top: 6),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFFFF5733), Color(0xFFFF006E)]),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: const Color(0xFFFF5733).withOpacity(0.15), blurRadius: 6),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 72, height: 72,
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(24),
            ),
            child: const Center(
              child: Text('🔕', style: TextStyle(fontSize: 28)),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'All caught up!',
            style: TextStyle(fontFamily: 'Outfit', fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF140E28)),
          ),
          const SizedBox(height: 6),
          const Text(
            'No notifications in this\ncategory right now.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'Satoshi',
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: Color(0xFF64748B),
            ),
          ),
        ],
      ),
    );
  }
}
