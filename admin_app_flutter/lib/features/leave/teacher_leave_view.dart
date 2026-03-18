import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import '../../core/state/auth_state.dart';

// ─── Design tokens ────────────────────────────────────────────────────────────
const _ink    = Color(0xFF140E28);
const _ink3   = Color(0xFF7B7291);
const _bg2    = Color(0xFFF5F3FF);
const _tA     = Color(0xFFFF5733);
const _tSoft  = Color(0x14FF5733);
const _tGrad  = LinearGradient(
  colors: [Color(0xFFFF5733), Color(0xFFFF006E), Color(0xFFC77DFF)],
  begin: Alignment.topLeft, end: Alignment.bottomRight,
);

// ─── Leave type config ────────────────────────────────────────────────────────
class _TC {
  final String emoji, label;
  final Color bg, fg;
  const _TC(this.emoji, this.label, this.bg, this.fg);
}

const _types = {
  'CASUAL':   _TC('🏝️', 'Casual Leave',  Color(0xFFFEF3C7), Color(0xFFD97706)),
  'MEDICAL':  _TC('🏥', 'Medical Leave',  Color(0xFFDBEAFE), Color(0xFF3B82F6)),
  'EARNED':   _TC('✅', 'Earned Leave',   Color(0xFFD1FAE5), Color(0xFF059669)),
  'SICK':     _TC('🤒', 'Sick Leave',     Color(0xFFDBEAFE), Color(0xFF3B82F6)),
  'COMP_OFF': _TC('🎯', 'Comp-Off',       Color(0xFFFFF7ED), Color(0xFFF59E0B)),
  'OTHER':    _TC('📋', 'Other Leave',    Color(0xFFF5F3FF), Color(0xFF7C3AED)),
};

_TC _cfg(String t) => _types[t.toUpperCase()] ?? _types['OTHER']!;

// ─── Status helpers ───────────────────────────────────────────────────────────
Color _sBg(String s) {
  switch (s) {
    case 'APPROVED': return const Color(0xFFD1FAE5);
    case 'REJECTED': return const Color(0xFFFEE2E2);
    default:         return const Color(0xFFFEF3C7);
  }
}
Color _sFg(String s) {
  switch (s) {
    case 'APPROVED': return const Color(0xFF059669);
    case 'REJECTED': return const Color(0xFFEF4444);
    default:         return const Color(0xFFD97706);
  }
}

// ─── Data model ───────────────────────────────────────────────────────────────
class LeaveRequest {
  final String id, type, status;
  final DateTime startDate, endDate, createdAt;
  final String? reason;
  const LeaveRequest({
    required this.id, required this.type, required this.status,
    required this.startDate, required this.endDate, required this.createdAt,
    this.reason,
  });
  int get totalDays => endDate.difference(startDate).inDays + 1;
  factory LeaveRequest.fromJson(Map<String, dynamic> j) => LeaveRequest(
    id: j['id'] as String,
    type: (j['type'] as String? ?? 'CASUAL').toUpperCase(),
    status: (j['status'] as String? ?? 'PENDING').toUpperCase(),
    startDate: DateTime.parse(j['startDate'] as String),
    endDate: DateTime.parse(j['endDate'] as String),
    createdAt: DateTime.parse(j['createdAt'] as String),
    reason: j['reason'] as String?,
  );
}

// ─── Date formatting ──────────────────────────────────────────────────────────
const _months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
String _fmtDate(DateTime d) => '${_months[d.month-1]} ${d.day}';
String _fmtFull(DateTime d) => '${_months[d.month-1]} ${d.day}, ${d.year}';

// ─── Provider ─────────────────────────────────────────────────────────────────
final _leavesProvider = FutureProvider.autoDispose<List<LeaveRequest>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) return [];
  try {
    final res = await http.get(
      Uri.parse('http://localhost:3000/api/mobile/v1/staff/leaves'),
      headers: {'Authorization': 'Bearer ${user!.token}'},
    ).timeout(const Duration(seconds: 10));
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['success'] == true) {
        return (data['leaves'] as List? ?? [])
            .map((e) => LeaveRequest.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    }
  } catch (_) {}
  return [];
});

