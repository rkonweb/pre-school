import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

class CircularItem {
  final String id;
  final String title;
  final String date;
  final String type;
  final String? pdfUrl;
  final String? description;

  CircularItem({
    required this.id,
    required this.title,
    required this.date,
    required this.type,
    this.pdfUrl,
    this.description,
  });

  factory CircularItem.fromJson(Map<String, dynamic> json) {
    return CircularItem(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? 'Circular',
      date: json['date'] ?? json['createdAt'] ?? '',
      type: json['type'] ?? 'GENERAL',
      pdfUrl: json['pdfUrl'],
      description: json['description'] ?? json['content'],
    );
  }
}

final circularsProvider = FutureProvider<List<CircularItem>>((ref) async {
  final apiClient = ref.read(apiClientProvider);
  try {
    final response = await apiClient.get('parent/circulars');
    if (response.data['success'] == true) {
      final List<dynamic> data = response.data['circulars'] ?? response.data['data'] ?? [];
      return data.map((e) => CircularItem.fromJson(e as Map<String, dynamic>)).toList();
    }
    throw Exception(response.data['error'] ?? 'Failed to load circulars');
  } catch (e) {
    // Return empty list if endpoint doesn't exist yet (graceful degradation)
    if (e.toString().contains('404') || e.toString().contains('SocketException')) {
      return [];
    }
    rethrow;
  }
});
