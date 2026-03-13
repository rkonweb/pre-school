// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'circular_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

CircularModel _$CircularModelFromJson(Map<String, dynamic> json) {
  return _CircularModel.fromJson(json);
}

/// @nodoc
mixin _$CircularModel {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String? get subject => throw _privateConstructorUsedError;
  String? get content => throw _privateConstructorUsedError;
  String? get fileUrl => throw _privateConstructorUsedError;
  String get attachments => throw _privateConstructorUsedError;
  String get type => throw _privateConstructorUsedError;
  String get priority => throw _privateConstructorUsedError;
  String get category => throw _privateConstructorUsedError;
  DateTime? get publishedAt => throw _privateConstructorUsedError;
  DateTime? get expiresAt => throw _privateConstructorUsedError;
  String? get authorId => throw _privateConstructorUsedError;
  CircularAuthor? get author => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $CircularModelCopyWith<CircularModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CircularModelCopyWith<$Res> {
  factory $CircularModelCopyWith(
          CircularModel value, $Res Function(CircularModel) then) =
      _$CircularModelCopyWithImpl<$Res, CircularModel>;
  @useResult
  $Res call(
      {String id,
      String title,
      String? subject,
      String? content,
      String? fileUrl,
      String attachments,
      String type,
      String priority,
      String category,
      DateTime? publishedAt,
      DateTime? expiresAt,
      String? authorId,
      CircularAuthor? author,
      DateTime? createdAt});

  $CircularAuthorCopyWith<$Res>? get author;
}

/// @nodoc
class _$CircularModelCopyWithImpl<$Res, $Val extends CircularModel>
    implements $CircularModelCopyWith<$Res> {
  _$CircularModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? subject = freezed,
    Object? content = freezed,
    Object? fileUrl = freezed,
    Object? attachments = null,
    Object? type = null,
    Object? priority = null,
    Object? category = null,
    Object? publishedAt = freezed,
    Object? expiresAt = freezed,
    Object? authorId = freezed,
    Object? author = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      subject: freezed == subject
          ? _value.subject
          : subject // ignore: cast_nullable_to_non_nullable
              as String?,
      content: freezed == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String?,
      fileUrl: freezed == fileUrl
          ? _value.fileUrl
          : fileUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      attachments: null == attachments
          ? _value.attachments
          : attachments // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      priority: null == priority
          ? _value.priority
          : priority // ignore: cast_nullable_to_non_nullable
              as String,
      category: null == category
          ? _value.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      publishedAt: freezed == publishedAt
          ? _value.publishedAt
          : publishedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      expiresAt: freezed == expiresAt
          ? _value.expiresAt
          : expiresAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      authorId: freezed == authorId
          ? _value.authorId
          : authorId // ignore: cast_nullable_to_non_nullable
              as String?,
      author: freezed == author
          ? _value.author
          : author // ignore: cast_nullable_to_non_nullable
              as CircularAuthor?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $CircularAuthorCopyWith<$Res>? get author {
    if (_value.author == null) {
      return null;
    }

    return $CircularAuthorCopyWith<$Res>(_value.author!, (value) {
      return _then(_value.copyWith(author: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$CircularModelImplCopyWith<$Res>
    implements $CircularModelCopyWith<$Res> {
  factory _$$CircularModelImplCopyWith(
          _$CircularModelImpl value, $Res Function(_$CircularModelImpl) then) =
      __$$CircularModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String title,
      String? subject,
      String? content,
      String? fileUrl,
      String attachments,
      String type,
      String priority,
      String category,
      DateTime? publishedAt,
      DateTime? expiresAt,
      String? authorId,
      CircularAuthor? author,
      DateTime? createdAt});

  @override
  $CircularAuthorCopyWith<$Res>? get author;
}

/// @nodoc
class __$$CircularModelImplCopyWithImpl<$Res>
    extends _$CircularModelCopyWithImpl<$Res, _$CircularModelImpl>
    implements _$$CircularModelImplCopyWith<$Res> {
  __$$CircularModelImplCopyWithImpl(
      _$CircularModelImpl _value, $Res Function(_$CircularModelImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? subject = freezed,
    Object? content = freezed,
    Object? fileUrl = freezed,
    Object? attachments = null,
    Object? type = null,
    Object? priority = null,
    Object? category = null,
    Object? publishedAt = freezed,
    Object? expiresAt = freezed,
    Object? authorId = freezed,
    Object? author = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(_$CircularModelImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      subject: freezed == subject
          ? _value.subject
          : subject // ignore: cast_nullable_to_non_nullable
              as String?,
      content: freezed == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String?,
      fileUrl: freezed == fileUrl
          ? _value.fileUrl
          : fileUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      attachments: null == attachments
          ? _value.attachments
          : attachments // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      priority: null == priority
          ? _value.priority
          : priority // ignore: cast_nullable_to_non_nullable
              as String,
      category: null == category
          ? _value.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      publishedAt: freezed == publishedAt
          ? _value.publishedAt
          : publishedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      expiresAt: freezed == expiresAt
          ? _value.expiresAt
          : expiresAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      authorId: freezed == authorId
          ? _value.authorId
          : authorId // ignore: cast_nullable_to_non_nullable
              as String?,
      author: freezed == author
          ? _value.author
          : author // ignore: cast_nullable_to_non_nullable
              as CircularAuthor?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$CircularModelImpl implements _CircularModel {
  const _$CircularModelImpl(
      {required this.id,
      required this.title,
      this.subject,
      this.content,
      this.fileUrl,
      this.attachments = '[]',
      this.type = 'CIRCULAR',
      this.priority = 'NORMAL',
      this.category = 'GENERAL',
      this.publishedAt,
      this.expiresAt,
      this.authorId,
      this.author,
      this.createdAt});

  factory _$CircularModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$CircularModelImplFromJson(json);

  @override
  final String id;
  @override
  final String title;
  @override
  final String? subject;
  @override
  final String? content;
  @override
  final String? fileUrl;
  @override
  @JsonKey()
  final String attachments;
  @override
  @JsonKey()
  final String type;
  @override
  @JsonKey()
  final String priority;
  @override
  @JsonKey()
  final String category;
  @override
  final DateTime? publishedAt;
  @override
  final DateTime? expiresAt;
  @override
  final String? authorId;
  @override
  final CircularAuthor? author;
  @override
  final DateTime? createdAt;

  @override
  String toString() {
    return 'CircularModel(id: $id, title: $title, subject: $subject, content: $content, fileUrl: $fileUrl, attachments: $attachments, type: $type, priority: $priority, category: $category, publishedAt: $publishedAt, expiresAt: $expiresAt, authorId: $authorId, author: $author, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CircularModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.subject, subject) || other.subject == subject) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.fileUrl, fileUrl) || other.fileUrl == fileUrl) &&
            (identical(other.attachments, attachments) ||
                other.attachments == attachments) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.priority, priority) ||
                other.priority == priority) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.publishedAt, publishedAt) ||
                other.publishedAt == publishedAt) &&
            (identical(other.expiresAt, expiresAt) ||
                other.expiresAt == expiresAt) &&
            (identical(other.authorId, authorId) ||
                other.authorId == authorId) &&
            (identical(other.author, author) || other.author == author) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      title,
      subject,
      content,
      fileUrl,
      attachments,
      type,
      priority,
      category,
      publishedAt,
      expiresAt,
      authorId,
      author,
      createdAt);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$CircularModelImplCopyWith<_$CircularModelImpl> get copyWith =>
      __$$CircularModelImplCopyWithImpl<_$CircularModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CircularModelImplToJson(
      this,
    );
  }
}

abstract class _CircularModel implements CircularModel {
  const factory _CircularModel(
      {required final String id,
      required final String title,
      final String? subject,
      final String? content,
      final String? fileUrl,
      final String attachments,
      final String type,
      final String priority,
      final String category,
      final DateTime? publishedAt,
      final DateTime? expiresAt,
      final String? authorId,
      final CircularAuthor? author,
      final DateTime? createdAt}) = _$CircularModelImpl;

  factory _CircularModel.fromJson(Map<String, dynamic> json) =
      _$CircularModelImpl.fromJson;

  @override
  String get id;
  @override
  String get title;
  @override
  String? get subject;
  @override
  String? get content;
  @override
  String? get fileUrl;
  @override
  String get attachments;
  @override
  String get type;
  @override
  String get priority;
  @override
  String get category;
  @override
  DateTime? get publishedAt;
  @override
  DateTime? get expiresAt;
  @override
  String? get authorId;
  @override
  CircularAuthor? get author;
  @override
  DateTime? get createdAt;
  @override
  @JsonKey(ignore: true)
  _$$CircularModelImplCopyWith<_$CircularModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CircularAuthor _$CircularAuthorFromJson(Map<String, dynamic> json) {
  return _CircularAuthor.fromJson(json);
}

/// @nodoc
mixin _$CircularAuthor {
  String get firstName => throw _privateConstructorUsedError;
  String get lastName => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $CircularAuthorCopyWith<CircularAuthor> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CircularAuthorCopyWith<$Res> {
  factory $CircularAuthorCopyWith(
          CircularAuthor value, $Res Function(CircularAuthor) then) =
      _$CircularAuthorCopyWithImpl<$Res, CircularAuthor>;
  @useResult
  $Res call({String firstName, String lastName});
}

/// @nodoc
class _$CircularAuthorCopyWithImpl<$Res, $Val extends CircularAuthor>
    implements $CircularAuthorCopyWith<$Res> {
  _$CircularAuthorCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? firstName = null,
    Object? lastName = null,
  }) {
    return _then(_value.copyWith(
      firstName: null == firstName
          ? _value.firstName
          : firstName // ignore: cast_nullable_to_non_nullable
              as String,
      lastName: null == lastName
          ? _value.lastName
          : lastName // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$CircularAuthorImplCopyWith<$Res>
    implements $CircularAuthorCopyWith<$Res> {
  factory _$$CircularAuthorImplCopyWith(_$CircularAuthorImpl value,
          $Res Function(_$CircularAuthorImpl) then) =
      __$$CircularAuthorImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String firstName, String lastName});
}

/// @nodoc
class __$$CircularAuthorImplCopyWithImpl<$Res>
    extends _$CircularAuthorCopyWithImpl<$Res, _$CircularAuthorImpl>
    implements _$$CircularAuthorImplCopyWith<$Res> {
  __$$CircularAuthorImplCopyWithImpl(
      _$CircularAuthorImpl _value, $Res Function(_$CircularAuthorImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? firstName = null,
    Object? lastName = null,
  }) {
    return _then(_$CircularAuthorImpl(
      firstName: null == firstName
          ? _value.firstName
          : firstName // ignore: cast_nullable_to_non_nullable
              as String,
      lastName: null == lastName
          ? _value.lastName
          : lastName // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$CircularAuthorImpl implements _CircularAuthor {
  const _$CircularAuthorImpl({required this.firstName, required this.lastName});

  factory _$CircularAuthorImpl.fromJson(Map<String, dynamic> json) =>
      _$$CircularAuthorImplFromJson(json);

  @override
  final String firstName;
  @override
  final String lastName;

  @override
  String toString() {
    return 'CircularAuthor(firstName: $firstName, lastName: $lastName)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CircularAuthorImpl &&
            (identical(other.firstName, firstName) ||
                other.firstName == firstName) &&
            (identical(other.lastName, lastName) ||
                other.lastName == lastName));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, firstName, lastName);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$CircularAuthorImplCopyWith<_$CircularAuthorImpl> get copyWith =>
      __$$CircularAuthorImplCopyWithImpl<_$CircularAuthorImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CircularAuthorImplToJson(
      this,
    );
  }
}

abstract class _CircularAuthor implements CircularAuthor {
  const factory _CircularAuthor(
      {required final String firstName,
      required final String lastName}) = _$CircularAuthorImpl;

  factory _CircularAuthor.fromJson(Map<String, dynamic> json) =
      _$CircularAuthorImpl.fromJson;

  @override
  String get firstName;
  @override
  String get lastName;
  @override
  @JsonKey(ignore: true)
  _$$CircularAuthorImplCopyWith<_$CircularAuthorImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
