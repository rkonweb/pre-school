// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'circular_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CircularModelImpl _$$CircularModelImplFromJson(Map<String, dynamic> json) =>
    _$CircularModelImpl(
      id: json['id'] as String,
      title: json['title'] as String,
      subject: json['subject'] as String?,
      content: json['content'] as String?,
      fileUrl: json['fileUrl'] as String?,
      attachments: json['attachments'] as String? ?? '[]',
      type: json['type'] as String? ?? 'CIRCULAR',
      priority: json['priority'] as String? ?? 'NORMAL',
      category: json['category'] as String? ?? 'GENERAL',
      publishedAt: json['publishedAt'] == null
          ? null
          : DateTime.parse(json['publishedAt'] as String),
      expiresAt: json['expiresAt'] == null
          ? null
          : DateTime.parse(json['expiresAt'] as String),
      authorId: json['authorId'] as String?,
      author: json['author'] == null
          ? null
          : CircularAuthor.fromJson(json['author'] as Map<String, dynamic>),
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$$CircularModelImplToJson(_$CircularModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'subject': instance.subject,
      'content': instance.content,
      'fileUrl': instance.fileUrl,
      'attachments': instance.attachments,
      'type': instance.type,
      'priority': instance.priority,
      'category': instance.category,
      'publishedAt': instance.publishedAt?.toIso8601String(),
      'expiresAt': instance.expiresAt?.toIso8601String(),
      'authorId': instance.authorId,
      'author': instance.author,
      'createdAt': instance.createdAt?.toIso8601String(),
    };

_$CircularAuthorImpl _$$CircularAuthorImplFromJson(Map<String, dynamic> json) =>
    _$CircularAuthorImpl(
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
    );

Map<String, dynamic> _$$CircularAuthorImplToJson(
        _$CircularAuthorImpl instance) =>
    <String, dynamic>{
      'firstName': instance.firstName,
      'lastName': instance.lastName,
    };
