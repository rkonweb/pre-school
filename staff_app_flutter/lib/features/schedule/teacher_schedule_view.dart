import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import '../../core/state/auth_state.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/components/module_popup_shell.dart';

// ─── CSS var equivalents ──────────────────────────────────────────────────────
const _ink   = Color(0xFF140E28);
const _ink3  = Color(0xFF7B7291);
const _line  = Color(0x10140E28);
const _bg2   = Color(0xFFF5F3FF);
const _tA    = Color(0xFFFF5733);
const _tSoft = Color(0x14FF5733);

const _tGrad = LinearGradient(
  colors: [Color(0xFFFF5733), Color(0xFFFF006E), Color(0xFFC77DFF)],
  begin: Alignment.topLeft, end: Alignment.bottomRight,
);

// Subject color map (same logic as v13 ttColor function)
final _subjectColors = <String, _SubjectColor>{
  'Mathematics': _SubjectColor('#6366F1', '#EDE9FE', '#C4B5FD'),
  'Math':        _SubjectColor('#6366F1', '#EDE9FE', '#C4B5FD'),
  'Science':     _SubjectColor('#10B981', '#ECFDF5', '#6EE7B7'),
  'English':     _SubjectColor('#F59E0B', '#FEF9C3', '#FDE68A'),
  'History':     _SubjectColor('#EF4444', '#FEF2F2', '#FECACA'),
  'Physics':     _SubjectColor('#3B82F6', '#EFF6FF', '#BFDBFE'),
  'Chemistry':   _SubjectColor('#8B5CF6', '#F5F3FF', '#DDD6FE'),
  'Hindi':       _SubjectColor('#F97316', '#FFF7ED', '#FDBA74'),
  'Computer':    _SubjectColor('#0EA5E9', '#F0F9FF', '#BAE6FD'),
};

class _SubjectColor {
  final String bar, bg, fg;
  _SubjectColor(this.bar, this.bg, this.fg);
}

_SubjectColor _colorFor(String subject) {
  for (final k in _subjectColors.keys) {
    if (subject.toLowerCase().contains(k.toLowerCase())) return _subjectColors[k]!;
  }
  return _SubjectColor('#FF5733', '#FFF7F5', '#FF8C69');
}

Color _hexColor(String hex) {
  final h = hex.replaceFirst('#', '');
  return Color(int.parse('FF$h', radix: 16));
}

// ─── Data models ──────────────────────────────────────────────────────────────
class TTPeriod {
  final String start, end, subj, cls;
  final String? room, note;
  final int students, period;
  final bool isBreak;
  final String? breakLabel;

  const TTPeriod({
    required this.start, required this.end,
    required this.subj, required this.cls,
    this.room, this.note,
    required this.students, required this.period,
    this.isBreak = false, this.breakLabel,
  });

  bool get isFree => subj.toLowerCase().contains('free');

  int get durationMins => _mins(end) - _mins(start);
}

int _mins(String t) {
  if (t.isEmpty) return 0;
  final parts = t.split(':');
  return int.parse(parts[0]) * 60 + (parts.length > 1 ? int.parse(parts[1]) : 0);
}

String _fmtTime(String t) {
  if (t.isEmpty) return '';
  final parts = t.split(':');
  final h = int.parse(parts[0]);
  final m = parts.length > 1 ? int.parse(parts[1]) : 0;
  final suffix = h >= 12 ? 'PM' : 'AM';
  final h12 = h > 12 ? h - 12 : (h == 0 ? 12 : h);
  return '$h12:${m.toString().padLeft(2, '0')} $suffix';
}

// ─── Provider ─────────────────────────────────────────────────────────────────
final scheduleDataProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) return {};
  try {
    final res = await http.get(
      Uri.parse('http://localhost:3000/api/mobile/v1/staff/timetable'),
      headers: {'Authorization': 'Bearer ${user!.token}'},
    ).timeout(const Duration(seconds: 10));
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['success'] == true) return Map<String, dynamic>.from(data['data'] ?? {});
    }
  } catch (_) {}
  return {};
});

