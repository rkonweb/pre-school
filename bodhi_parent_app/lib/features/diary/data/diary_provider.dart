import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../dashboard/data/dashboard_provider.dart';
import 'package:dio/dio.dart';

class DiaryState {
  final bool isLoading;
  final String? error;
  final Map<String, dynamic> data;
  final DateTime selectedDate;
  final String activeFilter;

  DiaryState({
    this.isLoading = false,
    this.error,
    this.data = const {},
    DateTime? selectedDate,
    this.activeFilter = 'All',
  }) : selectedDate = selectedDate ?? DateTime.now();

  DiaryState copyWith({
    bool? isLoading,
    String? error,
    Map<String, dynamic>? data,
    DateTime? selectedDate,
    String? activeFilter,
  }) {
    return DiaryState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      data: data ?? this.data,
      selectedDate: selectedDate ?? this.selectedDate,
      activeFilter: activeFilter ?? this.activeFilter,
    );
  }
}

class DiaryProvider extends StateNotifier<DiaryState> {
  final Ref _ref;

  DiaryProvider(this._ref) : super(DiaryState()) {
    init();
  }

  Future<void> init() async {
    await loadData();
  }

  Future<void> loadData() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final apiClient = _ref.read(apiClientProvider);
      final dashboardState = _ref.read(dashboardDataProvider);

      final activeStudentId = dashboardState.value?['activeStudentId'];
      if (activeStudentId == null) {
        state = state.copyWith(isLoading: false, error: "No active student found");
        return;
      }

      final dateStr = "${state.selectedDate.year}-${state.selectedDate.month.toString().padLeft(2, '0')}-${state.selectedDate.day.toString().padLeft(2, '0')}";
      
      final response = await apiClient.get('parent/diary-comprehensive', queryParameters: {
        'studentId': activeStudentId,
        'date': dateStr,
      });

      if (response.statusCode == 200 && response.data['success']) {
        state = state.copyWith(isLoading: false, data: response.data['data']);
      } else {
        throw Exception(response.data['error'] ?? "Failed to fetch diary data");
      }
    } on DioException catch (e) {
      state = state.copyWith(isLoading: false, error: "Network Error: ${e.message}");
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void setDate(DateTime date) {
    state = state.copyWith(selectedDate: date);
    loadData();
  }

  void setFilter(String filter) {
    state = state.copyWith(activeFilter: filter);
  }
}

final diaryProvider = StateNotifierProvider<DiaryProvider, DiaryState>((ref) {
  return DiaryProvider(ref);
});
