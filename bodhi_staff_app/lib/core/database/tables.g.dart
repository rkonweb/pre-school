// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'tables.dart';

// ignore_for_file: type=lint
class $UsersTable extends Users with TableInfo<$UsersTable, User> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $UsersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _roleMeta = const VerificationMeta('role');
  @override
  late final GeneratedColumn<String> role = GeneratedColumn<String>(
      'role', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _permissionsMeta =
      const VerificationMeta('permissions');
  @override
  late final GeneratedColumn<String> permissions = GeneratedColumn<String>(
      'permissions', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _schoolSlugMeta =
      const VerificationMeta('schoolSlug');
  @override
  late final GeneratedColumn<String> schoolSlug = GeneratedColumn<String>(
      'school_slug', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns =>
      [id, name, role, permissions, schoolSlug];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'users';
  @override
  VerificationContext validateIntegrity(Insertable<User> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('role')) {
      context.handle(
          _roleMeta, role.isAcceptableOrUnknown(data['role']!, _roleMeta));
    } else if (isInserting) {
      context.missing(_roleMeta);
    }
    if (data.containsKey('permissions')) {
      context.handle(
          _permissionsMeta,
          permissions.isAcceptableOrUnknown(
              data['permissions']!, _permissionsMeta));
    } else if (isInserting) {
      context.missing(_permissionsMeta);
    }
    if (data.containsKey('school_slug')) {
      context.handle(
          _schoolSlugMeta,
          schoolSlug.isAcceptableOrUnknown(
              data['school_slug']!, _schoolSlugMeta));
    } else if (isInserting) {
      context.missing(_schoolSlugMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  User map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return User(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      role: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}role'])!,
      permissions: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}permissions'])!,
      schoolSlug: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}school_slug'])!,
    );
  }

  @override
  $UsersTable createAlias(String alias) {
    return $UsersTable(attachedDatabase, alias);
  }
}

class User extends DataClass implements Insertable<User> {
  final String id;
  final String name;
  final String role;
  final String permissions;
  final String schoolSlug;
  const User(
      {required this.id,
      required this.name,
      required this.role,
      required this.permissions,
      required this.schoolSlug});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    map['role'] = Variable<String>(role);
    map['permissions'] = Variable<String>(permissions);
    map['school_slug'] = Variable<String>(schoolSlug);
    return map;
  }

  UsersCompanion toCompanion(bool nullToAbsent) {
    return UsersCompanion(
      id: Value(id),
      name: Value(name),
      role: Value(role),
      permissions: Value(permissions),
      schoolSlug: Value(schoolSlug),
    );
  }

  factory User.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return User(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      role: serializer.fromJson<String>(json['role']),
      permissions: serializer.fromJson<String>(json['permissions']),
      schoolSlug: serializer.fromJson<String>(json['schoolSlug']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'role': serializer.toJson<String>(role),
      'permissions': serializer.toJson<String>(permissions),
      'schoolSlug': serializer.toJson<String>(schoolSlug),
    };
  }

  User copyWith(
          {String? id,
          String? name,
          String? role,
          String? permissions,
          String? schoolSlug}) =>
      User(
        id: id ?? this.id,
        name: name ?? this.name,
        role: role ?? this.role,
        permissions: permissions ?? this.permissions,
        schoolSlug: schoolSlug ?? this.schoolSlug,
      );
  @override
  String toString() {
    return (StringBuffer('User(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('role: $role, ')
          ..write('permissions: $permissions, ')
          ..write('schoolSlug: $schoolSlug')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, role, permissions, schoolSlug);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is User &&
          other.id == this.id &&
          other.name == this.name &&
          other.role == this.role &&
          other.permissions == this.permissions &&
          other.schoolSlug == this.schoolSlug);
}