// ─── Main View ────────────────────────────────────────────────────────────────
class TeacherLeaveView extends ConsumerStatefulWidget {
  const TeacherLeaveView({super.key});
  @override
  ConsumerState<TeacherLeaveView> createState() => _TeacherLeaveViewState();
}

class _TeacherLeaveViewState extends ConsumerState<TeacherLeaveView> {
  String _filter = 'all';
  void _refresh() => ref.invalidate(_leavesProvider);

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(_leavesProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFFAFBFE),
      body: Column(children: [
        _buildHeader(context, async),
        Expanded(child: _buildBody(context, async)),
      ]),
    );
  }

  Widget _buildHeader(BuildContext context, AsyncValue<List<LeaveRequest>> async) {
    final leaves = async.value ?? [];
    final pending     = leaves.where((l) => l.status == 'PENDING').length;
    final casualUsed  = leaves.where((l) => l.type == 'CASUAL'  && l.status == 'APPROVED').fold(0, (s, l) => s + l.totalDays);
    final medicalUsed = leaves.where((l) => l.type == 'MEDICAL' && l.status == 'APPROVED').fold(0, (s, l) => s + l.totalDays);
    final earnedUsed  = leaves.where((l) => l.type == 'EARNED'  && l.status == 'APPROVED').fold(0, (s, l) => s + l.totalDays);

    return Container(color: Colors.white,
      child: SafeArea(bottom: false, child: Column(children: [
        Padding(padding: const EdgeInsets.fromLTRB(16,12,16,14), child: Row(children: [
          GestureDetector(
            onTap: () { HapticFeedback.lightImpact(); context.pop(); },
            child: Container(width:32, height:32,
              decoration: BoxDecoration(color: _tSoft, borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.chevron_left_rounded, color: _tA, size:20))),
          const SizedBox(width:10),
          const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Leave', style: TextStyle(fontFamily:'Clash Display', fontSize:17, fontWeight:FontWeight.w900, color:_ink, letterSpacing:-.3)),
            Text('Apply, track & manage your leaves', style: TextStyle(fontFamily:'Satoshi', fontSize:10, fontWeight:FontWeight.w600, color:_ink3)),
          ])),
          GestureDetector(
            onTap: () => _showApply(context),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal:14, vertical:8),
              decoration: BoxDecoration(gradient: _tGrad, borderRadius: BorderRadius.circular(100),
                boxShadow: [BoxShadow(color: _tA.withValues(alpha: .3), blurRadius:12, offset: const Offset(0,4))]),
              child: const Text('+ Apply', style: TextStyle(fontFamily:'Satoshi', fontSize:11, fontWeight:FontWeight.w800, color:Colors.white)))),
        ])),

        // Balance chips
        SizedBox(height: 86, child: ListView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.fromLTRB(16,0,16,14),
          children: [
            _Chip('${12-casualUsed}',  'Casual',  '$casualUsed used · ${12-casualUsed} left', _tSoft, _tA, const Color(0x33FF5733)),
            _Chip('${8-medicalUsed}',  'Medical', '$medicalUsed used · ${8-medicalUsed} left', const Color(0xFFEFF6FF), const Color(0xFF3B82F6), const Color(0x333B82F6)),
            _Chip('${15-earnedUsed}',  'Earned',  '$earnedUsed used · ${15-earnedUsed} left', const Color(0xFFF0FDF4), const Color(0xFF10B981), const Color(0x3310B981)),
            const _Chip('2', 'Comp-Off', 'Available', Color(0xFFFFF7ED), Color(0xFFF59E0B), Color(0x33F59E0B)),
          ],
        )),

        // Filter tabs
        Container(
          decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0x10140E28)))),
          child: Row(children: [
            _tab('all', 'All', null),
            _tab('pending', 'Pending', pending > 0 ? '$pending' : null),
            _tab('approved', 'Approved', null),
            _tab('rejected', 'Rejected', null),
          ]),
        ),
      ])),
    );
  }

  Widget _tab(String key, String label, String? badge) {
    final active = _filter == key;
    return Expanded(child: GestureDetector(
      onTap: () => setState(() => _filter = key),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical:8),
        decoration: BoxDecoration(border: Border(bottom: BorderSide(color: active ? _tA : Colors.transparent, width:2.5))),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text(label, style: TextStyle(fontFamily:'Satoshi', fontSize:11, fontWeight:FontWeight.w800, color: active ? _tA : _ink3)),
          if (badge != null) ...[
            const SizedBox(width:4),
            Container(padding: const EdgeInsets.symmetric(horizontal:6, vertical:1),
              decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(100)),
              child: Text(badge, style: const TextStyle(fontSize:9, color:Color(0xFFD97706), fontWeight:FontWeight.w800))),
          ],
        ]),
      ),
    ));
  }

  Widget _buildBody(BuildContext context, AsyncValue<List<LeaveRequest>> async) {
    return async.when(
      loading: () => const Center(child: CircularProgressIndicator(color: _tA, strokeWidth:2)),
      error:   (_, __) => _error(),
      data: (leaves) {
        final filtered = _filter == 'all' ? leaves
            : leaves.where((l) => l.status == _filter.toUpperCase()).toList();
        if (filtered.isEmpty) return _empty();
        return RefreshIndicator(
          onRefresh: () async => _refresh(), color: _tA,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16,16,16,40),
            children: [
              const Text('Leave History · 2025–26', style: TextStyle(
                fontFamily:'Satoshi', fontSize:10, fontWeight:FontWeight.w800, color:_ink3, letterSpacing:.5)),
              const SizedBox(height:10),
              ...filtered.map((l) => _LeaveCard(leave:l, onWithdraw:_refresh)),
            ],
          ),
        );
      },
    );
  }

  Widget _empty() => Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
    Container(width:64, height:64,
      decoration: BoxDecoration(gradient: _tGrad, borderRadius: BorderRadius.circular(20)),
      child: const Icon(Icons.beach_access_rounded, color: Colors.white, size:28)),
    const SizedBox(height:16),
    const Text('No leaves found', style: TextStyle(fontFamily:'Cabinet Grotesk', fontSize:16, fontWeight:FontWeight.w800, color:_ink)),
    const SizedBox(height:6),
    const Text('Apply for a leave using the + Apply button', style: TextStyle(fontFamily:'Satoshi', fontSize:12, color:_ink3)),
    const SizedBox(height:20),
    GestureDetector(
      onTap: () => _showApply(context),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal:20, vertical:10),
        decoration: BoxDecoration(gradient: _tGrad, borderRadius: BorderRadius.circular(100)),
        child: const Text('+ Apply Leave', style: TextStyle(fontFamily:'Satoshi', fontSize:12, fontWeight:FontWeight.w800, color:Colors.white)))),
  ]));

  Widget _error() => Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
    const Icon(Icons.wifi_off_rounded, size:40, color:_ink3),
    const SizedBox(height:12),
    const Text('Could not load leaves', style: TextStyle(color:_ink3, fontFamily:'Satoshi')),
    const SizedBox(height:12),
    GestureDetector(onTap: _refresh, child: Container(
      padding: const EdgeInsets.symmetric(horizontal:18, vertical:8),
      decoration: BoxDecoration(color:_tSoft, borderRadius: BorderRadius.circular(10)),
      child: const Text('Retry', style: TextStyle(color:_tA, fontWeight:FontWeight.w800, fontFamily:'Satoshi')))),
  ]));

  void _showApply(BuildContext context) {
    showModalBottomSheet(
      context: context, isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ApplySheet(
        token: ref.read(userProfileProvider)?.token ?? '',
        onSuccess: () { _refresh(); Navigator.pop(context); },
      ),
    );
  }
}

