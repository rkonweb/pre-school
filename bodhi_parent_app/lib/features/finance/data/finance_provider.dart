import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/api/api_client.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'finance_provider.g.dart';

@riverpod
class FinanceSnapshotData extends _$FinanceSnapshotData {

  String _getCacheKey(String studentId) => 'parent_finance_cache_$studentId';

  @override
  FutureOr<Map<String, dynamic>> build(String studentId) async {
    return _fetchData(studentId: studentId, isInitial: true);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchData(studentId: studentId, isInitial: false));
  }

  Future<Map<String, dynamic>> _fetchData({required String studentId, required bool isInitial}) async {
    final prefs = await SharedPreferences.getInstance();
    final cacheKey = _getCacheKey(studentId);

    if (isInitial) {
      final cachedString = prefs.getString(cacheKey);
      if (cachedString != null) {
        try {
          final cachedData = jsonDecode(cachedString);
          _silentlyRefresh(prefs, studentId, cacheKey);
          return cachedData;
        } catch (e) {
          // ignore
        }
      }
    }

    final apiClient = ref.read(apiClientProvider);
    final response = await apiClient.get('parent/finance', queryParameters: {'studentId': studentId});

    if (response.statusCode == 200 && response.data['success'] == true) {
      final data = response.data;
      await prefs.setString(cacheKey, jsonEncode(data));
      return data;
    } else {
      throw Exception(response.data['error'] ?? 'Failed to fetch finance snapshot');
    }
  }

  Future<void> _silentlyRefresh(SharedPreferences prefs, String studentId, String cacheKey) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.get('parent/finance', queryParameters: {'studentId': studentId});

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data;
        final oldDataString = prefs.getString(cacheKey);
        final newDataString = jsonEncode(data);
        
        if (oldDataString != newDataString) {
          await prefs.setString(cacheKey, newDataString);
          state = AsyncValue.data(data);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  Future<bool> processPayment(String studentId, String feeId, double amount, String method) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.post(
        'parent/finance', 
        data: {
          'feeId': feeId,
          'amount': amount,
          'method': method,
        }
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        // Refresh the data to reflect the new payment status
        final prefs = await SharedPreferences.getInstance();
        final cacheKey = _getCacheKey(studentId);
        await _silentlyRefresh(prefs, studentId, cacheKey);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
