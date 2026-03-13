import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../shared/app_calendar.dart';
import '../../core/state/auth_state.dart';

// ─── Design Tokens ────────────────────────────────────────────────────────────

const _ink  = Color(0xFF140E28);
const _ink3 = Color(0xFF7B7291);
const _line = Color(0x12140E28);
const _bg2  = Color(0xFFF5F3FF);
const _tA   = Color(0xFFFF5733);
const _tB   = Color(0xFFFF006E);
const _tC   = Color(0xFFC77DFF);
const _tSoft= Color(0x14FF5733);

const List<Color> _gradStops = [_tA, _tB, _tC];
const _gradBegin = Alignment.topLeft;
const _gradEnd   = Alignment.bottomRight;

LinearGradient get _tGrad => const LinearGradient(
  colors: _gradStops, begin: _gradBegin, end: _gradEnd,
);

// ─── Model ────────────────────────────────────────────────────────────────────

class HomeworkItem {
  final String id, title, subject, description, assignedTo, createdAt;
  final String? dueDate, classroomId, classroomName;
  final bool isPublished;
  final int totalStudents, submittedCount, pendingCount, reviewedCount;
  final List<dynamic> attachments;

  const HomeworkItem({
    required this.id, required this.title, required this.subject,
    required this.description, required this.assignedTo, required this.createdAt,
    this.dueDate, this.classroomId, this.classroomName,
    required this.isPublished,
    required this.totalStudents, required this.submittedCount,
    required this.pendingCount, required this.reviewedCount,
    required this.attachments,
  });

  factory HomeworkItem.fromJson(Map<String, dynamic> j) => HomeworkItem(
    id:            j['id'] ?? '',
    title:         j['title'] ?? '',
    subject:       j['subject'] ?? '',
    description:   j['description'] ?? '',
    assignedTo:    j['assignedTo'] ?? 'CLASS',
    createdAt:     j['createdAt']?.toString() ?? '',
    dueDate:       j['dueDate']?.toString(),
    classroomId:   j['classroomId'],
    classroomName: j['classroomName'],
    isPublished:   j['isPublished'] ?? false,
    totalStudents: j['totalStudents'] ?? 0,
    submittedCount:j['submittedCount'] ?? 0,
    pendingCount:  j['pendingCount'] ?? 0,
    reviewedCount: j['reviewedCount'] ?? 0,
    attachments:   j['attachments'] ?? [],
  );
}

class HomeworkSubmission {
  final String id, studentId, studentName;
  final bool isSubmitted, isReviewed;
  final String? teacherComment, stickerType, submittedAt, mediaUrl;

  const HomeworkSubmission({
    required this.id, required this.studentId, required this.studentName,
    required this.isSubmitted, required this.isReviewed,
    this.teacherComment, this.stickerType, this.submittedAt, this.mediaUrl,
  });

  factory HomeworkSubmission.fromJson(Map<String, dynamic> j) => HomeworkSubmission(
    id:             j['id'] ?? '',
    studentId:      j['studentId'] ?? '',
    studentName:    j['studentName'] ?? '',
    isSubmitted:    j['isSubmitted'] ?? false,
    isReviewed:     j['isReviewed'] ?? false,
    teacherComment: j['teacherComment'],
    stickerType:    j['stickerType'],
    submittedAt:    j['submittedAt']?.toString(),
    mediaUrl:       j['mediaUrl'],
  );
}

// ─── Providers ────────────────────────────────────────────────────────────────

final homeworkListProvider = FutureProvider.autoDispose<List<HomeworkItem>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) return [];
  final res = await http.get(
    Uri.parse('http://localhost:3000/api/mobile/v1/staff/homework?slug=${user!.schoolSlug}'),
    headers: {'Authorization': 'Bearer ${user.token}'},
  ).timeout(const Duration(seconds: 10));
  if (res.statusCode == 200) {
    final data = jsonDecode(res.body);
    if (data['success'] == true) {
      return (data['data'] as List)
          .map((e) => HomeworkItem.fromJson(e as Map<String, dynamic>))
          .toList();
    }
  }
  return [];
});

final homeworkClassroomsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) return [];
  final res = await http.get(
    Uri.parse('http://localhost:3000/api/mobile/v1/staff/attendance/classrooms'),
    headers: {'Authorization': 'Bearer ${user!.token}'},
  ).timeout(const Duration(seconds: 10));
  if (res.statusCode == 200) {
    final data = jsonDecode(res.body);
    if (data['success'] == true) return List<Map<String, dynamic>>.from(data['classrooms']);
  }
  return [];
});

// ─── Main View ────────────────────────────────────────────────────────────────

class TeacherHomeworkView extends ConsumerStatefulWidget {
  const TeacherHomeworkView({super.key});
  @override
  ConsumerState<TeacherHomeworkView> createState() => _TeacherHomeworkViewState();
}

class _TeacherHomeworkViewState extends ConsumerState<TeacherHomeworkView> {
  String? _filterClassId;

