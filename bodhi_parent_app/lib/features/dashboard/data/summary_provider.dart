import 'dart:async';
import '../../../core/api/api_client.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'summary_provider.g.dart';

@riverpod
class StudentSummary extends _$StudentSummary {
  @override
  FutureOr<String?> build(String studentId, String schoolSlug) async {
    return _fetchSummary();
  }

  Future<String?> _fetchSummary() async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.get(
        'parent/summary', 
        queryParameters: {
          'studentId': studentId,
          'schoolSlug': schoolSlug,
        }
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['summary'];
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
