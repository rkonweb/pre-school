import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/theme/app_theme.dart';
import '../../core/state/auth_state.dart';
import '../../core/config/api_config.dart';

// ━━━ Data Models ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class PTMStudent {
  final String id, firstName, lastName;
  final String? admissionNo, parentMobile, fatherName, motherName;
  PTMStudent({required this.id, required this.firstName, required this.lastName,
    this.admissionNo, this.parentMobile, this.fatherName, this.motherName});
  String get fullName => '$firstName $lastName'.trim();
  factory PTMStudent.fromJson(Map<String, dynamic> j) => PTMStudent(
    id: j['id'] ?? '', firstName: j['firstName'] ?? '', lastName: j['lastName'] ?? '',
    admissionNo: j['admissionNumber'], parentMobile: j['parentMobile'],
    fatherName: j['fatherName'], motherName: j['motherName'],
  );
}

class PTMClassroom {
  final String id, name;
  final bool isClassTeacher;
  final int studentCount;
  final List<PTMStudent> students;
  PTMClassroom({required this.id, required this.name, required this.isClassTeacher,
    required this.studentCount, required this.students});
  factory PTMClassroom.fromJson(Map<String, dynamic> j) => PTMClassroom(
    id: j['id'] ?? '', name: j['name'] ?? '', isClassTeacher: j['isClassTeacher'] ?? false,
    studentCount: j['studentCount'] ?? 0,
    students: ((j['students'] ?? []) as List).map((s) => PTMStudent.fromJson(s)).toList(),
  );
}

class PTMBooking {
  final String id, slotTime, status, studentName;
  final String? className, admissionNo;
  PTMBooking({required this.id, required this.slotTime, required this.status,
    required this.studentName, this.className, this.admissionNo});
  factory PTMBooking.fromJson(Map<String, dynamic> j) {
    final s = j['student'] ?? {};
    return PTMBooking(id: j['id'] ?? '', slotTime: j['slotTime'] ?? '',
      status: j['status'] ?? 'CONFIRMED',
      studentName: '${s['firstName'] ?? ''} ${s['lastName'] ?? ''}'.trim(),
      className: s['classroom']?['name'], admissionNo: s['admissionNumber']);
  }
}

class PTMSession {
  final String id, title, startTime, endTime;
  final String? description;
  final DateTime date;
  final int slotMinutes, bookingCount;
  final bool isActive;
  final List<String> classIds;
  final List<PTMBooking> bookings;
  PTMSession({required this.id, required this.title, this.description, required this.date,
    required this.startTime, required this.endTime, required this.slotMinutes,
    required this.isActive, required this.classIds, required this.bookings, required this.bookingCount});
  bool get isUpcoming => date.isAfter(DateTime.now().subtract(const Duration(days: 1)));
  factory PTMSession.fromJson(Map<String, dynamic> j) {
    List<String> cls = ['all'];
    try { final r = j['classIds']; if (r is String) cls = List<String>.from(jsonDecode(r)); } catch (_) {}
    return PTMSession(id: j['id'] ?? '', title: j['title'] ?? '', description: j['description'],
      date: DateTime.tryParse(j['date'] ?? '') ?? DateTime.now(),
      startTime: j['startTime'] ?? '09:00', endTime: j['endTime'] ?? '16:00',
      slotMinutes: j['slotMinutes'] ?? 10, isActive: j['isActive'] ?? true, classIds: cls,
      bookings: ((j['bookings'] ?? []) as List).map((b) => PTMBooking.fromJson(b)).toList(),
      bookingCount: j['_count']?['bookings'] ?? 0);
  }
}

// ━━━ Providers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
final staffPTMProvider = FutureProvider.autoDispose<List<PTMSession>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) {
    debugPrint("PTM Sessions: No user token available");
    return [];
  }
  try {
    final url = '$apiBase/api/mobile/v1/staff/ptm';
    debugPrint("PTM Sessions: Fetching from $url");
    final res = await http.get(Uri.parse(url),
      headers: {'Authorization': 'Bearer ${user!.token}'}).timeout(const Duration(seconds: 30));
    debugPrint("PTM Sessions: Status ${res.statusCode}");
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['success'] == true) {
        final sessions = (data['sessions'] as List).map((s) => PTMSession.fromJson(s)).toList();
        debugPrint("PTM Sessions: Got ${sessions.length} sessions");
        return sessions;
      }
    } else {
      debugPrint("PTM Sessions Error: ${res.body}");
    }
  } catch (e) { debugPrint("PTM Sessions Exception: $e"); }
  return [];
});

