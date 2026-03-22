import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Global notifier — set to true the instant any module tap is registered.
/// The AppShell listens to this and blurs the dashboard immediately.
final dashboardBlurNotifier = ValueNotifier<bool>(false);


// ─── Design Tokens ────────────────────────────────────────────────────────────

const _ink   = Color(0xFF140E28);
const _tA    = Color(0xFFFF5733);
const _tGrad = LinearGradient(
  colors: [Color(0xFFFF5733), Color(0xFFFF006E), Color(0xFFC77DFF)],
  begin: Alignment.topLeft, end: Alignment.bottomRight,
);

// ─── Standard Gradient Page Header ───────────────────────────────────────────
//
// Renders the standard popup header used across ALL module pages:
//   • Brand gradient background (flush with top — no gap)
//   • Dotted drag-strip at the very top
//   • Left: frosted white icon box containing the page icon
//   • Center: bold white title + white subtitle
//   • Right: optional white frosted action button (label or icon)
//
// Usage:
//   ModulePageHeader(
//     title: 'Messages',
//     subtitle: 'Recent conversations',
//     icon: Icons.chat_bubble_rounded,
//     actionLabel: '+ New',
//     onAction: () => ...,
//   )

class ModulePageHeader extends StatelessWidget {
  final String title;
  final String? subtitle;       // now optional — omit to show title only
  final IconData? icon;

  /// Text label for the right action button (e.g. "+ Create")
  final String? actionLabel;
  final VoidCallback? onAction;

  /// Icon-only action button (used if actionLabel is null)
  final IconData? actionIcon;
  final VoidCallback? onActionIcon;

  /// Extra rows below the gradient strip (chips, filter tabs, etc.)
  final List<Widget> bottomRows;

  const ModulePageHeader({
    super.key,
    required this.title,
    this.subtitle,              // no longer required
    this.icon,
    this.actionLabel,
    this.onAction,
    this.actionIcon,
    this.onActionIcon,
    this.bottomRows = const [],
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // ── Gradient band (title area) ──
        Container(
          decoration: const BoxDecoration(
            gradient: _tGrad,
          ),
          child: SafeArea(
            bottom: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Dotted drag strip
                const SizedBox(height: 10),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(6, (i) => Padding(
                    padding: EdgeInsets.only(left: i == 0 ? 0 : 5),
                    child: Container(
                      width: 5, height: 5,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.55),
                        shape: BoxShape.circle,
                      ),
                    ),
                  )),
                ),
                const SizedBox(height: 14),

                // Title row
                Padding(
                  padding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
                  child: Row(children: [
                    // Icon box
                    if (icon != null) ...[
                      Container(
                        width: 46, height: 46,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.22),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Icon(icon!, color: Colors.white, size: 24),
                      ),
                      const SizedBox(width: 14),
                    ],

                     // Title (+ optional subtitle)
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(title, style: const TextStyle(
                            fontFamily: 'Clash Display',
                            fontSize: 22, fontWeight: FontWeight.w900,
                            color: Colors.white, letterSpacing: -0.5, height: 1.1,
                          )),
                          if (subtitle != null) ...[
                            const SizedBox(height: 3),
                            Text(subtitle!, style: TextStyle(
                              fontFamily: 'Satoshi',
                              fontSize: 12, fontWeight: FontWeight.w600,
                              color: Colors.white.withOpacity(0.82),
                            )),
                          ],
                        ],
                      ),
                    ),

                    // Right action button
                    if (actionLabel != null)
                      GestureDetector(
                        onTap: () {
                          HapticFeedback.lightImpact();
                          onAction?.call();
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.22),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.white.withOpacity(0.30), width: 1.5),
                          ),
                          child: Text(actionLabel!, style: const TextStyle(
                            fontFamily: 'Satoshi',
                            fontSize: 12, fontWeight: FontWeight.w800,
                            color: Colors.white,
                          )),
                        ),
                      )
                    else if (actionIcon != null)
                      GestureDetector(
                        onTap: () {
                          HapticFeedback.lightImpact();
                          onActionIcon?.call();
                        },
                        child: Container(
                          width: 42, height: 42,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.22),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.white.withOpacity(0.30), width: 1.5),
                          ),
                          child: Icon(actionIcon!, color: Colors.white, size: 20),
                        ),
                      ),
                  ]),
                ),
              ],
            ),
          ),
        ),

        // ── Optional extra rows (chips, tabs, search bars, etc.) ──
        ...bottomRows,
      ],
    );
  }
}

