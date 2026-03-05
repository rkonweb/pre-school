import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';

class DocumentsData {
  final List<Map<String, dynamic>> feeReceipts;
  final List<Map<String, dynamic>> reportCards;
  final List<Map<String, dynamic>> transferCertificates;

  DocumentsData({required this.feeReceipts, required this.reportCards, required this.transferCertificates});

  factory DocumentsData.fromJson(Map<String, dynamic> json) => DocumentsData(
    feeReceipts: List<Map<String, dynamic>>.from(json['feeReceipts'] ?? []),
    reportCards: List<Map<String, dynamic>>.from(json['reportCards'] ?? []),
    transferCertificates: List<Map<String, dynamic>>.from(json['transferCertificates'] ?? []),
  );
}

final documentsProvider = FutureProvider<DocumentsData>((ref) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get('parent/documents');

  if (response.data['success'] == true) {
    return DocumentsData.fromJson(response.data['data']);
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load documents');
  }
});

class DocumentsScreen extends ConsumerWidget {
  const DocumentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brand = ref.watch(schoolBrandProvider);
    final docsAsync = ref.watch(documentsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppHeader(
        title: 'Documents',
        subtitle: 'Official school records',
        bottom: TabBar(
          indicatorColor: const Color(0xFF2350DD),
          indicatorWeight: 3,
          labelColor: const Color(0xFF2350DD),
          unselectedLabelColor: const Color(0xFF94A3B8),
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: const [
            Tab(text: 'Fee Receipts'),
            Tab(text: 'Report Cards'),
            Tab(text: 'Certificates'),
          ],
        ),
      ),
      body: docsAsync.when(
        data: (docs) => RefreshIndicator(
          onRefresh: () => ref.refresh(documentsProvider.future),
          child: DefaultTabController(
            length: 3,
            child: TabBarView(
              children: [
                _buildFeeReceipts(docs.feeReceipts, brand),
                _buildReportCards(docs.reportCards, brand),
                _buildCertificates(docs.transferCertificates, brand),
              ],
            ),
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text(err.toString()),
              ElevatedButton(
                onPressed: () => ref.refresh(documentsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeeReceipts(List<Map<String, dynamic>> receipts, SchoolBrandState brand) {
    if (receipts.isEmpty) return _emptyState('No fee receipts', Icons.receipt_long);

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: receipts.length,
      itemBuilder: (ctx, i) {
        final r = receipts[i];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: Container(
              width: 44, height: 44,
              decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.receipt, color: Colors.green, size: 22),
            ),
            title: Text(r['feeTitle'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(r['studentName'] ?? '', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                Text('via ${r['method'] ?? '-'} · ${_formatDate(r['date'])}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
            trailing: Text(
              '₹${r['amount']?.toStringAsFixed(0) ?? '-'}',
              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green, fontSize: 16),
            ),
          ),
        );
      },
    );
  }

  Widget _buildReportCards(List<Map<String, dynamic>> cards, SchoolBrandState brand) {
    if (cards.isEmpty) return _emptyState('No report cards published', Icons.assignment);

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: cards.length,
      itemBuilder: (ctx, i) {
        final rc = cards[i];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: Container(
              width: 44, height: 44,
              decoration: BoxDecoration(color: brand.primaryColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(Icons.school, color: brand.primaryColor, size: 22),
            ),
            title: Text('Report Card — ${rc['term'] ?? ''}', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(rc['studentName'] ?? '', style: const TextStyle(fontSize: 12)),
                if (rc['publishedAt'] != null)
                  Text('Published ${_formatDate(rc['publishedAt'])}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
            trailing: const Icon(Icons.download, color: Colors.grey),
            onTap: () { /* TODO: Download PDF */ },
          ),
        );
      },
    );
  }

  Widget _buildCertificates(List<Map<String, dynamic>> certs, SchoolBrandState brand) {
    if (certs.isEmpty) return _emptyState('No certificates', Icons.verified);

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: certs.length,
      itemBuilder: (ctx, i) {
        final tc = certs[i];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            leading: Container(
              width: 44, height: 44,
              decoration: BoxDecoration(color: Colors.orange.shade50, borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.verified, color: Colors.orange, size: 22),
            ),
            title: Text('Transfer Certificate', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text(tc['studentName'] ?? ''),
            trailing: const Icon(Icons.download, color: Colors.grey),
          ),
        );
      },
    );
  }

  Widget _emptyState(String message, IconData icon) => Center(
    child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          Text(message, style: TextStyle(color: Colors.grey.shade500, fontSize: 16)),
        ],
      ),
    ),
  );

  String _formatDate(dynamic iso) {
    if (iso == null) return '';
    try {
      final dt = DateTime.parse(iso.toString());
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return iso.toString();
    }
  }
}
