import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../data/messages_provider.dart';
import '../../dashboard/data/dashboard_provider.dart';

class MessagesScreen extends ConsumerStatefulWidget {
  const MessagesScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends ConsumerState<MessagesScreen> {
  @override
  Widget build(BuildContext context) {
    final brand = ref.watch(schoolBrandProvider);
    final dashboardAsync = ref.watch(dashboardDataProvider);
    final activeStudentId = dashboardAsync.value?['activeStudentId'];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Messages', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: activeStudentId == null 
        ? const Center(child: CircularProgressIndicator())
        : _buildMessagesBody(context, activeStudentId, brand),
    );
  }

  Widget _buildMessagesBody(BuildContext context, String studentId, SchoolBrandState brand) {
    final messagesAsync = ref.watch(messagesThreadDataProvider(studentId));

    return RefreshIndicator(
      onRefresh: () => ref.read(messagesThreadDataProvider(studentId).notifier).refresh(),
      child: Stack(
        children: [
          Positioned.fill(child: _buildStunningBackground(brand)),
          messagesAsync.when(
            data: (data) => _buildThreadsList(data['conversations'] as List? ?? []),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => Center(child: Text('Error: $err')),
          ),
        ],
      ),
    );
  }

  Widget _buildThreadsList(List<dynamic> conversations) {
    if (conversations.isEmpty) {
      return const Center(child: Text("No messages yet.", style: TextStyle(color: Colors.grey)));
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      itemCount: conversations.length,
      itemBuilder: (context, index) {
        final thread = conversations[index];
        final latest = thread['latestMessage'];
        final unread = latest != null && !latest['isRead'] && latest['senderName'] != 'You'; // Simplify for UI
        final timestamp = latest != null ? DateTime.parse(latest['createdAt']) : DateTime.parse(thread['lastMessageAt']);

        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: InkWell(
            onTap: () => context.push('/messages/${thread['id']}'),
            borderRadius: BorderRadius.circular(20),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.8),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white, width: 2),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: const Color(0xFFB9FBC0).withOpacity(0.3),
                    child: const Icon(Icons.school, color: Color(0xFF2E7D32), size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(child: Text(thread['title'] ?? 'Teacher', style: TextStyle(fontWeight: unread ? FontWeight.bold : FontWeight.w600, fontSize: 16), maxLines: 1, overflow: TextOverflow.ellipsis)),
                            Text(_formatTime(timestamp), style: TextStyle(fontSize: 12, color: unread ? const Color(0xFF2563EB) : Colors.grey.shade500, fontWeight: unread ? FontWeight.bold : FontWeight.normal)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                latest != null ? '${latest['senderName']}: ${latest['content']}' : 'No messages yet.',
                                style: TextStyle(
                                  color: unread ? Colors.black87 : Colors.grey.shade600,
                                  fontWeight: unread ? FontWeight.w600 : FontWeight.normal,
                                  fontSize: 14,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (unread)
                              Container(
                                margin: const EdgeInsets.only(left: 8),
                                width: 10,
                                height: 10,
                                decoration: const BoxDecoration(color: Color(0xFF2563EB), shape: BoxShape.circle),
                              )
                          ],
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  String _formatTime(DateTime date) {
    final now = DateTime.now();
    if (now.year == date.year && now.month == date.month && now.day == date.day) {
      return DateFormat('h:mm a').format(date);
    } else if (now.difference(date).inDays < 7) {
      return DateFormat('EEE').format(date);
    } else {
      return DateFormat('MMM d').format(date);
    }
  }

  Widget _buildStunningBackground(SchoolBrandState brand) {
    return Stack(
      children: [
        Positioned(
          top: -100,
          left: -50,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFFB9FBC0).withOpacity(0.15)),
          ),
        ),
        Positioned.fill(
          child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50), child: Container(color: Colors.transparent)),
        ),
      ],
    );
  }
}
