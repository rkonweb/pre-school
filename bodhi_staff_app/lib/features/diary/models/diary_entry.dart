class DiaryEntry {
  final String id;
  final String title;
  final String? content;
  final String type;
  final String status;
  final DateTime? scheduledFor;
  final DateTime? publishedAt;
  final DateTime createdAt;
  final String authorId;
  final String? classroomId;
  
  // From includes
  final Map<String, dynamic>? author;
  final Map<String, dynamic>? classroom;

  DiaryEntry({
    required this.id,
    required this.title,
    this.content,
    required this.type,
    required this.status,
    this.scheduledFor,
    this.publishedAt,
    required this.createdAt,
    required this.authorId,
    this.classroomId,
    this.author,
    this.classroom,
  });

  factory DiaryEntry.fromJson(Map<String, dynamic> json) {
    return DiaryEntry(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      content: json['content'],
      type: json['type'] ?? 'HOMEWORK',
      status: json['status'] ?? 'PUBLISHED',
      scheduledFor: json['scheduledFor'] != null ? DateTime.parse(json['scheduledFor']) : null,
      publishedAt: json['publishedAt'] != null ? DateTime.parse(json['publishedAt']) : null,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      authorId: json['authorId'] ?? '',
      classroomId: json['classroomId'],
      author: json['author'],
      classroom: json['classroom'],
    );
  }
}
