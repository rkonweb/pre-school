import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/state/auth_state.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/components/module_popup_shell.dart';
import '../../shared/components/app_fab.dart';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const _ink  = Color(0xFF140E28);
const _ink3 = Color(0xFF7B7291);
const _bg2  = Color(0xFFF0F2F8);
Color get _tA => AppTheme.teacherTheme.colors.first;
Color get _tB => AppTheme.teacherTheme.colors.last;
LinearGradient get _tGrad => AppTheme.teacherTheme;

// ─── Entry Type Config ────────────────────────────────────────────────────────
const _kTypeIcons = {
  'GENERAL':   (Icons.article_outlined,    Color(0xFF6366F1)),
  'HOMEWORK':  (Icons.assignment_outlined, Color(0xFF8B5CF6)),
  'ACTIVITY':  (Icons.sports_soccer,       Color(0xFF0D9488)),
  'BEHAVIOR':  (Icons.sentiment_satisfied, Color(0xFFF59E0B)),
  'MEAL':      (Icons.restaurant_outlined, Color(0xFFEF4444)),
  'NAP':       (Icons.bedtime_outlined,    Color(0xFF06B6D4)),
  'PTM':       (Icons.groups_outlined,     Color(0xFFEC4899)),
  'HEALTH':    (Icons.health_and_safety_outlined, Color(0xFF22C55E)),
  'ACHIEVEMENT': (Icons.emoji_events_outlined, Color(0xFFEAB308)),
  'INCIDENT':  (Icons.report_outlined,     Color(0xFFDC2626)),
};

const _kPriorityColors = {
  'LOW':    Color(0xFF22C55E),
  'NORMAL': Color(0xFF6366F1),
  'HIGH':   Color(0xFFF97316),
  'URGENT': Color(0xFFDC2626),
};

const _kMoodEmojis = ['😊', '😐', '😢', '😴', '🤒', '🎉', '💪', '⭐'];

// ─── Model ────────────────────────────────────────────────────────────────────
class DiaryEntry {
  final String id, title, content, type, priority;
  final String? classroomId, authorId, classroomName, studentId, studentName, mood;
  final bool requiresAck;
  final String createdAt;

  const DiaryEntry({
    required this.id, required this.title, required this.content,
    required this.type, required this.priority,
    this.classroomId, this.authorId, this.classroomName,
    this.studentId, this.studentName, this.mood,
    required this.requiresAck, required this.createdAt,
  });

  factory DiaryEntry.fromJson(Map<String, dynamic> j) => DiaryEntry(
    id:            j['id'] ?? '',
    title:         j['title'] ?? '',
    content:       j['content'] ?? '',
    type:          j['type'] ?? 'GENERAL',
    priority:      j['priority'] ?? 'NORMAL',
    classroomId:   j['classroomId'],
    authorId:      j['authorId'],
    classroomName: j['classroom']?['name'] ?? j['classroomName'],
    studentId:     j['studentId'],
    studentName:   j['student']?['name'] ?? j['studentName'],
    mood:          j['mood'],
    requiresAck:   j['requiresAck'] ?? false,
    createdAt:     j['createdAt']?.toString() ?? '',
  );
}

// ─── Providers ────────────────────────────────────────────────────────────────
final diaryListProvider = FutureProvider.autoDispose<List<DiaryEntry>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) return [];
  try {
    final res = await http.get(
      Uri.parse('http://localhost:3000/api/mobile/v1/staff/diary?slug=${user!.schoolSlug}&onlyMine=true'),
      headers: {'Authorization': 'Bearer ${user.token}'},
    ).timeout(const Duration(seconds: 10));
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['success'] == true) {
        return (data['data'] as List).map((e) => DiaryEntry.fromJson(e as Map<String,dynamic>)).toList();
      }
    }
  } catch(e) { /* ignore */ }
  return [];
});

final diaryClassroomsProvider = FutureProvider.autoDispose<List<Map<String,dynamic>>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) {
    debugPrint('[Diary] No token – skipping classrooms fetch');
    return [];
  }
  final url = 'http://localhost:3000/api/mobile/v1/staff/attendance/classrooms';
  debugPrint('[Diary] Fetching classrooms from $url');
  try {
    final res = await http.get(
      Uri.parse(url),
      headers: {'Authorization': 'Bearer ${user!.token}'},
    ).timeout(const Duration(seconds: 10));
    debugPrint('[Diary] Classrooms response: ${res.statusCode} – ${res.body.substring(0, res.body.length.clamp(0, 200))}');
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['success'] == true) {
        return (data['classrooms'] as List)
            .map((e) => Map<String, dynamic>.from(e as Map))
            .toList();
      }
    }
  } catch(e) {
    debugPrint('[Diary] classrooms error: $e');
  }
  return [];
});

