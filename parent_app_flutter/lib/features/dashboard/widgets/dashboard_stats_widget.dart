import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class DashboardStatsWidget extends StatelessWidget {
  final Map<String, dynamic>? stats;

  const DashboardStatsWidget({Key? key, this.stats}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Extract real data
    final attendance = stats?['attendancePercent'] ?? 0;
    final avgScore = stats?['averageScore'] ?? 0;
    final hwDue = stats?['pendingHomework'] ?? 0;
    final periods = stats?['todayPeriods'] ?? 0;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0x146366F1), width: 1.5),
          boxShadow: const [
            BoxShadow(color: Color(0x1A6366F1), blurRadius: 20, offset: Offset(0, 4))
          ],
        ),
        child: Row(
          children: [
            _buildStatItem('$attendance%', 'Attend.', const Color(0xFF6366F1)),
            _buildDivider(),
            _buildStatItem('$avgScore%', 'Avg Score', const Color(0xFF10B981)),
            _buildDivider(),
            _buildStatItem('$hwDue', 'HW Due', const Color(0xFFF97316)),
            _buildDivider(),
            _buildStatItem('$periods', 'Periods', const Color(0xFF8B5CF6)),
          ],
        ),
      ),
    );
  }

  Widget _buildDivider() {
    return Container(
      height: 30, // Approximate height for the divider
      width: 1,
      color: const Color(0x1A6366F1),
    );
  }

  Widget _buildStatItem(String val, String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: Column(
          children: [
            Text(
              val,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: color,
                height: 1,
                letterSpacing: -0.3,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label.toUpperCase(),
              style: const TextStyle(
                fontSize: 7.5,
                fontWeight: FontWeight.w700,
                color: Color(0xFF94A3B8),
                letterSpacing: 0.6,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
