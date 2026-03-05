class LibraryBook {
  final String title;
  final String author;
  final String? isbn;
  final String category;
  final String? publisher;
  final String? coverUrl;

  LibraryBook({
    required this.title,
    required this.author,
    this.isbn,
    required this.category,
    this.publisher,
    this.coverUrl,
  });

  factory LibraryBook.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return LibraryBook(
        title: 'Unknown Title',
        author: 'Unknown Author',
        category: 'General',
      );
    }
    return LibraryBook(
      title: json['title'] ?? 'Unknown Title',
      author: json['author'] ?? 'Unknown Author',
      isbn: json['isbn'],
      category: json['category'] ?? 'General',
      publisher: json['publisher'],
      coverUrl: json['coverUrl'],
    );
  }
}

class LibraryTransaction {
  final String id;
  final LibraryBook book;
  final DateTime issuedDate;
  final DateTime dueDate;
  final DateTime? returnedDate;
  final String status;
  final double fineAmount;

  LibraryTransaction({
    required this.id,
    required this.book,
    required this.issuedDate,
    required this.dueDate,
    this.returnedDate,
    required this.status,
    required this.fineAmount,
  });

  factory LibraryTransaction.fromJson(Map<String, dynamic> json) {
    return LibraryTransaction(
      id: json['id'] ?? '',
      book: LibraryBook.fromJson(json['book'] as Map<String, dynamic>?),
      issuedDate: json['issuedDate'] != null 
          ? DateTime.tryParse(json['issuedDate']) ?? DateTime.now() 
          : DateTime.now(),
      dueDate: json['dueDate'] != null 
          ? DateTime.tryParse(json['dueDate']) ?? DateTime.now() 
          : DateTime.now(),
      returnedDate: json['returnedDate'] != null
          ? DateTime.tryParse(json['returnedDate'])
          : null,
      status: json['status'] ?? 'UNKNOWN',
      fineAmount: (json['fineAmount'] ?? 0).toDouble(),
    );
  }

  // Helper getters for UI presentation
  bool get isOverdue => status == 'OVERDUE';
  bool get isReturned => status == 'RETURNED';
  bool get isIssued => status == 'ISSUED';
}
