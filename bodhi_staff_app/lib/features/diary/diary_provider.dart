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
  final DateTime selectedDate;
  final bool onlyMine;

  DiaryState({
    this.isLoading = false,
    this.error,
    this.entries = const [],
    this.classrooms = const [],
    this.selectedClassroomId,
    this.selectedType,
    DateTime? selectedDate,
    this.onlyMine = true, // Default to true as per "Staff Dairy" request
  }) : selectedDate = selectedDate ?? DateTime.now();

  DiaryState copyWith({
    bool? isLoading,
    String? error,
    List<DiaryEntry>? entries,
    List<Map<String, dynamic>>? classrooms,
    String? selectedClassroomId,
    String? Function()? selectedType,
    DateTime? selectedDate,
    bool? onlyMine,
  }) {
    return DiaryState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      entries: entries ?? this.entries,
      classrooms: classrooms ?? this.classrooms,
      selectedClassroomId: selectedClassroomId ?? this.selectedClassroomId,
      selectedType: selectedType != null ? selectedType() : this.selectedType,
      selectedDate: selectedDate ?? this.selectedDate,
      onlyMine: onlyMine ?? this.onlyMine,
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
      
      state = state.copyWith(
        classrooms: classrooms,
        selectedClassroomId: null, // Default to All Classes
      );

      await loadEntries();
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadEntries() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final dateStr = "${state.selectedDate.year}-${state.selectedDate.month.toString().padLeft(2, '0')}-${state.selectedDate.day.toString().padLeft(2, '0')}";
      final entries = await _service.getEntries(
        classroomId: state.selectedClassroomId,
        date: dateStr,
        type: state.selectedType == 'ALL' ? null : state.selectedType,
        onlyMine: state.onlyMine,
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

  void setDate(DateTime date) {
    state = state.copyWith(selectedDate: date);
    loadEntries();
  }

  void toggleOnlyMine(bool value) {
    state = state.copyWith(onlyMine: value);
    loadEntries();
  }

  Future<bool> createEntry(Map<String, dynamic> data) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _service.createEntry(data);
      state = state.copyWith(selectedDate: DateTime.now());
      await loadEntries(); // Reload lists for today
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
      state = state.copyWith(selectedDate: DateTime.now());
      await loadEntries(); // Reload lists for today
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
