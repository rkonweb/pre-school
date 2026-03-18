import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/state/generic_crud_provider.dart';
import '../../shared/components/top_nav_bell.dart';

class AdmissionsView extends ConsumerWidget {
  const AdmissionsView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Calling the universal API provider mapped to 'admissions'
    final admissionsAsync = ref.watch(apiCrudProvider('admissions'));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Admissions Directory', style: TextStyle(fontFamily: 'Cabinet Grotesk', fontWeight: FontWeight.w800)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF140E28),
        elevation: 0,
        actions: const [
          TopNavBell(badgeText: '3'),
        ],
        // No Add Button because the APP is strictly view-only for Admissions per user requirement
      ),
      body: admissionsAsync.when(
        data: (admissionsList) => _buildList(context, admissionsList),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.red))),
      ),
    );
  }

  Widget _buildList(BuildContext context, List<Map<String, dynamic>> admissions) {
    if (admissions.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.feed_outlined, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            const Text('No admission enquiries found', style: TextStyle(fontFamily: 'Satoshi', color: Colors.grey, fontWeight: FontWeight.w600)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: admissions.length,
      itemBuilder: (context, index) {
        final item = admissions[index];
        final String studentName = item['studentName'] ?? 'Unknown Student';
        final String grade = item['enrolledGrade'] ?? 'N/A';
        final String stage = item['stage'] ?? 'INQUIRY';
        final String parentName = item['parentName'] ?? 'N/A';
        final String parentPhone = item['parentPhone'] ?? 'N/A';

        // Stage configurations matching Web Portal
        Color stageColor;
        switch (stage.toUpperCase()) {
          case 'ENROLLED':
            stageColor = const Color(0xFF10B981); // Emerald
            break;
          case 'WAITLISTED':
            stageColor = const Color(0xFFF59E0B); // Amber
            break;
          case 'INTERVIEW_SCHEDULED':
            stageColor = const Color(0xFF6366F1); // Indigo
            break;
          case 'REJECTED':
            stageColor = const Color(0xFFEF4444); // Red
            break;
          case 'DROPPED':
            stageColor = const Color(0xFF64748B); // Slate
            break;
          default:
            stageColor = const Color(0xFF3B82F6); // Blue (INQUIRY or unknown)
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFF1F5F9)),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Name and Stage
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        studentName, 
                        style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF0F172A)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: stageColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: stageColor.withOpacity(0.2)),
                      ),
                      child: Text(
                        stage.replaceAll('_', ' '),
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: stageColor, letterSpacing: 0.5),
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                // Details Grid
                Row(
                  children: [
                    Expanded(
                      child: _buildInfoItem(Icons.class_outlined, 'Grade Applied', grade),
                    ),
                    Expanded(
                      child: _buildInfoItem(Icons.person_outline, 'Parent/Guardian', parentName),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildInfoItem(Icons.phone_outlined, 'Contact Number', parentPhone),
                    ),
                    Expanded(
                      child: _buildInfoItem(Icons.calendar_today_outlined, 'Status', item['officialStatus'] ?? 'INTERESTED'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildInfoItem(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: const Color(0xFF94A3B8)),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 13, color: Color(0xFF334155), fontWeight: FontWeight.bold, fontFamily: 'Satoshi')),
            ],
          ),
        ),
      ],
    );
  }
}
