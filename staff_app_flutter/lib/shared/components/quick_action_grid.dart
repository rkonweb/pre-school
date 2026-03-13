import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class QuickActionItem {
  final String label;
  final IconData icon;
  final Color baseColor;
  final LinearGradient? iconGradient;
  final VoidCallback onTap;

  QuickActionItem({
    required this.label,
    required this.icon,
    required this.baseColor,
    this.iconGradient,
    required this.onTap,
  });
}

class QuickActionGrid extends StatelessWidget {
  final List<QuickActionItem> actions;

  const QuickActionGrid({super.key, required this.actions});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
        crossAxisCount: 4,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 0.85,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
        children: actions.asMap().entries.map((entry) {
          final index = entry.key;
          final action = entry.value;

          return Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
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
            child: InkWell(
              onTap: action.onTap,
              borderRadius: BorderRadius.circular(20),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 14),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    (action.iconGradient != null
                        ? ShaderMask(
                            blendMode: BlendMode.srcIn,
                            shaderCallback: (bounds) => action.iconGradient!.createShader(
                              Rect.fromLTWH(0, 0, bounds.width, bounds.height),
                            ),
                            child: Icon(
                              action.icon,
                              color: Colors.white,
                              size: 26,
                              shadows: [
                                Shadow(
                                  color: action.iconGradient!.colors.first.withOpacity(0.4),
                                  blurRadius: 10,
                                ),
                              ],
                            ),
                          )
                        : Icon(action.icon, color: action.baseColor, size: 26))
                        .animate(onPlay: (controller) => controller.repeat(reverse: true))
                        .scale(begin: const Offset(1, 1), end: const Offset(1.1, 1.1), duration: 2.seconds, curve: Curves.easeInOut),
                    const SizedBox(height: 6),
                    Text(
                      action.label.toUpperCase(),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF7B7291), // --ink3
                        letterSpacing: 0.3,
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ).animate(delay: (50 * index).ms).fadeIn(duration: 600.ms).slideY(begin: 0.2, end: 0, curve: const Cubic(.34, 1.56, .64, 1));
        }).toList(),
      );
  }
}
