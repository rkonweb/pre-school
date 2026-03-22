import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/state/auth_state.dart';
import '../../shared/components/module_popup_shell.dart';

// ─── Design tokens ──────────────────────────────────────────────────────────
const _bg        = Color(0xFFF0F4FF);
const _ink       = Color(0xFF1E1B4B);
const _sub       = Color(0xFF6B7280);
const _present   = Color(0xFF059669);
const _half      = Color(0xFFD97706);
const _holiday   = Color(0xFFDC2626);
const _indigo    = Color(0xFF6366F1);
const _grad = LinearGradient(
  colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
  begin: Alignment.topLeft, end: Alignment.bottomRight,
);

// ─── Model ──────────────────────────────────────────────────────────────────
class _Holiday {
  final String id, name, type;
  final DateTime date;
  final bool isHoliday;
  _Holiday({required this.id,required this.name,required this.type,required this.date,required this.isHoliday});
  factory _Holiday.fromJson(Map j) => _Holiday(
    id: j['id'] ?? '', name: j['name'] ?? '', type: j['type'] ?? 'HOLIDAY',
    date: DateTime.tryParse(j['date'] ?? '') ?? DateTime.now(),
    isHoliday: j['isHoliday'] != false,
  );
}

class _DayStatus {
  final String status;
  final DateTime date;
  _DayStatus({required this.status, required this.date});
  factory _DayStatus.fromJson(Map j) => _DayStatus(
    status: j['status'] ?? 'WORKING',
    date: DateTime.tryParse(j['date'] ?? '') ?? DateTime.now(),
  );
}

class _Note {
  final String id, title, note, color;
  final DateTime date;
  _Note({required this.id,required this.title,required this.note,required this.color,required this.date});
  factory _Note.fromJson(Map j) => _Note(
    id: j['id']??'', title: j['title']??'', note: j['note']??'', color: j['color']??'#6366F1',
    date: DateTime.tryParse(j['date']??'')??DateTime.now(),
  );
}

class _CalendarData {
  final String schoolTimings;
  final int academicStartMonth;
  final List<_Holiday> holidays;
  final Map<String, String> statusMap;   // 'YYYY-MM-DD' → status string
  final Map<String, _Holiday> holidayMap;// 'YYYY-MM-DD' → holiday
  final Map<String, List<_Note>> noteMap;// 'YYYY-MM-DD' → notes
  _CalendarData({required this.schoolTimings,required this.academicStartMonth,required this.holidays,required this.statusMap,required this.holidayMap,required this.noteMap});
}

// ─── Provider ───────────────────────────────────────────────────────────────
final calendarDataProvider = FutureProvider.autoDispose<_CalendarData>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) throw Exception('Not logged in');

  final res = await http.get(
    Uri.parse('http://localhost:3000/api/mobile/v1/staff/calendar'),
    headers: {'Authorization': 'Bearer ${user!.token}'},
  ).timeout(const Duration(seconds: 15));

  if (res.statusCode != 200) throw Exception('Failed to load calendar');
  final body = jsonDecode(res.body);
  if (!(body['success'] as bool)) throw Exception(body['error'] ?? 'Error');

  final d = body['data'] as Map;
  final holidays = (d['holidays'] as List).map((h) => _Holiday.fromJson(h)).toList();
  final dayStatuses = (d['dayStatuses'] as List).map((s) => _DayStatus.fromJson(s)).toList();
  final notes = (d['notes'] as List).map((n) => _Note.fromJson(n)).toList();

  String _key(DateTime dt) =>
    '${dt.year}-${dt.month.toString().padLeft(2,'0')}-${dt.day.toString().padLeft(2,'0')}';

  final statusMap = <String, String>{};
  for (final s in dayStatuses) { statusMap[_key(s.date)] = s.status; }

  final holidayMap = <String, _Holiday>{};
  for (final h in holidays) { holidayMap[_key(h.date)] = h; }

  final noteMap = <String, List<_Note>>{};
  for (final n in notes) {
    final k = _key(n.date);
    noteMap.putIfAbsent(k, () => []).add(n);
  }

  return _CalendarData(
    schoolTimings: d['schoolTimings'] ?? '9:00 AM - 3:00 PM',
    academicStartMonth: (d['academicYearStartMonth'] as num?)?.toInt() ?? 4,
    holidays: holidays, statusMap: statusMap, holidayMap: holidayMap, noteMap: noteMap,
  );
});