final diaryStudentsProvider = FutureProvider.autoDispose.family<List<Map<String,dynamic>>, String?>((ref, classId) async {
  if (classId == null) return [];
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) return [];
  try {
    final res = await http.get(
      Uri.parse('http://localhost:3000/api/mobile/v1/staff/attendance/students?slug=${user!.schoolSlug}&classroomId=$classId'),
      headers: {'Authorization': 'Bearer ${user.token}'},
    ).timeout(const Duration(seconds: 10));
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['success'] == true) {
        return (data['students'] as List)
            .map((e) => Map<String, dynamic>.from(e as Map))
            .toList();
      }
    }
  } catch(e) { /* ignore */ }
  return [];
});

// ─── Main View ────────────────────────────────────────────────────────────────
class TeacherDiaryView extends ConsumerStatefulWidget {
  const TeacherDiaryView({super.key});
  @override
  ConsumerState<TeacherDiaryView> createState() => _TeacherDiaryViewState();
}

class _TeacherDiaryViewState extends ConsumerState<TeacherDiaryView>
    with SingleTickerProviderStateMixin {
  String _filterType = 'ALL';
  String _searchQuery = '';
  late final TextEditingController _searchCtrl;
  Timer? _refreshTimer;
  DateTime _selectedDate = DateTime.now();

  // Create form
  final _titleCtrl   = TextEditingController();
  final _contentCtrl = TextEditingController();
  String? _selectedClassId, _selectedClassName, _selectedStudentId;
  String  _entryType = 'ACTIVITY';
  String  _priority  = 'NORMAL';
  String  _recipientType = 'CLASS';
  String? _selectedMood;
  final Set<String> _selectedStudentIds = {};
  bool _requiresAck = false, _isPosting = false;

  @override
  void initState() {
    super.initState();
    _searchCtrl = TextEditingController();
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      ref.invalidate(diaryListProvider);
    });
  }

  @override
  void dispose() {
    _titleCtrl.dispose(); _contentCtrl.dispose(); _searchCtrl.dispose();
    _refreshTimer?.cancel();
    super.dispose();
  }

  void _openSheet() {
    setState(() {
      _selectedClassId = null; _selectedClassName = null;
      _entryType = 'ACTIVITY'; _priority = 'NORMAL'; _requiresAck = false;
      _recipientType = 'CLASS'; _selectedStudentIds.clear(); _selectedMood = null;
    });
    _titleCtrl.clear(); _contentCtrl.clear();
    showModalBottomSheet(
      context: context, isScrollControlled: true,
      backgroundColor: Colors.transparent, barrierColor: Colors.black54,
      sheetAnimationStyle: AnimationStyle(
        curve: Curves.easeInOutCubic,
        duration: const Duration(milliseconds: 380),
        reverseDuration: const Duration(milliseconds: 260),
      ),
      builder: (sheetContext) => StatefulBuilder(builder: (ctx, setMs) {
        return _CreateSheet(
          titleCtrl: _titleCtrl, contentCtrl: _contentCtrl,
          onPost: () => _postEntry(sheetContext, setMs),
          onSetClass: (id, name) { setMs(() {}); setState(() { _selectedClassId = id; _selectedClassName = name; _selectedStudentIds.clear(); }); },
          onSetType:  (t)  { setMs(() {}); setState(() => _entryType = t); },
          onSetPriority: (p) { setMs(() {}); setState(() => _priority = p); },
          onToggleAck: () { setMs(() {}); setState(() => _requiresAck = !_requiresAck); },
          onSetRecipientType: (t) { setMs(() {}); setState(() { _recipientType = t; _selectedStudentIds.clear(); }); },
          onToggleStudent: (id) { setMs(() {}); setState(() { if (_selectedStudentIds.contains(id)) _selectedStudentIds.remove(id); else _selectedStudentIds.add(id); }); },
          onSetMood: (m) { setMs(() {}); setState(() => _selectedMood = m); },
          selectedClassId: _selectedClassId, entryType: _entryType,
          priority: _priority, requiresAck: _requiresAck,
          recipientType: _recipientType, selectedStudentIds: _selectedStudentIds,
          selectedMood: _selectedMood, isPosting: _isPosting,
        );
      }),
    );
  }

  Future<void> _postEntry(BuildContext ctx, StateSetter setMs) async {
    if (_titleCtrl.text.trim().isEmpty)   { _toast('Please add a title ⚠️'); return; }
    if (_contentCtrl.text.trim().isEmpty) { _toast('Please add content ⚠️'); return; }
    if (_selectedClassId == null)         { _toast('Please select a class ⚠️'); return; }
    if (_recipientType == 'STUDENT' && _selectedStudentIds.isEmpty) { _toast('Please select at least one student ⚠️'); return; }

    setState(() => _isPosting = true); setMs(() {});
    final user = ref.read(userProfileProvider);
    try {
      final res = await http.post(
        Uri.parse('http://localhost:3000/api/mobile/v1/staff/diary'),
        headers: {'Authorization': 'Bearer ${user?.token}', 'Content-Type': 'application/json'},
        body: jsonEncode({
          'slug': user?.schoolSlug, 'title': _titleCtrl.text.trim(),
          'content': _contentCtrl.text.trim(), 'type': _entryType,
          'classroomId': _selectedClassId, 'priority': _priority,
          'requiresAck': _requiresAck, 'recipientType': _recipientType,
          'studentIds': _selectedStudentIds.toList(),
          if (_selectedMood != null) 'mood': _selectedMood,
        }),
      ).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200 || res.statusCode == 201) {
        _toast('📝 Diary entry posted!');
        HapticFeedback.mediumImpact();
        if (ctx.mounted) Navigator.of(ctx).pop();
        ref.invalidate(diaryListProvider);
      } else {
        final body = jsonDecode(res.body);
        _toast('Failed: ${body['error'] ?? res.statusCode} ❌');
      }
    } catch (e) { _toast('Network error ❌'); }
    finally { if (mounted) { setState(() => _isPosting = false); setMs(() {}); } }
  }

  void _toast(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg, style: const TextStyle(fontWeight: FontWeight.w700)),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 90),
      backgroundColor: _ink, duration: const Duration(seconds: 3),
    ));
  }

  List<DiaryEntry> _applyFilters(List<DiaryEntry> entries) {
    var list = entries;
    if (_filterType != 'ALL') list = list.where((e) => e.type == _filterType).toList();
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      list = list.where((e) => e.title.toLowerCase().contains(q) || e.content.toLowerCase().contains(q)).toList();
    }
    
    // Date filter
    list = list.where((e) {
      try {
        final dt = DateTime.parse(e.createdAt).toLocal();
        return dt.year == _selectedDate.year && dt.month == _selectedDate.month && dt.day == _selectedDate.day;
      } catch (_) {
        return false;
      }
    }).toList();
    
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final listAsync = ref.watch(diaryListProvider);
    return ModulePopupShell(
      title: 'Diary',
      icon: Icons.book_rounded,
      backgroundColor: _bg2,
      floatingActionButton: _buildFab(),
      body: Column(children: [
        _buildSearchBar(),
        _buildTypeFilter(),
        Expanded(
          child: listAsync.when(
            data: (all) {
              return SingleChildScrollView(
                child: Column(children: [
                  _buildWeekNavigator(all),
                  const SizedBox(height: 8),
                  Builder(builder: (ctx) {
                    final entries = _applyFilters(all);
                    if (entries.isEmpty) return _buildEmptyState(all.isEmpty);
                    return _buildGroupedList(entries);
                  }),
                  const SizedBox(height: 100),
                ]),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Failed to load: $e', style: const TextStyle(color: Colors.red))),
          ),
        ),
      ]),
    );
  }

  Widget _buildSliverAppBar() => SliverAppBar(
    expandedHeight: 130,
    floating: false, pinned: true,
    backgroundColor: Colors.transparent,
    elevation: 0,
    leading: GestureDetector(
      onTap: () => Navigator.of(context).pop(),
      child: const Padding(
        padding: EdgeInsets.all(10),
        child: Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: Colors.white),
      ),
    ),
    actions: [
      IconButton(
        onPressed: () { ref.invalidate(diaryListProvider); },
        icon: const Icon(Icons.refresh_rounded, color: Colors.white),
      ),
    ],
    flexibleSpace: FlexibleSpaceBar(
      background: Container(
        decoration: BoxDecoration(gradient: _tGrad),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 50, 20, 20),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Class Diary', style: TextStyle(
                      fontFamily: 'Cabinet Grotesk', fontSize: 26, fontWeight: FontWeight.w800,
                      color: Colors.white, letterSpacing: -0.5,
                    )),
                    const SizedBox(height: 4),
                    Text('Track, share and analyse student progress',
                      style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.8), fontWeight: FontWeight.w500)),
                  ]),
                ),
                Consumer(builder: (ctx, ref, _) {
                  final listAsync = ref.watch(diaryListProvider);
                  final count = listAsync.valueOrNull?.length ?? 0;
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                    child: Column(children: [
                      Text('$count', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 22)),
                      const Text('Entries', style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w600)),
                    ]),
                  );
                }),
              ],
            ),
          ),
        ),
      ),
    ),
  );

  Widget _buildSearchBar() => Padding(
    padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
    child: Container(
      height: 46,
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 8, offset: const Offset(0,2))]),
      child: TextField(
        controller: _searchCtrl,
        onChanged: (v) => setState(() => _searchQuery = v),
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: _ink),
        decoration: InputDecoration(
          border: InputBorder.none, contentPadding: const EdgeInsets.symmetric(vertical: 14),
          prefixIcon: Icon(Icons.search_rounded, color: _ink3, size: 20),
          hintText: 'Search diary entries…',
          hintStyle: const TextStyle(color: Color(0xFFCBD5E1), fontWeight: FontWeight.w500),
          suffixIcon: _searchQuery.isNotEmpty
              ? GestureDetector(onTap: () { _searchCtrl.clear(); setState(() => _searchQuery = ''); },
                  child: const Icon(Icons.clear, color: _ink3, size: 18))
              : null,
        ),
      ),
    ),
  );

  Widget _buildTypeFilter() {
    final types = ['ALL', ..._kTypeIcons.keys];
    return SizedBox(
      height: 50,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: types.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (ctx, i) {
          final t = types[i];
          final isSel = _filterType == t;
          final cfg = _kTypeIcons[t];
          return GestureDetector(
            onTap: () => setState(() => _filterType = t),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: isSel ? (cfg?.$2 ?? _tA) : Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: isSel ? [BoxShadow(color: (cfg?.$2 ?? _tA).withOpacity(0.3), blurRadius: 8, offset: const Offset(0,3))] : [],
              ),
              child: Row(children: [
                if (cfg != null) ...[
                  Icon(cfg.$1, size: 13, color: isSel ? Colors.white : cfg.$2),
                  const SizedBox(width: 5),
                ],
                Text(t, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800,
                    color: isSel ? Colors.white : _ink3)),
              ]),
            ),
          );
        },
      ),
    );
  }

  bool _hasEntryForDate(List<DiaryEntry> entries, DateTime dt) {
    for (var entry in entries) {
      try {
        final t = DateTime.parse(entry.createdAt).toLocal();
        if (t.year == dt.year && t.month == dt.month && t.day == dt.day) {
          return true;
        }
      } catch (_) {}
    }
    return false;
  }

  Widget _buildWeekNavigator(List<DiaryEntry> allEntries) {
    final now = DateTime.now();
    final monday = now.subtract(Duration(days: now.weekday - 1));
    final weekDates = List.generate(7, (index) => monday.add(Duration(days: index)));
    final days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(7, (index) {
          final date = weekDates[index];
          final isSelected = date.year == _selectedDate.year && 
                             date.month == _selectedDate.month && 
                             date.day == _selectedDate.day;
          final hasAnyEntry = _hasEntryForDate(allEntries, date);
          
          return Expanded(
            child: GestureDetector(
              onTap: () {
                 setState(() {
                    _selectedDate = date;
                 });
              },
              child: Container(
                 margin: const EdgeInsets.symmetric(horizontal: 2),
                 padding: const EdgeInsets.symmetric(vertical: 8),
                 decoration: BoxDecoration(
                    color: isSelected ? _tA : Colors.white,
                    gradient: isSelected ? _tGrad : null,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: isSelected ? Colors.transparent : const Color(0xFFE2E8F0)),
                    boxShadow: isSelected ? [BoxShadow(color: _tA.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 3))] : null,
                 ),
                 child: Column(
                    children: [
                       Text(days[index], style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w700, color: isSelected ? Colors.white : _ink3, letterSpacing: 0.3)),
                       const SizedBox(height: 2),
                       Text('${date.day}', style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 13, fontWeight: FontWeight.w800, color: isSelected ? Colors.white : _ink)),
                       const SizedBox(height: 3),
                       if (hasAnyEntry) 
                          Container(
                            width: 4, height: 4,
                            decoration: BoxDecoration(
                               color: isSelected ? Colors.white.withOpacity(0.7) : const Color(0xFFF97316),
                               shape: BoxShape.circle,
                            )
                          )
                       else
                          const SizedBox(height: 4),
                    ],
                 ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildGroupedList(List<DiaryEntry> entries) {
    // Group by date
    final Map<String, List<DiaryEntry>> grouped = {};
    for (final e in entries) {
      String label = 'Earlier';
      try {
        final dt = DateTime.parse(e.createdAt).toLocal();
        final now = DateTime.now();
        final today = DateTime(now.year, now.month, now.day);
        final dDate = DateTime(dt.year, dt.month, dt.day);
        final diff = today.difference(dDate).inDays;
        if (diff == 0) label = 'Today';
        else if (diff == 1) label = 'Yesterday';
        else if (diff < 7) label = '${diff} days ago';
        else label = '${dt.day}/${dt.month}/${dt.year}';
      } catch (_) {}
      grouped.putIfAbsent(label, () => []).add(e);
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(children: [
        for (final entry in grouped.entries) ...[
          _buildDateHeader(entry.key),
          for (final e in entry.value) _DiaryCard(entry: e, onRefresh: () => ref.invalidate(diaryListProvider)),
          const SizedBox(height: 4),
        ],
      ]),
    );
  }

  Widget _buildDateHeader(String label) => Padding(
    padding: const EdgeInsets.only(top: 16, bottom: 8),
    child: Row(children: [
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: _tA.withOpacity(0.12), borderRadius: BorderRadius.circular(20),
        ),
        child: Text(label, style: TextStyle(
          fontSize: 11, fontWeight: FontWeight.w800, color: _tA, letterSpacing: 0.5)),
      ),
      const SizedBox(width: 10),
      Expanded(child: Divider(color: Colors.grey.withOpacity(0.2), height: 1)),
    ]),
  );

  Widget _buildEmptyState(bool noEntries) => Center(
    child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Container(
          width: 80, height: 80,
          decoration: BoxDecoration(gradient: _tGrad, shape: BoxShape.circle),
          child: const Icon(Icons.book_outlined, color: Colors.white, size: 36),
        ),
        const SizedBox(height: 20),
        Text(noEntries ? 'No Diary Entries Yet' : 'No Matches Found',
          style: const TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 20, fontWeight: FontWeight.w800, color: _ink)),
        const SizedBox(height: 8),
        Text(noEntries ? 'Tap "+ New Entry" to create your first class diary entry' : 'Try a different search or filter',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 13, color: _ink3, height: 1.5)),
        if (noEntries) ...[
          const SizedBox(height: 24),
          GestureDetector(
            onTap: _openSheet,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              decoration: BoxDecoration(gradient: _tGrad, borderRadius: BorderRadius.circular(14)),
              child: const Text('+ New Entry', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
            ),
          ),
        ]
      ]),
    ),
  );

  Widget _buildFab() => AppFab(onTap: _openSheet);
}

