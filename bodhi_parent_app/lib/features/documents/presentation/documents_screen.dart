import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../../dashboard/data/dashboard_provider.dart';
import '../data/documents_provider.dart';

class DocumentsScreen extends ConsumerStatefulWidget {
  const DocumentsScreen({super.key});

  @override
  ConsumerState<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends ConsumerState<DocumentsScreen> {
  String _selectedFilter = 'All';

  @override
  Widget build(BuildContext context) {
    final dashboardAsync = ref.watch(dashboardDataProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: const AppHeader(
        title: 'Documents',
        subtitle: 'Official school records',
      ),
      body: Consumer(
        builder: (context, ref, child) {
          final activeStudent = ref.watch(activeStudentProvider);

          if (activeStudent == null) {
            return const Center(child: Text('No students found.'));
          }

          final studentId = activeStudent['id']?.toString();
          if (studentId == null) {
            return const Center(child: Text('Student ID not found.'));
          }

          final docsAsync = ref.watch(documentsProvider(studentId));

          return docsAsync.when(
            data: (allDocs) {
              final docs = _selectedFilter == 'All'
                  ? allDocs
                  : allDocs.where((d) => d.type == _selectedFilter).toList();

              return RefreshIndicator(
                onRefresh: () => ref.refresh(documentsProvider(studentId).future),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 10),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: ['All', 'REPORT_CARD', 'FEE_RECEIPT', 'TC', 'CERTIFICATE']
                              .map((filter) {
                            final isSelected = _selectedFilter == filter;
                            return GestureDetector(
                              onTap: () => setState(() => _selectedFilter = filter),
                              child: Container(
                                margin: const EdgeInsets.only(right: 8),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                decoration: BoxDecoration(
                                  color: isSelected ? const Color(0xFF3B6EF8) : Colors.white,
                                  border: Border.all(
                                    color: isSelected ? const Color(0xFF3B6EF8) : const Color(0xFFE2E8F0),
                                  ),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  filter == 'All'
                                      ? 'All'
                                      : filter
                                          .replaceAll('_', ' ')
                                          .split(' ')
                                          .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
                                          .join(' '),
                                  style: GoogleFonts.dmSans(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: isSelected ? Colors.white : const Color(0xFF64748B),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      const SizedBox(height: 20),
                      if (docs.isEmpty)
                        Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.folder_open_outlined, size: 64, color: Colors.grey.shade300),
                              const SizedBox(height: 16),
                              Text(
                                'No documents found',
                                style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
                              ),
                            ],
                          ),
                        )
                      else
                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 1.0,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                          itemCount: docs.length,
                          itemBuilder: (ctx, i) => _buildDocumentCard(docs[i], i),
                        ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(err.toString(), textAlign: TextAlign.center),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDocumentCard(SchoolDocument doc, int index) {
    final typeIcon = _getTypeIcon(doc.type);
    final typeColor = _getTypeColor(doc.type);
    final dt = DateTime.tryParse(doc.createdAt);
    final dateStr = dt != null ? '${dt.day}/${dt.month}/${dt.year}' : 'N/A';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: typeColor.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(typeIcon, color: typeColor, size: 26),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        doc.title,
                        style: GoogleFonts.sora(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF1E293B),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        dateStr,
                        style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF94A3B8)),
                      ),
                      if (doc.fileSize != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          doc.fileSize!,
                          style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFFCBD5E1)),
                        ),
                      ],
                    ],
                  ),
                  Row(
                    children: [
                      if (doc.url != null) ...[
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => _openDocument(doc.url!),
                            icon: const Icon(Icons.open_in_new, size: 14),
                            label: const Text('Open'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: typeColor,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              elevation: 0,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton.icon(
                          onPressed: () => _shareDocument(doc.title, doc.url!),
                          icon: const Icon(Icons.share, size: 14),
                          label: const Text(''),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.grey.shade200,
                            foregroundColor: Colors.grey.shade700,
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            elevation: 0,
                          ),
                        ),
                      ] else
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'No URL',
                            style: GoogleFonts.dmSans(fontSize: 11, color: Colors.grey.shade600),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: (100 + index * 50).ms).slideY(begin: 0.1);
  }

  IconData _getTypeIcon(String type) {
    switch (type) {
      case 'REPORT_CARD':
        return Icons.assignment_outlined;
      case 'FEE_RECEIPT':
        return Icons.receipt_long_outlined;
      case 'TC':
        return Icons.card_membership_outlined;
      case 'CERTIFICATE':
        return Icons.workspace_premium_outlined;
      default:
        return Icons.description_outlined;
    }
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'REPORT_CARD':
        return const Color(0xFF3B6EF8);
      case 'FEE_RECEIPT':
        return const Color(0xFF00C9A7);
      case 'TC':
        return const Color(0xFFF5A623);
      case 'CERTIFICATE':
        return const Color(0xFF8B5CF6);
      default:
        return const Color(0xFF64748B);
    }
  }

  Future<void> _openDocument(String url) async {
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not open document: $e')),
      );
    }
  }

  Future<void> _shareDocument(String title, String url) async {
    try {
      await Share.share('Check out this document: $title\n$url');
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not share document: $e')),
      );
    }
  }
}
