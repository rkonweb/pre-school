import 'package:flutter/material.dart';

class NotchPainter extends CustomPainter {
  final Color color;
  final double blur;

  NotchPainter({required this.color, required this.blur});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path();
    const double notchWidth = 80;
    const double notchHeight = 35;
    final double centerX = size.width / 2;

    path.moveTo(0, 0);
    path.lineTo(centerX - notchWidth / 2 - 20, 0);
    
    // Smooth curve into notch
    path.quadraticBezierTo(
      centerX - notchWidth / 2, 0,
      centerX - notchWidth / 2, 10,
    );
    
    // The Notch itself
    path.arcToPoint(
      Offset(centerX + notchWidth / 2, 10),
      radius: const Radius.circular(notchWidth / 2),
      clockwise: false,
    );
    
    // Smooth curve out of notch
    path.quadraticBezierTo(
      centerX + notchWidth / 2, 0,
      centerX + notchWidth / 2 + 20, 0,
    );
    
    path.lineTo(size.width, 0);
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    canvas.drawPath(path, paint);
    
    // Top Border (Linear style)
    final borderPaint = Paint()
      ..color = Colors.white.withOpacity(0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
      
    final borderPath = Path();
    borderPath.moveTo(0, 0);
    borderPath.lineTo(centerX - notchWidth / 2 - 20, 0);
    borderPath.quadraticBezierTo(centerX - notchWidth / 2, 0, centerX - notchWidth / 2, 10);
    borderPath.arcToPoint(Offset(centerX + notchWidth / 2, 10), radius: const Radius.circular(notchWidth / 2), clockwise: false);
    borderPath.quadraticBezierTo(centerX + notchWidth / 2, 0, centerX + notchWidth / 2 + 20, 0);
    borderPath.lineTo(size.width, 0);
    
    canvas.drawPath(borderPath, borderPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
