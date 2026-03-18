import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:parent_app_flutter/core/theme/app_theme.dart';
import '../services/exams_service.dart';

class ExamsScreen extends StatefulWidget {
  const ExamsScreen({Key? key}) : super(key: key);

  @override
  _ExamsScreenState createState() => _ExamsScreenState();
}

class _ExamsScreenState extends State<ExamsScreen> {
  Map<String, dynamic>? _examsData;
  bool _isLoading = true;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final studentId = prefs.getString('active_student_id');
      
      if (studentId == null) {
        setState(() {
          _errorMessage = "No active student selected.";
          _isLoading = false;
        });
        return;
      }

      final data = await ExamsService.fetchExams(studentId);
      setState(() {
        _examsData = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(backgroundColor: AppTheme.bg, body: Center(child: CircularProgressIndicator(color: AppTheme.a1)));
    }

    if (_errorMessage.isNotEmpty) {
      return Scaffold(backgroundColor: AppTheme.bg, body: Center(child: Text(_errorMessage, style: const TextStyle(color: Colors.red))));
    }

    final String term = _examsData?['term'] ?? 'Upcoming Exams';
    final List<dynamic> exams = _examsData?['exams'] ?? [];
    final String hallTicket = _examsData?['hallTicket'] ?? 'N/A';
    final String center = _examsData?['center'] ?? 'School Campus';

    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: Column(
        children: [
          // ── Popup header ──
          Container(
            decoration: const BoxDecoration(color: Colors.white, border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))),
            padding: const EdgeInsets.only(top: 12, bottom: 14, left: 20, right: 12),
            child: Column(
              children: [
                Center(child: Container(width: 36, height: 4, decoration: BoxDecoration(color: const Color(0xFFD1D5DB), borderRadius: BorderRadius.circular(2)))),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Container(
                      width: 36, height: 36,
                      decoration: BoxDecoration(color: const Color(0xFFF0EDFF), borderRadius: BorderRadius.circular(10)),
                      child: const Center(child: Text('📝', style: TextStyle(fontSize: 18))),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(child: Text('Exam Schedule', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, letterSpacing: -0.3, color: AppTheme.t1))),
                    GestureDetector(
                      onTap: () => Navigator.of(context).pop(),
                      child: Container(
                        width: 32, height: 32,
                        decoration: BoxDecoration(color: const Color(0xFFF3F4F6), borderRadius: BorderRadius.circular(10)),
                        child: const Icon(Icons.close_rounded, size: 18, color: Color(0xFF6B7280)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          // ── Content ──
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildHeroCard(term, hallTicket, center),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Schedule & Syllabus', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.t2)),
                      Text('${exams.length} papers', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.t3)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ...exams.map((e) => _buildExamCard(e)).toList(),
                  if (exams.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(32.0),
                      child: Text("No upcoming exams.", style: TextStyle(color: AppTheme.t3, fontWeight: FontWeight.w700), textAlign: TextAlign.center,),
                    )
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroCard(String term, String hallTicket, String center) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.a1,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [BoxShadow(color: Color(0x406366F1), blurRadius: 20, offset: Offset(0, 8))],
        gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)], begin: Alignment.topLeft, end: Alignment.bottomRight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
           Row(
             mainAxisAlignment: MainAxisAlignment.spaceBetween,
             children: [
               Container(
                 padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                 decoration: BoxDecoration(
                   color: Colors.white24,
                   borderRadius: BorderRadius.circular(12),
                 ),
                 child: const Text('📝 FINAL TERM', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 10, letterSpacing: 0.5)),
               ),
               const Icon(Icons.school, color: Colors.white38, size: 28),
             ],
           ),
           const SizedBox(height: 16),
           Text(term, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 26, letterSpacing: -0.5)),
           const SizedBox(height: 20),
           Row(
             children: [
               Expanded(
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     const Text('Hall Ticket', style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w600)),
                     const SizedBox(height: 2),
                     Text(hallTicket, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
                   ],
                 )
               ),
               Expanded(
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     const Text('Center', style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w600)),
                     const SizedBox(height: 2),
                     Text(center, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800), maxLines: 1, overflow: TextOverflow.ellipsis,),
                   ],
                 )
               ),
             ],
           )
        ],
      )
    );
  }

  Widget _buildExamCard(dynamic e) {
    final subj = e['subj'] ?? 'Subject';
    final icon = e['icon'] ?? '📚';
    final code = e['code'] ?? 'CODE';
    final date = e['date'] ?? 'Date';
    final day = e['day'] ?? 'Day';
    final time = e['time'] ?? 'Time';
    final room = e['room'] ?? 'Room';
    final maxMarks = e['maxMarks']?.toString() ?? '100';
    final syllabus = e['syllabus'] ?? 'Complete Curriculum';
    final prep = (e['prep'] ?? 0).toDouble();

    final palette = _getColorPalette(subj);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x1F000000)),
        boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0,2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 40, height: 40,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: palette['bg'],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: palette['border']!)
                    ),
                    child: Text(icon, style: const TextStyle(fontSize: 18)),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(subj, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppTheme.t1)),
                      const SizedBox(height: 2),
                      Text(code, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 11, color: AppTheme.t3)),
                    ],
                  )
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(date, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: palette['acc'])),
                  const SizedBox(height: 4),
                  Text(day, style: const TextStyle(color: AppTheme.t3, fontSize: 10, fontWeight: FontWeight.w700)),
                ],
              )
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildMiniChip('⏱ $time', palette),
              const SizedBox(width: 6),
              _buildMiniChip('📍 ${room.split('—')[0].trim()}', palette),
              const SizedBox(width: 6),
              _buildMiniChip('📋 $maxMarks Marks', palette),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Text('Preparation', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.t3)),
              const SizedBox(width: 8),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: prep / 100,
                    backgroundColor: palette['bg'],
                    valueColor: AlwaysStoppedAnimation<Color>(palette['acc']!),
                    minHeight: 6,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text('${prep.toStringAsFixed(0)}%', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: palette['acc'])),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Divider(height: 1, thickness: 1, color: Color(0xFFF1F5F9)),
          ),
          Wrap(
             children: [
               const Text('📚 Syllabus: ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.t2)),
               Text(syllabus, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppTheme.t3)),
             ],
          )
        ],
      ),
    );
  }

  Widget _buildMiniChip(String text, Map<String, Color> palette) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: palette['bg'],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(text, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: palette['acc'])),
    );
  }

  Map<String, Color> _getColorPalette(String sub) {
    final lower = sub.toLowerCase();
    if (lower.contains('math')) {
      return {'bg': AppTheme.goldBg, 'acc': AppTheme.goldAcc, 'text': AppTheme.goldText, 'border': AppTheme.goldBorder};
    } else if (lower.contains('sci')) {
      return {'bg': AppTheme.skyBg, 'acc': AppTheme.skyAcc, 'text': AppTheme.skyText, 'border': AppTheme.skyBorder};
    } else if (lower.contains('eng')) {
      return {'bg': AppTheme.lavenderBg, 'acc': AppTheme.lavenderAcc, 'text': AppTheme.lavenderText, 'border': AppTheme.lavenderBorder};
    } else {
      return {'bg': AppTheme.mintBg, 'acc': AppTheme.mintAcc, 'text': AppTheme.mintText, 'border': AppTheme.mintBorder};
    }
  }
}
