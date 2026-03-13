import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:url_launcher/url_launcher.dart';
import 'circular_model.dart';

class CircularDetailView extends StatelessWidget {
  final CircularModel circular;

  const CircularDetailView({super.key, required this.circular});

  @override
  Widget build(BuildContext context) {
    final isUrgent = circular.priority == 'URGENT';
    
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          circular.category ?? 'Circular',
          style: const TextStyle(
            fontFamily: 'Cabinet Grotesk',
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: Color(0xFF140E28),
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Color(0xFF140E28)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (isUrgent)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFFECACA)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.priority_high_rounded, size: 14, color: Color(0xFFEF4444)),
                    SizedBox(width: 4),
                    Text(
                      'URGENT ATTENTION REQUIRED',
                      style: TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFFEF4444),
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            Text(
              circular.title,
              style: const TextStyle(
                fontFamily: 'Cabinet Grotesk',
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: Color(0xFF140E28),
                letterSpacing: -0.5,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                CircleAvatar(
                  radius: 12,
                  backgroundColor: const Color(0xFFF5F3FF),
                  child: Text(
                    circular.author?.firstName[0] ?? 'S',
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF7C3AED)),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  'By ${circular.author?.firstName ?? 'School Admin'} ${circular.author?.lastName ?? ''}',
                  style: const TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF64748B),
                  ),
                ),
                const Spacer(),
                Text(
                  circular.publishedAt != null 
                    ? '${circular.publishedAt!.day}/${circular.publishedAt!.month}/${circular.publishedAt!.year}'
                    : '',
                  style: const TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 12,
                    color: Color(0xFFB5B0C4),
                  ),
                ),
              ],
            ),
            const Divider(height: 40, color: Color(0xFFE2E8F0)),
            if (circular.subject != null) ...[
              Text(
                circular.subject!,
                style: const TextStyle(
                  fontFamily: 'Satoshi',
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF140E28),
                ),
              ),
              const SizedBox(height: 16),
            ],
            MarkdownBody(
              data: circular.content ?? '',
              styleSheet: MarkdownStyleSheet(
                p: const TextStyle(
                  fontFamily: 'Satoshi',
                  fontSize: 14,
                  height: 1.6,
                  color: Color(0xFF475569),
                ),
              ),
            ),
            const SizedBox(height: 32),
            if (circular.fileUrl != null && circular.fileUrl!.isNotEmpty) ...[
              const Text(
                'ATTACHMENTS',
                style: TextStyle(
                  fontFamily: 'Satoshi',
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF140E28),
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: () => launchUrl(Uri.parse(circular.fileUrl!)),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.insert_drive_file_outlined, size: 24, color: Color(0xFF7C3AED)),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'View Attachment',
                          style: TextStyle(
                            fontFamily: 'Satoshi',
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF140E28),
                          ),
                        ),
                      ),
                      Icon(Icons.open_in_new_rounded, size: 16, color: Color(0xFF64748B)),
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
