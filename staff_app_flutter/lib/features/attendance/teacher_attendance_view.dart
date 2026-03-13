import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/state/auth_state.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/app_calendar.dart';

// ─── Models ──────────────────────────────────────────────────────────────────

class ClassroomItem {
  final String id;
  final String name;
  final int studentCount;
  final bool isClassTeacher;

  ClassroomItem({
    required this.id,
    required this.name,
    required this.studentCount,
    required this.isClassTeacher,
  });

  factory ClassroomItem.fromJson(Map<String, dynamic> j) => ClassroomItem(
        id: j['id'] ?? '',
        name: j['name'] ?? 'Class',
        studentCount: j['studentCount'] ?? 0,
        isClassTeacher: j['isClassTeacher'] ?? false,
      );
}

/// Holds attendance data per student for a specific class+date session.
class AttendanceEntry {
  final String studentId;
  final String studentName;
  final String? rollNo;
  final String? avatar;
  String status;              // 'PRESENT' | 'ABSENT' | 'LATE' | ''
  bool isSaved;               // true = synced to backend
  bool isSubmitted;           // true = finalized, most changes locked
  bool isSaving;              // true = currently awaiting API response

  AttendanceEntry({
    required this.studentId,
    required this.studentName,
    this.rollNo,
    this.avatar,
    this.status = '',
    this.isSaved = false,
    this.isSubmitted = false,
    this.isSaving = false,
  });

  factory AttendanceEntry.fromJson(Map<String, dynamic> j) => AttendanceEntry(
        studentId: j['id'] ?? j['studentId'] ?? '',
        studentName: j['name'] ?? '${j['firstName'] ?? ''} ${j['lastName'] ?? ''}'.trim(),
        rollNo: j['rollNo']?.toString() ?? j['admissionNumber'],
        avatar: j['avatar'],
        status: j['todayStatus'] ?? j['status'] ?? '',
        isSaved: (j['todayStatus'] ?? j['status'] ?? '').isNotEmpty,
        isSubmitted: false,
      );

  /// Whether this entry can be changed after finalization.
  /// Rule: Absent → Late is allowed, everything else is locked.
  bool canChangeAfterSubmit(String newStatus) {
    if (status == 'ABSENT' && newStatus == 'LATE') return true;
    return false;
  }

  AttendanceEntry copyWith({
    String? status,
    bool? isSaved,
    bool? isSubmitted,
    bool? isSaving,
  }) => AttendanceEntry(
        studentId: studentId,
        studentName: studentName,
        rollNo: rollNo,
        avatar: avatar,
        status: status ?? this.status,
        isSaved: isSaved ?? this.isSaved,
        isSubmitted: isSubmitted ?? this.isSubmitted,
        isSaving: isSaving ?? this.isSaving,
      );
}

// ─── Session key ─────────────────────────────────────────────────────────────

/// Key: "classroomId::dateStr"
String _makeSessionKey(String classroomId, String dateStr) => '$classroomId::$dateStr';

// ─── Global Attendance State (persists across navigation) ────────────────────

class AttendanceSession {
  final ClassroomItem classroom;
  final String dateStr;
  final List<AttendanceEntry> entries;
  final bool allSubmitted;  // entire session submitted

  AttendanceSession({
    required this.classroom,
    required this.dateStr,
    required this.entries,
    this.allSubmitted = false,
  });

  AttendanceSession copyWith({
    List<AttendanceEntry>? entries,
    bool? allSubmitted,
  }) => AttendanceSession(
        classroom: classroom,
        dateStr: dateStr,
        entries: entries ?? this.entries,
        allSubmitted: allSubmitted ?? this.allSubmitted,
      );
}

class AttendanceStateNotifier extends StateNotifier<Map<String, AttendanceSession>> {
  AttendanceStateNotifier() : super({});

  void setSession(String key, AttendanceSession session) {
    state = {...state, key: session};
  }