// ─── Module Popup Shell ───────────────────────────────────────────────────────
//
// A full-screen scaffold wrapper using the standard gradient header.
// Used by: Homework, Diary, Self-Attendance, Circular, Leave, PTM, etc.

class ModulePopupShell extends StatefulWidget {
  final String title;
  final String? subtitle;
  final IconData? icon;
  final String? actionLabel;
  final VoidCallback? onAction;
  final IconData? actionIcon;
  final VoidCallback? onActionIcon;
  final Widget? chipsRow;
  final Widget? filterTabs;
  final Widget body;
  final Color backgroundColor;
  final Widget? floatingActionButton;
  final FloatingActionButtonLocation? floatingActionButtonLocation;

  const ModulePopupShell({
    super.key,
    required this.title,
    this.subtitle,
    this.icon,
    this.actionLabel,
    this.onAction,
    this.actionIcon,
    this.onActionIcon,
    this.chipsRow,
    this.filterTabs,
    required this.body,
    this.backgroundColor = const Color(0xFFFAFBFE),
    this.floatingActionButton,
    this.floatingActionButtonLocation,
  });

  @override
  State<ModulePopupShell> createState() => _ModulePopupShellState();
}

class _ModulePopupShellState extends State<ModulePopupShell> {
  double _dragStartY = 0;
  bool _hasDismissed = false;

  void _dismiss() {
    if (_hasDismissed) return;
    _hasDismissed = true;
    HapticFeedback.lightImpact();
    Navigator.of(context, rootNavigator: true).pop();
  }

  @override
  Widget build(BuildContext context) {
    final bottomPad = MediaQuery.of(context).padding.bottom + 20;
    return Scaffold(
      backgroundColor: widget.backgroundColor,
      floatingActionButton: widget.floatingActionButton,
      floatingActionButtonLocation:
          widget.floatingActionButtonLocation ?? FloatingActionButtonLocation.endFloat,
      body: Column(children: [
        // ── Header: full-area drag to dismiss ──────────────────────────────
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onVerticalDragStart: (details) {
            _dragStartY = details.globalPosition.dy;
            _hasDismissed = false;
          },
          onVerticalDragUpdate: (details) {
            if (_hasDismissed) return;
            final draggedDown = details.globalPosition.dy - _dragStartY;
            if (draggedDown > 80) _dismiss();
          },
          onVerticalDragEnd: (details) {
            if (_hasDismissed) return;
            final velocity = details.primaryVelocity ?? 0;
            if (velocity > 300) _dismiss();
          },
          child: ModulePageHeader(
            title: widget.title,
            subtitle: widget.subtitle,
            icon: widget.icon,
            actionLabel: widget.actionLabel,
            onAction: widget.onAction,
            actionIcon: widget.actionIcon,
            onActionIcon: widget.onActionIcon,
            bottomRows: [
              if (widget.chipsRow != null) widget.chipsRow!,
              if (widget.filterTabs != null) widget.filterTabs!,
            ],
          ),
        ),
        Expanded(child: MediaQuery(
          data: MediaQuery.of(context).copyWith(
            padding: MediaQuery.of(context).padding.copyWith(bottom: bottomPad),
          ),
          child: widget.body,
        )),
      ]),
    );
  }
}

// ─── showModulePopup ──────────────────────────────────────────────────────────
//
// Opens any module in a full-screen draggable bottom sheet.
// The sheet covers the AppShell stat bar + bottom nav (useRootNavigator + useSafeArea: false).
// No external close button — drag down to dismiss.

Future<void> showModulePopup(BuildContext context, Widget child) async {
  dashboardBlurNotifier.value = true;          // blur dashboard instantly
  await showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useRootNavigator: true,
    useSafeArea: false,
    backgroundColor: Colors.transparent,
    barrierColor: Colors.black.withOpacity(0.45),
    sheetAnimationStyle: AnimationStyle(
      duration: const Duration(milliseconds: 800),        // slow start sweep-in
      reverseDuration: const Duration(milliseconds: 500), // soft close
      curve: Curves.easeInCubic,
    ),
    builder: (ctx) => DraggableScrollableSheet(
      initialChildSize: 1.0,
      maxChildSize: 1.0,
      minChildSize: 0.5,
      snap: true,
      snapSizes: const [0.5, 1.0],
      builder: (_, __) => ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        child: child,
      ),
    ),
  );
  dashboardBlurNotifier.value = false;         // unblur when popup closes
}
