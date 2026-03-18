// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $RoleCacheTable extends RoleCache
    with TableInfo<$RoleCacheTable, RoleCacheData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $RoleCacheTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _roleNameMeta =
      const VerificationMeta('roleName');
  @override
  late final GeneratedColumn<String> roleName = GeneratedColumn<String>(
      'role_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _permissionsJsonMeta =
      const VerificationMeta('permissionsJson');
  @override
  late final GeneratedColumn<String> permissionsJson = GeneratedColumn<String>(
      'permissions_json', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _lastUpdatedMeta =
      const VerificationMeta('lastUpdated');
  @override
  late final GeneratedColumn<DateTime> lastUpdated = GeneratedColumn<DateTime>(
      'last_updated', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns =>
      [id, roleName, permissionsJson, lastUpdated];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'role_cache';
  @override
  VerificationContext validateIntegrity(Insertable<RoleCacheData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('role_name')) {
      context.handle(_roleNameMeta,
          roleName.isAcceptableOrUnknown(data['role_name']!, _roleNameMeta));
    } else if (isInserting) {
      context.missing(_roleNameMeta);
    }
    if (data.containsKey('permissions_json')) {
      context.handle(
          _permissionsJsonMeta,
          permissionsJson.isAcceptableOrUnknown(
              data['permissions_json']!, _permissionsJsonMeta));
    } else if (isInserting) {
      context.missing(_permissionsJsonMeta);
    }
    if (data.containsKey('last_updated')) {
      context.handle(
          _lastUpdatedMeta,
          lastUpdated.isAcceptableOrUnknown(
              data['last_updated']!, _lastUpdatedMeta));
    } else if (isInserting) {
      context.missing(_lastUpdatedMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  RoleCacheData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return RoleCacheData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      roleName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}role_name'])!,
      permissionsJson: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}permissions_json'])!,
      lastUpdated: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}last_updated'])!,
    );
  }

  @override
  $RoleCacheTable createAlias(String alias) {
    return $RoleCacheTable(attachedDatabase, alias);
  }
}

class RoleCacheData extends DataClass implements Insertable<RoleCacheData> {
  final int id;
  final String roleName;
  final String permissionsJson;
  final DateTime lastUpdated;
  const RoleCacheData(
      {required this.id,
      required this.roleName,
      required this.permissionsJson,
      required this.lastUpdated});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['role_name'] = Variable<String>(roleName);
    map['permissions_json'] = Variable<String>(permissionsJson);
    map['last_updated'] = Variable<DateTime>(lastUpdated);
    return map;
  }

  RoleCacheCompanion toCompanion(bool nullToAbsent) {
    return RoleCacheCompanion(
      id: Value(id),
      roleName: Value(roleName),
      permissionsJson: Value(permissionsJson),
      lastUpdated: Value(lastUpdated),
    );
  }

  factory RoleCacheData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return RoleCacheData(
      id: serializer.fromJson<int>(json['id']),
      roleName: serializer.fromJson<String>(json['roleName']),
      permissionsJson: serializer.fromJson<String>(json['permissionsJson']),
      lastUpdated: serializer.fromJson<DateTime>(json['lastUpdated']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'roleName': serializer.toJson<String>(roleName),
      'permissionsJson': serializer.toJson<String>(permissionsJson),
      'lastUpdated': serializer.toJson<DateTime>(lastUpdated),
    };
  }

  RoleCacheData copyWith(
          {int? id,
          String? roleName,
          String? permissionsJson,
          DateTime? lastUpdated}) =>
      RoleCacheData(
        id: id ?? this.id,
        roleName: roleName ?? this.roleName,
        permissionsJson: permissionsJson ?? this.permissionsJson,
        lastUpdated: lastUpdated ?? this.lastUpdated,
      );
  @override
  String toString() {
    return (StringBuffer('RoleCacheData(')
          ..write('id: $id, ')
          ..write('roleName: $roleName, ')
          ..write('permissionsJson: $permissionsJson, ')
          ..write('lastUpdated: $lastUpdated')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, roleName, permissionsJson, lastUpdated);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is RoleCacheData &&
          other.id == this.id &&
          other.roleName == this.roleName &&
          other.permissionsJson == this.permissionsJson &&
          other.lastUpdated == this.lastUpdated);
}

