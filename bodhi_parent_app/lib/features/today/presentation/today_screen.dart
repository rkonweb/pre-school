import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../data/today_provider.dart';
import '../../dashboard/data/dashboard_provider.dart';

class TodayScreen extends ConsumerStatefulWidget {
  const TodayScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<TodayScreen> createState() => _TodayScreenState();
}

class _TodayScreenState extends ConsumerState<TodayScreen> {
  
  @override
  Widget build(BuildContext context) {
    final brand = ref.watch(schoolBrandProvider);
    final dashboardAsync = ref.watch(dashboardDataProvider);
    
    // We need the active student ID from the dashboard to fetch their timeline
    final activeStudentId = dashboardAsync.value?['activeStudentId'];

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: const AppHeader(
        title: 'Today\'s Pulse',
        subtitle: 'Real-time student timeline',
      ),
      body: activeStudentId == null 
        ? const Center(child: CircularProgressIndicator())
        : _buildTimelineBody(context, activeStudentId, brand),
    );
  }

  Widget _buildTimelineBody(BuildContext context, String studentId, SchoolBrandState brand) {
    final timelineAsync = ref.watch(todayTimelineDataProvider(studentId));

    return RefreshIndicator(
      onRefresh: () => ref.read(todayTimelineDataProvider(studentId).notifier).refresh(),
      child: timelineAsync.when(
        data: (data) => _buildTimelineList(data['events'] ?? []),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildTimelineList(List<dynamic> events) {
    if (events.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.auto_awesome_rounded, size: 64, color: AppTheme.textTertiary),
            SizedBox(height: 16),
            Text("No updates yet for today", style: TextStyle(color: AppTheme.textSecondary)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
      itemCount: events.length,
      itemBuilder: (context, index) {
        final event = events[index];
        final bool isLast = index == events.length - 1;
        final DateTime time = DateTime.parse(event['timestamp']);
        final String formattedTime = DateFormat('hh:mm a').format(time);

        return _buildTimelineRow(
          time: formattedTime,
          title: event['title'] ?? 'New Activity',
          subtitle: event['metadata']?['description'] ?? event['metadata']?['notes'] ?? event['type'],
          isLast: isLast,
          type: event['type'],
        );
      },
    );
  }

  Widget _buildTimelineRow({
    required String time, 
    required String title, 
    String? subtitle, 
    required bool isLast,
    required String type,
  }) {
    IconData iconData = Icons.stars_rounded;
    Color iconColor = AppTheme.primaryColor;
    
    if (type.contains('TRANSPORT')) {
      iconData = Icons.directions_bus_rounded;
      iconColor = AppTheme.warningColor;
    } else if (type.contains('ATTENDANCE')) {
      iconData = Icons.how_to_reg_rounded;
      iconColor = AppTheme.secondaryColor;
    } else if (type.contains('DIARY')) {
      iconData = Icons.auto_stories_rounded;
      iconColor = AppTheme.accentColor;
    }

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Timeline indicator column
          Column(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.12),
                  shape: BoxShape.circle,
                  border: Border.all(color: iconColor.withOpacity(0.2), width: 1.5),
                ),
                child: Icon(iconData, color: iconColor, size: 22),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [iconColor.withOpacity(0.4), Colors.transparent],
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),
          // Content Card
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 24),
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: AppTheme.glassDecoration(
                  color: Colors.white,
                  opacity: 0.1,
                  borderRadius: BorderRadius.circular(22),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          time,
                          style: GoogleFonts.sora(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: iconColor,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: iconColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(100),
                          ),
                          child: Text(
                            type.split('_').last,
                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: iconColor),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      title,
                      style: GoogleFonts.sora(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    if (subtitle != null && subtitle.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(
                        subtitle,
                        style: GoogleFonts.dmSans(
                          color: AppTheme.textSecondary,
                          fontSize: 14,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildStunningBackground(SchoolBrandState brand) {
    return Stack(
      children: [
        // Top Purple Glow
        Positioned(
          top: -100,
          left: -50,
          child: Container(
            width: 400,
            height: 400,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.accentColor.withOpacity(0.12),
            ),
          ).animate(onPlay: (controller) => controller.repeat(reverse: true))
           .scale(begin: const Offset(1, 1), end: const Offset(1.3, 1.3), duration: 10.seconds, curve: Curves.easeInOut),
        ),
        // Mid Blue Glow
        Positioned(
          top: 300,
          right: -150,
          child: Container(
            width: 500,
            height: 500,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.primaryColor.withOpacity(0.08),
            ),
          ).animate(onPlay: (controller) => controller.repeat(reverse: true))
           .moveX(begin: 0, end: -60, duration: 12.seconds, curve: Curves.easeInOut),
        ),
        /*
        Positioned.fill(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 90, sigmaY: 90),
            child: Container(color: Colors.transparent),
          ),
        ),
        */
        Positioned.fill(child: Container(color: Colors.white.withOpacity(0.5))),
      ],
    );
  }
}