// ─── Leave Card ───────────────────────────────────────────────────────────────
class _LeaveCard extends ConsumerWidget {
  final LeaveRequest leave;
  final VoidCallback onWithdraw;
  const _LeaveCard({required this.leave, required this.onWithdraw});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cfg = _cfg(leave.type);
    final isPending  = leave.status == 'PENDING';
    final isApproved = leave.status == 'APPROVED';
    final borderC = isApproved ? const Color(0x33059669)
        : (isPending ? const Color(0x40F59E0B) : const Color(0x33EF4444));
    final shadowC = isApproved ? const Color(0x0F059669)
        : (isPending ? const Color(0x14F59E0B) : const Color(0x0FEF4444));

    return Container(
      margin: const EdgeInsets.only(bottom:10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(18),
        border: Border.all(color: borderC, width:1.5),
        boxShadow: [BoxShadow(color: shadowC, blurRadius:12, offset: const Offset(0,2))]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(width:42, height:42, alignment: Alignment.center,
            decoration: BoxDecoration(color: cfg.bg, borderRadius: BorderRadius.circular(14)),
            child: Text(cfg.emoji, style: const TextStyle(fontSize:20))),
          const SizedBox(width:10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(cfg.label, style: const TextStyle(fontFamily:'Satoshi', fontSize:14, fontWeight:FontWeight.w800, color:_ink, height:1.1)),
            const SizedBox(height:2),
            Text('${_fmtDate(leave.startDate)} → ${_fmtDate(leave.endDate)} · ${leave.totalDays} day${leave.totalDays > 1 ? 's' : ''}',
              style: const TextStyle(fontFamily:'Satoshi', fontSize:10, color:_ink3, fontWeight:FontWeight.w600)),
          ])),
          const SizedBox(width:8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal:11, vertical:5),
            decoration: BoxDecoration(color: _sBg(leave.status), borderRadius: BorderRadius.circular(100)),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              if (isPending) Container(width:6, height:6, margin: const EdgeInsets.only(right:4),
                decoration: const BoxDecoration(color: Color(0xFFD97706), shape: BoxShape.circle)),
              Text(leave.status, style: TextStyle(fontFamily:'Satoshi', fontSize:9, fontWeight:FontWeight.w800, color: _sFg(leave.status))),
            ]),
          ),
        ]),

        if (leave.reason != null && leave.reason!.isNotEmpty) ...[
          const SizedBox(height:12),
          Container(padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color:_bg2, borderRadius: BorderRadius.circular(12)),
            child: Text(leave.reason!, style: const TextStyle(fontFamily:'Satoshi', fontSize:11, fontWeight:FontWeight.w600, color:_ink, height:1.45))),
        ],

        const SizedBox(height:10),
        Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            RichText(text: TextSpan(
              style: const TextStyle(fontFamily:'Satoshi', fontSize:10, color:_ink3),
              children: [
                const TextSpan(text: 'Applied: '),
                TextSpan(text: _fmtFull(leave.createdAt),
                  style: const TextStyle(color:_ink, fontWeight:FontWeight.w700)),
              ],
            )),
            if (isApproved)
              const Text('Approved by HR', style: TextStyle(fontFamily:'Satoshi', fontSize:10, color: Color(0xFF059669), fontWeight:FontWeight.w600)),
            if (!isApproved && !leave.status.contains('REJECT'))
              const Text('Awaiting approval', style: TextStyle(fontFamily:'Satoshi', fontSize:10, color:_ink3, fontWeight:FontWeight.w600)),
          ])),
          if (isPending)
            GestureDetector(
              onTap: () => _withdraw(context, ref, leave.id, ref.read(userProfileProvider)?.token ?? ''),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal:14, vertical:7),
                decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(100),
                  border: Border.all(color: const Color(0x4DEF4444), width:1.5)),
                child: const Text('Withdraw', style: TextStyle(fontFamily:'Satoshi', fontSize:10, fontWeight:FontWeight.w800, color: Color(0xFFEF4444))))),
        ]),
      ]),
    );
  }

  Future<void> _withdraw(BuildContext context, WidgetRef ref, String id, String token) async {
    HapticFeedback.lightImpact();
    try {
      await http.delete(
        Uri.parse('http://localhost:3000/api/mobile/v1/staff/leaves/$id'),
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds:8));
      onWithdraw();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Leave withdrawn ✓'), backgroundColor: Color(0xFF059669)));
      }
    } catch (_) {}
  }
}