// ─── View ────────────────────────────────────────────────────────────────────
class TeacherCalendarView extends ConsumerStatefulWidget {
  const TeacherCalendarView({super.key});
  @override
  ConsumerState<TeacherCalendarView> createState() => _TeacherCalendarViewState();
}

class _TeacherCalendarViewState extends ConsumerState<TeacherCalendarView> {
  late int _viewMonth;
  late int _viewYear;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _viewMonth = now.month;
    _viewYear  = now.year;
  }

  void _prevMonth() => setState(() {
    if (_viewMonth == 1) { _viewMonth = 12; _viewYear--; } else _viewMonth--;
  });

  void _nextMonth() => setState(() {
    if (_viewMonth == 12) { _viewMonth = 1; _viewYear++; } else _viewMonth++;
  });

  String _key(int y, int m, int d) =>
    '$y-${m.toString().padLeft(2,'0')}-${d.toString().padLeft(2,'0')}';

  @override
  Widget build(BuildContext context) {
    final calAsync = ref.watch(calendarDataProvider);

    return ModulePopupShell(
      title: 'School Calendar',
      icon: Icons.calendar_month_rounded,
      backgroundColor: _bg,
      body: calAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: _indigo)),
        error: (e, _) => Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.error_outline_rounded, color: _holiday, size: 40),
            const SizedBox(height: 12),
            Text('Failed to load calendar', style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700, color: _sub)),
            const SizedBox(height: 10),
            TextButton(onPressed: () => ref.invalidate(calendarDataProvider), child: const Text('Retry')),
          ]),
        ),
        data: (data) => _buildContent(data),
      ),
    );
  }

  Widget _buildContent(_CalendarData data) {
    final now = DateTime.now();
    final daysInMonth = DateTime(_viewYear, _viewMonth + 1, 0).day;
    final firstWeekday = DateTime(_viewYear, _viewMonth, 1).weekday; // 1=Mon

    // Stats for current view
    int workCount = 0, holidayCount = 0, halfCount = 0;
    for (int d = 1; d <= daysInMonth; d++) {
      final k = _key(_viewYear, _viewMonth, d);
      final hol = data.holidayMap[k];
      final effectiveStatus = (hol != null && hol.isHoliday && (hol.type == 'HOLIDAY' || hol.type == 'RESTRICTED'))
          ? 'HOLIDAY' : (data.statusMap[k] ?? 'WORKING');
      if (effectiveStatus == 'HOLIDAY') holidayCount++;
      else if (effectiveStatus == 'HALFDAY') halfCount++;
      else workCount++;
    }

    final monthNames = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

        // ── Timings banner ───────────────────────────────────────────────
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE5E7EB)),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0,2))],
          ),
          child: Row(children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(gradient: _grad, borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.access_time_rounded, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 12),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('School Timings', style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w800, fontSize: 12, color: _ink)),
              Text(data.schoolTimings, style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w600, fontSize: 13, color: _sub)),
            ]),
          ]),
        ),
        const SizedBox(height: 12),

        // ── Month stats chips ────────────────────────────────────────────
        Row(children: [
          _statChip('$workCount', 'Working', _present),
          const SizedBox(width: 8),
          _statChip('$halfCount', 'Half-day', _half),
          const SizedBox(width: 8),
          _statChip('$holidayCount', 'Holidays', _holiday),
        ]),
        const SizedBox(height: 14),

        // ── Calendar card ────────────────────────────────────────────────
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 16, offset: const Offset(0,4))],
          ),
          child: Column(children: [

            // Header with gradient + navigation
            Container(
              decoration: const BoxDecoration(
                gradient: _grad,
                borderRadius: BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20)),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(children: [
                GestureDetector(
                  onTap: _prevMonth,
                  child: Container(
                    width: 34, height: 34,
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.chevron_left_rounded, color: Colors.white, size: 20),
                  ),
                ),
                Expanded(
                  child: Column(children: [
                    Text(
                      '${monthNames[_viewMonth]} $_viewYear',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontFamily: 'Cabinet Grotesk', fontWeight: FontWeight.w800, fontSize: 17, color: Colors.white),
                    ),
                    if (_viewMonth == now.month && _viewYear == now.year)
                      Container(
                        margin: const EdgeInsets.only(top: 4),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(color: Colors.white.withOpacity(0.25), borderRadius: BorderRadius.circular(20)),
                        child: const Text('This Month', style: TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white)),
                      ),
                  ]),
                ),
                GestureDetector(
                  onTap: _nextMonth,
                  child: Container(
                    width: 34, height: 34,
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.chevron_right_rounded, color: Colors.white, size: 20),
                  ),
                ),
              ]),
            ),

            // Weekday headers
            Padding(
              padding: const EdgeInsets.only(top: 12, left: 8, right: 8),
              child: Row(
                children: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) =>
                  Expanded(
                    child: Text(d, textAlign: TextAlign.center,
                      style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700, fontSize: 10,
                        color: d == 'Sun' ? _holiday : _sub)),
                  )
                ).toList(),
              ),
            ),
            const SizedBox(height: 8),

            // Day grid
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: GridView.builder(
                shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 7, mainAxisSpacing: 4, crossAxisSpacing: 4),
                itemCount: (firstWeekday - 1) + daysInMonth,
                itemBuilder: (_, i) {
                  if (i < firstWeekday - 1) return const SizedBox.shrink();
                  final day = i - (firstWeekday - 1) + 1;
                  final k = _key(_viewYear, _viewMonth, day);
                  final hol = data.holidayMap[k];
                  final notes = data.noteMap[k] ?? [];
                  final isToday = day == now.day && _viewMonth == now.month && _viewYear == now.year;

                  final effectiveStatus = (hol != null && hol.isHoliday && (hol.type == 'HOLIDAY' || hol.type == 'RESTRICTED'))
                      ? 'HOLIDAY' : (data.statusMap[k] ?? 'WORKING');

                  final Color dayColor = effectiveStatus == 'HOLIDAY' ? _holiday
                    : effectiveStatus == 'HALFDAY' ? _half : _present;
                  final Color dayBg = effectiveStatus == 'HOLIDAY' ? const Color(0xFFFEE2E2)
                    : effectiveStatus == 'HALFDAY' ? const Color(0xFFFEF3C7) : Colors.white;

                  return _DayCell(
                    day: day, isToday: isToday,
                    color: dayColor, bg: dayBg,
                    hasHoliday: hol != null,
                    hasNote: notes.isNotEmpty,
                    holidayName: hol?.name,
                    isHolidayType: hol?.type == 'HOLIDAY' || hol?.type == 'RESTRICTED',
                  );
                },
              ),
            ),
            const SizedBox(height: 14),

            // Legend
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                _legendDot('Working', _present),
                const SizedBox(width: 12),
                _legendDot('Half-day', _half),
                const SizedBox(width: 12),
                _legendDot('Holiday', _holiday),
                const SizedBox(width: 12),
                _legendDot('Has notes', _indigo),
              ]),
            ),
            const SizedBox(height: 14),
          ]),
        ),

        const SizedBox(height: 20),

        // ── Holidays list ────────────────────────────────────────────────
        _buildHolidaySection(data.holidays),
      ]),
    );
  }

  Widget _statChip(String value, String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(children: [
          Text(value, style: TextStyle(fontFamily: 'Cabinet Grotesk', fontWeight: FontWeight.w800, fontSize: 18, color: color)),
          Text(label, style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w600, fontSize: 9, color: color.withOpacity(0.8))),
        ]),
      ),
    );
  }

  Widget _legendDot(String label, Color color) {
    return Row(children: [
      Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
      const SizedBox(width: 4),
      Text(label, style: TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w600, color: _sub)),
    ]);
  }

  Widget _buildHolidaySection(List<_Holiday> holidays) {
    if (holidays.isEmpty) return const SizedBox.shrink();

    final monthHolidays = holidays.where((h) =>
      h.date.month == _viewMonth && h.date.year == _viewYear
    ).toList();

    final typeColor = {
      'HOLIDAY': _holiday,
      'RESTRICTED': _half,
      'EVENT': _indigo,
    };
    final typeLabel = {
      'HOLIDAY': 'Public Holiday',
      'RESTRICTED': 'Restricted',
      'EVENT': 'School Event',
    };

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        const Icon(Icons.star_rounded, color: _holiday, size: 16),
        const SizedBox(width: 6),
        Text(
          monthHolidays.isEmpty ? 'All Holidays (${holidays.length})' : 'This Month (${monthHolidays.length})',
          style: const TextStyle(fontFamily: 'Cabinet Grotesk', fontWeight: FontWeight.w800, fontSize: 15, color: _ink),
        ),
      ]),
      const SizedBox(height: 10),
      ...( monthHolidays.isEmpty ? holidays : monthHolidays ).map((h) {
        final color = typeColor[h.type] ?? _indigo;
        final label = typeLabel[h.type] ?? h.type;
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: color.withOpacity(0.2)),
          ),
          child: Row(children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Text('${h.date.day}', style: TextStyle(fontFamily: 'Cabinet Grotesk', fontWeight: FontWeight.w900, fontSize: 14, color: color, height: 1)),
                Text(
                  ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][h.date.month],
                  style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700, fontSize: 8, color: color),
                ),
              ]),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(h.name, style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700, fontSize: 13, color: _ink)),
              const SizedBox(height: 2),
              Row(children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                  child: Text(label, style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700, fontSize: 9, color: color)),
                ),
                const SizedBox(width: 6),
                Text(
                  ['','Mon','Tue','Wed','Thu','Fri','Sat','Sun'][h.date.weekday],
                  style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _sub),
                ),
                if (!h.isHoliday) ...[
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                    decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(4)),
                    child: const Text('Working day', style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700, fontSize: 8, color: _half)),
                  ),
                ],
              ]),
            ])),
          ]),
        );
      }),
    ]);
  }
}

