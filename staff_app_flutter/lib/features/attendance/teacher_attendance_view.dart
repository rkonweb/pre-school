import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/state/auth_state.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/app_calendar.dart';
import '../../shared/components/module_popup_shell.dart';

// ─── Design Tokens ────────────────────────────────────────────────────────────

const _ink  = Color(0xFF140E28);
const _ink3 = Color(0xFF7B7291);
const _line = Color(0x12140E28);
const _bg2  = Color(0xFFF5F3FF);
const _tA   = Color(0xFFFF5733);

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

  bool _isMarkingMode = false;
  int _currentMarkIndex = 0;

  // Animation state for button press + card slide
  bool _isAnimatingBtn = false;
  int _slideDirection = 1; // 1 = slide left (next), -1 = slide right (prev)

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
    if (!mounted) return;
    if (!_canMark || _sessionKey.isEmpty) return;

    // If already submitted, check rule: only ABSENT→LATE allowed
    if (entry.isSubmitted) {
      if (!entry.canChangeAfterSubmit(newStatus)) return;
    }

    if (!mounted) return;
    final user = ref.read(userProfileProvider);
    if (user?.token == null) return;

    // Capture everything we need BEFORE any await so we never call ref.read
    // after the widget might be disposed (avoids "Bad state: Cannot use ref
    // after the widget was disposed" and the resulting stuck isSaving spinner).
    final notifier   = ref.read(attendanceStateProvider.notifier);
    final sessionKey = _sessionKey;
    final dateStr    = _dateStr;
    final token      = user!.token!;
    final slug       = user.schoolSlug.isNotEmpty
        ? user.schoolSlug
        : user.schoolName.toLowerCase().replaceAll(RegExp(r'\s+'), '');

    // Just update local state — no API call needed when clearing a status
    if (newStatus.isEmpty) {
      notifier.updateEntry(
        sessionKey, entry.studentId,
        entry.copyWith(status: '', isSaved: false, isSaving: false),
      );
      return;
    }

    // Optimistically update state
    final updated = entry.copyWith(status: newStatus, isSaving: true, isSaved: false);
    notifier.updateEntry(sessionKey, entry.studentId, updated);

    try {
      final res = await http.post(
        Uri.parse('http://localhost:3000/api/mobile/v1/staff/attendance/mark'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'slug': slug,
          'studentId': entry.studentId,
          'date': dateStr,
          'status': newStatus,
        }),
      ).timeout(const Duration(seconds: 10));

      final saved = res.statusCode == 200;
      if (!saved) {
        debugPrint('Auto-save failed [${res.statusCode}]: ${res.body}');
      }
      // Safe to call notifier directly — it's not ref-dependent
      notifier.updateEntry(
        sessionKey, entry.studentId,
        updated.copyWith(isSaving: false, isSaved: saved),
      );
    } catch (e) {
      debugPrint('Auto-save error: $e');
      // Always revert isSaving — notifier captured before await, always safe
      notifier.updateEntry(
        sessionKey, entry.studentId,
        entry.copyWith(isSaving: false),
      );
    }
  }

  void _startMarkingMode(List<AttendanceEntry> entries) {
    if (entries.isEmpty || _allSubmitted) return;
    int firstUnmarked = entries.indexWhere((e) => e.status.isEmpty);
    setState(() {
      _currentMarkIndex = firstUnmarked >= 0 ? firstUnmarked : 0;
      _isMarkingMode = true;
    });
  }

  void _stopMarkingMode() {
    setState(() {
      _isMarkingMode = false;
    });
  }

  Future<void> _markInMode(AttendanceEntry entry, String value) async {
    if (entry.isSaving || _isAnimatingBtn) return;
    setState(() => _isAnimatingBtn = true);
    _autoSave(entry, value);
    // Hold the filled button state briefly so the animation is visible
    await Future.delayed(const Duration(milliseconds: 320));
    if (!mounted) return;
    setState(() {
      _isAnimatingBtn = false;
      _slideDirection = 1; // slide left
    });
    _nextCard();
  }

  void _nextCard() {
    final entries = _entries;
    if (_currentMarkIndex < entries.length - 1) {
      setState(() { _currentMarkIndex++; });
    } else {
      _stopMarkingMode();
    }
  }

  void _skipCard() {
    setState(() => _slideDirection = 1);
    _nextCard();
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
          setState(() { _loadingStudents = false; _isMarkingMode = false; });
          return;
        }
      }
      setState(() { _error = 'Failed to load students'; _loadingStudents = false; _isMarkingMode = false; });
    } catch (e) {
      setState(() { _error = 'Connection error'; _loadingStudents = false; _isMarkingMode = false; });
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

  @override
  Widget build(BuildContext context) {
    final classrooms = ref.watch(_classroomsProvider);
    final sessions   = ref.watch(attendanceStateProvider);
    final session    = sessions[_sessionKey];
    final entries    = session?.entries ?? [];

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FB),
      body: Column(children: [
        // ── Standard Gradient Header ──────────────────────────────────────────
        ModulePageHeader(
          title: 'Attendance',
          icon: Icons.fact_check_rounded,
        ),

        // ── Body ─────────────────────────────────────────────────────────────
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            children: [
              // ── Class & Date selector card ──────────────────────────────
              // ── Class & Date selector ──────────────────────────────────────
              Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Row(children: [
                  Expanded(child: _buildClassPicker(classrooms)),
                  const SizedBox(width: 10),
                  _buildDateChip(),
                ]),
              ),

              // Stats row
              if (entries.isNotEmpty && !_isMarkingMode) ...[
                _buildStatsRow(entries),
                const SizedBox(height: 14),
              ],

              // Content area
              if (_selectedClass == null)
                _buildEmptyState(icon: Icons.class_outlined, message: 'Select a class to view attendance')
              else if (_loadingStudents)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 60),
                  child: Center(child: CircularProgressIndicator(color: _tA, strokeWidth: 2.5)),
                )
              else if (_error != null)
                _buildEmptyState(icon: Icons.error_outline, message: _error!)
              else if (entries.isEmpty)
                _buildEmptyState(icon: Icons.people_outline, message: 'No students found in this class')
              else ...[
                if (_allSubmitted) _buildSubmittedBanner(),

                if (_canMark && !_allSubmitted)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: GestureDetector(
                      onTap: () {
                        if (_isMarkingMode) _stopMarkingMode();
                        else _startMarkingMode(entries);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 15),
                        decoration: BoxDecoration(
                          gradient: _isMarkingMode ? null : AppTheme.teacherTheme,
                          color: _isMarkingMode ? Colors.white : null,
                          borderRadius: BorderRadius.circular(18),
                          border: _isMarkingMode ? Border.all(color: const Color(0xFFE2E8F0), width: 1.5) : null,
                          boxShadow: _isMarkingMode ? [] : [
                            BoxShadow(color: const Color(0xFFFF5733).withOpacity(0.3), blurRadius: 14, offset: const Offset(0, 5)),
                          ],
                        ),
                        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Icon(
                            _isMarkingMode ? Icons.list_rounded : Icons.play_arrow_rounded,
                            color: _isMarkingMode ? _ink : Colors.white, size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _isMarkingMode ? 'Show List View' : 'Start Marking',
                            style: TextStyle(
                              fontFamily: 'Satoshi', fontWeight: FontWeight.w900, fontSize: 15,
                              color: _isMarkingMode ? _ink : Colors.white,
                            ),
                          ),
                        ]),
                      ),
                    ),
                  ),

                if (_isMarkingMode && entries.isNotEmpty)
                  _buildFlashcardView(entries)
                else
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFE8EAF0), width: 1.5),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, 4))],
                    ),
                    child: Column(
                      children: entries.asMap().entries.map((e) =>
                        _buildStudentRow(e.value, isLast: e.key == entries.length - 1)
                      ).toList(),
                    ),
                  ),
                const SizedBox(height: 20),
                if (!_canMark) _buildViewOnlyNote(),
              ],
              const SizedBox(height: 80),
            ],
          ),
        ),
      ]),
    );
  }

  // ── Sub-widgets ───────────────────────────────────────────────────────────

  Widget _buildClassPicker(AsyncValue<List<ClassroomItem>> classrooms) {
    return classrooms.when(
      loading: () => _shimmer(52),
      error: (_, __) => const SizedBox(height: 52),
      data: (classes) => GestureDetector(
        onTap: () => _showClassSheet(classes),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: 54,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: _selectedClass != null
                ? AppTheme.teacherTheme.colors.first.withOpacity(0.08)
                : Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: _selectedClass != null
                  ? AppTheme.teacherTheme.colors.first.withOpacity(0.25)
                  : const Color(0xFFE8EAF0),
              width: 1.5,
            ),
          ),
          child: Row(children: [
            // Gradient icon circle
            Container(
              width: 34, height: 34,
              decoration: BoxDecoration(
                gradient: _selectedClass != null ? AppTheme.teacherTheme : null,
                color: _selectedClass != null ? null : const Color(0xFFF4F6FB),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.school_rounded,
                size: 16,
                color: _selectedClass != null
                    ? Colors.white
                    : const Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_selectedClass != null)
                    Text('Class', style: TextStyle(
                      fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w600,
                      color: AppTheme.teacherTheme.colors.first.withOpacity(0.7),
                    )),
                  Text(
                    _selectedClass?.name ?? 'Choose Class',
                    style: TextStyle(
                      fontFamily: 'Satoshi',
                      fontWeight: FontWeight.w800,
                      fontSize: _selectedClass != null ? 13 : 14,
                      color: _selectedClass != null
                          ? const Color(0xFF140E28)
                          : const Color(0xFF94A3B8),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            // Student count badge OR chevron
            if (_selectedClass != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  gradient: AppTheme.teacherTheme,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '${_selectedClass!.studentCount}',
                  style: const TextStyle(
                    fontFamily: 'Satoshi', color: Colors.white,
                    fontSize: 11, fontWeight: FontWeight.w900,
                  ),
                ),
              )
            else
              const Icon(Icons.keyboard_arrow_down_rounded,
                color: Color(0xFFB0B8CC), size: 22),
          ]),
        ),
      ),
    );
  }

  Widget _buildDateChip() {
    final now = DateTime.now();
    final isToday = _selectedDate.year == now.year &&
        _selectedDate.month == now.month &&
        _selectedDate.day == now.day;
    return GestureDetector(
      onTap: _pickDate,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 54, width: 72,
        decoration: BoxDecoration(
          gradient: isToday ? AppTheme.teacherTheme : null,
          color: isToday ? null : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: isToday ? null : Border.all(color: const Color(0xFFE8EAF0), width: 1.5),
        ),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(
            Icons.calendar_month_rounded,
            color: isToday ? Colors.white : const Color(0xFF64748B),
            size: 20,
          ),
          const SizedBox(height: 4),
          Text(
            isToday ? 'Today' : '${_selectedDate.day}/${_selectedDate.month}',
            style: TextStyle(
              fontFamily: 'Satoshi', fontWeight: FontWeight.w800, fontSize: 10,
              color: isToday ? Colors.white : const Color(0xFF64748B),
            ),
          ),
        ]),
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
    final total = entries.length;
    final presentPct = total > 0 ? _presentCount / total : 0.0;
    return Column(children: [
      Row(children: [
        _statChip(_presentCount, 'Present', const Color(0xFF16A34A)),
        const SizedBox(width: 8),
        _statChip(_absentCount, 'Absent', const Color(0xFFDC2626)),
        const SizedBox(width: 8),
        _statChip(_lateCount, 'Late', const Color(0xFFD97706)),
        const SizedBox(width: 8),
        _statChip(_unmarkedCount, 'Unmarked', const Color(0xFF6366F1)),
      ]),
      const SizedBox(height: 10),
      // Attendance rate bar
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE8EAF0)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Column(children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Text('Attendance Rate', style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF140E28))),
            Text('${(presentPct * 100).toStringAsFixed(0)}%',
              style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 14, fontWeight: FontWeight.w900,
                color: presentPct > 0.8 ? const Color(0xFF16A34A) : presentPct > 0.6 ? const Color(0xFFD97706) : const Color(0xFFDC2626))),
          ]),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(100),
            child: LinearProgressIndicator(
              value: presentPct,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor: AlwaysStoppedAnimation<Color>(
                presentPct > 0.8 ? const Color(0xFF16A34A) : presentPct > 0.6 ? const Color(0xFFD97706) : const Color(0xFFDC2626)),
              minHeight: 8,
            ),
          ),
        ]),
      ),
    ]);
  }

  Widget _statChip(int count, String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [color, color.withOpacity(0.75)],
            begin: Alignment.topLeft, end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: color.withOpacity(0.25), blurRadius: 10, offset: const Offset(0, 3))],
        ),
        child: Column(children: [
          Text('$count', style: const TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white, height: 1)),
          const SizedBox(height: 3),
          Text(label, style: TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white.withOpacity(0.8))),
        ]),
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

  Widget _buildFlashcardView(List<AttendanceEntry> entries) {
    if (_currentMarkIndex >= entries.length) return const SizedBox.shrink();
    final entry = entries[_currentMarkIndex];
    final initials = entry.studentName.isNotEmpty
        ? entry.studentName.split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join().toUpperCase()
        : '?';

    // Outer card stays, only inner content slides when student changes
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color.fromRGBO(20, 14, 40, 0.07), width: 1.5),
        boxShadow: const [BoxShadow(color: Color.fromRGBO(20, 14, 40, 0.05), blurRadius: 12, offset: Offset(0, 4))],
      ),
      child: Column(
        children: [
          // Index pill + status badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Student ${_currentMarkIndex + 1} of ${entries.length}',
                style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF7B7291))),
              if (entry.status.isNotEmpty)
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: entry.status == 'PRESENT' ? const Color(0xFF16A34A) : entry.status == 'ABSENT' ? const Color(0xFFDC2626) : const Color(0xFFD97706),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(entry.status, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
                ),
            ],
          ),
          const SizedBox(height: 16),

          // ── Animated student content: slides when index changes ──────────
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 340),
            switchInCurve: Curves.easeOutCubic,
            switchOutCurve: Curves.easeInCubic,
            transitionBuilder: (child, animation) {
              final offsetIn = Tween<Offset>(
                begin: Offset(_slideDirection.toDouble(), 0),
                end: Offset.zero,
              ).animate(animation);
              final offsetOut = Tween<Offset>(
                begin: Offset(-_slideDirection.toDouble(), 0),
                end: Offset.zero,
              ).animate(animation);
              final isIncoming = child.key == ValueKey(_currentMarkIndex);
              return ClipRect(
                child: SlideTransition(
                  position: isIncoming ? offsetIn : offsetOut,
                  child: FadeTransition(opacity: animation, child: child),
                ),
              );
            },
            child: Column(
              key: ValueKey(_currentMarkIndex),
              children: [
                // Avatar
                if (entry.avatar != null && entry.avatar!.isNotEmpty)
                  Container(
                    width: 80, height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      image: DecorationImage(
                        image: NetworkImage(
                          entry.avatar!.startsWith('/') ? 'http://localhost:3000${entry.avatar}' : entry.avatar!,
                        ),
                        fit: BoxFit.cover,
                      ),
                    ),
                  )
                else
                  Container(
                    width: 80, height: 80,
                    decoration: const BoxDecoration(shape: BoxShape.circle, gradient: AppTheme.teacherTheme),
                    child: Center(
                      child: Text(initials,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 28, fontFamily: 'Cabinet Grotesk')),
                    ),
                  ),
                const SizedBox(height: 12),
                // Name and Roll
                Text(entry.studentName,
                  style: const TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF140E28)),
                  textAlign: TextAlign.center),
                const SizedBox(height: 2),
                if (entry.rollNo != null)
                  Text('Roll #${entry.rollNo}',
                    style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF7B7291))),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(8)),
                  child: Text(_selectedClass?.name ?? '', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF140E28))),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── Action buttons ───────────────────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _bigActionBtn('PRESENT', Icons.check_rounded, const Color(0xFF16A34A), const Color(0xFFF0FDF4), entry.status == 'PRESENT', () => _markInMode(entry, 'PRESENT')),
              _bigActionBtn('LATE', Icons.access_time_rounded, const Color(0xFFD97706), const Color(0xFFFFFBEB), entry.status == 'LATE', () => _markInMode(entry, 'LATE')),
              _bigActionBtn('ABSENT', Icons.close_rounded, const Color(0xFFDC2626), const Color(0xFFFEF2F2), entry.status == 'ABSENT', () => _markInMode(entry, 'ABSENT')),
            ],
          ),
          const SizedBox(height: 16),
          TextButton(
            onPressed: _isAnimatingBtn ? null : () => _skipCard(),
            style: TextButton.styleFrom(foregroundColor: const Color(0xFF7B7291)),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Skip for now', style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700, fontSize: 14)),
                SizedBox(width: 4),
                Icon(Icons.arrow_forward_rounded, size: 16),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _bigActionBtn(String label, IconData icon, Color color, Color bg, bool isSelected, VoidCallback onTap) {
    return _AttendanceActionBtn(
      label: label,
      icon: icon,
      color: color,
      bg: bg,
      isSelected: isSelected,
      onTap: _isAnimatingBtn ? null : onTap,
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
          if (entry.avatar != null && entry.avatar!.isNotEmpty)
            Container(
              width: 38, height: 38,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                image: DecorationImage(
                  image: NetworkImage(
                    entry.avatar!.startsWith('/')
                        ? 'http://localhost:3000${entry.avatar}'
                        : entry.avatar!,
                  ),
                  fit: BoxFit.cover,
                ),
              ),
            )
          else
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

// ─── Animated attendance action button ────────────────────────────────────────

class _AttendanceActionBtn extends StatefulWidget {
  final String label;
  final IconData icon;
  final Color color;
  final Color bg;
  final bool isSelected;
  final VoidCallback? onTap;

  const _AttendanceActionBtn({
    required this.label,
    required this.icon,
    required this.color,
    required this.bg,
    required this.isSelected,
    required this.onTap,
  });

  @override
  State<_AttendanceActionBtn> createState() => _AttendanceActionBtnState();
}

class _AttendanceActionBtnState extends State<_AttendanceActionBtn>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _scale;

  bool _pressed = false;

  // Grey tokens for unselected state
  static const _greyBg     = Color(0xFFEEEBF8);
  static const _greyBorder = Color(0xFFD1C9E8);
  static const _greyIcon   = Color(0xFFB5B0C4);

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 120),
      reverseDuration: const Duration(milliseconds: 400),
    );
    _scale = Tween<double>(begin: 1.0, end: 0.86).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeIn, reverseCurve: Curves.elasticOut),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _handleTap() async {
    if (widget.onTap == null) return;
    setState(() => _pressed = true);
    await _ctrl.forward();
    await Future.delayed(const Duration(milliseconds: 320));
    widget.onTap?.call();
    if (!mounted) return;
    await _ctrl.reverse();
    if (mounted) setState(() => _pressed = false);
  }

  @override
  Widget build(BuildContext context) {
    final disabled  = widget.onTap == null;
    final selected  = widget.isSelected;
    final pressing  = _pressed;

    // Resolve visual tokens
    final circleColor  = pressing ? widget.color : (selected ? widget.bg  : _greyBg);
    final borderColor  = pressing ? widget.color : (selected ? widget.color.withOpacity(0.5) : _greyBorder);
    final iconColor    = pressing ? Colors.white  : (selected ? widget.color : _greyIcon);
    final labelColor   = selected ? widget.color  : _greyIcon;
    final shadows = pressing
        ? [BoxShadow(color: widget.color.withOpacity(0.45), blurRadius: 20, offset: const Offset(0, 6))]
        : selected
            ? [BoxShadow(color: widget.color.withOpacity(0.18), blurRadius: 10, offset: const Offset(0, 3))]
            : [const BoxShadow(color: Color(0x0A140E28), blurRadius: 4, offset: Offset(0, 2))];

    return GestureDetector(
      onTap: disabled ? null : _handleTap,
      child: Opacity(
        opacity: disabled ? 0.38 : 1.0,
        child: Column(children: [
          AnimatedBuilder(
            animation: _scale,
            builder: (_, child) => Transform.scale(scale: _scale.value, child: child),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOut,
              width: 64, height: 64,
              decoration: BoxDecoration(
                color: circleColor,
                shape: BoxShape.circle,
                border: Border.all(color: borderColor, width: 2.5),
                boxShadow: shadows,
              ),
              child: Icon(widget.icon, color: iconColor, size: 30),
            ),
          ),
          const SizedBox(height: 8),
          AnimatedDefaultTextStyle(
            duration: const Duration(milliseconds: 200),
            style: TextStyle(
              fontFamily: 'Satoshi',
              fontWeight: selected ? FontWeight.w900 : FontWeight.w700,
              fontSize: 11,
              color: labelColor,
            ),
            child: Text(widget.label),
          ),
        ]),
      ),
    );
  }
}
