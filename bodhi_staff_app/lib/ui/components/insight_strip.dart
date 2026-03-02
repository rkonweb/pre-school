import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class InsightStrip extends StatelessWidget {
  final List<String> insights;
  final VoidCallback? onTap;

  const InsightStrip({
    Key? key,
    required this.insights,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (insights.isEmpty) return const SizedBox.shrink();

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppTheme.s16),
        decoration: BoxDecoration(
          color: AppTheme.warning.withOpacity(0.08),
          borderRadius: AppTheme.radiusMedium,
          border: Border.all(color: AppTheme.warning.withOpacity(0.3)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.auto_awesome_rounded,
                color: AppTheme.warning, size: 24),
            const SizedBox(width: AppTheme.s16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'AI Insights for Today',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.warning,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: AppTheme.s8),
                  ...insights
                      .take(3)
                      .map((insight) => Padding(
                            padding: const EdgeInsets.only(bottom: AppTheme.s4),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('• ',
                                    style: TextStyle(
                                        color: AppTheme.textPrimary,
                                        fontWeight: FontWeight.bold)),
                                Expanded(
                                  child: Text(
                                    insight,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(color: AppTheme.textPrimary),
                                  ),
                                ),
                              ],
                            ),
                          ))
                      .toList(),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppTheme.warning),
          ],
        ),
      ),
    );
  }
}
