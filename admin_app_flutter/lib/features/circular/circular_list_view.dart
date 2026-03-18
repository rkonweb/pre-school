import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/state/auth_state.dart';
import '../../shared/components/notice_card.dart';
import 'circular_provider.dart';
import '../../shared/components/top_nav_bell.dart';

class CircularListView extends ConsumerWidget {
  const CircularListView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final circularsAsync = ref.watch(circularListProvider);
    final user = ref.watch(userProfileProvider);
    final canPost = user?.role == 'PRINCIPAL' || user?.role == 'ADMIN';
    
    return Scaffold(
      backgroundColor: const Color(0xFFF5F3FF),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'School Circulars',
          style: TextStyle(
            fontFamily: 'Cabinet Grotesk',
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: Color(0xFF140E28),
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Color(0xFF140E28)),
          onPressed: () => Navigator.pop(context),
        ),
        actions: const [
          TopNavBell(badgeText: '3'),
          SizedBox(width: 8),
        ],
      ),
      body: circularsAsync.when(
        data: (circulars) {
          if (circulars.isEmpty) {
            return const Center(child: Text('No circulars found'));
          }
          return ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 16),
            itemCount: circulars.length,
            itemBuilder: (context, index) {
              final c = circulars[index];
              return GestureDetector(
                onTap: () => context.push('/circular/detail', extra: c),
                child: NoticeCard(
                  title: c.title,
                  date: c.publishedAt != null ? _formatDate(c.publishedAt!) : 'Recently',
                  body: c.subject ?? c.content ?? '',
                  icon: c.priority == 'URGENT' ? Icons.priority_high_rounded : Icons.notifications_none_rounded,
                  iconColor: c.priority == 'URGENT' ? const Color(0xFFEF4444) : const Color(0xFF7C3AED),
                  borderColor: c.priority == 'URGENT' ? const Color(0xFFEF4444) : const Color(0xFFFF5733),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
      floatingActionButton: canPost ? FloatingActionButton(
        onPressed: () => context.push('/circular/create'),
        backgroundColor: const Color(0xFF7C3AED),
        child: const Icon(Icons.add_rounded, color: Colors.white),
      ) : null,
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inDays == 0) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    return '${date.day}/${date.month}/${date.year}';
  }
}
