import 'dart:math' as math;
import 'package:flutter/material.dart';

class FloatingShapesBackground extends StatefulWidget {
  final Widget child;

  const FloatingShapesBackground({super.key, required this.child});

  @override
  State<FloatingShapesBackground> createState() => _FloatingShapesBackgroundState();
}

class _FloatingShapesBackgroundState extends State<FloatingShapesBackground> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    // 20 second loop for a very slow, subtle background morph
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, _) => CustomPaint(
              painter: _BlobPainter(animationValue: _controller.value),
            ),
          ),
        ),
        // A solid layer to create consistent clean background
        Positioned.fill(
          child: Container(
            color: const Color(0xFFF8FAFC).withOpacity(0.92),
          ),
        ),
        Positioned.fill(
          child: widget.child,
        ),
      ],
    );
  }
}

class _BlobPainter extends CustomPainter {
  final double animationValue;

  _BlobPainter({required this.animationValue});

  @override
  void paint(Canvas canvas, Size size) {
    final double w = size.width;
    final double h = size.height;

    // We use Sin/Cos with the animation value to slowly orbit the blobs around points
    
    // Blob 1 (Top Right) -> Example: Teacher Tangerine Glow
    final Paint paint1 = Paint()
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 100)
      ..color = const Color(0xFFFF8E53).withOpacity(0.15); // Tangerine
    
    final double cx1 = w * 0.8 + (math.sin(animationValue * 2 * math.pi) * 50);
    final double cy1 = h * 0.2 + (math.cos(animationValue * 2 * math.pi) * 50);
    canvas.drawCircle(Offset(cx1, cy1), 150, paint1);

    // Blob 2 (Bottom Left) -> Example: Admin Emerald
    final Paint paint2 = Paint()
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 120)
      ..color = const Color(0xFF10B981).withOpacity(0.15); 
    
    final double cx2 = w * 0.1 + (math.cos(animationValue * 2 * math.pi) * 60);
    final double cy2 = h * 0.7 + (math.sin(animationValue * 2 * math.pi) * 60);
    canvas.drawCircle(Offset(cx2, cy2), 180, paint2);
  }

  @override
  bool shouldRepaint(covariant _BlobPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue;
  }
}
