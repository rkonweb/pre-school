import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class DiaryPreviewWidget extends StatelessWidget {
  final Map<String, dynamic>? diaryPreview;
  final VoidCallback onTap;

  const DiaryPreviewWidget({Key? key, this.diaryPreview, required this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10).copyWith(bottom: 30),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE2E8F0)), // slate-200
          boxShadow: const [
            BoxShadow(
              color: Color(0x0A000000),
              blurRadius: 10,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [Color(0xFF0E7490), Color(0xFF0891B2)], // cyan-700 to cyan-600
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.book_outlined, color: Colors.white, size: 16),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'School Diary',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.t1,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.peachBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppTheme.peachBorder),
                      ),
                      child: const Text(
                        '2 Unread',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.peachAcc,
                        ),
                      ),
                    ),
                  ],
                ),
                const Text(
                  'View All →',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.a1,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Content
            if (diaryPreview != null) ...[
               Container(
                 width: double.infinity,
                 padding: const EdgeInsets.all(12),
                 decoration: BoxDecoration(
                   color: AppTheme.skyBg,
                   borderRadius: BorderRadius.circular(12),
                 ),
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     Text(
                       diaryPreview!['title'] ?? 'No Title',
                       style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.t1),
                     ),
                     const SizedBox(height: 4),
                     Text(
                       'By ${diaryPreview!['author'] ?? 'Teacher'}',
                       style: const TextStyle(fontSize: 10, color: AppTheme.t3),
                     ),
                   ],
                 )
               )
            ] else ...[
               // Mood Strip fallback if no diary note exists
               Container(
                 padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                 decoration: BoxDecoration(
                   color: Colors.white,
                   borderRadius: BorderRadius.circular(16),
                   border: Border.all(color: const Color(0xFFE2E8F0)),
                 ),
                 child: Row(
                   children: [
                     const Text(
                       "TODAY'S MOOD",
                       style: TextStyle(
                         fontSize: 10,
                         fontWeight: FontWeight.bold,
                         color: AppTheme.t3,
                         letterSpacing: 0.5,
                       ),
                     ),
                     const SizedBox(width: 12),
                     const Text('😢  😐 '),
                     Container(
                       decoration: BoxDecoration(
                         color: const Color(0xFFFEF9C3).withOpacity(0.5), // yellow-100
                         shape: BoxShape.circle,
                         border: Border.all(color: const Color(0xFFFDE047)), // yellow-400
                       ),
                       padding: const EdgeInsets.all(4),
                       child: const Text('😊', style: TextStyle(fontSize: 18)),
                     ),
                     const Text('  😄  🤔'),
                     const Spacer(),
                     const Row(
                       children: [
                         Icon(Icons.check, color: AppTheme.sageAcc, size: 12),
                         SizedBox(width: 4),
                         Text(
                           'Happy',
                           style: TextStyle(
                             fontSize: 10,
                             fontWeight: FontWeight.bold,
                             color: AppTheme.sageAcc,
                           ),
                         ),
                       ],
                     ),
                   ],
                 ),
               ),
               const SizedBox(height: 12),
               
               // Compose Button
               Container(
                 width: double.infinity,
                 padding: const EdgeInsets.symmetric(vertical: 12),
                 decoration: BoxDecoration(
                   color: AppTheme.peachBg,
                   borderRadius: BorderRadius.circular(14),
                   border: Border.all(
                     color: AppTheme.peachBorder,
                   ),
                 ),
                 child: const Row(
                   mainAxisAlignment: MainAxisAlignment.center,
                   children: [
                     Icon(Icons.edit_outlined, color: AppTheme.peachAcc, size: 16),
                     SizedBox(width: 8),
                     Text(
                       'Write a note to school',
                       style: TextStyle(
                         fontSize: 12,
                         fontWeight: FontWeight.bold,
                         color: AppTheme.peachAcc,
                       ),
                     ),
                   ],
                 ),
               ),
            ],
          ],
        ),
      ),
    );
  }
}
