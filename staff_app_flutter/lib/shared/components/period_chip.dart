import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

enum PeriodStatus { done, active, next, later }

class PeriodChip extends StatelessWidget {
  final String subject;
  final String className;
  final String time;
  final PeriodStatus status;

  const PeriodChip({
    super.key,
    required this.subject,
    required this.className,
    required this.time,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    Color subjectColor;
    Color bgColor = Colors.white;
    Color borderColor = const Color.fromRGBO(20, 14, 40, 0.07); // --line
    Widget tagWidget;
    double opacity = 1.0;

    switch (status) {
      case PeriodStatus.done:
        subjectColor = const Color(0xFF16A34A);
        opacity = 0.45;
        tagWidget = _buildTag('✓ Done', const Color(0xFF166534), const Color(0xFFF0FDF4));
        break;
      case PeriodStatus.active:
        subjectColor = AppTheme.teacherTheme.colors.first;
        bgColor = const Color(0xFFFFF1EE); // --t-soft
        borderColor = AppTheme.teacherTheme.colors.first;
        tagWidget = _buildTag('▶ Now', AppTheme.teacherTheme.colors.first, AppTheme.teacherTheme.colors.first.withOpacity(0.15));
        break;
      case PeriodStatus.next:
        subjectColor = const Color(0xFFD97706);
        tagWidget = _buildTag('⏳ Next', const Color(0xFF92400E), const Color(0xFFFFFBEB));
        break;
      case PeriodStatus.later:
        subjectColor = const Color(0xFFB5B0C4); // --ink4
        tagWidget = _buildTag('Later', const Color(0xFF7B7291), const Color(0xFFF3F4F6));
        break;
    }

    return Opacity(
      opacity: opacity,
      child: Container(
        width: 126,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: borderColor, width: 2),
          boxShadow: status == PeriodStatus.active ? [
            BoxShadow(
              color: AppTheme.teacherTheme.colors.first.withOpacity(0.3),
              blurRadius: 10,
              spreadRadius: 2,
            )
          ] : const [
            BoxShadow(
              color: Color.fromRGBO(20, 14, 40, 0.06),
              blurRadius: 8,
              offset: Offset(0, 2),
            )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              subject.toUpperCase(),
              style: TextStyle(
                fontFamily: 'Satoshi',
                fontSize: 9.5,
                fontWeight: FontWeight.w800,
                color: subjectColor,
                letterSpacing: 0.6,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              className,
              style: const TextStyle(
                fontFamily: 'Clash Display',
                fontSize: 19,
                fontWeight: FontWeight.w700,
                color: Color(0xFF140E28),
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              time,
              style: const TextStyle(
                fontFamily: 'Satoshi',
                fontSize: 10.5,
                fontWeight: FontWeight.w500,
                color: Color(0xFF7B7291),
              ),
            ),
            const SizedBox(height: 8),
            tagWidget,
          ],
        ),
      ),
    );
  }

  Widget _buildTag(String text, Color textColor, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(100),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            text,
            style: TextStyle(
              fontFamily: 'Satoshi',
              fontSize: 9.5,
              fontWeight: FontWeight.w800,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}
