import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class HomeworkPreviewWidget extends StatelessWidget {
  final Map<String, dynamic>? stats;
  final VoidCallback onTap;

  const HomeworkPreviewWidget({Key? key, this.stats, required this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    int pending = stats?['pendingHomework'] ?? 0;
    int submitted = stats?['submittedHomework'] ?? 0;
    int total = stats?['totalHomework'] ?? 0;
    
    double progress = total > 0 ? (submitted / total) : 0;
    int progressPercent = (progress * 100).round();
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE2E8F0)), // slate-200
        ),
        child: Column(
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
                          color: AppTheme.skyAcc,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.assignment_outlined, color: Colors.white, size: 16),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'Homework',
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.t1,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Text(
                        '$pending Pending',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.t3,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'See All →',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.a1,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            // Progress Stats
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Expanded(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildStat('Pending', pending.toString(), AppTheme.peachAcc),
                        _buildDivider(),
                        _buildStat('Submitted', submitted.toString(), AppTheme.sageAcc),
                        _buildDivider(),
                        _buildStat('Total', total.toString(), AppTheme.skyAcc),
                      ],
                    ),
                  ),
                  
                  // Donut Chart Mock
                  Container(
                    width: 48,
                    height: 48,
                    margin: const EdgeInsets.only(left: 16),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        CircularProgressIndicator(
                          value: progress, 
                          backgroundColor: const Color(0xFFF1F5F9), // slate-100
                          color: AppTheme.skyAcc,
                          strokeWidth: 4,
                        ),
                        Text(
                          '$progressPercent%',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.skyText,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            // Filters
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: Row(
                children: [
                  _buildFilterChip('Due Soon', true),
                  const SizedBox(width: 8),
                  _buildFilterChip('All', false),
                  const SizedBox(width: 8),
                  _buildFilterChip('Submitted', false),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStat(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: GoogleFonts.outfit(
            fontSize: 22,
            fontWeight: FontWeight.w900,
            color: color,
            height: 1.1,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: AppTheme.t4,
            letterSpacing: 0.5,
          ),
        ),
      ],
    );
  }

  Widget _buildDivider() {
    return Container(
      width: 1,
      height: 24,
      color: const Color(0xFFE2E8F0),
    );
  }

  Widget _buildFilterChip(String label, bool isActive) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFF1E293B) : Colors.white, // slate-800 or white
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isActive ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: isActive ? Colors.white : AppTheme.t3,
        ),
      ),
    );
  }
}