  // Create form state
  final _titleCtrl   = TextEditingController();
  final _subjectCtrl = TextEditingController();
  final _descCtrl    = TextEditingController();
  final _marksCtrl   = TextEditingController();
  DateTime? _dueDate;
  String? _selectedClassId, _selectedClassName;
  String  _hwType = 'Written';
  bool _notifyParents = true, _allowLate = false, _autoRemind = false, _isPosting = false;

  @override
  void dispose() {
    _titleCtrl.dispose(); _subjectCtrl.dispose();
    _descCtrl.dispose();  _marksCtrl.dispose();
    super.dispose();
  }

  void _openSheet() {
    setState(() {
      _dueDate = null; _selectedClassId = null; _selectedClassName = null;
      _hwType = 'Written'; _notifyParents = true; _allowLate = false; _autoRemind = false;
    });
    _titleCtrl.clear(); _subjectCtrl.clear(); _descCtrl.clear(); _marksCtrl.clear();
    final classroomsAsync = ref.read(homeworkClassroomsProvider);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black54,
      useRootNavigator: true,
      builder: (_) => StatefulBuilder(builder: (ctx, setMs) {
        return _CreateSheet(
          classroomsAsync: classroomsAsync,
          titleCtrl: _titleCtrl, subjectCtrl: _subjectCtrl,
          descCtrl: _descCtrl,   marksCtrl: _marksCtrl,
          onPost: () => _postHomework(ctx, setMs),
          onSetClass: (id, name) { setMs(() {}); setState(() { _selectedClassId = id; _selectedClassName = name; }); },
          onSetDue:   (d) { setMs(() {}); setState(() => _dueDate = d); },
          onSetType:  (t) { setMs(() {}); setState(() => _hwType = t); },
          onToggleNotify: () { setMs(() {}); setState(() => _notifyParents = !_notifyParents); },
          onToggleLate:   () { setMs(() {}); setState(() => _allowLate = !_allowLate); },
          onToggleRemind: () { setMs(() {}); setState(() => _autoRemind = !_autoRemind); },
          selectedClassId: _selectedClassId, dueDate: _dueDate, hwType: _hwType,
          notifyParents: _notifyParents, allowLate: _allowLate,
          autoRemind: _autoRemind, isPosting: _isPosting,
        );
      }),
    );
  }

  Future<void> _postHomework(BuildContext sheetCtx, StateSetter setMs) async {
    if (_titleCtrl.text.trim().isEmpty) { _toast('Please add a title ⚠️'); return; }
    if (_selectedClassId == null) { _toast('Please select a class ⚠️'); return; }
    setState(() => _isPosting = true); setMs(() {});
    final user = ref.read(userProfileProvider);
    try {
      final res = await http.post(
        Uri.parse('http://localhost:3000/api/mobile/v1/staff/homework'),
        headers: {'Authorization': 'Bearer ${user?.token}', 'Content-Type': 'application/json'},
        body: jsonEncode({
          'slug': user?.schoolSlug, 'title': _titleCtrl.text.trim(),
          'description': _descCtrl.text.trim(), 'subject': _subjectCtrl.text.trim(),
          'classroomId': _selectedClassId,
          'dueDate': _dueDate?.toIso8601String(), 'assignedTo': 'CLASS', 'isPublished': true,
        }),
      ).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = jsonDecode(res.body);
        _toast('📚 Posted! ${body['studentsNotified'] ?? 0} student records created');
        if (sheetCtx.mounted) Navigator.of(sheetCtx, rootNavigator: true).pop();
        ref.invalidate(homeworkListProvider);
      } else {
        final body = jsonDecode(res.body);
        _toast('Failed: ${body['error'] ?? res.statusCode} ❌');
      }
    } catch (e) { _toast('Network error ❌'); }
    finally { if (mounted) { setState(() => _isPosting = false); setMs(() {}); } }
  }

  void _toast(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg, style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700)),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 90),
      backgroundColor: _ink, duration: const Duration(seconds: 3),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final homeworkAsync   = ref.watch(homeworkListProvider);
    final classroomsAsync = ref.watch(homeworkClassroomsProvider);
    return Scaffold(
      backgroundColor: _bg2,
      appBar: _buildAppBar(),
      body: Column(children: [
        _buildFilterStrip(classroomsAsync),
        _buildSummaryRow(homeworkAsync),
        Expanded(child: _buildBody(homeworkAsync)),
      ]),
      floatingActionButton: _buildFab(),
    );
  }

  PreferredSizeWidget _buildAppBar() => AppBar(
    backgroundColor: Colors.white, elevation: 0, surfaceTintColor: Colors.transparent,
    leading: GestureDetector(
      onTap: () => Navigator.of(context).pop(),
      child: const Padding(padding: EdgeInsets.all(10),
        child: Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: _ink)),
    ),
    title: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Homework', style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 18,
          fontWeight: FontWeight.w800, color: _ink, letterSpacing: -0.4)),
      Text('Manage assignments for your classes',
          style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, color: _ink3, fontWeight: FontWeight.w500)),
    ]),
    titleSpacing: 0,
    actions: [
      GestureDetector(
        onTap: () => ref.invalidate(homeworkListProvider),
        child: Container(margin: const EdgeInsets.only(right: 16), width: 38, height: 38,
          decoration: BoxDecoration(color: _bg2, borderRadius: BorderRadius.circular(12), border: Border.all(color: _line)),
          child: const Icon(Icons.refresh_rounded, size: 18, color: _tA)),
      ),
    ],
    bottom: PreferredSize(preferredSize: const Size.fromHeight(1), child: Container(color: _line, height: 1)),
  );

  Widget _buildFilterStrip(AsyncValue<List<Map<String, dynamic>>> classroomsAsync) {
    final classrooms = classroomsAsync.value ?? [];
    return Container(
      color: Colors.white,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
        child: Row(children: [
          _filterPill('All Classes', null),
          ...classrooms.map((c) => _filterPill(c['name'] ?? '', c['id'])),
        ]),
      ),
    );
  }

  Widget _filterPill(String label, String? classId) {
    final sel = _filterClassId == classId;
    return GestureDetector(
      onTap: () => setState(() => _filterClassId = classId),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
        decoration: BoxDecoration(
          gradient: sel ? _tGrad : null, color: sel ? null : Colors.white,
          borderRadius: BorderRadius.circular(100),
          border: sel ? null : Border.all(color: _line, width: 1.5),
        ),
        child: Text(label, style: TextStyle(fontFamily: 'Satoshi', fontSize: 11,
            fontWeight: sel ? FontWeight.w800 : FontWeight.w700,
            color: sel ? Colors.white : _ink3)),
      ),
    );
  }

  Widget _buildSummaryRow(AsyncValue<List<HomeworkItem>> async) {
    final list = async.value ?? [];
    final active  = list.where((h) => h.isPublished).length;
    final draft   = list.where((h) => !h.isPublished).length;
    final graded  = list.fold<int>(0, (s, h) => s + h.reviewedCount);
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 14),
      child: Row(children: [
        _statCard('$active', 'Active', _tA),
        const SizedBox(width: 8),
        _statCard('$draft', 'Draft', const Color(0xFFF59E0B)),
        const SizedBox(width: 8),
        _statCard('$graded', 'Graded', const Color(0xFF10B981)),
      ]),
    );
  }

  Widget _statCard(String value, String label, Color color) => Expanded(
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(color: _bg2, borderRadius: BorderRadius.circular(14), border: Border.all(color: _line)),
      child: Column(children: [
        Text(value, style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 22, fontWeight: FontWeight.w900, color: color)),
        const SizedBox(height: 2),
        Text(label.toUpperCase(), style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9,
            fontWeight: FontWeight.w700, color: _ink3, letterSpacing: 0.3)),
      ]),
    ),
  );

  Widget _buildBody(AsyncValue<List<HomeworkItem>> async) => async.when(
    loading: () => const Center(child: CircularProgressIndicator(color: _tA)),
    error: (_, __) => _buildError(),
    data: (list) {
      final filtered = _filterClassId == null ? list
          : list.where((h) => h.classroomId == _filterClassId).toList();
      if (filtered.isEmpty) return _buildEmpty();
      return ListView(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 100),
        children: [
          Padding(padding: const EdgeInsets.only(bottom: 10),
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              const Text('📚 Active Assignments', style: TextStyle(fontFamily: 'Satoshi', fontSize: 12,
                  fontWeight: FontWeight.w800, color: _ink, letterSpacing: 0.2)),
              Text('${filtered.length} total', style: const TextStyle(
                  fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w700, color: _tA)),
            ])),
          ...filtered.asMap().entries.map((e) => _HomeworkCard(
            item: e.value, delay: e.key * 60,
            onViewTap:  () => _openViewSheet(e.value),
            onGradeTap: () => _openGradeSheet(e.value),
          )),
        ],
      );
    },
  );

  Widget _buildEmpty() => Center(
    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      Container(width: 72, height: 72,
        decoration: BoxDecoration(gradient: _tGrad, borderRadius: BorderRadius.circular(22),
          boxShadow: [BoxShadow(color: _tA.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8))]),
        child: const Icon(Icons.menu_book_rounded, color: Colors.white, size: 34)),
      const SizedBox(height: 18),
      const Text('No Homework', style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 20,
          fontWeight: FontWeight.w800, color: _ink, letterSpacing: -0.4)),
      const SizedBox(height: 6),
      const Text('Tap + to create your first assignment',
          style: TextStyle(fontFamily: 'Satoshi', fontSize: 13, color: _ink3)),
      const SizedBox(height: 24),
      GestureDetector(
        onTap: _openSheet,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
          decoration: BoxDecoration(gradient: _tGrad, borderRadius: BorderRadius.circular(14),
            boxShadow: [BoxShadow(color: _tA.withOpacity(0.35), blurRadius: 18, offset: const Offset(0, 6))]),
          child: const Text('Create Homework', style: TextStyle(fontFamily: 'Satoshi',
              fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
        ),
      ),
    ]),
  );

  Widget _buildError() => Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
    const Icon(Icons.wifi_off_rounded, size: 48, color: _ink3),
    const SizedBox(height: 12),
    const Text('Could not load homework', style: TextStyle(color: _ink3)),
    const SizedBox(height: 12),
    GestureDetector(onTap: () => ref.invalidate(homeworkListProvider),
      child: Container(padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(color: _tSoft, borderRadius: BorderRadius.circular(10)),
        child: const Text('Retry', style: TextStyle(color: _tA, fontWeight: FontWeight.w800)))),
  ]));

  Widget _buildFab() => GestureDetector(
    onTap: () { HapticFeedback.lightImpact(); _openSheet(); },
    child: Container(width: 56, height: 56,
      decoration: BoxDecoration(gradient: _tGrad, borderRadius: BorderRadius.circular(18),
        boxShadow: [BoxShadow(color: _tA.withOpacity(0.4), blurRadius: 16, offset: const Offset(0, 6))]),
      child: const Icon(Icons.add_rounded, color: Colors.white, size: 28)),
  );

  // ── View Sheet ────────────────────────────────────────────────────────────

  void _openViewSheet(HomeworkItem hw) {
    final user = ref.read(userProfileProvider);
    showModalBottomSheet(
      context: context, isScrollControlled: true,
      backgroundColor: Colors.transparent, barrierColor: Colors.black54, useRootNavigator: true,
      builder: (_) => _SubmissionsSheet(hw: hw, token: user?.token ?? '', mode: _SheetMode.view,
        onGrade: (sub, comment, sticker) => _submitGrade(hw.id, sub, comment, sticker)),
    );
  }

  void _openGradeSheet(HomeworkItem hw) {
    final user = ref.read(userProfileProvider);
    showModalBottomSheet(
      context: context, isScrollControlled: true,
      backgroundColor: Colors.transparent, barrierColor: Colors.black54, useRootNavigator: true,
      builder: (_) => _SubmissionsSheet(hw: hw, token: user?.token ?? '', mode: _SheetMode.grade,
        onGrade: (sub, comment, sticker) => _submitGrade(hw.id, sub, comment, sticker)),
    );
  }

  Future<void> _submitGrade(String hwId, HomeworkSubmission sub, String comment, String? sticker) async {
    final user = ref.read(userProfileProvider);
    try {
      final res = await http.patch(
        Uri.parse('http://localhost:3000/api/mobile/v1/staff/homework/$hwId'),
        headers: {'Authorization': 'Bearer ${user?.token}', 'Content-Type': 'application/json'},
        body: jsonEncode({'submissionId': sub.id, 'teacherComment': comment, 'isReviewed': true, 'stickerType': sticker}),
      ).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        _toast('✅ ${sub.studentName} graded!');
        ref.invalidate(homeworkListProvider);
      } else {
        _toast('Failed to grade ❌');
      }
    } catch (_) { _toast('Network error ❌'); }
  }
}

