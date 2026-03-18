import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/state/auth_state.dart';
import '../../core/theme/app_theme.dart';

// ─── Model ────────────────────────────────────────────────────────────────────

class ClassAttendanceStat {
  final String classroomId;
  final String className;
  final int totalStudents;
  final int presentCount;
  final int absentCount;
  final int lateCount;

  ClassAttendanceStat({
    required this.classroomId,
    required this.className,
    required this.totalStudents,
    required this.presentCount,
    required this.absentCount,
    required this.lateCount,
  });

  double get presentPct => totalStudents > 0 ? presentCount / totalStudents : 0;
  int get unmarked => totalStudents - presentCount - absentCount - lateCount;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

final classAttendanceProvider = FutureProvider.autoDispose<List<ClassAttendanceStat>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) return [];

  final today = DateTime.now();
  final dateStr =
      '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';

  // Step 1: Get classrooms where teacher is class teacher
  final classRes = await http.get(
    Uri.parse('http://localhost:3000/api/mobile/v1/staff/attendance/classrooms'),
    headers: {'Authorization': 'Bearer ${user!.token}'},
  );
  if (classRes.statusCode != 200) return [];
  final classData = jsonDecode(classRes.body);
  if (classData['success'] != true) return [];

  final myClasses = (classData['classrooms'] as List)
      .where((c) => c['isClassTeacher'] == true)
      .toList();
  if (myClasses.isEmpty) return [];

  final slug = user.schoolSlug.isNotEmpty
      ? user.schoolSlug
      : user.schoolName.toLowerCase().replaceAll(RegExp(r'\s+'), '');

  // Step 2: Fetch attendance stats for each class in parallel
  final results = await Future.wait(myClasses.map((cls) async {
    try {
      final studRes = await http.get(
        Uri.parse(
          'http://localhost:3000/api/mobile/v1/staff/attendance/students'
          '?classroomId=${cls['id']}&date=$dateStr&slug=$slug',
        ),
        headers: {'Authorization': 'Bearer ${user.token}'},
      );
      if (studRes.statusCode != 200) return null;
      final studData = jsonDecode(studRes.body);
      if (studData['success'] != true) return null;

      final students = studData['students'] as List? ?? [];
      int present = 0, absent = 0, late = 0;
      for (final s in students) {
        final status = s['status'] ?? s['todayStatus'] ?? '';
        if (status == 'PRESENT') present++;
        else if (status == 'ABSENT') absent++;
        else if (status == 'LATE') late++;
      }

      return ClassAttendanceStat(
        classroomId: cls['id'],
        className: cls['name'],
        totalStudents: students.length,
        presentCount: present,
        absentCount: absent,
        lateCount: late,
      );
    } catch (_) {
      return null;
    }
  }));

  return results.whereType<ClassAttendanceStat>().toList();
});

// ─── Main Widget ──────────────────────────────────────────────────────────────

class ClassAttendanceHero extends ConsumerStatefulWidget {
  const ClassAttendanceHero({super.key});

  @override
  ConsumerState<ClassAttendanceHero> createState() => _ClassAttendanceHeroState();
}

class _ClassAttendanceHeroState extends ConsumerState<ClassAttendanceHero> {
  final PageController _pageController = PageController(viewportFraction: 0.92);
  int _currentPage = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final stats = ref.watch(classAttendanceProvider);

