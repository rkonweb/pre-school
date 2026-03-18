import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/student_service.dart';
import 'auth_state.dart';

final studentServiceProvider = Provider<StudentService>((ref) {
  final user = ref.watch(userProfileProvider);
  return StudentService(token: user?.token);
});

final studentSearchQueryProvider = StateProvider<String>((ref) => '');
final studentGradeFilterProvider = StateProvider<String?>((ref) => null);

class StudentsNotifier extends AsyncNotifier<List<Map<String, dynamic>>> {
  @override
  FutureOr<List<Map<String, dynamic>>> build() async {
    return _fetch();
  }

  Future<List<Map<String, dynamic>>> _fetch() async {
    final service = ref.read(studentServiceProvider);
    final search = ref.read(studentSearchQueryProvider);
    final grade = ref.read(studentGradeFilterProvider);
    return await service.fetchStudents(search: search, grade: grade);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetch());
  }

  Future<void> addStudent(Map<String, dynamic> data) async {
    final service = ref.read(studentServiceProvider);
    await service.createStudent(data);
    await refresh(); // Re-fetch list
  }

  Future<void> updateStudent(String id, Map<String, dynamic> data) async {
    final service = ref.read(studentServiceProvider);
    await service.updateStudent(id, data);
    await refresh();
  }

  Future<void> deleteStudent(String id) async {
    final service = ref.read(studentServiceProvider);
    await service.deleteStudent(id);
    await refresh();
  }
}

final studentsProvider = AsyncNotifierProvider<StudentsNotifier, List<Map<String, dynamic>>>(() {
  return StudentsNotifier();
});

final studentDetailsProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final service = ref.watch(studentServiceProvider);
  return await service.fetchStudentDetails(id);
});
