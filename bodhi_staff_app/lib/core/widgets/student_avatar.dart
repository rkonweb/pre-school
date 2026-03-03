import 'package:flutter/material.dart';

/// A reusable widget that shows a student's profile photo if available,
/// or a styled letter-initial fallback. Works with absolute and relative URLs.
class StudentAvatar extends StatelessWidget {
  final String? avatarUrl;
  final String name;
  final double radius;
  final Color backgroundColor;
  final Color textColor;

  const StudentAvatar({
    Key? key,
    required this.name,
    this.avatarUrl,
    this.radius = 22,
    this.backgroundColor = const Color(0xFFF3F4F6),
    this.textColor = const Color(0xFF6B7280),
  }) : super(key: key);

  String get _resolvedUrl {
    if (avatarUrl == null || avatarUrl!.isEmpty) return '';
    if (avatarUrl!.startsWith('http://') || avatarUrl!.startsWith('https://')) {
      return avatarUrl!;
    }
    // Relative URL — prefix with local server
    final path = avatarUrl!.startsWith('/') ? avatarUrl! : '/$avatarUrl';
    return 'http://localhost:3000$path';
  }

  String get _initial =>
      name.trim().isNotEmpty ? name.trim()[0].toUpperCase() : '?';

  @override
  Widget build(BuildContext context) {
    final url = _resolvedUrl;

    return CircleAvatar(
      radius: radius,
      backgroundColor: backgroundColor,
      child: ClipOval(
        child: url.isEmpty
            ? _buildInitial()
            : Image.network(
                url,
                width: radius * 2,
                height: radius * 2,
                fit: BoxFit.cover,
                loadingBuilder: (context, child, progress) {
                  if (progress == null) return child;
                  return _buildInitial();
                },
                errorBuilder: (context, error, stackTrace) => _buildInitial(),
              ),
      ),
    );
  }

  Widget _buildInitial() {
    return Container(
      width: radius * 2,
      height: radius * 2,
      color: backgroundColor,
      alignment: Alignment.center,
      child: Text(
        _initial,
        style: TextStyle(
          color: textColor,
          fontWeight: FontWeight.w700,
          fontSize: radius * 0.75,
        ),
      ),
    );
  }
}