  void updateEntry(String key, String studentId, AttendanceEntry entry) {
    final session = state[key];
    if (session == null) return;
    final newEntries = session.entries.map((e) => e.studentId == studentId ? entry : e).toList();
    state = {...state, key: session.copyWith(entries: newEntries)};
  }

  void markAllSubmitted(String key) {
    final session = state[key];
    if (session == null) return;
    final newEntries = session.entries.map((e) => e.copyWith(isSubmitted: true)).toList();
    state = {...state, key: session.copyWith(entries: newEntries, allSubmitted: true)};
  }

  AttendanceSession? getSession(String key) => state[key];
}

// Global provider — persists as long as the app is alive
final attendanceStateProvider = StateNotifierProvider<AttendanceStateNotifier, Map<String, AttendanceSession>>(
  (ref) => AttendanceStateNotifier(),
);

// Classrooms list — cached across navigations
final _classroomsProvider = FutureProvider.autoDispose<List<ClassroomItem>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) return [];
  final res = await http.get(
    Uri.parse('http://localhost:3000/api/mobile/v1/staff/attendance/classrooms'),
    headers: {'Authorization': 'Bearer ${user!.token}'},
  );
  if (res.statusCode == 200) {
    final data = jsonDecode(res.body);
    if (data['success'] == true) {
      return (data['classrooms'] as List)
          .map((e) => ClassroomItem.fromJson(e as Map<String, dynamic>))
          .toList();
    }
  }
  return [];
});

// ─── Main Widget ─────────────────────────────────────────────────────────────

class TeacherAttendanceView extends ConsumerStatefulWidget {
  const TeacherAttendanceView({super.key});

  @override
  ConsumerState<TeacherAttendanceView> createState() => _TeacherAttendanceViewState();
}

class _TeacherAttendanceViewState extends ConsumerState<TeacherAttendanceView> {
  ClassroomItem? _selectedClass;
  DateTime _selectedDate = DateTime.now();
  bool _loadingStudents = false;
  String? _error;

  String get _dateStr =>
      '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';

  String get _sessionKey => _selectedClass != null ? _makeSessionKey(_selectedClass!.id, _dateStr) : '';
  String _sessionKey2(String classId, String date) => _makeSessionKey(classId, date);


  AttendanceSession? get _currentSession {
    if (_sessionKey.isEmpty) return null;
    return ref.read(attendanceStateProvider)[_sessionKey];
  }

  List<AttendanceEntry> get _entries => _currentSession?.entries ?? [];
  bool get _allSubmitted => _currentSession?.allSubmitted ?? false;
  bool get _canMark => _selectedClass?.isClassTeacher ?? false;

  int get _presentCount => _entries.where((s) => s.status == 'PRESENT').length;
  int get _absentCount => _entries.where((s) => s.status == 'ABSENT').length;
  int get _lateCount => _entries.where((s) => s.status == 'LATE').length;
  int get _unmarkedCount => _entries.where((s) => s.status.isEmpty).length;
  int get _savedCount => _entries.where((s) => s.isSaved).length;

  // ── Auto-Save ────────────────────────────────────────────────────────────