// ─── Parse API → day keyed period lists ───────────────────────────────────────
// API returns mySchedule with FULL day name keys: "Monday", "Tuesday", etc.
// We convert these to short keys: "mon", "tue", etc. so the UI day-tab logic works.
Map<String, List<TTPeriod>> _parseDays(Map<String, dynamic> data) {
  final result = <String, List<TTPeriod>>{};
  final mySchedule = (data['mySchedule'] as Map?)?.map((k, v) => MapEntry(k.toString(), v)) ?? {};

  for (final fullDayName in mySchedule.keys) {
    // Convert "Monday" → "mon", "Tuesday" → "tue", etc.
    final shortKey = _fullToKey(fullDayName);
    if (!_dayKeys.contains(shortKey)) continue; // skip Sat/Sun

    final rawPeriods = mySchedule[fullDayName] as List? ?? [];
    final out = <TTPeriod>[];
    int pNum = 1;
    TTPeriod? prev;

    for (final item in rawPeriods) {
      final m     = Map<String, dynamic>.from(item as Map);
      final type  = (m['type'] as String? ?? 'CLASS');
      final start = (m['startTime'] ?? m['start'] ?? '') as String;
      final end   = (m['endTime']   ?? m['end']   ?? '') as String;
      if (start.isEmpty) continue;

      if (type == 'BREAK') {
        // Break injected by the server — render directly
        final label = (m['subject'] as String? ?? 'Break');
        out.add(TTPeriod(
          start: start, end: end,
          subj: label, cls: '', students: 0, period: 0,
          isBreak: true, breakLabel: label,
        ));
        prev = out.last;
        continue;
      }

      // Inject gap-based break if server didn't send one
      if (prev != null && !prev.isBreak) {
        final gap = _mins(start) - _mins(prev.end);
        if (gap >= 10) {
          final label = gap >= 40 ? 'Lunch Break 🍱' : 'Short Break ☕';
          out.add(TTPeriod(
            start: prev.end, end: start,
            subj: label, cls: '', students: 0, period: 0,
            isBreak: true, breakLabel: label,
          ));
        }
      }

      final subj = ((m['subject'] ?? '') as String).trim();
      final cls  = ((m['className'] ?? m['class'] ?? '') as String).trim();
      final room = m['room'] as String?;
      final note = m['note'] as String?;
      final st   = (m['studentCount'] ?? m['students'] ?? 0) as int;

      out.add(TTPeriod(
        start: start, end: end,
        subj: subj.isEmpty ? 'Free Period' : subj,
        cls: cls, room: room, note: note,
        students: st, period: pNum++,
      ));
      prev = out.last;
    }
    result[shortKey] = out; // ← store under SHORT key ("mon", "tue", …)
  }
  return result;
}

// ─── Day/week helpers ─────────────────────────────────────────────────────────
const _dayKeys   = ['mon', 'tue', 'wed', 'thu', 'fri'];
const _dayShorts = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const _dayFulls  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Map full day name → short key
String _fullToKey(String full) {
  const map = {
    'Monday':'mon','Tuesday':'tue','Wednesday':'wed',
    'Thursday':'thu','Friday':'fri','Saturday':'sat','Sunday':'sun',
    'Mon':'mon','Tue':'tue','Wed':'wed','Thu':'thu','Fri':'fri',
    'mon':'mon','tue':'tue','wed':'wed','thu':'thu','fri':'fri',
  };
  return map[full] ?? full.toLowerCase().substring(0, 3);
}

String _todayKey() => _dayKeys[DateTime.now().weekday - 1];

