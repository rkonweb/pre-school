import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/state/auth_state.dart';
import 'circular_model.dart';

final circularListProvider = FutureProvider.autoDispose<List<CircularModel>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) return [];
  
  final res = await http.get(
    Uri.parse('http://localhost:3000/api/mobile/v1/staff/circulars'),
    headers: {'Authorization': 'Bearer ${user!.token}'},
  ).timeout(const Duration(seconds: 10));

  if (res.statusCode == 200) {
    final data = jsonDecode(res.body);
    if (data['success'] == true) {
      return (data['data'] as List)
          .map((e) => CircularModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }
  }
  return [];
});

final recentCircularsProvider = FutureProvider.autoDispose<List<CircularModel>>((ref) async {
  // We can either fetch the dashboard summary or just take the top 3 from the list
  // For efficiency, let's just use the top 3 from the list for now if the endpoint is simple
  // OR we can fetch from the dashboard endpoint if it has everything.
  // Actually, let's just fetch the full list and slice it for now to avoid redundant API calls 
  // if the list is already cached.
  final list = await ref.watch(circularListProvider.future);
  return list.take(3).toList();
});
