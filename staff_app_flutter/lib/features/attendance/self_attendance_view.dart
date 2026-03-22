import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import 'package:local_auth/local_auth.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:staff_app_flutter/core/theme/app_theme.dart';
import 'package:staff_app_flutter/core/state/auth_state.dart';
import '../../shared/components/module_popup_shell.dart';

// ─── Design Tokens ────────────────────────────────────────────────────────────

const _ink   = Color(0xFF140E28);
const _ink3  = Color(0xFF7B7291);
const _bg2   = Color(0xFFFAFBFE);
const _tA    = Color(0xFFFF5733);
const _tGrad = LinearGradient(
  colors: [Color(0xFFFF5733), Color(0xFFFF006E), Color(0xFFC77DFF)],
  begin: Alignment.topLeft, end: Alignment.bottomRight,
);
const _green  = Color(0xFF16A34A);
const _red    = Color(0xFFDC2626);
const _amber  = Color(0xFFF59E0B);
const _indigo = Color(0xFF6366F1);
const _blue   = Color(0xFF3B82F6);
const _purple = Color(0xFF8B5CF6);

// ─── Calendar Provider ────────────────────────────────────────────────────────

final _calendarProvider = FutureProvider.autoDispose.family<Map<String,dynamic>, String>((ref, key) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) return {};
  final parts = key.split('-');
  final month = parts[0]; final year = parts[1];
  try {
    final res = await http.get(
      Uri.parse('http://localhost:3000/api/mobile/v1/staff/attendance/self/calendar?month=$month&year=$year'),
      headers: {'Authorization': 'Bearer ${user!.token}'},
    ).timeout(const Duration(seconds: 12));
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['success'] == true) return Map<String,dynamic>.from(data);
    }
  } catch (_) {}
  return {};
});

// ─── View ─────────────────────────────────────────────────────────────────────

class StaffSelfAttendanceView extends ConsumerStatefulWidget {
  const StaffSelfAttendanceView({super.key});

  @override
  ConsumerState<StaffSelfAttendanceView> createState() => _StaffSelfAttendanceViewState();
}