enum _Status { live, done, upcoming, free }
_Status _status(TTPeriod p, String active) {
  if (p.isFree)  return _Status.free;
  final now      = DateTime.now();
  final cur      = now.hour * 60 + now.minute;
  final st       = _mins(p.start);
  final en       = _mins(p.end);
  final isToday  = active == _todayKey();
  final todayIdx = _dayKeys.indexOf(_todayKey());
  final actIdx   = _dayKeys.indexOf(active);
  if (isToday && cur >= st && cur < en)  return _Status.live;
  if (isToday && cur >= en)              return _Status.done;
  if (actIdx < todayIdx)                 return _Status.done;
  return _Status.upcoming;
}

// ─── Main screen ──────────────────────────────────────────────────────────────
class TeacherScheduleView extends ConsumerStatefulWidget {
  const TeacherScheduleView({super.key});
  @override
  ConsumerState<TeacherScheduleView> createState() => _TeacherScheduleViewState();
}

class _TeacherScheduleViewState extends ConsumerState<TeacherScheduleView> {
  String _active = _todayKey();

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(scheduleDataProvider);
    final data  = async.value ?? {};
    final days  = _parseDays(data);
    final cnt   = (days[_active] ?? []).where((p) => !p.isBreak && !p.isFree).length;
    final tIdx  = _dayKeys.indexOf(_active);
    final dayLabel = tIdx >= 0 ? _dayFulls[tIdx] : _active;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FB),
      body: Column(children: [
        // ── Standard Gradient Header ───────────────────────────────────────
        ModulePageHeader(
          title: 'My Timetable',
          icon: Icons.calendar_month_rounded,
          actionIcon: Icons.refresh_rounded,
          onActionIcon: () => ref.invalidate(scheduleDataProvider),
          bottomRows: [
            _DayPillSelector(
              active: _active,
              async: async,
              onDaySwitch: (d) => setState(() => _active = d),
            ),
            const SizedBox(height: 16),
          ],
        ),
        // ── Body ──────────────────────────────────────────────────────────
        Expanded(child: _PeriodsBody(
          active: _active, async: async,
          onDaySwitch: (d) => setState(() => _active = d),
        )),
      ]),
    );
  }
}

// ─── Gradient Header (exactly as v13 HTML) ────────────────────────────────────
class _Header extends StatelessWidget {
  final String active;
  final AsyncValue<Map<String, dynamic>> async;
  final void Function(String) onDaySwitch;
  const _Header({required this.active, required this.async, required this.onDaySwitch});

