import 'package:flutter_riverpod/flutter_riverpod.dart';

class UserProfile {
  final String id;
  final String phone;
  final String name;
  final String role;
  final String? branchId;
  final String schoolId;
  final String schoolName;
  final String schoolSlug; // real URL slug e.g. 'littlechanakyas'
  final String? token;
  final List<String> permissions;

  UserProfile({
    required this.id,
    required this.phone,
    required this.name,
    required this.role,
    this.branchId,
    required this.schoolId,
    required this.schoolName,
    this.schoolSlug = '',
    this.token,
    this.permissions = const [],
  });

  // Safe accessor for UI placeholders
  String get dept => 'Staff · $schoolName';
  
  // Safe accessor to map raw backend roles to app themes
  String get roleKey => role.toLowerCase();
}


// Authentication state providers
final isAuthenticatedProvider = StateProvider<bool>((ref) => false);

final userProfileProvider = StateProvider<UserProfile?>((ref) => null);

final activeRoleProvider = Provider<String>((ref) {
  final user = ref.watch(userProfileProvider);
  return user?.role ?? 'STAFF'; 
});

// Derives permissions explicitly from the backend token payload now
final rolePermissionsProvider = Provider<List<String>>((ref) {
  final user = ref.watch(userProfileProvider);
  return user?.permissions ?? [];
});