// ─── Balance Chip ─────────────────────────────────────────────────────────────
class _Chip extends StatelessWidget {
  final String value, label, sub;
  final Color bg, fg, border;
  const _Chip(this.value, this.label, this.sub, this.bg, this.fg, this.border);
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(right:8),
    padding: const EdgeInsets.symmetric(horizontal:14, vertical:10),
    constraints: const BoxConstraints(minWidth:80),
    decoration: BoxDecoration(color:bg, borderRadius: BorderRadius.circular(14), border: Border.all(color:border, width:1.5)),
    child: Column(children: [
      Text(value, style: TextStyle(fontFamily:'Cabinet Grotesk', fontSize:20, fontWeight:FontWeight.w900, color:fg, height:1)),
      const SizedBox(height:2),
      Text(label, style: const TextStyle(fontFamily:'Satoshi', fontSize:9, fontWeight:FontWeight.w700, color:_ink3, letterSpacing:.3)),
      const SizedBox(height:1),
      Text(sub, style: const TextStyle(fontFamily:'Satoshi', fontSize:8, color:_ink3)),
    ]),
  );
}

// ─── Apply Sheet ──────────────────────────────────────────────────────────────
class _ApplySheet extends StatefulWidget {
  final String token;
  final VoidCallback onSuccess;
  const _ApplySheet({required this.token, required this.onSuccess});
  @override
  State<_ApplySheet> createState() => _ApplySheetState();
}