  @override
  Widget build(BuildContext context) {
    final data  = async.value ?? {};
    final days  = _parseDays(data);
    final today = days[active] ?? [];
    final cnt   = today.where((p) => !p.isBreak && !p.isFree).length;
    final tIdx  = _dayKeys.indexOf(active);
    final dayFull = tIdx >= 0 ? _dayFulls[tIdx] : active;

    return Container(
      decoration: const BoxDecoration(gradient: _tGrad),
      child: SafeArea(bottom: false, child: Column(children: [
        // ── Top row ──────────────────────────────────────────────────────────
        Padding(padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
          child: Row(children: [
            // Back button
            GestureDetector(
              onTap: () { HapticFeedback.lightImpact(); context.pop(); },
              child: Container(width: 32, height: 32,
                decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.chevron_left_rounded, color: Colors.white, size: 20)),
            ),
            const SizedBox(width: 10),
            // Title + date
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('My Timetable', style: TextStyle(
                fontFamily: 'Clash Display', fontSize: 17, fontWeight: FontWeight.w900,
                color: Colors.white, letterSpacing: -0.3)),
              Text(dayFull, style: const TextStyle(
                fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w600,
                color: Color(0xBFFFFFFF))),
            ])),
            // Period count (right aligned like v13)
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text('$cnt', style: const TextStyle(
                fontFamily: 'Cabinet Grotesk', fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white, height: 1)),
              const Text('periods', style: TextStyle(
                fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w700,
                color: Color(0xB3FFFFFF), letterSpacing: 0.3)),
            ]),
          ])),

        // ── Week mini-grid ────────────────────────────────────────────────────
        Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
          child: Container(
            padding: const EdgeInsets.fromLTRB(10, 10, 10, 8),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.12), borderRadius: BorderRadius.circular(14)),
            child: Row(
              children: _dayKeys.asMap().entries.map((e) {
                final dk  = e.key;
                final day = e.value;
                final isCur = day == active;
                final pds   = (days[day] ?? []).where((p) => !p.isBreak && !p.isFree).toList();
                return Expanded(child: GestureDetector(
                  onTap: () => onDaySwitch(day),
                  child: Column(children: [
                    Text(_dayShorts[dk], style: TextStyle(
                      fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w800,
                      color: isCur ? Colors.white : Colors.white.withOpacity(0.6))),
                    const SizedBox(height: 4),
                    Column(children: pds.take(6).map((p) {
                      final c = _colorFor(p.subj);
                      return Container(
                        height: 5, margin: const EdgeInsets.only(bottom: 2),
                        decoration: BoxDecoration(
                          color: isCur ? _hexColor(c.bar) : Colors.white.withOpacity(0.4),
                          borderRadius: BorderRadius.circular(3)),
                      );
                    }).toList()),
                    if (pds.isEmpty)
                      Container(height: 5, decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(3))),
                    // Dot indicator for selected day
                    if (isCur)
                      Container(margin: const EdgeInsets.only(top: 4), width: 4, height: 4,
                        decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle)),
                  ]),
                ));
              }).toList(),
            ))),
      ])),
    );
  }
}
// ─── Day Pill Selector ────────────────────────────────────────────────────────
class _DayPillSelector extends StatelessWidget {
  final String active;
  final AsyncValue<Map<String, dynamic>> async;
  final void Function(String) onDaySwitch;
  const _DayPillSelector({required this.active, required this.async, required this.onDaySwitch});

  @override
  Widget build(BuildContext context) {
    final data = async.value ?? {};
    final days = _parseDays(data);
    final todayKey = _todayKey();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
      child: Row(
        children: _dayKeys.asMap().entries.map((e) {
          final dk     = e.key;
          final day    = e.value;
          final isCur  = day == active;
          final isToday = day == todayKey;
          final cnt    = (days[day] ?? []).where((p) => !p.isBreak && !p.isFree).length;

          return Expanded(child: GestureDetector(
            onTap: () {
              HapticFeedback.selectionClick();
              onDaySwitch(day);
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeInOut,
              margin: const EdgeInsets.symmetric(horizontal: 3),
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                color: isCur ? Colors.white : Colors.white.withOpacity(0.08),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isCur ? Colors.white : Colors.white.withOpacity(0.15),
                  width: 1.5,
                ),
                boxShadow: isCur ? [
                  BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4)),
                ] : [],
              ),
              child: Column(children: [
                Text(_dayShorts[dk], style: TextStyle(
                  fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w800,
                  color: isCur ? _tA : Colors.white.withOpacity(0.55))),
                const SizedBox(height: 4),
                Text('$cnt', style: TextStyle(
                  fontFamily: 'Cabinet Grotesk', fontSize: 15, fontWeight: FontWeight.w900,
                  color: isCur ? _ink : Colors.white.withOpacity(0.7), height: 1)),
                const SizedBox(height: 2),
                if (isToday)
                  Container(
                    width: 4, height: 4,
                    decoration: BoxDecoration(
                      color: isCur ? _tA : Colors.white.withOpacity(0.4),
                      shape: BoxShape.circle,
                    ),
                  ),
              ]),
            ),
          ));
        }).toList(),
      ),
    );
  }
}

// ─── Period list body ─────────────────────────────────────────────────────────
class _PeriodsBody extends StatelessWidget {
  final String active;
  final AsyncValue<Map<String, dynamic>> async;
  final void Function(String) onDaySwitch;
  const _PeriodsBody({required this.active, required this.async, required this.onDaySwitch});

