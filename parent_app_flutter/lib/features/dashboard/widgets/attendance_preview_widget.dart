import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class AttendancePreviewWidget extends StatelessWidget {
  final Map<String, dynamic>? stats;
  final VoidCallback onTap;

  const AttendancePreviewWidget({Key? key, this.stats, required this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    int percentage = stats?['attendancePercent'] ?? 0;
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: AppTheme.mintBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.mintBorder),
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
                          color: AppTheme.mintAcc,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.check_circle_outline, color: Colors.white, size: 16),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'Attendance — ${DateTime.now().month == 3 ? 'March' : _getMonthName(DateTime.now().month)}',
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.mintText,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.mintBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.mintBorder),
                    ),
                    child: Text(
                      '$percentage%',
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.mintAcc,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            // Body (Calendar heatmap placeholder)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(20),
                  bottomRight: Radius.circular(20),
                ),
              ),
              child: Column(
                children: [
                  // Placeholder for heatmap visual
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: List.generate(10, (index) => _buildDayDot(index, stats?['attendanceHistory'] ?? [])),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: List.generate(10, (index) => _buildDayDot(index + 10, stats?['attendanceHistory'] ?? [])),
                  ),
                  const SizedBox(height: 16),
                  
                  // Legend
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildLegendItem(AppTheme.sageAcc, 'Present'),
                      const SizedBox(width: 16),
                      _buildLegendItem(AppTheme.roseAcc, 'Absent'),
                      const SizedBox(width: 16),
                      _buildLegendItem(AppTheme.goldAcc, 'Holiday'),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getMonthName(int m) {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return names[m - 1];
  }

  Widget _buildDayDot(int index, List<dynamic> history) {
    Color dotColor = const Color(0xFFF1F5F9); // Unmarked / Future by default

    if (index < history.length) {
      final status = history[index].toString();
      if (status == 'PRESENT') {
        dotColor = AppTheme.sageAcc;
      } else if (status == 'ABSENT') {
        dotColor = AppTheme.roseAcc;
      } else if (status == 'HOLIDAY' || status == 'HALF_DAY') {
        dotColor = AppTheme.goldAcc;
      }
    }

    return Container(
      width: 14,
      height: 14,
      decoration: BoxDecoration(
        color: dotColor,
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            color: AppTheme.t3,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