final ptmClassesProvider = FutureProvider.autoDispose<List<PTMClassroom>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) {
    debugPrint("PTM Classes: No user token available");
    return [];
  }
  try {
    final url = '$apiBase/api/mobile/v1/staff/ptm/classes';
    debugPrint("PTM Classes: Fetching from $url");
    final res = await http.get(Uri.parse(url),
      headers: {'Authorization': 'Bearer ${user!.token}'}).timeout(const Duration(seconds: 30));
    debugPrint("PTM Classes: Status ${res.statusCode}");
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['success'] == true) {
        final classes = (data['classrooms'] as List).map((c) => PTMClassroom.fromJson(c)).toList();
        debugPrint("PTM Classes: Got ${classes.length} classrooms");
        return classes;
      } else {
        debugPrint("PTM Classes: success=false: ${res.body}");
      }
    } else {
      debugPrint("PTM Classes Error: ${res.statusCode} ${res.body}");
    }
  } catch (e) { debugPrint("PTM Classes Exception: $e"); }
  return [];
});

// ━━━ Main View ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class StaffPTMView extends ConsumerStatefulWidget {
  const StaffPTMView({super.key});
  @override ConsumerState<StaffPTMView> createState() => _StaffPTMViewState();
}

class _StaffPTMViewState extends ConsumerState<StaffPTMView> {
  String _filter = 'all';
  bool _showCreateForm = false;

  List<PTMSession> _applyFilter(List<PTMSession> s) {
    switch (_filter) {
      case 'active': return s.where((x) => x.isActive).toList();
      case 'closed': return s.where((x) => !x.isActive).toList();
      case 'upcoming': return s.where((x) => x.isUpcoming && x.isActive).toList();
      default: return s;
    }
  }

  Future<void> _toggleSession(String id, bool active) async {
    final user = ref.read(userProfileProvider);
    if (user?.token == null) return;
    await http.patch(Uri.parse('$apiBase/api/mobile/v1/staff/ptm'),
      headers: {'Authorization': 'Bearer ${user!.token}', 'Content-Type': 'application/json'},
      body: jsonEncode({'sessionId': id, 'isActive': !active}));
    ref.invalidate(staffPTMProvider);
  }

