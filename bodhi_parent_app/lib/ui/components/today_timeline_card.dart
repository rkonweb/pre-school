import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
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
    return Container(
      decoration: AppTheme.glassDecoration(opacity: 0.05),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (events.isEmpty)
            Padding(
              padding: const EdgeInsets.all(32),
              child: Center(
                child: Text('Your child\'s highlights will appear here.',
                    style: GoogleFonts.dmSans(color: AppTheme.textTertiary, fontSize: 13)),
              ),
            )
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: events.take(3).length,
              itemExtent: 80,
              itemBuilder: (context, index) {
                final event = events[index];
                return _buildTimelineRow(context, event,
                    isFirst: index == 0,
                    isLast: index == events.take(3).length - 1)
                .animate()
                .fadeIn(delay: (index * 100).ms, duration: 400.ms)
                .slideX(begin: 0.1, end: 0, curve: Curves.easeOutQuad);
              },
            ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: ElevatedButton(
              onPressed: onPrimaryAction,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.textPrimary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                padding: const EdgeInsets.symmetric(vertical: 18),
              ),
              child: Text(
                primaryButtonText,
                style: GoogleFonts.sora(fontWeight: FontWeight.w700, letterSpacing: 0.5),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineRow(BuildContext context, TimelineEvent event,
      {required bool isFirst, required bool isLast}) {
    return Row(
      children: [
        SizedBox(
          width: 50,
          child: Column(
            children: [
              if (!isFirst)
                Expanded(
                  child: Container(
                    width: 2,
                    color: AppTheme.borderColor,
                  ),
                )
              else
                const Spacer(),
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: event.isActive ? AppTheme.primaryColor : AppTheme.textTertiary.withOpacity(0.3),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: AppTheme.borderColor,
                  ),
                )
              else
                const Spacer(),
            ],
          ),
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  event.time.toUpperCase(),
                  style: GoogleFonts.dmSans(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                    color: event.isActive ? AppTheme.primaryColor : AppTheme.textTertiary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  event.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.sora(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
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
