import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';

// ─── Hostel Screen ────────────────────────────────────────────────────────────
class HostelScreen extends ConsumerStatefulWidget {
  const HostelScreen({super.key});
  @override
  ConsumerState<HostelScreen> createState() => _HostelScreenState();
}

class _HostelScreenState extends ConsumerState<HostelScreen> with SingleTickerProviderStateMixin {
  int _activeTab = 0;
  static const _tabs = ['📍 Overview', '🚪 Gate Log', '🍽 Meals', '🏃 Activities', '📋 Leave'];

  // ── Mock Data (to be replaced with real API) ──
  static const _studentName = 'Emma Johnson';
  static const _studentInitials = 'EJ';
  static const _studentClass = 'Grade 8B · Roll No. 042 · Batch 2026';
  static const _roomLabel = 'Room A-204 · Block A · Floor 2';
  static const _schoolLabel = 'City School Boarding · Block A · Nov 20';

  static final _movementLog = [
    {'dot': const Color(0xFF4ade80), 'time': '6:30 AM', 'event': 'Wake-up roll call ✓', 'status': 'Present', 'upcoming': false},
    {'dot': const Color(0xFF4ade80), 'time': '7:00 AM', 'event': 'Breakfast in mess hall', 'status': 'Eaten ✓', 'upcoming': false},
    {'dot': const Color(0xFF4ade80), 'time': '7:12 AM', 'event': 'Gate check-out → School', 'status': '🚶 Out', 'upcoming': false},
    {'dot': const Color(0xFFfbbf24), 'time': '3:45 PM', 'event': 'Expected return to hostel', 'status': 'Awaiting', 'upcoming': true},
    {'dot': const Color(0xFF475569), 'time': '7:30 PM', 'event': 'Dinner in mess hall', 'status': 'Upcoming', 'upcoming': true},
    {'dot': const Color(0xFF475569), 'time': '9:30 PM', 'event': 'Study hour ends · Lights out', 'status': 'Upcoming', 'upcoming': true},
  ];

  static final _gateLog = [
    {'ico': '🚶', 'event': 'Hostel Gate — Check-Out', 'sub': 'Main Gate · RFID Card Tap · Guard: Mr. Patil', 'time': '7:12 AM', 'type': 'OUT', 'method': 'RFID ✓'},
    {'ico': '📚', 'event': 'Library — Check-In', 'sub': 'Block B Library · Break period · 35 min', 'time': '10:30 AM', 'type': 'IN', 'method': 'Biometric'},
    {'ico': '📚', 'event': 'Library — Check-Out', 'sub': 'Block B Library · Returned to class', 'time': '11:05 AM', 'type': 'OUT', 'method': 'Biometric'},
    {'ico': '🏥', 'event': 'Infirmary — Brief Visit', 'sub': 'Minor headache · Cleared by nurse · 12 min', 'time': '12:08 PM', 'type': 'IN', 'method': 'Manual'},
  ];

  static final _meals = [
    {'ico': '🌅', 'name': 'Breakfast', 'menu': 'Poha + Banana · Milk · Bread & Butter', 'time': '7:00 AM', 'status': 'eaten'},
    {'ico': '☀️', 'name': 'Mid-Morning Snack', 'menu': 'Fruit (Apple) · Biscuits · Juice', 'time': '10:15 AM', 'status': 'missed'},
    {'ico': '🍱', 'name': 'Lunch', 'menu': 'Dal Rice · Sabzi · Chapati (2) · Curd · Papad', 'time': '12:30 PM', 'status': 'eaten'},
    {'ico': '🌙', 'name': 'Dinner', 'menu': 'Rotis (3) · Paneer Curry · Salad · Rice · Sweet', 'time': '7:30 PM', 'status': 'upcoming'},
  ];

