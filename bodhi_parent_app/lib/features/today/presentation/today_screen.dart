import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/school_brand_provider.dart';
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
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Today', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
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
      child: Stack(
        children: [
          // ───── Graphical Background ─────
          Positioned.fill(child: _buildStunningBackground(brand)),

          // ───── Scrollable Content ─────
          timelineAsync.when(
            data: (data) => _buildTimelineList(data['events'] ?? []),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => Center(child: Text('Error loading today timeline: $err')),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineList(List<dynamic> events) {
    if (events.isEmpty) {
      return const CustomScrollView(
        physics: AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverFillRemaining(
            child: Center(child: Text("No events recorded today yet.", style: TextStyle(color: Colors.grey, fontSize: 16))),
          ),
        ],
      );
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.only(top: 24, left: 24, right: 24, bottom: 80),
      itemCount: events.length,
      itemBuilder: (context, index) {
        final event = events[index];
        final bool isLast = index == events.length - 1;
        final DateTime time = DateTime.parse(event['timestamp']);
        final String formattedTime = DateFormat('hh:mm a').format(time);

        return _buildTimelineRow(
          time: formattedTime,
          title: event['title'] ?? 'Event',
          subtitle: event['metadata']?['description'] ?? event['metadata']?['notes'] ?? event['type'],
          isActive: true, // Events returned happened today so we highlight them
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
    required bool isActive, 
    required bool isLast,
    required String type,
  }) {
    IconData iconData = Icons.event;
    Color iconColor = const Color(0xFF2563EB);
    
    if (type.contains('TRANSPORT')) {
      iconData = Icons.directions_bus;
      iconColor = const Color(0xFFF59E0B);
    } else if (type.contains('ATTENDANCE')) {
      iconData = Icons.how_to_reg;
      iconColor = const Color(0xFF10B981);
    } else if (type.contains('DIARY')) {
      iconData = Icons.auto_stories;
      iconColor = const Color(0xFF8B5CF6);
    }

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: 70,
            child: Column(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  margin: const EdgeInsets.only(top: 16),
                  decoration: BoxDecoration(
                    color: iconColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(iconData, color: iconColor, size: 18),
                ),
                if (!isLast)
                  Expanded(
                    child: Container(
                      width: 2,
                      margin: const EdgeInsets.symmetric(vertical: 8),
                      color: Colors.grey.shade300,
                    ),
                  ),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(
                top: 24,
                bottom: isLast ? 24 : 16,
                right: 0,
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white, width: 1.5),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          time,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: iconColor,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          title,
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16, color: Colors.black87),
                        ),
                        if (subtitle != null && subtitle.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            subtitle,
                            style: const TextStyle(color: Colors.black54, fontSize: 13),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStunningBackground(SchoolBrandState brand) {
    return Stack(
      children: [
        Positioned(
          top: -100,
          right: -50,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: brand.primaryColor.withOpacity(0.08),
            ),
          ),
        ),
        Positioned(
          top: 300,
          left: -100,
          child: Container(
            width: 350,
            height: 350,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFFCDB4DB).withOpacity(0.15),
            ),
          ),
        ),
        Positioned.fill(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
            child: Container(color: Colors.transparent),
          ),
        ),
      ],
    );
  }
}