// ─── Diary Card ───────────────────────────────────────────────────────────────
class _DiaryCard extends StatefulWidget {
  final DiaryEntry entry;
  final VoidCallback onRefresh;
  const _DiaryCard({required this.entry, required this.onRefresh});
  @override
  State<_DiaryCard> createState() => _DiaryCardState();
}

class _DiaryCardState extends State<_DiaryCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final e = widget.entry;
    final cfg = _kTypeIcons[e.type] ?? (Icons.article_outlined, const Color(0xFF6366F1));
    final pColor = _kPriorityColors[e.priority] ?? const Color(0xFF6366F1);

    String timeLabel = '';
    try {
      final dt = DateTime.parse(e.createdAt).toLocal();
      timeLabel = '${dt.hour > 12 ? dt.hour-12 : dt.hour == 0 ? 12 : dt.hour}:${dt.minute.toString().padLeft(2,'0')} ${dt.hour >= 12 ? 'PM' : 'AM'}';
    } catch (_) {}

    return GestureDetector(
      onTap: () => setState(() => _expanded = !_expanded),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 12, offset: const Offset(0,4))],
        ),
        child: Column(children: [
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              // Header Row
              Row(children: [
                Container(
                  width: 38, height: 38,
                  decoration: BoxDecoration(color: cfg.$2.withOpacity(0.12), shape: BoxShape.circle),
                  child: Icon(cfg.$1, size: 18, color: cfg.$2),
                ),
                const SizedBox(width: 10),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(e.title, style: const TextStyle(
                    fontFamily: 'Cabinet Grotesk', fontSize: 15, fontWeight: FontWeight.w800, color: _ink)),
                  const SizedBox(height: 2),
                  Row(children: [
                    if (e.classroomName != null) ...[
                      Icon(Icons.class_, size: 11, color: _ink3),
                      const SizedBox(width: 3),
                      Text(e.classroomName!, style: const TextStyle(fontSize: 11, color: _ink3, fontWeight: FontWeight.w600)),
                      const SizedBox(width: 8),
                    ],
                    if (e.studentName != null) ...[
                      Icon(Icons.person, size: 11, color: _ink3),
                      const SizedBox(width: 3),
                      Text(e.studentName!, style: const TextStyle(fontSize: 11, color: _ink3, fontWeight: FontWeight.w600)),
                    ],
                  ]),
                ])),
                Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: pColor.withOpacity(0.12), borderRadius: BorderRadius.circular(20)),
                    child: Text(e.priority, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: pColor)),
                  ),
                  const SizedBox(height: 4),
                  Text(timeLabel, style: const TextStyle(fontSize: 10, color: _ink3)),
                ]),
              ]),
              const SizedBox(height: 10),
              // Preview content
              Text(e.content,
                maxLines: _expanded ? 99 : 2,
                overflow: _expanded ? TextOverflow.visible : TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 13, color: _ink3, height: 1.5)),
              
              // Expanded details
              if (_expanded) ...[
                const SizedBox(height: 12),
                const Divider(height: 1),
                const SizedBox(height: 12),
                Wrap(spacing: 8, runSpacing: 8, children: [
                  _buildChip(Icons.category_outlined, e.type, cfg.$2),
                  if (e.mood != null) _buildChip(Icons.sentiment_satisfied_outlined, e.mood!, const Color(0xFFF59E0B)),
                  if (e.requiresAck) _buildChip(Icons.check_circle_outline, 'Ack Required', const Color(0xFF8B5CF6)),
                ]),
              ],
              
              // Footer
              const SizedBox(height: 8),
              Row(children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: cfg.$2.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
                  child: Text(e.type, style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: cfg.$2)),
                ),
                if (e.mood != null) ...[
                  const SizedBox(width: 6),
                  Text(e.mood!, style: const TextStyle(fontSize: 14)),
                ],
                const Spacer(),
                if (e.requiresAck)
                  const Icon(Icons.check_circle_outline, size: 14, color: Color(0xFF8B5CF6)),
                const SizedBox(width: 4),
                Icon(_expanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, size: 16, color: _ink3),
              ]),
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _buildChip(IconData icon, String label, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
    decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
    child: Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(icon, size: 12, color: color),
      const SizedBox(width: 4),
      Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color)),
    ]),
  );
}

