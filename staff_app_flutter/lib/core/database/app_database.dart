import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'dart:io';

part 'app_database.g.dart';

// Table for caching role configurations securely
class RoleCache extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get roleName => text()();
  TextColumn get permissionsJson => text()();
  DateTimeColumn get lastUpdated => dateTime()();
}

// Table for offline tasks
class OfflineTasks extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get title => text()();
  BoolColumn get isCompleted => boolean().withDefault(const Constant(false))();
  DateTimeColumn get dueDate => dateTime().nullable()();
}

@DriftDatabase(tables: [RoleCache, OfflineTasks])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'db.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
