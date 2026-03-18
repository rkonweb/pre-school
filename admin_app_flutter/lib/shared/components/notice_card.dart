import 'package:flutter/material.dart';


class NoticeCard extends StatelessWidget {
  final String title;
  final String date;
  final String body;
  final IconData icon;
  final Color iconColor;
  final Color borderColor;

  const NoticeCard({
    super.key,
    required this.title,
    required this.date,
    required this.body,
    required this.icon,
    required this.iconColor,
    required this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
      child: CustomPaint(
        painter: _NoticeCardPainter(borderColor: borderColor),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF140E28).withValues(alpha: 0.04),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(icon, size: 14, color: iconColor),
                      const SizedBox(width: 8),
                      Text(
                        title,
                        style: const TextStyle(
                          fontFamily: 'Cabinet Grotesk',
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF140E28),
                          letterSpacing: -0.2,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    date,
                    style: const TextStyle(
                      fontFamily: 'Satoshi',
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFFB5B0C4),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                body,
                style: const TextStyle(
                  fontFamily: 'Satoshi',
                  fontSize: 12.5,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF64748B),
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NoticeCardPainter extends CustomPainter {
  final Color borderColor;

  _NoticeCardPainter({required this.borderColor});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.0
      ..strokeCap = StrokeCap.round;

    const double radius = 24.0;
    final path = Path();
    
    // We want to draw the segment on the left that includes the top-left and bottom-left turns
    // Start at some point on the top edge, say 1/3 in
    // No, actually looking at the screenshot, it's just the left edge including the curve.

    // Path starting from top, curving down the left side
    path.moveTo(radius + 10, 0); // Start slightly after top turn
    path.lineTo(radius, 0);
    path.arcToPoint(
      const Offset(0, radius),
      radius: const Radius.circular(radius),
      clockwise: false,
    );
    path.lineTo(0, size.height - radius);
    path.arcToPoint(
      Offset(radius, size.height),
      radius: const Radius.circular(radius),
      clockwise: false,
    );
    path.lineTo(radius + 10, size.height);

    // Filter the path to only show the "left turn" part?
    // Actually, the easiest way to match the screenshot is to draw the left side specifically.
    
    final Path highlightPath = Path();
    // Move to where the top curve starts on the top edge
    highlightPath.moveTo(radius, 0); 
    // Top-left corner
    highlightPath.arcToPoint(
      const Offset(0, radius),
      radius: const Radius.circular(radius),
      clockwise: false,
    );
    // Left edge
    highlightPath.lineTo(0, size.height - radius);
    // Bottom-left corner
    highlightPath.arcToPoint(
      Offset(radius, size.height),
      radius: const Radius.circular(radius),
      clockwise: false,
    );

    canvas.drawPath(highlightPath, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
