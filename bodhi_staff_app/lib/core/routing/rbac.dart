import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Defines precisely what roles/permissions the current user has access to.
/// This acts as the Source of Truth for the UI to conditionally render Tabs/Buttons.
class RBACState {
  final String role;
  final List<String> permissions;

  RBACState({required this.role, required this.permissions});

  factory RBACState.empty() => RBACState(role: 'GUEST', permissions: []);

  bool hasPermission(String requiredPermission) {
    if (role == 'SUPER_ADMIN') return true;
    return permissions.contains(requiredPermission);
  }

  bool hasAnyPermission(List<String> requiredPermissions) {
    if (role == 'SUPER_ADMIN') return true;
    return requiredPermissions.any((p) => permissions.contains(p));
  }
}

class RBACNotifier extends Notifier<RBACState> {
  @override
  RBACState build() {
    return RBACState.empty();
  }

  /// Called after successful login & `/api/v1/auth/me` to hydrate permissions
  void initializeWith(String role, List<String> permissions) {
    state = RBACState(role: role, permissions: permissions);
  }
}

final rbacProvider = NotifierProvider<RBACNotifier, RBACState>(() {
  return RBACNotifier();
});

/// A Map used to determine Tab visibility at the root level based on required permissions.
const Map<String, List<String>> tabPermissionsMapper = {
  'HomeTab': ['dashboard.view'],
  'TasksTab': ['tasks.view'],
  'MessagesTab': ['communication.view'],
  'AttendanceTab': ['attendance.mark', 'attendance.view'],
  'ProfileTab': ['profile.view'], // Generally available to all staff
};
