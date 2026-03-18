import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class GradesWidget extends StatelessWidget {
  final Map<String, dynamic>? stats;

  const GradesWidget({Key? key, this.stats}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      decoration: BoxDecoration(
        color: AppTheme.lavenderBg, // lavender background
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.lavenderBorder),
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
                        color: AppTheme.peachAcc,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.analytics_outlined, color: Colors.white, size: 16),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Grade Tracker',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.peachText,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.peachBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.peachBorder),
                  ),
                  child: const Text(
                    'Term 2',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.peachAcc,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Body List
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
            ),
            child: Column(
              children: [
                _buildGradeRow('Mathematics', 96, AppTheme.sageAcc, AppTheme.sageText, const Color(0xFF86CEAA)),
                const SizedBox(height: 12),
                _buildGradeRow('Science', 89, AppTheme.skyAcc, AppTheme.skyText, const Color(0xFF7EC8E8)),
                const SizedBox(height: 12),
                _buildGradeRow('English', 84, AppTheme.peachAcc, AppTheme.peachText, const Color(0xFFF0A870)),
                const SizedBox(height: 12),
                _buildGradeRow('History', 81, AppTheme.lavenderAcc, AppTheme.lavenderText, const Color(0xFFC8A8E8)), // Swapped to lavender as in UI HTML fix
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGradeRow(String subject, int percentage, Color dotColor, Color textColor, Color gradColor) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: dotColor,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            subject,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppTheme.t2,
            ),
          ),
        ),
        Text(
          '$percentage%',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: textColor,
          ),
        ),
        const SizedBox(width: 12),
        SizedBox(
          width: 80,
          height: 6,
          child: Stack(
            children: [
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9), // slate-100
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              FractionallySizedBox(
                widthFactor: percentage / 100,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [dotColor, gradColor],
                    ),
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