// ─── Submissions Sheet (View + Grade) ────────────────────────────────────────

enum _SheetMode { view, grade }

class _SubmissionsSheet extends StatefulWidget {
  final HomeworkItem hw;
  final String token;
  final _SheetMode mode;
  final Future<void> Function(HomeworkSubmission, String, String?) onGrade;

  const _SubmissionsSheet({required this.hw, required this.token,
    required this.mode, required this.onGrade});

  @override
  State<_SubmissionsSheet> createState() => _SubmissionsSheetState();
}

class _SubmissionsSheetState extends State<_SubmissionsSheet> {
  List<HomeworkSubmission> _submissions = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSubmissions();
  }

  Future<void> _loadSubmissions() async {
    try {
      final res = await http.get(
        Uri.parse('http://localhost:3000/api/mobile/v1/staff/homework/${widget.hw.id}'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      ).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true) {
          setState(() {
            _submissions = (data['submissions'] as List)
                .map((e) => HomeworkSubmission.fromJson(e))
                .toList();
            _loading = false;
          });
          return;
        }
      }
      setState(() { _error = 'Failed to load'; _loading = false; });
    } catch (e) { setState(() { _error = e.toString(); _loading = false; }); }
  }

  @override
  Widget build(BuildContext context) {
    final isGrade = widget.mode == _SheetMode.grade;
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      child: Column(children: [
        // drag handle
        Container(margin: const EdgeInsets.only(top: 12, bottom: 10), width: 40, height: 4,
          decoration: BoxDecoration(color: _line, borderRadius: BorderRadius.circular(100))),
        // header
        Padding(padding: const EdgeInsets.fromLTRB(20, 0, 16, 12),
          child: Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(isGrade ? '✏️ Grade Homework' : '👀 View Submissions',
                style: const TextStyle(fontFamily: 'Clash Display', fontSize: 16,
                    fontWeight: FontWeight.w900, color: _ink)),
              const SizedBox(height: 2),
              Text('${widget.hw.title} · ${widget.hw.classroomName ?? ''}',
                style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, color: _ink3)),
            ])),
            GestureDetector(onTap: () => Navigator.pop(context),
              child: Container(width: 32, height: 32,
                decoration: BoxDecoration(color: _bg2, borderRadius: BorderRadius.circular(10), border: Border.all(color: _line)),
                child: const Icon(Icons.close_rounded, size: 16, color: _ink3))),
          ])),
        // stat bar
        Container(
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(color: _bg2, borderRadius: BorderRadius.circular(12), border: Border.all(color: _line)),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
            _miniStat('${widget.hw.submittedCount}', 'Submitted', const Color(0xFF10B981)),
            _vDivider(),
            _miniStat('${widget.hw.pendingCount}', 'Pending', const Color(0xFFF59E0B)),
            _vDivider(),
            _miniStat('${widget.hw.reviewedCount}', 'Graded', _tA),
          ]),
        ),
        Container(height: 1, color: _line),
        // List
        Expanded(child: _loading
          ? const Center(child: CircularProgressIndicator(color: _tA))
          : _error != null
            ? Center(child: Text(_error!, style: const TextStyle(color: _ink3)))
            : _submissions.isEmpty
              ? const Center(child: Text('No student records found', style: TextStyle(color: _ink3)))
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
                  itemCount: _submissions.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) => _StudentTile(
                    sub: _submissions[i], mode: widget.mode,
                    onGrade: (comment, sticker) async {
                      await widget.onGrade(_submissions[i], comment, sticker);
                      // Refresh this submission in the list
                      await _loadSubmissions();
                    },
                  ),
                ),
        ),
      ]),
    );
  }

  Widget _miniStat(String val, String label, Color color) => Column(children: [
    Text(val, style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 20, fontWeight: FontWeight.w900, color: color)),
    Text(label, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w700, color: _ink3)),
  ]);

  Widget _vDivider() => Container(height: 30, width: 1, color: _line);
}

