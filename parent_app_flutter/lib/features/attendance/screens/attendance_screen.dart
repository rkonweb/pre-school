import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:parent_app_flutter/core/theme/app_theme.dart';
import '../services/attendance_service.dart';
import 'package:intl/intl.dart';
import 'package:parent_app_flutter/features/dashboard/screens/shell_screen.dart' as parent_app_flutter;

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({Key? key}) : super(key: key);

  @override
  _AttendanceScreenState createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  DateTime _currentMonth = DateTime.now();
  Map<String, dynamic>? _attendanceData;
  bool _isLoading = true;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
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

      final data = await AttendanceService.fetchAttendance(
        studentId, 
        month: _currentMonth.month, 
        year: _currentMonth.year
      );
      
      setState(() {
        _attendanceData = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _selectMonth(DateTime month) {
    setState(() {
      _currentMonth = month;
    });
    _loadData();
  }

  void _nextMonth() {
    _selectMonth(DateTime(_currentMonth.year, _currentMonth.month + 1, 1));
  }

  void _prevMonth() {
    _selectMonth(DateTime(_currentMonth.year, _currentMonth.month - 1, 1));
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFFEBEBF0), 
        body: Center(child: CircularProgressIndicator(color: AppTheme.a1))
      );
    }

    if (_errorMessage.isNotEmpty) {
      return Scaffold(
        backgroundColor: const Color(0xFFEBEBF0),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(_errorMessage, style: const TextStyle(color: Colors.red)),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => _loadData(),
                icon: const Icon(Icons.refresh, size: 18),
                label: const Text('Retry'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.a1,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final summary = _attendanceData?['summary'] ?? {};
    final records = (_attendanceData?['records'] as List<dynamic>?) ?? [];
    
    final int present = summary['present'] ?? 0;
    final int absent = summary['absent'] ?? 0;
    final int late = summary['late'] ?? 0;
    final int holiday = summary['halfDay'] ?? 0; 
    
    final int totalWorking = present + absent + late;
    final double pct = totalWorking > 0 ? (present / totalWorking) * 100 : 0;

    return Scaffold(
      backgroundColor: const Color(0xFFEBEBF0), // match --surface / canvas
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 120),
        child: Column(
          children: [
            _buildHeader(pct, present, absent, late, holiday),
            _buildMonthChips(),
            _buildCalendar(records),
            const SizedBox(height: 16),
            _buildLeaveButton(),
            _buildAbsenceLog(records),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(double pct, int present, int absent, int late, int holiday) {
    final monthStr = DateFormat('MMMM yyyy').format(_currentMonth);

    return Container(
      decoration: const BoxDecoration(
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF0C4A6E), Color(0xFF0369A1), Color(0xFF0891B2)],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
          child: Column(
            children: [
              // Extra space for phone icons (battery, tower, etc.)
              const SizedBox(height: 15),
              // Top Nav Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
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
                        child: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Attendance',
                        style: TextStyle(
                          fontFamily: 'Outfit', // matching var(--fd)
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.20),
                      border: Border.all(color: Colors.white.withOpacity(0.28)),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: _prevMonth,
                          child: const Icon(Icons.chevron_left, color: Colors.white, size: 18),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          monthStr,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            letterSpacing: 0.3,
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: _nextMonth,
                          child: const Icon(Icons.chevron_right, color: Colors.white, size: 18),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              // Summary Ring + Stats Box
              Row(
                children: [
                  // Ring Wrap
                  SizedBox(
                    width: 72,
                    height: 72,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        CircularProgressIndicator(
                          value: pct / 100,
                          strokeWidth: 6,
                          backgroundColor: Colors.white.withOpacity(0.2),
                          valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                        Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                '${pct.toStringAsFixed(1)}%',
                                style: const TextStyle(
                                  fontFamily: 'Outfit',
                                  fontSize: 16,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                  height: 1.1,
                                ),
                              ),
                              const Text(
                                'PRESENT',
                                style: TextStyle(
                                  fontSize: 7,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white70,
                                  letterSpacing: 0.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 14),
                  // Stats Grid
                  Expanded(
                    child: GridView.count(
                      crossAxisCount: 2,
                      mainAxisSpacing: 7,
                      crossAxisSpacing: 7,
                      childAspectRatio: 2.2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      padding: EdgeInsets.zero,
                      children: [
                        _buildStatPill('Present', present.toString()),
                        _buildStatPill('Absent', absent.toString()),
                        _buildStatPill('Late', late.toString()),
                        _buildStatPill('Holiday', holiday.toString()),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatPill(String label, String value) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.18),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.25)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            value,
            style: const TextStyle(
              fontFamily: 'Outfit',
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              height: 1.0,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 8,
              fontWeight: FontWeight.w600,
              color: Colors.white70,
              letterSpacing: 0.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMonthChips() {
    // Generate a list of 6 months ending with current real month (+ maybe next)
    final now = DateTime.now();
    final List<DateTime> months = [];
    for (int i = 5; i >= 0; i--) {
      months.add(DateTime(now.year, now.month - i, 1));
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 4),
      child: Row(
        children: months.map((m) {
          final isSelected = m.month == _currentMonth.month && m.year == _currentMonth.year;
          return Padding(
            padding: const EdgeInsets.only(right: 6),
            child: GestureDetector(
              onTap: () => _selectMonth(m),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 5),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF0891B2) : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: isSelected ? null : Border.all(color: const Color(0xFFE5E7EB), width: 1.5),
                  boxShadow: isSelected
                      ? [const BoxShadow(color: Color(0x520891B2), blurRadius: 12, offset: Offset(0, 3))]
                      : [],
                ),
                child: Text(
                  DateFormat('MMM').format(m),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: isSelected ? Colors.white : AppTheme.t3,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildCalendar(List<dynamic> records) {
    int daysInMonth = DateTime(_currentMonth.year, _currentMonth.month + 1, 0).day;
    DateTime firstDay = DateTime(_currentMonth.year, _currentMonth.month, 1);
    int firstWeekday = firstDay.weekday; 
    
    // Map of day -> status
    Map<int, String> statusMap = {};
    for (var r in records) {
      final dStr = r['date'] as String?;
      if (dStr != null) {
        final d = DateTime.tryParse(dStr);
        if (d != null && d.month == _currentMonth.month) {
          statusMap[d.day] = r['status'];
        }
      }
    }

    List<Widget> dayWidgets = [];
    
    // Offset for week starting on Monday
    int offset = firstWeekday - 1; 
    for(int i = 0; i < offset; i++) {
      dayWidgets.add(const SizedBox.shrink());
    }

    final today = DateTime.now();

    for(int i = 1; i <= daysInMonth; i++) {
        String? status = statusMap[i];
        final isToday = today.day == i && today.month == _currentMonth.month && today.year == _currentMonth.year;
        final weekday = DateTime(_currentMonth.year, _currentMonth.month, i).weekday;
        final isWeekend = weekday == 6 || weekday == 7;

        Color bgColor = Colors.transparent;
        Color fgColor = AppTheme.t3;
        Color borderColor = Colors.transparent;
        Border? border;

        if (isToday) {
          bgColor = const Color(0xFF0891B2);
          fgColor = Colors.white;
        } else if (status == 'PRESENT') {
          bgColor = const Color(0x1E059669); // 12% opacity
          fgColor = AppTheme.sageAcc;
          border = Border.all(color: const Color(0x38059669)); // 22%
        } else if (status == 'ABSENT') {
          bgColor = const Color(0x19E11D48); // 10%
          fgColor = AppTheme.roseAcc;
          border = Border.all(color: const Color(0x38E11D48)); // 22%
        } else if (status == 'LATE') {
          bgColor = const Color(0x19E11D48); // mapped to an indicator usually, using absent color logic or peach
          fgColor = AppTheme.peachAcc;
          border = Border.all(color: const Color(0x38E11D48));
        } else if (status == 'HOLIDAY' || status == 'HALF_DAY') {
          bgColor = const Color(0x19FFD600); // 10%
          fgColor = AppTheme.goldAcc;
          border = Border.all(color: const Color(0x33FFD600)); // 20%
        } else if (isWeekend) {
          fgColor = AppTheme.t4.withOpacity(0.55);
        }

        dayWidgets.add(
          Container(
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(8),
              border: border,
              boxShadow: isToday ? const [BoxShadow(color: Color(0x590891B2), blurRadius: 12, offset: Offset(0,3))] : null,
            ),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Center(
                  child: Text(
                    i.toString(), 
                    style: TextStyle(
                      fontWeight: FontWeight.w700, 
                      fontSize: 9.5, 
                      color: fgColor
                    )
                  )
                ),
                if (status == 'LATE')
                  Positioned(
                    bottom: 1, left: 0, right: 0,
                    child: Center(
                      child: Container(
                        width: 3, height: 3,
                        decoration: const BoxDecoration(color: AppTheme.goldAcc, shape: BoxShape.circle),
                      ),
                    ),
                  ),
              ],
            )
          )
        );
    }

    return Container(
      margin: const EdgeInsets.only(top: 8, left: 16, right: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 4, offset: Offset(0, 2))],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                DateFormat('MMMM yyyy').format(_currentMonth), 
                style: const TextStyle(fontFamily: 'Outfit', fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.t1)
              ),
              Row(
                children: [
                  _buildLegendDot(AppTheme.sageAcc, 'Present'),
                  const SizedBox(width: 8),
                  _buildLegendDot(AppTheme.roseAcc, 'Absent'),
                  const SizedBox(width: 8),
                  _buildLegendDot(AppTheme.goldAcc, 'Holiday'),
                ],
              )
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: const [
              _DowText("M"), _DowText("T"), _DowText("W"), _DowText("T"), _DowText("F"), _DowText("S"), _DowText("S"),
            ],
          ),
          const SizedBox(height: 4),
          GridView.count(
            crossAxisCount: 7,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 3,
            crossAxisSpacing: 3,
            children: dayWidgets,
          )
        ],
      ),
    );
  }

  Widget _buildLegendDot(Color color, String label) {
    return Row(
      children: [
        Container(
          width: 7, height: 7,
          decoration: BoxDecoration(shape: BoxShape.circle, color: color),
        ),
        const SizedBox(width: 3),
        Text(
          label,
          style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.w600, color: AppTheme.t3),
        )
      ],
    );
  }

  Widget _buildLeaveButton() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF0891B2),
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [BoxShadow(color: Color(0x590891B2), blurRadius: 22, offset: Offset(0, 6))],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Apply Leave functionality coming soon!")));
          },
          child: Padding(
            padding: const EdgeInsets.all(14.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.edit_calendar, color: Colors.white, size: 16),
                SizedBox(width: 8),
                Text(
                  'Apply Leave / Notify Absence',
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAbsenceLog(List<dynamic> records) {
    final List<dynamic> logRecords = records.where((r) {
      final status = r['status'];
      return status == 'ABSENT' || status == 'LATE' || status == 'HALF_DAY' || status == 'HOLIDAY';
    }).toList();

    logRecords.sort((a, b) {
      final da = DateTime.tryParse(a['date'] ?? '') ?? DateTime(1970);
      final db = DateTime.tryParse(b['date'] ?? '') ?? DateTime(1970);
      return db.compareTo(da);
    });

    if (logRecords.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            'Absence Log',
            style: TextStyle(
              fontFamily: 'Outfit',
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: AppTheme.t1,
            ),
          ),
        ),
        ...logRecords.map((r) => _buildAbsenceLogCard(r)).toList(),
      ],
    );
  }

  Widget _buildAbsenceLogCard(dynamic record) {
    final status = record['status'] as String? ?? '';
    final notes = record['notes'] as String? ?? '';
    
    DateTime? d = DateTime.tryParse(record['date'] ?? '');
    String dateStr = d != null ? DateFormat('EEE, MMM d').format(d) : 'Unknown';

    String icon = '📅';
    String reason = notes.isNotEmpty ? notes : 'Marked by teacher';
    String typeTag = 'Absence';
    Color tagBgColor = const Color(0x1AE11D48);
    Color tagColor = AppTheme.roseAcc;
    Color borderLeftColor = AppTheme.roseAcc;

    if (status == 'ABSENT') {
      icon = '🤒';
      typeTag = 'Absent';
      if (notes.isEmpty) reason = 'Absent — No reason provided';
    } else if (status == 'LATE') {
      icon = '⏰';
      typeTag = 'Late';
      tagBgColor = const Color(0x1AEAB308);
      tagColor = AppTheme.goldAcc;
      borderLeftColor = AppTheme.goldAcc;
      if (notes.isEmpty) reason = 'Arrived late';
    } else if (status == 'HOLIDAY' || status == 'HALF_DAY') {
      icon = '🎊';
      typeTag = 'Holiday';
      tagBgColor = const Color(0x1AEAB308);
      tagColor = AppTheme.goldAcc;
      borderLeftColor = AppTheme.goldAcc;
      if (notes.isEmpty) reason = 'School Holiday';
    }

    return Container(
      margin: const EdgeInsets.only(left: 16, right: 16, bottom: 8),
      clipBehavior: Clip.hardEdge,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: const [BoxShadow(color: Color(0x08000000), blurRadius: 4, offset: Offset(0, 2))],
      ),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(width: 3, color: borderLeftColor),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                child: Row(
                  children: [
                    Container(
                      width: 34, height: 34,
                      decoration: BoxDecoration(
                        color: tagBgColor,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: Text(icon, style: const TextStyle(fontSize: 16)),
                    ),
                    const SizedBox(width: 11),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            dateStr, 
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.t1)
                          ),
                          const SizedBox(height: 2),
                          Text(
                            reason, 
                            style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w500, color: AppTheme.t3),
                            maxLines: 1, 
                            overflow: TextOverflow.ellipsis,
                          )
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: tagBgColor,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        typeTag,
                        style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w700, color: tagColor),
                      ),
                    )
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}

class _DowText extends StatelessWidget {
  final String label;
  const _DowText(this.label);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Text(
        label,
        textAlign: TextAlign.center,
        style: const TextStyle(
          fontSize: 8,
          fontWeight: FontWeight.w700,
          color: AppTheme.t4,
        ),
      ),
    );
  }
}