  Future<void> _autoSave(AttendanceEntry entry, String newStatus) async {
    if (!_canMark || _sessionKey.isEmpty) return;

    // If already submitted, check rule: only ABSENT→LATE allowed
    if (entry.isSubmitted) {
      if (!entry.canChangeAfterSubmit(newStatus)) return;
    }

    final user = ref.read(userProfileProvider);
    if (user?.token == null) return;

    // Just update local state — no API call needed when clearing a status
    if (newStatus.isEmpty) {
      ref.read(attendanceStateProvider.notifier).updateEntry(
        _sessionKey, entry.studentId,
        entry.copyWith(status: '', isSaved: false, isSaving: false),
      );
      return;
    }

    // Resolve slug — use stored schoolSlug or fall back to schoolName
    final slug = user!.schoolSlug.isNotEmpty
        ? user.schoolSlug
        : user.schoolName.toLowerCase().replaceAll(RegExp(r'\s+'), '');

    // Optimistically update state
    final updated = entry.copyWith(status: newStatus, isSaving: true, isSaved: false);
    ref.read(attendanceStateProvider.notifier).updateEntry(_sessionKey, entry.studentId, updated);

    try {
      final res = await http.post(
        Uri.parse('http://localhost:3000/api/mobile/v1/staff/attendance/mark'),
        headers: {
          'Authorization': 'Bearer ${user.token}',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'slug': slug,
          'studentId': entry.studentId,
          'date': _dateStr,
          'status': newStatus,
        }),
      );

      final saved = res.statusCode == 200;
      if (!saved) {
        debugPrint('Auto-save failed [${res.statusCode}]: ${res.body}');
      }
      ref.read(attendanceStateProvider.notifier).updateEntry(
        _sessionKey,
        entry.studentId,
        updated.copyWith(isSaving: false, isSaved: saved),
      );
    } catch (e) {
      debugPrint('Auto-save error: $e');
      // Revert on error
      ref.read(attendanceStateProvider.notifier).updateEntry(
        _sessionKey,
        entry.studentId,
        entry.copyWith(isSaving: false),
      );
    }
  }


  Future<void> _loadStudents() async {
    if (_selectedClass == null) return;

    // Use cached session if it exists for this class+date
    final existing = ref.read(attendanceStateProvider)[_sessionKey];
    if (existing != null) return; // already loaded — state persists!

    final user = ref.read(userProfileProvider);
    if (user?.token == null) return;

    setState(() { _loadingStudents = true; _error = null; });

    try {
      final uri = Uri.parse(
        'http://localhost:3000/api/mobile/v1/staff/attendance/students'
        '?classroomId=${_selectedClass!.id}&date=$_dateStr&slug=${user!.schoolSlug}',
      );
      final res = await http.get(uri, headers: {'Authorization': 'Bearer ${user.token}'});

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true) {
          final list = (data['students'] as List? ?? [])
              .map((e) => AttendanceEntry.fromJson(e as Map<String, dynamic>))
              .toList();

          final session = AttendanceSession(
            classroom: _selectedClass!,
            dateStr: _dateStr,
            entries: list,
          );
          ref.read(attendanceStateProvider.notifier).setSession(_sessionKey, session);
          setState(() { _loadingStudents = false; });
          return;
        }
      }
      setState(() { _error = 'Failed to load students'; _loadingStudents = false; });
    } catch (e) {
      setState(() { _error = 'Connection error'; _loadingStudents = false; });
    }
  }

  Future<void> _submitAll() async {
    if (!_canMark || _entries.isEmpty) return;

    final unmarked = _entries.where((s) => s.status.isEmpty).toList();
    if (unmarked.isNotEmpty) {
      final confirmed = await _showDialog(
        'Unmarked Students',
        '${unmarked.length} student(s) have no status. Submit anyway?',
        confirmLabel: 'Submit',
      );
      if (confirmed != true) return;
    }

    // Save all un-saved entries first
    final unsaved = _entries.where((e) => e.status.isNotEmpty && !e.isSaved).toList();
    for (final entry in unsaved) {
      await _autoSave(entry, entry.status);
    }

    // Mark entire session as submitted (locks editing except A→L)
    ref.read(attendanceStateProvider.notifier).markAllSubmitted(_sessionKey);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Attendance finalized for $_savedCount student(s)'),
          backgroundColor: const Color(0xFF16A34A),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  Future<bool?> _showDialog(String title, String msg, {String confirmLabel = 'OK'}) =>
      showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(title, style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w800)),
          content: Text(msg, style: const TextStyle(fontFamily: 'Satoshi')),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.teacherTheme.colors.first),
              onPressed: () => Navigator.pop(ctx, true),
              child: Text(confirmLabel, style: const TextStyle(color: Colors.white)),
            ),
          ],
        ),
      );

  void _pickDate() async {
    final picked = await showAppDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().subtract(const Duration(days: 90)),
      lastDate: DateTime.now(),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() { _selectedDate = picked; });
      _loadStudents();
    }
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final classrooms = ref.watch(_classroomsProvider);
    final sessions = ref.watch(attendanceStateProvider);
    final session = sessions[_sessionKey];
    final entries = session?.entries ?? [];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Class + Date row
        Row(
          children: [
            Expanded(child: _buildClassPicker(classrooms)),
            const SizedBox(width: 10),
            _buildDateChip(),
          ],
        ),
        const SizedBox(height: 12),

        // Permission badge
        if (_selectedClass != null) _buildPermissionBadge(),
        const SizedBox(height: 12),

        // Stats
        if (entries.isNotEmpty) ...[
          _buildStatsRow(entries),
          const SizedBox(height: 4),
          // Auto-save progress line
          _buildSaveProgress(entries),
          const SizedBox(height: 14),
        ],

        // Content
        if (_selectedClass == null)
          _buildEmptyState(icon: Icons.class_outlined, message: 'Select a class to view attendance')
        else if (_loadingStudents)
          const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator()))
        else if (_error != null)
          _buildEmptyState(icon: Icons.error_outline, message: _error!)
        else if (entries.isEmpty)
          _buildEmptyState(icon: Icons.people_outline, message: 'No students found in this class')
        else ...[
          // Submitted banner
          if (_allSubmitted) _buildSubmittedBanner(),

          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color.fromRGBO(20, 14, 40, 0.07), width: 1.5),
            ),
            child: Column(
              children: entries.asMap().entries.map((e) =>
                _buildStudentRow(e.value, isLast: e.key == entries.length - 1)
              ).toList(),
            ),
          ),
          const SizedBox(height: 20),

          if (_canMark && !_allSubmitted) _buildSubmitButton(entries),

          if (!_canMark) _buildViewOnlyNote(),
        ],
        const SizedBox(height: 80),
      ],
    );
  }

  // ── Sub-widgets ───────────────────────────────────────────────────────────

  Widget _buildClassPicker(AsyncValue<List<ClassroomItem>> classrooms) {
    return classrooms.when(
      loading: () => _shimmer(52),
      error: (_, __) => Container(
        height: 52,
        decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(16)),
        child: const Center(child: Text('Error loading classes')),
      ),
      data: (classes) => GestureDetector(
        onTap: () => _showClassSheet(classes),
        child: Container(
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: _selectedClass != null
                  ? AppTheme.teacherTheme.colors.first.withOpacity(0.4)
                  : const Color.fromRGBO(20, 14, 40, 0.1),
              width: 1.5,
            ),
            boxShadow: [BoxShadow(color: const Color.fromRGBO(20, 14, 40, 0.05), blurRadius: 8, offset: const Offset(0, 2))],
          ),
          child: Row(
            children: [
              Icon(Icons.class_rounded,
                color: _selectedClass != null ? AppTheme.teacherTheme.colors.first : const Color(0xFF7B7291),
                size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  _selectedClass?.name ?? 'Choose Class',
                  style: TextStyle(
                    fontFamily: 'Satoshi', fontWeight: FontWeight.w700, fontSize: 14,
                    color: _selectedClass != null ? const Color(0xFF140E28) : const Color(0xFF7B7291),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (_selectedClass != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppTheme.teacherTheme.colors.first.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text('${_selectedClass!.studentCount}',
                    style: TextStyle(color: AppTheme.teacherTheme.colors.first, fontSize: 11, fontWeight: FontWeight.w800)),
                )
              else
                const Icon(Icons.expand_more_rounded, color: Color(0xFF7B7291), size: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDateChip() {
    final isToday = _selectedDate.day == DateTime.now().day &&
        _selectedDate.month == DateTime.now().month &&
        _selectedDate.year == DateTime.now().year;
    return GestureDetector(
      onTap: _pickDate,
      child: Container(
        height: 52,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: isToday ? AppTheme.teacherTheme.colors.first.withOpacity(0.08) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isToday ? AppTheme.teacherTheme.colors.first.withOpacity(0.3) : const Color.fromRGBO(20, 14, 40, 0.1),
            width: 1.5,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.calendar_today_rounded,
              color: isToday ? AppTheme.teacherTheme.colors.first : const Color(0xFF7B7291), size: 16),
            const SizedBox(height: 2),
            Text(
              isToday ? 'Today' : '${_selectedDate.day}/${_selectedDate.month}',
              style: TextStyle(
                fontFamily: 'Satoshi', fontWeight: FontWeight.w700, fontSize: 11,
                color: isToday ? AppTheme.teacherTheme.colors.first : const Color(0xFF7B7291),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPermissionBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: _canMark ? const Color(0xFFF0FDF4) : const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _canMark ? const Color(0xFF16A34A).withOpacity(0.3) : const Color(0xFFD97706).withOpacity(0.3),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _canMark ? Icons.edit_note_rounded : Icons.visibility_outlined,
            size: 15, color: _canMark ? const Color(0xFF16A34A) : const Color(0xFFD97706),
          ),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              _canMark
                  ? 'Class teacher — attendance auto-saves on tap'
                  : 'View only — you cannot mark attendance for this class',
              style: TextStyle(
                fontFamily: 'Satoshi', fontWeight: FontWeight.w600, fontSize: 12,
                color: _canMark ? const Color(0xFF166534) : const Color(0xFF92400E),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow(List<AttendanceEntry> entries) {
    return Row(
      children: [
        _statChip('P', _presentCount, const Color(0xFF16A34A), const Color(0xFFF0FDF4)),
        const SizedBox(width: 10),
        _statChip('A', _absentCount, const Color(0xFFDC2626), const Color(0xFFFEF2F2)),
        const SizedBox(width: 10),
        _statChip('L', _lateCount, const Color(0xFFD97706), const Color(0xFFFFFBEB)),
        const SizedBox(width: 10),
        _statChip('?', _unmarkedCount, const Color(0xFF7B7291), const Color(0xFFF5F3FF)),
      ],
    );
  }

  Widget _statChip(String label, int count, Color color, Color bg) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: bg, borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Text('$count', style: TextStyle(fontFamily: 'Clash Display', fontSize: 20, fontWeight: FontWeight.w700, color: color)),
            Text(
              label == 'P' ? 'Present' : label == 'A' ? 'Absent' : label == 'L' ? 'Late' : 'Unmarked',
              style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w600, color: color),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSaveProgress(List<AttendanceEntry> entries) {
    final total = entries.where((e) => e.status.isNotEmpty).length;
    final saved = entries.where((e) => e.isSaved).length;
    final saving = entries.any((e) => e.isSaving);

    if (total == 0) return const SizedBox.shrink();

    return Row(
      children: [
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: total > 0 ? saved / total : 0,
              backgroundColor: const Color(0xFFEDE9F6),
              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.teacherTheme.colors.first),
              minHeight: 4,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          saving ? 'Saving...' : '$saved/$total saved',
          style: TextStyle(
            fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w700,
            color: saving ? const Color(0xFFD97706) : AppTheme.teacherTheme.colors.first,
          ),
        ),
      ],
    );
  }

  Widget _buildSubmittedBanner() {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF16A34A), Color(0xFF15803D)]),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Row(
        children: [
          Icon(Icons.lock_rounded, color: Colors.white, size: 18),
          SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Attendance Finalized',
                  style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w800, fontSize: 14, color: Colors.white)),
                Text('Only Absent → Late changes are allowed after submission',
                  style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, color: Colors.white70)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStudentRow(AttendanceEntry entry, {required bool isLast}) {
    final initials = entry.studentName.isNotEmpty
        ? entry.studentName.split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join().toUpperCase()
        : '?';

    // Determine if row is locked
    final isLocked = entry.isSubmitted && !entry.canChangeAfterSubmit('LATE') && entry.status != 'ABSENT';
    // "LATE" button enabled if submitted AND currently ABSENT (A→L exception)
    final lateAllowed = entry.isSubmitted && entry.status == 'ABSENT';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        border: isLast ? null : const Border(bottom: BorderSide(color: Color.fromRGBO(20, 14, 40, 0.05))),
        color: entry.isSaving ? const Color(0xFFFFFBEB) : null,
      ),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 38, height: 38,
            decoration: BoxDecoration(gradient: AppTheme.teacherTheme, borderRadius: BorderRadius.circular(10)),
            child: Center(
              child: Text(initials,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12)),
            ),
          ),
          const SizedBox(width: 12),

          // Name + save indicator
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(entry.studentName,
                        style: const TextStyle(fontFamily: 'Satoshi', fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF140E28)),
                        overflow: TextOverflow.ellipsis),
                    ),
                    if (entry.isSaving) ...[
                      const SizedBox(width: 6),
                      const SizedBox(width: 10, height: 10,
                        child: CircularProgressIndicator(strokeWidth: 1.5, color: Color(0xFFD97706))),
                    ] else if (entry.isSaved && entry.status.isNotEmpty) ...[
                      const SizedBox(width: 6),
                      const Icon(Icons.cloud_done_rounded, size: 12, color: Color(0xFF16A34A)),
                    ],
                    if (entry.isSubmitted) ...[
                      const SizedBox(width: 4),
                      const Icon(Icons.lock_rounded, size: 11, color: Color(0xFF7B7291)),
                    ],
                  ],
                ),
                if (entry.rollNo != null)
                  Text('Roll #${entry.rollNo}',
                    style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w500, color: Color(0xFF7B7291))),
              ],
            ),
          ),

          // P / A / L buttons
          Row(
            children: [
              _statusBtn(entry, 'PRESENT', 'P',
                enabled: _canMark && !entry.isSubmitted),
              const SizedBox(width: 4),
              _statusBtn(entry, 'ABSENT', 'A',
                enabled: _canMark && !entry.isSubmitted),
              const SizedBox(width: 4),
              _statusBtn(entry, 'LATE', 'L',
                enabled: _canMark && (!entry.isSubmitted || lateAllowed)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _statusBtn(AttendanceEntry entry, String value, String label, {required bool enabled}) {
    final isSelected = entry.status == value;
    final Color activeColor = value == 'PRESENT'
        ? const Color(0xFF16A34A)
        : value == 'ABSENT' ? const Color(0xFFDC2626) : const Color(0xFFD97706);

    return GestureDetector(
      onTap: enabled && !entry.isSaving
          ? () => _autoSave(entry, isSelected ? '' : value)
          : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: 32, height: 32,
        decoration: BoxDecoration(
          color: isSelected ? activeColor : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? Colors.transparent : const Color.fromRGBO(20, 14, 40, 0.07),
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12, fontWeight: FontWeight.w800,
              color: isSelected
                  ? Colors.white
                  : enabled ? const Color(0xFF7B7291) : const Color(0xFFD0CCDC),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSubmitButton(List<AttendanceEntry> entries) {
    final allSaved = entries.where((e) => e.status.isNotEmpty).every((e) => e.isSaved);
    return GestureDetector(
      onTap: _submitAll,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          gradient: AppTheme.teacherTheme,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: AppTheme.teacherTheme.colors.first.withOpacity(0.3),
              blurRadius: 12, offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(allSaved ? Icons.task_alt_rounded : Icons.send_rounded, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Text(
              allSaved ? 'Finalize & Lock Attendance' : 'Save All & Finalize',
              style: const TextStyle(fontFamily: 'Satoshi', fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildViewOnlyNote() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFD97706).withOpacity(0.3)),
      ),
      child: const Row(
        children: [
          Icon(Icons.lock_outline_rounded, color: Color(0xFFD97706), size: 18),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'Only the assigned class teacher can mark attendance for this class.',
              style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF92400E)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState({required IconData icon, required String message}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Column(
        children: [
          Icon(icon, size: 48, color: const Color(0xFFD1C9E8)),
          const SizedBox(height: 12),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(fontFamily: 'Satoshi', fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF7B7291)),
          ),
        ],
      ),
    );
  }

  Widget _shimmer(double height) => Container(
    height: height,
    decoration: BoxDecoration(color: const Color(0xFFF0ECF8), borderRadius: BorderRadius.circular(16)),
  );

  void _showClassSheet(List<ClassroomItem> classes) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.65),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          children: [
            Center(child: Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40, height: 4,
              decoration: BoxDecoration(color: const Color(0xFFE2D9F3), borderRadius: BorderRadius.circular(2)),
            )),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(gradient: AppTheme.teacherTheme, borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.class_rounded, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Choose Class',
                        style: TextStyle(fontFamily: 'Clash Display', fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF140E28))),
                      Text('Select a class to view or mark attendance',
                        style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, color: Color(0xFF7B7291))),
                    ],
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: Color.fromRGBO(20, 14, 40, 0.06)),
            if (classes.isEmpty)
              const Padding(
                padding: EdgeInsets.all(40),
                child: Text(
                  'No classes assigned. Contact admin.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontFamily: 'Satoshi', color: Color(0xFF7B7291)),
                ),
              )
            else
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: classes.length,
                  itemBuilder: (ctx, i) {
                    final cls = classes[i];
                    final isSelected = _selectedClass?.id == cls.id;
                    // Check if session exists for this class (shows saved count)
                    final sessionKey = _sessionKey2(cls.id, _dateStr);
                    final existingSession = ref.read(attendanceStateProvider)[sessionKey];
                    final savedCount = existingSession?.entries.where((e) => e.isSaved).length ?? 0;
                    final isSubmitted = existingSession?.allSubmitted ?? false;

                    return ListTile(
                      onTap: () {
                        Navigator.pop(ctx);
                        setState(() { _selectedClass = cls; });
                        _loadStudents();
                      },
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                      leading: Container(
                        width: 44, height: 44,
                        decoration: BoxDecoration(
                          gradient: cls.isClassTeacher
                              ? AppTheme.teacherTheme
                              : const LinearGradient(colors: [Color(0xFFE8E4F4), Color(0xFFD4CDE8)]),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Center(
                          child: Text(
                            cls.name.length >= 2 ? cls.name.substring(0, 2).toUpperCase() : cls.name,
                            style: TextStyle(
                              color: cls.isClassTeacher ? Colors.white : const Color(0xFF7B7291),
                              fontWeight: FontWeight.w800, fontSize: 14,
                            ),
                          ),
                        ),
                      ),
                      title: Text(cls.name,
                        style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700, fontSize: 15, color: Color(0xFF140E28))),
                      subtitle: Row(
                        children: [
                          Text('${cls.studentCount} students',
                            style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, color: Color(0xFF7B7291))),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: cls.isClassTeacher ? const Color(0xFFF0FDF4) : const Color(0xFFFFFBEB),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              cls.isClassTeacher ? '✏️ Can mark' : '👁 View only',
                              style: TextStyle(
                                fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w700,
                                color: cls.isClassTeacher ? const Color(0xFF16A34A) : const Color(0xFFD97706),
                              ),
                            ),
                          ),
                          if (isSubmitted) ...[
                            const SizedBox(width: 6),
                            const Icon(Icons.lock_rounded, size: 12, color: Color(0xFF7B7291)),
                          ] else if (savedCount > 0) ...[
                            const SizedBox(width: 6),
                            Text('$savedCount saved',
                              style: const TextStyle(fontSize: 10, color: Color(0xFF7B7291))),
                          ],
                        ],
                      ),
                      trailing: isSelected
                          ? Icon(Icons.check_circle_rounded, color: AppTheme.teacherTheme.colors.first)
                          : const Icon(Icons.chevron_right_rounded, color: Color(0xFFD1C9E8)),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}
