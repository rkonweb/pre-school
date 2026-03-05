import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';

// ─── Models ──────────────────────────────────────────────────────────────────
class PaymentSummary {
  final List<Map<String, dynamic>> pendingFees;
  final List<Map<String, dynamic>> paidFees;
  final List<Map<String, dynamic>> onlinePayments;
  final double totalDue;
  final double totalPaid;

  PaymentSummary({
    required this.pendingFees,
    required this.paidFees,
    required this.onlinePayments,
    required this.totalDue,
    required this.totalPaid,
  });

  factory PaymentSummary.fromJson(Map<String, dynamic> json) => PaymentSummary(
        pendingFees: List<Map<String, dynamic>>.from(json['pendingFees'] ?? []),
        paidFees: List<Map<String, dynamic>>.from(json['paidFees'] ?? []),
        onlinePayments: List<Map<String, dynamic>>.from(json['onlinePayments'] ?? []),
        totalDue: (json['totalDue'] as num?)?.toDouble() ?? 0.0,
        totalPaid: (json['totalPaid'] as num?)?.toDouble() ?? 0.0,
      );
}

final paymentSummaryProvider = FutureProvider<PaymentSummary>((ref) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get('parent/payments');
  if (response.data['success'] == true) {
    return PaymentSummary.fromJson(response.data['data']);
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load payments');
  }
});

// ─── Screen ──────────────────────────────────────────────────────────────────
class PaymentsScreen extends ConsumerStatefulWidget {
  const PaymentsScreen({super.key});

  @override
  ConsumerState<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends ConsumerState<PaymentsScreen> {
  String? _payingFeeId;

  Future<void> _initiatePayment(String feeId, double amount) async {
    setState(() => _payingFeeId = feeId);
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.post('parent/payments', data: {'feeId': feeId});
      if (mounted) {
        if (response.data['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Payment gateway integration coming soon. Request recorded.'),
              backgroundColor: Color(0xFF3B6EF8),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response.data['error'] ?? 'Payment failed'), backgroundColor: Colors.red),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error'), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _payingFeeId = null);
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return 'N/A';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('MMM d, yyyy').format(date);
    } catch (e) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    final summaryAsync = ref.watch(paymentSummaryProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppHeader(
        title: 'Payments',
        subtitle: _getStudentSubtitle(summaryAsync.value),
        actions: [
          ElevatedButton(
            onPressed: () {},
            style: AppTheme.headerButtonStyle(),
            child: const Icon(Icons.receipt_long_outlined, size: 20),
          ),
        ],
      ),
      body: summaryAsync.when(
        data: (summary) => RefreshIndicator(
          onRefresh: () => ref.refresh(paymentSummaryProvider.future),
          child: ListView(
            padding: const EdgeInsets.only(bottom: 40),
            children: [
              _buildHeroCard(summary),
              if (summary.pendingFees.isNotEmpty) _buildFeeBreakdown(summary.pendingFees),
              if (summary.paidFees.isNotEmpty) _buildRecentPayments(summary.paidFees),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text(err.toString(), style: GoogleFonts.dmSans()),
              TextButton(onPressed: () => ref.refresh(paymentSummaryProvider), child: const Text('Retry')),
            ],
          ),
        ),
      ),
    );
  }

  String _getStudentSubtitle(PaymentSummary? summary) {
    String subtitle = "Emma Johnson · Grade 8B";
    if (summary != null) {
      if (summary.pendingFees.isNotEmpty && summary.pendingFees.first['student'] != null) {
        final s = summary.pendingFees.first['student'];
        subtitle = "${s['firstName'] ?? ''} ${s['lastName'] ?? ''}".trim();
      } else if (summary.paidFees.isNotEmpty && summary.paidFees.first['student'] != null) {
        final s = summary.paidFees.first['student'];
        subtitle = "${s['firstName'] ?? ''} ${s['lastName'] ?? ''}".trim();
      }
    }
    return subtitle;
  }

