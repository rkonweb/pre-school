import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

class SchoolDocument {
  final String id;
  final String title;
  final String type;
  final String? url;
  final String? description;
  final String createdAt;
  final String? fileSize;

  SchoolDocument({
    required this.id,
    required this.title,
    required this.type,
    this.url,
    this.description,
    required this.createdAt,
    this.fileSize,
  });

  factory SchoolDocument.fromJson(Map<String, dynamic> json) => SchoolDocument(
    id: json['id'] ?? '',
    title: json['title'] ?? json['name'] ?? 'Document',
    type: json['type'] ?? json['documentType'] ?? 'GENERAL',
    url: json['url'] ?? json['fileUrl'] ?? json['downloadUrl'],
    description: json['description'],
    createdAt: json['createdAt'] ?? json['date'] ?? '',
    fileSize: json['fileSize'],
  );
}

final documentsProvider = FutureProvider.family<List<SchoolDocument>, String>((ref, studentId) async {
  final api = ref.read(apiClientProvider);
  try {
    final r = await api.get('parent/documents', queryParameters: {'studentId': studentId});
    if (r.data['success'] == true) {
      return (r.data['documents'] as List? ?? r.data['data'] as List? ?? [])
          .map((e) => SchoolDocument.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    return [];
  } catch (_) {
    return [];
  }
});