class RoleCacheCompanion extends UpdateCompanion<RoleCacheData> {
  final Value<int> id;
  final Value<String> roleName;
  final Value<String> permissionsJson;
  final Value<DateTime> lastUpdated;
  const RoleCacheCompanion({
    this.id = const Value.absent(),
    this.roleName = const Value.absent(),
    this.permissionsJson = const Value.absent(),
    this.lastUpdated = const Value.absent(),
  });
  RoleCacheCompanion.insert({
    this.id = const Value.absent(),
    required String roleName,
    required String permissionsJson,
    required DateTime lastUpdated,
  })  : roleName = Value(roleName),
        permissionsJson = Value(permissionsJson),
        lastUpdated = Value(lastUpdated);
  static Insertable<RoleCacheData> custom({
    Expression<int>? id,
    Expression<String>? roleName,
    Expression<String>? permissionsJson,
    Expression<DateTime>? lastUpdated,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (roleName != null) 'role_name': roleName,
      if (permissionsJson != null) 'permissions_json': permissionsJson,
      if (lastUpdated != null) 'last_updated': lastUpdated,
    });
  }

  RoleCacheCompanion copyWith(
      {Value<int>? id,
      Value<String>? roleName,
      Value<String>? permissionsJson,
      Value<DateTime>? lastUpdated}) {
    return RoleCacheCompanion(
      id: id ?? this.id,
      roleName: roleName ?? this.roleName,
      permissionsJson: permissionsJson ?? this.permissionsJson,
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (roleName.present) {
      map['role_name'] = Variable<String>(roleName.value);
    }
    if (permissionsJson.present) {
      map['permissions_json'] = Variable<String>(permissionsJson.value);
    }
    if (lastUpdated.present) {
      map['last_updated'] = Variable<DateTime>(lastUpdated.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('RoleCacheCompanion(')
          ..write('id: $id, ')
          ..write('roleName: $roleName, ')
          ..write('permissionsJson: $permissionsJson, ')
          ..write('lastUpdated: $lastUpdated')
          ..write(')'))
        .toString();
  }
}

class $OfflineTasksTable extends OfflineTasks
    with TableInfo<$OfflineTasksTable, OfflineTask> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $OfflineTasksTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _isCompletedMeta =
      const VerificationMeta('isCompleted');
  @override
  late final GeneratedColumn<bool> isCompleted = GeneratedColumn<bool>(
      'is_completed', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("is_completed" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _dueDateMeta =
      const VerificationMeta('dueDate');
  @override
  late final GeneratedColumn<DateTime> dueDate = GeneratedColumn<DateTime>(
      'due_date', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [id, title, isCompleted, dueDate];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'offline_tasks';
  @override
  VerificationContext validateIntegrity(Insertable<OfflineTask> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('is_completed')) {
      context.handle(
          _isCompletedMeta,
          isCompleted.isAcceptableOrUnknown(
              data['is_completed']!, _isCompletedMeta));
    }
    if (data.containsKey('due_date')) {
      context.handle(_dueDateMeta,
          dueDate.isAcceptableOrUnknown(data['due_date']!, _dueDateMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  OfflineTask map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return OfflineTask(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      isCompleted: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_completed'])!,
      dueDate: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}due_date']),
    );
  }

  @override
  $OfflineTasksTable createAlias(String alias) {
    return $OfflineTasksTable(attachedDatabase, alias);
  }
}

class OfflineTask extends DataClass implements Insertable<OfflineTask> {
  final int id;
  final String title;
  final bool isCompleted;
  final DateTime? dueDate;
  const OfflineTask(
      {required this.id,
      required this.title,
      required this.isCompleted,
      this.dueDate});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['title'] = Variable<String>(title);
    map['is_completed'] = Variable<bool>(isCompleted);
    if (!nullToAbsent || dueDate != null) {
      map['due_date'] = Variable<DateTime>(dueDate);
    }
    return map;
  }

  OfflineTasksCompanion toCompanion(bool nullToAbsent) {
    return OfflineTasksCompanion(
      id: Value(id),
      title: Value(title),
      isCompleted: Value(isCompleted),
      dueDate: dueDate == null && nullToAbsent
          ? const Value.absent()
          : Value(dueDate),
    );
  }

  factory OfflineTask.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return OfflineTask(
      id: serializer.fromJson<int>(json['id']),
      title: serializer.fromJson<String>(json['title']),
      isCompleted: serializer.fromJson<bool>(json['isCompleted']),
      dueDate: serializer.fromJson<DateTime?>(json['dueDate']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'title': serializer.toJson<String>(title),
      'isCompleted': serializer.toJson<bool>(isCompleted),
      'dueDate': serializer.toJson<DateTime?>(dueDate),
    };
  }

  OfflineTask copyWith(
          {int? id,
          String? title,
          bool? isCompleted,
          Value<DateTime?> dueDate = const Value.absent()}) =>
      OfflineTask(
        id: id ?? this.id,
        title: title ?? this.title,
        isCompleted: isCompleted ?? this.isCompleted,
        dueDate: dueDate.present ? dueDate.value : this.dueDate,
      );
  @override
  String toString() {
    return (StringBuffer('OfflineTask(')
          ..write('id: $id, ')
          ..write('title: $title, ')
          ..write('isCompleted: $isCompleted, ')
          ..write('dueDate: $dueDate')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, title, isCompleted, dueDate);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is OfflineTask &&
          other.id == this.id &&
          other.title == this.title &&
          other.isCompleted == this.isCompleted &&
          other.dueDate == this.dueDate);
}

class OfflineTasksCompanion extends UpdateCompanion<OfflineTask> {
  final Value<int> id;
  final Value<String> title;
  final Value<bool> isCompleted;
  final Value<DateTime?> dueDate;
  const OfflineTasksCompanion({
    this.id = const Value.absent(),
    this.title = const Value.absent(),
    this.isCompleted = const Value.absent(),
    this.dueDate = const Value.absent(),
  });
  OfflineTasksCompanion.insert({
    this.id = const Value.absent(),
    required String title,
    this.isCompleted = const Value.absent(),
    this.dueDate = const Value.absent(),
  }) : title = Value(title);
  static Insertable<OfflineTask> custom({
    Expression<int>? id,
    Expression<String>? title,
    Expression<bool>? isCompleted,
    Expression<DateTime>? dueDate,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (title != null) 'title': title,
      if (isCompleted != null) 'is_completed': isCompleted,
      if (dueDate != null) 'due_date': dueDate,
    });
  }

  OfflineTasksCompanion copyWith(
      {Value<int>? id,
      Value<String>? title,
      Value<bool>? isCompleted,
      Value<DateTime?>? dueDate}) {
    return OfflineTasksCompanion(
      id: id ?? this.id,
      title: title ?? this.title,
      isCompleted: isCompleted ?? this.isCompleted,
      dueDate: dueDate ?? this.dueDate,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (isCompleted.present) {
      map['is_completed'] = Variable<bool>(isCompleted.value);
    }
    if (dueDate.present) {
      map['due_date'] = Variable<DateTime>(dueDate.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('OfflineTasksCompanion(')
          ..write('id: $id, ')
          ..write('title: $title, ')
          ..write('isCompleted: $isCompleted, ')
          ..write('dueDate: $dueDate')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  late final $RoleCacheTable roleCache = $RoleCacheTable(this);
  late final $OfflineTasksTable offlineTasks = $OfflineTasksTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [roleCache, offlineTasks];
}
