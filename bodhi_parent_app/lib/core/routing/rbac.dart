import 'package:flutter_riverpod/flutter_riverpod.dart';

class RBACState {
  final String role;
  final List<String> permissions;

  RBACState({required this.role, required this.permissions});

  factory RBACState.empty() => RBACState(role: 'GUEST', permissions: []);

  bool hasPermission(String requiredPermission) {
    if (role == 'PARENT' || role == 'SUPER_ADMIN') return true; // Simplify for now
    return permissions.contains(requiredPermission);
  }
}

class RBACNotifier extends Notifier<RBACState> {
  @override
  RBACState build() {
    return RBACState.empty();
  }

  void initializeWith(String role, List<String> permissions) {
    state = RBACState(role: role, permissions: permissions);
  }
}

final rbacProvider = NotifierProvider<RBACNotifier, RBACState>(() {
  return RBACNotifier();
});
