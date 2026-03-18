import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class QuickActionItem {
  final String label;
  final IconData icon;
  final Color baseColor;
  final LinearGradient? iconGradient;
  final VoidCallback onTap;
  final bool isDraggable;

  QuickActionItem({
    required this.label,
    required this.icon,
    required this.baseColor,
    this.iconGradient,
    required this.onTap,
    this.isDraggable = true,
  });
}

class QuickActionGrid extends StatefulWidget {
  final List<QuickActionItem> actions;
  final void Function(int oldIndex, int newIndex)? onReorder;

  const QuickActionGrid({super.key, required this.actions, this.onReorder});

  @override
  State<QuickActionGrid> createState() => _QuickActionGridState();
}

class _QuickActionGridState extends State<QuickActionGrid> {

  @override
  Widget build(BuildContext context) {
    return GridView.count(
        crossAxisCount: 4,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 0.85,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(0, 0, 0, 14),
        children: widget.actions.asMap().entries.map((entry) {
          final index = entry.key;
          final action = entry.value;

          final rawItemWidget = Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [
                BoxShadow(
                  color: Color.fromRGBO(20, 14, 40, 0.04),
                  blurRadius: 10,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: InkWell(
              onTap: action.onTap,
              borderRadius: BorderRadius.circular(16),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                child: FittedBox(
                  fit: BoxFit.scaleDown,
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
                                    color: action.iconGradient!.colors.first.withValues(alpha: 0.4),
                                    blurRadius: 10,
                                  ),
                                ],
                              ),
                            )
                          : Icon(action.icon, color: action.baseColor, size: 26))
                          .animate(onPlay: (controller) => controller.repeat(reverse: true))
                          .scale(begin: const Offset(1, 1), end: const Offset(1.1, 1.1), duration: 2.seconds, curve: Curves.easeInOut),
                      const SizedBox(height: 8),
                      Text(
                        action.label.toUpperCase(),
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontFamily: 'Satoshi',
                          fontSize: 8.5,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF7B7291),
                          letterSpacing: -0.2,
                          height: 1.25,
                        ),
                        maxLines: 2,
                        softWrap: true,
                        overflow: TextOverflow.visible,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );

          final animWidget = rawItemWidget
            .animate(delay: (50 * index).ms)
            .fadeIn(duration: 600.ms)
            .slideY(begin: 0.2, end: 0, curve: const Cubic(.34, 1.56, .64, 1));

          if (!action.isDraggable || widget.onReorder == null) {
            return DragTarget<int>(
              onWillAcceptWithDetails: (details) => details.data != index,
              onAcceptWithDetails: (details) => widget.onReorder?.call(details.data, index),
              builder: (context, _, __) => animWidget,
            );
          }

          return DragTarget<int>(
            onWillAcceptWithDetails: (details) => details.data != index,
            onAcceptWithDetails: (details) {
              widget.onReorder!(details.data, index);
            },
            builder: (context, candidateData, rejectedData) {
              final isHovered = candidateData.isNotEmpty;
              
              final content = LongPressDraggable<int>(
                data: index,
                delay: const Duration(milliseconds: 150),
                feedback: Material(
                  color: Colors.transparent,
                  child: SizedBox(
                    width: (MediaQuery.of(context).size.width - 36 - 30) / 4,
                    height: ((MediaQuery.of(context).size.width - 36 - 30) / 4) / 0.85,
                    child: Opacity(opacity: 0.8, child: rawItemWidget),
                  ),
                ),
                childWhenDragging: Opacity(opacity: 0.3, child: animWidget),
                child: isHovered 
                  ? Transform.scale(scale: 1.05, child: Opacity(opacity: 0.7, child: animWidget))
                  : animWidget,
              );
              
              return content;
            },
          );
        }).toList(),
      );
  }
}