  Future<void> _deleteSession(String id) async {
    final user = ref.read(userProfileProvider);
    if (user?.token == null) return;
    await http.delete(Uri.parse('$apiBase/api/mobile/v1/staff/ptm'),
      headers: {'Authorization': 'Bearer ${user!.token}', 'Content-Type': 'application/json'},
      body: jsonEncode({'sessionId': id}));
    ref.invalidate(staffPTMProvider);
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(staffPTMProvider);
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        child: Container(
          color: const Color(0xFFFAFBFE),
          child: Column(children: [
            _header(), _filters(),
            if (_showCreateForm) Expanded(child: _PTMCreateForm(
              onCreated: () { setState(() => _showCreateForm = false); ref.invalidate(staffPTMProvider); },
              onCancel: () => setState(() => _showCreateForm = false),
            ))
            else Expanded(child: async.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => const Center(child: Text('Error loading sessions')),
              data: (sess) {
                final f = _applyFilter(sess);
                if (f.isEmpty) return _empty();
                return RefreshIndicator(onRefresh: () => ref.refresh(staffPTMProvider.future),
                  child: ListView.builder(padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
                    itemCount: f.length, itemBuilder: (_, i) => _sessionCard(f[i])));
              },
            )),
          ]),
        ),
      ),
    );
  }

  Widget _header() => Container(
    decoration: const BoxDecoration(color: Color(0xFFFAFBFE),
      border: Border(bottom: BorderSide(color: Color.fromRGBO(20, 14, 40, 0.06), width: 1.5))),
    padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
    child: SafeArea(bottom: false, child: Column(children: [
      const SizedBox(height: 10),
      Container(width: 36, height: 4, decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(100))),
      const SizedBox(height: 14),
      Row(children: [
        _iconBtn(Icons.arrow_back_ios_new_rounded, () => Navigator.pop(context)),
        const SizedBox(width: 10),
        Container(width: 38, height: 38, decoration: BoxDecoration(color: const Color(0xFF7C3AED).withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
          child: const Icon(Icons.people_alt_rounded, size: 20, color: Color(0xFF7C3AED))),
        const SizedBox(width: 10),
        const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('PTM Scheduler', style: TextStyle(fontFamily: 'Outfit', fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF140E28))),
          Text('Parent-Teacher Meetings', style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w500, color: Color(0xFF94A3B8))),
        ])),
        GestureDetector(
          onTap: () => setState(() => _showCreateForm = !_showCreateForm),
          child: Container(width: 38, height: 38,
            decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF6366F1)]),
              borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: const Color(0xFF7C3AED).withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 3))]),
            child: Icon(_showCreateForm ? Icons.close_rounded : Icons.add_rounded, color: Colors.white, size: 22)),
        ),
      ]),
      const SizedBox(height: 12),
    ])),
  );

  Widget _iconBtn(IconData ic, VoidCallback onTap) => GestureDetector(onTap: onTap,
    child: Container(width: 34, height: 34, decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)),
      child: Icon(ic, size: 14, color: const Color(0xFF140E28))));

  Widget _filters() {
    final items = [('all', 'All'), ('upcoming', 'Upcoming'), ('active', 'Active'), ('closed', 'Closed')];
    return SingleChildScrollView(scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
      child: Row(children: items.map((f) {
        final on = _filter == f.$1;
        return GestureDetector(onTap: () => setState(() => _filter = f.$1),
          child: Container(margin: const EdgeInsets.only(right: 8), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              gradient: on ? const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF6366F1)]) : null,
              color: on ? null : Colors.white, borderRadius: BorderRadius.circular(100),
              border: on ? null : Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
              boxShadow: on ? [BoxShadow(color: const Color(0xFF7C3AED).withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 3))] : null),
            child: Text(f.$2, style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w700, color: on ? Colors.white : const Color(0xFF64748B)))));
      }).toList()));
  }

  Widget _sessionCard(PTMSession s) {
    final dateStr = '${_wd(s.date.weekday)}, ${s.date.day} ${_mn(s.date.month)}';
    return Container(margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24),
        border: Border.all(color: s.isActive ? const Color(0xFF7C3AED).withOpacity(0.15) : const Color(0xFFE2E8F0)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 16, offset: const Offset(0, 4))]),
      child: Column(children: [
        Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            _badge(s.isActive ? '🟢 Active' : '🔴 Closed', s.isActive ? const Color(0xFF16A34A) : const Color(0xFF94A3B8)),
            const SizedBox(width: 6),
            _badge(s.classIds.contains('all') ? 'All Classes' : '${s.classIds.length} Classes', const Color(0xFF6366F1)),
          ]),
          const SizedBox(height: 10),
          Text(s.title, style: const TextStyle(fontFamily: 'Outfit', fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF140E28))),
          const SizedBox(height: 6),
          Row(children: [const Icon(Icons.calendar_today_rounded, size: 14, color: Color(0xFF7C3AED)), const SizedBox(width: 6),
            Text(dateStr, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF64748B)))]),
          const SizedBox(height: 4),
          Row(children: [const Icon(Icons.access_time_rounded, size: 14, color: Color(0xFF6366F1)), const SizedBox(width: 6),
            Text('${s.startTime} – ${s.endTime} · ${s.slotMinutes}m slots', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8)))]),
        ])),
        // Bookings
        Container(margin: const EdgeInsets.symmetric(horizontal: 16), padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0).withOpacity(0.5))),
          child: s.bookings.isEmpty
            ? const Center(child: Padding(padding: EdgeInsets.symmetric(vertical: 4), child: Text('No bookings yet', style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF94A3B8)))))
            : Column(children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text('${s.bookingCount} Booking${s.bookingCount != 1 ? 's' : ''}', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF7C3AED))),
                  if (s.bookings.length > 3) Text('+${s.bookings.length - 3} more', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF6366F1)))]),
                const SizedBox(height: 4),
                ...s.bookings.take(3).map((b) => Padding(padding: const EdgeInsets.symmetric(vertical: 3),
                  child: Row(children: [
                    Container(width: 6, height: 6, decoration: BoxDecoration(color: b.status == 'CONFIRMED' ? const Color(0xFF7C3AED) : const Color(0xFF94A3B8), shape: BoxShape.circle)),
                    const SizedBox(width: 8), Text(b.slotTime, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF140E28))),
                    const SizedBox(width: 10), Expanded(child: Text(b.studentName, overflow: TextOverflow.ellipsis, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF64748B)))),
                    if (b.className != null) Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: const Color(0xFF7C3AED).withOpacity(0.08), borderRadius: BorderRadius.circular(6)),
                      child: Text(b.className!, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF7C3AED)))),
                  ]))),
              ])),
        // Actions
        Padding(padding: const EdgeInsets.all(16), child: Row(children: [
          Expanded(child: GestureDetector(onTap: () => _toggleSession(s.id, s.isActive),
            child: Container(padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(gradient: !s.isActive ? const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF6366F1)]) : null,
                color: s.isActive ? const Color(0xFFF1F5F9) : null, borderRadius: BorderRadius.circular(14)),
              child: Center(child: Text(s.isActive ? 'Close Session' : 'Reopen', style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w800, color: s.isActive ? const Color(0xFF64748B) : Colors.white)))))),
          const SizedBox(width: 10),
          GestureDetector(onTap: () => _confirmDel(s.id),
            child: Container(width: 44, height: 44, decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(14)),
              child: const Icon(Icons.delete_outline_rounded, size: 20, color: Color(0xFFDC2626)))),
        ])),
      ]));
  }

  void _confirmDel(String id) => showDialog(context: context, builder: (ctx) => AlertDialog(
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    title: const Text('Delete Session?', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.w800)),
    content: const Text('All bookings will be lost.'),
    actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
      ElevatedButton(style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDC2626), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
        onPressed: () { Navigator.pop(ctx); _deleteSession(id); }, child: const Text('Delete', style: TextStyle(color: Colors.white)))]));

  Widget _badge(String t, Color c) => Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(color: c.withOpacity(0.08), borderRadius: BorderRadius.circular(8), border: Border.all(color: c.withOpacity(0.15))),
    child: Text(t, style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w800, color: c)));

  Widget _empty() => Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
    Container(width: 80, height: 80, decoration: BoxDecoration(gradient: LinearGradient(colors: [const Color(0xFF7C3AED).withOpacity(0.1), const Color(0xFF6366F1).withOpacity(0.1)]),
        borderRadius: BorderRadius.circular(28)), child: const Center(child: Text('📅', style: TextStyle(fontSize: 32)))),
    const SizedBox(height: 16), const Text('No Sessions Yet', style: TextStyle(fontFamily: 'Outfit', fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF140E28))),
    const SizedBox(height: 6), const Text('Tap + to create a PTM session', textAlign: TextAlign.center, style: TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF64748B)))]));

  String _wd(int w) => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][w-1];
  String _mn(int m) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1];
}

