import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../../dashboard/data/dashboard_provider.dart';
import '../data/progress_provider.dart';

class ProgressScreen extends ConsumerWidget {
  const ProgressScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(dashboardDataProvider);
    final brand = ref.watch(schoolBrandProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppHeader(
        title: 'Academic Progress',
        subtitle: 'Student development & records',
        bottom: TabBar(
          isScrollable: true,
          indicatorColor: const Color(0xFF2350DD),
          indicatorWeight: 3,
          labelColor: const Color(0xFF2350DD),
          unselectedLabelColor: const Color(0xFF94A3B8),
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: const [
            Tab(text: 'Development'),
            Tab(text: 'Report Cards'),
            Tab(text: 'Exams'),
            Tab(text: 'Portfolio'),
          ],
        ),
      ),
      body: dashboardAsync.when(
        data: (data) {
          final students = data['students'] as List?;
          if (students == null || students.isEmpty) {
            return const Center(child: Text('No students found.'));
          }
          final studentId = students[0]['id'] as String;
          final progressAsync = ref.watch(progressDataProvider(studentId));

          return progressAsync.when(
            data: (progress) => RefreshIndicator(
              onRefresh: () => ref.refresh(progressDataProvider(studentId).future),
              child: DefaultTabController(
                length: 4,
                child: TabBarView(
                  children: [
                    _buildDevelopmentTab(progress, brand),
                    _buildReportCardsTab(progress, brand),
                    _buildExamsTab(progress, brand),
                    _buildPortfolioTab(progress),
                  ],
                ),
              ),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => _buildError(err.toString(), () => ref.refresh(progressDataProvider(studentId))),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildDevelopmentTab(ProgressData progress, SchoolBrandState brand) {
    if (progress.milestonesByDomain.isEmpty && progress.skillsByDomain.isEmpty) {
      return _buildEmptyState('No development data yet', Icons.child_care);
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Dev Reports
        if (progress.developmentReports.isNotEmpty) ...[
          _sectionHeader('Teacher Reports'),
          const SizedBox(height: 8),
          ...progress.developmentReports.map((dr) => _buildReportCard(dr, brand)),
          const SizedBox(height: 16),
        ],

        // Milestones by Domain
        if (progress.milestonesByDomain.isNotEmpty) ...[
          _sectionHeader('Milestone Tracking'),
          const SizedBox(height: 8),
          ...progress.milestonesByDomain.map((d) => _buildDomainMilestones(d, brand)),
          const SizedBox(height: 16),
        ],

        // Skills by Domain
        if (progress.skillsByDomain.isNotEmpty) ...[
          _sectionHeader('Skill Ratings'),
          const SizedBox(height: 8),
          ...progress.skillsByDomain.map((d) => _buildSkillDomain(d, brand)),
        ],
      ],
    );
  }

  Widget _buildReportCard(Map<String, dynamic> report, SchoolBrandState brand) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: brand.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    report['term'] ?? '',
                    style: TextStyle(color: brand.primaryColor, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            if (report['teacherNarrative'] != null) ...[
              const SizedBox(height: 10),
              Text(report['teacherNarrative'], style: const TextStyle(color: Colors.black87)),
            ],
            if (report['strengthsNotes'] != null) ...[
              const SizedBox(height: 8),
              _infoRow('💪 Strengths', report['strengthsNotes']),
            ],
            if (report['areasToGrow'] != null) ...[
              const SizedBox(height: 4),
              _infoRow('🌱 Areas to Grow', report['areasToGrow']),
            ],
            if (report['parentMessage'] != null) ...[
              const SizedBox(height: 4),
              _infoRow('💌 Message', report['parentMessage']),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDomainMilestones(DevelopmentDomain domain, SchoolBrandState brand) {
    final color = domain.color != null ? _hexColor(domain.color!) : brand.primaryColor;
    final achieved = domain.milestones.where((m) => m['status'] == 'ACHIEVED').length;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(domain.domain, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 16)),
                Text('$achieved/${domain.milestones.length}', style: TextStyle(color: color, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: domain.milestones.isNotEmpty ? achieved / domain.milestones.length : 0,
              backgroundColor: color.withOpacity(0.15),
              valueColor: AlwaysStoppedAnimation<Color>(color),
              borderRadius: BorderRadius.circular(4),
            ),
            const SizedBox(height: 12),
            ...domain.milestones.take(3).map((m) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  Icon(
                    m['status'] == 'ACHIEVED' ? Icons.check_circle : Icons.radio_button_unchecked,
                    color: m['status'] == 'ACHIEVED' ? color : Colors.grey,
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Expanded(child: Text(m['title'] ?? '', style: const TextStyle(fontSize: 13))),
                ],
              ),
            )),
            if (domain.milestones.length > 3)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text('+${domain.milestones.length - 3} more', style: TextStyle(color: color, fontSize: 12)),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSkillDomain(SkillDomain domain, SchoolBrandState brand) {
    final color = domain.color != null ? _hexColor(domain.color!) : brand.primaryColor;
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(domain.domain, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 16)),
            const SizedBox(height: 12),
            ...domain.skills.map((s) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  Expanded(child: Text(s['skill'] ?? '', style: const TextStyle(fontSize: 13))),
                  Row(
                    children: List.generate(5, (i) => Icon(
                      i < (s['rating'] ?? 0) ? Icons.star : Icons.star_border,
                      color: color,
                      size: 16,
                    )),
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildReportCardsTab(ProgressData progress, SchoolBrandState brand) {
    if (progress.reportCards.isEmpty) {
      return _buildEmptyState('No report cards published yet', Icons.assignment);
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: progress.reportCards.length,
      itemBuilder: (ctx, i) {
        final rc = progress.reportCards[i];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(rc.term, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: brand.primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text('Report Card', style: TextStyle(color: brand.primaryColor, fontSize: 12)),
                    ),
                  ],
                ),
                if (rc.comments != null) ...[
                  const SizedBox(height: 8),
                  Text(rc.comments!, style: const TextStyle(color: Colors.grey)),
                ],
                if (rc.marks.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  const Divider(),
                  const SizedBox(height: 8),
                  ...rc.marks.entries.take(5).map((e) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(e.key, style: const TextStyle(fontSize: 14)),
                        Text('${e.value}', style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                  )),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildExamsTab(ProgressData progress, SchoolBrandState brand) {
    if (progress.examResults.isEmpty) {
      return _buildEmptyState('No exam results yet', Icons.quiz);
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: progress.examResults.length,
      itemBuilder: (ctx, i) {
        final er = progress.examResults[i];
        final maxMarks = er.exam?['maxMarks'] as num? ?? 100;
        final percentage = er.marks != null ? (er.marks! / maxMarks * 100).toStringAsFixed(1) : '-';

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: CircleAvatar(
              backgroundColor: brand.primaryColor.withOpacity(0.1),
              child: Text(
                er.grade ?? '?',
                style: TextStyle(color: brand.primaryColor, fontWeight: FontWeight.bold),
              ),
            ),
            title: Text(er.exam?['title'] ?? 'Exam', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text(er.subject ?? ''),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  er.marks != null ? '${er.marks}/${maxMarks.toInt()}' : '-',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                Text('$percentage%', style: const TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPortfolioTab(ProgressData progress) {
    if (progress.portfolio.isEmpty) {
      return _buildEmptyState('No portfolio entries yet', Icons.photo_library);
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.9,
      ),
      itemCount: progress.portfolio.length,
      itemBuilder: (ctx, i) {
        final entry = progress.portfolio[i];
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (entry['thumbnailUrl'] != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(entry['thumbnailUrl'], height: 80, width: double.infinity, fit: BoxFit.cover),
                  )
                else
                  Container(
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.article_outlined, color: Colors.grey, size: 36),
                  ),
                const SizedBox(height: 8),
                Text(entry['title'] ?? '', maxLines: 2, overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                if (entry['description'] != null)
                  Text(entry['description'], maxLines: 1, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.grey, fontSize: 11)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _sectionHeader(String title) => Text(title,
    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E)));

  Widget _infoRow(String label, String? value) {
    if (value == null || value.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: RichText(
        text: TextSpan(
          children: [
            TextSpan(text: '$label: ', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87, fontSize: 13)),
            TextSpan(text: value, style: const TextStyle(color: Colors.black54, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message, IconData icon) => Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, size: 64, color: Colors.grey.shade300),
        const SizedBox(height: 16),
        Text(message, style: TextStyle(color: Colors.grey.shade500, fontSize: 16)),
      ],
    ),
  );

  Widget _buildError(String error, VoidCallback onRetry) => Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.error_outline, size: 48, color: Colors.red),
        const SizedBox(height: 16),
        Text(error, textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: onRetry, child: const Text('Retry')),
      ],
    ),
  );

  Color _hexColor(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return Colors.blue;
    }
  }
}
