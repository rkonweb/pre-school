import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class TodayTimelineCard extends StatelessWidget {
  final List<TimelineEvent> events;
  final String primaryButtonText;
  final VoidCallback onPrimaryAction;

  const TodayTimelineCard({
    Key? key,
    required this.events,
    required this.primaryButtonText,
    required this.onPrimaryAction,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.35),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withOpacity(0.5), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                spreadRadius: -2,
              )
            ],
          ),
          child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.all(AppTheme.s16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Your Schedule',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                Text(
                  '${events.length} Items',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppTheme.border),

          // Timeline List
          if (events.isEmpty)
            Padding(
              padding: const EdgeInsets.all(AppTheme.s32),
              child: Center(
                child: Text('No events scheduled today.',
                    style: TextStyle(color: AppTheme.textMuted)),
              ),
            )
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: events.take(3).length, // Show max 3 on dashboard
              itemBuilder: (context, index) {
                final event = events[index];
                return _buildTimelineRow(context, event,
                    isLast: index == events.take(3).length - 1);
              },
            ),

          // Primary CTA Bottom
          Padding(
            padding: const EdgeInsets.all(AppTheme.s16),
            child: ElevatedButton(
              onPressed: onPrimaryAction,
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    AppTheme.textPrimary, // High contrast for primary action
                padding: const EdgeInsets.symmetric(vertical: AppTheme.s16),
              ),
              child: Text(primaryButtonText),
            ),
          ),
        ],
      ),
    ),
    ),
    );
  }

  Widget _buildTimelineRow(BuildContext context, TimelineEvent event,
      {required bool isLast}) {
    return IntrinsicHeight(
      child: Row(
        children: [
          // Timeline Graphics
          SizedBox(
            width: 60,
            child: Column(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  margin: const EdgeInsets.only(top: 24),
                  decoration: BoxDecoration(
                    color: event.isActive ? AppTheme.primary : AppTheme.border,
                    shape: BoxShape.circle,
                    border: event.isActive
                        ? Border.all(
                            color: AppTheme.primaryLight.withOpacity(0.3),
                            width: 4)
                        : null,
                  ),
                ),
                if (!isLast)
                  Expanded(
                    child: Container(
                      width: 2,
                      color: AppTheme.border,
                    ),
                  ),
              ],
            ),
          ),

          // Event Details
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(
                top: AppTheme.s16,
                bottom: isLast ? AppTheme.s16 : 0,
                right: AppTheme.s16,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    event.time,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: event.isActive
                          ? AppTheme.primary
                          : AppTheme.textMuted,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    event.title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 16),
                  ),
                  if (event.subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      event.subtitle!,
                      style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class TimelineEvent {
  final String time;
  final String title;
  final String? subtitle;
  final bool isActive;

  TimelineEvent({
    required this.time,
    required this.title,
    this.subtitle,
    this.isActive = false,
  });
}
