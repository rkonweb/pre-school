import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'attendance_service.dart';
import '../../core/theme/school_brand_provider.dart';

class AttendanceStudent {
  final String id;
  final String name;
  final String? avatar;
  final String rollNo;
  final String? status;
  final String? notes;

  AttendanceStudent({
    required this.id,
    required this.name,
    this.avatar,
    required this.rollNo,
    this.status,
    this.notes,
  });

  factory AttendanceStudent.fromJson(Map<String, dynamic> json) {
    return AttendanceStudent(
      id: json['id'],
      name: json['name'],
      avatar: json['avatar'],
      rollNo: json['rollNo'] ?? '—',
      status: json['status'],
      notes: json['notes'],
    );
  }

  AttendanceStudent copyWith({String? status, String? notes}) {
    return AttendanceStudent(
      id: id,
      name: name,
      avatar: avatar,
      rollNo: rollNo,
      status: status ?? this.status,
      notes: notes ?? this.notes,
    );
  }
}

class AttendanceState {
  final List<AttendanceStudent> students;
  final List<Map<String, dynamic>> classrooms;
  final String? selectedClassroomId;
  final DateTime selectedDate;
  final bool isLoading;
  final String? error;
  final String? selectedFilter;

  AttendanceState({
    this.students = const [],
    this.classrooms = const [],
    this.selectedClassroomId,
    required this.selectedDate,
    this.isLoading = false,
    this.error,
    this.selectedFilter = 'UNMARKED',
  });

  AttendanceState copyWith({
    List<AttendanceStudent>? students,
    List<Map<String, dynamic>>? classrooms,
    String? selectedClassroomId,
    DateTime? selectedDate,
    bool? isLoading,
    String? error,
    String? selectedFilter,
  }) {
    return AttendanceState(
      students: students ?? this.students,
      classrooms: classrooms ?? this.classrooms,
      selectedClassroomId: selectedClassroomId ?? this.selectedClassroomId,
      selectedDate: selectedDate ?? this.selectedDate,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      selectedFilter: selectedFilter ?? this.selectedFilter,
    );
  }
}

class AttendanceNotifier extends StateNotifier<AttendanceState> {
  final AttendanceService _service;
  final Ref _ref;

  AttendanceNotifier(this._service, this._ref)
      : super(AttendanceState(selectedDate: DateTime.now())) {
    loadClassrooms();
  }

  Future<void> loadClassrooms() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final classrooms = await _service.getClassrooms();
      state = state.copyWith(
        classrooms: classrooms,
        selectedClassroomId:
            classrooms.isNotEmpty ? classrooms[0]['id'] : null,
        isLoading: false,
      );
      if (state.selectedClassroomId != null) {
        loadStudents();
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadStudents() async {
    if (state.selectedClassroomId == null) return;
    state = state.copyWith(isLoading: true, error: null);
    try {
      final brand = _ref.read(schoolBrandProvider);
      final dateStr = state.selectedDate.toIso8601String().split('T')[0];
      final students = await _service.getStudents(
        brand.schoolSlug ?? '',
        state.selectedClassroomId!,
        dateStr,
      );
      state = state.copyWith(
        students: students.map((s) => AttendanceStudent.fromJson(s)).toList(),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void selectClassroom(String id) {
    state = state.copyWith(selectedClassroomId: id, selectedFilter: 'UNMARKED');
    loadStudents();
  }

  void selectDate(DateTime date) {
    state = state.copyWith(selectedDate: date, selectedFilter: 'UNMARKED');
    loadStudents();
  }

  Future<void> markAttendance(String studentId, String status) async {
    final brand = _ref.read(schoolBrandProvider);
    final dateStr = state.selectedDate.toIso8601String().split('T')[0];

    // Optimistic update
    final oldStudents = [...state.students];
    state = state.copyWith(
      students: state.students.map((s) {
        if (s.id == studentId) {
          return s.copyWith(status: status);
        }
        return s;
      }).toList(),
    );

    try {
      final success = await _service.markAttendance(
        slug: brand.schoolSlug ?? '',
        studentId: studentId,
        date: dateStr,
        status: status,
      );
      print('Attendance Mark Success: $success for $studentId');
      if (!success) {
        state = state.copyWith(students: oldStudents, error: 'Failed to mark attendance');
      }
    } catch (e) {
      // Clean up error message if it contains "Exception: "
      final errorMsg = e.toString().replaceAll('Exception: ', '');
      state = state.copyWith(students: oldStudents, error: errorMsg);
    }
  }

  void setFilter(String filter) {
    state = state.copyWith(selectedFilter: filter);
  }
}

final attendanceProvider =
    StateNotifierProvider<AttendanceNotifier, AttendanceState>((ref) {
  return AttendanceNotifier(ref.read(attendanceServiceProvider), ref);
});