    return stats.when(
      loading: () => _buildSkeleton(),
      error: (_, __) => _buildError(),
      data: (list) {
        if (list.isEmpty) return _buildEmpty();
        if (list.length == 1) {
          return _buildCard(list[0]);
        }

        // Carousel for multiple classes — swipe only, no auto-play
        return Column(
          children: [
            SizedBox(
              height: 164,
              child: PageView.builder(
                controller: _pageController,
                padEnds: false,
                itemCount: list.length,
                onPageChanged: (i) => setState(() => _currentPage = i),
                itemBuilder: (_, i) => Padding(
                  padding: EdgeInsets.only(right: i < list.length - 1 ? 12 : 0),
                  child: _buildCard(list[i]),
                ),
              ),
            ),
            const SizedBox(height: 10),
            // Dot indicators
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(list.length, (i) {
                final isActive = i == _currentPage;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: isActive ? 20 : 6,
                  height: 6,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(3),
                    gradient: isActive ? AppTheme.teacherTheme : null,
                    color: isActive ? null : const Color(0xFFD1C9E8),
                  ),
                );
              }),
            ),
          ],
        );
      },
    );
  }

  Widget _buildCard(ClassAttendanceStat stat) {
    final pct = stat.presentPct;
    final pctText = '${(pct * 100).toStringAsFixed(1)}%';

    return Container(
      height: 164,
      decoration: BoxDecoration(
        gradient: AppTheme.teacherTheme,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppTheme.teacherTheme.colors.first.withOpacity(0.35),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Subtle pattern overlay
          Positioned.fill(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: CustomPaint(painter: _DiamondPatternPainter()),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header chip
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.22),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.bar_chart_rounded, color: Colors.white, size: 13),
                          const SizedBox(width: 4),
                          Text(
                            '${stat.className.toUpperCase()} · TODAY'.replaceAll(' - ', '-'),
                            style: const TextStyle(
                              fontFamily: 'Space Mono',
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    // Refresh button
                    GestureDetector(
                      onTap: () => ref.invalidate(classAttendanceProvider),
                      child: Container(
                        padding: const EdgeInsets.all(5),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.18),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.refresh_rounded, color: Colors.white, size: 14),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 10),

                // Big number row
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${stat.presentCount + stat.lateCount}',
                      style: const TextStyle(
                        fontFamily: 'Clash Display',
                        fontSize: 44,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        height: 1,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6, left: 6),
                      child: Text(
                        '/ ${stat.totalStudents}',
                        style: TextStyle(
                          fontFamily: 'Satoshi',
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withOpacity(0.65),
                        ),
                      ),
                    ),
                  ],
                ),

                Text(
                  '$pctText present · ${stat.absentCount} absent${stat.lateCount > 0 ? ' · ${stat.lateCount} late' : ''}${stat.unmarked > 0 ? ' · ${stat.unmarked} unmarked' : ''}',
                  style: TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.8),
                  ),
                ),

                const Spacer(),

                // Progress bar
                Stack(
                  children: [
                    Container(
                      height: 5,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.25),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    FractionallySizedBox(
                      widthFactor: pct.clamp(0.0, 1.0),
                      child: Container(
                        height: 5,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.white.withOpacity(0.5),
                              blurRadius: 6,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('0%',
                      style: TextStyle(fontFamily: 'Space Mono', fontSize: 9, color: Colors.white.withOpacity(0.5))),
                    Text(pctText,
                      style: const TextStyle(fontFamily: 'Space Mono', fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white)),
                    Text('100%',
                      style: TextStyle(fontFamily: 'Space Mono', fontSize: 9, color: Colors.white.withOpacity(0.5))),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSkeleton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        height: 164,
        decoration: BoxDecoration(
          gradient: AppTheme.teacherTheme,
          borderRadius: BorderRadius.circular(24),
        ),
        child: const Center(
          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        height: 120,
        decoration: BoxDecoration(
          color: const Color(0xFFF5F3FF),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFE2D9F3)),
        ),
        child: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.class_outlined, color: Color(0xFFD1C9E8), size: 28),
              SizedBox(height: 6),
              Text(
                'Not assigned as class teacher',
                style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, color: Color(0xFF7B7291)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildError() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        height: 80,
        decoration: BoxDecoration(
          color: const Color(0xFFFEF2F2),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Center(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.wifi_off_rounded, color: Color(0xFFDC2626), size: 16),
              const SizedBox(width: 8),
              const Text('Could not load attendance data',
                style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, color: Color(0xFFDC2626))),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () => ref.invalidate(classAttendanceProvider),
                child: const Icon(Icons.refresh_rounded, color: Color(0xFFDC2626), size: 16),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Diamond Pattern Painter ──────────────────────────────────────────────────

class _DiamondPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.06)
      ..strokeWidth = 0.8
      ..style = PaintingStyle.stroke;

    const spacing = 16.0;
    for (double x = 0; x < size.width + spacing; x += spacing) {
      for (double y = 0; y < size.height + spacing; y += spacing) {
        final path = Path()
          ..moveTo(x, y - spacing / 2)
          ..lineTo(x + spacing / 2, y)
          ..lineTo(x, y + spacing / 2)
          ..lineTo(x - spacing / 2, y)
          ..close();
        canvas.drawPath(path, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
