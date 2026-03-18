import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:parent_app_flutter/core/theme/app_theme.dart';
import 'package:parent_app_flutter/features/dashboard/screens/shell_screen.dart' as parent_app_flutter;
import '../services/diary_service.dart';
import 'package:intl/intl.dart';

class DiaryScreen extends StatefulWidget {
  const DiaryScreen({Key? key}) : super(key: key);

  @override
  _DiaryScreenState createState() => _DiaryScreenState();
}

class _DiaryScreenState extends State<DiaryScreen> {
  List<dynamic>? _diaryEntries;
  bool _isLoading = true;
  String _errorMessage = '';
  DateTime _selectedDate = DateTime.now();
  
  final _noteController = TextEditingController();
  String? _selectedCategory;
  final List<String> _categories = ['Academic', 'Behaviour', 'Health / Leave', 'Activity', 'General'];

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

      final data = await DiaryService.fetchDiaryEntries(studentId);
      setState(() {
        _diaryEntries = data;
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
      return const Scaffold(
        backgroundColor: Colors.white, 
        body: Center(child: CircularProgressIndicator(color: AppTheme.a1))
      );
    }

    if (_errorMessage.isNotEmpty) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: Center(child: Text(_errorMessage, style: const TextStyle(color: Colors.red)))
      );
    }

    final entries = _diaryEntries ?? [];

    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                   _buildWeekNavigator(),
                   const SizedBox(height: 16),
                   Text(
                     _selectedDate.day == DateTime.now().day 
                        ? 'ALL ENTRIES — TODAY' 
                        : 'ALL ENTRIES — ${DateFormat('MMM d').format(_selectedDate).toUpperCase()}',
                     style: const TextStyle(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.t4,
                        letterSpacing: 1.1,
                     )
                   ),
                   const SizedBox(height: 12),
                   ..._filteredEntries().map((e) => _buildDiaryEntry(e)).toList(),
                   if (_filteredEntries().isEmpty)
                      const Padding(
                         padding: EdgeInsets.symmetric(vertical: 32),
                         child: Center(
                            child: Text(
                               'No entries found for this date',
                               style: TextStyle(color: AppTheme.t4, fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                         ),
                      ),
                   const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
      ),
      padding: const EdgeInsets.fromLTRB(18, 0, 18, 12),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            const SizedBox(height: 10),
            Container(
               width: 36, height: 4, 
               decoration: BoxDecoration(
                 color: const Color(0x59B49B78), // rgba(180,155,120,0.35)
                 borderRadius: BorderRadius.circular(2),
               ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Container(
                  width: 38, height: 38,
                  decoration: BoxDecoration(
                    color: AppTheme.peachBg,
                    border: Border.all(color: AppTheme.peachBorder),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Center(
                    child: Icon(Icons.menu_book, color: AppTheme.peachAcc, size: 20),
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'School Diary',
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.t1,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    if (Navigator.canPop(context)) {
                      Navigator.pop(context);
                    } else {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (context) => const parent_app_flutter.ShellScreen()),
                      );
                    }
                  },
                  child: Container(
                    width: 30, height: 30,
                    decoration: BoxDecoration(
                      color: AppTheme.bg2,
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: const Center(
                      child: Icon(Icons.close, color: AppTheme.t2, size: 16),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  List<dynamic> _filteredEntries() {
     if (_diaryEntries == null) return [];
     return _diaryEntries!.where((e) {
        if (e['date'] == null) return false;
        final dt = DateTime.tryParse(e['date']);
        if (dt == null) return false;
        return dt.year == _selectedDate.year && dt.month == _selectedDate.month && dt.day == _selectedDate.day;
     }).toList();
  }

  bool _hasEntryForDate(DateTime dt) {
    if (_diaryEntries == null) return false;
    for (var entry in _diaryEntries!) {
      if (entry['date'] != null) {
        final t = DateTime.tryParse(entry['date']);
        if (t != null && t.year == dt.year && t.month == dt.month && t.day == dt.day) {
          return true;
        }
      }
    }
    return false;
  }

  Widget _buildWeekNavigator() {
    final now = DateTime.now();
    final monday = now.subtract(Duration(days: now.weekday - 1));
    final weekDates = List.generate(7, (index) => monday.add(Duration(days: index)));
    final days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(7, (index) {
        final date = weekDates[index];
        final isSelected = date.year == _selectedDate.year && 
                           date.month == _selectedDate.month && 
                           date.day == _selectedDate.day;
        final hasAnyEntry = _hasEntryForDate(date);
        
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
                  color: isSelected ? const Color(0xFF0369A1) : AppTheme.bg,
                  gradient: isSelected ? const LinearGradient(colors: [Color(0xFF0369A1), Color(0xFF0891B2)], begin: Alignment.topLeft, end: Alignment.bottomRight) : null,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: isSelected ? Colors.transparent : const Color(0xFFE2E8F0)),
                  boxShadow: isSelected ? const [BoxShadow(color: Color(0x4D0891B2), blurRadius: 8, offset: Offset(0, 3))] : null,
               ),
               child: Column(
                  children: [
                     Text(days[index], style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w700, color: isSelected ? Colors.white : AppTheme.t4, letterSpacing: 0.3)),
                     const SizedBox(height: 2),
                     Text('${date.day}', style: TextStyle(fontFamily: 'Outfit', fontSize: 13, fontWeight: FontWeight.w800, color: isSelected ? Colors.white : AppTheme.t1)),
                     const SizedBox(height: 3),
                     if (hasAnyEntry) 
                        Container(
                          width: 4, height: 4,
                          decoration: BoxDecoration(
                             color: isSelected ? Colors.white.withOpacity(0.7) : AppTheme.peachAcc,
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
    );
  }



  Widget _buildDiaryEntry(dynamic e) {
    final cat = (e['category'] ?? 'GENERAL').toString().toUpperCase();
    final content = e['content'] ?? e['title'] ?? 'Note';
    final teacher = e['teacherName'] ?? 'Teacher';
    final avatar = e['teacherAvatar'] ?? (teacher.isNotEmpty ? teacher[0] : 'T');
    final dateRaw = e['date'];
    
    // Evaluate badge colors
    Color leftBorder = AppTheme.mintAcc;
    Color badgeBg = const Color(0x2110B981);
    Color badgeText = AppTheme.mintAcc;

    if (cat == 'ACADEMIC') {
       leftBorder = AppTheme.peachAcc;
       badgeBg = const Color(0x21F97316); 
       badgeText = AppTheme.peachAcc;
    } else if (cat == 'ACTIVITY') {
       leftBorder = AppTheme.sageAcc;
       badgeBg = const Color(0x2110B981);
       badgeText = AppTheme.sageAcc;
    } else if (cat == 'BEHAVIOUR' || cat == 'BEHAVIOR') {
       leftBorder = AppTheme.peachAcc;
       badgeBg = const Color(0x21F97316); 
       badgeText = AppTheme.peachAcc;
    } else if (cat == 'HEALTH') {
       leftBorder = AppTheme.roseAcc;
       badgeBg = const Color(0x21F43F5E);
       badgeText = AppTheme.roseAcc;
    } else {
       leftBorder = AppTheme.peachAcc;
       badgeBg = const Color(0x21F97316); 
       badgeText = AppTheme.peachAcc;
    }

    String timeStr = 'Today · 8:10 AM';
    if (dateRaw != null) {
       final dt = DateTime.tryParse(dateRaw);
       if (dt != null) {
          timeStr = 'Yesterday · ${DateFormat('h:mm a').format(dt)}'; 
       }
    }

    // Default emojis mock
    String emoji = '😄';
    if (cat == 'ACTIVITY') emoji = '🏆';
    if (cat == 'ACADEMIC') emoji = '😁';

    return Stack(
      children: [
        Container(
          margin: const EdgeInsets.only(bottom: 12),
          child: Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border(
                      top: const BorderSide(color: Color(0xFFF1F5F9)),
                      right: const BorderSide(color: Color(0xFFF1F5F9)),
                      bottom: const BorderSide(color: Color(0xFFF1F5F9)),
                      left: BorderSide(color: leftBorder, width: 4.5),
                    ),
                    boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 8, offset: Offset(0, 2))],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                       Row(
                         mainAxisAlignment: MainAxisAlignment.spaceBetween,
                         children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: badgeBg,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(cat, style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: badgeText, letterSpacing: 0.5)),
                            ),
                            Expanded(
                               child: Row(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                     const Icon(Icons.access_time, size: 10, color: AppTheme.t4),
                                     const SizedBox(width: 4),
                                     Flexible(child: Text(timeStr, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppTheme.t4), overflow: TextOverflow.ellipsis)),
                                     const SizedBox(width: 12), // space for absolute dot
                                  ],
                               ),
                            )
                         ],
                       ),
                       const SizedBox(height: 14),
                       _parseNoteContent(content),
                       const SizedBox(height: 16),
                       Row(
                         mainAxisAlignment: MainAxisAlignment.spaceBetween,
                         children: [
                            Expanded(
                               child: Row(
                                 children: [
                                    Container(
                                      width: 24, height: 24,
                                      decoration: const BoxDecoration(
                                         color: Color(0xFF0891B2),
                                         shape: BoxShape.circle,
                                      ),
                                      child: Center(child: Text(avatar, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800))),
                                    ),
                                    const SizedBox(width: 8),
                                    Flexible(child: Text(teacher, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppTheme.t3), overflow: TextOverflow.ellipsis)),
                                 ],
                               ),
                            ),
                            const SizedBox(width: 8),
                            Row(
                               children: [
                                  Text(emoji, style: const TextStyle(fontSize: 14)),
                                  const SizedBox(width: 10),
                                  Container(
                                     padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                     decoration: BoxDecoration(
                                        color: badgeBg,
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: badgeBg.withOpacity(0.5)),
                                     ),
                                     child: Row(
                                        children: [
                                           Icon(Icons.check, size: 10, color: badgeText),
                                           const SizedBox(width: 4),
                                           Text('Acknowledge', style: TextStyle(color: badgeText, fontSize: 9.5, fontWeight: FontWeight.w700)),
                                        ],
                                     )
                                  )
                               ],
                            )
                         ],
                       )
                    ],
                  ),
                ),
              ),
              // Unread Dot
              Positioned(
                 top: 14,
                 right: 14,
                 child: Container(
                    width: 7, height: 7,
                    decoration: const BoxDecoration(
                       color: AppTheme.peachAcc,
                       shape: BoxShape.circle,
                       boxShadow: [BoxShadow(color: Color(0x66F97316), blurRadius: 4, offset: Offset(0, 0))]
                    ),
                 )
              )
            ],
          ),
        ),
      ],
    );
  }

  Widget _parseNoteContent(String htmlContent) {
    if (!htmlContent.contains('<em>') && !htmlContent.contains('<b>') && !htmlContent.contains('<strong>')) {
       return Text(htmlContent, style: const TextStyle(fontSize: 13, height: 1.5, color: AppTheme.t1, fontWeight: FontWeight.w500));
    }
    
    // Very simple bold parser for <em>, <b> or <strong> tags from the mock data response.
    final spanList = <TextSpan>[];
    String currentText = htmlContent;
    
    while(currentText.isNotEmpty) {
       int emStart = currentText.indexOf('<em>');
       if (emStart == -1) emStart = currentText.indexOf('<b>');
       if (emStart == -1) emStart = currentText.indexOf('<strong>');

       if (emStart == -1) {
          spanList.add(TextSpan(text: currentText, style: const TextStyle(fontSize: 13, height: 1.5, color: AppTheme.t1, fontWeight: FontWeight.w500)));
          break;
       }

       if (emStart > 0) {
          spanList.add(TextSpan(text: currentText.substring(0, emStart), style: const TextStyle(fontSize: 13, height: 1.5, color: AppTheme.t1, fontWeight: FontWeight.w500)));
       }

       // Find the close tag dynamically
       String openTag = currentText.substring(emStart, currentText.indexOf('>', emStart) + 1);
       String closeTag = '</${openTag.substring(1)}';

       int emEnd = currentText.indexOf(closeTag, emStart + openTag.length);
       if (emEnd != -1) {
          spanList.add(TextSpan(
             text: currentText.substring(emStart + openTag.length, emEnd), 
             style: const TextStyle(fontSize: 13, height: 1.5, color: AppTheme.t1, fontWeight: FontWeight.w800)
          ));
          currentText = currentText.substring(emEnd + closeTag.length);
       } else {
          spanList.add(TextSpan(text: currentText.substring(emStart), style: const TextStyle(fontSize: 13, height: 1.5, color: AppTheme.t1, fontWeight: FontWeight.w500)));
          break;
       }
    }

    return RichText(text: TextSpan(children: spanList));
  }
}
