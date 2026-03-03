import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:bodhi_staff_app/core/widgets/global_header.dart';
import 'package:bodhi_staff_app/core/widgets/horizontal_date_strip.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import 'attendance_card.dart';
import 'attendance_provider.dart';

import 'package:bodhi_staff_app/core/theme/school_brand_provider.dart';

class AttendanceScreen extends ConsumerWidget {
  const AttendanceScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(attendanceProvider);
    final notifier = ref.read(attendanceProvider.notifier);
    final brand = ref.watch(schoolBrandProvider);

    ref.listen<AttendanceState>(attendanceProvider, (previous, next) {
      if (next.error != null && next.error != previous?.error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: AppTheme.danger,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    });

    final filteredStudents = state.students.where((s) {
      final filter = state.selectedFilter ?? 'ALL';
      if (filter == 'ALL') return true;
      if (filter == 'PRESENT') return s.status == 'PRESENT';
      if (filter == 'ABSENT') return s.status == 'ABSENT';
      if (filter == 'LATE') return s.status == 'LATE';
      if (filter == 'UNMARKED') return s.status == null;
      return true;
    }).toList();

    return Scaffold(
      
      
      
      appBar: GlobalHeader(
        title: 'Attendance',
        showBackButton: true,
        useGradient: true,
        actions: const [],
      ),
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          _buildMeshBackground(brand),
          SafeArea(
            child: Column(
              children: [
                HorizontalDateStrip(
                  selectedDate: state.selectedDate,
                  onDateSelected: (date) => notifier.selectDate(date),
                  lastDate: DateTime.now(),
                ),
                // Header / Filters
                _buildModernFilterBar(state, notifier, brand),
                
                // Student List
                Expanded(
                  child: state.isLoading && state.students.isEmpty
                      ? const Center(child: CircularProgressIndicator())
                      : _buildAnimatedStudentList(state, notifier, filteredStudents),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMeshBackground(SchoolBrandState brand) {
    return CustomPaint(
      painter: _GridPainter(),
      child: Container(color: Colors.white),
    );
  }

  Widget _buildModernFilterBar(AttendanceState state, AttendanceNotifier notifier, SchoolBrandState brand) {
    return Column(
      children: [
        // ── Dropdown Card ───────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE5E7EB)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Builder(
            builder: (ctx) => _buildModernDropdown(ctx, state, notifier, brand),
          ),
        ),

        // ── Stats Card ──────────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(16, 10, 16, 8),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE5E7EB)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatItem('?', state.students.where((s) => s.status == null).length.toString(), AppTheme.textMuted, state.selectedFilter == 'UNMARKED', () => notifier.setFilter('UNMARKED')),
              _buildStatItem('P', state.students.where((s) => s.status == 'PRESENT').length.toString(), AppTheme.success, state.selectedFilter == 'PRESENT', () => notifier.setFilter('PRESENT')),
              _buildStatItem('A', state.students.where((s) => s.status == 'ABSENT').length.toString(), AppTheme.danger, state.selectedFilter == 'ABSENT', () => notifier.setFilter('ABSENT')),
              _buildStatItem('L', state.students.where((s) => s.status == 'LATE').length.toString(), AppTheme.warning, state.selectedFilter == 'LATE', () => notifier.setFilter('LATE')),
              _buildStatItem('ALL', state.students.length.toString(), brand.secondaryColor, state.selectedFilter == 'ALL', () => notifier.setFilter('ALL')),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildModernDropdown(BuildContext context, AttendanceState state, AttendanceNotifier notifier, SchoolBrandState brand) {
    final selectedClass = state.classrooms.firstWhere(
      (c) => c['id'] == state.selectedClassroomId,
      orElse: () => <String, dynamic>{},
    );
    final selectedName = selectedClass['name'] as String? ?? 'Select Class';

    return GestureDetector(
      onTap: () {
        showModalBottomSheet(
          context: context,
          backgroundColor: Colors.transparent,
          isScrollControlled: true,
          builder: (_) => _ClassPickerSheet(
            classrooms: state.classrooms,
            selectedId: state.selectedClassroomId,
            brand: brand,
            onSelected: (id) => notifier.selectClassroom(id),
          ),
        );
      },
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: brand.primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(Icons.class_outlined, color: brand.primaryColor, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Class',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey[500],
                    fontWeight: FontWeight.w500,
                    letterSpacing: 0.3,
                  ),
                ),
                Text(
                  selectedName,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: brand.primaryColor,
                    letterSpacing: -0.2,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: brand.primaryColor.withOpacity(0.08),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(Icons.unfold_more_rounded, color: brand.primaryColor, size: 18),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedStudentList(AttendanceState state, AttendanceNotifier notifier, List<AttendanceStudent> filteredStudents) {
    if (state.selectedClassroomId == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.people_outline, size: 64, color: AppTheme.textMuted.withOpacity(0.3)),
            const SizedBox(height: 16),
            Text('Please select a classroom', style: TextStyle(color: AppTheme.textMuted, fontSize: 16, fontWeight: FontWeight.w500)),
          ],
        ),
      );
    }
    return AnimatedStudentList(
      students: filteredStudents,
      filter: state.selectedFilter ?? 'UNMARKED',
      onMarked: (studentId, status) => notifier.markAttendance(studentId, status),
    );
  }

  Widget _buildStatItem(String label, String value, Color color, bool isActive, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? color.withOpacity(0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isActive ? color.withOpacity(0.3) : Colors.transparent,
            width: 1,
          ),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 22, 
                fontWeight: FontWeight.w800, 
                color: color,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                color: isActive ? color : AppTheme.textMuted.withOpacity(0.8),
                fontWeight: FontWeight.w900,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// A StatefulWidget that renders students as an AnimatedList.
/// When students are removed from [students] (e.g., marked in the ? view),
/// the card smoothly fades + slides out and the list collapses upward.
class AnimatedStudentList extends StatefulWidget {
  final List<AttendanceStudent> students;
  final String filter;
  final void Function(String studentId, String status) onMarked;

  const AnimatedStudentList({
    Key? key,
    required this.students,
    required this.filter,
    required this.onMarked,
  }) : super(key: key);

  @override
  State<AnimatedStudentList> createState() => _AnimatedStudentListState();
}

class _AnimatedStudentListState extends State<AnimatedStudentList> {
  final GlobalKey<AnimatedListState> _listKey = GlobalKey<AnimatedListState>();
  late List<AttendanceStudent> _items;

  @override
  void initState() {
    super.initState();
    _items = List.from(widget.students);
  }

  @override
  void didUpdateWidget(AnimatedStudentList oldWidget) {
    super.didUpdateWidget(oldWidget);

    // If the filter changed, the AnimatedList rebuilds via ValueKey — nothing to do here.
    if (oldWidget.filter != widget.filter) {
      _items = List.from(widget.students);
      return;
    }

    // Detect removed items (student was marked and filtered out)
    final newIds = widget.students.map((s) => s.id).toSet();
    for (int i = _items.length - 1; i >= 0; i--) {
      if (!newIds.contains(_items[i].id)) {
        final removed = _items[i];
        _items.removeAt(i);
        _listKey.currentState?.removeItem(
          i,
          (context, animation) => _buildRemoveAnimation(removed, animation),
          duration: const Duration(milliseconds: 350),
        );
      }
    }

    // Detect added items
    final oldIds = _items.map((s) => s.id).toSet();
    for (int i = 0; i < widget.students.length; i++) {
      final s = widget.students[i];
      if (!oldIds.contains(s.id)) {
        _items.insert(i, s);
        _listKey.currentState?.insertItem(i, duration: const Duration(milliseconds: 300));
      }
    }

    // Sync status updates
    for (int i = 0; i < _items.length; i++) {
      final updated = widget.students.firstWhere((s) => s.id == _items[i].id, orElse: () => _items[i]);
      if (updated.status != _items[i].status) {
        setState(() { _items[i] = updated; });
      }
    }
  }

  Widget _buildRemoveAnimation(AttendanceStudent student, Animation<double> animation) {
    return SizeTransition(
      sizeFactor: animation,
      child: FadeTransition(
        opacity: animation,
        child: AttendanceStudentCard(
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNo,
          avatarUrl: student.avatar,
          status: student.status,
          onMarked: (_) {},
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_items.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle_outline, size: 64, color: AppTheme.success.withOpacity(0.4)),
            const SizedBox(height: 16),
            Text(
              widget.filter == 'UNMARKED' ? 'All students marked! 🎉' : 'No students in this filter',
              style: const TextStyle(color: AppTheme.textMuted, fontSize: 16, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      );
    }

    return AnimatedList(
      key: ValueKey(widget.filter),
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
      initialItemCount: _items.length,
      itemBuilder: (context, index, animation) {
        if (index >= _items.length) return const SizedBox.shrink();
        final student = _items[index];
        return SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 0.05),
            end: Offset.zero,
          ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOut)),
          child: FadeTransition(
            opacity: animation,
            child: AttendanceStudentCard(
              studentId: student.id,
              studentName: student.name,
              rollNumber: student.rollNo,
              avatarUrl: student.avatar,
              status: student.status,
              onMarked: (status) => widget.onMarked(student.id, status),
            ),
          ),
        );
      },
    );
  }
}

/// Paints a subtle grey grid (graph-paper style) on a white background.
class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    const double spacing = 28.0;
    final paint = Paint()
      ..color = const Color(0xFFE2E8F0) // soft grey
      ..strokeWidth = 0.6;

    // Vertical lines
    for (double x = 0; x <= size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    // Horizontal lines
    for (double y = 0; y <= size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Modern bottom-sheet class picker shown when the user taps the class selector.
class _ClassPickerSheet extends StatelessWidget {
  final List<Map<String, dynamic>> classrooms;
  final String? selectedId;
  final SchoolBrandState brand;
  final void Function(String id) onSelected;

  const _ClassPickerSheet({
    required this.classrooms,
    required this.selectedId,
    required this.brand,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 4),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          // Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              children: [
                Icon(Icons.class_outlined, color: brand.primaryColor, size: 22),
                const SizedBox(width: 10),
                Text(
                  'Select Class',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: brand.primaryColor,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          // Class list
          ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.55,
            ),
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: classrooms.length,
              itemBuilder: (context, index) {
                final cls = classrooms[index];
                final isSelected = cls['id'] == selectedId;
                return InkWell(
                  onTap: () {
                    onSelected(cls['id'] as String);
                    Navigator.of(context).pop();
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    decoration: BoxDecoration(
                      color: isSelected ? brand.primaryColor.withOpacity(0.07) : Colors.transparent,
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            color: isSelected
                                ? brand.primaryColor.withOpacity(0.15)
                                : Colors.grey.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Center(
                            child: Text(
                              (cls['name'] as String? ?? '?')[0].toUpperCase(),
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 16,
                                color: isSelected ? brand.primaryColor : Colors.grey[500],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Text(
                            cls['name'] as String? ?? '',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isSelected ? brand.primaryColor : const Color(0xFF1F2937),
                            ),
                          ),
                        ),
                        if (isSelected)
                          Icon(Icons.check_circle_rounded, color: brand.primaryColor, size: 20),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          SizedBox(height: MediaQuery.of(context).padding.bottom + 12),
        ],
      ),
    );
  }
}
