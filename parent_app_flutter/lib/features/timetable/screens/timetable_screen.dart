import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:parent_app_flutter/core/theme/app_theme.dart';
import '../services/timetable_service.dart';

class TimetableScreen extends StatefulWidget {
  const TimetableScreen({Key? key}) : super(key: key);

  @override
  _TimetableScreenState createState() => _TimetableScreenState();
}

class _TimetableScreenState extends State<TimetableScreen> {
  Map<String, dynamic>? _data;
  bool _isLoading = true;
  String _errorMessage = '';
  
  final List<String> _days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  final Map<String, String> _dayAbbr = {'monday': 'MON', 'tuesday': 'TUE', 'wednesday': 'WED', 'thursday': 'THU', 'friday': 'FRI', 'saturday': 'SAT'};
  String _selectedDay = 'monday';

  @override
  void initState() {
    super.initState();
    final today = DateTime.now().weekday;
    if (today >= 1 && today <= 6) {
      _selectedDay = _days[today - 1];
    }
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final studentId = prefs.getString('active_student_id');
      
      if (studentId == null) {
        if (!mounted) return;
        setState(() { _errorMessage = "No active student selected."; _isLoading = false; });
        return;
      }

      final data = await TimetableService.fetchTimetable(studentId);
      if (!mounted) return;
      setState(() { _data = data; _isLoading = false; });
    } catch (e) {
      if (!mounted) return;
      setState(() { _errorMessage = e.toString(); _isLoading = false; });
    }
  }

  List<dynamic> get _todayPeriods {
    final schedule = _data?['schedule'];
    if (schedule == null) return [];
    return (schedule[_selectedDay] as List<dynamic>?) ?? [];
  }

  int get _periodCount => _data?['periodCount'] ?? 0;

  int get _subjectCount {
    final subjects = <String>{};
    for (final p in _todayPeriods) {
      if (p['isBreak'] != true && p['subject'] != null && p['subject'] != 'Free Period') {
        subjects.add(p['subject']);
      }
    }
    return subjects.length;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(backgroundColor: AppTheme.bg, body: Center(child: CircularProgressIndicator(color: AppTheme.a1)));
    }

    if (_errorMessage.isNotEmpty) {
       return Scaffold(backgroundColor: AppTheme.bg, body: Center(child: Text(_errorMessage, style: const TextStyle(color: Colors.red))));
    }

    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: Column(
        children: [
          // ── Popup drag handle + close ──
          Container(
            color: const Color(0xFF0C4A6E),
            padding: const EdgeInsets.only(top: 10, bottom: 4),
            child: Column(
              children: [
                Center(child: Container(width: 36, height: 4, decoration: BoxDecoration(color: Colors.white.withOpacity(0.4), borderRadius: BorderRadius.circular(2)))),
                const SizedBox(height: 6),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.of(context).pop(),
                        child: Container(
                          width: 30, height: 30,
                          decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
                          child: const Icon(Icons.close_rounded, size: 16, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // ── Gradient Header with Day Strip ──
          _buildGradientHeader(),
          // ── Stats Row ──
          _buildStatsRow(),
          // ── Content ──
          Expanded(
            child: _todayPeriods.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('📅', style: TextStyle(fontSize: 48)),
                      const SizedBox(height: 12),
                      Text('No schedule for ${_dayAbbr[_selectedDay] ?? _selectedDay}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppTheme.t3)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                  itemCount: _todayPeriods.length,
                  itemBuilder: (ctx, i) {
                    final p = _todayPeriods[i];
                    if (p['isBreak'] == true) return _buildBreakCard(p);
                    return _buildPeriodCard(p, i);
                  },
                ),
          ),
        ],
      ),
    );
  }

  // ── Gradient Header ──
  Widget _buildGradientHeader() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF0C4A6E), Color(0xFF0369A1), Color(0xFF0891B2)],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.only(bottomLeft: Radius.circular(28), bottomRight: Radius.circular(28)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title + Week Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Timetable', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 19, color: Colors.white, letterSpacing: -0.3)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.20),
                  border: Border.all(color: Colors.white.withOpacity(0.30)),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  _data?['classroom'] ?? '',
                  style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w700, color: Colors.white),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Day Strip
          Row(
            children: _days.map((d) {
              final isSel = d == _selectedDay;
              final now = DateTime.now();
              // Get the date number for display
              final todayIndex = now.weekday - 1; // 0=Mon
              final dayIndex = _days.indexOf(d);
              final diff = dayIndex - todayIndex;
              final dayDate = now.add(Duration(days: diff));
              final hasClasses = (_data?['schedule']?[d] as List?)?.any((p) => p['isBreak'] != true && p['subject'] != 'Free Period') ?? false;

              return Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _selectedDay = d),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    curve: Curves.easeOutBack,
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isSel ? Colors.white.withOpacity(0.95) : Colors.white.withOpacity(0.14),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isSel ? Colors.transparent : Colors.white.withOpacity(0.20)),
                      boxShadow: isSel ? [const BoxShadow(color: Color(0x26000000), blurRadius: 16, offset: Offset(0, 4))] : null,
                    ),
                    child: Column(
                      children: [
                        Text(
                          _dayAbbr[d]!.substring(0, 3),
                          style: TextStyle(
                            fontSize: 8.5, fontWeight: FontWeight.w700,
                            color: isSel ? AppTheme.a1.withOpacity(0.7) : Colors.white.withOpacity(0.75),
                            letterSpacing: 0.4,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${dayDate.day}',
                          style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w900,
                            color: isSel ? AppTheme.a1 : Colors.white,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Container(
                          width: 5, height: 5,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isSel ? AppTheme.a1 : (hasClasses ? Colors.white.withOpacity(0.85) : Colors.white.withOpacity(0.35)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // ── Stats Row ──
  Widget _buildStatsRow() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 4),
      child: Row(
        children: [
          _buildStatBox('$_periodCount', 'Periods', AppTheme.a1),
          const SizedBox(width: 7),
          _buildStatBox('$_subjectCount', 'Subjects', AppTheme.sageAcc),
          const SizedBox(width: 7),
          _buildStatBox('45min', 'Per Period', AppTheme.goldAcc),
        ],
      ),
    );
  }

  Widget _buildStatBox(String value, String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: color, height: 1)),
            const SizedBox(height: 3),
            Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w600, color: AppTheme.t4, letterSpacing: 0.4)),
          ],
        ),
      ),
    );
  }

  // ── Period Card (v11 style) ──
  Widget _buildPeriodCard(dynamic p, int index) {
    final startTime = p['startTime'] ?? '';
    final endTime = p['endTime'] ?? '';
    final subj = p['subject'] ?? 'Free Period';
    final teacher = p['teacherName'] ?? '';
    final periodName = p['periodName'] ?? '';
    final icon = _getIconForSubject(subj);
    final palette = _getColorPalette(subj);
    final isFree = subj == 'Free Period';

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Time column
          SizedBox(
            width: 44,
            child: Padding(
              padding: const EdgeInsets.only(top: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(startTime, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: AppTheme.t3)),
                  const SizedBox(height: 2),
                  Text(endTime, style: const TextStyle(fontSize: 8.5, color: AppTheme.t4)),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Card
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: isFree ? const Color(0xFFFAFBFC) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isFree ? const Color(0xFFE5E7EB) : palette['border']!.withOpacity(0.5)),
                boxShadow: isFree ? null : [BoxShadow(color: palette['acc']!.withOpacity(0.06), blurRadius: 8, offset: const Offset(0, 2))],
              ),
              child: Stack(
                children: [
                  // Left accent bar
                  Positioned(left: 0, top: 0, bottom: 0, child: Container(
                    width: 3.5,
                    decoration: BoxDecoration(
                      color: isFree ? const Color(0xFFD1D5DB) : palette['acc'],
                      borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), bottomLeft: Radius.circular(16)),
                    ),
                  )),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(14, 13, 14, 13),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Subject name
                        Text(subj, style: TextStyle(
                          fontWeight: FontWeight.w800, fontSize: 13,
                          color: isFree ? AppTheme.t4 : AppTheme.t1, height: 1.2,
                        )),
                        if (teacher.isNotEmpty) ...[
                          const SizedBox(height: 5),
                          Row(children: [
                            Container(
                              width: 20, height: 20,
                              decoration: BoxDecoration(
                                color: palette['acc'],
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Center(child: Text(teacher[0].toUpperCase(), style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.white))),
                            ),
                            const SizedBox(width: 6),
                            Text(teacher, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppTheme.t3)),
                          ]),
                        ],
                        if (!isFree) ...[
                          const SizedBox(height: 7),
                          Row(children: [
                            _buildChip(icon, palette['bg']!, palette['acc']!),
                            const SizedBox(width: 6),
                            _buildChip(periodName, const Color(0xFFF1F5F9), AppTheme.t3),
                          ]),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String text, Color bg, Color textColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.black.withOpacity(0.07)),
      ),
      child: Text(text, style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w700, color: textColor)),
    );
  }

  // ── Break Card ──
  Widget _buildBreakCard(dynamic p) {
    final startTime = p['startTime'] ?? '';
    final endTime = p['endTime'] ?? '';
    final label = p['subject'] ?? 'Break';

    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 52),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE5E7EB), width: 1.5, style: BorderStyle.solid),
        ),
        child: Row(
          children: [
            const Text('☕', style: TextStyle(fontSize: 14)),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppTheme.t4)),
            const Spacer(),
            Text('$startTime - $endTime', style: const TextStyle(fontSize: 9, color: AppTheme.t4)),
          ],
        ),
      ),
    );
  }

  String _getIconForSubject(String subj) {
     final s = subj.toLowerCase();
     if(s.contains('math')) return '📐';
     if(s.contains('sci')) return '🔬';
     if(s.contains('eng')) return '📖';
     if(s.contains('hist')) return '🏛️';
     if(s.contains('art')) return '🎨';
     if(s.contains('sport') || s.contains('pe')) return '⚽';
     if(s.contains('music')) return '🎵';
     if(s.contains('computer') || s.contains('cs')) return '💻';
     if(s.contains('hindi')) return '🕉️';
     if(s.contains('free')) return '🆓';
     return '📚';
  }

  Map<String, Color> _getColorPalette(String subj) {
    final s = subj.toLowerCase();
    if (s.contains('math')) return {'bg': AppTheme.goldBg, 'acc': AppTheme.goldAcc, 'text': AppTheme.goldText, 'border': AppTheme.goldBorder};
    if (s.contains('sci')) return {'bg': AppTheme.skyBg, 'acc': AppTheme.skyAcc, 'text': AppTheme.skyText, 'border': AppTheme.skyBorder};
    if (s.contains('eng')) return {'bg': AppTheme.lavenderBg, 'acc': AppTheme.lavenderAcc, 'text': AppTheme.lavenderText, 'border': AppTheme.lavenderBorder};
    if (s.contains('hindi')) return {'bg': AppTheme.peachBg, 'acc': AppTheme.peachAcc, 'text': AppTheme.peachText, 'border': AppTheme.peachBorder};
    if (s.contains('art') || s.contains('music')) return {'bg': AppTheme.roseBg, 'acc': AppTheme.roseAcc, 'text': AppTheme.roseText, 'border': AppTheme.roseBorder};
    if (s.contains('sport') || s.contains('pe')) return {'bg': AppTheme.sageBg, 'acc': AppTheme.sageAcc, 'text': AppTheme.sageText, 'border': AppTheme.sageBorder};
    if (s.contains('computer') || s.contains('cs')) return {'bg': AppTheme.mintBg, 'acc': AppTheme.mintAcc, 'text': AppTheme.mintText, 'border': AppTheme.mintBorder};
    return {'bg': AppTheme.mintBg, 'acc': AppTheme.mintAcc, 'text': AppTheme.mintText, 'border': AppTheme.mintBorder};
  }
}
