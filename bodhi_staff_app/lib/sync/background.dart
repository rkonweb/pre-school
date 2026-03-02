import 'package:workmanager/workmanager.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/database/database_provider.dart';
import 'network.dart';
import 'engine.dart';

const syncTask = "com.bodhiboard.staffapp.sync";

@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    switch (task) {
      case syncTask:
        // We have to build a local container since Workmanager runs in a separate isolate
        final container = ProviderContainer();

        try {
          final engine = container.read(syncEngineProvider);

          // Execute background operations
          await engine.pushSync();
          await engine.pullSync(['students', 'timetable', 'routes']);

          return Future.value(true);
        } catch (e) {
          print("Background Sync Failed: \$e");
          return Future.value(false); // Triggers exponential backoff retry
        } finally {
          container.dispose();
        }
      default:
        return Future.value(true);
    }
  });
}

/// Helper method to initialize WorkManager in main.dart
void initializeBackgroundSync() {
  Workmanager().initialize(
    callbackDispatcher,
    // Set true for debugging notifications
    isInDebugMode: false,
  );

  // Register Periodic Task (Runs roughly every 15-30 mins depending on OS DOZE restrictions)
  Workmanager().registerPeriodicTask(
    "1",
    syncTask,
    frequency: const Duration(minutes: 15),
    constraints: Constraints(
      networkType: NetworkType.connected, // Only run if network is available
      requiresBatteryNotLow: true,
    ),
    backoffPolicy: BackoffPolicy.exponential,
    backoffPolicyDelay: const Duration(minutes: 5),
  );
}
