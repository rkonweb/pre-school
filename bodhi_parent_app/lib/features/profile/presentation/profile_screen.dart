import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/app_theme.dart';
import '../../dashboard/data/dashboard_provider.dart';

// ─── Provider ─────────────────────────────────────────────────────────────────
final childProfileProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, studentId) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get('parent/child', queryParameters: {'studentId': studentId});
  if (res.data['success'] == true) return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  throw Exception(res.data['error'] ?? 'Failed to load profile');
});

// ─── Screen ──────────────────────────────────────────────────────────────────
class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});
  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> with SingleTickerProviderStateMixin {
  late TabController _tabs;
  int _activeTab = 0;

  static const _tabLabels = ['📋 Overview', '📊 Academic', '🏥 Medical', '📞 Contacts', '📁 Documents'];

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: _tabLabels.length, vsync: this);
    _tabs.addListener(() => setState(() => _activeTab = _tabs.index));
  }

  @override
  void dispose() { _tabs.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final dashAsync = ref.watch(dashboardDataProvider);
    final students = dashAsync.maybeWhen(data: (d) => d['students'] as List?, orElse: () => null);
    final activeStudent = students?.isNotEmpty == true ? students![0] as Map<String, dynamic> : null;
    final studentId = activeStudent?['id'] as String?;
    final school = dashAsync.maybeWhen(data: (d) => d['school'] as Map<String, dynamic>?, orElse: () => null);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          // ── HERO (includes SafeArea for top) ──
          _buildHero(activeStudent, school),
          // ── QUICK STATS ──
          _buildQuickStats(),
          // ── STICKY TAB BAR ──
          _buildTabBar(),
          // ── SCROLLABLE CONTENT ──
          Expanded(
            child: studentId != null
                ? ref.watch(childProfileProvider(studentId)).when(
                    data: (data) => SingleChildScrollView(
                      child: _buildTabContent(data, activeStudent, school),
                    ),
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (e, _) => _buildErrorState(e.toString(), studentId),
                  )
                : dashAsync.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : const Center(child: Text('No student data available')),
          ),
        ],
      ),
    );
  }

  Widget _buildHero(Map<String, dynamic>? student, Map<String, dynamic>? school) {
    final name = student != null ? '${student['firstName'] ?? ''} ${student['lastName'] ?? ''}'.trim() : 'Loading…';
    final initials = name.split(' ').where((s) => s.isNotEmpty).map((s) => s[0]).take(2).join('').toUpperCase();
    final classroom = (student?['classroom'] as String?) ?? 'Class';
    final schoolName = (school?['name'] as String?) ?? 'School';
    final avatarUrl = student?['avatar'] as String?;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1A2A6C), Color(0xFF2350DD), Color(0xFF00C9A7)],
        ),
      ),
      child: Stack(
        children: [
          // Orbs
          Positioned(top: 40, left: -30, child: Container(width: 120, height: 120, decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withOpacity(0.06)))),
          Positioned(bottom: 20, right: -20, child: Container(width: 90, height: 90, decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withOpacity(0.05)))),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Column(
                children: [
                  // Top bar
                  Row(
                    children: [
                      ElevatedButton(
                        onPressed: () => context.pop(),
                        style: AppTheme.headerButtonStyle(
                          backgroundColor: Colors.white.withOpacity(0.15),
                          iconColor: Colors.white,
                          size: 36,
                        ),
                        child: const Icon(Icons.chevron_left_rounded, size: 20),
                      ),
                      const Spacer(),
                      Text('Student Profile', style: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17)),
                      const Spacer(),
                      ElevatedButton(
                        onPressed: () {},
                        style: AppTheme.headerButtonStyle(
                          backgroundColor: Colors.white.withOpacity(0.15),
                          iconColor: Colors.white,
                          size: 36,
                        ),
                        child: const Icon(Icons.search_rounded, size: 18),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  // Avatar
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      // Halo pulse rings
                      Container(width: 88, height: 88, decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: Colors.white.withOpacity(0.2), width: 3))),
                      Container(width: 76, height: 76, decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: Colors.white.withOpacity(0.35), width: 2))),
                      // Avatar circle
                      Container(
                        width: 68, height: 68,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(colors: [Color(0xFF667eea), Color(0xFF764ba2)]),
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                        child: avatarUrl != null
                            ? ClipOval(child: Image.network(avatarUrl, fit: BoxFit.cover))
                            : Center(child: Text(initials, style: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 22))),
                      ),
                      // Verified badge
                      Positioned(
                        right: 0, bottom: 0,
                        child: Container(
                          width: 22, height: 22,
                          decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF00C9A7)),
                          child: const Icon(Icons.check, color: Colors.white, size: 12),
                        ),
                      ),
                      // Camera button
                      Positioned(
                        right: -2, top: -2,
                        child: Container(
                          width: 22, height: 22,
                          decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withOpacity(0.9)),
                          child: const Icon(Icons.camera_alt_rounded, size: 11, color: Color(0xFF2350DD)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(name, style: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20)),
                  const SizedBox(height: 2),
                  Text(schoolName, style: GoogleFonts.dmSans(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 10),
                  // Pills
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 6, runSpacing: 6,
                    children: [
                      _heroPill('🎓 $classroom', Colors.white.withOpacity(0.15), Colors.white),
                      _heroPill('🔥 Phoenix House', const Color(0xFFF5A623).withOpacity(0.9), Colors.white),
                      _heroPill('Enrolled · 2024–25', Colors.white.withOpacity(0.1), const Color(0xFF00C9A7)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  // Trait tags
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: ['🎨 Creative', '🤝 Leader', '📚 Curious', '🌟 Top 3'].map((t) => Container(
                      margin: const EdgeInsets.only(right: 6),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.12), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withOpacity(0.2))),
                      child: Text(t, style: GoogleFonts.dmSans(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600)),
                    )).toList(),
                  ),
                  const SizedBox(height: 16),
                  // Wave
                  ClipPath(
                    clipper: _WaveClipper(),
                    child: Container(height: 26, color: const Color(0xFFF8FAFC)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _heroPill(String text, Color bg, Color fg) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
    child: Text(text, style: GoogleFonts.dmSans(color: fg, fontSize: 11, fontWeight: FontWeight.w600)),
  );

  Widget _buildQuickStats() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          _qStat('94%', 'Attend.', const Color(0xFF00C9A7)),
          _qDivider(),
          _qStat('B+', 'Grade', const Color(0xFF3B6EF8)),
          _qDivider(),
          _qStat('12', 'Awards', const Color(0xFFF5A623)),
          _qDivider(),
          _qStat('3rd', 'Rank', const Color(0xFF8B5CF6)),
        ],
      ),
    );
  }

  Widget _qStat(String val, String lbl, Color color) => Expanded(child: Column(children: [
    Text(val, style: GoogleFonts.sora(color: color, fontWeight: FontWeight.bold, fontSize: 18)),
    const SizedBox(height: 2),
    Text(lbl, style: GoogleFonts.dmSans(color: const Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.w500)),
  ]));

  Widget _qDivider() => Container(width: 1, height: 30, color: const Color(0xFFE2E8F0));

  Widget _buildTabBar() {
    return Container(
      color: Colors.white,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
        child: Row(
          children: List.generate(_tabLabels.length, (i) {
            final sel = _activeTab == i;
            return GestureDetector(
              onTap: () { _tabs.animateTo(i); setState(() => _activeTab = i); },
              child: Container(
                margin: const EdgeInsets.only(right: 6),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: sel ? const Color(0xFF2350DD) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(_tabLabels[i], style: GoogleFonts.dmSans(
                  color: sel ? Colors.white : const Color(0xFF64748B),
                  fontWeight: FontWeight.w600, fontSize: 12,
                )),
              ),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildTabContent(Map<String, dynamic> data, Map<String, dynamic>? student, Map<String, dynamic>? school) {
    final s = data['student'] as Map<String, dynamic>? ?? student ?? {};
    switch (_activeTab) {
      case 0: return _buildOverviewTab(s, school);
      case 1: return _buildAcademicTab(s);
      case 2: return _buildMedicalTab(s);
      case 3: return _buildContactsTab(s);
      case 4: return _buildDocumentsTab();
      default: return _buildOverviewTab(s, school);
    }
  }

  // ── OVERVIEW TAB ──────────────────────────────────────────────────────────
  Widget _buildOverviewTab(Map<String, dynamic> s, Map<String, dynamic>? school) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Upcoming Dates
        _sectionHeader('📅 Upcoming Dates', null, const Color(0xFFF5A623), const Color(0xFFFFFBEB)),
        const SizedBox(height: 10),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(children: [
            _dateCard('14', 'Mar', "Emma's Birthday 🎂", 'Personal', const Color(0xFF3B6EF8), const Color(0xFFEEF3FF)),
            _dateCard('21', 'Nov', 'Science Quiz', 'Exam', const Color(0xFFF5A623), const Color(0xFFFFFBEB)),
            _dateCard('28', 'Nov', 'Annual Day Show', 'Event', const Color(0xFF8B5CF6), const Color(0xFFF5F0FF)),
            _dateCard('05', 'Dec', 'PT Meeting', 'Meeting', const Color(0xFF00C9A7), const Color(0xFFF0FDF9)),
          ]),
        ),
        const SizedBox(height: 20),

        // Admission Details
        _sectionHeader('📄 Admission Details', 'Edit', const Color(0xFF3B6EF8), const Color(0xFFEEF3FF)),
        const SizedBox(height: 10),
        _infoCard([
          _infoRow('🗓', 'Admission Number', s['admissionNumber'] ?? 'DPS-2019-08247', 'Active', const Color(0xFF00C9A7), const Color(0xFFF0FDF9)),
          _infoRow('⏰', 'Date of Admission', _formatDate(s['joiningDate']), null, null, const Color(0xFFF0FDF9)),
          _infoRow('🏫', 'School & Affiliation', school?['name'] ?? 'School', null, null, const Color(0xFFFFFBEB)),
          _infoRow('🛡', 'Academic Year & Board', 'CBSE · Session 2024–25', null, null, const Color(0xFFF5F0FF)),
        ]),
        const SizedBox(height: 16),

        // Personal Details
        _sectionHeader('👤 Personal Details', 'Edit', const Color(0xFF8B5CF6), const Color(0xFFF5F0FF)),
        const SizedBox(height: 10),
        _infoCard([
          _infoRow('📅', 'Date of Birth', _formatDate(s['dateOfBirth']), null, null, const Color(0xFFF0FDF9)),
          _infoRow('🩸', 'Blood Group', s['bloodGroup'] ?? '-', null, null, const Color(0xFFEEF3FF)),
          _infoRow('⚧', 'Gender', s['gender'] ?? '-', null, null, const Color(0xFFF5F0FF)),
          _infoRow('🏡', 'Home Address', s['address'] ?? '42 Sunrise Avenue, New Delhi', null, null, const Color(0xFFF0FDF9)),
        ]),
        const SizedBox(height: 16),

        // Class & Section
        _sectionHeader('📚 Class & Section', null, const Color(0xFF00C9A7), const Color(0xFFF0FDF9)),
        const SizedBox(height: 10),
        _infoCard([
          _infoRow('⭐', 'Class · Section · Roll No.', s['classroom'] ?? 'Grade 8 · Section B · Roll 24', null, null, const Color(0xFFEEF3FF)),
          _infoRow('🔥', 'House / Group', 'Phoenix House', 'Fire Element', const Color(0xFFef4444), const Color(0xFFfee2e2)),
          _infoRow('👩‍🏫', 'Class Teacher', 'Mrs. Ritu Sharma', null, null, const Color(0xFFF5F0FF)),
        ]),
        const SizedBox(height: 16),

        // Learning Profile
        _sectionHeader('🧠 Learning Profile', null, const Color(0xFF3B6EF8), const Color(0xFFEEF3FF)),
        const SizedBox(height: 10),
        Row(children: [
          _learnChip('👁️', 'Visual', 'Primary style'),
          const SizedBox(width: 8),
          _learnChip('🤲', 'Kinesthetic', 'Secondary'),
          const SizedBox(width: 8),
          _learnChip('🧠', 'Analytical', 'Problem solver'),
        ]),
        const SizedBox(height: 10),
        _infoCard([
          _tagsRow('✅', 'Strengths', ['Science', 'Visual Arts', 'Leadership'], const Color(0xFF22c55e), const Color(0xFFf0fdf4)),
          _tagsRow('💡', 'Areas for Growth', ['Grammar', 'Time Mgmt', 'Hindi Writing'], const Color(0xFFF5A623), const Color(0xFFFFFBEB)),
          _tagsRow('✏️', 'Personality Tags', ['Empathetic', 'Team Player', 'Tech-Savvy'], const Color(0xFF8B5CF6), const Color(0xFFF5F0FF)),
        ]),
        const SizedBox(height: 16),

        // Extracurriculars
        _sectionHeader('🌟 Extracurricular Activities', '+ Add', const Color(0xFFF5A623), const Color(0xFFFFFBEB)),
        const SizedBox(height: 10),
        _extraCard('🎨', 'Art & Craft Club', 'Every Tue & Thu · Mrs. Lata Gupta · 2 yrs', 'Advanced', const Color(0xFF00C9A7), const Color(0xFFF0FDF9)),
        const SizedBox(height: 8),
        _extraCard('🔬', 'STEM Science Club', 'Every Monday · Mr. Anand Sharma · 1 yr', 'Active', const Color(0xFF3B6EF8), const Color(0xFFEEF3FF)),
        const SizedBox(height: 8),
        _extraCard('🏸', 'Badminton (School Team)', 'Wed & Fri · Coach Ramesh · District Level', 'District', const Color(0xFFF5A623), const Color(0xFFFFFBEB)),
        const SizedBox(height: 8),
        _extraCard('🎤', 'Debate & Elocution', 'Alternate Saturdays · Inter-school rep', 'Inter-School', const Color(0xFF8B5CF6), const Color(0xFFF5F0FF)),
        const SizedBox(height: 16),

        // Transport mini
        _sectionHeader('🚌 Transport Assignment', null, const Color(0xFF00C9A7), const Color(0xFFF0FDF9)),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)]),
          child: Row(children: [
            Container(width: 40, height: 40, decoration: BoxDecoration(color: const Color(0xFFF0FDF9), borderRadius: BorderRadius.circular(12)), child: const Center(child: Text('🚌', style: TextStyle(fontSize: 18)))),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('School Bus #7 · South Colony Route', style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13, color: const Color(0xFF1E293B))),
              Text('Driver: Rajesh Kumar · Pick-up 7:30 AM · Drop ~3:50 PM', style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF64748B))),
            ])),
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(20)), child: Text('🟢 Live', style: GoogleFonts.dmSans(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF16A34A)))),
          ]),
        ),
        const SizedBox(height: 32),
      ]),
    );
  }

  // ── ACADEMIC TAB ──────────────────────────────────────────────────────────
  Widget _buildAcademicTab(Map<String, dynamic> s) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _sectionHeader('📊 Academic Performance', null, const Color(0xFF3B6EF8), const Color(0xFFEEF3FF)),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
          child: Column(children: [
            for (final subj in [
              {'name': 'Mathematics', 'grade': 'A+', 'score': '95/100', 'color': const Color(0xFF3B6EF8)},
              {'name': 'Science', 'grade': 'A+', 'score': '92/100', 'color': const Color(0xFF00C9A7)},
              {'name': 'English', 'grade': 'A', 'score': '88/100', 'color': const Color(0xFF8B5CF6)},
              {'name': 'Hindi', 'grade': 'B+', 'score': '82/100', 'color': const Color(0xFFF5A623)},
              {'name': 'Social Studies', 'grade': 'A', 'score': '90/100', 'color': const Color(0xFF00C9A7)},
            ]) ...[
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(children: [
                  Expanded(child: Text(subj['name'] as String, style: GoogleFonts.sora(fontWeight: FontWeight.w600, fontSize: 13))),
                  Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: (subj['color'] as Color).withOpacity(0.1), borderRadius: BorderRadius.circular(8)), child: Text(subj['grade'] as String, style: TextStyle(color: subj['color'] as Color, fontWeight: FontWeight.bold, fontSize: 12))),
                  const SizedBox(width: 8),
                  Text(subj['score'] as String, style: GoogleFonts.dmSans(color: const Color(0xFF64748B), fontSize: 12)),
                ]),
              ),
              if (subj != [
                {'name': 'Mathematics', 'grade': 'A+', 'score': '95/100', 'color': const Color(0xFF3B6EF8)},
              ].last) const Divider(height: 1, color: Color(0xFFF1F5F9)),
            ],
          ]),
        ),
        const SizedBox(height: 32),
      ]),
    );
  }

  // ── MEDICAL TAB ──────────────────────────────────────────────────────────
  Widget _buildMedicalTab(Map<String, dynamic> s) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _sectionHeader('🏥 Health & Medical', null, const Color(0xFFef4444), const Color(0xFFfee2e2)),
        const SizedBox(height: 12),
        _infoCard([
          _infoRow('🩸', 'Blood Group', s['bloodGroup'] ?? 'O+', null, null, const Color(0xFFfee2e2)),
          _infoRow('💊', 'Medical Conditions', s['medicalConditions'] ?? 'None reported', null, null, const Color(0xFFF0FDF9)),
          _infoRow('⚠️', 'Allergies', s['allergies'] ?? 'None reported', null, null, const Color(0xFFFFFBEB)),
          _infoRow('💉', 'Vaccinations', 'Up to date · COVID, Tdap, Flu', null, null, const Color(0xFFF5F0FF)),
        ]),
        const SizedBox(height: 32),
      ]),
    );
  }

  // ── CONTACTS TAB ──────────────────────────────────────────────────────────
  Widget _buildContactsTab(Map<String, dynamic> s) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _sectionHeader('📞 Emergency Contacts', null, const Color(0xFF3B6EF8), const Color(0xFFEEF3FF)),
        const SizedBox(height: 12),
        _contactCard2('👨', 'Father', s['fatherName'] ?? 'Not provided', s['fatherPhone'] ?? '-', const Color(0xFF3B6EF8)),
        const SizedBox(height: 8),
        _contactCard2('👩', 'Mother', s['motherName'] ?? 'Not provided', s['motherPhone'] ?? '-', const Color(0xFF8B5CF6)),
        if (s['emergencyContactName'] != null) ...[
          const SizedBox(height: 8),
          _contactCard2('🆘', 'Emergency', s['emergencyContactName'], s['emergencyContactPhone'] ?? '-', const Color(0xFFef4444)),
        ],
        const SizedBox(height: 32),
      ]),
    );
  }

  // ── DOCUMENTS TAB ──────────────────────────────────────────────────────────
  Widget _buildDocumentsTab() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _sectionHeader('📁 Documents', null, const Color(0xFF8B5CF6), const Color(0xFFF5F0FF)),
        const SizedBox(height: 12),
        for (final doc in [
          {'icon': '📜', 'name': 'Admission Letter', 'date': 'Apr 2019', 'color': const Color(0xFF3B6EF8)},
          {'icon': '🏫', 'name': 'School ID Card', 'date': '2024–25', 'color': const Color(0xFF00C9A7)},
          {'icon': '💉', 'name': 'Vaccination Certificate', 'date': 'Updated Jan 2024', 'color': const Color(0xFF8B5CF6)},
          {'icon': '📋', 'name': 'Transfer Certificate (prev school)', 'date': 'Mar 2019', 'color': const Color(0xFFF5A623)},
        ]) ...[
          Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: Row(children: [
              Container(width: 40, height: 40, decoration: BoxDecoration(color: (doc['color'] as Color).withOpacity(0.1), borderRadius: BorderRadius.circular(12)), child: Center(child: Text(doc['icon'] as String, style: const TextStyle(fontSize: 18)))),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(doc['name'] as String, style: GoogleFonts.sora(fontWeight: FontWeight.w600, fontSize: 13)),
                Text(doc['date'] as String, style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF94A3B8))),
              ])),
              const Icon(Icons.download_outlined, size: 18, color: Color(0xFF94A3B8)),
            ]),
          ),
        ],
        const SizedBox(height: 32),
      ]),
    );
  }

  // ── HELPERS ──────────────────────────────────────────────────────────────
  Widget _buildLoadingState() => const Padding(padding: EdgeInsets.all(60), child: Center(child: CircularProgressIndicator()));
  Widget _buildErrorState(String err, String sid) => Padding(
    padding: const EdgeInsets.all(40),
    child: Center(child: Column(children: [
      const Icon(Icons.error_outline, size: 48, color: Colors.red),
      const SizedBox(height: 12),
      Text(err, style: const TextStyle(color: Colors.grey), textAlign: TextAlign.center),
      const SizedBox(height: 12),
      ElevatedButton(onPressed: () => ref.refresh(childProfileProvider(sid)), child: const Text('Retry')),
    ])),
  );

  Widget _sectionHeader(String label, String? action, Color iconColor, Color iconBg) => Row(children: [
    Container(width: 28, height: 28, decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(8)), child: Center(child: Text(label.split(' ').first, style: const TextStyle(fontSize: 12)))),
    const SizedBox(width: 8),
    Text(label.split(' ').skip(1).join(' '), style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 14, color: const Color(0xFF1E293B))),
    const Spacer(),
    if (action != null) Text(action, style: GoogleFonts.dmSans(color: const Color(0xFF3B6EF8), fontSize: 12, fontWeight: FontWeight.w600)),
  ]);

  Widget _infoCard(List<Widget> rows) => Container(
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)]),
    child: Column(children: rows),
  );

  Widget _infoRow(String emoji, String label, String valueText, String? badge, Color? badgeColor, Color iconBg) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))),
    child: Row(children: [
      Container(width: 34, height: 34, decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(10)), child: Center(child: Text(emoji, style: const TextStyle(fontSize: 14)))),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
        const SizedBox(height: 2),
        Text(valueText, style: GoogleFonts.sora(fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFF1E293B))),
      ])),
      if (badge != null) Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(color: (badgeColor ?? const Color(0xFF00C9A7)).withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
        child: Text(badge, style: TextStyle(color: badgeColor ?? const Color(0xFF00C9A7), fontSize: 10, fontWeight: FontWeight.bold)),
      ),
    ]),
  );

  Widget _tagsRow(String emoji, String label, List<String> tags, Color tagColor, Color tagBg) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))),
    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(width: 34, height: 34, decoration: BoxDecoration(color: tagBg, borderRadius: BorderRadius.circular(10)), child: Center(child: Text(emoji, style: const TextStyle(fontSize: 14)))),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        Wrap(spacing: 4, runSpacing: 4, children: tags.map((t) => Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(color: tagBg, borderRadius: BorderRadius.circular(20), border: Border.all(color: tagColor.withOpacity(0.3))),
          child: Text(t, style: TextStyle(color: tagColor, fontSize: 10, fontWeight: FontWeight.w600)),
        )).toList()),
      ])),
    ]),
  );

  Widget _dateCard(String day, String month, String event, String type, Color color, Color bg) => Container(
    width: 90,
    margin: const EdgeInsets.only(right: 10),
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 6)]),
    child: Column(children: [
      Text(day, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 22)),
      Text(month, style: GoogleFonts.dmSans(color: const Color(0xFF94A3B8), fontSize: 11)),
      const SizedBox(height: 6),
      Text(event, style: GoogleFonts.dmSans(fontSize: 10, fontWeight: FontWeight.w600, color: const Color(0xFF1E293B)), textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis),
      const SizedBox(height: 6),
      Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)), child: Text(type, style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold))),
    ]),
  );

  Widget _learnChip(String emoji, String label, String sub) => Expanded(child: Container(
    padding: const EdgeInsets.all(10),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
    child: Column(children: [
      Text(emoji, style: const TextStyle(fontSize: 20)),
      const SizedBox(height: 4),
      Text(label, style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 11)),
      Text(sub, style: GoogleFonts.dmSans(fontSize: 9, color: const Color(0xFF94A3B8))),
    ]),
  ));

  Widget _extraCard(String emoji, String name, String sub, String level, Color color, Color bg) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFE2E8F0))),
    child: Row(children: [
      Container(width: 40, height: 40, decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)), child: Center(child: Text(emoji, style: const TextStyle(fontSize: 18)))),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(name, style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13)),
        Text(sub, style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF64748B))),
      ])),
      Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)), child: Text(level, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold))),
    ]),
  );

  Widget _contactCard2(String emoji, String role, String name, String phone, Color color) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFE2E8F0))),
    child: Row(children: [
      Container(width: 44, height: 44, decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)), child: Center(child: Text(emoji, style: const TextStyle(fontSize: 20)))),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(role, style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
        Text(name, style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 14)),
        Text(phone, style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF64748B))),
      ])),
      Container(width: 36, height: 36, decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)), child: Icon(Icons.call_rounded, color: color, size: 18)),
    ]),
  );

  String _formatDate(dynamic raw) {
    if (raw == null) return '-';
    try { final dt = DateTime.parse(raw.toString()); return '${dt.day}/${dt.month}/${dt.year}'; } catch (_) { return raw.toString(); }
  }
}

// ── Wave Clipper ──────────────────────────────────────────────────────────────
class _WaveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.moveTo(0, size.height);
    path.quadraticBezierTo(size.width * 0.25, 0, size.width * 0.5, size.height * 0.7);
    path.quadraticBezierTo(size.width * 0.75, size.height * 1.4, size.width, size.height * 0.4);
    path.lineTo(size.width, size.height);
    path.close();
    return path;
  }
  @override
  bool shouldReclip(_) => false;
}