  Widget _buildHeroCard(PaymentSummary summary) {
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    
    // Find the nearest due date
    DateTime? nearestDue;
    for (var fee in summary.pendingFees) {
      if (fee['dueDate'] != null) {
        final d = DateTime.tryParse(fee['dueDate']);
        if (d != null && (nearestDue == null || d.isBefore(nearestDue))) {
          nearestDue = d;
        }
      }
    }
    final dueStr = nearestDue != null ? DateFormat('MMMM d, yyyy').format(nearestDue) : 'N/A';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1A1F5E), Color(0xFF2350DD), Color(0xFF00C9A7)],
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        children: [
          Text(summary.totalDue > 0 ? 'Total Due This Month' : 'All Caught Up', style: GoogleFonts.dmSans(fontSize: 12, color: Colors.white70)),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text('₹', style: GoogleFonts.sora(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white)),
              ),
              const SizedBox(width: 2),
              Text(currencyFormat.format(summary.totalDue).replaceAll('₹', ''), style: GoogleFonts.sora(fontSize: 42, fontWeight: FontWeight.w800, color: Colors.white)),
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton(
              onPressed: summary.totalDue > 0 ? () {
                // Example action - in a real app this would trigger payment for all dues
              } : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white.withOpacity(0.2),
                foregroundColor: Colors.white,
                elevation: 0,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(100),
                  side: BorderSide(color: Colors.white.withOpacity(0.35), width: 1.5),
                ),
              ),
              child: Text(summary.totalDue > 0 ? 'Pay Now → One Tap' : 'Nothing to pay', style: GoogleFonts.dmSans(fontSize: 14, fontWeight: FontWeight.bold)),
            ),
          ),
          if (summary.totalDue > 0) ...[
            const SizedBox(height: 10),
            Text('Due by $dueStr', style: GoogleFonts.dmSans(fontSize: 11, color: Colors.white54)),
          ]
        ],
      ),
    );
  }

  Widget _buildFeeBreakdown(List<Map<String, dynamic>> pendingFees) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 6),
          child: Text('FEE BREAKDOWN', style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF94A3B8), letterSpacing: 1.2)),
        ),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
          ),
          child: Column(
            children: pendingFees.asMap().entries.map((entry) {
              final idx = entry.key;
              final fee = entry.value;
              final isLast = idx == pendingFees.length - 1;
              final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

              // Use colors matching the UI for different fee types ideally, but we will make it dynamic based on index
              final colors = [
                const Color(0xFF3B6EF8), // Blue
                const Color(0xFFF97316), // Orange
                const Color(0xFF00C9A7), // Teal
              ][idx % 3];

              final icons = [Icons.menu_book_rounded, Icons.directions_bus_filled_rounded, Icons.coffee_rounded][idx % 3];

              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  border: isLast ? null : const Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(
                        color: colors.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(icons, color: colors, size: 20),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(fee['title'] ?? 'School Fee', style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                          Text(fee['category'] ?? 'Fee', style: GoogleFonts.dmSans(fontSize: 12, color: AppTheme.textSecondary)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(currencyFormat.format(fee['amount'] ?? 0), style: GoogleFonts.sora(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.textPrimary)),
                        Text('Due', style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFFEF4444))),
                      ],
                    )
                  ],
                ),
              );
            }).toList(),
          ),
        )
      ],
    );
  }

  Widget _buildRecentPayments(List<Map<String, dynamic>> paidFees) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 6),
          child: Text('RECENT PAYMENTS', style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF94A3B8), letterSpacing: 1.2)),
        ),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
          ),
          child: Column(
            children: paidFees.asMap().entries.map((entry) {
              final idx = entry.key;
              final fee = entry.value;
              final isLast = idx == paidFees.length - 1;
              final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

              final paidDate = fee['payments'] != null && fee['payments'].isNotEmpty 
                  ? DateFormat('MMM d, yyyy').format(DateTime.parse(fee['payments'][0]['date']))
                  : _formatDate(fee['updatedAt']);

              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  border: isLast ? null : const Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 32, height: 32,
                      decoration: const BoxDecoration(
                        color: Color(0xFFF0FDF4),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check, color: Color(0xFF10B981), size: 18),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(fee['title'] ?? 'School Fee', style: GoogleFonts.sora(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                          Text('Paid · $paidDate · Online', style: GoogleFonts.dmSans(fontSize: 11, color: AppTheme.textSecondary)),
                        ],
                      ),
                    ),
                    Text(currencyFormat.format(fee['amount'] ?? 0), style: GoogleFonts.sora(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF00C9A7))),
                  ],
                ),
              );
            }).toList(),
          ),
        )
      ],
    );
  }
}