class UsersCompanion extends UpdateCompanion<User> {
  final Value<String> id;
  final Value<String> name;
  final Value<String> role;
  final Value<String> permissions;
  final Value<String> schoolSlug;
  final Value<int> rowid;
  const UsersCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.role = const Value.absent(),
    this.permissions = const Value.absent(),
    this.schoolSlug = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  UsersCompanion.insert({
    required String id,
    required String name,
    required String role,
    required String permissions,
    required String schoolSlug,
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        name = Value(name),
        role = Value(role),
        permissions = Value(permissions),
        schoolSlug = Value(schoolSlug);
  static Insertable<User> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? role,
    Expression<String>? permissions,
    Expression<String>? schoolSlug,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (role != null) 'role': role,
      if (permissions != null) 'permissions': permissions,
      if (schoolSlug != null) 'school_slug': schoolSlug,
      if (rowid != null) 'rowid': rowid,
    });
  }

  UsersCompanion copyWith(
      {Value<String>? id,
      Value<String>? name,
      Value<String>? role,
      Value<String>? permissions,
      Value<String>? schoolSlug,
      Value<int>? rowid}) {
    return UsersCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      role: role ?? this.role,
      permissions: permissions ?? this.permissions,
      schoolSlug: schoolSlug ?? this.schoolSlug,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (role.present) {
      map['role'] = Variable<String>(role.value);
    }
    if (permissions.present) {
      map['permissions'] = Variable<String>(permissions.value);
    }
    if (schoolSlug.present) {
      map['school_slug'] = Variable<String>(schoolSlug.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('UsersCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('role: $role, ')
          ..write('permissions: $permissions, ')
          ..write('schoolSlug: $schoolSlug, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $StudentsTable extends Students with TableInfo<$StudentsTable, Student> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $StudentsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _classIdMeta =
      const VerificationMeta('classId');
  @override
  late final GeneratedColumn<String> classId = GeneratedColumn<String>(
      'class_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _sectionMeta =
      const VerificationMeta('section');
  @override
  late final GeneratedColumn<String> section = GeneratedColumn<String>(
      'section', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _routeIdMeta =
      const VerificationMeta('routeId');
  @override
  late final GeneratedColumn<String> routeId = GeneratedColumn<String>(
      'route_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _guardianPhoneMeta =
      const VerificationMeta('guardianPhone');
  @override
  late final GeneratedColumn<String> guardianPhone = GeneratedColumn<String>(
      'guardian_phone', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns =>
      [id, name, classId, section, routeId, guardianPhone];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'students';
  @override
  VerificationContext validateIntegrity(Insertable<Student> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('class_id')) {
      context.handle(_classIdMeta,
          classId.isAcceptableOrUnknown(data['class_id']!, _classIdMeta));
    } else if (isInserting) {
      context.missing(_classIdMeta);
    }
    if (data.containsKey('section')) {
      context.handle(_sectionMeta,
          section.isAcceptableOrUnknown(data['section']!, _sectionMeta));
    }
    if (data.containsKey('route_id')) {
      context.handle(_routeIdMeta,
          routeId.isAcceptableOrUnknown(data['route_id']!, _routeIdMeta));
    }
    if (data.containsKey('guardian_phone')) {
      context.handle(
          _guardianPhoneMeta,
          guardianPhone.isAcceptableOrUnknown(
              data['guardian_phone']!, _guardianPhoneMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Student map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Student(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      classId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}class_id'])!,
      section: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}section']),
      routeId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}route_id']),
      guardianPhone: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}guardian_phone']),
    );
  }

  @override
  $StudentsTable createAlias(String alias) {
    return $StudentsTable(attachedDatabase, alias);
  }
}

class Student extends DataClass implements Insertable<Student> {
  final String id;
  final String name;
  final String classId;
  final String? section;
  final String? routeId;
  final String? guardianPhone;
  const Student(
      {required this.id,
      required this.name,
      required this.classId,
      this.section,
      this.routeId,
      this.guardianPhone});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    map['class_id'] = Variable<String>(classId);
    if (!nullToAbsent || section != null) {
      map['section'] = Variable<String>(section);
    }
    if (!nullToAbsent || routeId != null) {
      map['route_id'] = Variable<String>(routeId);
    }
    if (!nullToAbsent || guardianPhone != null) {
      map['guardian_phone'] = Variable<String>(guardianPhone);
    }
    return map;
  }

  StudentsCompanion toCompanion(bool nullToAbsent) {
    return StudentsCompanion(
      id: Value(id),
      name: Value(name),
      classId: Value(classId),
      section: section == null && nullToAbsent
          ? const Value.absent()
          : Value(section),
      routeId: routeId == null && nullToAbsent
          ? const Value.absent()
          : Value(routeId),
      guardianPhone: guardianPhone == null && nullToAbsent
          ? const Value.absent()
          : Value(guardianPhone),
    );
  }

  factory Student.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Student(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      classId: serializer.fromJson<String>(json['classId']),
      section: serializer.fromJson<String?>(json['section']),
      routeId: serializer.fromJson<String?>(json['routeId']),
      guardianPhone: serializer.fromJson<String?>(json['guardianPhone']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'classId': serializer.toJson<String>(classId),
      'section': serializer.toJson<String?>(section),
      'routeId': serializer.toJson<String?>(routeId),
      'guardianPhone': serializer.toJson<String?>(guardianPhone),
    };
  }

  Student copyWith(
          {String? id,
          String? name,
          String? classId,
          Value<String?> section = const Value.absent(),
          Value<String?> routeId = const Value.absent(),
          Value<String?> guardianPhone = const Value.absent()}) =>
      Student(
        id: id ?? this.id,
        name: name ?? this.name,
        classId: classId ?? this.classId,
        section: section.present ? section.value : this.section,
        routeId: routeId.present ? routeId.value : this.routeId,
        guardianPhone:
            guardianPhone.present ? guardianPhone.value : this.guardianPhone,
      );
  @override
  String toString() {
    return (StringBuffer('Student(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('classId: $classId, ')
          ..write('section: $section, ')
          ..write('routeId: $routeId, ')
          ..write('guardianPhone: $guardianPhone')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, name, classId, section, routeId, guardianPhone);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Student &&
          other.id == this.id &&
          other.name == this.name &&
          other.classId == this.classId &&
          other.section == this.section &&
          other.routeId == this.routeId &&
          other.guardianPhone == this.guardianPhone);
}

class StudentsCompanion extends UpdateCompanion<Student> {
  final Value<String> id;
  final Value<String> name;
  final Value<String> classId;
  final Value<String?> section;
  final Value<String?> routeId;
  final Value<String?> guardianPhone;
  final Value<int> rowid;
  const StudentsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.classId = const Value.absent(),
    this.section = const Value.absent(),
    this.routeId = const Value.absent(),
    this.guardianPhone = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  StudentsCompanion.insert({
    required String id,
    required String name,
    required String classId,
    this.section = const Value.absent(),
    this.routeId = const Value.absent(),
    this.guardianPhone = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        name = Value(name),
        classId = Value(classId);
  static Insertable<Student> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? classId,
    Expression<String>? section,
    Expression<String>? routeId,
    Expression<String>? guardianPhone,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (classId != null) 'class_id': classId,
      if (section != null) 'section': section,
      if (routeId != null) 'route_id': routeId,
      if (guardianPhone != null) 'guardian_phone': guardianPhone,
      if (rowid != null) 'rowid': rowid,
    });
  }

  StudentsCompanion copyWith(
      {Value<String>? id,
      Value<String>? name,
      Value<String>? classId,
      Value<String?>? section,
      Value<String?>? routeId,
      Value<String?>? guardianPhone,
      Value<int>? rowid}) {
    return StudentsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      classId: classId ?? this.classId,
      section: section ?? this.section,
      routeId: routeId ?? this.routeId,
      guardianPhone: guardianPhone ?? this.guardianPhone,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (classId.present) {
      map['class_id'] = Variable<String>(classId.value);
    }
    if (section.present) {
      map['section'] = Variable<String>(section.value);
    }
    if (routeId.present) {
      map['route_id'] = Variable<String>(routeId.value);
    }
    if (guardianPhone.present) {
      map['guardian_phone'] = Variable<String>(guardianPhone.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('StudentsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('classId: $classId, ')
          ..write('section: $section, ')
          ..write('routeId: $routeId, ')
          ..write('guardianPhone: $guardianPhone, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $OfflineQueueTable extends OfflineQueue
    with TableInfo<$OfflineQueueTable, OfflineAction> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $OfflineQueueTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _typeMeta = const VerificationMeta('type');
  @override
  late final GeneratedColumn<String> type = GeneratedColumn<String>(
      'type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _payloadMeta =
      const VerificationMeta('payload');
  @override
  late final GeneratedColumn<String> payload = GeneratedColumn<String>(
      'payload', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('PENDING'));
  static const VerificationMeta _retryCountMeta =
      const VerificationMeta('retryCount');
  @override
  late final GeneratedColumn<int> retryCount = GeneratedColumn<int>(
      'retry_count', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  @override
  List<GeneratedColumn> get $columns =>
      [id, type, payload, createdAt, status, retryCount];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'offline_queue';
  @override
  VerificationContext validateIntegrity(Insertable<OfflineAction> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('type')) {
      context.handle(
          _typeMeta, type.isAcceptableOrUnknown(data['type']!, _typeMeta));
    } else if (isInserting) {
      context.missing(_typeMeta);
    }
    if (data.containsKey('payload')) {
      context.handle(_payloadMeta,
          payload.isAcceptableOrUnknown(data['payload']!, _payloadMeta));
    } else if (isInserting) {
      context.missing(_payloadMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('retry_count')) {
      context.handle(
          _retryCountMeta,
          retryCount.isAcceptableOrUnknown(
              data['retry_count']!, _retryCountMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  OfflineAction map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return OfflineAction(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      type: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}type'])!,
      payload: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}payload'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      retryCount: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}retry_count'])!,
    );
  }

  @override
  $OfflineQueueTable createAlias(String alias) {
    return $OfflineQueueTable(attachedDatabase, alias);
  }
}

class OfflineAction extends DataClass implements Insertable<OfflineAction> {
  final String id;
  final String type;
  final String payload;
  final DateTime createdAt;
  final String status;
  final int retryCount;
  const OfflineAction(
      {required this.id,
      required this.type,
      required this.payload,
      required this.createdAt,
      required this.status,
      required this.retryCount});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['type'] = Variable<String>(type);
    map['payload'] = Variable<String>(payload);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['status'] = Variable<String>(status);
    map['retry_count'] = Variable<int>(retryCount);
    return map;
  }

  OfflineQueueCompanion toCompanion(bool nullToAbsent) {
    return OfflineQueueCompanion(
      id: Value(id),
      type: Value(type),
      payload: Value(payload),
      createdAt: Value(createdAt),
      status: Value(status),
      retryCount: Value(retryCount),
    );
  }

  factory OfflineAction.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return OfflineAction(
      id: serializer.fromJson<String>(json['id']),
      type: serializer.fromJson<String>(json['type']),
      payload: serializer.fromJson<String>(json['payload']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      status: serializer.fromJson<String>(json['status']),
      retryCount: serializer.fromJson<int>(json['retryCount']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'type': serializer.toJson<String>(type),
      'payload': serializer.toJson<String>(payload),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'status': serializer.toJson<String>(status),
      'retryCount': serializer.toJson<int>(retryCount),
    };
  }

  OfflineAction copyWith(
          {String? id,
          String? type,
          String? payload,
          DateTime? createdAt,
          String? status,
          int? retryCount}) =>
      OfflineAction(
        id: id ?? this.id,
        type: type ?? this.type,
        payload: payload ?? this.payload,
        createdAt: createdAt ?? this.createdAt,
        status: status ?? this.status,
        retryCount: retryCount ?? this.retryCount,
      );
  @override
  String toString() {
    return (StringBuffer('OfflineAction(')
          ..write('id: $id, ')
          ..write('type: $type, ')
          ..write('payload: $payload, ')
          ..write('createdAt: $createdAt, ')
          ..write('status: $status, ')
          ..write('retryCount: $retryCount')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, type, payload, createdAt, status, retryCount);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is OfflineAction &&
          other.id == this.id &&
          other.type == this.type &&
          other.payload == this.payload &&
          other.createdAt == this.createdAt &&
          other.status == this.status &&
          other.retryCount == this.retryCount);
}

class OfflineQueueCompanion extends UpdateCompanion<OfflineAction> {
  final Value<String> id;
  final Value<String> type;
  final Value<String> payload;
  final Value<DateTime> createdAt;
  final Value<String> status;
  final Value<int> retryCount;
  final Value<int> rowid;
  const OfflineQueueCompanion({
    this.id = const Value.absent(),
    this.type = const Value.absent(),
    this.payload = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.status = const Value.absent(),
    this.retryCount = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  OfflineQueueCompanion.insert({
    required String id,
    required String type,
    required String payload,
    this.createdAt = const Value.absent(),
    this.status = const Value.absent(),
    this.retryCount = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        type = Value(type),
        payload = Value(payload);
  static Insertable<OfflineAction> custom({
    Expression<String>? id,
    Expression<String>? type,
    Expression<String>? payload,
    Expression<DateTime>? createdAt,
    Expression<String>? status,
    Expression<int>? retryCount,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (type != null) 'type': type,
      if (payload != null) 'payload': payload,
      if (createdAt != null) 'created_at': createdAt,
      if (status != null) 'status': status,
      if (retryCount != null) 'retry_count': retryCount,
      if (rowid != null) 'rowid': rowid,
    });
  }

  OfflineQueueCompanion copyWith(
      {Value<String>? id,
      Value<String>? type,
      Value<String>? payload,
      Value<DateTime>? createdAt,
      Value<String>? status,
      Value<int>? retryCount,
      Value<int>? rowid}) {
    return OfflineQueueCompanion(
      id: id ?? this.id,
      type: type ?? this.type,
      payload: payload ?? this.payload,
      createdAt: createdAt ?? this.createdAt,
      status: status ?? this.status,
      retryCount: retryCount ?? this.retryCount,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (type.present) {
      map['type'] = Variable<String>(type.value);
    }
    if (payload.present) {
      map['payload'] = Variable<String>(payload.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (retryCount.present) {
      map['retry_count'] = Variable<int>(retryCount.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('OfflineQueueCompanion(')
          ..write('id: $id, ')
          ..write('type: $type, ')
          ..write('payload: $payload, ')
          ..write('createdAt: $createdAt, ')
          ..write('status: $status, ')
          ..write('retryCount: $retryCount, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SyncStateTable extends SyncState
    with TableInfo<$SyncStateTable, SyncStateRecord> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SyncStateTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _entityMeta = const VerificationMeta('entity');
  @override
  late final GeneratedColumn<String> entity = GeneratedColumn<String>(
      'entity', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _lastSyncedAtMeta =
      const VerificationMeta('lastSyncedAt');
  @override
  late final GeneratedColumn<int> lastSyncedAt = GeneratedColumn<int>(
      'last_synced_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [entity, lastSyncedAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sync_state';
  @override
  VerificationContext validateIntegrity(Insertable<SyncStateRecord> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('entity')) {
      context.handle(_entityMeta,
          entity.isAcceptableOrUnknown(data['entity']!, _entityMeta));
    } else if (isInserting) {
      context.missing(_entityMeta);
    }
    if (data.containsKey('last_synced_at')) {
      context.handle(
          _lastSyncedAtMeta,
          lastSyncedAt.isAcceptableOrUnknown(
              data['last_synced_at']!, _lastSyncedAtMeta));
    } else if (isInserting) {
      context.missing(_lastSyncedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {entity};
  @override
  SyncStateRecord map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SyncStateRecord(
      entity: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}entity'])!,
      lastSyncedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}last_synced_at'])!,
    );
  }

  @override
  $SyncStateTable createAlias(String alias) {
    return $SyncStateTable(attachedDatabase, alias);
  }
}

class SyncStateRecord extends DataClass implements Insertable<SyncStateRecord> {
  final String entity;
  final int lastSyncedAt;
  const SyncStateRecord({required this.entity, required this.lastSyncedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['entity'] = Variable<String>(entity);
    map['last_synced_at'] = Variable<int>(lastSyncedAt);
    return map;
  }

  SyncStateCompanion toCompanion(bool nullToAbsent) {
    return SyncStateCompanion(
      entity: Value(entity),
      lastSyncedAt: Value(lastSyncedAt),
    );
  }

  factory SyncStateRecord.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SyncStateRecord(
      entity: serializer.fromJson<String>(json['entity']),
      lastSyncedAt: serializer.fromJson<int>(json['lastSyncedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'entity': serializer.toJson<String>(entity),
      'lastSyncedAt': serializer.toJson<int>(lastSyncedAt),
    };
  }

  SyncStateRecord copyWith({String? entity, int? lastSyncedAt}) =>
      SyncStateRecord(
        entity: entity ?? this.entity,
        lastSyncedAt: lastSyncedAt ?? this.lastSyncedAt,
      );
  @override
  String toString() {
    return (StringBuffer('SyncStateRecord(')
          ..write('entity: $entity, ')
          ..write('lastSyncedAt: $lastSyncedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(entity, lastSyncedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SyncStateRecord &&
          other.entity == this.entity &&
          other.lastSyncedAt == this.lastSyncedAt);
}

class SyncStateCompanion extends UpdateCompanion<SyncStateRecord> {
  final Value<String> entity;
  final Value<int> lastSyncedAt;
  final Value<int> rowid;
  const SyncStateCompanion({
    this.entity = const Value.absent(),
    this.lastSyncedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SyncStateCompanion.insert({
    required String entity,
    required int lastSyncedAt,
    this.rowid = const Value.absent(),
  })  : entity = Value(entity),
        lastSyncedAt = Value(lastSyncedAt);
  static Insertable<SyncStateRecord> custom({
    Expression<String>? entity,
    Expression<int>? lastSyncedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (entity != null) 'entity': entity,
      if (lastSyncedAt != null) 'last_synced_at': lastSyncedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SyncStateCompanion copyWith(
      {Value<String>? entity, Value<int>? lastSyncedAt, Value<int>? rowid}) {
    return SyncStateCompanion(
      entity: entity ?? this.entity,
      lastSyncedAt: lastSyncedAt ?? this.lastSyncedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (entity.present) {
      map['entity'] = Variable<String>(entity.value);
    }
    if (lastSyncedAt.present) {
      map['last_synced_at'] = Variable<int>(lastSyncedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SyncStateCompanion(')
          ..write('entity: $entity, ')
          ..write('lastSyncedAt: $lastSyncedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  late final $UsersTable users = $UsersTable(this);
  late final $StudentsTable students = $StudentsTable(this);
  late final $OfflineQueueTable offlineQueue = $OfflineQueueTable(this);
  late final $SyncStateTable syncState = $SyncStateTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities =>
      [users, students, offlineQueue, syncState];
}
