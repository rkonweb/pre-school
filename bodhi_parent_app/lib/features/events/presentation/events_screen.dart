import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../data/events_provider.dart';

class EventsScreen extends ConsumerStatefulWidget {
  const EventsScreen({super.key});

  @override
  ConsumerState<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends ConsumerState<EventsScreen> {
  int _month = DateTime.now().month;
  int _year = DateTime.now().year;

  static const _typeColors = {
    'HOLIDAY': Color(0xFF4CAF50),
    'EXAM': Color(0xFFF44336),
    'SPORTS': Color(0xFFFF9800),
    'PTM': Color(0xFF2196F3),
    'CULTURAL': Color(0xFF9C27B0),
    'OTHER': Color(0xFF607D8B),
  };

  static const _typeEmoji = {
    'HOLIDAY': '🎉',
    'EXAM': '📝',
    'SPORTS': '🏆',
    'PTM': '👨‍👩‍👧',
    'CULTURAL': '🎭',
    'OTHER': '📅',
  };

  void _prevMonth() {
    setState(() {
      if (_month == 1) { _month = 12; _year--; }
      else _month--;
    });
  }

  void _nextMonth() {
    setState(() {
      if (_month == 12) { _month = 1; _year++; }
      else _month++;
    });
  }

  @override
  Widget build(BuildContext context) {
    final brand = ref.watch(schoolBrandProvider);
    final filter = EventFilter(_month, _year);
    final eventsAsync = ref.watch(eventsDataProvider(filter));

    final monthName = DateTime(_year, _month).toLocal().toString().split(' ').first;
    final displayMonth = [
      '', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ][_month];

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppHeader(
        title: 'Calendar',
        subtitle: '$displayMonth $_year',
        actions: [
          ElevatedButton(
            onPressed: () {},
            style: AppTheme.headerButtonStyle(),
            child: const Icon(Icons.filter_list_rounded, size: 20),
          ),
        ],
      ),
      body: eventsAsync.when(
        data: (data) => RefreshIndicator(
          onRefresh: () => ref.refresh(eventsDataProvider(filter).future),
          child: ListView(
            padding: const EdgeInsets.only(top: 10),
            children: [
              // Upcoming Banner
              if (data.upcoming.isNotEmpty)
                Container(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: [brand.primaryColor, brand.primaryColor.withOpacity(0.8)]),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [BoxShadow(color: brand.primaryColor.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Next Up', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(
                          data.upcoming.first.title,
                          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          _formatDate(data.upcoming.first.date),
                          style: const TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ),

              // Month Navigation
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      onPressed: _prevMonth,
                      icon: const Icon(Icons.chevron_left),
                      style: IconButton.styleFrom(backgroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    ),
                    Text(
                      '$displayMonth $_year',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    IconButton(
                      onPressed: _nextMonth,
                      icon: const Icon(Icons.chevron_right),
                      style: IconButton.styleFrom(backgroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    ),
                  ],
                ),
              ),

              // Events List
              if (data.events.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(48),
                  child: Column(
                    children: [
                      Icon(Icons.event_available, size: 64, color: Color(0xFFDDDDDD)),
                      SizedBox(height: 16),
                      Text('No events this month', style: TextStyle(color: Colors.grey, fontSize: 16)),
                    ],
                  ),
                )
              else
                ...data.events.map((event) => _buildEventCard(event, brand)),

              const SizedBox(height: 32),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text(err.toString()),
              ElevatedButton(
                onPressed: () => ref.refresh(eventsDataProvider(filter)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEventCard(SchoolEvent event, SchoolBrandState brand) {
    final color = _typeColors[event.type] ?? Colors.grey;
    final emoji = _typeEmoji[event.type] ?? '📅';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          // Color strip + date
          Container(
            width: 4,
            height: 80,
            decoration: BoxDecoration(
              color: color,
              borderRadius: const BorderRadius.only(topLeft: Radius.circular(20), bottomLeft: Radius.circular(20)),
            ),
          ),
          const SizedBox(width: 12),
          // Date box
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    DateTime.parse(event.date).day.toString(),
                    style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    _shortMonth(DateTime.parse(event.date).month),
                    style: TextStyle(color: color.withOpacity(0.7), fontSize: 10),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 14),
          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(emoji, style: const TextStyle(fontSize: 12)),
                    const SizedBox(width: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                      child: Text(event.type, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(event.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                if (event.venue != null)
                  Text('📍 ${event.venue}', style: const TextStyle(color: Colors.grey, fontSize: 11)),
              ],
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
    );
  }

  String _shortMonth(int m) => ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m];
  String _formatDate(String iso) {
    try {
      final dt = DateTime.parse(iso);
      return '${_shortMonth(dt.month)} ${dt.day}, ${dt.year}';
    } catch (_) {
      return iso;
    }
  }
}
