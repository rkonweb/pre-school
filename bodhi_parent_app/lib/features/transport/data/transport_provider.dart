import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'transport_provider.g.dart';

@riverpod
class LiveTransportData extends _$LiveTransportData {
  Timer? _pollingTimer;

  @override
  FutureOr<Map<String, dynamic>> build(String studentId) async {
    // Clean up timer when provider is disposed
    ref.onDispose(() {
      _pollingTimer?.cancel();
    });

    return _fetchData(studentId);
  }

  void startPolling() {
      _pollingTimer?.cancel();
      _pollingTimer = Timer.periodic(const Duration(seconds: 5), (_) {
          refresh();
      });
  }

  void stopPolling() {
      _pollingTimer?.cancel();
  }

  Future<void> refresh() async {
    // Only refresh silently if we already have data
    if (state.hasValue) {
        state = await AsyncValue.guard(() => _fetchData(studentId));
    } else {
        state = const AsyncValue.loading();
        state = await AsyncValue.guard(() => _fetchData(studentId));
    }
  }

  Future<Map<String, dynamic>> _fetchData(String studentId) async {
    final apiClient = ref.read(apiClientProvider);
    final response = await apiClient.get('parent/transport', queryParameters: {'studentId': studentId});

    if (response.statusCode == 200 && response.data['success'] == true) {
      return response.data;
    } else if (response.statusCode == 200 && response.data['success'] == true && response.data['isActive'] == false) {
       // Return the inactive payload instead of throwing error
       return response.data;
    } else {
      throw Exception(response.data['error'] ?? 'Failed to fetch transport data');
    }
  }
}