// ─── Student Tile ─────────────────────────────────────────────────────────────

class _StudentTile extends StatefulWidget {
  final HomeworkSubmission sub;
  final _SheetMode mode;
  final Future<void> Function(String comment, String? sticker) onGrade;
  const _StudentTile({required this.sub, required this.mode, required this.onGrade});
  @override
  State<_StudentTile> createState() => _StudentTileState();
}

class _StudentTileState extends State<_StudentTile> {
  bool _expanded = false;
  late TextEditingController _commentCtrl;
  String? _sticker;
  bool _saving = false;

  static const _stickers = [
    {'emoji': '⭐', 'label': 'Good',      'value': 'GOOD'},
    {'emoji': '🌟', 'label': 'Excellent', 'value': 'EXCELLENT'},
    {'emoji': '👍', 'label': 'Well Done', 'value': 'WELL_DONE'},
    {'emoji': '🔁', 'label': 'Redo',      'value': 'REDO'},
  ];

  @override
  void initState() {
    super.initState();
    _commentCtrl = TextEditingController(text: widget.sub.teacherComment ?? '');
    _sticker = widget.sub.stickerType;
  }

  @override
  void dispose() { _commentCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final sub = widget.sub;
    final statusColor = sub.isReviewed
        ? const Color(0xFF059669)
        : sub.isSubmitted
          ? const Color(0xFF3B82F6)
          : const Color(0xFFF59E0B);
    final statusLabel = sub.isReviewed ? 'Graded' : sub.isSubmitted ? 'Submitted' : 'Pending';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _line),
        boxShadow: const [BoxShadow(color: Color(0x08000000), blurRadius: 8, offset: Offset(0, 2))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Row
        Padding(
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
          child: Row(children: [
            Container(width: 36, height: 36,
              decoration: BoxDecoration(color: _bg2, borderRadius: BorderRadius.circular(10)),
              child: Center(child: Text(sub.studentName.isNotEmpty ? sub.studentName[0].toUpperCase() : '?',
                style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w800, color: _tA, fontSize: 16)))),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(sub.studentName, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13,
                  fontWeight: FontWeight.w800, color: _ink)),
              if (sub.submittedAt != null)
                Text('Submitted ${_fmtDate(sub.submittedAt!)}',
                  style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink3)),
            ])),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
              decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(100)),
              child: Text(statusLabel, style: TextStyle(fontFamily: 'Satoshi', fontSize: 9,
                  fontWeight: FontWeight.w800, color: statusColor))),
            if (widget.mode == _SheetMode.grade) ...[
              const SizedBox(width: 6),
              GestureDetector(
                onTap: () => setState(() => _expanded = !_expanded),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(gradient: _tGrad, borderRadius: BorderRadius.circular(100)),
                  child: Text(_expanded ? 'Close' : 'Grade',
                    style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white)))),
            ],
          ]),
        ),
        // Grade panel
        if (_expanded && widget.mode == _SheetMode.grade) ...[
          Container(height: 1, color: _line.withOpacity(0.5)),
          Padding(padding: const EdgeInsets.fromLTRB(14, 12, 14, 14), child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Sticker', style: TextStyle(fontFamily: 'Satoshi', fontSize: 11,
                  fontWeight: FontWeight.w800, color: _ink)),
              const SizedBox(height: 8),
              Wrap(spacing: 8, children: _stickers.map((s) {
                final sel = _sticker == s['value'];
                return GestureDetector(
                  onTap: () => setState(() => _sticker = s['value']),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: sel ? _tSoft : _bg2, borderRadius: BorderRadius.circular(100),
                      border: Border.all(color: sel ? _tA : _line, width: 1.5)),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Text(s['emoji']!, style: const TextStyle(fontSize: 14)),
                      const SizedBox(width: 4),
                      Text(s['label']!, style: TextStyle(fontFamily: 'Satoshi', fontSize: 10,
                          fontWeight: FontWeight.w700, color: sel ? _tA : _ink3)),
                    ])));
              }).toList()),
              const SizedBox(height: 12),
              const Text('Comment', style: TextStyle(fontFamily: 'Satoshi', fontSize: 11,
                  fontWeight: FontWeight.w800, color: _ink)),
              const SizedBox(height: 6),
              TextField(
                controller: _commentCtrl, maxLines: 2,
                style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, color: _ink),
                decoration: InputDecoration(
                  hintText: 'Great work! Could improve...',
                  hintStyle: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, color: _ink3),
                  filled: true, fillColor: _bg2,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _line)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _line)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _tA)),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(width: double.infinity,
                child: GestureDetector(
                  onTap: _saving ? null : () async {
                    setState(() => _saving = true);
                    await widget.onGrade(_commentCtrl.text.trim(), _sticker);
                    if (mounted) setState(() { _saving = false; _expanded = false; });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(gradient: _tGrad, borderRadius: BorderRadius.circular(12),
                      boxShadow: [BoxShadow(color: _tA.withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4))]),
                    child: Center(child: _saving
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Save Grade', style: TextStyle(fontFamily: 'Satoshi', fontSize: 13,
                          fontWeight: FontWeight.w800, color: Colors.white))),
                  ),
                )),
            ],
          )),
        ],
      ]),
    );
  }

  String _fmtDate(String iso) {
    try {
      final d = DateTime.parse(iso).toLocal();
      return '${d.day}/${d.month}/${d.year}';
    } catch (_) { return ''; }
  }
}

