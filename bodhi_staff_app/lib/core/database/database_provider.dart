import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'dart:io';
import 'tables.dart';

// Provides the global singleton instance of the Drift Database
final dbProvider = Provider<AppDatabase>((ref) {
  return AppDatabase(LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'bodhi_staff.sqlite'));
    return NativeDatabase(file);
  }));
});
