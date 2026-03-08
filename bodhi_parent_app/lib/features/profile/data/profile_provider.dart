import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

class ParentProfile {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String? photoUrl;
  final List<Map<String, dynamic>> children;

  ParentProfile({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    this.photoUrl,
    required this.children,
  });

  factory ParentProfile.fromJson(Map<String, dynamic> json) {
    final user = json['user'] ?? json;
    return ParentProfile(
      id: user['id']?.toString() ?? '',
      name: user['name'] ?? '${user['firstName'] ?? ''} ${user['lastName'] ?? ''}'.trim(),
      phone: user['phone'] ?? user['mobile'] ?? '',
      email: user['email'],
      photoUrl: user['photoUrl'] ?? user['avatar'],
      children: List<Map<String, dynamic>>.from(json['children'] ?? json['students'] ?? []),
    );
  }
}

final profileProvider = FutureProvider<ParentProfile>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final r = await api.get('parent/profile');
    if (r.data['success'] == true) {
      return ParentProfile.fromJson(r.data['data'] ?? r.data);
    }
    throw Exception(r.data['error'] ?? 'Failed to load profile');
  } catch (e) {
    if (e.toString().contains('404')) {
      return ParentProfile(id: '', name: 'Parent', phone: '', children: []);
    }
    rethrow;
  }
});