// ─── Create Sheet ─────────────────────────────────────────────────────────────

class _CreateSheet extends StatefulWidget {
  final AsyncValue<List<Map<String, dynamic>>> classroomsAsync;
  final TextEditingController titleCtrl, subjectCtrl, descCtrl, marksCtrl;
  final Future<void> Function() onPost;
  final void Function(String, String) onSetClass;
  final void Function(DateTime) onSetDue;
  final void Function(String) onSetType;
  final VoidCallback onToggleNotify, onToggleLate, onToggleRemind;
  final String? selectedClassId;
  final DateTime? dueDate;
  final String hwType;
  final bool notifyParents, allowLate, autoRemind, isPosting;

  const _CreateSheet({
    required this.classroomsAsync, required this.titleCtrl, required this.subjectCtrl,
    required this.descCtrl, required this.marksCtrl, required this.onPost,
    required this.onSetClass, required this.onSetDue, required this.onSetType,
    required this.onToggleNotify, required this.onToggleLate, required this.onToggleRemind,
    required this.selectedClassId, required this.dueDate, required this.hwType,
    required this.notifyParents, required this.allowLate, required this.autoRemind,
    required this.isPosting,
  });

  @override
  State<_CreateSheet> createState() => _CreateSheetState();
}

class _CreateSheetState extends State<_CreateSheet> {
  late String? _sel;
  late DateTime? _due;
  late String _type;
  late bool _notify, _late, _remind;

