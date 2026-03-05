import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/summary_provider.dart';
import 'package:bodhi_parent_app/core/theme/app_theme.dart';

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
        
        return ClipRRect(
          borderRadius: BorderRadius.circular(24),
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: AppTheme.glassDecoration(
                opacity: 0.1,
                color: Colors.white,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppTheme.accentColor.withOpacity(0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.auto_awesome_rounded,
                          color: AppTheme.accentColor,
                          size: 16,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'DAILY INSIGHTS',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.5,
                          color: Color(0xFF1E293B),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    summary,
                    style: const TextStyle(
                      fontSize: 16,
                      height: 1.6,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF334155),
                      letterSpacing: -0.2,
                   ),
                  ),
                ],
              ),
            ),
          ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.1, end: 0);
        },
      loading: () => _buildLoadingShimmer(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  Widget _buildLoadingShimmer() {
    return Container(
      height: 120,
      margin: const EdgeInsets.only(bottom: 24),
      decoration: AppTheme.glassDecoration(opacity: 0.05),
    ).animate(onPlay: (controller) => controller.repeat())
     .shimmer(duration: 1500.ms, color: AppTheme.accentColor.withOpacity(0.05));
  }
}
