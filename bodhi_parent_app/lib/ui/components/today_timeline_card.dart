import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

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
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Upcoming Activities',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 18),
                    ),
                    Text(
                      '${events.length} Items',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: Colors.white24),
              if (events.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(32),
                  child: Center(
                    child: Text('No activities scheduled.',
                        style: TextStyle(color: Colors.grey)),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: events.take(3).length,
                  itemBuilder: (context, index) {
                    final event = events[index];
                    return _buildTimelineRow(context, event,
                        isLast: index == events.take(3).length - 1)
                    .animate()
                    .fadeIn(delay: (index * 100).ms, duration: 400.ms)
                    .slideX(begin: 0.1, end: 0, curve: Curves.easeOutQuad);
                  },
                ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: ElevatedButton(
                  onPressed: onPrimaryAction,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black87,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
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
          SizedBox(
            width: 60,
            child: Column(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  margin: const EdgeInsets.only(top: 24),
                  decoration: BoxDecoration(
                    color: event.isActive ? const Color(0xFF2563EB) : Colors.grey.shade300,
                    shape: BoxShape.circle,
                  ),
                ),
                if (!isLast)
                  Expanded(
                    child: Container(
                      width: 2,
                      color: Colors.grey.shade200,
                    ),
                  ),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(
                top: 16,
                bottom: isLast ? 16 : 0,
                right: 16,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    event.time,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: event.isActive ? const Color(0xFF2563EB) : Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    event.title,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                  ),
                  if (event.subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      event.subtitle!,
                      style: const TextStyle(color: Colors.grey, fontSize: 13),
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
