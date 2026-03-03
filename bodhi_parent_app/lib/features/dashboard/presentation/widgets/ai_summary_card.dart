import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/summary_provider.dart';

class AISummaryCard extends ConsumerWidget {
  final String studentId;
  final String schoolSlug;

  const AISummaryCard({
    super.key,
    required this.studentId,
    required this.schoolSlug,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryAsync = ref.watch(studentSummaryProvider(studentId, schoolSlug));

    return summaryAsync.when(
      data: (summary) {
        if (summary == null) return const SizedBox.shrink();
        
        return Container(
          margin: const EdgeInsets.only(bottom: 24),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: LinearGradient(
              colors: [
                Colors.indigo.shade400.withOpacity(0.1),
                Colors.purple.shade400.withOpacity(0.1),
              ],
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.3),
                    width: 1.5,
                  ),
                ),
                child: Semantics(
                  label: 'AI Summary for the child\'s day',
                  value: summary,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              color: Colors.indigo,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.auto_awesome,
                              color: Colors.white,
                              size: 14,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            'AURA SUMMARY',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.2,
                              color: Colors.indigo.shade800,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        summary,
                        style: TextStyle(
                          fontSize: 15,
                          height: 1.5,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey.shade900,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ).animate().fadeIn().slideY(begin: 0.1, end: 0);
      },
      loading: () => _buildLoadingShimmer(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  Widget _buildLoadingShimmer() {
    return Container(
      height: 100,
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(24),
      ),
    ).animate(onPlay: (controller) => controller.repeat())
     .shimmer(duration: 1200.ms, color: Colors.indigo.withOpacity(0.1));
  }
}
