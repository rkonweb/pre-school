import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../../../core/api/api_client.dart';
import '../../../core/config/app_config.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'transport_provider.g.dart';

// ─── Models ──────────────────────────────────────────────────────────────────
class LocationUpdate {
  final double? lat;
  final double? lng;
  final double? speed;
  final int? etaMinutes;
  final String? statusMessage;

  LocationUpdate({
    this.lat,
    this.lng,
    this.speed,
    this.etaMinutes,
    this.statusMessage,
  });

  factory LocationUpdate.fromJson(Map<String, dynamic> json) => LocationUpdate(
    lat: (json['lat'] as num?)?.toDouble(),
    lng: (json['lng'] as num?)?.toDouble(),
    speed: (json['speed'] as num?)?.toDouble(),
    etaMinutes: json['etaMinutes'] as int?,
    statusMessage: json['statusMessage'],
  );
}

// ─── WebSocket Transport Provider ─────────────────────────────────────────────
@riverpod
class LiveTransportData extends _$LiveTransportData {
  Timer? _pollingTimer;
  WebSocketChannel? _wsChannel;
  StreamSubscription? _wsSubscription;

  @override
  FutureOr<Map<String, dynamic>> build(String studentId) async {
    // Clean up on dispose
    ref.onDispose(() {
      _stopTracking();
    });

    return _fetchData(studentId);
  }

  void startTracking() {
    _attemptWebSocketConnection();
    if (_wsChannel == null) {
      startPolling();
    }
  }

  void stopTracking() {
    _stopTracking();
  }

  void _stopTracking() {
    _wsSubscription?.cancel();
    _wsChannel?.sink.close();
    _wsChannel = null;
    _pollingTimer?.cancel();
  }

  void _attemptWebSocketConnection() {
    try {
      final wsUrl = '${AppConfig.wsBaseUrl}/ws/transport?studentId=$studentId';
      _wsChannel = WebSocketChannel.connect(Uri.parse(wsUrl));

      _wsSubscription = _wsChannel!.stream.listen(
        (message) {
          try {
            final json = Map<String, dynamic>.from(
              (message is String)
                ? (Map.from(Uri.parse('?$message').queryParameters))
                : message,
            );
            final locationUpdate = LocationUpdate.fromJson(json);
            _updateWithLocationData(locationUpdate);
          } catch (e) {
            // Silently fail on parse error
          }
        },
        onError: (_) {
          _wsChannel = null;
          _wsSubscription = null;
          // Fall back to polling on error
          startPolling();
        },
        onDone: () {
          _wsChannel = null;
          _wsSubscription = null;
          // Fall back to polling when WebSocket closes
          startPolling();
        },
      );
    } catch (e) {
      // WebSocket connection failed, fall back to polling
      _wsChannel = null;
      startPolling();
    }
  }

  void _updateWithLocationData(LocationUpdate location) {
    // Update the shared transportLocationProvider so the map widget can react
    ref.read(transportLocationProvider.notifier).state = location;

    if (state.hasValue) {
      final currentData = state.value!;
      state = AsyncValue.data({
        ...currentData,
        'locationUpdate': {
          'lat': location.lat,
          'lng': location.lng,
          'speed': location.speed,
          'etaMinutes': location.etaMinutes,
          'statusMessage': location.statusMessage,
        }
      });
    }
  }

  void startPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      refresh();
    });
  }

  void stopPolling() {
    _pollingTimer?.cancel();
  }

  Future<void> refresh() async {
    // Only refresh silently if we already have data
    if (state.hasValue) {
      state = await AsyncValue.guard(() => _fetchData(studentId));
    } else {
      state = const AsyncValue.loading();
      state = await AsyncValue.guard(() => _fetchData(studentId));
    }
  }

  Future<Map<String, dynamic>> _fetchData(String studentId) async {
    final apiClient = ref.read(apiClientProvider);
    final response = await apiClient.get('parent/transport', queryParameters: {'studentId': studentId});

    if (response.statusCode == 200 && response.data['success'] == true) {
      return response.data;
    } else if (response.statusCode == 200 && response.data['success'] == true && response.data['isActive'] == false) {
      // Return the inactive payload instead of throwing error
      return response.data;
    } else {
      throw Exception(response.data['error'] ?? 'Failed to fetch transport data');
    }
  }
}

// ─── Location Update Provider ─────────────────────────────────────────────────
final transportLocationProvider = StateProvider<LocationUpdate?>((ref) => null);
