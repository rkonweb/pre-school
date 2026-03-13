import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import '../../core/state/auth_state.dart';

// ─── Design tokens ───────────────────────────────────────────────────────────
const _ink  = Color(0xFF140E28);
const _ink3 = Color(0xFF7B7291);
const _ink4 = Color(0xFFB5B0C4);
const _mist = Color(0xFFF8F7F3);
const _line = Color(0x11140E28);
const _bg   = Color(0xFFF7F8FC);
const _tA   = Color(0xFFFF5733);
const _tSoft= Color(0xFFFFF1EE);
const _tBdr = Color(0x33FF5733);
const _tGrad= LinearGradient(
  colors: [Color(0xFFFF5733), Color(0xFFFF006E), Color(0xFFC77DFF)],
  begin: Alignment.topLeft, end: Alignment.bottomRight,
);

// ─── Model ───────────────────────────────────────────────────────────────────
class StaffProfile {
  final String id, name, role, email, phone, schoolName, schoolSlug;
  final String? designation, department, bloodGroup, gender;
  final String? employmentType, address, addressCity, addressState;
  final String? emergencyName, emergencyPhone, emergencyRelation;
  final DateTime? joiningDate, dateOfBirth;
  final List<String> subjects;

  const StaffProfile({
    required this.id, required this.name, required this.role,
    required this.email, required this.phone,
    required this.schoolName, required this.schoolSlug,
    this.designation, this.department, this.bloodGroup, this.gender,
    this.employmentType, this.address, this.addressCity, this.addressState,
    this.emergencyName, this.emergencyPhone, this.emergencyRelation,
    this.joiningDate, this.dateOfBirth, this.subjects = const [],
  });

  factory StaffProfile.fromJson(Map<String, dynamic> j) {
    // subjects may be a comma-separated String OR a List
    List<String> parseSubjects(dynamic raw) {
      if (raw == null) return [];
      if (raw is List) return raw.map((e) => e.toString()).toList();
      if (raw is String && raw.isNotEmpty) {
        return raw.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
      }
      return [];
    }
    return StaffProfile(
      id: j['id'] ?? '',
      name: j['name'] ?? '',
      role: j['role'] ?? 'STAFF',
      email: j['email'] ?? '',
      phone: j['mobile'] ?? j['phone'] ?? '',
      schoolName: j['school']?['name'] ?? '',
      schoolSlug: j['school']?['slug'] ?? '',
      designation: j['designation'],
      department: j['department'],
      bloodGroup: j['bloodGroup'],
      gender: j['gender'],
      employmentType: j['employmentType'],
      address: j['address'],
      addressCity: j['addressCity'],
      addressState: j['addressState'],
      emergencyName: j['emergencyContactName'],
      emergencyPhone: j['emergencyContactPhone'],
      emergencyRelation: j['emergencyContactRelation'],
      joiningDate: j['joiningDate'] != null ? DateTime.tryParse(j['joiningDate']) : null,
      dateOfBirth: j['dateOfBirth'] != null ? DateTime.tryParse(j['dateOfBirth']) : null,
      subjects: parseSubjects(j['subjects']),
    );
  }

  String get initials => name.trim().isEmpty ? '?'
      : name.trim().split(' ').where((w) => w.isNotEmpty).take(2)
          .map((w) => w[0].toUpperCase()).join();

  String get yearsService {
    if (joiningDate == null) return '—';
    final y = (DateTime.now().difference(joiningDate!).inDays / 365).floor();
    return y < 1 ? '<1' : '$y';
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────
final _profileProvider = FutureProvider.autoDispose<StaffProfile>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) throw Exception('Not authenticated');
  final res = await http.get(
    Uri.parse('http://localhost:3000/api/mobile/v1/staff/profile'),
    headers: {'Authorization': 'Bearer ${user!.token}'},
  ).timeout(const Duration(seconds: 10));
  if (res.statusCode == 200) {
    final data = jsonDecode(res.body);
    if (data['success'] == true) {
      return StaffProfile.fromJson(Map<String, dynamic>.from(data['profile']));
    }
  }
  throw Exception('Failed to load profile (${res.statusCode})');
});

// ─── View ─────────────────────────────────────────────────────────────────────
class TeacherProfileView extends ConsumerStatefulWidget {
  const TeacherProfileView({super.key});
  @override ConsumerState<TeacherProfileView> createState() => _State();
}