  @override
  Widget build(BuildContext context) {
    return async.when(
      loading: () => const Center(child: CircularProgressIndicator(color: _tA, strokeWidth: 2)),
      error: (_, __) => _buildError(context),
      data: (data) {
        final days    = _parseDays(data);
        final periods = days[active] ?? [];
        if (periods.isEmpty) return _buildEmpty();
        return ListView.builder(
          padding: const EdgeInsets.fromLTRB(14, 14, 14, 30),
          itemCount: periods.length + 1, // +1 for week overview card
          itemBuilder: (_, i) {
            if (i == periods.length) return _WeekOverview(days: days, active: active, onSwitch: onDaySwitch);
            final p = periods[i];
            if (p.isBreak) return _BreakRow(p: p);
            return _PeriodRow(p: p, active: active);
          },
        );
      },
    );
  }

  Widget _buildEmpty() => Center(child: Padding(
    padding: const EdgeInsets.all(40),
    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      Container(width: 64, height: 64,
        decoration: BoxDecoration(gradient: _tGrad, borderRadius: BorderRadius.circular(20)),
        child: const Icon(Icons.calendar_today_rounded, color: Colors.white, size: 28)),
      const SizedBox(height: 16),
      const Text('No Classes', style: TextStyle(fontFamily: 'Cabinet Grotesk',
          fontSize: 16, fontWeight: FontWeight.w800, color: _ink)),
      const SizedBox(height: 6),
      const Text('No periods assigned for this day.', style: TextStyle(
          fontFamily: 'Satoshi', fontSize: 12, color: _ink3)),
    ]),
  ));

  Widget _buildError(BuildContext context) {
    final ref = InheritedWidgetRef.of(context);
    return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      const Icon(Icons.wifi_off_rounded, size: 40, color: _ink3),
      const SizedBox(height: 12),
      const Text('Could not load timetable', style: TextStyle(color: _ink3, fontFamily: 'Satoshi')),
      const SizedBox(height: 12),
      GestureDetector(
        onTap: () {
          if (ref != null) ref.invalidate(scheduleDataProvider);
        },
        child: Container(padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
          decoration: BoxDecoration(color: _tSoft, borderRadius: BorderRadius.circular(10)),
          child: const Text('Retry', style: TextStyle(color: _tA, fontWeight: FontWeight.w800, fontFamily: 'Satoshi')))),
    ]));
  }
}

// Need a way to access ref from stateless context — use ConsumerWidget pattern
class _PeriodsBodyWrapper extends ConsumerWidget {
  final Widget Function(WidgetRef) builder;
  const _PeriodsBodyWrapper({required this.builder});
  @override
  Widget build(BuildContext context, WidgetRef ref) => builder(ref);
}

// ─── Period Row (exactly v13 layout: time column + card) ──────────────────────
class _PeriodRow extends ConsumerWidget {
  final TTPeriod p;
  final String active;
  const _PeriodRow({required this.p, required this.active});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status   = _status(p, active);
    final isLive   = status == _Status.live;
    final isDone   = status == _Status.done;
    final isFree   = status == _Status.free;
    final c        = _colorFor(p.subj);
    final barColor = _hexColor(c.bar);

    // Live progress
    final now    = DateTime.now();
    final curMin = now.hour * 60 + now.minute;
    final pct    = isLive
        ? ((curMin - _mins(p.start)) / (p.durationMins) * 100).clamp(0.0, 100.0)
        : 0.0;
    final minsLeft = isLive ? _mins(p.end) - curMin : 0;

