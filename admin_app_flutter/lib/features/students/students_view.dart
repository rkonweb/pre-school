import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/state/student_provider.dart';
import '../../core/state/generic_crud_provider.dart';
import '../../shared/components/top_nav_bell.dart';

class StudentsView extends ConsumerStatefulWidget {
  const StudentsView({super.key});

  @override
  ConsumerState<StudentsView> createState() => _StudentsViewState();
}

class _StudentsViewState extends ConsumerState<StudentsView> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Initialize search text from provider if it exists
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final currentSearch = ref.read(studentSearchQueryProvider);
      if (currentSearch.isNotEmpty) {
        _searchController.text = currentSearch;
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    ref.read(studentSearchQueryProvider.notifier).state = value;
    ref.read(studentsProvider.notifier).refresh();
  }

  void _onGradeFilterChanged(String? grade) {
    ref.read(studentGradeFilterProvider.notifier).state = grade;
    ref.read(studentsProvider.notifier).refresh();
  }

  @override
  Widget build(BuildContext context) {
    final studentsAsync = ref.watch(studentsProvider);
    final activeGrade = ref.watch(studentGradeFilterProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Students', style: TextStyle(fontFamily: 'Cabinet Grotesk', fontWeight: FontWeight.w800)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF140E28),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: Color(0xFF140E28)),
            onPressed: () {
              // TODO: Implement add student logic (can still use generic form if needed)
            },
          ),
          const TopNavBell(badgeText: '3'),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          _buildFilterChips(activeGrade, ref.watch(apiCrudProvider('classrooms'))),
          Expanded(
            child: studentsAsync.when(
              data: (students) => _buildStudentList(students),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text('Error: $err')),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: TextField(
        controller: _searchController,
        onSubmitted: _onSearchChanged,
        decoration: InputDecoration(
          hintText: 'Search by name, ID, or parent mobile...',
          hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
          prefixIcon: const Icon(Icons.search, color: Color(0xFF64748B)),
          suffixIcon: _searchController.text.isNotEmpty 
            ? IconButton(
                icon: const Icon(Icons.clear, size: 18),
                onPressed: () {
                  _searchController.clear();
                  _onSearchChanged('');
                },
              )
            : null,
          filled: true,
          fillColor: const Color(0xFFF1F5F9),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(vertical: 0),
        ),
      ),
    );
  }

  Widget _buildFilterChips(String? activeGrade, AsyncValue<List<Map<String, dynamic>>> classroomsAsync) {
    return Container(
      color: Colors.white,
      height: 60,
      child: classroomsAsync.when(
        data: (classes) {
          final classNames = classes.map((c) => c['name'] as String).toList();
          return ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            itemCount: classNames.length + 1,
            itemBuilder: (context, index) {
              if (index == 0) {
                final isAll = activeGrade == null;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: ChoiceChip(
                    label: const Text('All Grades'),
                    selected: isAll,
                    onSelected: (selected) {
                      if (selected) _onGradeFilterChanged(null);
                    },
                    selectedColor: const Color(0xFF2563EB),
                    labelStyle: TextStyle(color: isAll ? Colors.white : const Color(0xFF475569)),
                  ),
                );
              }
              final grade = classNames[index - 1];
              final isSelected = activeGrade == grade;
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: ChoiceChip(
                  label: Text(grade),
                  selected: isSelected,
                  onSelected: (selected) {
                    _onGradeFilterChanged(selected ? grade : null);
                  },
                  selectedColor: const Color(0xFF2563EB),
                  labelStyle: TextStyle(color: isSelected ? Colors.white : const Color(0xFF475569)),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => const Center(child: Text('Error loading classes', style: TextStyle(color: Colors.red, fontSize: 12))),
      ),
    );
  }

  Widget _buildStudentList(List<Map<String, dynamic>> students) {
    if (students.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.person_search_rounded, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            const Text('No students found', style: TextStyle(fontFamily: 'Satoshi', color: Colors.grey)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: students.length,
      itemBuilder: (context, index) {
        final student = students[index];
        final name = '${student['firstName']} ${student['lastName'] ?? ''}'.trim();
        final id = student['id'];
        
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFF1F5F9)),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4)),
            ],
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () => context.push('/students/$id'),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: const Color(0xFFE2E8F0),
                    backgroundImage: student['avatar'] != null ? NetworkImage(student['avatar']) : null,
                    child: student['avatar'] == null ? Text(name[0], style: const TextStyle(color: Color(0xFF475569), fontWeight: FontWeight.bold)) : null,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF0F172A))),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text('ID: ${student['admissionNumber'] ?? 'N/A'}', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                            const Text(' • ', style: TextStyle(color: Color(0xFFCBD5E1))),
                            Text(student['classroom']?['name'] ?? student['grade'] ?? 'Unassigned', style: const TextStyle(fontSize: 12, color: Color(0xFF3B82F6), fontWeight: FontWeight.w600)),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: _getStatusColor(student['status']).withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                student['status'] ?? 'UNKNOWN',
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _getStatusColor(student['status'])),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.chevron_right_rounded, color: Color(0xFFCBD5E1)),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Color _getStatusColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return const Color(0xFF10B981);
      case 'INACTIVE': return const Color(0xFFF59E0B);
      case 'GRADUATED': return const Color(0xFF3B82F6);
      case 'WITHDRAWN': return const Color(0xFFEF4444);
      default: return const Color(0xFF64748B);
    }
  }
}