class _StaffSelfAttendanceViewState extends ConsumerState<StaffSelfAttendanceView>
    with SingleTickerProviderStateMixin {
  final LocalAuthentication _localAuth = LocalAuthentication();
  bool _isLoading = false;
  String _statusMessage = '';

  String? _lastPunchType;
  DateTime? _lastPunchTime;
  List<Map<String,dynamic>> _todayPunches = [];

  late Timer _timer;
  DateTime _currentTime = DateTime.now();

  late AnimationController _pulseCtrl;

  // Calendar state
  late int _selectedMonth;
  late int _selectedYear;
  int? _selectedDay;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _selectedMonth = now.month;
    _selectedYear = now.year;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _currentTime = DateTime.now());
    });
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 2))
      ..repeat(reverse: true);
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadTodayStatus());
  }

  String get _calendarKey => '${_selectedMonth.toString().padLeft(2,'0')}-$_selectedYear';

  Future<void> _loadTodayStatus() async {
    setState(() { _isLoading = true; _statusMessage = 'Loading status…'; });
    try {
      final user = ref.read(userProfileProvider);
      if (user?.token == null) return;
      final res = await http.get(
        Uri.parse('http://localhost:3000/api/mobile/v1/staff/attendance/self/today'),
        headers: {'Authorization': 'Bearer ${user!.token}'},
      );
      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['success'] == true) {
        if (data['status'] == 'IN' || data['status'] == 'OUT') {
          setState(() {
            _lastPunchType = data['status'];
            _lastPunchTime = DateTime.parse(data['timestamp']).toLocal();
          });
        }
        if (data['punches'] != null) {
          setState(() {
            _todayPunches = (data['punches'] as List).map((p) => Map<String,dynamic>.from(p as Map)).toList();
          });
        }
      }
    } catch (e) {
      debugPrint('Failed to load today status: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() { _timer.cancel(); _pulseCtrl.dispose(); super.dispose(); }

  Future<void> _punch(String type) async {
    setState(() { _isLoading = true; _statusMessage = 'Authenticating…'; });
    try {
      setState(() => _statusMessage = 'Fetching location…');
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled && !Theme.of(context).platform.name.toLowerCase().contains('macos')) {
        _showError('Location services are disabled.'); setState(() => _isLoading = false); return;
      }
      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
        if (perm == LocationPermission.denied) { _showError('Location denied'); setState(() => _isLoading = false); return; }
      }
      if (perm == LocationPermission.deniedForever) { _showError('Location permanently denied.'); setState(() => _isLoading = false); return; }

      Position pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.bestForNavigation);

      setState(() => _statusMessage = 'Verifying identity…');
      bool auth = true;
      try {
        if (await _localAuth.isDeviceSupported()) {
          auth = await _localAuth.authenticate(localizedReason: 'Authenticate to punch');
        }
      } catch (_) {}
      if (!auth) { _showError('Auth failed'); setState(() => _isLoading = false); return; }

      setState(() => _statusMessage = 'Recording punch…');
      final user = ref.read(userProfileProvider);
      if (user?.token == null) { _showError('Not authenticated'); setState(() => _isLoading = false); return; }

      final res = await http.post(
        Uri.parse('http://localhost:3000/api/mobile/v1/staff/attendance/self'),
        headers: {'Authorization': 'Bearer ${user!.token}', 'Content-Type': 'application/json'},
        body: jsonEncode({'latitude': pos.latitude, 'longitude': pos.longitude, 'type': type}),
      );
      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['success'] == true) {
        setState(() {
          _lastPunchType = type;
          _lastPunchTime = DateTime.parse(data['punch']['timestamp']).toLocal();
        });
        HapticFeedback.heavyImpact();
        ref.invalidate(_calendarProvider);
        _loadTodayStatus();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('${type == 'IN' ? 'Punched In' : 'Punched Out'} ✓  Distance: ${data['distance']}m',
              style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700)),
            backgroundColor: type == 'IN' ? _green : _red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 20),
          ));
        }
      } else {
        _showError(data['error'] ?? 'Punch failed');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showError(String msg) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(msg, style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700)),
        backgroundColor: _red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      ));
    }
  }

  // ─── BUILD ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(userProfileProvider);
    final calAsync = ref.watch(_calendarProvider(_calendarKey));
    final timeStr  = DateFormat('hh:mm').format(_currentTime);
    final secStr   = DateFormat('ss').format(_currentTime);
    final ampm     = DateFormat('a').format(_currentTime);
    final dayStr   = DateFormat('EEEE, MMM d').format(_currentTime);

    return ModulePopupShell(
      title: 'My Attendance',
      icon: Icons.fingerprint_rounded,
      actionIcon: Icons.refresh_rounded,
      onActionIcon: () {
        ref.invalidate(_calendarProvider);
        _loadTodayStatus();
      },
      backgroundColor: _bg2,
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 40),
        children: [
          // 1. Clock + Punch
          _buildClockCard(user, timeStr, secStr, ampm, dayStr),
          const SizedBox(height: 14),
          _buildPunchToggle(),
          const SizedBox(height: 20),

          // 2. Today's Punch Timeline
          _buildTodayTimeline(),
          const SizedBox(height: 20),

          // 3. Monthly Summary Stats
          _buildMonthlyStats(calAsync),
          const SizedBox(height: 20),

          // 4. Calendar
          _buildCalendar(calAsync),
          const SizedBox(height: 16),

          // 5. Selected Day Detail
          _buildSelectedDayDetail(calAsync),
        ],
      ),
    );
  }

  // ── 1. Clock Card ───────────────────────────────────────────────────────────
  Widget _buildClockCard(dynamic user, String timeStr, String sec, String ampm, String day) {
    final isPunchedIn = _lastPunchType == 'IN';
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 16),
      decoration: BoxDecoration(
        gradient: _tGrad,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: _tA.withOpacity(.25), blurRadius: 24, offset: const Offset(0, 8))],
      ),
      child: Column(children: [
        Row(children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(color: Colors.white.withOpacity(.2), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.person_rounded, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(user?.name ?? '…', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white)),
            Text(user?.role ?? 'Staff', style: TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w600, color: Colors.white.withOpacity(.7))),
          ])),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: isPunchedIn ? Colors.white.withOpacity(.2) : Colors.white.withOpacity(.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(.3)),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Container(width: 5, height: 5, decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isPunchedIn ? const Color(0xFF4ADE80) : Colors.white.withOpacity(.5),
              )),
              const SizedBox(width: 4),
              Text(isPunchedIn ? 'Active' : 'Inactive',
                style: TextStyle(fontFamily: 'Satoshi', fontSize: 8, fontWeight: FontWeight.w700,
                  color: Colors.white.withOpacity(.9))),
            ]),
          ),
        ]),
        const SizedBox(height: 14),
        Row(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text(timeStr, style: const TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 42, fontWeight: FontWeight.w900, color: Colors.white, height: 1, letterSpacing: 1)),
          Padding(padding: const EdgeInsets.only(bottom: 4),
            child: Text(':$sec', style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white.withOpacity(.6), height: 1))),
          const SizedBox(width: 5),
          Padding(padding: const EdgeInsets.only(bottom: 6),
            child: Text(ampm, style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white.withOpacity(.8)))),
        ]),
        const SizedBox(height: 4),
        Text(day, style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white.withOpacity(.7))),
        if (_lastPunchTime != null) ...[
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(color: Colors.white.withOpacity(.12), borderRadius: BorderRadius.circular(10)),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(_lastPunchType == 'IN' ? Icons.login_rounded : Icons.logout_rounded, color: Colors.white.withOpacity(.8), size: 12),
              const SizedBox(width: 5),
              Text('Last ${_lastPunchType == 'IN' ? 'In' : 'Out'}: ${DateFormat('hh:mm a').format(_lastPunchTime!)}',
                style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white.withOpacity(.8))),
            ]),
          ),
        ],
      ]),
    );
  }

  // ── 2. Punch Toggle ─────────────────────────────────────────────────────────
  Widget _buildPunchToggle() {
    if (_isLoading) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(100),
          boxShadow: [BoxShadow(color: _ink.withOpacity(.06), blurRadius: 20)]),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: _tA, strokeWidth: 2.5)),
          const SizedBox(width: 10),
          Text(_statusMessage, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w700, color: _ink3)),
        ]),
      );
    }

    final isPunchedIn = _lastPunchType == 'IN';
    final accentColor = isPunchedIn ? _red : _green;
    final gradient = isPunchedIn
      ? const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFDC2626), Color(0xFFB91C1C)], begin: Alignment.topLeft, end: Alignment.bottomRight)
      : const LinearGradient(colors: [Color(0xFF22C55E), Color(0xFF16A34A), Color(0xFF059669)], begin: Alignment.topLeft, end: Alignment.bottomRight);

    return Center(child: Container(
      width: 260, height: 50,
      decoration: BoxDecoration(
        gradient: gradient, borderRadius: BorderRadius.circular(100),
        boxShadow: [
          BoxShadow(color: accentColor.withOpacity(.35), blurRadius: 20, offset: const Offset(0, 6)),
          BoxShadow(color: accentColor.withOpacity(.15), blurRadius: 40, offset: const Offset(0, 12)),
        ],
      ),
      child: Stack(children: [
        AnimatedAlign(
          duration: const Duration(milliseconds: 400), curve: Curves.easeOutBack,
          alignment: isPunchedIn ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            width: 128, height: 42, margin: const EdgeInsets.all(4),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(100),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(.1), blurRadius: 8, offset: const Offset(0, 2))]),
          ),
        ),
        Row(children: [
          Expanded(child: GestureDetector(
            onTap: isPunchedIn ? null : () { HapticFeedback.mediumImpact(); _punch('IN'); },
            behavior: HitTestBehavior.opaque,
            child: Center(child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.login_rounded, size: 14, color: !isPunchedIn ? accentColor : Colors.white.withOpacity(.85)),
              const SizedBox(width: 4),
              Text('Punch In', style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w800,
                color: !isPunchedIn ? accentColor : Colors.white.withOpacity(.85))),
            ])),
          )),
          Expanded(child: GestureDetector(
            onTap: !isPunchedIn ? null : () { HapticFeedback.mediumImpact(); _punch('OUT'); },
            behavior: HitTestBehavior.opaque,
            child: Center(child: Row(mainAxisSize: MainAxisSize.min, children: [
              Text('Punch Out', style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w800,
                color: isPunchedIn ? accentColor : Colors.white.withOpacity(.85))),
              const SizedBox(width: 4),
              Icon(Icons.logout_rounded, size: 14, color: isPunchedIn ? accentColor : Colors.white.withOpacity(.85)),
            ])),
          )),
        ]),
      ]),
    ));
  }

  // ── 3. Today's Punch Timeline ───────────────────────────────────────────────
  Widget _buildTodayTimeline() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        const Text("Today's Activity", style: TextStyle(fontFamily: 'Clash Display', fontSize: 15, fontWeight: FontWeight.w800, color: _ink)),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(color: _tA.withOpacity(.1), borderRadius: BorderRadius.circular(6)),
          child: Text('${_todayPunches.length} punches', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w700, color: _tA)),
        ),
      ]),
      const SizedBox(height: 10),
      if (_todayPunches.isEmpty)
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: _ink.withOpacity(.03), blurRadius: 12)]),
          child: Center(child: Column(children: [
            Icon(Icons.access_time_rounded, size: 28, color: _ink3.withOpacity(.3)),
            const SizedBox(height: 8),
            Text('No punches yet today', style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w600, color: _ink3.withOpacity(.6))),
          ])),
        )
      else
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: _ink.withOpacity(.03), blurRadius: 12)]),
          child: Column(children: List.generate(_todayPunches.length, (i) {
            final p = _todayPunches[i];
            final isIn = p['type'] == 'IN';
            final t = DateTime.parse(p['timestamp']).toLocal();
            final isLast = i == _todayPunches.length - 1;
            return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              // Timeline dot + line
              SizedBox(width: 24, child: Column(children: [
                Container(width: 10, height: 10, decoration: BoxDecoration(
                  shape: BoxShape.circle, color: isIn ? _green : _red,
                  boxShadow: [BoxShadow(color: (isIn ? _green : _red).withOpacity(.3), blurRadius: 6)],
                )),
                if (!isLast) Container(width: 2, height: 36, color: _ink.withOpacity(.06)),
              ])),
              const SizedBox(width: 10),
              Expanded(child: Padding(
                padding: EdgeInsets.only(bottom: isLast ? 0 : 12),
                child: Row(children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: (isIn ? _green : _red).withOpacity(.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(isIn ? 'IN' : 'OUT', style: TextStyle(
                      fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w800,
                      color: isIn ? _green : _red)),
                  ),
                  const SizedBox(width: 10),
                  Text(DateFormat('hh:mm:ss a').format(t), style: const TextStyle(
                    fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w700, color: _ink)),
                ]),
              )),
            ]);
          })),
        ),
    ]);
  }

  // ── 4. Monthly Summary Stats ────────────────────────────────────────────────
  Widget _buildMonthlyStats(AsyncValue<Map<String,dynamic>> calAsync) {
    final summary = calAsync.value?['summary'] as Map<String,dynamic>? ?? {};
    final daysWorked = summary['daysWorked'] ?? 0;
    final leaves = summary['leavesTaken'] ?? 0;
    final holidays = summary['holidayDays'] ?? 0;
    final weekends = summary['weekendDays'] ?? 0;
    final hours = summary['totalHours'] ?? 0.0;

    final monthName = DateFormat('MMMM').format(DateTime(_selectedYear, _selectedMonth));

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('$monthName Summary', style: const TextStyle(fontFamily: 'Clash Display', fontSize: 15, fontWeight: FontWeight.w800, color: _ink)),
      const SizedBox(height: 10),
      Wrap(spacing: 8, runSpacing: 8, children: [
        _StatChip(value: '$daysWorked', label: 'Worked', icon: Icons.check_circle_rounded, color: _green),
        _StatChip(value: '$leaves', label: 'Leaves', icon: Icons.event_busy_rounded, color: _purple),
        _StatChip(value: '$holidays', label: 'Holidays', icon: Icons.celebration_rounded, color: _blue),
        _StatChip(value: '$weekends', label: 'Weekends', icon: Icons.weekend_rounded, color: _ink3),
        _StatChip(value: '${hours}h', label: 'Hours', icon: Icons.timer_rounded, color: _indigo),
      ]),
    ]);
  }

  // ── 5. Interactive Calendar ─────────────────────────────────────────────────
  Widget _buildCalendar(AsyncValue<Map<String,dynamic>> calAsync) {
    final now = DateTime.now();
    final firstDay = DateTime(_selectedYear, _selectedMonth, 1);
    final daysInMonth = DateTime(_selectedYear, _selectedMonth + 1, 0).day;
    final startWeekday = firstDay.weekday; // 1=Mon, 7=Sun
    final monthName = DateFormat('MMMM yyyy').format(firstDay);

    // Build lookup maps from API data
    final attendanceMap = <int, String>{};
    final holidayMap = <int, String>{};
    final leaveSet = <int>{};
    List<String> workingDays = ['MON','TUE','WED','THU','FRI'];

    if (calAsync.value != null) {
      final data = calAsync.value!;
      // Working days
      if (data['workingDays'] != null) {
        workingDays = List<String>.from(data['workingDays']);
      }
      // Attendance
      for (final r in (data['attendance'] as List? ?? [])) {
        final d = DateTime.parse(r['date'].toString());
        attendanceMap[d.day] = r['status'] ?? '';
      }
      // Holidays
      for (final h in (data['holidays'] as List? ?? [])) {
        final d = DateTime.parse(h['date'].toString());
        holidayMap[d.day] = h['name'] ?? 'Holiday';
      }
      // Leaves
      for (final l in (data['leaves'] as List? ?? [])) {
        final start = DateTime.parse(l['startDate'].toString());
        final end = DateTime.parse(l['endDate'].toString());
        for (var d = start; !d.isAfter(end); d = d.add(const Duration(days: 1))) {
          if (d.month == _selectedMonth && d.year == _selectedYear) {
            leaveSet.add(d.day);
          }
        }
      }
    }

    final dayNames = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Month nav
      Row(children: [
        const Text('Calendar', style: TextStyle(fontFamily: 'Clash Display', fontSize: 15, fontWeight: FontWeight.w800, color: _ink)),
        const Spacer(),
        GestureDetector(
          onTap: () => setState(() {
            if (_selectedMonth == 1) { _selectedMonth = 12; _selectedYear--; }
            else { _selectedMonth--; }
            _selectedDay = null;
          }),
          child: Container(width: 28, height: 28, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFE2E8F0))),
            child: const Icon(Icons.chevron_left_rounded, size: 16, color: _ink3)),
        ),
        Padding(padding: const EdgeInsets.symmetric(horizontal: 10),
          child: Text(monthName, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w800, color: _ink))),
        GestureDetector(
          onTap: () {
            final isCurrentMonth = _selectedMonth == now.month && _selectedYear == now.year;
            if (isCurrentMonth) return;
            setState(() {
              if (_selectedMonth == 12) { _selectedMonth = 1; _selectedYear++; }
              else { _selectedMonth++; }
              _selectedDay = null;
            });
          },
          child: Container(width: 28, height: 28, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFE2E8F0))),
            child: const Icon(Icons.chevron_right_rounded, size: 16, color: _ink3)),
        ),
      ]),
      const SizedBox(height: 12),
      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: _ink.withOpacity(.04), blurRadius: 16)]),
        child: Column(children: [
          // Day header row
          Row(children: ['M','T','W','T','F','S','S'].map((d) => Expanded(
            child: Center(child: Text(d, style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w700,
              color: (d == 'S') ? _red.withOpacity(.6) : _ink3))),
          )).toList()),
          const SizedBox(height: 6),
          // Day grid
          ...List.generate(6, (week) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 2),
              child: Row(children: List.generate(7, (col) {
                final dayNum = week * 7 + col + 1 - (startWeekday - 1);
                if (dayNum < 1 || dayNum > daysInMonth) {
                  return const Expanded(child: SizedBox(height: 36));
                }

                final d = DateTime(_selectedYear, _selectedMonth, dayNum);
                final dayNameStr = dayNames[d.weekday % 7];
                final isToday = dayNum == now.day && _selectedMonth == now.month && _selectedYear == now.year;
                final isFuture = d.isAfter(now);
                final isSelected = _selectedDay == dayNum;
                final isWeekend = !workingDays.contains(dayNameStr);
                final isHoliday = holidayMap.containsKey(dayNum);
                final isLeave = leaveSet.contains(dayNum);
                final status = attendanceMap[dayNum] ?? '';

                Color bgColor = Colors.transparent;
                Color textColor = _ink;
                Color? dotColor;

                if (isFuture) {
                  textColor = _ink3.withOpacity(.35);
                } else if (isHoliday) {
                  bgColor = _blue.withOpacity(.1);
                  textColor = _blue;
                  dotColor = _blue;
                } else if (isLeave) {
                  bgColor = _purple.withOpacity(.1);
                  textColor = _purple;
                  dotColor = _purple;
                } else if (isWeekend) {
                  textColor = _ink3.withOpacity(.4);
                } else if (status == 'PRESENT') {
                  dotColor = _green;
                } else if (status == 'LATE') {
                  dotColor = _amber;
                } else if (status == 'ABSENT') {
                  dotColor = _red;
                }

                return Expanded(child: GestureDetector(
                  onTap: isFuture ? null : () => setState(() => _selectedDay = _selectedDay == dayNum ? null : dayNum),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    height: 36,
                    decoration: BoxDecoration(
                      color: isSelected ? _tA : isToday ? _tA.withOpacity(.08) : bgColor,
                      borderRadius: BorderRadius.circular(8),
                      border: isToday && !isSelected ? Border.all(color: _tA.withOpacity(.3)) : null,
                    ),
                    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Text('$dayNum', style: TextStyle(
                        fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w700,
                        color: isSelected ? Colors.white : textColor,
                      )),
                      if (dotColor != null && !isSelected) ...[
                        const SizedBox(height: 2),
                        Container(width: 4, height: 4, decoration: BoxDecoration(
                          shape: BoxShape.circle, color: dotColor)),
                      ],
                    ]),
                  ),
                ));
              })),
            );
          }),
          // Legend
          const SizedBox(height: 8),
          Wrap(spacing: 12, runSpacing: 4, children: [
            _legendDot(_green, 'Present'),
            _legendDot(_amber, 'Late'),
            _legendDot(_red, 'Absent'),
            _legendDot(_blue, 'Holiday'),
            _legendDot(_purple, 'Leave'),
          ]),
        ]),
      ),
    ]);
  }

  Widget _legendDot(Color c, String label) => Row(mainAxisSize: MainAxisSize.min, children: [
    Container(width: 6, height: 6, decoration: BoxDecoration(shape: BoxShape.circle, color: c)),
    const SizedBox(width: 3),
    Text(label, style: TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w600, color: _ink3)),
  ]);

  // ── 6. Selected Day Detail ──────────────────────────────────────────────────
  Widget _buildSelectedDayDetail(AsyncValue<Map<String,dynamic>> calAsync) {
    if (_selectedDay == null) return const SizedBox.shrink();

    final data = calAsync.value ?? {};
    final attendanceList = data['attendance'] as List? ?? [];
    final holidayList = data['holidays'] as List? ?? [];

    final date = DateTime(_selectedYear, _selectedMonth, _selectedDay!);
    final dateStr = DateFormat('EEEE, MMMM d').format(date);

    // Find holiday
    String? holidayName;
    for (final h in holidayList) {
      final hd = DateTime.parse(h['date'].toString());
      if (hd.day == _selectedDay) { holidayName = h['name']; break; }
    }

    // Find attendance record
    Map<String,dynamic>? record;
    for (final r in attendanceList) {
      final rd = DateTime.parse(r['date'].toString());
      if (rd.day == _selectedDay) { record = Map<String,dynamic>.from(r as Map); break; }
    }

    final punches = (record?['punches'] as List?)?.map((p) => Map<String,dynamic>.from(p as Map)).toList() ?? [];

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Icon(Icons.calendar_today_rounded, size: 14, color: _tA),
        const SizedBox(width: 6),
        Text(dateStr, style: const TextStyle(fontFamily: 'Clash Display', fontSize: 14, fontWeight: FontWeight.w800, color: _ink)),
      ]),
      const SizedBox(height: 10),

      if (holidayName != null)
        Container(
          padding: const EdgeInsets.all(14), margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(color: _blue.withOpacity(.08), borderRadius: BorderRadius.circular(14),
            border: Border.all(color: _blue.withOpacity(.2))),
          child: Row(children: [
            const Icon(Icons.celebration_rounded, size: 18, color: _blue),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Holiday', style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w700, color: _blue)),
              Text(holidayName, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w800, color: _ink)),
            ])),
          ]),
        ),

      if (punches.isEmpty && holidayName == null)
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14),
            boxShadow: [BoxShadow(color: _ink.withOpacity(.03), blurRadius: 12)]),
          child: Center(child: Text('No attendance data', style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w600, color: _ink3.withOpacity(.5)))),
        )
      else if (punches.isNotEmpty)
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14),
            boxShadow: [BoxShadow(color: _ink.withOpacity(.03), blurRadius: 12)]),
          child: Column(children: [
            // Status badge
            Row(children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: (record?['status'] == 'PRESENT' ? _green : record?['status'] == 'LATE' ? _amber : _red).withOpacity(.1),
                  borderRadius: BorderRadius.circular(6)),
                child: Text(record?['status'] ?? '', style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w800,
                  color: record?['status'] == 'PRESENT' ? _green : record?['status'] == 'LATE' ? _amber : _red)),
              ),
              const Spacer(),
              // Hours
              Builder(builder: (_) {
                DateTime? firstIn, lastOut;
                for (final p in punches) {
                  final t = DateTime.parse(p['timestamp'].toString());
                  if (p['type'] == 'IN' && firstIn == null) firstIn = t;
                  if (p['type'] == 'OUT') lastOut = t;
                }
                if (firstIn != null && lastOut != null && lastOut.isAfter(firstIn)) {
                  final h = lastOut.difference(firstIn).inMinutes / 60;
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: _indigo.withOpacity(.1), borderRadius: BorderRadius.circular(6)),
                    child: Text('${h.toStringAsFixed(1)}h', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w800, color: _indigo)),
                  );
                }
                return const SizedBox.shrink();
              }),
            ]),
            const SizedBox(height: 12),
            // Punch list
            ...punches.map((p) {
              final isIn = p['type'] == 'IN';
              final t = DateTime.parse(p['timestamp'].toString()).toLocal();
              return Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(children: [
                  Container(width: 8, height: 8, decoration: BoxDecoration(
                    shape: BoxShape.circle, color: isIn ? _green : _red)),
                  const SizedBox(width: 8),
                  Text(isIn ? 'Punch In' : 'Punch Out', style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w600, color: isIn ? _green : _red)),
                  const Spacer(),
                  Text(DateFormat('hh:mm:ss a').format(t), style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w700, color: _ink)),
                ]),
              );
            }),
          ]),
        ),
    ]);
  }
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────

class _StatChip extends StatelessWidget {
  final String value, label;
  final IconData icon;
  final Color color;
  const _StatChip({required this.value, required this.label, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: (MediaQuery.of(context).size.width - 56) / 3,
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: const Color(0xFF140E28).withOpacity(.03), blurRadius: 10)]),
      child: Column(children: [
        Container(width: 26, height: 26,
          decoration: BoxDecoration(color: color.withOpacity(.1), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, size: 13, color: color)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 16, fontWeight: FontWeight.w900, color: color, height: 1)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w600, color: _ink3)),
      ]),
    );
  }
}
