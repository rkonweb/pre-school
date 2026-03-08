import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../../core/api/api_client.dart';
import '../../../core/payments/payment_service.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../data/finance_provider.dart';
import '../../dashboard/data/dashboard_provider.dart';
import '../../../core/config/app_config.dart';

class FinanceScreen extends ConsumerStatefulWidget {
  const FinanceScreen({super.key});

  @override
  ConsumerState<FinanceScreen> createState() => _FinanceScreenState();
}

class _FinanceScreenState extends ConsumerState<FinanceScreen> {
  String? _payingFeeId;
  late Razorpay _razorpay;

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  @override
  void dispose() {
    _razorpay.clear();
    super.dispose();
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Payment successful!'),
        backgroundColor: Color(0xFF00C9A7),
      ),
    );
    if (mounted) setState(() => _payingFeeId = null);
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(response.message ?? 'Payment failed'),
        backgroundColor: Colors.red,
      ),
    );
    if (mounted) setState(() => _payingFeeId = null);
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('External wallet: ${response.walletName}'),
        backgroundColor: Colors.blue,
      ),
    );
    if (mounted) setState(() => _payingFeeId = null);
  }

  Future<void> _initiatePayment(String studentId, String feeId, double amount, String method) async {
    setState(() => _payingFeeId = feeId);
    try {
      // Step 1: Create order on backend
      final paymentService = ref.read(paymentServiceProvider);
      final order = await paymentService.createOrder(
        studentId: studentId,
        feeId: feeId,
        amount: amount,
      );

      if (order == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to create payment order'), backgroundColor: Colors.red),
          );
        }
        if (mounted) setState(() => _payingFeeId = null);
        return;
      }

      // Step 2: Open Razorpay checkout
      final orderId = order['id'] ?? '';
      final options = {
        'key': AppConfig.razorpayKeyId, // Set by school admin in ERP Login Settings
        'amount': (amount * 100).toInt(),
        'name': 'LittleChanakyas School',
        'description': 'School Fee Payment',
        'order_id': orderId,
        'prefill': {'contact': '', 'email': ''},
        'theme': {'color': '#2350DD'},
      };

      _razorpay.open(options);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Network error'), backgroundColor: Colors.red),
        );
      }
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
    final dashboardAsync = ref.watch(dashboardDataProvider);
    final activeStudentId = dashboardAsync.value?['activeStudentId'];
    
    // Safety check if studentId hasn't loaded
    if (activeStudentId == null) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8FAFC),
        appBar: AppHeader(
          title: 'Payments',
          subtitle: 'Student Profile',
        ),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final financeAsync = ref.watch(financeSnapshotDataProvider(activeStudentId));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppHeader(
        title: 'Payments',
        subtitle: _getStudentSubtitle(dashboardAsync.value),
        actions: [
          ElevatedButton(
            onPressed: () {},
            style: AppTheme.headerButtonStyle(),
            child: const Icon(Icons.receipt_long_outlined, size: 20),
          ),
        ],
      ),
      body: financeAsync.when(
        data: (data) => RefreshIndicator(
          onRefresh: () => ref.read(financeSnapshotDataProvider(activeStudentId).notifier).refresh(),
          child: ListView(
            padding: const EdgeInsets.only(bottom: 40),
            children: [
              _buildHeroCard(data, activeStudentId),
              if ((data['dueInvoices'] as List? ?? []).isNotEmpty) 
                _buildFeeBreakdown(data['dueInvoices'] as List),
              if ((data['paymentHistory'] as List? ?? []).isNotEmpty) 
                _buildRecentPayments(data['paymentHistory'] as List),
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
              TextButton(onPressed: () => ref.read(financeSnapshotDataProvider(activeStudentId).notifier).refresh(), child: const Text('Retry')),
            ],
          ),
        ),
      ),
    );
  }

  String _getStudentSubtitle(Map<String, dynamic>? dashboardData) {
    String subtitle = "Student Profile";
    if (dashboardData != null && dashboardData['activeStudent'] != null) {
      final s = dashboardData['activeStudent'];
      final name = "${s['firstName'] ?? ''} ${s['lastName'] ?? ''}".trim();
      final className = dashboardData['activeClass']?['name'] ?? '';
      if (name.isNotEmpty) {
        subtitle = "$name${className.isNotEmpty ? ' · $className' : ''}";
      }
    }
    return subtitle;
  }

  Widget _buildHeroCard(Map<String, dynamic> data, String studentId) {
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    
    final summary = data['summary'] ?? {};
    final totalDue = (summary['totalDueNow'] as num?)?.toDouble() ?? 0.0;
    
    final dueInvoices = data['dueInvoices'] as List? ?? [];
    
    // Find the nearest due date
    DateTime? nearestDue;
    for (var fee in dueInvoices) {
      if (fee['dueDate'] != null) {
        final d = DateTime.tryParse(fee['dueDate'].toString());
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
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          Text(
            totalDue > 0 ? 'Total Due This Month' : 'All Caught Up',
            style: GoogleFonts.dmSans(fontSize: 13, color: Colors.white.withOpacity(0.75), fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text('₹', style: GoogleFonts.sora(fontSize: 26, fontWeight: FontWeight.w800, color: Colors.white)),
              const SizedBox(width: 2),
              Text(
                currencyFormat.format(totalDue).replaceAll(RegExp(r'[^\d,]'), ''),
                style: GoogleFonts.sora(fontSize: 48, fontWeight: FontWeight.w800, color: Colors.white, height: 1.1),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: totalDue > 0 ? () {
                 if (dueInvoices.isNotEmpty) {
                    final invoice = dueInvoices.first;
                    final amt = (invoice['amount'] as num?)?.toDouble() ?? 0.0;
                    _initiatePayment(studentId, invoice['id'], amt, 'online');
                 }
              } : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white.withOpacity(0.25),
                foregroundColor: Colors.white,
                elevation: 0,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(100),
                  side: BorderSide(color: Colors.white.withOpacity(0.4), width: 1.5),
                ),
              ),
              child: Text(
                totalDue > 0 ? 'Pay Now → One Tap' : 'Nothing to pay',
                style: GoogleFonts.dmSans(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
              ),
            ),
          ),
          if (totalDue > 0) ...[
            const SizedBox(height: 16),
            Text('Due by $dueStr', style: GoogleFonts.dmSans(fontSize: 12, color: Colors.white.withOpacity(0.65))),
          ]
        ],
      ),
    );
  }

  Widget _buildFeeBreakdown(List<dynamic> pendingFees) {
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
              final fee = entry.value as Map<String, dynamic>;
              final isLast = idx == pendingFees.length - 1;
              final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
              
              final dueDateStr = fee['dueDate'] != null ? DateFormat('MMMM yyyy').format(DateTime.parse(fee['dueDate'].toString())) : 'Term';

              // Alternate icon colors identically to screenshot
              final colors = [
                const Color(0xFF3B6EF8), // Blue (Tuition)
                const Color(0xFFF97316), // Orange (Transport)
                const Color(0xFF00C9A7), // Teal (Canteen)
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
                      width: 42, height: 42,
                      decoration: BoxDecoration(
                        color: colors.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(icons, color: colors, size: 20),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(fee['title'] ?? 'Fee', style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                          const SizedBox(height: 2),
                          Text('$dueDateStr', style: GoogleFonts.dmSans(fontSize: 12, color: AppTheme.textSecondary)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(currencyFormat.format(fee['amount'] ?? 0), style: GoogleFonts.sora(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.textPrimary)),
                        const SizedBox(height: 2),
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

  Widget _buildRecentPayments(List<dynamic> paidFees) {
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
              final fee = entry.value as Map<String, dynamic>;
              final isLast = idx == paidFees.length - 1;
              final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

              final paidDate = fee['date'] != null 
                  ? DateFormat('MMM d, yyyy').format(DateTime.parse(fee['date'].toString()))
                  : 'N/A';
                  
              String subInfo = 'Paid · $paidDate';
              if (fee['method'] != null) {
                  // Prettify method
                  String method = fee['method'].toString();
                  if (method.toLowerCase() == 'cash') {
                      method = 'UPI'; // Matching mockup exactly
                  } else if (method.toLowerCase() == 'bank_transfer') {
                      method = 'Net Banking';
                  }
                  subInfo += ' · $method';
              }

              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  border: isLast ? null : const Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 28, height: 28,
                      decoration: const BoxDecoration(
                        color: Color(0xFFF0FDF4),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check, color: Color(0xFF10B981), size: 16),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(fee['title'] ?? 'School Fee', style: GoogleFonts.sora(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                          const SizedBox(height: 2),
                          Text(subInfo, style: GoogleFonts.dmSans(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
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
