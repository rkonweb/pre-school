import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// ─── App-wide design tokens ───────────────────────────────────────────────────
const _tA    = Color(0xFFFF5733);
const _tSoft = Color(0x14FF5733);
const _ink   = Color(0xFF140E28);
const _ink3  = Color(0xFF7B7291);
const _tGrad = LinearGradient(
  colors: [Color(0xFFFF5733), Color(0xFFFF006E), Color(0xFFC77DFF)],
  begin: Alignment.topLeft, end: Alignment.bottomRight,
);

const _monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const _dayNames = ['M','T','W','T','F','S','S'];

// ─── Helper ───────────────────────────────────────────────────────────────────
String _fmtFull(DateTime d) =>
    '${_monthNames[d.month-1].substring(0,3)} ${d.day}, ${d.year}';

// ─── Show helper: single date picker (modal bottom sheet) ──────────────────────
/// Opens the themed calendar as a modal bottom sheet.
/// [initialDate] - starts on this date (defaults to today).
/// [firstDate] / [lastDate] - bounds (defaults 90 days back → today+365d).
/// Returns the selected [DateTime] or null if dismissed.
Future<DateTime?> showAppDatePicker({
  required BuildContext context,
  DateTime? initialDate,
  DateTime? firstDate,
  DateTime? lastDate,
}) {
  return showModalBottomSheet<DateTime>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _AppDatePickerSheet(
      initialDate: initialDate ?? DateTime.now(),
      firstDate: firstDate ?? DateTime.now().subtract(const Duration(days: 90)),
      lastDate: lastDate ?? DateTime.now().add(const Duration(days: 365)),
    ),
  );
}

// ─── Bottom sheet wrapper ─────────────────────────────────────────────────────
class _AppDatePickerSheet extends StatefulWidget {
  final DateTime initialDate, firstDate, lastDate;
  const _AppDatePickerSheet({
    required this.initialDate,
    required this.firstDate,
    required this.lastDate,
  });
  @override
  State<_AppDatePickerSheet> createState() => _AppDatePickerSheetState();
}

class _AppDatePickerSheetState extends State<_AppDatePickerSheet> {
  late DateTime _selected;

  @override
  void initState() {
    super.initState();
    _selected = widget.initialDate;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        // Drag handle
        Container(margin: const EdgeInsets.only(top: 10), width: 40, height: 4,
          decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(100))),
        const SizedBox(height: 14),

        // Title + selected date chip
        Padding(padding: const EdgeInsets.symmetric(horizontal: 18), child: Row(children: [
          const Expanded(child: Text('Select Date', style: TextStyle(
            fontFamily: 'Clash Display', fontSize: 16, fontWeight: FontWeight.w900, color: _ink))),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(color: _tSoft, borderRadius: BorderRadius.circular(100)),
            child: Text(_fmtFull(_selected), style: const TextStyle(
              fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w800, color: _tA))),
        ])),
        const SizedBox(height: 12),

        // Themed calendar (single select)
        AppCalendarWidget(
          selected: _selected,
          firstDate: widget.firstDate,
          lastDate: widget.lastDate,
          onDateSelected: (date) {
            HapticFeedback.selectionClick();
            setState(() => _selected = date);
          },
        ),
        const SizedBox(height: 12),

        // Confirm button
        Padding(padding: const EdgeInsets.fromLTRB(18, 0, 18, 24),
          child: GestureDetector(
            onTap: () => Navigator.pop(context, _selected),
            child: Container(
              height: 52, alignment: Alignment.center,
              decoration: BoxDecoration(
                gradient: _tGrad, borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: _tA.withValues(alpha: .3), blurRadius: 12, offset: const Offset(0, 4))]),
              child: Text('Confirm  ${_fmtFull(_selected)}', style: const TextStyle(
                fontFamily: 'Satoshi', fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white))))),
      ]),
    );
  }
}

// ─── Core Calendar Widget (reusable inline widget) ───────────────────────────
/// Use this when you need an inline calendar (e.g. Leave apply sheet).
/// For a modal dialog, use [showAppDatePicker] instead.
class AppCalendarWidget extends StatefulWidget {
  /// The currently selected date (single-select).
  final DateTime? selected;
  /// Called when user taps a date.
  final void Function(DateTime) onDateSelected;
  /// Optional range highlight: from date.
  final DateTime? rangeFrom;
  /// Optional range highlight: to date.
  final DateTime? rangeTo;
  /// Which date is being picked (used for the hint banner in range mode).
  final bool? pickingFrom;
  /// Lower bound for selectable dates.
  final DateTime? firstDate;
  /// Upper bound for selectable dates.
  final DateTime? lastDate;
  /// Whether to show the legend row at the bottom.
  final bool showLegend;

