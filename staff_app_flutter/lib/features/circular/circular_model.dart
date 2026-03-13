import 'package:freezed_annotation/freezed_annotation.dart';

part 'circular_model.freezed.dart';
part 'circular_model.g.dart';

@freezed
class CircularModel with _$CircularModel {
  const factory CircularModel({
    required String id,
    required String title,
    String? subject,
    String? content,
    String? fileUrl,
    @Default('[]') String attachments,
    @Default('CIRCULAR') String type,
    @Default('NORMAL') String priority,
    @Default('GENERAL') String category,
    DateTime? publishedAt,
    DateTime? expiresAt,
    String? authorId,
    CircularAuthor? author,
    DateTime? createdAt,
  }) = _CircularModel;

  factory CircularModel.fromJson(Map<String, dynamic> json) => _$CircularModelFromJson(json);
}

@freezed
class CircularAuthor with _$CircularAuthor {
  const factory CircularAuthor({
    required String firstName,
    required String lastName,
  }) = _CircularAuthor;

  factory CircularAuthor.fromJson(Map<String, dynamic> json) => _$CircularAuthorFromJson(json);
}
