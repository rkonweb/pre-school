import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'tables.dart';
import 'connection/unsupported.dart'
    if (dart.library.js_interop) 'connection/web.dart'
    if (dart.library.io) 'connection/native.dart';

// Provides the global singleton instance of the Drift Database
final dbProvider = Provider<AppDatabase>((ref) {
  return AppDatabase(openDatabase());
});