  const AppCalendarWidget({
    super.key,
    this.selected,
    required this.onDateSelected,
    this.rangeFrom,
    this.rangeTo,
    this.pickingFrom,
    this.firstDate,
    this.lastDate,
    this.showLegend = true,
  });

  @override
  State<AppCalendarWidget> createState() => _AppCalendarWidgetState();
}

class _AppCalendarWidgetState extends State<AppCalendarWidget>
    with SingleTickerProviderStateMixin {
  late DateTime _month;
  late AnimationController _ctrl;
  bool _slideLeft = true;

  @override
  void initState() {
    super.initState();
    _month = DateTime(
      (widget.selected ?? DateTime.now()).year,
      (widget.selected ?? DateTime.now()).month,
    );
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 260));
    _ctrl.value = 1;
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  bool _same(DateTime a, DateTime b) => a.year == b.year && a.month == b.month && a.day == b.day;

  bool _outOfBounds(DateTime d) {
    if (widget.firstDate != null && d.isBefore(widget.firstDate!)) return true;
    if (widget.lastDate  != null && d.isAfter(widget.lastDate!))  return true;
    return false;
  }

  void _goPrev() {
    _slideLeft = false;
    _ctrl.reverse().then((_) {
      if (!mounted) return;
      setState(() => _month = DateTime(_month.year, _month.month - 1));
      _ctrl.forward();
    });
  }

  void _goNext() {
    _slideLeft = true;
    _ctrl.reverse().then((_) {
      if (!mounted) return;
      setState(() => _month = DateTime(_month.year, _month.month + 1));
      _ctrl.forward();
    });
  }

  @override
  Widget build(BuildContext context) {
    final today   = DateTime.now();
    final first   = DateTime(_month.year, _month.month);
    final last    = DateTime(_month.year, _month.month + 1, 0);
    final offset  = (first.weekday - 1) % 7;
    final rows    = ((offset + last.day) / 7).ceil();
    final isRange = widget.rangeFrom != null || widget.rangeTo != null;

    return Padding(padding: const EdgeInsets.symmetric(horizontal: 18),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0x08000000)),
          boxShadow: [BoxShadow(color: _tA.withValues(alpha: .09), blurRadius: 24, offset: const Offset(0, 6))]),
        child: Column(children: [
          // ── Gradient header ─────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
            decoration: const BoxDecoration(
              gradient: _tGrad,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
            child: Row(children: [
              GestureDetector(onTap: _goPrev,
                child: Container(width: 32, height: 32,
                  decoration: BoxDecoration(color: Colors.white.withValues(alpha: .22), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.chevron_left_rounded, color: Colors.white, size: 20))),
              Expanded(child: Column(children: [
                Text(_monthNames[_month.month-1], style: const TextStyle(
                  fontFamily: 'Clash Display', fontSize: 17, fontWeight: FontWeight.w900,
                  color: Colors.white, height: 1, letterSpacing: -.2)),
                Text('${_month.year}', style: const TextStyle(
                  fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white70)),
              ])),
              GestureDetector(onTap: _goNext,
                child: Container(width: 32, height: 32,
                  decoration: BoxDecoration(color: Colors.white.withValues(alpha: .22), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.chevron_right_rounded, color: Colors.white, size: 20))),
            ]),
          ),

          // ── Range hint banner (only in range mode) ───────────────────────
          if (isRange && widget.pickingFrom != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              color: widget.pickingFrom! ? _tSoft : const Color(0xFFEFF6FF),
              child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(widget.pickingFrom! ? Icons.calendar_today_rounded : Icons.event_available_rounded,
                  size: 12, color: widget.pickingFrom! ? _tA : const Color(0xFF3B82F6)),
                const SizedBox(width: 6),
                Text(widget.pickingFrom! ? 'Select start date' : 'Select end date',
                  style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w700,
                    color: widget.pickingFrom! ? _tA : const Color(0xFF3B82F6))),
              ]),
            ),

          // ── Day-of-week labels ────────────────────────────────────────────
          Padding(padding: const EdgeInsets.fromLTRB(10, 10, 10, 4),
            child: Row(children: _dayNames.asMap().entries.map((e) =>
              Expanded(child: Center(child: Text(e.value,
                style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w800,
                  color: e.key >= 5 ? const Color(0xFFEF4444).withValues(alpha: .7) : _ink3))))).toList())),

          // ── Animated date grid ────────────────────────────────────────────
          AnimatedBuilder(
            animation: _ctrl,
            builder: (_, __) => Opacity(
              opacity: _ctrl.value,
              child: Transform.translate(
                offset: Offset((1 - _ctrl.value) * (_slideLeft ? 24 : -24), 0),
                child: Padding(padding: const EdgeInsets.fromLTRB(10, 2, 10, 10),
                  child: Column(children: List.generate(rows, (row) => Row(
                    children: List.generate(7, (col) {
                      final idx = row * 7 + col;
                      final d   = idx - offset + 1;
                      if (idx < offset || d > last.day) return const Expanded(child: SizedBox(height: 40));

                      final date     = DateTime(_month.year, _month.month, d);
                      final isToday  = _same(date, today);
                      final isSel    = widget.selected != null && _same(date, widget.selected!);
                      final isFrom   = widget.rangeFrom != null && _same(date, widget.rangeFrom!);
                      final isTo     = widget.rangeTo   != null && _same(date, widget.rangeTo!);
                      final isEndpt  = isFrom || isTo;
                      final inRange  = widget.rangeFrom != null && widget.rangeTo != null &&
                          date.isAfter(widget.rangeFrom!) && date.isBefore(widget.rangeTo!);
                      final disabled = _outOfBounds(date);
                      final isWknd   = col >= 5;

                      // Range pill borders
                      BorderRadius? rangeBr;
                      if (isFrom && widget.rangeTo != null) {
                        rangeBr = const BorderRadius.horizontal(left: Radius.circular(100));
                      } else if (isTo && widget.rangeFrom != null) {
                        rangeBr = const BorderRadius.horizontal(right: Radius.circular(100));
                      }

                      return Expanded(child: GestureDetector(
                        onTap: disabled ? null : () { HapticFeedback.selectionClick(); widget.onDateSelected(date); },
                        child: Container(
                          height: 40,
                          decoration: BoxDecoration(
                            color: inRange ? _tSoft : Colors.transparent,
                            borderRadius: rangeBr),
                          child: Center(child: Container(
                            width: 34, height: 34,
                            decoration: (isSel || isEndpt)
                                ? BoxDecoration(gradient: _tGrad, shape: BoxShape.circle,
                                    boxShadow: [BoxShadow(color: _tA.withValues(alpha: .35), blurRadius: 8, offset: const Offset(0, 2))])
                                : (isToday
                                    ? BoxDecoration(shape: BoxShape.circle, border: Border.all(color: _tA, width: 2))
                                    : null),
                            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                              Text('$d', style: TextStyle(
                                fontFamily: 'Satoshi', fontSize: 13,
                                fontWeight: (isSel || isEndpt || isToday) ? FontWeight.w900 : FontWeight.w600,
                                color: (isSel || isEndpt)
                                    ? Colors.white
                                    : disabled
                                        ? _ink3.withValues(alpha: .3)
                                        : isToday
                                            ? _tA
                                            : inRange
                                                ? _tA.withValues(alpha: .9)
                                                : isWknd
                                                    ? const Color(0xFFEF4444).withValues(alpha: .7)
                                                    : _ink)),
                              if (isToday && !(isSel || isEndpt))
                                Container(width: 4, height: 4,
                                  decoration: const BoxDecoration(color: _tA, shape: BoxShape.circle)),
                            ]),
                          )),
                        ),
                      ));
                    }),
                  ))),
                ),
              ),
            ),
          ),

          // ── Legend ────────────────────────────────────────────────────────
          if (widget.showLegend) Container(
            padding: const EdgeInsets.fromLTRB(14, 8, 14, 14),
            decoration: const BoxDecoration(border: Border(top: BorderSide(color: Color(0x08000000)))),
            child: Row(children: [
              _leg(dot: true,  label: 'Today'),
              const SizedBox(width: 14),
              _leg(gradient: true, label: 'Selected'),
              if (isRange) ...[const SizedBox(width: 14), _leg(range: true, label: 'Range')],
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _leg({bool dot = false, bool gradient = false, bool range = false, required String label}) =>
    Row(mainAxisSize: MainAxisSize.min, children: [
      if (dot) Container(width: 10, height: 10, decoration: const BoxDecoration(color: _tA, shape: BoxShape.circle))
      else if (gradient) Container(width: 18, height: 10,
        decoration: BoxDecoration(gradient: _tGrad, borderRadius: BorderRadius.circular(100)))
      else Container(width: 18, height: 10,
        decoration: BoxDecoration(color: _tSoft, borderRadius: BorderRadius.circular(100))),
      const SizedBox(width: 5),
      Text(label, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w700, color: _ink3)),
    ]);
}
