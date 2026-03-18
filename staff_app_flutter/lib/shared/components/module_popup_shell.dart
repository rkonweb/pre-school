import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// ─── Design Tokens ────────────────────────────────────────────────────────────

const _ink   = Color(0xFF140E28);
const _ink3  = Color(0xFF7B7291);
const _tA    = Color(0xFFFF5733);
const _tSoft = Color(0x14FF5733);
const _tGrad = LinearGradient(
  colors: [Color(0xFFFF5733), Color(0xFFFF006E), Color(0xFFC77DFF)],
  begin: Alignment.topLeft, end: Alignment.bottomRight,
);

/// A standardized popup shell matching the Leave module's header style.
///
/// Usage:
/// ```dart
/// ModulePopupShell(
///   title: 'Homework',
///   subtitle: 'Manage assignments for your classes',
///   actionLabel: '+ Create',
///   onAction: () => ...,
///   body: MyContentWidget(),
/// )
/// ```
class ModulePopupShell extends StatelessWidget {
  final String title;
  final String subtitle;

  /// Optional gradient pill button label (e.g. "+ Apply", "+ Create")
  final String? actionLabel;
  final VoidCallback? onAction;

  /// Optional icon action (e.g. refresh, history) — used instead of gradient pill
  final IconData? actionIcon;
  final VoidCallback? onActionIcon;

  /// Optional chips row (horizontal scrollable)
  final Widget? chipsRow;

  /// Optional filter tabs row
  final Widget? filterTabs;

  /// ← The body content of the module
  final Widget body;

  /// Background color of the body area
  final Color backgroundColor;

  const ModulePopupShell({
    super.key,
    required this.title,
    required this.subtitle,
    this.actionLabel,
    this.onAction,
    this.actionIcon,
    this.onActionIcon,
    this.chipsRow,
    this.filterTabs,
    required this.body,
    this.backgroundColor = const Color(0xFFFAFBFE),
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      body: Column(children: [
        _buildHeader(context),
        Expanded(child: body),
      ]),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      color: Colors.white,
      child: SafeArea(
        bottom: false,
        child: Column(children: [
          // ── Title row ──
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
            child: Row(children: [
              // Back button (orange tint, matches Leave)
              GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  Navigator.of(context).pop();
                },
                child: Container(
                  width: 32, height: 32,
                  decoration: BoxDecoration(
                    color: _tSoft,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.chevron_left_rounded, color: _tA, size: 20),
                ),
              ),
              const SizedBox(width: 10),

              // Title + subtitle
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(
                      fontFamily: 'Clash Display', fontSize: 17,
                      fontWeight: FontWeight.w900, color: _ink, letterSpacing: -0.3,
                    )),
                    Text(subtitle, style: const TextStyle(
                      fontFamily: 'Satoshi', fontSize: 10,
                      fontWeight: FontWeight.w600, color: _ink3,
                    )),
                  ],
                ),
              ),

              // Right action: gradient pill OR icon button
              if (actionLabel != null)
                GestureDetector(
                  onTap: onAction,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: _tGrad,
                      borderRadius: BorderRadius.circular(100),
                      boxShadow: [BoxShadow(color: _tA.withOpacity(.3), blurRadius: 12, offset: const Offset(0, 4))],
                    ),
                    child: Text(actionLabel!, style: const TextStyle(
                      fontFamily: 'Satoshi', fontSize: 11,
                      fontWeight: FontWeight.w800, color: Colors.white,
                    )),
                  ),
                )
              else if (actionIcon != null)
                GestureDetector(
                  onTap: onActionIcon,
                  child: Container(
                    width: 32, height: 32,
                    decoration: BoxDecoration(
                      color: _tSoft,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(actionIcon!, color: _tA, size: 18),
                  ),
                ),
            ]),
          ),

          // ── Optional chips row ──
          if (chipsRow != null) chipsRow!,

          // ── Optional filter tabs ──
          if (filterTabs != null) filterTabs!,

          // ── Bottom border ──
          if (chipsRow == null && filterTabs == null)
            Container(height: 1, color: const Color(0x10140E28)),
        ]),
      ),
    );
  }
}

/// Shared helper: opens a module inside a standard bottom-sheet popup.
///
/// [context] – parent context for showing the modal
/// [child]   – the module widget (usually wrapped in ModulePopupShell)
Future<void> showModulePopup(BuildContext context, Widget child) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    barrierColor: Colors.black54,
    builder: (ctx) => Padding(
      padding: EdgeInsets.only(top: MediaQuery.of(ctx).padding.top + 40),
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        child: child,
      ),
    ),
  );
}