  static final _activities = [
    {'ico': '📚', 'name': 'Morning Study Hour', 'detail': 'Supervised self-study · Block A Study Hall · Warden present', 'time': '6:00–7:00 AM', 'status': 'present', 'color': const Color(0xFF3B6EF8)},
    {'ico': '⚽', 'name': 'Sports Day Practice', 'detail': '100m sprint · Long jump · Coach Menon · Ground A', 'time': '3:00–3:40 PM', 'status': 'upcoming', 'color': const Color(0xFF10b981)},
    {'ico': '🎨', 'name': 'Art Club — Weekly Session', 'detail': 'Watercolour painting · Ms. Joshi · Art Room 102', 'time': '4:00–5:00 PM', 'status': 'upcoming', 'color': const Color(0xFF8B5CF6)},
    {'ico': '📖', 'name': 'Evening Study Hour', 'detail': 'Compulsory prep time · Revision for tests · Warden supervised', 'time': '6:30–8:30 PM', 'status': 'upcoming', 'color': const Color(0xFFF5A623)},
  ];

  static const _roommates = [
    {'initials': 'EJ', 'name': 'Emma Johnson', 'status': 'In School', 'colors': [Color(0xFF3B6EF8), Color(0xFF6366f1)], 'active': false},
    {'initials': 'PS', 'name': 'Priya Sharma', 'status': 'In School', 'colors': [Color(0xFF8B5CF6), Color(0xFFec4899)], 'active': false},
    {'initials': 'AR', 'name': 'Aditi Rao', 'status': 'In Room', 'colors': [Color(0xFF10b981), Color(0xFF00C9A7)], 'active': true},
    {'initials': 'NK', 'name': 'Nisha Kulkarni', 'status': 'In School', 'colors': [Color(0xFFF5A623), Color(0xFFef4444)], 'active': false},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppHeader(
        title: 'Hostel',
        subtitle: _schoolLabel,
        actions: [
          ElevatedButton(
            onPressed: () {},
            style: AppTheme.headerButtonStyle(),
            child: const Icon(Icons.notifications_outlined, size: 20),
          ),
          ElevatedButton(
            onPressed: () {},
            style: AppTheme.headerButtonStyle(),
            child: const Icon(Icons.more_horiz_rounded, size: 20),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Row(
              children: List.generate(_tabs.length, (i) {
                final sel = _activeTab == i;
                return GestureDetector(
                  onTap: () => setState(() => _activeTab = i),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: sel ? const Color(0xFF2350DD) : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(_tabs[i], style: GoogleFonts.dmSans(
                      color: sel ? Colors.white : const Color(0xFF64748B),
                      fontWeight: FontWeight.w600, fontSize: 12,
                    )),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 24),
        child: _buildBody(),
      ),
    );
  }

  // ── HEADER ──────────────────────────────────────────────────────────────────
  Widget _buildHeader() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF0F2027), Color(0xFF1A2A6C), Color(0xFF2350DD)],
        ),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => context.pop(),
                  child: Container(width: 34, height: 34, decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withOpacity(0.12)), child: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 16)),
                ),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('🏠 Hostel', style: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                  Text(_schoolLabel, style: GoogleFonts.dmSans(color: Colors.white60, fontSize: 11)),
                ])),
                _headerBtn(Icons.notifications_outlined),
                const SizedBox(width: 8),
                _headerBtn(Icons.more_horiz_rounded),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Tab bar
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Row(
              children: List.generate(_tabs.length, (i) {
                final sel = _activeTab == i;
                return GestureDetector(
                  onTap: () => setState(() => _activeTab = i),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: sel ? Colors.white : Colors.white.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(_tabs[i], style: GoogleFonts.dmSans(
                      color: sel ? const Color(0xFF2350DD) : Colors.white,
                      fontWeight: FontWeight.w600, fontSize: 12,
                    )),
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _headerBtn(IconData icon) => Container(width: 34, height: 34, decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withOpacity(0.12)), child: Icon(icon, color: Colors.white, size: 18));

  // ── BODY ──────────────────────────────────────────────────────────────────
  Widget _buildBody() {
    switch (_activeTab) {
      case 0: return _buildOverviewTab();
      case 1: return _buildGateLogTab();
      case 2: return _buildMealsTab();
      case 3: return _buildActivitiesTab();
      case 4: return _buildLeaveTab();
      default: return _buildOverviewTab();
    }
  }

  // ── OVERVIEW TAB ────────────────────────────────────────────────────────────
  Widget _buildOverviewTab() {
    return Column(children: [
      // Child Status Hero
      _buildChildHero(),
      // Quick Stats
      _buildQuickStats(),
      // Gate Log
      _buildSectionHeader('Gate Access Log — Today', 'Full History'),
      _buildGateCard(_gateLog.take(3).toList()),
      // Yesterday Summary
      _buildSectionHeader2('Yesterday\'s Summary'),
      _buildYesterdayCard(),
      // Room Info
      _buildSectionHeader('Room Information', null),
      _buildRoomCard(),
      // Meals
      _buildSectionHeader('Today\'s Hostel Meals', null),
      _buildMealsCard(),
      // Activities
      _buildSectionHeader('Activities & Attendance', 'All Activities'),
      _buildActivitiesCard(),
      // Weekly Attendance
      _buildSectionHeader('Weekly Hostel Attendance', null),
      _buildWeeklyAttendance(),
    ]);
  }

  Widget _buildChildHero() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF1A2A6C), Color(0xFF2350DD)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: const Color(0xFF2350DD).withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 6))],
      ),
      child: Column(
        children: [
          Row(children: [
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF667eea), Color(0xFF764ba2)]), borderRadius: BorderRadius.circular(14)),
              child: Center(child: Text(_studentInitials, style: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16))),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(_studentName, style: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
              Text(_studentClass, style: GoogleFonts.dmSans(color: Colors.white60, fontSize: 10)),
              const SizedBox(height: 4),
              Row(children: [
                const Icon(Icons.monitor_rounded, color: Colors.white54, size: 12),
                const SizedBox(width: 4),
                Text(_roomLabel, style: GoogleFonts.dmSans(color: Colors.white70, fontSize: 10)),
              ]),
            ])),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(color: const Color(0xFF4ade80).withOpacity(0.15), borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFF4ade80).withOpacity(0.4))),
              child: Row(children: [
                Container(width: 7, height: 7, decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF4ade80))),
                const SizedBox(width: 5),
                Text('In School', style: GoogleFonts.dmSans(color: const Color(0xFF4ade80), fontWeight: FontWeight.bold, fontSize: 10)),
              ]),
            ),
          ]),
          const SizedBox(height: 14),
          // In/Out cells
          Row(children: [
            Expanded(child: _inOutCell('Morning Check-Out', '7:12 AM', 'Left hostel for school', '✓ On Time', const Color(0xFF4ade80), false)),
            const SizedBox(width: 10),
            Expanded(child: _inOutCell('Expected Check-In', '3:45 PM', 'After school + Activity', '⏳ Pending', const Color(0xFFfbbf24), true)),
          ]),
          const SizedBox(height: 14),
          // Mini timeline
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.07), borderRadius: BorderRadius.circular(12)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("📅 Today's Movement Log", style: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                const SizedBox(height: 8),
                ..._movementLog.map((e) => _timelineRow(e)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _inOutCell(String label, String time, String sub, String tag, Color tagColor, bool warn) => Container(
    padding: const EdgeInsets.all(10),
    decoration: BoxDecoration(color: Colors.white.withOpacity(0.08), borderRadius: BorderRadius.circular(12)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: GoogleFonts.dmSans(color: Colors.white54, fontSize: 10)),
      Text(time, style: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
      Text(sub, style: GoogleFonts.dmSans(color: Colors.white60, fontSize: 9)),
      const SizedBox(height: 4),
      Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: tagColor.withOpacity(0.12), borderRadius: BorderRadius.circular(20)), child: Text(tag, style: TextStyle(color: tagColor, fontSize: 9, fontWeight: FontWeight.bold))),
    ]),
  );

  Widget _timelineRow(Map<String, dynamic> e) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 3),
    child: Row(children: [
      Container(width: 8, height: 8, decoration: BoxDecoration(shape: BoxShape.circle, color: e['dot'] as Color)),
      const SizedBox(width: 8),
      SizedBox(width: 52, child: Text(e['time'] as String, style: GoogleFonts.dmSans(color: Colors.white54, fontSize: 9))),
      Expanded(child: Text(e['event'] as String, style: GoogleFonts.dmSans(color: (e['upcoming'] as bool) ? Colors.white38 : Colors.white70, fontSize: 10))),
      Text(e['status'] as String, style: GoogleFonts.dmSans(color: (e['upcoming'] as bool) ? Colors.white38 : const Color(0xFF4ade80), fontSize: 9, fontWeight: FontWeight.w600)),
    ]),
  );

  Widget _buildQuickStats() {
    final stats = [
      {'val': '18', 'lbl': 'Days in\nHostel', 'color': const Color(0xFF00C9A7)},
      {'val': '96%', 'lbl': 'Meal\nAttendance', 'color': const Color(0xFF3B6EF8)},
      {'val': '2', 'lbl': 'Leaves\nTaken', 'color': const Color(0xFF8B5CF6)},
      {'val': '4.7', 'lbl': 'Conduct\nScore', 'color': const Color(0xFFF5A623)},
    ];
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
      child: Row(children: stats.map((s) => Expanded(child: Column(children: [
        Text(s['val'] as String, style: GoogleFonts.sora(color: s['color'] as Color, fontWeight: FontWeight.bold, fontSize: 20)),
        const SizedBox(height: 4),
        Text(s['lbl'] as String, style: GoogleFonts.dmSans(color: const Color(0xFF94A3B8), fontSize: 9, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
      ]))).toList()),
    );
  }

  Widget _buildSectionHeader(String label, String? action) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
    child: Row(children: [
      Text(label, style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13, color: const Color(0xFF1E293B))),
      const Spacer(),
      if (action != null) Text(action, style: GoogleFonts.dmSans(color: const Color(0xFF3B6EF8), fontSize: 12, fontWeight: FontWeight.w600)),
      Container(margin: const EdgeInsets.only(left: 8), height: 1, color: const Color(0xFFE2E8F0)),
    ]),
  );

  Widget _buildSectionHeader2(String label) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
    child: Text(label, style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13, color: const Color(0xFF1E293B))),
  );

  Widget _buildGateCard(List<Map<String, dynamic>> logs) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 10, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
      child: Column(children: [
        Row(children: [
          const Icon(Icons.lock_rounded, size: 16, color: Color(0xFF64748B)),
          const SizedBox(width: 8),
          Text('RFID Gate Log', style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13, color: const Color(0xFF1E293B))),
          const Spacer(),
          Text('${logs.length} events', style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
        ]),
        const SizedBox(height: 10),
        ...logs.map((e) => _gateRow(e)),
      ]),
    );
  }

  Widget _gateRow(Map<String, dynamic> e) {
    final isIn = e['type'] == 'IN';
    final color = isIn ? const Color(0xFF00C9A7) : const Color(0xFFEF4444);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: Row(children: [
        Container(width: 36, height: 36, decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(10)), child: Center(child: Text(e['ico'] as String, style: const TextStyle(fontSize: 16)))),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(e['event'] as String, style: GoogleFonts.sora(fontWeight: FontWeight.w600, fontSize: 12)),
          Text(e['sub'] as String, style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8))),
        ])),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text(e['time'] as String, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
          Text(e['method'] as String, style: GoogleFonts.dmSans(fontSize: 9, color: const Color(0xFF94A3B8))),
        ]),
      ]),
    );
  }

  Widget _buildYesterdayCard() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 10, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
      child: Column(children: [
        Row(children: [
          Text('Nov 19 · Full Day Log', style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13)),
          const Spacer(),
          Text('Normal Day ✓', style: GoogleFonts.dmSans(color: const Color(0xFF00C9A7), fontWeight: FontWeight.bold, fontSize: 10)),
        ]),
        const SizedBox(height: 10),
        _gateRow({'ico': '🌅', 'event': 'Morning Check-Out to School', 'sub': '7:10 AM · On time · Breakfast eaten', 'time': '7:10 AM', 'type': 'IN', 'method': 'RFID ✓'}),
        _gateRow({'ico': '🏠', 'event': 'Evening Check-In from School', 'sub': '3:40 PM · 5 min early · Sports done', 'time': '3:40 PM', 'type': 'IN', 'method': 'RFID ✓'}),
        _gateRow({'ico': '🌙', 'event': 'Lights Out — Room Confirmed', 'sub': '10:00 PM · All 4 students present', 'time': '10:00 PM', 'type': 'IN', 'method': 'Roll Call'}),
      ]),
    );
  }

  Widget _buildRoomCard() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 10, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
      child: Column(children: [
        Row(children: [
          const Icon(Icons.monitor_rounded, size: 16, color: Color(0xFF64748B)),
          const SizedBox(width: 8),
          Text('Room Details', style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13)),
          const Spacer(),
          Text('Clean ✓', style: GoogleFonts.dmSans(color: const Color(0xFF00C9A7), fontWeight: FontWeight.bold, fontSize: 10)),
        ]),
        const SizedBox(height: 12),
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(width: 56, height: 56, decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF2350DD), Color(0xFF6366f1)]), borderRadius: BorderRadius.circular(14)), child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Text('A204', style: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
            Text('Block A', style: GoogleFonts.dmSans(color: Colors.white70, fontSize: 8)),
          ])),
          const SizedBox(width: 12),
          Expanded(child: Column(children: [
            for (final row in [
              ['Floor', '2nd Floor · East Wing'],
              ['Type', '4-Bed Shared'],
              ['Warden', 'Mrs. Rekha Menon'],
              ['WiFi', 'Zone-A2 · Study Hours Only'],
            ]) Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(children: [
                SizedBox(width: 70, child: Text(row[0], style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF94A3B8)))),
                Expanded(child: Text(row[1], style: GoogleFonts.sora(fontSize: 11, fontWeight: FontWeight.w600, color: const Color(0xFF1E293B)))),
              ]),
            ),
          ])),
        ]),
        const SizedBox(height: 12),
        const Divider(height: 1, color: Color(0xFFF1F5F9)),
        const SizedBox(height: 12),
        // Roommates
        ..._roommates.map((r) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(gradient: LinearGradient(colors: r['colors'] as List<Color>), borderRadius: BorderRadius.circular(10)),
              child: Center(child: Text(r['initials'] as String, style: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12))),
            ),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(r['name'] as String, style: GoogleFonts.sora(fontWeight: FontWeight.w600, fontSize: 12)),
              Row(children: [
                Container(width: 7, height: 7, decoration: BoxDecoration(shape: BoxShape.circle, color: (r['active'] as bool) ? const Color(0xFF4ade80) : const Color(0xFFF5A623))),
                const SizedBox(width: 5),
                Text(r['status'] as String, style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF64748B))),
              ]),
            ])),
          ]),
        )),
      ]),
    );
  }

  Widget _buildMealsCard() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 10, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
      child: Column(children: [
        Row(children: [
          const Icon(Icons.restaurant_rounded, size: 16, color: Color(0xFF64748B)),
          const SizedBox(width: 8),
          Text('Mess Hall · Block A', style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13)),
          const Spacer(),
          Text('2/3 eaten', style: GoogleFonts.dmSans(color: const Color(0xFF00C9A7), fontWeight: FontWeight.bold, fontSize: 10)),
        ]),
        const SizedBox(height: 10),
        ..._meals.map((m) => _mealRow(m)),
      ]),
    );
  }

  Widget _mealRow(Map<String, dynamic> m) {
    Color tagColor; Color tagBg; String tagText;
    switch (m['status']) {
      case 'eaten': tagColor = const Color(0xFF00C9A7); tagBg = const Color(0xFFF0FDF9); tagText = '✓ Eaten'; break;
      case 'missed': tagColor = const Color(0xFFEF4444); tagBg = const Color(0xFFfee2e2); tagText = '✗ Missed'; break;
      default: tagColor = const Color(0xFFF5A623); tagBg = const Color(0xFFFFFBEB); tagText = '⏳ Upcoming';
    }
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: Row(children: [
        Text(m['ico'] as String, style: const TextStyle(fontSize: 22)),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(m['name'] as String, style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 12)),
          Text(m['menu'] as String, style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8))),
        ])),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text(m['time'] as String, style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF64748B))),
          const SizedBox(height: 4),
          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: tagBg, borderRadius: BorderRadius.circular(20)), child: Text(tagText, style: TextStyle(color: tagColor, fontSize: 9, fontWeight: FontWeight.bold))),
        ]),
      ]),
    );
  }

  Widget _buildActivitiesCard() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 10, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
      child: Column(children: [
        Row(children: [
          Text("🏃 Today's Schedule", style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13)),
          const Spacer(),
          Text('${_activities.length} activities', style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
        ]),
        const SizedBox(height: 10),
        ..._activities.map((a) => _activityRow(a)),
      ]),
    );
  }

  Widget _activityRow(Map<String, dynamic> a) {
    final isPresent = a['status'] == 'present';
    final color = a['color'] as Color;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: Row(children: [
        Container(width: 36, height: 36, decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(10)), child: Center(child: Text(a['ico'] as String, style: const TextStyle(fontSize: 16)))),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(a['name'] as String, style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 12)),
          Text(a['detail'] as String, style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8))),
        ])),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text(a['time'] as String, style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF64748B))),
          const SizedBox(height: 4),
          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: isPresent ? const Color(0xFFF0FDF9) : const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(20)), child: Text(isPresent ? '✓ Present' : '⏳ Upcoming', style: TextStyle(color: isPresent ? const Color(0xFF00C9A7) : const Color(0xFFF5A623), fontSize: 9, fontWeight: FontWeight.bold))),
        ]),
      ]),
    );
  }

  Widget _buildWeeklyAttendance() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const dots = [
      ['p', 'p', 'p', 'p'],
      ['p', 'p', 'p', 'a'],
      ['p', 'u', 'p', 'u'],
      ['p', 'p', 'p', 'p'],
      ['p', 'p', 'p', 'p'],
    ];
    const labels = ['M', 'N', '🍽', '📚'];
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 10, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
      child: Column(children: [
        Row(children: [
          Text('📅 Nov 18–22 Roll Calls', style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13)),
          const Spacer(),
          Text('5 days · 20 sessions', style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8))),
        ]),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: List.generate(days.length, (di) => Column(children: [
            Text(days[di], style: GoogleFonts.dmSans(fontWeight: FontWeight.w600, fontSize: 11, color: di == 2 ? const Color(0xFF2350DD) : const Color(0xFF64748B))),
            const SizedBox(height: 6),
            for (int ri = 0; ri < dots[di].length; ri++) ...[
              _attDot(dots[di][ri], labels[ri]),
              const SizedBox(height: 4),
            ],
          ])),
        ),
      ]),
    );
  }

  Widget _attDot(String status, String label) {
    Color bg;
    if (status == 'p') bg = const Color(0xFF00C9A7);
    else if (status == 'a') bg = const Color(0xFFEF4444);
    else bg = const Color(0xFFCBD5E1);
    return Container(width: 28, height: 28, decoration: BoxDecoration(color: bg.withOpacity(0.15), borderRadius: BorderRadius.circular(8), border: Border.all(color: bg.withOpacity(0.4))), alignment: Alignment.center, child: Text(label, style: TextStyle(color: bg, fontWeight: FontWeight.bold, fontSize: 10)));
  }

  // ── GATE LOG TAB ────────────────────────────────────────────────────────────
  Widget _buildGateLogTab() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(children: [
        _buildGateCard(_gateLog),
        const SizedBox(height: 32),
      ]),
    );
  }

  // ── MEALS TAB ───────────────────────────────────────────────────────────────
  Widget _buildMealsTab() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(children: [_buildMealsCard(), const SizedBox(height: 32)]),
    );
  }

  // ── ACTIVITIES TAB ──────────────────────────────────────────────────────────
  Widget _buildActivitiesTab() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(children: [_buildActivitiesCard(), const SizedBox(height: 32)]),
    );
  }

  // ── LEAVE TAB ──────────────────────────────────────────────────────────────
  Widget _buildLeaveTab() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Leave Applications', style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Leaves Taken: 2 / 10 allowed', style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 12),
            _leaveRow('Oct 25–26', 'Diwali vacation', 'Approved', const Color(0xFF00C9A7)),
            _leaveRow('Nov 14', 'Medical appointment', 'Approved', const Color(0xFF00C9A7)),
          ]),
        ),
        const SizedBox(height: 32),
      ]),
    );
  }

  Widget _leaveRow(String date, String reason, String status, Color color) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(children: [
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(date, style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 12)),
        Text(reason, style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF64748B))),
      ])),
      Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(20)), child: Text(status, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 11))),
    ]),
  );
}
