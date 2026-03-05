import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../data/diary_provider.dart';

class DiaryScreen extends ConsumerStatefulWidget {
  const DiaryScreen({super.key});

  @override
  ConsumerState<DiaryScreen> createState() => _DiaryScreenState();
}

class _DiaryScreenState extends ConsumerState<DiaryScreen> {
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(diaryProvider);
    final studentInfo = state.data['studentInfo'] ?? {};
    final subtitle = '${studentInfo['name'] ?? 'Emma'} · ${studentInfo['className'] ?? 'Grade 8B'}';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppHeader(
        title: 'Diary',
        subtitle: subtitle,
        actions: [
          ElevatedButton(
            onPressed: () {},
            style: AppTheme.headerButtonStyle(),
            child: const Icon(Icons.tune_rounded, size: 20),
          ),
        ],
      ),
      body: state.isLoading && state.data.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : state.error != null && state.data.isEmpty
              ? Center(child: Text(state.error!))
              : RefreshIndicator(
                  onRefresh: () => ref.read(diaryProvider.notifier).loadData(),
                  child: ListView(
                    padding: const EdgeInsets.only(bottom: 120),
                    children: [
                      const SizedBox(height: 10),
                      _buildDateStrip(state),
                      _buildFilterChips(state),
                      _buildContent(state),
                    ],
                  ),
                ),
    );
  }

  Widget _buildDateStrip(DiaryState state) {
    final dates = List.generate(7, (i) => state.selectedDate.subtract(Duration(days: state.selectedDate.weekday - 1)).add(Duration(days: i)));
    
    return Container(
      height: 70,
      margin: const EdgeInsets.only(bottom: 24),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: dates.length,
        itemBuilder: (context, index) {
          final date = dates[index];
          final isSelected = date.year == state.selectedDate.year && date.month == state.selectedDate.month && date.day == state.selectedDate.day;
          
          return GestureDetector(
            onTap: () => ref.read(diaryProvider.notifier).setDate(date),
            child: Container(
              width: 50,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF1E293B) : Colors.transparent,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isSelected ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(DateFormat('E').format(date).substring(0, 3), style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: isSelected ? Colors.white70 : const Color(0xFF64748B))),
                  const SizedBox(height: 2),
                  Text(date.day.toString(), style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : AppTheme.textPrimary)),
                  if (!isSelected) const SizedBox(height: 4),
                  if (!isSelected) Container(width: 4, height: 4, decoration: const BoxDecoration(color: Color(0xFFE2E8F0), shape: BoxShape.circle))
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFilterChips(DiaryState state) {
    final filters = ['All', 'Homework', 'Timetable', 'Marks', 'Notices'];
    final active = state.activeFilter;

    return SizedBox(
      height: 36,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: filters.length,
        itemBuilder: (context, index) {
          final filter = filters[index];
          final isAct = filter == active;
          final icon = filter == 'All' ? '📋' : filter == 'Homework' ? '📚' : filter == 'Timetable' ? '📅' : filter == 'Marks' ? '🏆' : '📣';

          return GestureDetector(
            onTap: () => ref.read(diaryProvider.notifier).setFilter(filter),
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: isAct ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isAct ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  Text(icon, style: const TextStyle(fontSize: 12)),
                  const SizedBox(width: 6),
                  Text(filter, style: GoogleFonts.dmSans(fontSize: 13, fontWeight: FontWeight.w600, color: isAct ? Colors.white : AppTheme.textSecondary)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildContent(DiaryState state) {
    final filter = state.activeFilter;
    List<Widget> sections = [];

    if (filter == 'All' || filter == 'Homework') sections.add(_buildHomeworkSection(state));
    if (filter == 'All' || filter == 'Timetable') sections.add(_buildTimetableSection(state));
    if (filter == 'All' || filter == 'Marks') sections.add(_buildMarksSection(state));
    if (filter == 'All') sections.add(_buildTeacherRemarks(state));
    if (filter == 'All') sections.add(_buildWeeklyProgress(state));
    if (filter == 'All' || filter == 'Notices') sections.add(_buildNotices(state));
    if (filter == 'All') sections.add(_buildUpcomingEvents(state));
    if (filter == 'All') sections.add(_buildMoodTracker(state));

    return Column(children: sections);
  }

  Widget _buildSectionHeader(String title, String actionLabel) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 32, 20, 16),
      child: Row(
        children: [
          Text(title, style: GoogleFonts.sora(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
          const SizedBox(width: 12),
          Expanded(child: Container(height: 1, color: const Color(0xFFE2E8F0))),
          const SizedBox(width: 12),
          Text(actionLabel, style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF3B6EF8))),
        ],
      ),
    );
  }

  Widget _buildHomeworkSection(DiaryState state) {
    final hws = state.data['homeworks'] as List? ?? [];
    if (hws.isEmpty) return const SizedBox();

    return Column(
      children: [
        _buildSectionHeader("Today's Homework", "+ Add"),
        ...hws.map((hw) {
          final i = hws.indexOf(hw);
          final colors = [
            [const Color(0xFFEF4444), const Color(0xFFF97316)],
            [const Color(0xFF3B6EF8), const Color(0xFF00C9A7)],
            [const Color(0xFF8B5CF6), const Color(0xFFEC4899)],
          ][i % 3];

          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))],
            ),
            clipBehavior: Clip.antiAlias,
            child: IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(width: 4, decoration: BoxDecoration(gradient: LinearGradient(colors: colors, begin: Alignment.topCenter, end: Alignment.bottomCenter))),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: colors[0].withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                                child: Text('📝', style: TextStyle(fontSize: 16, color: colors[0])),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(hw['subject']['name'] ?? 'Subject', style: GoogleFonts.sora(fontSize: 12, fontWeight: FontWeight.bold, color: colors[0])),
                                    Text(hw['title'] ?? '', style: GoogleFonts.dmSans(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary), maxLines: 2, overflow: TextOverflow.ellipsis),
                                  ],
                                ),
                              ),
                              Container(
                                width: 24,
                                height: 24,
                                padding: const EdgeInsets.all(2),
                                decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0xFFE2E8F0), width: 2)),
                                child: const Icon(Icons.check, size: 14, color: Colors.transparent),
                              )
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(hw['desc'] ?? '', style: GoogleFonts.dmSans(fontSize: 13, color: AppTheme.textSecondary, height: 1.4)),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Progress', style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
                              Text('${hw['completion']}%', style: GoogleFonts.sora(fontSize: 11, fontWeight: FontWeight.bold, color: colors[0])),
                            ],
                          ),
                          const SizedBox(height: 6),
                          LinearProgressIndicator(
                            value: hw['completion'] / 100,
                            backgroundColor: const Color(0xFFF1F5F9),
                            valueColor: AlwaysStoppedAnimation<Color>(colors[0]),
                            borderRadius: BorderRadius.circular(4),
                            minHeight: 6,
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  if (hw['overdue'] == true || hw['due']?.contains('Today'))
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(6)),
                                      child: Text('⚠ Due Today', style: GoogleFonts.dmSans(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFFEF4444))),
                                    ),
                                ],
                              ),
                              Text(hw['due'] ?? '', style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: hw['overdue'] ? const Color(0xFFEF4444) : AppTheme.textSecondary)),
                            ],
                          )
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ).animate().fadeIn(delay: (i * 100).ms).slideY(begin: 0.1);
        }).toList()
      ],
    );
  }

  Widget _buildTimetableSection(DiaryState state) {
    final tt = state.data['timetable'] as List? ?? [];
    if (tt.isEmpty) return const SizedBox();

    return Column(
      children: [
        _buildSectionHeader("Today's Timetable", "Full Schedule"),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.grid_view_rounded, size: 18, color: AppTheme.textPrimary),
                        const SizedBox(width: 8),
                        Text('Wednesday Schedule', style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                      ],
                    ),
                    Text('8:00 AM — 3:00 PM', style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
                  ],
                ),
              ),
              const Divider(height: 1),
              ...tt.map((item) {
                final isCurrent = item['isCurrent'] == true;
                final isDone = item['isDone'] == true;
                final isLunch = item['subject'] == 'Lunch Break';

                final timeParts = item['time'].toString().split(' - ');
                final time1 = timeParts.isNotEmpty ? timeParts[0].replaceAll(' AM', '').replaceAll(' PM', '') : '';
                final time2 = timeParts.length > 1 ? timeParts[1].replaceAll(' AM', '').replaceAll(' PM', '') : '';

                return Container(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  color: isLunch ? const Color(0xFFF8FAFC) : Colors.transparent,
                  child: Row(
                    children: [
                      SizedBox(
                        width: 45,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(time1, style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.bold, color: isCurrent ? AppTheme.primaryColor : AppTheme.textSecondary)),
                            Text(time2, style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8))),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        width: 4,
                        height: 40,
                        decoration: BoxDecoration(
                          color: isCurrent ? AppTheme.primaryColor : isDone ? AppTheme.primaryColor.withOpacity(0.4) : isLunch ? const Color(0xFFCBD5E1) : const Color(0xFFF5A623),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(item['subject'], style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: isLunch ? AppTheme.textSecondary : AppTheme.textPrimary)),
                                if (isCurrent) ...[
                                  const SizedBox(width: 8),
                                  Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: AppTheme.primaryColor, borderRadius: BorderRadius.circular(10)), child: const Text('● Now', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold))),
                                ]
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(item['teacher'], style: GoogleFonts.dmSans(fontSize: 12, color: AppTheme.textSecondary)),
                          ],
                        ),
                      ),
                      Text(item['room'], style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.bold, color: isLunch ? AppTheme.textSecondary : AppTheme.textPrimary)),
                    ],
                  ),
                );
              }).toList()
            ],
          ),
        )
      ],
    );
  }

  Widget _buildMarksSection(DiaryState state) {
    final marks = state.data['recentMarks'] as List? ?? [];
    if (marks.isEmpty) return const SizedBox();

    return Column(
      children: [
        _buildSectionHeader("Recent Test Marks", "View All"),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.star_rounded, size: 20, color: Color(0xFFF5A623)),
                        const SizedBox(width: 8),
                        Text('Test Results — This Week', style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                      ],
                    ),
                    Text('Avg 87%', style: GoogleFonts.sora(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF00C9A7))),
                  ],
                ),
              ),
              const Divider(height: 1),
              ...marks.map((mark) {
                final colors = [const Color(0xFF3B6EF8), const Color(0xFF00C9A7), const Color(0xFF8B5CF6), const Color(0xFFF5A623)][marks.indexOf(mark) % 4];
                final double pct = mark['score'] / mark['total'];
                return Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(mark['subject'], style: GoogleFonts.sora(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                            Text('${mark['test']} · ${mark['date']}', style: GoogleFonts.dmSans(fontSize: 11, color: AppTheme.textSecondary)),
                          ],
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: LinearProgressIndicator(
                          value: pct,
                          backgroundColor: colors.withOpacity(0.1),
                          valueColor: AlwaysStoppedAnimation<Color>(colors),
                          borderRadius: BorderRadius.circular(4),
                          minHeight: 6,
                        ),
                      ),
                      const SizedBox(width: 16),
                      SizedBox(
                        width: 30,
                        child: Text('${mark['score']}', style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: colors), textAlign: TextAlign.right),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: colors.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                        child: Text(mark['grade'], style: GoogleFonts.sora(fontSize: 12, fontWeight: FontWeight.bold, color: colors)),
                      )
                    ],
                  ),
                );
              }).toList()
            ],
          ),
        )
      ],
    );
  }

  Widget _buildTeacherRemarks(DiaryState state) {
    final remarks = state.data['teacherRemarks'] as List? ?? [];
    if (remarks.isEmpty) return const SizedBox();

    return Column(
      children: [
        _buildSectionHeader("Teacher Remarks", ""),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.chat_bubble_outline_rounded, size: 16, color: Colors.white),
                        const SizedBox(width: 8),
                        Text('Teacher Feedback', style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                      ],
                    ),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(10)), child: const Text('2 New', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold))),
                  ],
                ),
              ),
              ...remarks.map((rem) {
                final colors = [const Color(0xFF3B6EF8), const Color(0xFF10B981)][remarks.indexOf(rem) % 2];
                return Container(
                  margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(12)),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 36, height: 36,
                            decoration: BoxDecoration(color: colors, shape: BoxShape.circle),
                            alignment: Alignment.center,
                            child: Text(rem['initial'], style: GoogleFonts.sora(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(rem['teacher'], style: GoogleFonts.sora(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
                                Text(rem['subject'], style: GoogleFonts.dmSans(fontSize: 11, color: Colors.white70)),
                              ],
                            ),
                          )
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text('"${rem['remark']}"', style: GoogleFonts.dmSans(fontSize: 13, color: Colors.white, height: 1.5, fontStyle: FontStyle.italic)),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(children: List.generate(5, (i) => Icon(Icons.star_rounded, size: 16, color: i < rem['stars'] ? const Color(0xFFF5A623) : Colors.white24))),
                          Text('${rem['mood']} · ${rem['date']}', style: GoogleFonts.dmSans(fontSize: 11, color: Colors.white54)),
                        ],
                      )
                    ],
                  ),
                );
              }).toList()
            ],
          ),
        )
      ],
    );
  }

  Widget _buildWeeklyProgress(DiaryState state) {
    final stats = state.data['weeklyStats'];
    if (stats == null) return const SizedBox();

    return Column(
      children: [
        _buildSectionHeader("This Week's Progress", ""),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(children: [const Text('📊', style: TextStyle(fontSize: 16)), const SizedBox(width: 8), Text('Weekly Overview', style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary))]),
                  Text('Nov 18 - 22', style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
                ],
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildProgressRing('Homework', stats['homework'], const Color(0xFF3B6EF8)),
                  _buildProgressRing('Attendance', stats['attendance'], const Color(0xFF00C9A7)),
                  _buildProgressRing('Test Avg', stats['testAvg'], const Color(0xFFF5A623)),
                  _buildProgressRing('Behaviour', stats['behaviour'], const Color(0xFF8B5CF6)),
                  _buildProgressRing('Participation', stats['participation'], const Color(0xFFEC4899)),
                ],
              )
            ],
          ),
        )
      ],
    );
  }

  Widget _buildProgressRing(String label, int pct, Color color) {
    return Column(
      children: [
        SizedBox(
          width: 50, height: 50,
          child: CustomPaint(
            painter: _DiaryMoodPainter(pct.toDouble(), color),
            child: Center(
              child: Text('$pct%', style: GoogleFonts.sora(fontSize: 11, fontWeight: FontWeight.bold, color: color)),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(label, style: GoogleFonts.dmSans(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
      ],
    );
  }

  Widget _buildNotices(DiaryState state) {
    final notices = state.data['notices'] as List? ?? [];
    if (notices.isEmpty) return const SizedBox();

    return Column(
      children: [
        _buildSectionHeader("School Notices", "Mark All Read"),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.campaign_rounded, size: 20, color: AppTheme.textPrimary),
                        const SizedBox(width: 8),
                        Text('Announcements', style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                      ],
                    ),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: const Color(0xFF3B6EF8).withOpacity(0.1), borderRadius: BorderRadius.circular(10)), child: const Text('2 Unread', style: TextStyle(color: Color(0xFF3B6EF8), fontSize: 10, fontWeight: FontWeight.bold))),
                  ],
                ),
              ),
              const Divider(height: 1),
              ...notices.map((ntc) {
                final isLast = notices.last == ntc;
                final icons = ['🏆', '📅', '🎽', '📢'];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(border: isLast ? null : const Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(width: 40, height: 40, decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(12)), alignment: Alignment.center, child: Text(icons[notices.indexOf(ntc) % 4], style: const TextStyle(fontSize: 18))),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(ntc['title'] ?? '', style: GoogleFonts.sora(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                            const SizedBox(height: 4),
                            Text(ntc['content'] ?? '', style: GoogleFonts.dmSans(fontSize: 12, color: AppTheme.textSecondary, height: 1.4)),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Text('${ntc['date']} · ${ntc['from'] ?? ''}', style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF94A3B8))),
                              ],
                            )
                          ],
                        ),
                      ),
                      Container(width: 8, height: 8, margin: const EdgeInsets.only(top: 6), decoration: const BoxDecoration(color: Color(0xFF3B6EF8), shape: BoxShape.circle))
                    ],
                  ),
                );
              }).toList()
            ],
          ),
        )
      ],
    );
  }

  Widget _buildUpcomingEvents(DiaryState state) {
    final events = state.data['events'] as List? ?? [];
    if (events.isEmpty) return const SizedBox();

    return Column(
      children: [
        _buildSectionHeader("Upcoming Events", "Add to Calendar"),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.calendar_month_rounded, size: 20, color: AppTheme.textPrimary),
                        const SizedBox(width: 8),
                        Text('School Calendar', style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                      ],
                    ),
                    Text('November 2024', style: GoogleFonts.sora(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
                  ],
                ),
              ),
              const Divider(height: 1),
              ...events.map((evt) {
                final colors = [const Color(0xFFEF4444), const Color(0xFF3B6EF8), const Color(0xFFF5A623), const Color(0xFF8B5CF6)][events.indexOf(evt) % 4];
                final dateParts = evt['date'].toString().split(' ');
                
                return Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 48, height: 48,
                        decoration: BoxDecoration(color: colors.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(dateParts.isNotEmpty ? dateParts[0] : '', style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: colors)),
                            Text(dateParts.length > 1 ? dateParts[1] : '', style: GoogleFonts.dmSans(fontSize: 10, fontWeight: FontWeight.bold, color: colors)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(evt['title'], style: GoogleFonts.sora(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                            const SizedBox(height: 4),
                            Text(evt['desc'], style: GoogleFonts.dmSans(fontSize: 12, color: AppTheme.textSecondary)),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: colors.withOpacity(0.1), borderRadius: BorderRadius.circular(6)), child: Text(evt['type'], style: GoogleFonts.dmSans(fontSize: 10, fontWeight: FontWeight.bold, color: colors))),
                                Text(evt['inDays'], style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF94A3B8))),
                              ],
                            )
                          ],
                        ),
                      )
                    ],
                  ),
                );
              }).toList()
            ],
          ),
        )
      ],
    );
  }

  Widget _buildMoodTracker(DiaryState state) {
    final mood = state.data['moodTracker'];
    if (mood == null) return const SizedBox();
    
    final days = mood['weeklyMood'] as List? ?? [];

    return Column(
      children: [
        _buildSectionHeader("Emma's Mood This Week", ""),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(children: [const Text('😊', style: TextStyle(fontSize: 16)), const SizedBox(width: 8), Text('Weekly Mood Log', style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary))]),
                  Text('Mostly Happy', style: GoogleFonts.sora(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF00C9A7))),
                ],
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: days.map<Widget>((d) {
                  final isCur = d['isCurrent'] == true;
                  final c = Color(int.parse((d['color'] as String).replaceFirst('#', ''), radix: 16) + 0xFF000000);
                  return Column(
                     children: [
                       Text(d['emoji'], style: const TextStyle(fontSize: 20)),
                       const SizedBox(height: 8),
                       Container(
                         width: 32, height: 100,
                         decoration: BoxDecoration(color: c.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                         alignment: Alignment.bottomCenter,
                         child: Container(
                           width: 32, height: 100.0 * (d['level'] / 100).clamp(0.2, 1.0),
                           decoration: BoxDecoration(color: c.withOpacity(0.5), borderRadius: BorderRadius.circular(16)),
                         ),
                       ),
                       const SizedBox(height: 8),
                       Text(isCur ? '${d['day']} ●' : d['day'], style: GoogleFonts.dmSans(fontSize: 12, fontWeight: isCur ? FontWeight.bold : FontWeight.normal, color: isCur ? AppTheme.textPrimary : AppTheme.textSecondary)),
                     ],
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('🤖', style: TextStyle(fontSize: 20)),
                    const SizedBox(width: 12),
                    Expanded(child: Text('"${mood['aiSummary']}"', style: GoogleFonts.dmSans(fontSize: 13, color: AppTheme.textSecondary, height: 1.5, fontStyle: FontStyle.italic))),
                  ],
                ),
              )
            ],
          ),
        )
      ],
    );
  }
}

class _DiaryMoodPainter extends CustomPainter {
  final double moodPct;
  final Color moodClr;

  _DiaryMoodPainter(this.moodPct, this.moodClr);

  @override
  void paint(Canvas canvas, Size size) {
    if (moodPct <= 0) return;
    
    final Paint trackPaint = Paint()
      ..color = moodClr.withOpacity(0.1)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 5.0
      ..strokeCap = StrokeCap.round;

    final Paint fillPaint = Paint()
      ..color = moodClr
      ..style = PaintingStyle.stroke
      ..strokeWidth = 5.0
      ..strokeCap = StrokeCap.round;

    final Offset center = Offset(size.width / 2, size.height / 2);
    final double radius = (size.width - 5) / 2;

    canvas.drawCircle(center, radius, trackPaint);

    final double sweepAngle = 2 * pi * (moodPct / 100);
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), -pi / 2, sweepAngle, false, fillPaint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}
