import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class StatTile extends StatelessWidget {
  final IconData icon;
  final String numText;
  final String label;
  final String chText;
  final Color chColor;
  final LinearGradient hoverGradient;
  final LinearGradient? iconGradient;

  const StatTile({
    super.key,
    required this.icon,
    required this.numText,
    required this.label,
    required this.chText,
    required this.chColor,
    required this.hoverGradient,
    this.iconGradient,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color.fromRGBO(20, 14, 40, 0.07), width: 1.5),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(20, 14, 40, 0.06),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
          BoxShadow(
            color: Color.fromRGBO(20, 14, 40, 0.04),
            blurRadius: 3,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Simulated ::before hover indicator
          Positioned(
            bottom: -14,
            left: -10,
            right: -10,
            height: 3,
            child: Opacity(
              opacity: 0, // This is static UI; interactivity (hover) needs real state. Setting 0 for now representing stationary.
              child: Container(
                decoration: BoxDecoration(
                  gradient: hoverGradient,
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(22),
                    bottomRight: Radius.circular(22),
                  ),
                ),
              ),
            ),
          ),
          
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              (iconGradient != null
                  ? ShaderMask(
                      blendMode: BlendMode.srcIn,
                      shaderCallback: (bounds) => iconGradient!.createShader(
                        Rect.fromLTWH(0, 0, bounds.width, bounds.height),
                      ),
                      child: Icon(
                        icon,
                        key: const ValueKey('icon_gradient'),
                        color: Colors.white,
                        size: 24,
                        shadows: [
                          Shadow(
                            color: iconGradient!.colors.first.withValues(alpha: 0.4),
                            blurRadius: 10,
                          ),
                        ],
                      ),
                    )
                  : Icon(icon, key: const ValueKey('icon_plain'), color: const Color(0xFF140E28), size: 24))
                .animate(onPlay: (controller) => controller.repeat(reverse: true))
                .slideY(begin: 0, end: -0.15, duration: 1.5.seconds, curve: Curves.easeInOut),
              const SizedBox(height: 7),
              Text(
                numText,
                style: const TextStyle(
                  fontFamily: 'Clash Display',
                  fontSize: 23,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF140E28),
                  letterSpacing: -1,
                  height: 1,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                label.toUpperCase(),
                style: const TextStyle(
                  fontFamily: 'Satoshi',
                  fontSize: 9.5,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF7B7291),
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                chText,
                style: TextStyle(
                  fontFamily: 'Satoshi',
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: chColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