// ━━━ Comprehensive Create Form ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class _PTMCreateForm extends ConsumerStatefulWidget {
  final VoidCallback onCreated, onCancel;
  const _PTMCreateForm({required this.onCreated, required this.onCancel});
  @override ConsumerState<_PTMCreateForm> createState() => _PTMCreateFormState();
}

class _PTMCreateFormState extends ConsumerState<_PTMCreateForm> {
  int _step = 0; // 0=details, 1=classes, 2=students, 3=review
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _venueCtrl = TextEditingController();
  DateTime? _date;
  String _startTime = '09:00', _endTime = '16:00';
  int _slotMinutes = 10;
  String _scope = 'all'; // 'all', 'selected'
  final Set<String> _selectedClassIds = {};
  final Set<String> _selectedStudentIds = {};
  bool _allStudents = true;
  bool _isCreating = false;
  String _searchQ = '';

  @override void dispose() { _titleCtrl.dispose(); _descCtrl.dispose(); _venueCtrl.dispose(); super.dispose(); }

  int get _slotCount {
    final sp = _startTime.split(':'); final ep = _endTime.split(':');
    final s = int.parse(sp[0]) * 60 + int.parse(sp[1]);
    final e = int.parse(ep[0]) * 60 + int.parse(ep[1]);
    return e > s ? ((e - s) / _slotMinutes).floor() : 0;
  }

