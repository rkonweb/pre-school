import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class AdminFeeHero extends StatelessWidget {
  const AdminFeeHero({super.key});

  @override
  Widget build(BuildContext context) {
    const double pct = 0.734;
    const String pctText = '73.4%';

    return Container(
      height: 164,
      decoration: BoxDecoration(
        gradient: AppTheme.adminTheme, // Orange / Emerald / Amber theme
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppTheme.adminTheme.colors.first.withValues(alpha: 0.35),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Subtle pattern overlay
          Positioned.fill(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: CustomPaint(painter: _DiamondPatternPainter()),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header chip
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.22),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.bar_chart_rounded, color: Colors.white, size: 13),
                      SizedBox(width: 4),
                      Text(
                        'FEE COLLECTION · MARCH 2025',
                        style: TextStyle(
                          fontFamily: 'Space Mono',
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 10),

                // Big number row
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      '₹42.6L',
                      style: TextStyle(
                        fontFamily: 'Clash Display',
                        fontSize: 44,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        height: 1,
                        letterSpacing: -1,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6, left: 6),
                      child: Text(
                        '/ ₹58L',
                        style: TextStyle(
                          fontFamily: 'Satoshi',
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withValues(alpha: 0.65),
                        ),
                      ),
                    ),
                  ],
                ),

                Text(
                  '73.4% collected · ₹15.4L pending',
                  style: TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 12,
                    color: Colors.white.withValues(alpha: 0.8),
                  ),
                ),

                const Spacer(),

                // Progress bar
                Stack(
                  children: [
                    Container(
                      height: 5,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.25),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    FractionallySizedBox(
                      widthFactor: pct,
                      child: Container(
                        height: 5,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.white.withValues(alpha: 0.5),
                              blurRadius: 6,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('0%',
                      style: TextStyle(fontFamily: 'Space Mono', fontSize: 9, color: Colors.white.withValues(alpha: 0.5))),
                    const Text(pctText,
                      style: TextStyle(fontFamily: 'Space Mono', fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white)),
                    Text('100%', // Actually staff-app-v11 says "Target"
                      style: TextStyle(fontFamily: 'Space Mono', fontSize: 9, color: Colors.white.withValues(alpha: 0.5))),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Diamond Pattern Painter ──────────────────────────────────────────────────

class _DiamondPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.08)
      ..strokeWidth = 0.8
      ..style = PaintingStyle.stroke;

    const spacing = 16.0;
    for (double x = 0; x < size.width + spacing; x += spacing) {
      for (double y = 0; y < size.height + spacing; y += spacing) {
        final path = Path()
          ..moveTo(x, y - spacing / 2)
          ..lineTo(x + spacing / 2, y)
          ..lineTo(x, y + spacing / 2)
          ..lineTo(x - spacing / 2, y)
          ..close();
        canvas.drawPath(path, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
