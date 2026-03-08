import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
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
  bool _showSettings = false;

  Future<void> _markAllAsRead() async {
    final apiClient = ref.read(apiClientProvider);
    try {
      final response = await apiClient.post('parent/notifications/mark-all-read');
      if (response.statusCode == 200 && response.data['success'] == true) {
        ref.invalidate(notificationsProvider(_currentPage));
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('All notifications marked as read')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }

  Future<void> _markAsRead(String notificationId) async {
    final apiClient = ref.read(apiClientProvider);
    try {
      final response = await apiClient.post(
        'parent/notifications/$notificationId/mark-read',
      );
      if (response.statusCode == 200 && response.data['success'] == true) {
        ref.invalidate(notificationsProvider(_currentPage));
      }
    } catch (e) {
      // Silent fail
    }
  }

  @override
  Widget build(BuildContext context) {
    final notificationsAsync = ref.watch(notificationsProvider(_currentPage));
    final brand = ref.watch(schoolBrandProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: notificationsAsync.when(
        data: (state) => AppHeader(
          title: 'Notifications',
          subtitle: '${state.unreadCount} unread updates',
          showBackButton: false,
          showMenuButton: true,
          actions: [
            ElevatedButton(
              onPressed: () {},
              style: AppTheme.headerButtonStyle(),
              child: const Icon(Icons.search_rounded, size: 20),
            ),
            ElevatedButton(
              onPressed: () => setState(() => _showSettings = !_showSettings),
              style: AppTheme.headerButtonStyle(),
              child: Stack(
                children: [
                  const Icon(Icons.settings_rounded, size: 20),
                  Positioned(
                    top: -2,
                    right: -2,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFFEF4444),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        loading: () => const AppHeader(
          title: 'Notifications',
          subtitle: 'Loading...',
          showBackButton: false,
          showMenuButton: true,
        ),
        error: (_, __) => const AppHeader(
          title: 'Notifications',
          subtitle: 'Error loading',
          showBackButton: false,
          showMenuButton: true,
        ),
      ),
      body: notificationsAsync.when(
        data: (state) {
          if (_showSettings) {
            return _buildSettingsPanel();
          }

          if (state.notifications.isEmpty) {
            return _buildEmptyState();
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(notificationsProvider(_currentPage)),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.only(bottom: 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Mark all read bar
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    color: const Color(0xFFF8FAFC),
                    child: Row(
                      children: [
                        Text(
                          '${state.unreadCount} unread notification${state.unreadCount != 1 ? 's' : ''}',
                          style: GoogleFonts.dmSans(
                            fontSize: 12,
                            color: const Color(0xFF64748B),
                          ),
                        ),
                        const Spacer(),
                        if (state.unreadCount > 0)
                          GestureDetector(
                            onTap: _markAllAsRead,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFFEEF3FF),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                'Mark all read',
                                style: GoogleFonts.dmSans(
                                  color: const Color(0xFF2350DD),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  // Notifications list
                  ..._groupNotificationsByDate(state.notifications).entries.map((entry) {
                    final dateLabel = entry.key;
                    final notifications = entry.value;

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildGroupDivider(dateLabel, notifications.length),
                        ...notifications.map((notif) => _buildNotificationCard(notif)),
                      ],
                    );
                  }).toList(),
                ],
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => _buildErrorState(error),
      ),
    );
  }

  Map<String, List<AppNotification>> _groupNotificationsByDate(List<AppNotification> notifications) {
    final groups = <String, List<AppNotification>>{};
    final today = DateTime.now();
    final yesterday = today.subtract(const Duration(days: 1));

    for (final notif in notifications) {
      final date = DateTime.parse(notif.createdAt);
      String label;

      if (date.year == today.year && date.month == today.month && date.day == today.day) {
        label = 'Today';
      } else if (date.year == yesterday.year && date.month == yesterday.month && date.day == yesterday.day) {
        label = 'Yesterday';
      } else {
        label = DateFormat('MMM d').format(date);
      }

      groups.putIfAbsent(label, () => []).add(notif);
    }

    return groups;
  }

  Color _getTypeColor(String type) {
    switch (type.toUpperCase()) {
      case 'EMERGENCY':
        return const Color(0xFFEF4444);
      case 'FEE':
        return const Color(0xFFF5A623);
      case 'ATTENDANCE':
        return const Color(0xFF00C9A7);
      case 'ACADEMIC':
        return const Color(0xFF3B6EF8);
      case 'TRANSPORT':
        return const Color(0xFFFF6B3D);
      case 'HEALTH':
        return const Color(0xFFEC4899);
      case 'EVENT':
        return const Color(0xFF8B5CF6);
      default:
        return const Color(0xFF94A3B8);
    }
  }

  Color _getTypeBackgroundColor(String type) {
    final color = _getTypeColor(type);
    return color.withOpacity(0.1);
  }

  IconData _getTypeIcon(String type) {
    switch (type.toUpperCase()) {
      case 'EMERGENCY':
        return Icons.warning_rounded;
      case 'FEE':
        return Icons.account_balance_wallet_rounded;
      case 'ATTENDANCE':
        return Icons.check_circle_rounded;
      case 'ACADEMIC':
        return Icons.description_rounded;
      case 'TRANSPORT':
        return Icons.directions_bus_rounded;
      case 'HEALTH':
        return Icons.health_and_safety_rounded;
      case 'EVENT':
        return Icons.event_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  String _formatRelativeTime(String createdAt) {
    final date = DateTime.parse(createdAt);
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 1) {
      return 'just now';
    } else if (diff.inMinutes < 60) {
      return '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    } else {
      return DateFormat('MMM d').format(date);
    }
  }

  Widget _buildNotificationCard(AppNotification notif) {
    final color = _getTypeColor(notif.type);
    final bgColor = _getTypeBackgroundColor(notif.type);

    return GestureDetector(
      onTap: () {
        if (!notif.isRead) {
          _markAsRead(notif.id);
        }
      },
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
        decoration: BoxDecoration(
          color: notif.isRead ? const Color(0xFFF8FAFC) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border(left: BorderSide(color: color, width: 3)),
          boxShadow: notif.isRead
              ? []
              : [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      _getTypeIcon(notif.type),
                      color: color,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: bgColor,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                notif.type.toUpperCase(),
                                style: GoogleFonts.dmSans(
                                  color: color,
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const Spacer(),
                            Text(
                              _formatRelativeTime(notif.createdAt),
                              style: GoogleFonts.dmSans(
                                fontSize: 10,
                                color: const Color(0xFF94A3B8),
                              ),
                            ),
                            if (!notif.isRead) ...[
                              const SizedBox(width: 8),
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: color,
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 5),
                        Text(
                          notif.title,
                          style: GoogleFonts.sora(
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            color: const Color(0xFF1E293B),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                notif.message,
                style: GoogleFonts.dmSans(
                  fontSize: 12,
                  color: const Color(0xFF64748B),
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGroupDivider(String label, int count) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Row(
        children: [
          Text(
            label,
            style: GoogleFonts.sora(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: const Color(0xFF1E293B),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Container(height: 1, color: const Color(0xFFE2E8F0)),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              count.toString(),
              style: GoogleFonts.dmSans(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF64748B),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_off_outlined,
            size: 64,
            color: Colors.grey.shade300,
          ),
          const SizedBox(height: 16),
          Text(
            'No notifications yet',
            style: GoogleFonts.sora(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'You are all caught up!',
            style: GoogleFonts.dmSans(
              fontSize: 13,
              color: const Color(0xFF64748B),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(Object error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: Colors.red),
          const SizedBox(height: 16),
          Text(
            'Failed to load notifications',
            style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 8),
          Text(
            error.toString(),
            style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF64748B)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () => ref.invalidate(notificationsProvider(_currentPage)),
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  // ── SETTINGS PANEL ────────────────────────────────────────────────────────
  Widget _buildSettingsPanel() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Notification Settings',
            style: GoogleFonts.sora(
              fontWeight: FontWeight.bold,
              fontSize: 18,
              color: const Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 16),
          _settingsToggle(
            'Push Notifications',
            'Real-time alerts on your device',
            true,
            Icons.notifications_active_rounded,
            const Color(0xFF3B6EF8),
          ),
          _settingsToggle(
            'SMS Alerts',
            'Emergency-only SMS alerts',
            false,
            Icons.sms_rounded,
            const Color(0xFF00C9A7),
          ),
          _settingsToggle(
            'Email Digest',
            'Daily summary via email',
            true,
            Icons.email_rounded,
            const Color(0xFF8B5CF6),
          ),
          const SizedBox(height: 16),
          Text(
            'Notification Frequency',
            style: GoogleFonts.sora(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: const Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 10),
          _settingsToggle(
            'Smart Grouping',
            'Group related notifications together',
            true,
            Icons.auto_awesome_rounded,
            const Color(0xFFF5A623),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _settingsToggle(
    String title,
    String subtitle,
    bool value,
    IconData icon,
    Color color,
  ) =>
      Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  Text(
                    subtitle,
                    style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF94A3B8)),
                  ),
                ],
              ),
            ),
            Switch(
              value: value,
              onChanged: (_) {},
              activeColor: color,
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
          ],
        ),
      );
}