    return Opacity(
      opacity: isDone ? 0.55 : 1.0,
      child: IntrinsicHeight(
        child: Row(crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Time column (42px, like v13) ──────────────────────────────────
          SizedBox(width: 42, child: Column(children: [
            Text(p.start, style: TextStyle(
              fontFamily: 'Satoshi', fontSize: 10,
              fontWeight: isLive ? FontWeight.w900 : FontWeight.w700,
              color: isLive ? _tA : _ink3)),
            Expanded(child: Container(
              margin: const EdgeInsets.symmetric(vertical: 3),
              width: 2,
              color: isLive ? _tA.withOpacity(0.7) : (isDone ? const Color(0xFFD1FAE5) : _line),
            )),
            Text(p.end, style: TextStyle(
              fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w600,
              color: isLive ? _tA : _ink3)),
          ])),
          const SizedBox(width: 10),
          // ── Period card ────────────────────────────────────────────────────
          Expanded(child: Container(
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isLive ? _tA : const Color(0x0F000000),
                width: isLive ? 2 : 1.5),
              boxShadow: isLive
                  ? [BoxShadow(color: _tA.withOpacity(0.18), blurRadius: 20, offset: const Offset(0, 4))]
                  : [const BoxShadow(color: Color(0x0A000000), blurRadius: 6, offset: Offset(0, 1))],
            ),
            child: Padding(padding: const EdgeInsets.all(12), child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Colour strip at top
                Container(height: 3, margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(
                    color: isFree ? null : barColor,
                    gradient: isFree ? const LinearGradient(colors: [Color(0xFFA855F7), Color(0xFF818CF8)]) : null,
                    borderRadius: BorderRadius.circular(100))),

                // Subject + badge row
                Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(p.subj, style: TextStyle(
                      fontFamily: 'Satoshi', fontSize: 13,
                      fontWeight: isLive ? FontWeight.w900 : FontWeight.w800,
                      color: isFree ? const Color(0xFF7C3AED) : _ink)),
                    const SizedBox(height: 2),
                    Text(
                      [p.cls, if (p.room != null && p.room!.isNotEmpty && p.room != '—') p.room!].join(' · '),
                      style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink3)),
                  ])),
                  const SizedBox(width: 8),
                  _StatusBadge(status: status),
                ]),

                // Note
                if (p.note != null && p.note!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(
                      color: _hexColor(c.bg),
                      borderRadius: BorderRadius.circular(8)),
                    child: Text('📌 ${p.note}', style: TextStyle(
                      fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w700,
                      color: _hexColor(c.fg)))),
                ],

                // Live progress bar
                if (isLive) ...[
                  const SizedBox(height: 8),
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    const Text('Period progress', style: TextStyle(fontFamily: 'Satoshi', fontSize: 9, color: _ink3, fontWeight: FontWeight.w600)),
                    Text('$minsLeft min left', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w900, color: _tA)),
                  ]),
                  const SizedBox(height: 3),
                  Container(height: 5, decoration: BoxDecoration(color: _bg2, borderRadius: BorderRadius.circular(100)),
                    child: FractionallySizedBox(
                      widthFactor: pct / 100,
                      alignment: Alignment.centerLeft,
                      child: Container(decoration: BoxDecoration(gradient: _tGrad, borderRadius: BorderRadius.circular(100))))),
                ],

                // Meta row  ⏱ 45 min · P1 · 42 students
                const SizedBox(height: 8),
                Row(children: [
                  Text('⏱ ${p.durationMins} min', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink3)),
                  const Text(' · ', style: TextStyle(fontSize: 10, color: _ink3)),
                  Text('P${p.period}', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink3)),
                  if (p.students > 0) ...[
                    const Text(' · ', style: TextStyle(fontSize: 10, color: _ink3)),
                    Text('${p.students} students', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink3)),
                  ],
                ]),

                // Action buttons on live period
                if (isLive) ...[
                  const SizedBox(height: 10),
                  Row(children: [
                    Expanded(child: GestureDetector(
                      onTap: () { HapticFeedback.lightImpact(); context.push('/attendance'); },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 7),
                        decoration: BoxDecoration(gradient: _tGrad, borderRadius: BorderRadius.circular(10)),
                        child: const Center(child: Text('Mark Attendance',
                          style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white)))),
                    )),
                    const SizedBox(width: 7),
                    Expanded(child: GestureDetector(
                      onTap: () { HapticFeedback.lightImpact(); context.push('/homework'); },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 7),
                        decoration: BoxDecoration(
                          color: _tSoft,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: _tA.withOpacity(0.3), width: 1.5)),
                        child: const Center(child: Text('Set Homework',
                          style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w800, color: _tA)))),
                    )),
                  ]),
                ],

                // Set Reminder for upcoming
                if (!isLive && !isDone && !isFree) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      color: _bg2,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: _line)),
                    child: const Text('⏰ Set Reminder',
                      style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w700, color: _ink3))),
                ],
              ],
            )),
          )),
        ],
      ),   // Row
      ),   // IntrinsicHeight
    );
  }
}