class _ApplySheetState extends State<_ApplySheet> {
  String _type   = 'CASUAL';
  DateTime? _from, _to;
  bool _pickFrom = true;
  final _reason  = TextEditingController();
  bool _loading  = false;
  String? _error;

  int get _days => (_from != null && _to != null) ? _to!.difference(_from!).inDays + 1 : 0;

  @override
  void dispose() { _reason.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;
    return SingleChildScrollView(
      child: Container(
        margin: EdgeInsets.only(bottom: bottom),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          // Handle
          Container(margin: const EdgeInsets.only(top:10), width:40, height:4,
            decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(100))),
          const SizedBox(height:16),

          // Title + day count
          Padding(padding: const EdgeInsets.symmetric(horizontal:18), child: Row(children: [
            const Expanded(child: Text('Apply for Leave', style: TextStyle(
              fontFamily:'Clash Display', fontSize:16, fontWeight:FontWeight.w900, color:_ink))),
            Container(
              padding: const EdgeInsets.symmetric(horizontal:10, vertical:5),
              decoration: BoxDecoration(color:_tSoft, borderRadius: BorderRadius.circular(100)),
              child: Text(_days > 0 ? '$_days day${_days > 1 ? 's' : ''}' : 'Select range',
                style: const TextStyle(fontFamily:'Satoshi', fontSize:11, fontWeight:FontWeight.w800, color:_tA))),
          ])),
          const SizedBox(height:14),

          // Leave type chips
          SizedBox(height:40, child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal:18),
            children: ['CASUAL','MEDICAL','EARNED','SICK','COMP_OFF'].map((t) {
              final c = _cfg(t); final sel = _type == t;
              return GestureDetector(
                onTap: () => setState(() => _type = t),
                child: Container(
                  margin: const EdgeInsets.only(right:8),
                  padding: const EdgeInsets.symmetric(horizontal:12, vertical:8),
                  decoration: BoxDecoration(
                    color: sel ? c.bg : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(100),
                    border: Border.all(color: sel ? c.fg : const Color(0xFFE2E8F0), width:1.5)),
                  child: Text('${c.emoji} ${c.label}', style: TextStyle(
                    fontFamily:'Satoshi', fontSize:11, fontWeight:FontWeight.w700,
                    color: sel ? c.fg : _ink3))));
            }).toList(),
          )),
          const SizedBox(height:14),

          // From / To range pills
          Padding(padding: const EdgeInsets.symmetric(horizontal:18), child: Row(children: [
            Expanded(child: GestureDetector(
              onTap: () => setState(() => _pickFrom = true),
              child: _RangePill(label:'From', date:_from, active:_pickFrom))),
            const Padding(padding: EdgeInsets.symmetric(horizontal:8), child: Text('→', style: TextStyle(fontSize:16, color:_ink3))),
            Expanded(child: GestureDetector(
              onTap: () => setState(() => _pickFrom = false),
              child: _RangePill(label:'To', date:_to, active:!_pickFrom))),
          ])),
          const SizedBox(height:12),