  @override
  void initState() {
    super.initState();
    _sel = widget.selectedClassId; _due = widget.dueDate;
    _type = widget.hwType; _notify = widget.notifyParents;
    _late = widget.allowLate; _remind = widget.autoRemind;
  }

  @override
  Widget build(BuildContext context) {
    final classes = widget.classroomsAsync.value ?? [];
    return Container(
      decoration: const BoxDecoration(color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(margin: const EdgeInsets.only(top: 12, bottom: 10), width: 40, height: 4,
          decoration: BoxDecoration(color: _line, borderRadius: BorderRadius.circular(100))),
        Padding(padding: const EdgeInsets.fromLTRB(20, 0, 16, 14),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Text('New Homework', style: TextStyle(fontFamily: 'Clash Display', fontSize: 16,
                fontWeight: FontWeight.w900, color: _ink)),
            GestureDetector(onTap: () => Navigator.pop(context),
              child: Container(width: 32, height: 32,
                decoration: BoxDecoration(color: _bg2, borderRadius: BorderRadius.circular(10), border: Border.all(color: _line)),
                child: const Icon(Icons.close_rounded, size: 16, color: _ink3))),
          ])),
        Container(height: 1, color: _line),
        Flexible(child: SingleChildScrollView(padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _lbl('Assignment Title *'), _inp(widget.titleCtrl, 'e.g. Chapter 6 — Exercise 6.1'),
            const SizedBox(height: 14),
            _lbl('Select Class *'),
            Wrap(spacing: 7, runSpacing: 7, children: classes.map((c) {
              final sel = _sel == c['id'];
              return GestureDetector(
                onTap: () { setState(() => _sel = c['id']); widget.onSetClass(c['id'], c['name'] ?? ''); },
                child: AnimatedContainer(duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    gradient: sel ? const LinearGradient(colors: _gradStops, begin: _gradBegin, end: _gradEnd) : null,
                    color: sel ? null : Colors.white, borderRadius: BorderRadius.circular(100),
                    border: sel ? null : Border.all(color: _line, width: 1.5)),
                  child: Text(c['name'] ?? '', style: TextStyle(fontFamily: 'Satoshi', fontSize: 11,
                      fontWeight: FontWeight.w700, color: sel ? Colors.white : _ink3))));
            }).toList()),
            const SizedBox(height: 14),
            Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                _lbl('Subject'), _inp(widget.subjectCtrl, 'Mathematics')])),
              const SizedBox(width: 10),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                _lbl('Due Date'),
                GestureDetector(
                  onTap: () async {
                    final p = await showAppDatePicker(
                      context: context,
                      initialDate: DateTime.now().add(const Duration(days: 1)),
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    if (p != null) { setState(() => _due = p); widget.onSetDue(p); }
                  },
                  child: Container(width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    decoration: BoxDecoration(color: _bg2, borderRadius: BorderRadius.circular(12), border: Border.all(color: _line, width: 1.5)),
                    child: Text(_due == null ? 'Select date' : '${_due!.day}/${_due!.month}/${_due!.year}',
                      style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, color: _due == null ? _ink3 : _ink)))),
              ])),
            ]),
            const SizedBox(height: 14),
            _lbl('Description / Instructions'),
            _area(widget.descCtrl, 'Describe the assignment, page numbers, questions to solve...'),
            const SizedBox(height: 14),
            Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                _lbl('Max Marks'), _inp(widget.marksCtrl, '20', keyboardType: TextInputType.number)])),
              const SizedBox(width: 10),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                _lbl('Type'),
                DropdownButtonFormField<String>(
                  value: _type,
                  onChanged: (v) { setState(() => _type = v!); widget.onSetType(v!); },
                  decoration: _decor(),
                  style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, color: _ink),
                  items: ['Written', 'Project', 'Reading', 'Practical']
                      .map((t) => DropdownMenuItem(value: t, child: Text(t))).toList()),
              ])),
            ]),
            const SizedBox(height: 14),
            Container(width: double.infinity, padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: _tSoft, borderRadius: BorderRadius.circular(14),
                border: Border.all(color: _tA.withOpacity(0.35), width: 1.5)),
              child: const Column(children: [
                Text('📎', style: TextStyle(fontSize: 20)), SizedBox(height: 4),
                Text('Attach Files', style: TextStyle(fontFamily: 'Satoshi', fontSize: 12,
                    fontWeight: FontWeight.w800, color: _tA)),
                Text('PDF, Images, Word Docs', style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink3)),
              ])),
            const SizedBox(height: 14),
            Wrap(spacing: 8, runSpacing: 8, children: [
              _chip('🔔 Notify Parents', _notify, () { setState(() => _notify = !_notify); widget.onToggleNotify(); }),
              _chip('📤 Allow Late Submit', _late, () { setState(() => _late = !_late); widget.onToggleLate(); }),
              _chip('⚡ Auto-Remind', _remind, () { setState(() => _remind = !_remind); widget.onToggleRemind(); }),
            ]),
            const SizedBox(height: 16),
            SizedBox(width: double.infinity,
              child: GestureDetector(
                onTap: widget.isPosting ? null : widget.onPost,
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(gradient: const LinearGradient(colors: _gradStops, begin: _gradBegin, end: _gradEnd),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [BoxShadow(color: _tA.withOpacity(0.35), blurRadius: 18, offset: const Offset(0, 6))]),
                  child: Center(child: widget.isPosting
                    ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                    : const Text('📚 Post Homework', style: TextStyle(fontFamily: 'Satoshi', fontSize: 14,
                        fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 0.2))),
                ))),
          ]))),
      ]),
    );
  }

  Widget _lbl(String t) => Padding(padding: const EdgeInsets.only(bottom: 6),
    child: Text(t, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11,
        fontWeight: FontWeight.w800, color: _ink, letterSpacing: 0.2)));

  InputDecoration _decor() => InputDecoration(filled: true, fillColor: _bg2,
    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _line, width: 1.5)),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _line, width: 1.5)),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _tA, width: 1.5)));

  Widget _inp(TextEditingController c, String hint, {TextInputType? keyboardType}) => TextField(
    controller: c, keyboardType: keyboardType,
    style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, color: _ink),
    decoration: _decor().copyWith(hintText: hint, hintStyle: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, color: _ink3),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11)));

  Widget _area(TextEditingController c, String hint) => TextField(
    controller: c, maxLines: 3,
    style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, color: _ink),
    decoration: _decor().copyWith(hintText: hint, hintStyle: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, color: _ink3),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11)));

  Widget _chip(String label, bool active, VoidCallback onTap) => GestureDetector(onTap: onTap,
    child: AnimatedContainer(duration: const Duration(milliseconds: 200),
      padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 7),
      decoration: BoxDecoration(color: active ? _tSoft : Colors.white, borderRadius: BorderRadius.circular(100),
        border: Border.all(color: active ? _tA : _line, width: 1.5)),
      child: Text(label, style: TextStyle(fontFamily: 'Satoshi', fontSize: 10,
          fontWeight: FontWeight.w800, color: active ? _tA : _ink3))));
}