// ─── Status badge ─────────────────────────────────────────────────────────────
class _StatusBadge extends StatelessWidget {
  final _Status status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    switch (status) {
      case _Status.live:
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
          decoration: BoxDecoration(
            color: _tSoft, borderRadius: BorderRadius.circular(100),
            border: Border.all(color: _tA.withOpacity(0.3), width: 1.5)),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Container(width: 5, height: 5, decoration: const BoxDecoration(color: _tA, shape: BoxShape.circle)),
            const SizedBox(width: 4),
            const Text('LIVE', style: TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w800, color: _tA)),
          ]));
      case _Status.done:
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
          decoration: BoxDecoration(color: const Color(0xFFD1FAE5), borderRadius: BorderRadius.circular(100)),
          child: const Text('DONE ✓', style: TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF059669))));
      case _Status.free:
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
          decoration: BoxDecoration(color: const Color(0xFFEDE9FE), borderRadius: BorderRadius.circular(100)),
          child: const Text('FREE', style: TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF7C3AED))));
      case _Status.upcoming:
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
          decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(100)),
          child: const Text('UPCOMING', style: TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFFD97706))));
    }
  }
}

// ─── Break Row ────────────────────────────────────────────────────────────────
class _BreakRow extends StatelessWidget {
  final TTPeriod p;
  const _BreakRow({required this.p});

  @override
  Widget build(BuildContext context) {
    final isLunch = (p.breakLabel ?? '').toLowerCase().contains('lunch');
    return Padding(
      padding: const EdgeInsets.only(left: 52, bottom: 10),
      child: Row(children: [
        Expanded(child: Container(height: 1, color: const Color(0xFFE2E8F0))),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: isLunch ? const Color(0xFFFEF9C3) : const Color(0xFFF0F9FF),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isLunch ? const Color(0xFFFDE68A) : const Color(0xFFBAE6FD),
            ),
          ),
          child: Text(p.breakLabel ?? 'Break',
            style: TextStyle(
              fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w800,
              color: isLunch ? const Color(0xFFB45309) : const Color(0xFF0369A1),
            )),
        ),
        const SizedBox(width: 8),
        Expanded(child: Container(height: 1, color: const Color(0xFFE2E8F0))),
      ]),
    );
  }
}

// ─── Week Overview card (bottom of list) ─────────────────────────────────────
class _WeekOverview extends StatelessWidget {
  final Map<String, List<TTPeriod>> days;
  final String active;
  final void Function(String) onSwitch;
  const _WeekOverview({required this.days, required this.active, required this.onSwitch});

