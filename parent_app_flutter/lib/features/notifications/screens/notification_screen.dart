import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:parent_app_flutter/core/theme/app_theme.dart';
import 'dart:convert';
import 'package:parent_app_flutter/core/network/api_client.dart';
import 'package:intl/intl.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({Key? key}) : super(key: key);

  @override
  _NotificationScreenState createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  bool _isLoading = true;
  String _error = '';
  List<dynamic> _allNotifications = [];
  int _unreadCount = 0;
  String _activeFilter = 'all';

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });
    try {
      final response = await ApiClient.dio.get('/notifications?page=1');
      if (response.statusCode == 200) {
        final data = response.data;
        if (data['success'] == true) {
          setState(() {
            _allNotifications = data['data']['notifications'] ?? [];
            _unreadCount = data['data']['unreadCount'] ?? 0;
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

  Future<void> _markAllRead() async {
    try {
      final unreadIds = _allNotifications.where((n) => !(n['isRead'] ?? false)).map((n) => n['id']).toList();
      if (unreadIds.isEmpty) return;

      final response = await ApiClient.dio.patch('/notifications', data: {
        'notificationIds': unreadIds,
      });

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['success'] == true) {
          setState(() {
            for (var n in _allNotifications) {
              n['isRead'] = true;
            }
            _unreadCount = 0;
          });
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('All notifications marked as read')));
        }
      }
    } catch (e) {
      print('Error marking read: $e');
    }
  }

  Future<void> _markAsRead(String id, int index) async {
    try {
      if (_allNotifications[index]['isRead'] == true) return;
      
      final response = await ApiClient.dio.patch('/notifications', data: {
        'notificationIds': [id],
      });

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['success'] == true) {
          setState(() {
            _allNotifications[index]['isRead'] = true;
            if (_unreadCount > 0) _unreadCount--;
          });
        }
      }
    } catch (e) {
      print('Error marking single read: $e');
    }
  }

  int get _urgentCount => _allNotifications.where((n) => n['type'] == 'urgent').length;
  int get _totalCount => _allNotifications.length;

  List<dynamic> get _filteredNotifications {
    if (_activeFilter == 'all') return _allNotifications;
    return _allNotifications.where((n) => n['type'] == _activeFilter).toList();
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

  String _getGroupName(String? dateStr) {
    if (dateStr == null) return 'Earlier';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final yesterday = today.subtract(const Duration(days: 1));
      final date = DateTime(dt.year, dt.month, dt.day);

      if (date == today) return 'Today';
      if (date == yesterday) return 'Yesterday';
      if (now.difference(dt).inDays < 7) return 'This Week';
      return 'Earlier';
    } catch (e) {
      return 'Earlier';
    }
  }

  Map<String, List<dynamic>> _groupNotifications(List<dynamic> list) {
    Map<String, List<dynamic>> groups = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Earlier': [],
    };
    for (var n in list) {
      groups[_getGroupName(n['createdAt'])]?.add(n);
    }
    groups.removeWhere((key, value) => value.isEmpty);
    return groups;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // slate-50
      body: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.fromLTRB(20, 12, 12, 16),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
              ),
              child: Column(
                children: [
                  Center(child: Container(width: 36, height: 4, decoration: BoxDecoration(color: const Color(0xFFD1D5DB), borderRadius: BorderRadius.circular(2)))),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Container(
                        width: 36, height: 36,
                        decoration: BoxDecoration(color: const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(10)),
                        child: const Center(child: Text('🔔', style: TextStyle(fontSize: 18))),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Notifications',
                          style: GoogleFonts.outfit(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.t1,
                            letterSpacing: -0.3,
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: _markAllRead,
                        child: Text(
                          'Mark all read',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.a1,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () => Navigator.of(context).pop(),
                        child: Container(
                          width: 32, height: 32,
                          decoration: BoxDecoration(color: const Color(0xFFF3F4F6), borderRadius: BorderRadius.circular(10)),
                          child: const Icon(Icons.close_rounded, size: 18, color: Color(0xFF6B7280)),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      _buildStatPill('🔔', _unreadCount.toString(), 'Unread'),
                      const SizedBox(width: 8),
                      _buildStatPill('📋', _totalCount.toString(), 'Total'),
                      const SizedBox(width: 8),
                      _buildStatPill('🚨', _urgentCount.toString(), 'Urgent'),
                    ],
                  ),
                ],
              ),
            ),

            // Filters Layer
            Container(
              color: Colors.white,
              padding: const EdgeInsets.only(bottom: 12),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    _buildFilterChip('all', 'All', AppTheme.a1),
                    _buildFilterChip('academic', 'Academic', AppTheme.peachAcc),
                    _buildFilterChip('homework', 'Homework', const Color(0xFFFB923C)),
                    _buildFilterChip('attendance', 'Attendance', const Color(0xFFEF4444)),
                    _buildFilterChip('fee', 'Fees', AppTheme.goldAcc),
                    _buildFilterChip('ptm', 'PTM', const Color(0xFF7C3AED)),
                    _buildFilterChip('event', 'Events', AppTheme.mintAcc),
                    _buildFilterChip('transport', 'Transport', AppTheme.skyAcc),
                    _buildFilterChip('urgent', 'Urgent', AppTheme.roseAcc),
                  ],
                ),
              ),
            ),

            // Content
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _error.isNotEmpty
                      ? Center(child: Text(_error, style: const TextStyle(color: Colors.red)))
                      : RefreshIndicator(
                          onRefresh: _loadNotifications,
                          child: _buildFeed(),
                        ),
            ),
          ],
        ),
    );
  }

  Widget _buildStatPill(String icon, String val, String lbl) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9), // slate-100
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(icon, style: const TextStyle(fontSize: 16)),
            const SizedBox(width: 6),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(val, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.t1)),
                Text(lbl, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.t4)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String filterKey, String label, Color dotColor) {
    bool isActive = _activeFilter == filterKey;
    return GestureDetector(
      onTap: () {
        setState(() {
          _activeFilter = filterKey;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isActive ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            Container(
              width: 6, height: 6,
              decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isActive ? Colors.white : AppTheme.t3,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeed() {
    final list = _filteredNotifications;
    if (list.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('🎉', style: TextStyle(fontSize: 40)),
            const SizedBox(height: 10),
            Text('All clear!', style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.t2)),
            const Text('No notifications in this category', style: TextStyle(fontSize: 12, color: AppTheme.t4)),
          ],
        ),
      );
    }

    final groups = _groupNotifications(list);

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: groups.length + 1, // +1 for clear all button
      itemBuilder: (context, index) {
        if (index == groups.length) {
          return Padding(
            padding: const EdgeInsets.only(top: 20, bottom: 40),
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _allNotifications.clear();
                  _unreadCount = 0;
                });
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('All notifications cleared')));
              },
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.clear_all, size: 16, color: AppTheme.t3),
                    const SizedBox(width: 6),
                    Text(
                      'Clear All Notifications',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.t3),
                    ),
                  ],
                ),
              ),
            ),
          );
        }

        String grpName = groups.keys.elementAt(index);
        List<dynamic> items = groups[grpName]!;
        int unreadInGrp = items.where((n) => !(n['isRead'] ?? false)).length;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.only(bottom: 12, top: index > 0 ? 12 : 0),
              child: Row(
                children: [
                  Text(
                    grpName,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.t4, letterSpacing: 0.5),
                  ),
                  if (unreadInGrp > 0) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: AppTheme.roseBg,
                        border: Border.all(color: AppTheme.roseAcc.withOpacity(0.2)),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '$unreadInGrp new',
                        style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: AppTheme.roseAcc),
                      ),
                    ),
                  ]
                ],
              ),
            ),
            ...items.map((n) {
              int origIndex = _allNotifications.indexOf(n);
              return _buildNotifCard(n, origIndex);
            }).toList(),
          ],
        );
      },
    );
  }

  Widget _buildNotifCard(dynamic n, int origIndex) {
    bool isRead = n['isRead'] ?? false;
    String type = n['type'] ?? 'system';
    
    // Style Mapping
    Color tagBg = const Color(0xFFF1F5F9);
    Color tagColor = AppTheme.t3;
    String icon = '🔔';
    String tagStr = 'System';
    String sender = 'System';
    
    if (type == 'urgent') {
      tagBg = const Color(0x1FE11D48); tagColor = AppTheme.roseAcc; icon = '🚨'; tagStr = 'Urgent'; sender = 'School Admin';
    } else if (type == 'academic') {
      tagBg = const Color(0x1F0891B2); tagColor = AppTheme.peachAcc; icon = '📐'; tagStr = 'Academic'; sender = 'Teacher';
    } else if (type == 'homework') {
      tagBg = const Color(0x1FFB923C); tagColor = const Color(0xFFFB923C); icon = '📝'; tagStr = 'Homework'; sender = 'Teacher';
    } else if (type == 'attendance') {
      tagBg = const Color(0x1FEF4444); tagColor = const Color(0xFFEF4444); icon = '⚠️'; tagStr = 'Attendance'; sender = 'School';
    } else if (type == 'transport') {
      tagBg = const Color(0x1A2563EB); tagColor = AppTheme.skyAcc; icon = '🚌'; tagStr = 'Transport'; sender = 'Bus Tracker';
    } else if (type == 'fee') {
      tagBg = const Color(0x1AFFD600); tagColor = AppTheme.goldAcc; icon = '💳'; tagStr = 'Fees'; sender = 'Fee Office';
    } else if (type == 'event') {
      tagBg = const Color(0x1A059669); tagColor = AppTheme.sageAcc; icon = '🏆'; tagStr = 'Event'; sender = 'School';
    } else if (type == 'ptm') {
      tagBg = const Color(0x1A7C3AED); tagColor = const Color(0xFF7C3AED); icon = '👨‍👩‍👧'; tagStr = 'PTM'; sender = 'School';
    }
    
    // Use title as tag if it matches exactly? Actually Title is 'Fee Due', message is '...', let's use Title as sender or tag if we like. The UI uses sender = 'Fee Office', tag = 'Fees'.
    
    return GestureDetector(
      onTap: () {
        _markAsRead(n['id'], origIndex);
        // Show snackbar
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('✓ "$sender" notification read')));
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isRead ? Colors.white : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isRead ? const Color(0xFFE2E8F0) : tagColor.withOpacity(0.3)),
          boxShadow: isRead 
             ? const [BoxShadow(color: Color(0x0A000000), blurRadius: 4, offset: Offset(0, 2))]
             : [BoxShadow(color: tagColor.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(color: tagBg, shape: BoxShape.circle),
              child: Center(child: Text(icon, style: const TextStyle(fontSize: 16))),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        n['title'] ?? sender,
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.t1, height: 1.2),
                      ),
                      Text(
                        _formatTime(n['createdAt']),
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.t4),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    n['message'] ?? '',
                    style: TextStyle(fontSize: 13, color: isRead ? AppTheme.t3 : AppTheme.t2, height: 1.4),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: tagBg,
                      border: Border.all(color: tagBg),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      tagStr,
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: tagColor, letterSpacing: 0.3),
                    ),
                  ),
                ],
              ),
            ),
            if (!isRead)
              Container(
                width: 8, height: 8,
                margin: const EdgeInsets.only(left: 10, top: 2),
                decoration: const BoxDecoration(
                  color: AppTheme.roseAcc,
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: Color(0x66E11D48), blurRadius: 4)],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