  Future<void> _submit() async {
    final user = ref.read(userProfileProvider);
    if (user?.token == null) return;
    setState(() => _isCreating = true);
    try {
      final classIds = _scope == 'all' ? ['all'] : _selectedClassIds.toList();
      final res = await http.post(Uri.parse('$apiBase/api/mobile/v1/staff/ptm'),
        headers: {'Authorization': 'Bearer ${user!.token}', 'Content-Type': 'application/json'},
        body: jsonEncode({
          'title': _titleCtrl.text, 'description': _descCtrl.text.isEmpty ? null : _descCtrl.text,
          'date': _date!.toIso8601String(), 'startTime': _startTime, 'endTime': _endTime,
          'slotMinutes': _slotMinutes, 'classIds': classIds}));
      if (res.statusCode == 201) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('PTM session created!'), backgroundColor: Color(0xFF16A34A)));
        widget.onCreated();
      }
    } catch (e) { debugPrint("Error: $e"); }
    finally { if (mounted) setState(() => _isCreating = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      // Step indicator
      Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(children: List.generate(4, (i) => Expanded(child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 2), height: 4,
          decoration: BoxDecoration(
            gradient: i <= _step ? const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF6366F1)]) : null,
            color: i > _step ? const Color(0xFFE2E8F0) : null,
            borderRadius: BorderRadius.circular(100))))))),
      Padding(padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
        child: Row(children: [
          Text(['📝 Session Details', '🏫 Select Classes', '👨‍👩‍👧 Select Students', '✅ Review & Publish'][_step],
            style: const TextStyle(fontFamily: 'Outfit', fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF140E28))),
          const Spacer(),
          Text('Step ${_step + 1}/4', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8))),
        ])),
      Expanded(child: [_stepDetails, _stepClasses, _stepStudents, _stepReview][_step]()),
      _bottomBar(),
    ]);
  }

  // ── Step 0: Details ──
  Widget _stepDetails() => ListView(padding: const EdgeInsets.all(16), children: [
    _label('SESSION TITLE *'),
    _input(_titleCtrl, 'E.g., Term 2 Parent-Teacher Meeting'),
    const SizedBox(height: 14),
    _label('DESCRIPTION'),
    _input(_descCtrl, 'Optional: agenda, notes for parents...', lines: 3),
    const SizedBox(height: 14),
    _label('VENUE'),
    _input(_venueCtrl, 'E.g., Classroom / Auditorium'),
    const SizedBox(height: 14),
    _label('DATE *'),
    GestureDetector(onTap: () async {
      final d = await showDatePicker(context: context, initialDate: DateTime.now().add(const Duration(days: 7)),
        firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
      if (d != null) setState(() => _date = d);
    }, child: Container(padding: const EdgeInsets.all(14), decoration: _fieldDeco(),
      child: Row(children: [const Icon(Icons.calendar_today_rounded, size: 16, color: Color(0xFF7C3AED)), const SizedBox(width: 10),
        Text(_date != null ? '${_date!.day}/${_date!.month}/${_date!.year} (${_wd(_date!.weekday)})' : 'Tap to select date',
          style: TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w600, color: _date != null ? const Color(0xFF140E28) : const Color(0xFF94A3B8)))]))),
    const SizedBox(height: 14),
    _label('TIME SLOTS'),
    Row(children: [
      Expanded(child: _timePick('START', _startTime, (v) => setState(() => _startTime = v))),
      const SizedBox(width: 10),
      Expanded(child: _timePick('END', _endTime, (v) => setState(() => _endTime = v))),
      const SizedBox(width: 10),
      Expanded(child: _slotPick()),
    ]),
    const SizedBox(height: 12),
    if (_slotCount > 0) Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(
      color: const Color(0xFF7C3AED).withOpacity(0.04), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.12))),
      child: Row(children: [const Icon(Icons.info_outline_rounded, size: 16, color: Color(0xFF7C3AED)), const SizedBox(width: 8),
        Text('$_slotCount time slots available · ${_startTime} to ${_endTime}', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF7C3AED)))])),
  ]);

  // ── Step 1: Classes ──
  Widget _stepClasses() {
    final classesAsync = ref.watch(ptmClassesProvider);
    return classesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => const Center(child: Text('Error loading classes')),
      data: (classes) => ListView(padding: const EdgeInsets.all(16), children: [
        // Scope toggle
        _label('TARGET AUDIENCE'),
        const SizedBox(height: 8),
        Row(children: [
          _scopeChip('All My Classes', 'all'),
          const SizedBox(width: 8),
          _scopeChip('Select Specific', 'selected'),
        ]),
        const SizedBox(height: 16),
        if (_scope == 'selected') ...[
          _label('YOUR CLASSES (${classes.length})'),
          const SizedBox(height: 8),
          ...classes.map((c) => _classCard(c)),
        ] else Container(padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: const Color(0xFFF0FDF4), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFDCFCE7))),
          child: Row(children: [const Icon(Icons.check_circle_rounded, color: Color(0xFF16A34A), size: 20), const SizedBox(width: 10),
            Expanded(child: Text('All ${classes.length} classes will be included', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF166534))))])),
      ]),
    );
  }

  Widget _scopeChip(String label, String value) {
    final on = _scope == value;
    return Expanded(child: GestureDetector(onTap: () => setState(() { _scope = value; if (value == 'all') _selectedClassIds.clear(); }),
      child: Container(padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          gradient: on ? const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF6366F1)]) : null,
          color: on ? null : Colors.white, borderRadius: BorderRadius.circular(14),
          border: on ? null : Border.all(color: const Color(0xFFE2E8F0))),
        child: Center(child: Text(label, style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w800, color: on ? Colors.white : const Color(0xFF64748B)))))));
  }

  Widget _classCard(PTMClassroom c) {
    final sel = _selectedClassIds.contains(c.id);
    return GestureDetector(onTap: () => setState(() { if (sel) _selectedClassIds.remove(c.id); else _selectedClassIds.add(c.id); }),
      child: Container(margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: sel ? const Color(0xFF7C3AED).withOpacity(0.04) : Colors.white, borderRadius: BorderRadius.circular(16),
          border: Border.all(color: sel ? const Color(0xFF7C3AED).withOpacity(0.3) : const Color(0xFFE2E8F0), width: sel ? 2 : 1)),
        child: Row(children: [
          Container(width: 20, height: 20,
            decoration: BoxDecoration(gradient: sel ? const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF6366F1)]) : null,
              color: sel ? null : const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(6), border: sel ? null : Border.all(color: const Color(0xFFE2E8F0))),
            child: sel ? const Icon(Icons.check_rounded, size: 14, color: Colors.white) : null),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text(c.name, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF140E28))),
              if (c.isClassTeacher) ...[const SizedBox(width: 6), Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                decoration: BoxDecoration(color: const Color(0xFFFFF7ED), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFFED7AA))),
                child: const Text('Class Teacher', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFFF97316))))],
            ]),
            Text('${c.studentCount} students', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w500, color: Color(0xFF94A3B8))),
          ])),
          Text('${c.studentCount}', style: TextStyle(fontFamily: 'Outfit', fontSize: 18, fontWeight: FontWeight.w900, color: sel ? const Color(0xFF7C3AED) : const Color(0xFFE2E8F0))),
        ])));
  }

  // ── Step 2: Students ──
  Widget _stepStudents() {
    final classesAsync = ref.watch(ptmClassesProvider);
    return classesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => const Center(child: Text('Error')),
      data: (classes) {
        final relevant = _scope == 'all' ? classes : classes.where((c) => _selectedClassIds.contains(c.id)).toList();
        final allStudents = relevant.expand((c) => c.students).toList();
        final filtered = _searchQ.isEmpty ? allStudents : allStudents.where((s) => s.fullName.toLowerCase().contains(_searchQ.toLowerCase())).toList();
        return Column(children: [
          Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(children: [
              _scopeChip2('All Students (${allStudents.length})', true),
              const SizedBox(width: 8),
              _scopeChip2('Custom Selection', false),
            ])),
          if (!_allStudents) Padding(padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: Container(height: 44, decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Row(children: [const Icon(Icons.search_rounded, size: 18, color: Color(0xFF94A3B8)), const SizedBox(width: 8),
                Expanded(child: TextField(onChanged: (v) => setState(() => _searchQ = v),
                  style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13),
                  decoration: const InputDecoration(hintText: 'Search students...', border: InputBorder.none, isDense: true, hintStyle: TextStyle(color: Color(0xFF94A3B8))))),
                if (_selectedStudentIds.isNotEmpty) Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(color: const Color(0xFF7C3AED).withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: Text('${_selectedStudentIds.length}', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF7C3AED)))),
              ]))),
          Expanded(child: _allStudents
            ? Center(child: Container(margin: const EdgeInsets.all(16), padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: const Color(0xFFF0FDF4), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFDCFCE7))),
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.groups_rounded, size: 40, color: Color(0xFF16A34A)),
                  const SizedBox(height: 10),
                  Text('All ${allStudents.length} students included', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF166534))),
                  const SizedBox(height: 4),
                  const Text('Parents of all students will be able to book slots', textAlign: TextAlign.center,
                    style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF64748B)))])))
            : ListView.builder(padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                itemCount: filtered.length, itemBuilder: (_, i) => _studentRow(filtered[i]))),
        ]);
      },
    );
  }

  Widget _scopeChip2(String label, bool val) {
    final on = _allStudents == val;
    return Expanded(child: GestureDetector(onTap: () => setState(() { _allStudents = val; if (val) _selectedStudentIds.clear(); }),
      child: Container(padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          gradient: on ? const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF6366F1)]) : null,
          color: on ? null : Colors.white, borderRadius: BorderRadius.circular(12),
          border: on ? null : Border.all(color: const Color(0xFFE2E8F0))),
        child: Center(child: Text(label, style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w800, color: on ? Colors.white : const Color(0xFF64748B)))))));
  }

  Widget _studentRow(PTMStudent s) {
    final sel = _selectedStudentIds.contains(s.id);
    return GestureDetector(onTap: () => setState(() { if (sel) _selectedStudentIds.remove(s.id); else _selectedStudentIds.add(s.id); }),
      child: Container(margin: const EdgeInsets.only(bottom: 6), padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(color: sel ? const Color(0xFF7C3AED).withOpacity(0.04) : Colors.white, borderRadius: BorderRadius.circular(12),
          border: Border.all(color: sel ? const Color(0xFF7C3AED).withOpacity(0.3) : const Color(0xFFF1F5F9))),
        child: Row(children: [
          Container(width: 18, height: 18,
            decoration: BoxDecoration(gradient: sel ? const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF6366F1)]) : null,
              color: sel ? null : const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(5), border: sel ? null : Border.all(color: const Color(0xFFE2E8F0))),
            child: sel ? const Icon(Icons.check_rounded, size: 12, color: Colors.white) : null),
          const SizedBox(width: 10),
          Container(width: 32, height: 32, decoration: BoxDecoration(color: const Color(0xFF7C3AED).withOpacity(0.08), borderRadius: BorderRadius.circular(10)),
            child: Center(child: Text(s.firstName.isNotEmpty ? s.firstName[0].toUpperCase() : '?', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF7C3AED))))),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(s.fullName, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF140E28))),
            if (s.admissionNo != null) Text('#${s.admissionNo}', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w500, color: Color(0xFF94A3B8))),
          ])),
          if (s.parentMobile != null) const Icon(Icons.phone_outlined, size: 14, color: Color(0xFF94A3B8)),
        ])));
  }

  // ── Step 3: Review ──
  Widget _stepReview() {
    final classesAsync = ref.watch(ptmClassesProvider);
    return classesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => const Center(child: Text('Error')),
      data: (classes) {
        final relevant = _scope == 'all' ? classes : classes.where((c) => _selectedClassIds.contains(c.id)).toList();
        final studentCount = _allStudents ? relevant.fold<int>(0, (s, c) => s + c.studentCount) : _selectedStudentIds.length;
        return ListView(padding: const EdgeInsets.all(16), children: [
          // Review card
          Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.15)),
            boxShadow: [BoxShadow(color: const Color(0xFF7C3AED).withOpacity(0.06), blurRadius: 16)]),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(_titleCtrl.text.isNotEmpty ? _titleCtrl.text : 'Untitled Session', style: const TextStyle(fontFamily: 'Outfit', fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF140E28))),
              if (_descCtrl.text.isNotEmpty) ...[const SizedBox(height: 4), Text(_descCtrl.text, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF64748B)))],
              const SizedBox(height: 14), const Divider(height: 1),
              const SizedBox(height: 14),
              _reviewRow(Icons.calendar_today_rounded, 'Date', _date != null ? '${_date!.day}/${_date!.month}/${_date!.year}' : 'Not set'),
              _reviewRow(Icons.access_time_rounded, 'Time', '$_startTime – $_endTime'),
              _reviewRow(Icons.timelapse_rounded, 'Slots', '$_slotCount slots × ${_slotMinutes}m'),
              _reviewRow(Icons.school_rounded, 'Classes', _scope == 'all' ? 'All ${relevant.length} classes' : '${_selectedClassIds.length} selected'),
              _reviewRow(Icons.people_rounded, 'Students', _allStudents ? 'All $studentCount students' : '${_selectedStudentIds.length} selected'),
              if (_venueCtrl.text.isNotEmpty) _reviewRow(Icons.location_on_rounded, 'Venue', _venueCtrl.text),
            ])),
          const SizedBox(height: 14),
          Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: const Color(0xFFFFF7ED), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFFED7AA))),
            child: const Row(children: [Icon(Icons.info_outline_rounded, size: 16, color: Color(0xFFF97316)), SizedBox(width: 8),
              Expanded(child: Text('Parents will be able to book slots once published', style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFFF97316))))])),
        ]);
      },
    );
  }

  Widget _reviewRow(IconData ic, String label, String val) => Padding(padding: const EdgeInsets.symmetric(vertical: 5),
    child: Row(children: [Icon(ic, size: 16, color: const Color(0xFF7C3AED)), const SizedBox(width: 10),
      Text('$label:', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8))),
      const SizedBox(width: 8), Expanded(child: Text(val, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF140E28))))]));

  // ── Bottom bar ──
  Widget _bottomBar() => Container(
    padding: EdgeInsets.fromLTRB(16, 12, 16, MediaQuery.of(context).padding.bottom + 12),
    decoration: BoxDecoration(color: const Color(0xFFFAFBFE), border: const Border(top: BorderSide(color: Color(0xFFF1F5F9)))),
    child: Row(children: [
      if (_step > 0) Expanded(child: GestureDetector(onTap: () => setState(() => _step--),
        child: Container(padding: const EdgeInsets.symmetric(vertical: 14), decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(14)),
          child: const Center(child: Text('Back', style: TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF64748B))))))),
      if (_step > 0) const SizedBox(width: 10),
      Expanded(flex: 2, child: GestureDetector(
        onTap: _step == 3 ? (_isCreating ? null : _submit) : () {
          if (_step == 0 && (_titleCtrl.text.isEmpty || _date == null)) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Title and date are required'), backgroundColor: Color(0xFFDC2626)));
            return;
          }
          if (_step == 1 && _scope == 'selected' && _selectedClassIds.isEmpty) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Select at least one class'), backgroundColor: Color(0xFFDC2626)));
            return;
          }
          setState(() => _step++);
        },
        child: Container(padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF6366F1)]),
            borderRadius: BorderRadius.circular(14),
            boxShadow: [BoxShadow(color: const Color(0xFF7C3AED).withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4))]),
          child: Center(child: _step == 3
            ? (_isCreating ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('🚀 Publish Session', style: TextStyle(fontFamily: 'Satoshi', fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)))
            : Text('Next →', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)))))),
    ]),
  );

  // ── Helpers ──
  Widget _label(String t) => Padding(padding: const EdgeInsets.only(bottom: 6),
    child: Text(t, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 0.8)));

  Widget _input(TextEditingController c, String hint, {int lines = 1}) => TextField(controller: c, maxLines: lines,
    style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF140E28)),
    decoration: InputDecoration(hintText: hint, hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.w500),
      filled: true, fillColor: const Color(0xFFF8FAFC), contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14), isDense: true,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF7C3AED)))));

  BoxDecoration _fieldDeco() => BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFE2E8F0)));

  Widget _timePick(String label, String val, ValueChanged<String> cb) => GestureDetector(
    onTap: () async {
      final p = val.split(':');
      final t = await showTimePicker(context: context, initialTime: TimeOfDay(hour: int.parse(p[0]), minute: int.parse(p[1])));
      if (t != null) cb('${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}');
    },
    child: Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12), decoration: _fieldDeco(),
      child: Column(children: [
        Text(label, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF94A3B8), letterSpacing: 0.6)),
        const SizedBox(height: 3),
        Text(val, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF140E28)))])));

  Widget _slotPick() => Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8), decoration: _fieldDeco(),
    child: Column(children: [const Text('SLOT', style: TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF94A3B8), letterSpacing: 0.6)),
      const SizedBox(height: 3), DropdownButton<int>(value: _slotMinutes, isDense: true, underline: const SizedBox(),
        style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF140E28)),
        items: [5, 10, 15, 20, 30].map((m) => DropdownMenuItem(value: m, child: Text('${m}m'))).toList(),
        onChanged: (v) => setState(() => _slotMinutes = v ?? 10))]));

  String _wd(int w) => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][w-1];
}