          // ── Beautiful themed calendar ──────────────────────────────────────
          _LeaveCalendar(
            from:_from, to:_to, pickingFrom:_pickFrom,
            onPick: (date) => setState(() {
              if (_pickFrom) {
                _from = date; _to = null; _pickFrom = false;
              } else {
                if (_from != null && date.isBefore(_from!)) {
                  _to = _from; _from = date;
                } else {
                  _to = date;
                }
              }
            }),
          ),
          const SizedBox(height:14),

          // Reason
          Padding(padding: const EdgeInsets.symmetric(horizontal:18),
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0))),
              child: TextField(
                controller: _reason, maxLines:3, minLines:2,
                style: const TextStyle(fontFamily:'Satoshi', fontSize:13, color:_ink),
                decoration: const InputDecoration(
                  hintText:'Reason for leave…',
                  hintStyle: TextStyle(fontFamily:'Satoshi', fontSize:13, color:_ink3),
                  contentPadding: EdgeInsets.all(14),
                  border: InputBorder.none)))),
          const SizedBox(height:12),

          if (_error != null)
            Padding(padding: const EdgeInsets.symmetric(horizontal:18),
              child: Text(_error!, style: const TextStyle(color: Color(0xFFEF4444), fontFamily:'Satoshi', fontSize:12))),

          Padding(padding: const EdgeInsets.fromLTRB(18,4,18,24),
            child: GestureDetector(
              onTap: _loading ? null : _submit,
              child: Container(
                height:52, alignment: Alignment.center,
                decoration: BoxDecoration(gradient:_tGrad, borderRadius: BorderRadius.circular(16),
                  boxShadow: [BoxShadow(color:_tA.withValues(alpha: .3), blurRadius:12, offset: const Offset(0,4))]),
                child: _loading
                    ? const SizedBox(width:20, height:20, child: CircularProgressIndicator(color:Colors.white, strokeWidth:2))
                    : const Text('Submit Leave Application', style: TextStyle(fontFamily:'Satoshi', fontSize:14, fontWeight:FontWeight.w800, color:Colors.white))))),
        ]),
      ),
    );
  }

  Future<void> _submit() async {
    if (_from == null || _to == null) { setState(() => _error = 'Please select a date range'); return; }
    if (_reason.text.trim().isEmpty) { setState(() => _error = 'Please add a reason'); return; }
    setState(() { _loading = true; _error = null; });
    try {
      final res = await http.post(
        Uri.parse('http://localhost:3000/api/mobile/v1/staff/leaves'),
        headers: {'Authorization': 'Bearer ${widget.token}', 'Content-Type': 'application/json'},
        body: jsonEncode({'type':_type, 'startDate':_from!.toIso8601String(),
          'endDate':_to!.toIso8601String(), 'reason':_reason.text.trim(), 'totalDays':_days}),
      ).timeout(const Duration(seconds:10));
      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['success'] == true) {
        widget.onSuccess();
      } else {
        setState(() { _error = data['error'] ?? 'Failed to submit'; _loading = false; });
      }
    } catch (e) {
      setState(() { _error = 'Network error. Try again.'; _loading = false; });
    }
  }
}

// ─── Range Pill button ────────────────────────────────────────────────────────
class _RangePill extends StatelessWidget {
  final String label;
  final DateTime? date;
  final bool active;
  const _RangePill({required this.label, this.date, required this.active});
  @override
  Widget build(BuildContext context) => AnimatedContainer(
    duration: const Duration(milliseconds:200),
    padding: const EdgeInsets.symmetric(horizontal:14, vertical:10),
    decoration: BoxDecoration(
      color: active ? _tSoft : const Color(0xFFF8FAFC),
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: active ? _tA : const Color(0xFFE2E8F0), width: active ? 2 : 1)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Text(label, style: TextStyle(fontFamily:'Satoshi', fontSize:9, fontWeight:FontWeight.w800,
          color: active ? _tA : _ink3, letterSpacing:.4)),
        if (active) ...[
          const SizedBox(width:4),
          Container(width:5, height:5, decoration: const BoxDecoration(color:_tA, shape:BoxShape.circle)),
        ],
      ]),
      const SizedBox(height:4),
      Text(date != null ? _fmtFull(date!) : 'Tap to select',
        style: TextStyle(fontFamily:'Satoshi', fontSize:11, fontWeight:FontWeight.w700,
          color: date != null ? _ink : _ink3)),
    ]),
  );
}

