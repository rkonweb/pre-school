import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../api/api_client.dart';

enum SyncActionType { sendMessage, markAttendance, submitLeaveRequest }

class SyncAction {
  final String id;
  final SyncActionType type;
  final String endpoint;
  final Map<String, dynamic> data;
  final DateTime createdAt;
  int retryCount;

  SyncAction({
    required this.id,
    required this.type,
    required this.endpoint,
    required this.data,
    required this.createdAt,
    this.retryCount = 0,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'type': type.index,
    'endpoint': endpoint,
    'data': data,
    'createdAt': createdAt.toIso8601String(),
    'retryCount': retryCount,
  };

  factory SyncAction.fromJson(Map<String, dynamic> json) => SyncAction(
    id: json['id'],
    type: SyncActionType.values[json['type']],
    endpoint: json['endpoint'],
    data: json['data'],
    createdAt: DateTime.parse(json['createdAt']),
    retryCount: json['retryCount'],
  );
}

class OfflineSyncService {
  final ApiClient apiClient;
  final SharedPreferences prefs;
  final List<SyncAction> _queue = [];
  bool _isProcessing = false;
  Timer? _syncTimer;

  OfflineSyncService(this.apiClient, this.prefs) {
    _loadQueue();
    _startSyncLoop();
  }

  void _loadQueue() {
    final raw = prefs.getString('offline_sync_queue');
    if (raw != null) {
      try {
        final List<dynamic> decoded = jsonDecode(raw);
        _queue.addAll(decoded.map((e) => SyncAction.fromJson(e)).toList());
      } catch (e) {
        debugPrint("Error loading sync queue: $e");
      }
    }
  }

  void _saveQueue() {
    prefs.setString('offline_sync_queue', jsonEncode(_queue.map((e) => e.toJson()).toList()));
  }

  void addAction(SyncActionType type, String endpoint, Map<String, dynamic> data) {
    final action = SyncAction(
      id: const Uuid().v4(),
      type: type,
      endpoint: endpoint,
      data: data,
      createdAt: DateTime.now(),
    );
    _queue.add(action);
    _saveQueue();
    _processQueue(); // Immediate attempt
  }

  void _startSyncLoop() {
    _syncTimer = Timer.periodic(const Duration(minutes: 5), (_) => _processQueue());
  }

  Future<void> _processQueue() async {
    if (_isProcessing || _queue.isEmpty) return;
    _isProcessing = true;

    debugPrint("Processing offline sync queue: ${_queue.length} items");

    final List<SyncAction> toRemove = [];

    for (var action in List.from(_queue)) {
      try {
        final response = await apiClient.post(action.endpoint, data: action.data);
        if (response.statusCode == 200 || response.statusCode == 201) {
          toRemove.add(action);
        } else {
          action.retryCount++;
          if (action.retryCount > 10) {
            toRemove.add(action); // Give up
            debugPrint("Action ${action.id} failed too many times, removing.");
          }
        }
      } catch (e) {
        debugPrint("Sync error for action ${action.id}: $e");
        break; // Network likely still down
      }
    }

    if (toRemove.isNotEmpty) {
      _queue.removeWhere((a) => toRemove.contains(a));
      _saveQueue();
    }

    _isProcessing = false;
  }

  void dispose() {
    _syncTimer?.cancel();
  }
}
