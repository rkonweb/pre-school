import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../dashboard/data/dashboard_provider.dart';
import '../models/library_transaction.dart';

class LibraryState {
  final bool isLoading;
  final String? error;
  final List<LibraryTransaction> activeLoans;
  final List<LibraryTransaction> loanHistory;

  LibraryState({
    this.isLoading = false,
    this.error,
    this.activeLoans = const [],
    this.loanHistory = const [],
  });

  LibraryState copyWith({
    bool? isLoading,
    String? error,
    List<LibraryTransaction>? activeLoans,
    List<LibraryTransaction>? loanHistory,
  }) {
    return LibraryState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      activeLoans: activeLoans ?? this.activeLoans,
      loanHistory: loanHistory ?? this.loanHistory,
    );
  }
}

class LibraryProvider extends StateNotifier<LibraryState> {
  final Ref _ref;

  LibraryProvider(this._ref) : super(LibraryState()) {
    init();
  }

  Future<void> init() async {
    await fetchStudentLibrary();
  }

  Future<void> fetchStudentLibrary() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final apiClient = _ref.read(apiClientProvider);
      final dashboardState = _ref.read(dashboardDataProvider);

      final activeStudentId = dashboardState.value?['activeStudentId'];
      if (activeStudentId == null) {
        state = state.copyWith(isLoading: false, error: "No active student found");
        return;
      }

      final response = await apiClient.get('parent/library', queryParameters: {
        'studentId': activeStudentId,
      });

      if (response.statusCode == 200 && response.data['success']) {
        final List<dynamic> rawData = response.data['data'];
        final List<LibraryTransaction> allTransactions =
            rawData.map((e) => LibraryTransaction.fromJson(e)).toList();

        // Separate logically for segmented UI tabs
        final active = allTransactions.where((t) => !t.isReturned).toList();
        final history = allTransactions.where((t) => t.isReturned).toList();

        state = state.copyWith(
          isLoading: false,
          activeLoans: active,
          loanHistory: history,
        );
      } else {
        throw Exception(response.data['error'] ?? "Failed to fetch library data");
      }
    } on DioException catch (e) {
      final serverError = e.response?.data?['error'] ?? e.message;
      state = state.copyWith(isLoading: false, error: "Server Error: $serverError");
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final libraryProvider = StateNotifierProvider<LibraryProvider, LibraryState>((ref) {
  return LibraryProvider(ref);
});