// ─── Beautiful Theme Calendar ─────────────────────────────────────────────────
class _LeaveCalendar extends StatefulWidget {
  final DateTime? from, to;
  final bool pickingFrom;
  final void Function(DateTime) onPick;
  const _LeaveCalendar({this.from, this.to, required this.pickingFrom, required this.onPick});
  @override
  State<_LeaveCalendar> createState() => _LeaveCalendarState();
}

class _LeaveCalendarState extends State<_LeaveCalendar> with SingleTickerProviderStateMixin {
  late DateTime _month;
  late AnimationController _ctrl;
  bool _slideLeft = true;

  @override
  void initState() {
    super.initState();
    _month = DateTime(DateTime.now().year, DateTime.now().month);
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds:260));
    _ctrl.value = 1;
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  void _prev() {
    _slideLeft = false;
    _ctrl.reverse().then((_) {
      setState(() => _month = DateTime(_month.year, _month.month - 1));
      _ctrl.forward();
    });
  }

  void _next() {
    _slideLeft = true;
    _ctrl.reverse().then((_) {
      setState(() => _month = DateTime(_month.year, _month.month + 1));
      _ctrl.forward();
    });
  }

  bool _same(DateTime a, DateTime b) => a.year == b.year && a.month == b.month && a.day == b.day;

  @override
  Widget build(BuildContext context) {
    const monthNames = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December'];
    const dayNames = ['M','T','W','T','F','S','S'];
    final today  = DateTime.now();
    final first  = DateTime(_month.year, _month.month);
    final last   = DateTime(_month.year, _month.month + 1, 0);
    final offset = (first.weekday - 1) % 7;
    final rows   = ((offset + last.day) / 7).ceil();

    return Padding(padding: const EdgeInsets.symmetric(horizontal:18),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0x08000000)),
          boxShadow: [BoxShadow(color: _tA.withValues(alpha: .1), blurRadius:24, offset: const Offset(0,6))]),
        child: Column(children: [
          // ── Gradient header ───────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.fromLTRB(14,14,14,14),
            decoration: const BoxDecoration(
              gradient: _tGrad,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
            child: Row(children: [
              GestureDetector(onTap: _prev,
                child: Container(width:32, height:32,
                  decoration: BoxDecoration(color: Colors.white.withValues(alpha: .2), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.chevron_left_rounded, color:Colors.white, size:20))),
              Expanded(child: Column(children: [
                Text(monthNames[_month.month-1], style: const TextStyle(
                  fontFamily:'Clash Display', fontSize:17, fontWeight:FontWeight.w900,
                  color:Colors.white, height:1, letterSpacing:-.2)),
                Text('${_month.year}', style: const TextStyle(
                  fontFamily:'Satoshi', fontSize:10, fontWeight:FontWeight.w700,
                  color:Colors.white70)),
              ])),
              GestureDetector(onTap: _next,
                child: Container(width:32, height:32,
                  decoration: BoxDecoration(color: Colors.white.withValues(alpha: .2), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.chevron_right_rounded, color:Colors.white, size:20))),
            ]),
          ),

          // ── Hint banner ───────────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(horizontal:14, vertical:8),
            color: widget.pickingFrom ? _tSoft : const Color(0xFFEFF6FF),
            child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(widget.pickingFrom ? Icons.calendar_today_rounded : Icons.event_available_rounded,
                size:12, color: widget.pickingFrom ? _tA : const Color(0xFF3B82F6)),
              const SizedBox(width:6),
              Text(widget.pickingFrom ? 'Select start date' : 'Select end date',
                style: TextStyle(fontFamily:'Satoshi', fontSize:11, fontWeight:FontWeight.w700,
                  color: widget.pickingFrom ? _tA : const Color(0xFF3B82F6))),
            ]),
          ),

          // ── Day-of-week header ────────────────────────────────────────────
          Padding(padding: const EdgeInsets.fromLTRB(10,10,10,4),
            child: Row(children: dayNames.asMap().entries.map((e) => Expanded(child: Center(child: Text(e.value,
              style: TextStyle(fontFamily:'Satoshi', fontSize:10, fontWeight:FontWeight.w800,
                color: e.key >= 5 ? const Color(0xFFEF4444).withValues(alpha: .7) : _ink3))))).toList())),

          // ── Animated date grid ────────────────────────────────────────────
          AnimatedBuilder(
            animation: _ctrl,
            builder: (_, __) => Opacity(
              opacity: _ctrl.value,
              child: Transform.translate(
                offset: Offset((1 - _ctrl.value) * (_slideLeft ? 24 : -24), 0),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(10, 2, 10, 10),
                  child: Column(children: List.generate(rows, (row) => Row(
                    children: List.generate(7, (col) {
                      final idx = row * 7 + col;
                      final d   = idx - offset + 1;
                      if (idx < offset || d > last.day) return const Expanded(child: SizedBox(height:40));

                      final date    = DateTime(_month.year, _month.month, d);
                      final isToday = _same(date, today);
                      final isFrom  = widget.from != null && _same(date, widget.from!);
                      final isTo    = widget.to   != null && _same(date, widget.to!);
                      final isSel   = isFrom || isTo;
                      final inRange = widget.from != null && widget.to != null &&
                          date.isAfter(widget.from!) && date.isBefore(widget.to!);
                      final isWknd  = col >= 5;
                      final isPast  = date.isBefore(DateTime(today.year, today.month, today.day));

                      // Range background pill
                      BorderRadius? rangeBr;
                      if (isFrom && widget.to != null) rangeBr = const BorderRadius.horizontal(left: Radius.circular(100));
                      if (isTo && widget.from != null) rangeBr = const BorderRadius.horizontal(right: Radius.circular(100));

                      return Expanded(child: GestureDetector(
                        onTap: isPast ? null : () => widget.onPick(date),
                        child: Container(
                          height: 40,
                          decoration: BoxDecoration(
                            color: inRange ? _tSoft : Colors.transparent,
                            borderRadius: rangeBr,
                          ),
                          child: Center(child: Container(
                            width:34, height:34,
                            decoration: isSel
                                ? BoxDecoration(gradient: _tGrad, shape: BoxShape.circle,
                                    boxShadow: [BoxShadow(color: _tA.withValues(alpha: .35), blurRadius:8, offset: const Offset(0,2))])
                                : (isToday
                                    ? BoxDecoration(shape: BoxShape.circle,
                                        border: Border.all(color: _tA, width:2))
                                    : null),
                            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                              Text('$d', style: TextStyle(
                                fontFamily:'Satoshi', fontSize:13,
                                fontWeight: isSel || isToday ? FontWeight.w900 : FontWeight.w600,
                                color: isSel
                                    ? Colors.white
                                    : isPast
                                        ? _ink3.withValues(alpha: .4)
                                        : isToday
                                            ? _tA
                                            : inRange
                                                ? _tA.withValues(alpha: .9)
                                                : isWknd
                                                    ? const Color(0xFFEF4444).withValues(alpha: .7)
                                                    : _ink)),
                              // Today dot
                              if (isToday && !isSel)
                                Container(width:4, height:4,
                                  decoration: const BoxDecoration(color:_tA, shape:BoxShape.circle)),
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
          Container(
            padding: const EdgeInsets.fromLTRB(14,8,14,14),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Color(0x08000000)))),
            child: Row(children: [
              _leg(color:_tA, label:'Today', dot:true),
              const SizedBox(width:16),
              _leg(color:_tA, label:'Selected', gradient:true),
              const SizedBox(width:16),
              _leg(color:_tSoft, label:'Range'),
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _leg({required Color color, required String label, bool dot=false, bool gradient=false}) =>
    Row(mainAxisSize: MainAxisSize.min, children: [
      if (dot) Container(width:10, height:10, decoration: BoxDecoration(color:color, shape:BoxShape.circle))
      else if (gradient) Container(width:18, height:10,
        decoration: BoxDecoration(gradient: _tGrad, borderRadius: BorderRadius.circular(100)))
      else Container(width:18, height:10,
        decoration: BoxDecoration(color:color, borderRadius: BorderRadius.circular(100))),
      const SizedBox(width:5),
      Text(label, style: const TextStyle(fontFamily:'Satoshi', fontSize:9, fontWeight:FontWeight.w700, color:_ink3)),
    ]);
}
