import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../sync/engine.dart';
import '../../core/database/database_provider.dart';

/// PreFetcher runs immediately after App Wake / Login
/// Goal: Silently cache heavy payload items (Timetable, Assigned Students)
/// so the UI "Feels Instant" when navigating.
class DataPreFetcher {
  final Ref ref;

  DataPreFetcher(this.ref);

  Future<void> prefetchAll() async {
    try {
      final engine = ref.read(syncEngineProvider);

      // 1. Silent specific pull for today's high-frequency data
      // This runs completely in the background without blocking the Home Screen
      await engine.pullSync([
        'today_timetable',
        'assigned_students_lite',
        'pending_approvals_lite'
      ]);

      // 2. Prefetch images/avatars (NetworkImage caching is typically handled by
      // CachedNetworkImage, but we ensure DB URLs are ready).
    } catch (e) {
      print('Prefetching failed silently: \$e');
      // Do not throw; gracefully fallback to Skeletons if the user navigates
    }
  }
}

final prefetcherProvider = Provider<DataPreFetcher>((ref) {
  return DataPreFetcher(ref);
});
