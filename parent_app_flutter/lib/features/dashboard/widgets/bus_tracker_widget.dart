import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class BusTrackerWidget extends StatelessWidget {
  final VoidCallback onTap;

  const BusTrackerWidget({Key? key, required this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          children: [
            // Header Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [Color(0xFF2E8BC0), Color(0xFF68AFDC)],
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.directions_bus, color: Colors.white, size: 18),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Bus Tracker',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.t1,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF52A878).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF52A878).withOpacity(0.3)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: Color(0xFF52A878), // Sage accent
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Text(
                            'LIVE',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF52A878),
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                TextButton(
                  onPressed: onTap,
                  child: const Text(
                    'Full Map →',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF38BDF8), // Sky accent
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            
            // Map Card
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9), // slate-100 placeholder for map
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)), // slate-200
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x0A000000),
                    blurRadius: 10,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  // Map Area Placeholder (simulating the dynamic map from HTML)
                  Container(
                    height: 140,
                    decoration: const BoxDecoration(
                      color: Color(0xFF070E1A), // Dark night map background
                    ),
                    child: Stack(
                      children: [
                        // Pseudo map grid lines
                        Positioned.fill(
                          child: CustomPaint(painter: MapGridPainter()),
                        ),
                        // Pseudo Route
                        Positioned.fill(
                          child: CustomPaint(painter: RoutePainter()),
                        ),
                        
                        // Bus Marker
                        Positioned(
                          top: 60,
                          left: 200,
                          child: Container(
                            width: 30,
                            height: 30,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: const Color(0xFF38BDF8),
                              border: Border.all(color: Colors.white, width: 2),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF38BDF8).withOpacity(0.5),
                                  blurRadius: 10,
                                ),
                              ],
                            ),
                            child: const Icon(Icons.directions_bus, color: Colors.white, size: 16),
                          ),
                        ),
                        
                        // ETA Overlay Banner
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: Container(
                            height: 60,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.bottomCenter,
                                end: Alignment.topCenter,
                                colors: [
                                  const Color(0xFF0891B2).withOpacity(0.5), // Cyan tint
                                  Colors.transparent,
                                ],
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    Text(
                                      '12 min',
                                      style: GoogleFonts.outfit(
                                        fontSize: 24,
                                        fontWeight: FontWeight.w900,
                                        color: Colors.white,
                                        height: 1.0,
                                      ),
                                    ),
                                    const Text(
                                      'Estimated arrival at home',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white70,
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF52A878).withOpacity(0.9),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: Colors.white.withOpacity(0.3)),
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      const Text(
                                        'On Route',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                      Text(
                                        'Bus KA-09 · 3.2 km',
                                        style: TextStyle(
                                          fontSize: 9,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.white.withOpacity(0.8),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Route Progress Bar
                  Container(
                    color: Colors.white,
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Route Progress',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.t3,
                              ),
                            ),
                            const Text(
                              '62% complete',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF38BDF8),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        
                        // Progress Bar Container
                        SizedBox(
                          height: 24,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              // Background Track
                              Container(
                                height: 6,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFE0F2FE), // sky-100
                                  borderRadius: BorderRadius.circular(3),
                                ),
                              ),
                              // Fill Track
                              Positioned(
                                left: 0,
                                child: Container(
                                  height: 6,
                                  width: MediaQuery.of(context).size.width * 0.5, // Approx 62%
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [Color(0xFF2E8BC0), Color(0xFF68AFDC)],
                                    ),
                                    borderRadius: BorderRadius.circular(3),
                                  ),
                                ),
                              ),
                              // Current Position Dot
                              Positioned(
                                left: MediaQuery.of(context).size.width * 0.5 - 6,
                                child: Container(
                                  width: 14,
                                  height: 14,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF38BDF8),
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 3),
                                    boxShadow: [
                                      BoxShadow(
                                        color: const Color(0xFF38BDF8).withOpacity(0.5),
                                        blurRadius: 4,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        
                        // Stop Labels
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _buildStopLabel('School', true, false),
                            _buildStopLabel('Stop 2', true, false),
                            _buildStopLabel('Now ●', true, true),
                            _buildStopLabel('Stop 4', false, false),
                            _buildStopLabel('Home', false, false),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStopLabel(String label, bool isDone, bool isNow) {
    Color textColor = AppTheme.t4;
    Color dotColor = const Color(0xFFE2E8F0);
    
    if (isNow) {
      textColor = const Color(0xFF52A878); // Sage
      dotColor = const Color(0xFF52A878);
    } else if (isDone) {
      textColor = const Color(0xFF38BDF8); // Sky
      dotColor = const Color(0xFF38BDF8);
    }

    return Column(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: dotColor,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: textColor,
          ),
        ),
      ],
    );
  }
}

// Pseudo code painters for map visuals
class MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF1E3A5F) // Road color
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;
    
    // Draw horizontal road
    canvas.drawLine(Offset(0, size.height * 0.6), Offset(size.width, size.height * 0.6), paint);
    
    // Draw vertical road
    canvas.drawLine(Offset(size.width * 0.6, 0), Offset(size.width * 0.6, size.height), paint);
    
    // Fill buildings (darker)
    final buildingPaint = Paint()..color = const Color(0xFF0D1F33);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(10, 10, 60, 40), const Radius.circular(5)), buildingPaint);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(80, 10, 80, 40), const Radius.circular(5)), buildingPaint);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(10, 60, 60, 30), const Radius.circular(5)), buildingPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class RoutePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF22D3EE) // Cyan route
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;
    
    final path = Path();
    path.moveTo(50, size.height * 0.8);
    path.quadraticBezierTo(120, size.height * 0.6, 200, size.height * 0.5);
    path.quadraticBezierTo(280, size.height * 0.4, 320, size.height * 0.2);
    
    // Using a dashed effect manually or simply solid for placeholder
    canvas.drawPath(path, paint);
    
    // Draw destination pin
    final pinPaint = Paint()..color = const Color(0xFF10B981);
    canvas.drawCircle(Offset(320, size.height * 0.2), 6, pinPaint);
    final schoolPaint = Paint()..color = const Color(0xFFF97316);
    canvas.drawCircle(Offset(50, size.height * 0.8), 6, schoolPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
