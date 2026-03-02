import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/database/database_provider.dart';
import '../../core/database/tables.dart';
import 'network.dart';

final syncEngineProvider = Provider<SyncEngine>((ref) {
  return SyncEngine(ref.read(dbProvider), ref.read(dioProvider));
});

class SyncEngine {
  final AppDatabase _db;
  final Dio _dio;

  SyncEngine(this._db, this._dio);

  /// PULL: Fetches new delta data since the last successful sync
  Future<void> pullSync(List<String> entities) async {
    try {
      // 1. Get last synced timestamp (assume 0 for fresh install)
      // This is a simplified demo payload
      final body = {
        'last_synced_at': DateTime.now()
            .subtract(const Duration(days: 1))
            .millisecondsSinceEpoch,
        'entities': entities,
      };

      final response = await _dio.post('/api/v1/sync/pull', data: body);

      if (response.statusCode == 200) {
        // 2. Parse Delta and update Local DB
        // e.g. _db.into(_db.students).insertOnConflictUpdate(...)

        // 3. Update SyncState table
        for (var entity in entities) {
          await _db.into(_db.syncState).insertOnConflictUpdate(SyncStateRecord(
                entity: entity,
                lastSyncedAt: DateTime.now().millisecondsSinceEpoch,
              ));
        }
      }
    } catch (e) {
      print('Pull Sync Failed: \$e');
    }
  }

  /// PUSH: Reads local OfflineQueue and pushes batched mutations to API
  Future<void> pushSync() async {
    try {
      // 1. Fetch pending items
      final pendingQueue = await (_db.select(_db.offlineQueue)
            ..where((t) => t.status.equals('PENDING')))
          .get();

      if (pendingQueue.isEmpty) return;

      // 2. Map for API Bulk Push
      final changes = pendingQueue.map((item) {
        return {
          'id': item.id,
          'type': item.type,
          'payload': jsonDecode(item.payload),
          'created_at': item.createdAt.millisecondsSinceEpoch,
        };
      }).toList();

      // 3. Send to Server
      final response =
          await _dio.post('/api/v1/sync/push', data: {'changes': changes});

      // 4. Handle Server Resolution (Success, Failed, Conflicts)
      if (response.statusCode == 200) {
        final List<String> succeeded =
            List<String>.from(response.data['success'] ?? []);

        // Remove succeeded from queue
        for (final id in succeeded) {
          await (_db.delete(_db.offlineQueue)..where((t) => t.id.equals(id)))
              .go();
        }

        // Handle Conflicts/Failed logic here (e.g. notify UI, reset local optimistic state)
      }
    } catch (e) {
      print('Push Sync Failed: \$e');
      // Incrememt retry counters internally
    }
  }
}
