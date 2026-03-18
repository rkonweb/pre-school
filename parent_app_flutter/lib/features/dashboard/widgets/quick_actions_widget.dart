import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class QuickActionsWidget extends StatelessWidget {
  final VoidCallback onHomeworkTap;
  final VoidCallback onAttendanceTap;
  final VoidCallback onFeesTap;
  final VoidCallback onMessagesTap;

  const QuickActionsWidget({
    Key? key,
    required this.onHomeworkTap,
    required this.onAttendanceTap,
    required this.onFeesTap,
    required this.onMessagesTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Quick Actions',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppTheme.t1,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildActionCard(
                'Home-\nwork',
                Icons.assignment_outlined,
                const Color(0xFFFFF7ED), // peach-bg
                const Color(0xFFF97316), // peach-acc
                onHomeworkTap,
              ),
              _buildActionCard(
                'Attend-\nance',
                Icons.people_outline,
                const Color(0xFFECFDF5), // emerald-50
                const Color(0xFF10B981), // emerald-500
                onAttendanceTap,
              ),
              _buildActionCard(
                'Pay\nFees',
                Icons.credit_card_outlined,
                const Color(0xFFFFFBEB), // gold-bg
                const Color(0xFFEAB308), // gold-acc
                onFeesTap,
              ),
              _buildActionCard(
                'Mess-\nages',
                Icons.chat_bubble_outline,
                const Color(0xFFEFF6FF), // blue-50
                const Color(0xFF3B82F6), // blue-500
                onMessagesTap,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard(
    String label, 
    IconData icon, 
    Color bgColor, 
    Color iconColor, 
    VoidCallback onTap
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 72,
        height: 100,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0A000000), // Very light shadow
              blurRadius: 10,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: iconColor.withOpacity(0.2)),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(height: 10),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: AppTheme.t2,
                height: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