class _State extends ConsumerState<TeacherProfileView>
    with SingleTickerProviderStateMixin {
  late TabController _tc;
  bool _notifs = true, _sound = true, _biometric = false, _dark = false;

  @override
  void initState() { super.initState(); _tc = TabController(length: 4, vsync: this); }
  @override
  void dispose() { _tc.dispose(); super.dispose(); }

  // ── helpers ────────────────────────────────────────────────────────────────
  static String fmtRole(String r) {
    switch (r.toUpperCase()) {
      case 'TEACHER': return 'Teacher';
      case 'PRINCIPAL': return 'Principal';
      case 'ADMIN': return 'Admin';
      default: return r[0].toUpperCase() + r.substring(1).toLowerCase();
    }
  }
  static String cap(String s) => s.isEmpty ? s
      : s.split('_').map((w) => w.isEmpty ? '' : w[0].toUpperCase() + w.substring(1).toLowerCase()).join(' ');
  static String fmtDate(DateTime d) {
    const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${m[d.month-1]} ${d.day}, ${d.year}';
  }
  static String fmtJoined(DateTime? d) {
    if (d == null) return '—';
    const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${m[d.month-1]} ${d.year}';
  }

  void _copy(String v) {
    Clipboard.setData(ClipboardData(text: v));
    HapticFeedback.lightImpact();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text('Copied "$v"'), duration: const Duration(seconds: 2),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))));
  }

  void _logout() => showDialog(context: context, builder: (ctx) => AlertDialog(
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    title: const Text('Sign Out', style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w800)),
    content: const Text('Are you sure you want to sign out?'),
    actions: [
      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
      ElevatedButton(
        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDC2626)),
        onPressed: () {
          Navigator.pop(ctx);
          ref.read(isAuthenticatedProvider.notifier).state = false;
          ref.read(userProfileProvider.notifier).state = null;
          context.go('/login');
        },
        child: const Text('Sign Out', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800))),
    ]));

  // ── BUILD ──────────────────────────────────────────────────────────────────
  @override Widget build(BuildContext context) {
    final localUser = ref.watch(userProfileProvider);
    final async = ref.watch(_profileProvider);
    return Scaffold(
      backgroundColor: _bg,
      body: async.when(
        loading: () => _shell(
          localUser?.name.trim().split(' ').where((w) => w.isNotEmpty).take(2)
              .map((w) => w[0].toUpperCase()).join() ?? '?',
          localUser?.name ?? '', localUser?.role ?? 'Staff', localUser?.schoolName ?? '',
          null, isLoading: true),
        error: (e, _) => _errorScreen(e.toString()),
        data: (p) => _shell(p.initials, p.name, p.designation ?? fmtRole(p.role),
            p.schoolName, p, isLoading: false),
      ),
    );
  }

  Widget _errorScreen(String msg) => SafeArea(child: Column(children: [
    _cover('!', '', '', ''),
    Expanded(child: Center(child: Padding(padding: const EdgeInsets.all(24), child: Column(
      mainAxisSize: MainAxisSize.min, children: [
      const Icon(Icons.wifi_off_rounded, size: 48, color: _ink3),
      const SizedBox(height: 16),
      Text(msg, style: const TextStyle(color: _ink3, fontSize: 13, fontFamily: 'Satoshi'),
        textAlign: TextAlign.center),
      const SizedBox(height: 20),
      GestureDetector(
        onTap: () => ref.invalidate(_profileProvider),
        child: Container(padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          decoration: BoxDecoration(color: _tSoft, borderRadius: BorderRadius.circular(14)),
          child: const Text('Retry', style: TextStyle(color: _tA, fontWeight: FontWeight.w800,
            fontFamily: 'Satoshi', fontSize: 14)))),
    ])))),
  ]));

  // ── Shell: hero + tabs + body ──────────────────────────────────────────────
  Widget _shell(String initials, String name, String role, String school,
      StaffProfile? p, {required bool isLoading}) {
    return NestedScrollView(
      headerSliverBuilder: (_, __) => [
        SliverToBoxAdapter(child: _cover(initials, name, role, school)),
        if (!isLoading && p != null) SliverToBoxAdapter(child: _nameRow(p)),
        if (!isLoading && p != null) SliverToBoxAdapter(child: _statsBar(p)),
        if (!isLoading && p != null) SliverToBoxAdapter(child: _tabBar()),
      ],
      body: isLoading
        ? const Center(child: CircularProgressIndicator(color: _tA, strokeWidth: 2))
        : p == null ? const SizedBox()
        : TabBarView(controller: _tc, children: [
            _overviewTab(p),
            _performanceTab(p),
            _historyTab(p),
            _settingsTab(p),
          ]),
    );
  }

  // ── Cover ─────────────────────────────────────────────────────────────────
  Widget _cover(String initials, String name, String role, String school) =>
    Stack(clipBehavior: Clip.none, children: [
      // Gradient bg
      Container(height: 160, decoration: const BoxDecoration(gradient: _tGrad),
        child: Stack(children: [
          Container(decoration: const BoxDecoration(gradient: RadialGradient(
            center: Alignment(-0.6, 0), radius: 1.2,
            colors: [Color(0x20FFFFFF), Color(0x00FFFFFF)]))),
          SafeArea(bottom: false, child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Row(children: [
              GestureDetector(
                onTap: () { HapticFeedback.lightImpact(); context.pop(); },
                child: Container(width: 32, height: 32,
                  decoration: BoxDecoration(color: Colors.white.withOpacity(.25),
                    borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.chevron_left_rounded, color: Colors.white, size: 20))),
              const SizedBox(width: 10),
              const Text('My Profile', style: TextStyle(fontFamily: 'Clash Display',
                fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -.3)),
              const Spacer(),
              GestureDetector(
                onTap: () => ref.invalidate(_profileProvider),
                child: Container(width: 32, height: 32,
                  decoration: BoxDecoration(color: Colors.white.withOpacity(.25),
                    borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.refresh_rounded, color: Colors.white, size: 16))),
            ]))),
        ])),
      // Avatar
      Positioned(left: 22, bottom: -38, child: _avatar(initials)),
    ]);

  Widget _avatar(String initials) => Container(
    width: 76, height: 76,
    decoration: const BoxDecoration(shape: BoxShape.circle, gradient: _tGrad,
      boxShadow: [BoxShadow(color: Color(0x44FF5733), blurRadius: 20, offset: Offset(0,6))]),
    child: Stack(children: [
      Center(child: Text(initials, style: const TextStyle(fontFamily: 'Cabinet Grotesk',
        fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white))),
      Positioned.fill(child: Container(decoration: BoxDecoration(
        shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 3)))),
      Positioned(bottom: 4, right: 4, child: Container(width: 14, height: 14,
        decoration: BoxDecoration(color: const Color(0xFF22C55E), shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2.5),
          boxShadow: const [BoxShadow(color: Color(0x5022C55E), blurRadius: 6)]))),
    ]));

  // ── Name row ──────────────────────────────────────────────────────────────
  Widget _nameRow(StaffProfile p) => Container(
    color: Colors.white,
    padding: const EdgeInsets.fromLTRB(22, 48, 22, 14),
    child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(p.name, style: const TextStyle(fontFamily: 'Cabinet Grotesk',
          fontSize: 22, fontWeight: FontWeight.w900, color: _ink, letterSpacing: -.6)),
        const SizedBox(height: 3),
        Row(children: [
          Text(p.designation ?? fmtRole(p.role),
            style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13,
              fontWeight: FontWeight.w600, color: _ink3)),
          if (p.department != null) ...[
            const Text(' · ', style: TextStyle(color: _ink4)),
            Text(p.department!, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, color: _ink4)),
          ],
        ]),
        const SizedBox(height: 6),
        Row(children: [
          Container(width: 7, height: 7, decoration: const BoxDecoration(
            color: Color(0xFF22C55E), shape: BoxShape.circle)),
          const SizedBox(width: 5),
          const Text('Online', style: TextStyle(fontFamily: 'Satoshi',
            fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF16A34A))),
        ]),
      ])),
      Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(color: _tSoft,
          border: Border.all(color: _tBdr), borderRadius: BorderRadius.circular(100)),
        child: Text(fmtRole(p.role), style: const TextStyle(
          fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w800, color: _tA))),
    ]));

  // ── Stats bar ─────────────────────────────────────────────────────────────
  Widget _statsBar(StaffProfile p) => Container(
    color: Colors.white,
    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
    child: Container(
      decoration: BoxDecoration(color: _mist, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _line, width: 1.5)),
      child: IntrinsicHeight(child: Row(children: [
        _statCell(p.yearsService, 'Yrs Service'),
        const VerticalDivider(width: 1, color: _line),
        _statCell(fmtJoined(p.joiningDate), 'Joined'),
        const VerticalDivider(width: 1, color: _line),
        _statCell(p.subjects.isNotEmpty ? '${p.subjects.length}' : '—', 'Subjects'),
      ]))));

  Widget _statCell(String v, String l) => Expanded(child: Padding(
    padding: const EdgeInsets.symmetric(vertical: 12),
    child: Column(children: [
      Text(v, style: const TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 17,
        fontWeight: FontWeight.w900, color: _tA, letterSpacing: -.4)),
      const SizedBox(height: 2),
      Text(l, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9,
        fontWeight: FontWeight.w700, color: _ink4, letterSpacing: .4)),
    ])));

  // ── Tab bar ───────────────────────────────────────────────────────────────
  Widget _tabBar() => Container(
    color: Colors.white,
    child: TabBar(
      controller: _tc,
      labelColor: _tA,
      unselectedLabelColor: _ink4,
      labelStyle: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w800),
      unselectedLabelStyle: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w600),
      indicatorColor: _tA,
      indicatorWeight: 2.5,
      tabs: const [
        Tab(text: 'Overview'),
        Tab(text: 'Performance'),
        Tab(text: 'History'),
        Tab(text: 'Settings'),
      ]));

  // ═════════════════════════════════════════════════════════════════════════
  // TAB 1 — OVERVIEW
  // ═════════════════════════════════════════════════════════════════════════
  Widget _overviewTab(StaffProfile p) => ListView(
    padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
    children: [
      // Quick Actions
      _secHeader('⚡', 'Quick Actions'),
      Row(children: [
        _quickAction('📞', 'Call', _tSoft, _tA, () {}),
        const SizedBox(width: 8),
        _quickAction('✉️', 'Email', const Color(0xFFEFF6FF), const Color(0xFF3B82F6),
          () => _copy(p.email)),
        const SizedBox(width: 8),
        _quickAction('📅', 'Leave', const Color(0xFFF0FDF4), const Color(0xFF10B981),
          () => context.push('/leave')),
        const SizedBox(width: 8),
        _quickAction('🪪', 'ID Card', const Color(0xFFFDF4FF), const Color(0xFFA855F7), () {}),
      ]),

      // Personal Info
      _secHeader('👤', 'Personal Information'),
      _card([
        if (p.email.isNotEmpty) _ir('📧', '#FFF0EE', 'Email', p.email, copy: true),
        if (p.phone.isNotEmpty) _ir('📱', '#FFF0EE', 'Phone', p.phone, copy: true),
        if (p.gender != null) _ir('🧑', '#EFF6FF', 'Gender', cap(p.gender!)),
        if (p.dateOfBirth != null) _ir('🎂', '#FFF7ED', 'Date of Birth', fmtDate(p.dateOfBirth!)),
        if (p.bloodGroup != null) _ir('🩸', '#FEF2F2', 'Blood Group', p.bloodGroup!),
      ]),

      // Work & Contract
      _secHeader('🏢', 'Work & Contract'),
      _card([
        _ir('🏫', '#EFF6FF', 'School', p.schoolName),
        if (p.department != null) _ir('🏛', '#F0FDF4', 'Department', p.department!),
        if (p.designation != null) _ir('🎖', '#FFF0EE', 'Designation', p.designation!),
        if (p.employmentType != null) _ir('💼', '#FDF4FF', 'Employment', cap(p.employmentType!)),
        if (p.joiningDate != null) _ir('📅', '#FFF7ED', 'Joined', fmtDate(p.joiningDate!)),
      ]),

      // Subjects taught
      if (p.subjects.isNotEmpty) ...[
        _secHeader('📚', 'Subjects Taught'),
        Container(margin: const EdgeInsets.only(bottom: 4),
          child: Wrap(spacing: 8, runSpacing: 8,
            children: p.subjects.map((s) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(color: _tSoft, borderRadius: BorderRadius.circular(100),
                border: Border.all(color: _tBdr)),
              child: Text(s, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12,
                fontWeight: FontWeight.w700, color: _tA)))).toList())),
      ],

      // Address
      if (p.address != null || p.addressCity != null) ...[
        _secHeader('📍', 'Address'),
        _card([_ir('🗺', '#EFF6FF', 'Location',
          [p.address, p.addressCity, p.addressState]
            .where((e) => e != null && e.isNotEmpty).join(', '))]),
      ],

      // Emergency Contact
      if (p.emergencyName != null) ...[
        _secHeader('🚨', 'Emergency Contact'),
        _card([
          _ir('👤', '#FEF2F2', 'Name', '${p.emergencyName}'
            '${p.emergencyRelation != null ? ' (${p.emergencyRelation})' : ''}'),
          if (p.emergencyPhone != null)
            _ir('📞', '#FEF2F2', 'Phone', p.emergencyPhone!, copy: true),
        ]),
      ],

      // Module Permissions
      _secHeader('🔐', 'Module Access'),
      Container(padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _line, width: 1.5)),
        child: Wrap(spacing: 8, runSpacing: 8,
          children: _teacherPerms.map((perm) => Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(color: _tSoft, borderRadius: BorderRadius.circular(10),
              border: Border.all(color: _tBdr)),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Text(perm['ico']!, style: const TextStyle(fontSize: 13)),
              const SizedBox(width: 5),
              Text(perm['label']!, style: const TextStyle(fontFamily: 'Satoshi',
                fontSize: 10, fontWeight: FontWeight.w700, color: _tA)),
            ]))).toList())),
    ]);

  static const _teacherPerms = [
    {'ico': '✅', 'label': 'Attendance'},
    {'ico': '📝', 'label': 'Enter Marks'},
    {'ico': '📚', 'label': 'Homework'},
    {'ico': '📢', 'label': 'Circulars'},
    {'ico': '💬', 'label': 'Msg Parents'},
    {'ico': '📅', 'label': 'Apply Leave'},
    {'ico': '🗓', 'label': 'Timetable'},
    {'ico': '👤', 'label': 'Student Profiles'},
  ];

  // ═════════════════════════════════════════════════════════════════════════
  // TAB 2 — PERFORMANCE (mostly data-rich mock until API exists)
  // ═════════════════════════════════════════════════════════════════════════
  Widget _performanceTab(StaffProfile p) {
    final months = const ['Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
    final bars   = const [72, 78, 75, 82, 80, 88, 91];
    final maxB   = bars.reduce((a, b) => a > b ? a : b).toDouble();
    final skills = const [
      {'l': 'Subject Knowledge',    's': 95, 'c': 0xFF10B981},
      {'l': 'Classroom Management', 's': 88, 'c': 0xFF3B82F6},
      {'l': 'Student Engagement',   's': 91, 'c': 0xFFFF5733},
      {'l': 'Communication',        's': 86, 'c': 0xFFA855F7},
      {'l': 'Tech & Digital Tools', 's': 78, 'c': 0xFFF59E0B},
    ];
    return ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 100), children: [
      _secHeader('📈', 'Monthly Performance Score'),
      Container(padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _line, width: 1.5)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('91%', style: TextStyle(fontFamily: 'Cabinet Grotesk',
                fontSize: 36, fontWeight: FontWeight.w900, color: _tA)),
              const Text('March 2026 · ',
                style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink3)),
            ]),
            const Spacer(),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              const Text('Top 5% Staff', style: TextStyle(fontFamily: 'Satoshi',
                fontSize: 11, fontWeight: FontWeight.w800, color: _ink)),
              const SizedBox(height: 4),
              Row(children: List.generate(5, (i) => Icon(Icons.star_rounded,
                size: 13, color: i < 5 ? const Color(0xFFF59E0B) : _ink4))),
            ]),
          ]),
          const SizedBox(height: 14),
          SizedBox(height: 60, child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(bars.length, (i) {
              final h = (bars[i] / maxB * 48).roundToDouble();
              return Expanded(child: Column(mainAxisAlignment: MainAxisAlignment.end, children: [
                if (i == 6) Text('${bars[i]}%',
                  style: const TextStyle(fontSize: 7, fontWeight: FontWeight.w800, color: _tA)),
                Container(height: h, margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                    gradient: i == 6 ? const LinearGradient(
                      colors: [Color(0xFFFF5733), Color(0xFFFF006E)],
                      begin: Alignment.bottomCenter, end: Alignment.topCenter)
                      : null,
                    color: i == 6 ? null : const Color(0xFFFFD9D0))),
              ]));
            }))),
          const SizedBox(height: 4),
          Row(children: List.generate(months.length, (i) => Expanded(
            child: Text(months[i], textAlign: TextAlign.center,
              style: TextStyle(fontSize: 7.5, fontWeight: i == 6 ? FontWeight.w800 : FontWeight.w500,
                color: i == 6 ? _tA : _ink4))))),
        ])),

      _secHeader('🎯', 'Skills & Competency'),
      Container(padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _line, width: 1.5)),
        child: Column(children: skills.map((s) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text(s['l'] as String,
                style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w700, color: _ink))),
              Text('${s['s']}%', style: TextStyle(fontFamily: 'Satoshi',
                fontSize: 11, fontWeight: FontWeight.w900, color: Color(s['c'] as int))),
            ]),
            const SizedBox(height: 6),
            ClipRRect(borderRadius: BorderRadius.circular(100),
              child: LinearProgressIndicator(
                value: (s['s'] as int) / 100,
                backgroundColor: _mist,
                valueColor: AlwaysStoppedAnimation<Color>(Color(s['c'] as int)),
                minHeight: 7)),
          ]))).toList())),

      _secHeader('🏅', 'Achievements & Awards'),
      _card(const [
        _AchRow(ico: '🏆', bg: Color(0xFFFFFBEB), title: 'Best Teacher Award', sub: 'Academic Year 2024–25', dot: Color(0xFFF59E0B)),
        _AchRow(ico: '⭐', bg: Color(0xFFFFF0EE), title: '4.8★ Rating', sub: 'Avg across 42 students', dot: Color(0xFFFF5733)),
        _AchRow(ico: '📚', bg: Color(0xFFEFF6FF), title: '200+ Homeworks', sub: 'Assigned this year', dot: Color(0xFF3B82F6)),
        _AchRow(ico: '🎯', bg: Color(0xFFF0FDF4), title: '96% Attendance', sub: 'Top 10% staff', dot: Color(0xFF10B981)),
      ]),
    ]);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // TAB 3 — HISTORY
  // ═════════════════════════════════════════════════════════════════════════
  Widget _historyTab(StaffProfile p) {
    final timeline = [
      {'y': 'Jun 2017', 'title': 'Joined School', 'sub': 'Mathematics Teacher · Grade 6–8', 'cur': false, 'c': 0xFFFF5733},
      {'y': 'Apr 2019', 'title': 'Promoted — Class Teacher', 'sub': 'Grade 8-A · Additional HOD duties', 'cur': false, 'c': 0xFF3B82F6},
      {'y': 'Jan 2021', 'title': 'HOD Mathematics (Interim)', 'sub': '6-month deputation cover', 'cur': false, 'c': 0xFFA855F7},
      {'y': 'Now',      'title': 'Senior ${fmtRole(p.role)}', 'sub': '${p.yearsService} yrs service', 'cur': true, 'c': 0xFFFF5733},
    ];
    return ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 100), children: [
      _secHeader('🗓', 'Career Timeline'),
      Container(padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _line, width: 1.5)),
        child: Column(children: List.generate(timeline.length, (i) {
          final e = timeline[i];
          final isCur = e['cur'] as bool;
          final col = Color(e['c'] as int);
          return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            SizedBox(width: 36, child: Column(children: [
              Container(width: isCur ? 14 : 10, height: isCur ? 14 : 10,
                decoration: BoxDecoration(shape: BoxShape.circle, color: col,
                  boxShadow: isCur ? [BoxShadow(color: col.withOpacity(.3), blurRadius: 8)] : null)),
              if (i < timeline.length - 1) Container(width: 2, height: 36,
                margin: const EdgeInsets.symmetric(vertical: 4),
                decoration: BoxDecoration(
                  gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter,
                    colors: [col.withOpacity(.4), _line]))),
            ])),
            Expanded(child: Padding(padding: const EdgeInsets.only(bottom: 14), child: Column(
              crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(e['y'] as String, style: TextStyle(fontFamily: 'Satoshi',
                fontSize: 8, fontWeight: FontWeight.w700, color: isCur ? col : _ink4,
                letterSpacing: .5, textBaseline: TextBaseline.alphabetic)),
              Text(e['title'] as String, style: TextStyle(fontFamily: 'Satoshi',
                fontSize: 12, fontWeight: isCur ? FontWeight.w900 : FontWeight.w700, color: _ink)),
              Text(e['sub'] as String, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink3)),
              if (isCur) Container(margin: const EdgeInsets.only(top: 4),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: _tSoft, borderRadius: BorderRadius.circular(100)),
                child: const Text('● Current', style: TextStyle(fontFamily: 'Satoshi',
                  fontSize: 8, fontWeight: FontWeight.w800, color: _tA))),
            ]))),
          ]);
        }))),

      _secHeader('🕐', 'Recent Activity'),
      _card(const [
        _ActRow(ico: '✅', bg: Color(0xFFD1FAE5), action: 'Marked Attendance', detail: 'Grade 9-A · Present/Absent updated', time: 'Today'),
        _ActRow(ico: '📚', bg: Color(0xFFDBEAFE), action: 'Assigned Homework', detail: 'Grade 8-A · Algebra exercise', time: 'Today'),
        _ActRow(ico: '📝', bg: Color(0xFFEDE9FE), action: 'Entered Marks', detail: 'Mid-term scores updated', time: 'Yesterday'),
        _ActRow(ico: '💬', bg: Color(0xFFFFF7ED), action: 'Parent Message', detail: 'Replied to parent query', time: 'Yesterday'),
      ]),

      _secHeader('📄', 'Documents'),
      _card([
        _lr(Icons.description_outlined, const Color(0xFF3B82F6), const Color(0xFFEFF6FF),
          'Employment Contract', 'Signed · Valid till Dec 2027', () {}),
        _lr(Icons.school_outlined, const Color(0xFF10B981), const Color(0xFFF0FDF4),
          'Qualification Certificates', 'Degree & teaching credentials', () {}),
        _lr(Icons.badge_outlined, const Color(0xFFF59E0B), const Color(0xFFFFF7ED),
          'Staff ID Card', 'QR-enabled digital ID', () {}),
        _lr(Icons.receipt_long_rounded, const Color(0xFFA855F7), const Color(0xFFFDF4FF),
          'Salary Slips', 'View monthly payslips', () {}),
      ]),
    ]);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // TAB 4 — SETTINGS
  // ═════════════════════════════════════════════════════════════════════════
  Widget _settingsTab(StaffProfile p) => ListView(
    padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
    children: [
      // Payslip summary (mock)
      _secHeader('💰', 'Payslip — Latest'),
      Container(padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _line, width: 1.5)),
        child: Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('GROSS SALARY', style: TextStyle(fontFamily: 'Satoshi', fontSize: 9,
              fontWeight: FontWeight.w700, color: _ink3, letterSpacing: .4)),
            const Text('₹52,000', style: TextStyle(fontFamily: 'Cabinet Grotesk',
              fontSize: 22, fontWeight: FontWeight.w900, color: _ink)),
          ])),
          Container(width: 1, height: 40, color: _line),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('NET TAKE-HOME', style: TextStyle(fontFamily: 'Satoshi', fontSize: 9,
              fontWeight: FontWeight.w700, color: _ink3, letterSpacing: .4)),
            const Text('₹44,850', style: TextStyle(fontFamily: 'Cabinet Grotesk',
              fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF10B981))),
          ])),
        ])),

      _secHeader('🔔', 'Notifications'),
      _toggleCard([
        _tog('🔔', const Color(0xFFFFF7ED), 'Push Notifications', 'Attendance, marks & messages',
          _notifs, (v) => setState(() => _notifs = v)),
        _tog('🔊', const Color(0xFFF0FDF4), 'Sound & Vibration', 'Play sounds for alerts',
          _sound, (v) => setState(() => _sound = v)),
      ]),

      _secHeader('🔒', 'Security & Privacy'),
      _toggleCard([
        _tog('🔒', const Color(0xFFEFF6FF), 'Biometric Lock', 'Fingerprint / Face ID login',
          _biometric, (v) => setState(() => _biometric = v)),
        _tog('🌙', const Color(0xFF1E293B), 'Dark Mode', 'Switch to dark theme',
          _dark, (v) => setState(() => _dark = v)),
      ]),
      _card([
        _lr(Icons.language_rounded, const Color(0xFF10B981), const Color(0xFFF0FDF4),
          'Language', 'English (India)', () {}),
        _lr(Icons.lock_outline_rounded, const Color(0xFF3B82F6), const Color(0xFFEFF6FF),
          'Change Password', 'Keep your account secure', () {}),
        _lr(Icons.phone_android_rounded, const Color(0xFFA855F7), const Color(0xFFFDF4FF),
          'Active Sessions', '1 session active', () {}),
      ]),

      _secHeader('🔗', 'Quick Links'),
      _card([
        _lr(Icons.calendar_month_outlined, const Color(0xFFF59E0B), const Color(0xFFFFF7ED),
          'Leave History', 'Applied, approved & rejected', () => context.push('/leave')),
        _lr(Icons.help_outline_rounded, const Color(0xFF0891B2), const Color(0xFFECFEFF),
          'Help & Support', 'FAQs · Raise a ticket', () {}),
        _lr(Icons.info_outline_rounded, const Color(0xFF6B7280), const Color(0xFFF9FAFB),
          'About App', 'EduSphere Staff · v2.0.0', () {}),
      ]),

      const SizedBox(height: 16),
      GestureDetector(
        onTap: _logout,
        child: Container(height: 52, alignment: Alignment.center,
          decoration: BoxDecoration(color: const Color(0xFFFEF2F2),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0x40EF4444), width: 1.5)),
          child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.logout_rounded, color: Color(0xFFDC2626), size: 18),
            SizedBox(width: 8),
            Text('Sign Out', style: TextStyle(fontFamily: 'Satoshi', fontSize: 14,
              fontWeight: FontWeight.w800, color: Color(0xFFDC2626))),
          ]))),
      const SizedBox(height: 14),
      const Center(child: Text('EduSphere Staff App · v2.0.0',
        style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink4))),
    ]);

  // ─────────────────────────────────────────────────────────────────────────
  // Shared atoms
  // ─────────────────────────────────────────────────────────────────────────

  Widget _secHeader(String emoji, String title) => Padding(
    padding: const EdgeInsets.fromLTRB(0, 18, 0, 8),
    child: Row(children: [
      Text(emoji, style: const TextStyle(fontSize: 15)),
      const SizedBox(width: 8),
      Text(title, style: const TextStyle(fontFamily: 'Cabinet Grotesk',
        fontSize: 11, fontWeight: FontWeight.w900, color: _ink)),
      const SizedBox(width: 8),
      Expanded(child: Container(height: 1, color: _line)),
    ]));

  Widget _card(List<Widget> rows) {
    if (rows.isEmpty) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _line, width: 1.5)),
      child: Column(children: rows));
  }

  // Info row with emoji icon bg
  Widget _ir(String emoji, String bg, String label, String value, {bool copy = false}) =>
    Container(padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: _line))),
      child: Row(children: [
        Container(width: 34, height: 34, alignment: Alignment.center,
          decoration: BoxDecoration(
            color: Color(int.parse(bg.replaceFirst('#', '0xFF'))),
            borderRadius: BorderRadius.circular(11)),
          child: Text(emoji, style: const TextStyle(fontSize: 15))),
        const SizedBox(width: 11),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9,
            fontWeight: FontWeight.w700, color: _ink3, letterSpacing: .4)),
          const SizedBox(height: 2),
          Text(value.isEmpty ? '—' : value, style: const TextStyle(fontFamily: 'Satoshi',
            fontSize: 12, fontWeight: FontWeight.w700, color: _ink),
            overflow: TextOverflow.ellipsis),
        ])),
        if (copy) GestureDetector(
          onTap: () => _copy(value),
          child: Container(width: 26, height: 26, alignment: Alignment.center,
            decoration: BoxDecoration(color: _mist, borderRadius: BorderRadius.circular(8)),
            child: const Icon(Icons.copy_rounded, size: 12, color: _ink3))),
      ]));

  // Link row
  Widget _lr(IconData icon, Color fg, Color bg, String title, String sub, VoidCallback onTap) =>
    GestureDetector(onTap: onTap,
      child: Container(padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: _line))),
        child: Row(children: [
          Container(width: 34, height: 34, alignment: Alignment.center,
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(11)),
            child: Icon(icon, size: 17, color: fg)),
          const SizedBox(width: 11),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12,
              fontWeight: FontWeight.w700, color: _ink)),
            Text(sub, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink4)),
          ])),
          const Icon(Icons.chevron_right_rounded, size: 16, color: _ink4),
        ])));

  Widget _quickAction(String emoji, String label, Color bg, Color fg, VoidCallback onTap) =>
    Expanded(child: GestureDetector(onTap: onTap, child: Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _line, width: 1.5)),
      child: Column(children: [
        Container(width: 36, height: 36, alignment: Alignment.center,
          decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
          child: Text(emoji, style: const TextStyle(fontSize: 16))),
        const SizedBox(height: 6),
        Text(label, style: TextStyle(fontFamily: 'Satoshi', fontSize: 9,
          fontWeight: FontWeight.w700, color: fg)),
      ]))));

  Widget _toggleCard(List<Widget> rows) => Container(
    margin: const EdgeInsets.only(bottom: 4),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16),
      border: Border.all(color: _line, width: 1.5)),
    child: Column(children: rows));

  Widget _tog(String emoji, Color emojiBg, String title, String sub,
      bool val, Function(bool) onChange) =>
    GestureDetector(
      onTap: () { HapticFeedback.selectionClick(); onChange(!val); },
      child: Container(
        padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: _line))),
        child: Row(children: [
          Container(width: 34, height: 34, alignment: Alignment.center,
            decoration: BoxDecoration(color: emojiBg.withOpacity(.15),
              borderRadius: BorderRadius.circular(11)),
            child: Text(emoji, style: const TextStyle(fontSize: 15))),
          const SizedBox(width: 11),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12,
              fontWeight: FontWeight.w700, color: _ink)),
            Text(sub, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink4)),
          ])),
          AnimatedContainer(
            duration: const Duration(milliseconds: 220),
            width: 40, height: 22, padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: val ? _tA : const Color(0xFFE5E7EB),
              borderRadius: BorderRadius.circular(100)),
            child: AnimatedAlign(
              duration: const Duration(milliseconds: 220),
              curve: Curves.elasticOut,
              alignment: val ? Alignment.centerRight : Alignment.centerLeft,
              child: Container(width: 16, height: 16,
                decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: Color(0x22000000), blurRadius: 3)]))),
          ),
        ])));
}