// ─── Homework Card ────────────────────────────────────────────────────────────

class _HomeworkCard extends StatefulWidget {
  final HomeworkItem item;
  final int delay;
  final VoidCallback onViewTap, onGradeTap;
  const _HomeworkCard({required this.item, required this.delay,
    required this.onViewTap, required this.onGradeTap});
  @override
  State<_HomeworkCard> createState() => _HomeworkCardState();
}

class _HomeworkCardState extends State<_HomeworkCard> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fade;
  late Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 400));
    _fade  = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _slide = Tween<Offset>(begin: const Offset(0, 0.15), end: Offset.zero)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));
    Future.delayed(Duration(milliseconds: widget.delay), () { if (mounted) _ctrl.forward(); });
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) => FadeTransition(
    opacity: _fade, child: SlideTransition(position: _slide, child: _card()));

  Widget _card() {
    final hw = widget.item;
    final bool overdue = hw.dueDate != null &&
        DateTime.tryParse(hw.dueDate!)?.isBefore(DateTime.now()) == true;
    final statusLabel = overdue ? 'OVERDUE' : (hw.isPublished ? 'ACTIVE' : 'DRAFT');
    final statusBg = overdue ? const Color(0xFFFEE2E2) : (hw.isPublished ? const Color(0xFFD1FAE5) : const Color(0xFFFEF3C7));
    final statusFg = overdue ? const Color(0xFFDC2626) : (hw.isPublished ? const Color(0xFF059669) : const Color(0xFFD97706));
    final pct = hw.totalStudents > 0 ? (hw.submittedCount / hw.totalStudents).clamp(0.0, 1.0) : 0.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18),
        border: Border.all(color: _line),
        boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 12, offset: Offset(0, 2))]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(width: 40, height: 40,
            decoration: BoxDecoration(color: _tSoft, borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.menu_book_rounded, size: 20, color: _tA)),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(hw.title, maxLines: 2, overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13,
                  fontWeight: FontWeight.w800, color: _ink, height: 1.2)),
            const SizedBox(height: 2),
            Text([hw.classroomName, hw.subject].where((s) => s != null && s.isNotEmpty).join(' · '),
              style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink3)),
          ])),
          const SizedBox(width: 8),
          Container(padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
            decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(100)),
            child: Text(statusLabel, style: TextStyle(fontFamily: 'Satoshi', fontSize: 9,
                fontWeight: FontWeight.w800, color: statusFg))),
        ]),
        const SizedBox(height: 12),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('Submissions', style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink3, fontWeight: FontWeight.w600)),
          RichText(text: TextSpan(
            text: '${hw.submittedCount} ',
            style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w800, color: _ink),
            children: [TextSpan(text: '/ ${hw.totalStudents}', style: const TextStyle(fontWeight: FontWeight.w600, color: _ink3))],
          )),
        ]),
        const SizedBox(height: 5),
        ClipRRect(borderRadius: BorderRadius.circular(100),
          child: TweenAnimationBuilder<double>(
            tween: Tween<double>(begin: 0, end: pct),
            duration: const Duration(milliseconds: 800), curve: Curves.easeOutCubic,
            builder: (_, v, __) => LinearProgressIndicator(value: v, minHeight: 7, backgroundColor: _bg2,
              valueColor: const AlwaysStoppedAnimation(_tA)))),
        const SizedBox(height: 5),
        Row(children: [
          Text('✓ ${hw.submittedCount} submitted',
            style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w700, color: Color(0xFF10B981))),
          const SizedBox(width: 12),
          Text('✗ ${hw.pendingCount} pending',
            style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w700, color: Color(0xFFEF4444))),
          if (hw.reviewedCount > 0) ...[
            const SizedBox(width: 12),
            Text('⭐ ${hw.reviewedCount} graded',
              style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w700, color: Color(0xFFF59E0B))),
          ],
        ]),
        const SizedBox(height: 10),
        Row(children: [
          Expanded(child: Row(children: [
            const Text('📅 Due ', style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink3)),
            Text(hw.dueDate != null ? _fmtDue(hw.dueDate!) : 'No due date',
              style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w800, color: _ink)),
          ])),
          Row(children: [
            GestureDetector(onTap: widget.onViewTap, child: _btn('View', outlined: true)),
            const SizedBox(width: 6),
            GestureDetector(onTap: widget.onGradeTap, child: _btn('Grade')),
          ]),
        ]),
      ]),
    );
  }

  Widget _btn(String label, {bool outlined = false}) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
    decoration: BoxDecoration(
      gradient: outlined ? null : const LinearGradient(colors: _gradStops, begin: _gradBegin, end: _gradEnd),
      color: outlined ? _tSoft : null, borderRadius: BorderRadius.circular(100),
      border: outlined ? Border.all(color: _tA.withOpacity(0.4), width: 1.5) : null),
    child: Text(label, style: TextStyle(fontFamily: 'Satoshi', fontSize: 10,
        fontWeight: FontWeight.w800, color: outlined ? _tA : Colors.white)));

  String _fmtDue(String iso) {
    try {
      final d = DateTime.parse(iso);
      final diff = d.difference(DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day)).inDays;
      if (diff == 0) return 'Today';
      if (diff == 1) return 'Tomorrow';
      if (diff < 0) return '${-diff}d overdue';
      return '${d.day}/${d.month}/${d.year}';
    } catch (_) { return iso; }
  }
}
