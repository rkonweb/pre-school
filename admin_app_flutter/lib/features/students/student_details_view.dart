import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import '../../core/state/student_provider.dart';
import '../../shared/components/top_nav_bell.dart';

class StudentDetailsView extends ConsumerWidget {
  final String studentId;

  const StudentDetailsView({super.key, required this.studentId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailsAsync = ref.watch(studentDetailsProvider(studentId));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: detailsAsync.when(
        data: (student) => _buildContent(context, student),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Failed to load profile: $err'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, Map<String, dynamic> student) {
    return DefaultTabController(
      length: 4,
      child: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverAppBar(
              expandedHeight: 280,
              pinned: true,
              backgroundColor: const Color(0xFF2563EB),
              flexibleSpace: FlexibleSpaceBar(
                background: _buildHeaderContent(student),
              ),
              leading: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.of(context).pop(),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.edit, color: Colors.white),
                  onPressed: () {
                    // TODO: Implement edit student
                  },
                ),
                const Padding(
                  padding: EdgeInsets.only(top: 10, bottom: 10),
                  child: TopNavBell(badgeText: '3'),
                ),
              ],
              bottom: const TabBar(
                isScrollable: true,
                indicatorColor: Colors.white,
                indicatorWeight: 3,
                labelColor: Colors.white,
                unselectedLabelColor: Colors.white70,
                tabs: [
                  Tab(text: 'Overview'),
                  Tab(text: 'Academics'),
                  Tab(text: 'Fees'),
                  Tab(text: 'Communicate'),
                ],
              ),
            ),
          ];
        },
        body: TabBarView(
          children: [
            _buildOverviewTab(student),
            _buildAcademicsTab(student),
            _buildFeesTab(student),
            _buildCommunicateTab(student),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderContent(Map<String, dynamic> student) {
    final name = '${student['firstName']} ${student['lastName'] ?? ''}'.trim();
    
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: SafeArea(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(height: 20),
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 4),
              ),
              child: CircleAvatar(
                radius: 46,
                backgroundColor: Colors.white24,
                backgroundImage: student['avatar'] != null ? NetworkImage(student['avatar']) : null,
                child: student['avatar'] == null ? Text(name[0], style: const TextStyle(fontSize: 32, color: Colors.white, fontWeight: FontWeight.bold)) : null,
              ),
            ),
            const SizedBox(height: 12),
            Text(name, style: const TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white)),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(12)),
                  child: Text(student['classroom']?['name'] ?? student['grade'] ?? 'Unassigned', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(12)),
                  child: Text('ID: ${student['admissionNumber'] ?? 'N/A'}', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOverviewTab(Map<String, dynamic> student) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildInfoCard('Personal Details', [
          _buildInfoRow('Age/Gender', '${student['age'] ?? '-'} / ${student['gender'] ?? '-'}'),
          _buildInfoRow('Blood Group', student['bloodGroup'] ?? '-'),
          _buildInfoRow('Joining Date', _formatDate(student['joiningDate'])),
        ]),
        const SizedBox(height: 16),
        _buildInfoCard('Parent/Guardian Details', [
          _buildInfoRow('Father', '${student['fatherName'] ?? '-'} (${student['fatherPhone'] ?? '-'})'),
          _buildInfoRow('Mother', '${student['motherName'] ?? '-'} (${student['motherPhone'] ?? '-'})'),
          _buildInfoRow('Primary Contact', '${student['parentName'] ?? '-'} (${student['parentMobile'] ?? '-'})'),
        ]),
        const SizedBox(height: 16),
        _buildInfoCard('Medical & Emergency', [
          _buildInfoRow('Allergies', student['allergies'] ?? 'None reported'),
          _buildInfoRow('Conditions', student['medicalConditions'] ?? 'None reported'),
          _buildInfoRow('Emergency Contact', '${student['emergencyContactName'] ?? '-'} (${student['emergencyContactPhone'] ?? '-'})', isUrgent: true),
        ]),
        const SizedBox(height: 16),
        _buildInfoCard('Address', [
          _buildInfoRow('Street', student['address'] ?? '-'),
          _buildInfoRow('City/State', '${student['city'] ?? '-'}, ${student['state'] ?? '-'} ${student['zip'] ?? ''}'),
        ]),
      ],
    );
  }

  Widget _buildAcademicsTab(Map<String, dynamic> student) {
    final attendance = List<Map<String, dynamic>>.from(student['attendance'] ?? []);
    final presentCount = attendance.where((a) => a['status'] == 'PRESENT').length;
    final totalCount = attendance.length;
    final attPercentage = totalCount > 0 ? (presentCount / totalCount * 100).toStringAsFixed(1) : '0';

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildInfoCard('Current Tracking', [
          _buildInfoRow('Classroom', student['classroom']?['name'] ?? '-'),
          _buildInfoRow('Room Number', student['classroom']?['roomNumber'] ?? '-'),
          _buildInfoRow('Recent Attendance', '$attPercentage% ($presentCount/$totalCount days)', highlight: true),
        ]),
        const SizedBox(height: 24),
        const Text('Recent Reports', style: TextStyle(fontFamily: 'Satoshi', fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
        const SizedBox(height: 12),
        if ((student['reports'] as List?)?.isEmpty ?? true)
           const Center(child: Padding(padding: EdgeInsets.all(16), child: Text('No reports generated yet.', style: TextStyle(color: Colors.grey)))),
        ...((student['reports'] ?? []) as List).map((report) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: const CircleAvatar(backgroundColor: Color(0xFFF1F5F9), child: Icon(Icons.picture_as_pdf, color: Color(0xFF3B82F6))),
            title: Text(report['term'] ?? 'Term Report', style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Text('Marks: ${report['marks']}'),
            trailing: const Icon(Icons.download_rounded, color: Color(0xFF64748B)),
          ),
        )),
      ],
    );
  }

  Widget _buildFeesTab(Map<String, dynamic> student) {
    final fees = List<Map<String, dynamic>>.from(student['fees'] ?? []);
    
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (fees.isEmpty)
           const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('No fee records found.', style: TextStyle(color: Colors.grey)))),
        ...fees.map((fee) {
          final isPaid = fee['status'] == 'PAID';
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(fee['title'] ?? 'Fee Installment', style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.bold, fontSize: 16)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: isPaid ? const Color(0xFF10B981).withValues(alpha: 0.1) : const Color(0xFFF59E0B).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          fee['status'] ?? 'PENDING',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isPaid ? const Color(0xFF10B981) : const Color(0xFFF59E0B)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('₹${fee['amount']}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                  const SizedBox(height: 8),
                  Text('Due Date: ${_formatDate(fee['dueDate'])}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildCommunicateTab(Map<String, dynamic> student) {
    final phone = student['parentMobile'] ?? student['fatherPhone'] ?? student['motherPhone'];
    final email = student['parentEmail'] ?? student['fatherEmail'] ?? student['motherEmail'];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Quick Actions', style: TextStyle(fontFamily: 'Satoshi', fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
        const SizedBox(height: 16),
        ListTile(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          tileColor: Colors.white,
          leading: const CircleAvatar(backgroundColor: Color(0xFFE0E7FF), child: Icon(Icons.call, color: Color(0xFF4F46E5))),
          title: const Text('Call Parent', style: TextStyle(fontWeight: FontWeight.w600)),
          subtitle: Text(phone ?? 'No number provided'),
          onTap: phone != null ? () => launchUrl(Uri.parse('tel:$phone')) : null,
          trailing: const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)),
        ),
        const SizedBox(height: 12),
        ListTile(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          tileColor: Colors.white,
          leading: const CircleAvatar(backgroundColor: Color(0xFFDCFCE7), child: Icon(Icons.message, color: Color(0xFF16A34A))),
          title: const Text('SMS Parent', style: TextStyle(fontWeight: FontWeight.w600)),
          subtitle: Text(phone ?? 'No number provided'),
          onTap: phone != null ? () => launchUrl(Uri.parse('sms:$phone')) : null,
          trailing: const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)),
        ),
         const SizedBox(height: 12),
        ListTile(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          tileColor: Colors.white,
          leading: const CircleAvatar(backgroundColor: Color(0xFFFEE2E2), child: Icon(Icons.email, color: Color(0xFFDC2626))),
          title: const Text('Email Parent', style: TextStyle(fontWeight: FontWeight.w600)),
          subtitle: Text(email ?? 'No email provided'),
          onTap: email != null ? () => launchUrl(Uri.parse('mailto:$email')) : null,
          trailing: const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)),
        ),
      ],
    );
  }

  Widget _buildInfoCard(String title, List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool highlight = false, bool isUrgent = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: const TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                color: isUrgent ? const Color(0xFFEF4444) : (highlight ? const Color(0xFF3B82F6) : const Color(0xFF0F172A)),
                fontWeight: highlight || isUrgent ? FontWeight.bold : FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String? isoString) {
    if (isoString == null) return '-';
    try {
      final date = DateTime.parse(isoString);
      return DateFormat('dd MMM yyyy').format(date);
    } catch (_) {
      return isoString;
    }
  }
}
