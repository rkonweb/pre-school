import 'package:flutter/material.dart';

class PendingAssignmentsCard extends StatelessWidget {
  const PendingAssignmentsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color.fromRGBO(20, 14, 40, 0.07), width: 1.5),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(20, 14, 40, 0.1),
            blurRadius: 28,
            offset: Offset(0, 8),
          ),
          BoxShadow(
            color: Color.fromRGBO(20, 14, 40, 0.05),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          _AssignmentRow(
            title: 'Chapter 7 Exercise — 8-A',
            subtitle: 'Due tomorrow · 28/42 submitted',
            icon: Icons.assignment_outlined,
            iconBg: const Color(0xFFFFFBEB),
            iconColor: const Color(0xFFD97706),
            tagText: '67%',
            tagBg: const Color(0xFFFFFBEB),
            tagColor: const Color(0xFF92400E),
          ),
          _Divider(),
          _AssignmentRow(
            title: 'Geometry Practice — 9-C',
            subtitle: 'Due Friday · 38/44 submitted',
            icon: Icons.pie_chart_outline,
            iconBg: const Color(0xFFF0FDF4),
            iconColor: const Color(0xFF16A34A),
            tagText: '86%',
            tagBg: const Color(0xFFF0FDF4),
            tagColor: const Color(0xFF166534),
          ),
          _Divider(),
          _AssignmentRow(
            title: 'Statistics Project — 10-A',
            subtitle: 'Due Monday · 12/38 submitted',
            icon: Icons.data_usage,
            iconBg: const Color(0xFFF5F3FF),
            iconColor: const Color(0xFF7C3AED),
            tagText: '32%',
            tagBg: const Color(0xFFFEF2F2), // .tr
            tagColor: const Color(0xFF991B1B), // .tr
          ),
        ],
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 1.5,
      color: const Color.fromRGBO(20, 14, 40, 0.04),
    );
  }
}

class _AssignmentRow extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color iconBg;
  final Color iconColor;
  final String tagText;
  final Color tagBg;
  final Color tagColor;

  const _AssignmentRow({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.iconBg,
    required this.iconColor,
    required this.tagText,
    required this.tagBg,
    required this.tagColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: iconBg,
              borderRadius: BorderRadius.circular(15),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF140E28),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF7B7291),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(
              color: tagBg,
              borderRadius: BorderRadius.circular(100),
            ),
            child: Text(
              tagText,
              style: TextStyle(
                fontFamily: 'Satoshi',
                fontSize: 10.5,
                fontWeight: FontWeight.w800,
                color: tagColor,
                letterSpacing: 0.2,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