// ─── Static row widgets ───────────────────────────────────────────────────────
class _AchRow extends StatelessWidget {
  final String ico, title, sub;
  final Color bg, dot;
  const _AchRow({required this.ico, required this.bg, required this.title,
    required this.sub, required this.dot});
  @override Widget build(BuildContext context) =>
    Container(padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: _line))),
      child: Row(children: [
        Container(width: 38, height: 38, alignment: Alignment.center,
          decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
          child: Text(ico, style: const TextStyle(fontSize: 18))),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12,
            fontWeight: FontWeight.w800, color: _ink)),
          Text(sub, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink3)),
        ])),
        Container(width: 8, height: 8, decoration: BoxDecoration(color: dot, shape: BoxShape.circle)),
      ]));
}

class _ActRow extends StatelessWidget {
  final String ico, action, detail, time;
  final Color bg;
  const _ActRow({required this.ico, required this.bg, required this.action,
    required this.detail, required this.time});
  @override Widget build(BuildContext context) =>
    Container(padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: _line))),
      child: Row(children: [
        Container(width: 34, height: 34, alignment: Alignment.center,
          decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(11)),
          child: Text(ico, style: const TextStyle(fontSize: 14))),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(action, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11,
            fontWeight: FontWeight.w700, color: _ink)),
          Text(detail, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, color: _ink3),
            overflow: TextOverflow.ellipsis),
        ])),
        Text(time, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 8,
          color: _ink4, fontWeight: FontWeight.w600)),
      ]));
}