  @override
  Widget build(BuildContext context) {
    final totalPeriods = _dayKeys.fold(0, (acc, d) =>
        acc + (days[d] ?? []).where((p) => !p.isBreak && !p.isFree).length);
    final totalHrs    = (totalPeriods * 45 / 60).round();
    final classCount  = _dayKeys.fold(<String>{}, (acc, d) {
      for (final p in (days[d] ?? [])) {
        if (!p.isBreak && !p.isFree && p.cls.isNotEmpty) acc.add(p.cls);
      }
      return acc;
    }).length;

    return Container(
      margin: const EdgeInsets.only(top: 6),
      decoration: BoxDecoration(
        gradient: AppTheme.teacherTheme,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [BoxShadow(color: const Color(0xFFFF5733).withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 6))],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(
              width: 28, height: 28,
              decoration: BoxDecoration(color: Colors.white.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.bar_chart_rounded, size: 16, color: Colors.white),
            ),
            const SizedBox(width: 10),
            const Text('Week Overview',
              style: TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white)),
          ]),
          const SizedBox(height: 14),
          // Bar chart per day
          Row(children: _dayKeys.asMap().entries.map((e) {
            final dk   = e.key;
            final day  = e.value;
            final cnt  = (days[day] ?? []).where((p) => !p.isBreak && !p.isFree).length;
            final isCur = day == active;
            final pct  = cnt == 0 ? 0.04 : (cnt / 6).clamp(0.0, 1.0);
            return Expanded(child: GestureDetector(
              onTap: () => onSwitch(day),
              child: Column(children: [
                Text(_dayShorts[dk], style: TextStyle(
                  fontFamily: 'Satoshi', fontSize: 9,
                  fontWeight: isCur ? FontWeight.w900 : FontWeight.w700,
                  color: isCur ? Colors.white : Colors.white.withOpacity(0.4))),
                const SizedBox(height: 6),
                Container(
                  width: double.infinity, height: 44,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  clipBehavior: Clip.hardEdge,
                  child: Align(
                    alignment: Alignment.bottomCenter,
                    child: FractionallySizedBox(
                      heightFactor: pct,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: isCur
                              ? const LinearGradient(
                                  colors: [Color(0xFFFF5733), Color(0xFFFF006E), Color(0xFFC77DFF)],
                                  begin: Alignment.topCenter, end: Alignment.bottomCenter)
                              : LinearGradient(
                                  colors: [Colors.white.withOpacity(0.4), Colors.white.withOpacity(0.15)],
                                  begin: Alignment.topCenter, end: Alignment.bottomCenter),
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 5),
                Text('$cnt', style: TextStyle(
                  fontFamily: 'Cabinet Grotesk', fontSize: 13,
                  fontWeight: isCur ? FontWeight.w900 : FontWeight.w700,
                  color: isCur ? Colors.white : Colors.white.withOpacity(0.5))),
              ]),
            ));
          }).toList()),
          const SizedBox(height: 16),
          // Stat chips row
          Row(children: [
            _StatChip('$totalPeriods', 'Periods', const Color(0xFFFF5733)),
            const SizedBox(width: 8),
            _StatChip('${totalHrs}h', 'Teaching', const Color(0xFF10B981)),
            const SizedBox(width: 8),
            _StatChip('$classCount', 'Classes', const Color(0xFF6366F1)),
          ]),
        ]),
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String value, label;
  final Color color;
  const _StatChip(this.value, this.label, this.color);

  @override
  Widget build(BuildContext context) => Expanded(child: Container(
    padding: const EdgeInsets.symmetric(vertical: 10),
    decoration: BoxDecoration(
      color: color.withOpacity(0.15),
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: color.withOpacity(0.25)),
    ),
    child: Column(children: [
      Text(value, style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white, height: 1)),
      const SizedBox(height: 3),
      Text(label, style: TextStyle(fontFamily: 'Satoshi', fontSize: 8, fontWeight: FontWeight.w700, color: Colors.white.withOpacity(0.5), letterSpacing: 0.5)),
    ]),
  ));
}

// Trick to access WidgetRef from Stateless widget
class InheritedWidgetRef extends InheritedWidget {
  final WidgetRef ref;
  const InheritedWidgetRef({super.key, required this.ref, required super.child});
  static WidgetRef? of(BuildContext ctx) => ctx.dependOnInheritedWidgetOfExactType<InheritedWidgetRef>()?.ref;
  @override bool updateShouldNotify(_) => false;
}