// ─── Create Sheet ──────────────────────────────────────────────────────────────
class _CreateSheet extends ConsumerWidget {
  final TextEditingController titleCtrl, contentCtrl;
  final VoidCallback onPost, onToggleAck;
  final Function(String, String) onSetClass;
  final Function(String) onSetType, onSetPriority, onSetRecipientType, onToggleStudent;
  final Function(String?) onSetMood;
  final String? selectedClassId, entryType, priority, recipientType, selectedMood;
  final Set<String> selectedStudentIds;
  final bool requiresAck, isPosting;

  const _CreateSheet({
    required this.titleCtrl, required this.contentCtrl,
    required this.onPost, required this.onSetClass, required this.onSetType,
    required this.onSetPriority, required this.onToggleAck,
    required this.onSetRecipientType, required this.onToggleStudent, required this.onSetMood,
    required this.selectedClassId, required this.entryType,
    required this.priority, required this.requiresAck, required this.isPosting,
    required this.recipientType, required this.selectedStudentIds, required this.selectedMood,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mq = MediaQuery.of(context);
    final kbH = mq.viewInsets.bottom;
    final classroomsAsync = ref.watch(diaryClassroomsProvider);

    return Container(
      constraints: BoxConstraints(maxHeight: mq.size.height * 0.92),
      decoration: const BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
      child: Column(children: [
        // Handle
        Container(margin: const EdgeInsets.only(top: 12, bottom: 16),
          width: 40, height: 4,
          decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(4))),
        
        // Header
        Padding(padding: const EdgeInsets.symmetric(horizontal: 20), child: Row(children: [
          Container(width: 40, height: 40,
            decoration: BoxDecoration(gradient: _tGrad, shape: BoxShape.circle),
            child: const Icon(Icons.edit_note_rounded, color: Colors.white, size: 20)),
          const SizedBox(width: 12),
          const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('New Diary Entry', style: TextStyle(fontFamily: 'Cabinet Grotesk',
              fontSize: 20, fontWeight: FontWeight.w800, color: _ink)),
            Text('Share updates with students & parents', style: TextStyle(
              fontSize: 12, color: _ink3, fontWeight: FontWeight.w500)),
          ]),
        ])),
        const SizedBox(height: 12),
        const Divider(height: 1),

        Expanded(child: SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(20, 16, 20, 16 + kbH),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            
            // ── Entry Type Grid ─────────────────────────────────
            _label('Diary Type'),
            const SizedBox(height: 8),
            GridView.count(
              crossAxisCount: 5, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 0.85,
              children: _kTypeIcons.keys.map((t) {
                final cfg = _kTypeIcons[t]!;
                final isSel = entryType == t;
                return GestureDetector(
                  onTap: () => onSetType(t),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    decoration: BoxDecoration(
                      color: isSel ? cfg.$2 : cfg.$2.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: isSel ? cfg.$2 : Colors.transparent, width: 2),
                    ),
                    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Icon(cfg.$1, size: 20, color: isSel ? Colors.white : cfg.$2),
                      const SizedBox(height: 4),
                      Text(t, textAlign: TextAlign.center, style: TextStyle(
                        fontSize: 8.5, fontWeight: FontWeight.w800,
                        color: isSel ? Colors.white : cfg.$2)),
                    ]),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),

            // ── Title ──────────────────────────────────────────
            _label('Title *'),
            const SizedBox(height: 6),
            _buildField('e.g. Painting Activity Today 🎨', titleCtrl),
            const SizedBox(height: 12),

            // ── Content ────────────────────────────────────────
            _label('Message / Observation *'),
            const SizedBox(height: 6),
            Container(
              decoration: BoxDecoration(color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0))),
              child: TextField(
                controller: contentCtrl, maxLines: 5,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: _ink, height: 1.5),
                decoration: const InputDecoration(
                  border: InputBorder.none, hintText: 'Write your detailed observations, feedback or instructions here…',
                  contentPadding: EdgeInsets.all(14),
                  hintStyle: TextStyle(fontSize: 14, color: Color(0xFFCBD5E1), fontWeight: FontWeight.w400),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // ── Class Selector ─────────────────────────────────
            _label('Target Class *'),
            const SizedBox(height: 8),
            classroomsAsync.when(
              data: (list) => list.isEmpty
                  ? const Text('No classes found', style: TextStyle(color: _ink3))
                  : Wrap(spacing: 8, runSpacing: 8, children: list.map((c) {
                      final isSel = selectedClassId == c['id'];
                      return GestureDetector(
                        onTap: () => onSetClass(c['id'], c['name']),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: isSel ? _tA : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: isSel ? _tA : Colors.transparent),
                          ),
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            Icon(Icons.class_, size: 14, color: isSel ? Colors.white : _ink3),
                            const SizedBox(width: 6),
                            Text(c['name'], style: TextStyle(fontSize: 13,
                              fontWeight: FontWeight.w700, color: isSel ? Colors.white : _ink3)),
                          ]),
                        ),
                      );
                    }).toList()),
              loading: () => const CircularProgressIndicator(),
              error: (_, __) => const Text('Error loading classes', style: TextStyle(color: Colors.red)),
            ),
            const SizedBox(height: 16),

            // ── Recipient Type ─────────────────────────────────
            if (selectedClassId != null) ...[
              _label('Send To'),
              const SizedBox(height: 8),
              Row(children: [
                _recipientBtn('Entire Class', Icons.groups_rounded, 'CLASS'),
                const SizedBox(width: 10),
                _recipientBtn('Individual Students', Icons.person_rounded, 'STUDENT'),
              ]),
              const SizedBox(height: 12),
              if (recipientType == 'STUDENT') _buildStudentSelector(ref),
              const SizedBox(height: 16),
            ],

            // ── Priority ───────────────────────────────────────
            _label('Priority Level'),
            const SizedBox(height: 8),
            Row(children: _kPriorityColors.keys.map((p) {
              final isSel = priority == p;
              final col = _kPriorityColors[p]!;
              return Expanded(child: GestureDetector(
                onTap: () => onSetPriority(p),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  margin: const EdgeInsets.only(right: 6),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    color: isSel ? col : col.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(p, textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900,
                      color: isSel ? Colors.white : col)),
                ),
              ));
            }).toList()),
            const SizedBox(height: 16),

            // ── Mood ──────────────────────────────────────────
            _label('Student Mood (Optional)'),
            const SizedBox(height: 8),
            Wrap(spacing: 8, runSpacing: 8, children: _kMoodEmojis.map((emoji) {
              final isSel = selectedMood == emoji;
              return GestureDetector(
                onTap: () => onSetMood(isSel ? null : emoji),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: isSel ? _tA.withOpacity(0.15) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isSel ? _tA : Colors.transparent, width: 2),
                  ),
                  child: Center(child: Text(emoji, style: const TextStyle(fontSize: 22))),
                ),
              );
            }).toList()),
            const SizedBox(height: 16),

            // ── Acknowledgement ────────────────────────────────
            Container(
              decoration: BoxDecoration(
                color: requiresAck ? const Color(0xFF8B5CF6).withOpacity(0.06) : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: requiresAck ? const Color(0xFF8B5CF6).withOpacity(0.3) : const Color(0xFFE2E8F0)),
              ),
              child: CheckboxListTile(
                title: const Text('Requires Parent Acknowledgement', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: _ink)),
                subtitle: const Text('Parents must confirm they have read this entry', style: TextStyle(fontSize: 11, color: _ink3)),
                value: requiresAck, activeColor: const Color(0xFF8B5CF6),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                onChanged: (_) => onToggleAck(),
              ),
            ),
            const SizedBox(height: 20),
          ]),
        )),

        // ── Post Button ────────────────────────────────────────
        Padding(padding: const EdgeInsets.fromLTRB(20, 0, 20, 20), child: GestureDetector(
          onTap: isPosting ? null : onPost,
          child: Container(
            height: 56, alignment: Alignment.center,
            decoration: BoxDecoration(
              gradient: isPosting ? null : _tGrad,
              color: isPosting ? Colors.grey[300] : null,
              borderRadius: BorderRadius.circular(16),
              boxShadow: isPosting ? [] : [BoxShadow(color: _tA.withOpacity(0.4), blurRadius: 12, offset: const Offset(0,4))],
            ),
            child: isPosting
                ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
                : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.send_rounded, color: Colors.white, size: 18),
                    SizedBox(width: 8),
                    Text('Post Diary Entry', style: TextStyle(fontFamily: 'Cabinet Grotesk',
                      fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
                  ]),
          ),
        )),
      ]),
    );
  }

  Widget _label(String text) => Text(text, style: const TextStyle(
    fontSize: 13, fontWeight: FontWeight.w700, color: _ink, letterSpacing: 0.3));

  Widget _buildField(String hint, TextEditingController ctrl) => Container(
    height: 50, padding: const EdgeInsets.symmetric(horizontal: 14),
    decoration: BoxDecoration(
      color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(14),
      border: Border.all(color: const Color(0xFFE2E8F0))),
    child: TextField(
      controller: ctrl,
      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: _ink),
      decoration: InputDecoration(
        border: InputBorder.none, hintText: hint,
        hintStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: Color(0xFFCBD5E1))),
    ),
  );

  Widget _recipientBtn(String label, IconData icon, String value) => Expanded(
    child: GestureDetector(
      onTap: () => onSetRecipientType(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        height: 46, alignment: Alignment.center,
        decoration: BoxDecoration(
          color: recipientType == value ? _tA : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(12)),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, size: 14, color: recipientType == value ? Colors.white : _ink3),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700,
            color: recipientType == value ? Colors.white : _ink3)),
        ]),
      ),
    ),
  );

  Widget _buildStudentSelector(WidgetRef ref) {
    final studentsAsync = ref.watch(diaryStudentsProvider(selectedClassId));
    return studentsAsync.when(
      data: (students) {
        if (students.isEmpty) return const Text('No students found', style: TextStyle(fontSize: 13, color: _ink3));
        return Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC), border: Border.all(color: const Color(0xFFE2E8F0)),
            borderRadius: BorderRadius.circular(14)),
          constraints: const BoxConstraints(maxHeight: 200),
          child: ListView.separated(
            shrinkWrap: true,
            separatorBuilder: (_, __) => const Divider(height: 1, indent: 16),
            itemCount: students.length,
            itemBuilder: (ctx, i) {
              final s = students[i];
              final id = s['id'] as String;
              final name = s['name'] as String? ?? 'Unknown';
              final isChecked = selectedStudentIds.contains(id);
              return CheckboxListTile(
                title: Text(name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: _ink)),
                subtitle: Text(s['rollNo'] ?? '', style: const TextStyle(fontSize: 11, color: _ink3)),
                value: isChecked, activeColor: _tA,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                dense: true, onChanged: (_) => onToggleStudent(id),
              );
            },
          ),
        );
      },
      loading: () => const Padding(padding: EdgeInsets.all(8), child: CircularProgressIndicator()),
      error: (_, __) => const Text('Error loading students', style: TextStyle(color: Colors.red)),
    );
  }
}
