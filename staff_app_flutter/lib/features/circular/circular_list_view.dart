import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/state/auth_state.dart';
import '../../shared/components/notice_card.dart';
import 'circular_provider.dart';
import 'circular_model.dart';
import '../../shared/components/module_popup_shell.dart';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const _bg2 = Color(0xFFF5F3FF);
const _grad = LinearGradient(
  colors: [Color(0xFFFF5733), Color(0xFFFF006E), Color(0xFFC77DFF)],
  begin: Alignment.topLeft, end: Alignment.bottomRight,
);

class CircularListView extends ConsumerWidget {
  const CircularListView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final circularsAsync = ref.watch(circularListProvider);
    final user = ref.watch(userProfileProvider);
    final canPost = user?.role == 'PRINCIPAL' || user?.role == 'ADMIN';

    return ModulePopupShell(
      title: 'Circulars',
      icon: Icons.campaign_rounded,
      actionLabel: canPost ? '+ Post' : null,
      onAction: canPost ? () => context.push('/circular/create') : null,
      backgroundColor: _bg2,
      body: circularsAsync.when(
        data: (circulars) {
          if (circulars.isEmpty) {
            return _emptyState(context, ref, canPost);
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
        error: (err, stack) => _errorState(context, ref),
      ),
    );
  }

  Widget _emptyState(BuildContext context, WidgetRef ref, bool canPost) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          // Gradient icon
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(
              gradient: _grad,
              borderRadius: BorderRadius.circular(28),
              boxShadow: [BoxShadow(color: const Color(0xFFFF5733).withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8))],
            ),
            child: const Icon(Icons.campaign_rounded, color: Colors.white, size: 36),
          ),
          const SizedBox(height: 20),
          const Text('No Circulars Yet', style: TextStyle(
            fontFamily: 'Clash Display', fontSize: 20, fontWeight: FontWeight.w900,
            color: Color(0xFF140E28), letterSpacing: -0.3,
          )),
          const SizedBox(height: 8),
          const Text(
            'School notices and announcements will appear here once posted.',
            textAlign: TextAlign.center,
            style: TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF7B7291), height: 1.5),
          ),
          const SizedBox(height: 24),
          if (canPost)
            GestureDetector(
              onTap: () => context.push('/circular/create'),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  gradient: _grad,
                  borderRadius: BorderRadius.circular(100),
                  boxShadow: [BoxShadow(color: const Color(0xFFFF5733).withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4))],
                ),
                child: const Text('+ Post First Circular', style: TextStyle(
                  fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white,
                )),
              ),
            )
          else
            GestureDetector(
              onTap: () => ref.invalidate(circularListProvider),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF1EE),
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(color: const Color(0x33FF5733), width: 1.5),
                ),
                child: const Text('Refresh', style: TextStyle(
                  fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFFFF5733),
                )),
              ),
            ),
        ]),
      ),
    );
  }

  Widget _errorState(BuildContext context, WidgetRef ref) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.wifi_off_rounded, size: 48, color: Color(0xFF7B7291)),
          const SizedBox(height: 16),
          const Text('Could not load circulars', style: TextStyle(
            fontFamily: 'Satoshi', fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF7B7291),
          )),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () => ref.invalidate(circularListProvider),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1EE), borderRadius: BorderRadius.circular(100),
                border: Border.all(color: const Color(0x33FF5733), width: 1.5),
              ),
              child: const Text('Retry', style: TextStyle(
                fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFFFF5733),
              )),
            ),
          ),
        ]),
      ),
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

