import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/state/auth_state.dart';
import '../services/generic_crud_service.dart';

final genericCrudServiceProvider = Provider<GenericCrudService>((ref) {
  final user = ref.watch(userProfileProvider);
  return GenericCrudService(token: user?.token);
});

class GenericCrudNotifier extends FamilyAsyncNotifier<List<Map<String, dynamic>>, String> {
  @override
  FutureOr<List<Map<String, dynamic>>> build(String arg) async {
    return _fetch(arg);
  }

  Future<List<Map<String, dynamic>>> _fetch(String moduleKey) async {
    final service = ref.read(genericCrudServiceProvider);
    return await service.fetchRecords(moduleKey);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetch(arg));
  }

  Future<void> addRecord(Map<String, dynamic> data) async {
    final service = ref.read(genericCrudServiceProvider);
    await service.createRecord(arg, data);
    await refresh(); // Re-fetch list
  }

  Future<void> deleteRecord(String id) async {
    final service = ref.read(genericCrudServiceProvider);
    await service.deleteRecord(arg, id);
    await refresh();
  }
}

final apiCrudProvider = AsyncNotifierProviderFamily<GenericCrudNotifier, List<Map<String, dynamic>>, String>(() {
  return GenericCrudNotifier();
});
