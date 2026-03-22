
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'module_popup_shell.dart';

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
  int? _draggedIndex;

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

          final innerContent = Column(
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
          );

          final rawItemWidget = _PressScaleCard(
            onTap: action.onTap,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: innerContent,
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
              setState(() => _draggedIndex = null);
            },
            onLeave: (_) => setState(() => _draggedIndex = null),
            builder: (context, candidateData, rejectedData) {
              final isHovered = candidateData.isNotEmpty;
              
              final content = LongPressDraggable<int>(
                data: index,
                delay: const Duration(milliseconds: 150),
                onDragStarted: () => setState(() => _draggedIndex = index),
                onDraggableCanceled: (_, __) => setState(() => _draggedIndex = null),
                onDragEnd: (_) => setState(() => _draggedIndex = null),
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

// ─── Press-scale card wrapper ─────────────────────────────────────────────────
class _PressScaleCard extends StatefulWidget {
  final Widget child;
  final VoidCallback onTap;
  const _PressScaleCard({required this.child, required this.onTap});

  @override
  State<_PressScaleCard> createState() => _PressScaleCardState();
}

class _PressScaleCardState extends State<_PressScaleCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 260),
    );
    _scale = TweenSequence([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.90).chain(CurveTween(curve: Curves.easeOut)), weight: 35),
      TweenSequenceItem(tween: Tween(begin: 0.90, end: 1.04).chain(CurveTween(curve: Curves.easeOut)), weight: 40),
      TweenSequenceItem(tween: Tween(begin: 1.04, end: 1.0).chain(CurveTween(curve: Curves.easeOut)), weight: 25),
    ]).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _handleTap() async {
    dashboardBlurNotifier.value = true;  // blur instantly on tap
    HapticFeedback.selectionClick();
    _ctrl.forward(from: 0);
    await Future.delayed(const Duration(milliseconds: 100));
    widget.onTap();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _handleTap,
      child: AnimatedBuilder(
        animation: _scale,
        builder: (_, child) => Transform.scale(
          scale: _scale.value,
          child: Container(
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
            child: widget.child,
          ),
        ),
      ),
    );
  }
}
