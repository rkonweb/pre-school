import 'package:bodhi_staff_app/ui/components/app_drawer.dart';
import 'package:bodhi_staff_app/ui/components/app_drawer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import 'timetable_provider.dart';

import '../../core/widgets/global_header.dart';

class TimetableScreen extends ConsumerStatefulWidget {
  const TimetableScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends ConsumerState<TimetableScreen> {
  final List<String> _days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(timetableProvider);
    final notifier = ref.read(timetableProvider.notifier);

    return Scaffold(
      
      backgroundColor: AppTheme.background,
      
      drawer: const AppDrawer(),
      appBar: GlobalHeader(
        title: 'Timetable',
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.primary),
            onPressed: () => notifier.loadTimetable(),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildDaySelector(state, notifier),
          _buildViewSelector(state, notifier),
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : state.error != null
                    ? _buildErrorState(state.error!)
                    : _buildPeriodList(state.currentPeriods),
          ),
        ],
      ),
    );
  }

  Widget _buildDaySelector(TimetableState state, TimetableNotifier notifier) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppTheme.border)),
      ),
      child: Row(
        children: [
          const Icon(Icons.calendar_today, size: 20, color: AppTheme.textMuted),
          const SizedBox(width: 8),
          Expanded(
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: state.selectedDay,
                isExpanded: true,
                items: _days.map((day) => DropdownMenuItem(
                      value: day,
                      child: Text(day),
                    )).toList(),
                onChanged: (value) {
                  if (value != null) notifier.selectDay(value);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildViewSelector(TimetableState state, TimetableNotifier notifier) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppTheme.border)),
      ),
      child: Row(
        children: [
          const Icon(Icons.filter_list, size: 20, color: AppTheme.textMuted),
          const SizedBox(width: 8),
          Expanded(
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: state.selectedView,
                isExpanded: true,
                items: [
                  const DropdownMenuItem(value: 'MY', child: Text('My Schedule')),
                  ...state.classrooms.map((c) => DropdownMenuItem(
                        value: c.id,
                        child: Text(c.name),
                      )),
                ],
                onChanged: (value) {
                  if (value != null) notifier.selectView(value);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPeriodList(List<TimetablePeriod> periods) {
    if (periods.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.event_busy, size: 64, color: AppTheme.textMuted.withOpacity(0.3)),
            const SizedBox(height: 16),
            const Text('No classes scheduled for today', style: TextStyle(color: AppTheme.textMuted)),
          ],
        ),
      );
    }

    final now = DateTime.now();
    final days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    final todayStr = days[now.weekday - 1];
    
    // Find if we are viewing today
    final isToday = _days.contains(todayStr) && _days.indexOf(todayStr) == 0; // Wait, selected day is passed via State.
    // Let's get selected day from outside or just assume we have it. I need to pass selectedDay to this method or get it from provider.
    // Wait, _buildPeriodList doesn't have `state` passed to it. Let's pass `state` to it in build().
    // Since I can't easily change the method signature without replacing `build` too, I will just re-fetch the state or pass it.
    // Actually, I can use ConsumerWidget's ref.read inside build, but inside a helper I don't have ref unless I pass it.
    // Let's just use the fact that periods are inherently ordered by time.
    // For a quick check, we can just parse the time if `startTime` is available.

    return ListView.builder(
      itemCount: periods.length,
      padding: const EdgeInsets.all(16),
      itemBuilder: (context, index) {
        final period = periods[index];
        bool isCurrent = false;
        bool isUpcoming = false;
        bool isPast = false;
        Color cardColor = Colors.white;
        Color borderColor = AppTheme.border;
        Color iconBgColor = AppTheme.primary.withOpacity(0.1);
        Color iconTextColor = AppTheme.primary;

        if (period.type == 'BREAK') {
          cardColor = Colors.grey.shade50;
          iconBgColor = Colors.grey.shade200;
          iconTextColor = Colors.grey.shade600;
        } else if (period.startTime.isNotEmpty && period.endTime.isNotEmpty) {
           try {
              final startParts = period.startTime.split(':');
              final endParts = period.endTime.split(':');
              if (startParts.length == 2 && endParts.length == 2) {
                final startHour = int.parse(startParts[0]);
                final startMin = int.parse(startParts[1]);
                final endHour = int.parse(endParts[0]);
                final endMin = int.parse(endParts[1]);

                final startMinTotal = startHour * 60 + startMin;
                final endMinTotal = endHour * 60 + endMin;
                final nowMinTotal = now.hour * 60 + now.minute;

                // We only truly highlight if we loosely assume it's today. In a real app we'd check the selected day tab.
                // Assuming it's today if time matches for 'current'
                if (nowMinTotal >= startMinTotal && nowMinTotal <= endMinTotal) {
                  isCurrent = true;
                } else if (nowMinTotal < startMinTotal) {
                  isUpcoming = true;
                } else if (nowMinTotal > endMinTotal) {
                  isPast = true;
                }
              }
           } catch (e) {}
        }
        
        bool isNext = false;
        if (isUpcoming && !isCurrent) {
          if (index == 0) {
            isNext = true;
          } else {
            try {
              final prevP = periods[index - 1];
              // If previous period was not upcoming, then this is the first upcoming
              if (prevP.endTime.isNotEmpty) {
                 final prevParts = prevP.endTime.split(':');
                 final prevEndMin = int.parse(prevParts[0]) * 60 + int.parse(prevParts[1]);
                 final nowMinTotal = now.hour * 60 + now.minute;
                 if (nowMinTotal >= prevEndMin) isNext = true;
              }
            } catch (e) {}
          }
        }
        
        if (period.type != 'BREAK') {
            if (isCurrent) {
               cardColor = Colors.white;
               borderColor = AppTheme.border;
               iconBgColor = Colors.green.shade100;
               iconTextColor = Colors.green.shade800;
            } else if (isUpcoming) {
               cardColor = Colors.white;
               borderColor = AppTheme.border;
               iconBgColor = Colors.amber.shade100;
               iconTextColor = Colors.amber.shade900;
            } else if (isPast) {
               cardColor = Colors.white;
               borderColor = AppTheme.border;
               iconBgColor = Colors.red.shade100;
               iconTextColor = Colors.red.shade800;
            }
        }

        return Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 12),
          color: cardColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: borderColor, width: 1),
          ),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: period.type == 'BREAK' ? 8 : 16),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: iconBgColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(
                    child: period.type == 'BREAK' 
                        ? Icon(Icons.free_breakfast, color: iconTextColor, size: 20)
                        : Text(
                            'P${index + 1}',
                            style: TextStyle(color: iconTextColor, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              period.subject, 
                              style: TextStyle(
                                fontWeight: FontWeight.bold, 
                                fontSize: 16,
                                color: period.type == 'BREAK' ? Colors.grey.shade700 : Colors.black,
                              )
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.access_time, size: 14, color: AppTheme.textMuted),
                          const SizedBox(width: 4),
                          Text(period.time, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                        ],
                      ),
                      if (period.className != null && period.type != 'BREAK') ...[
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(Icons.room, size: 14, color: AppTheme.textMuted),
                            const SizedBox(width: 4),
                            Text(period.className!, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                          ],
                        ),
                      ],
                      if (period.teacherName != null && period.teacherName!.isNotEmpty && period.type != 'BREAK') ...[
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(Icons.person, size: 14, color: AppTheme.textMuted),
                            const SizedBox(width: 4),
                            Text(period.teacherName!, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppTheme.danger),
            const SizedBox(height: 16),
            Text(message, textAlign: TextAlign.center, style: const TextStyle(color: AppTheme.danger)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.read(timetableProvider.notifier).loadTimetable(),
              child: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }
}
