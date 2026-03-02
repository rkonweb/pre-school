import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'diary_service.dart';
import 'models/diary_entry.dart';

class DiaryState {
  final bool isLoading;
  final String? error;
  final List<DiaryEntry> entries;
  final List<Map<String, dynamic>> classrooms;
  final String? selectedClassroomId;
  final String? selectedType; // e.g., 'ALL', 'HOMEWORK', 'NOTICE', etc.

  DiaryState({
    this.isLoading = false,
    this.error,
    this.entries = const [],
    this.classrooms = const [],
    this.selectedClassroomId,
    this.selectedType,
  });

  DiaryState copyWith({
    bool? isLoading,
    String? error,
    List<DiaryEntry>? entries,
    List<Map<String, dynamic>>? classrooms,
    String? selectedClassroomId,
    String? Function()? selectedType,
  }) {
    return DiaryState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      entries: entries ?? this.entries,
      classrooms: classrooms ?? this.classrooms,
      selectedClassroomId: selectedClassroomId ?? this.selectedClassroomId,
      selectedType: selectedType != null ? selectedType() : this.selectedType,
    );
  }
}

class DiaryProvider extends StateNotifier<DiaryState> {
  final DiaryService _service;

  DiaryProvider(this._service) : super(DiaryState()) {
    init();
  }

  Future<void> init() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final classrooms = await _service.getClassrooms();
      
      String? defaultClassroomId;
      if (classrooms.isNotEmpty) {
        defaultClassroomId = classrooms.first['id'] as String;
      }
      
      state = state.copyWith(
        classrooms: classrooms,
        selectedClassroomId: defaultClassroomId,
      );

      await loadEntries();
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadEntries() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final entries = await _service.getEntries(
        classroomId: state.selectedClassroomId,
        type: state.selectedType == 'ALL' ? null : state.selectedType,
      );
      state = state.copyWith(isLoading: false, entries: entries);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void setFilter({String? classroomId, String? type}) {
    state = state.copyWith(
      selectedClassroomId: classroomId ?? state.selectedClassroomId,
      selectedType: () => type ?? state.selectedType,
    );
    loadEntries();
  }

  Future<bool> createEntry(Map<String, dynamic> data) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _service.createEntry(data);
      await loadEntries(); // Reload lists
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> updateEntry(String id, Map<String, dynamic> data) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _service.updateEntry(id, data);
      await loadEntries(); // Reload lists
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> deleteEntry(String id) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _service.deleteEntry(id);
      await loadEntries();
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
}

final diaryServiceProvider = Provider((ref) => DiaryService());

final diaryProvider = StateNotifierProvider<DiaryProvider, DiaryState>((ref) {
  final service = ref.watch(diaryServiceProvider);
  return DiaryProvider(service);
});
