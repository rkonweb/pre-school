import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class ScheduleWidget extends StatelessWidget {
  final Map<String, dynamic>? nextClass;
  final List<dynamic>? todaysSchedule;

  const ScheduleWidget({Key? key, this.nextClass, this.todaysSchedule}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      decoration: BoxDecoration(
        color: AppTheme.sageBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.sageBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: AppTheme.sageAcc,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.schedule, color: Colors.white, size: 16),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Today\'s Schedule',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.sageText,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.sageBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.sageBorder),
                  ),
                  child: Text(
                    DateFormat('MMM d · EEE').format(DateTime.now()),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.sageAcc,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Body List
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
            ),
            child: Column(
              children: _buildScheduleList(),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildScheduleList() {
    if (todaysSchedule == null || todaysSchedule!.isEmpty) {
      return [_buildEmptySchedule()];
    }

    List<Widget> children = [];
    for (int i = 0; i < todaysSchedule!.length; i++) {
      final cls = todaysSchedule![i];
      // Try comparing with nextClass safely
      bool isLive = nextClass != null && cls['startTime'] == nextClass!['startTime'] && cls['endTime'] == nextClass!['endTime'] && cls['subject'] == nextClass!['subject'];
      
      children.add(_buildScheduleItem(cls, isLive));
      if (i < todaysSchedule!.length - 1) {
        children.add(const Divider(height: 1, color: Color(0xFFF1F5F9)));
      }
    }
    return children;
  }

  Widget _buildScheduleItem(dynamic cls, bool isLive) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Container(
            width: 3,
            height: 32,
            decoration: BoxDecoration(
              color: isLive ? AppTheme.sageAcc : Colors.transparent,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 12),
          SizedBox(
            width: 80,
            child: Text(
              '${cls['startTime'] ?? '09:00'}–${cls['endTime'] ?? '09:45'}',
              style: TextStyle(
                fontSize: 11,
                fontWeight: isLive ? FontWeight.bold : FontWeight.normal,
                color: AppTheme.t3,
              ),
            ),
          ),
          Expanded(
            child: Text(
              cls['subject'] ?? 'Mathematics',
              style: TextStyle(
                fontSize: 13,
                fontWeight: isLive ? FontWeight.bold : FontWeight.w600,
                color: isLive ? AppTheme.sageText : AppTheme.t2,
              ),
            ),
          ),
          if (isLive)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF52A878).withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'Now',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF52A878), // Sage theme
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildEmptySchedule() {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 24),
      child: Center(
        child: Text(
          "No classes scheduled today",
          style: TextStyle(color: AppTheme.t3, fontSize: 13),
        ),
      ),
    );
  }
}