// ─── Day cell widget ─────────────────────────────────────────────────────────
class _DayCell extends StatelessWidget {
  final int day;
  final bool isToday, hasHoliday, hasNote, isHolidayType;
  final Color color, bg;
  final String? holidayName;
  const _DayCell({required this.day,required this.isToday,required this.color,required this.bg,required this.hasHoliday,required this.hasNote,this.holidayName,required this.isHolidayType});

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: holidayName ?? '',
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: isToday ? color : bg,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isToday ? color : color.withOpacity(0.25),
            width: isToday ? 2 : 1,
          ),
          boxShadow: isToday ? [BoxShadow(color: color.withOpacity(0.3), blurRadius: 6, offset: const Offset(0,2))] : null,
        ),
        child: Stack(children: [
          Center(
            child: Text(
              '$day',
              style: TextStyle(
                fontFamily: 'Satoshi',
                fontWeight: FontWeight.w800,
                fontSize: 13,
                color: isToday ? Colors.white : color,
              ),
            ),
          ),
          // Dot indicators at bottom
          if (hasHoliday || hasNote)
            Positioned(
              bottom: 3, left: 0, right: 0,
              child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                if (hasHoliday) Container(width: 4, height: 4, decoration: BoxDecoration(
                  color: isToday ? Colors.white70 : color, shape: BoxShape.circle)),
                if (hasHoliday && hasNote) const SizedBox(width: 2),
                if (hasNote && !hasHoliday) Container(width: 4, height: 4, decoration: BoxDecoration(
                  color: isToday ? Colors.white70 : const Color(0xFF8B5CF6), shape: BoxShape.circle)),
              ]),
            ),
        ]),
      ),
    );
  }
}
