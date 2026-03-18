import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class GradientHeroCard extends StatelessWidget {
  final String pillText;
  final String value;
  final String subValue;
  final String subtitle;
  final double progress;
  final IconData icon;
  final LinearGradient themeGradient;

  const GradientHeroCard({
    super.key,
    required this.pillText,
    required this.value,
    required this.subValue,
    required this.subtitle,
    required this.progress,
    required this.icon,
    required this.themeGradient,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: themeGradient,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withValues(alpha: 0.3), width: 1), // inner shadow simulation
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(20, 14, 40, 0.14),
            blurRadius: 60,
            offset: Offset(0, 20),
          ),
          BoxShadow(
            color: Color.fromRGBO(20, 14, 40, 0.07),
            blurRadius: 20,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Stack(
        children: [
          // gh-mesh abstraction
          Positioned.fill(
            child: Opacity(
              opacity: 0.1,
              child: CustomPaint(
                painter: MeshPainter(),
              ),
            ),
          ),
          // Background Decor gh-blob 1
          Positioned(
            right: -40,
            top: -60,
            child: Container(
              width: 220,
              height: 220,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.1),
              ),
            ).animate(onPlay: (controller) => controller.repeat(reverse: true))
             .scale(duration: 3.seconds, curve: Curves.easeInOut, begin: const Offset(1, 1), end: const Offset(1.15, 1.15))
             .fade(duration: 3.seconds, curve: Curves.easeInOut, begin: 0.6, end: 0.9),
          ),
          // Background Decor gh-blob 2
          Positioned(
            left: 10,
            bottom: -30,
            child: Container(
              width: 150,
              height: 150,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.08),
              ),
            ).animate(delay: 2.seconds, onPlay: (controller) => controller.repeat(reverse: true))
             .scale(duration: 3.seconds, curve: Curves.easeInOut, begin: const Offset(1, 1), end: const Offset(1.15, 1.15))
             .fade(duration: 3.seconds, curve: Curves.easeInOut, begin: 0.6, end: 0.9),
          ),
          
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // gh-pill
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.22),
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(icon, color: Colors.white.withValues(alpha: 0.8), size: 11),
                    const SizedBox(width: 7),
                    Text(
                      pillText.toUpperCase(),
                      style: const TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
              // gh-num
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    value,
                    style: const TextStyle(
                      fontFamily: 'Clash Display',
                      fontSize: 48,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      letterSpacing: -3,
                      height: 0.9,
                    ),
                  ).animate().slideY(begin: 0.5, end: 0, duration: 800.ms, curve: const Cubic(.34, 1.56, .64, 1)).fadeIn(duration: 800.ms),
                  const SizedBox(width: 4),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Text(
                      subValue,
                      style: TextStyle(
                        fontFamily: 'Clash Display',
                        fontSize: 18,
                        fontWeight: FontWeight.w400,
                        color: Colors.white.withValues(alpha: 0.7),
                      ),
                    ).animate().slideY(begin: 0.5, end: 0, duration: 800.ms, curve: const Cubic(.34, 1.56, .64, 1)).fadeIn(duration: 800.ms, delay: 100.ms),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // gh-sub
              Text(
                subtitle,
                style: TextStyle(
                  fontFamily: 'Satoshi',
                  fontSize: 12.5,
                  fontWeight: FontWeight.w500,
                  color: Colors.white.withValues(alpha: 0.75),
                ),
              ),
              const SizedBox(height: 18),
              // gh-bar
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Stack(
                    alignment: Alignment.centerLeft,
                    clipBehavior: Clip.none,
                    children: [
                      Container(
                        height: 8,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(100),
                        ),
                      ),
                      LayoutBuilder(
                        builder: (context, constraints) {
                          return Container(
                            height: 8,
                            width: constraints.maxWidth * progress,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.9),
                              borderRadius: BorderRadius.circular(100),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.white.withValues(alpha: 0.5),
                                  blurRadius: 16,
                                ),
                                BoxShadow(
                                  color: Colors.white.withValues(alpha: 0.3),
                                  blurRadius: 0,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                          ).animate().scaleX(begin: 0, end: 1, duration: 1600.ms, curve: const Cubic(.34, 1.56, .64, 1), alignment: Alignment.centerLeft);
                        }
                      ),
                      Positioned(
                        left: (MediaQuery.of(context).size.width - 32 - 44) * progress - 16, // approximate thumb position
                        child: Container(
                          width: 16,
                          height: 16,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white,
                            boxShadow: [
                              BoxShadow(color: Colors.white.withValues(alpha: 0.8), blurRadius: 12),
                              BoxShadow(color: Colors.white.withValues(alpha: 0.3), spreadRadius: 3),
                            ],
                          ),
                        ).animate(delay: 800.ms).fadeIn(duration: 600.ms).scale(curve: const Cubic(.34, 1.56, .64, 1)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('0%', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: Colors.white.withValues(alpha: 0.6))),
                      Text('${(progress * 100).toStringAsFixed(1)}%', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.white)),
                      Text('100%', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: Colors.white.withValues(alpha: 0.6))),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class MeshPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    var paint = Paint()
      ..color = Colors.white
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;
    
    // Simple hashed background emulation
    for(double i = -size.height; i < size.width; i+=12) {
      canvas.drawLine(Offset(i, 0), Offset(i + size.height, size.height), paint);
      canvas.drawLine(Offset(i + size.height, 0), Offset(i, size.height), paint);
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
