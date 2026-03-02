import 'package:drift/drift.dart';

// Assuming we run build_runner to generate this part
part 'tables.g.dart';

/// Users Table: Stores local caching of staff profile and permissions
@DataClassName('User')
class Users extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get role => text()();
  TextColumn get permissions => text()(); // Stored as JSON string locally
  TextColumn get schoolSlug => text()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Students Table: Cached list of students assigned to the staff member
@DataClassName('Student')
class Students extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get classId => text()();
  TextColumn get section => text().nullable()();
  TextColumn get routeId => text().nullable()();
  TextColumn get guardianPhone => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Offline Queue Table: Heart of the offline-first mutations layer
@DataClassName('OfflineAction')
class OfflineQueue extends Table {
  TextColumn get id => text()(); // UUID
  TextColumn get type => text()(); // e.g. 'MARK_ATTENDANCE'
  TextColumn get payload => text()(); // JSON string payload for API
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  TextColumn get status => text()
      .withDefault(const Constant('PENDING'))(); // PENDING, SYNCING, FAILED
  IntColumn get retryCount => integer().withDefault(const Constant(0))();

  @override
  Set<Column> get primaryKey => {id};
}

/// Sync State Table: Tracks last successful pull timestamps per entity
@DataClassName('SyncStateRecord')
class SyncState extends Table {
  TextColumn get entity => text()(); // e.g., 'students', 'timetable'
  IntColumn get lastSyncedAt => integer()(); // Epoch timestamp

  @override
  Set<Column> get primaryKey => {entity};
}

@DriftDatabase(tables: [Users, Students, OfflineQueue, SyncState])
class AppDatabase extends _$AppDatabase {
  AppDatabase(QueryExecutor e) : super(e);

  @override
  int get schemaVersion => 1;
}
