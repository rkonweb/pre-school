import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// ─── Brand gradient (matches app-wide theme) ─────────────────────────────────
const _gradColors   = [Color(0xFFFF5733), Color(0xFFFF006E), Color(0xFFC77DFF)];
const _gradBegin    = Alignment.topLeft;
const _gradEnd      = Alignment.bottomRight;
const _shadowColor  = Color(0xFFFF5733);

/// Standard branded circular FAB with a spring-bounce press animation.
///
/// Usage:
///   AppFab(onTap: () => _openSheet())
///   AppFab(onTap: () => _openSheet(), icon: Icons.edit_rounded)
class AppFab extends StatefulWidget {
  final VoidCallback onTap;
  final IconData icon;

  const AppFab({
    super.key,
    required this.onTap,
    this.icon = Icons.add_rounded,
  });

  @override
  State<AppFab> createState() => _AppFabState();
}

class _AppFabState extends State<AppFab> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 420),
    );

    // TweenSequence: press down → overshoot bounce → settle
    _scale = TweenSequence<double>([
      // 0 – 80ms  : press down to 0.82
      TweenSequenceItem(
        tween: Tween(begin: 1.0, end: 0.82)
            .chain(CurveTween(curve: Curves.easeIn)),
        weight: 19,
      ),
      // 80 – 260ms : bounce up past 1.0 to 1.14
      TweenSequenceItem(
        tween: Tween(begin: 0.82, end: 1.14)
            .chain(CurveTween(curve: Curves.easeOut)),
        weight: 43,
      ),
      // 260 – 420ms: spring back to 1.0
      TweenSequenceItem(
        tween: Tween(begin: 1.14, end: 1.0)
            .chain(CurveTween(curve: Curves.elasticOut)),
        weight: 38,
      ),
    ]).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _handleTap() async {
    HapticFeedback.lightImpact();
    // Run full spring animation, then open the popup
    await _ctrl.forward(from: 0);
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
          child: child,
        ),
        child: Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: _gradColors,
              begin: _gradBegin,
              end: _gradEnd,
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: _shadowColor.withOpacity(0.45),
                blurRadius: 18,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Icon(widget.icon, color: Colors.white, size: 28),
        ),
      ),
    );
  }
}
