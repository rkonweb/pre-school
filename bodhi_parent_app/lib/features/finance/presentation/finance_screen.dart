import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../data/finance_provider.dart';
import '../../dashboard/data/dashboard_provider.dart';

class FinanceScreen extends ConsumerStatefulWidget {
  const FinanceScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<FinanceScreen> createState() => _FinanceScreenState();
}

class _FinanceScreenState extends ConsumerState<FinanceScreen> with SingleTickerProviderStateMixin {
  final NumberFormat _currencyFormat = NumberFormat.currency(symbol: '₹', decimalDigits: 0);
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final brand = ref.watch(schoolBrandProvider);
    final dashboardAsync = ref.watch(dashboardDataProvider);
    
    final activeStudentId = dashboardAsync.value?['activeStudentId'];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Financials', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black87),
          onPressed: () => context.go('/'),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: brand.primaryColor,
          unselectedLabelColor: Colors.grey,
          indicatorColor: brand.primaryColor,
          tabs: const [
            Tab(text: 'Pending'),
            Tab(text: 'History'),
          ],
        ),
      ),
      body: activeStudentId == null 
        ? const Center(child: CircularProgressIndicator())
        : _buildFinanceBody(context, activeStudentId, brand),
    );
  }

  Widget _buildFinanceBody(BuildContext context, String studentId, SchoolBrandState brand) {
    final financeAsync = ref.watch(financeSnapshotDataProvider(studentId));

    return financeAsync.when(
      data: (data) => _buildContent(data, studentId, brand),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => Center(child: Text('Error: $err')),
    );
  }

  Widget _buildContent(Map<String, dynamic> data, String studentId, SchoolBrandState brand) {
    final dueInvoices = data['dueInvoices'] as List? ?? [];
    final paymentHistory = data['paymentHistory'] as List? ?? [];
    final availableGateways = List<String>.from(data['availableGateways'] ?? ['cash', 'bank_transfer']);

    return Container(
      decoration: const BoxDecoration(
        color: const Color(0xFFF8FAFC),
      ),
      child: TabBarView(
        controller: _tabController,
        children: [
          _buildPendingTab(data, dueInvoices, availableGateways, studentId, brand),
          _buildHistoryTab(paymentHistory, studentId, brand),
        ],
      ),
    );
  }

  Widget _buildPendingTab(Map<String, dynamic> data, List<dynamic> dueInvoices, List<String> availableGateways, String studentId, SchoolBrandState brand) {
    final summary = data['summary'] ?? {};
    final totalDue = summary['totalDueNow'] ?? 0;
    final upcomingDue = summary['upcomingNext30Days'] ?? 0;

    return RefreshIndicator(
      onRefresh: () => ref.read(financeSnapshotDataProvider(studentId).notifier).refresh(),
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _buildHeroCard(totalDue, upcomingDue, brand),
                const SizedBox(height: 32),
                Text('Due Invoices', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                if (dueInvoices.isEmpty)
                  const Padding(
                    padding: EdgeInsets.all(32.0),
                    child: Center(child: Text("All caught up! ✨", style: TextStyle(color: Colors.grey, fontSize: 16))),
                  ),
              ]),
            ),
          ),
          if (dueInvoices.isNotEmpty)
            SliverPadding(
              padding: const EdgeInsets.only(left: 24, right: 24, bottom: 24),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final invoice = dueInvoices[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: _buildPendingInvoiceTile(invoice, availableGateways, studentId, brand),
                    );
                  },
                  childCount: dueInvoices.length,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildHistoryTab(List<dynamic> history, String studentId, SchoolBrandState brand) {
    return RefreshIndicator(
      onRefresh: () => ref.read(financeSnapshotDataProvider(studentId).notifier).refresh(),
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
            sliver: history.isEmpty
                ? const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.all(32.0),
                      child: Center(child: Text("No payment history found.", style: TextStyle(color: Colors.grey, fontSize: 16))),
                    ),
                  )
                : SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final payment = history[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: _buildHistoryTile(payment, brand),
                        );
                      },
                      childCount: history.length,
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroCard(num totalDue, num upcomingDue, SchoolBrandState brand) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(32),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.2),
            borderRadius: BorderRadius.circular(32),
            border: Border.all(color: Colors.white.withOpacity(0.4), width: 1.5),
            boxShadow: [
              BoxShadow(color: brand.primaryColor.withOpacity(0.1), blurRadius: 30, offset: const Offset(0, 10))
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Text('TOTAL DUE', style: TextStyle(color: Colors.black54, fontSize: 14, fontWeight: FontWeight.w600, letterSpacing: 1.2)),
              const SizedBox(height: 8),
              Text(
                _currencyFormat.format(totalDue),
                style: TextStyle(color: brand.primaryColor, fontSize: 48, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.calendar_today, size: 16, color: Colors.black54),
                    const SizedBox(width: 8),
                    Text('Due Next 30 Days: ${_currencyFormat.format(upcomingDue)}', style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.black87)),
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPendingInvoiceTile(Map<String, dynamic> invoice, List<String> gateways, String studentId, SchoolBrandState brand) {
    final amount = double.tryParse(invoice['amount'].toString()) ?? 0.0;
    DateTime dueDate = DateTime.parse(invoice['dueDate']);
    final isOverdue = dueDate.isBefore(DateTime.now());

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: isOverdue ? Colors.red.withOpacity(0.3) : Colors.transparent, width: 2),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 10))
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isOverdue ? Colors.red.withOpacity(0.1) : brand.primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(Icons.receipt_long, color: isOverdue ? Colors.red : brand.primaryColor),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(invoice['title'] ?? 'Invoice', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 4),
                    Text(
                      isOverdue ? 'Overdue - ${DateFormat('d MMM, yyyy').format(dueDate)}' : 'Due ${DateFormat('d MMM, yyyy').format(dueDate)}',
                      style: TextStyle(color: isOverdue ? Colors.red : Colors.grey.shade600, fontSize: 13, fontWeight: isOverdue ? FontWeight.bold : FontWeight.normal),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _currencyFormat.format(amount),
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 24),
              ),
              ElevatedButton(
                onPressed: () => _startPaymentWorkflow(invoice, amount, gateways, studentId, brand),
                style: ElevatedButton.styleFrom(
                  backgroundColor: brand.primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  padding: const EdgeInsets.all(16),
                  minimumSize: const Size(0, 0),
                  elevation: 0,
                ),
                child: const Icon(Icons.arrow_forward_ios, size: 18),
              )
            ],
          )
        ],
      ),
    );
  }

  Widget _buildHistoryTile(Map<String, dynamic> payment, SchoolBrandState brand) {
    final amount = double.tryParse(payment['amount'].toString()) ?? 0.0;
    DateTime date = DateTime.parse(payment['date']);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.green.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.check_circle, color: Colors.green),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(payment['title'] ?? 'Fee Payment', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                const SizedBox(height: 4),
                Text(
                  DateFormat('d MMM, yyyy • h:mm a').format(date),
                  style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                ),
                const SizedBox(height: 4),
                Text('Ref: ${payment['reference']}', style: TextStyle(color: Colors.grey.shade400, fontSize: 10)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                _currencyFormat.format(amount),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.green),
              ),
              const SizedBox(height: 8),
              InkWell(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Downloading Receipt...')));
                },
                child: const Icon(Icons.download_rounded, color: Colors.grey, size: 20),
              )
            ],
          )
        ],
      ),
    );
  }

  void _startPaymentWorkflow(Map<String, dynamic> invoice, double amount, List<String> gateways, String studentId, SchoolBrandState brand) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _PaymentWorkflowSheet(
        invoice: invoice,
        amount: amount,
        gateways: gateways,
        studentId: studentId,
        brand: brand,
        currencyFormat: _currencyFormat,
      ),
    );
  }

  Widget _buildStunningBackground(SchoolBrandState brand) {
    return Stack(
      children: [
        Positioned(
          top: 0,
          left: -100,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(shape: BoxShape.circle, color: brand.primaryColor.withOpacity(0.1)),
          ),
        ),
        Positioned(
          bottom: -50,
          right: -100,
          child: Container(
            width: 350,
            height: 350,
            decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.teal.withOpacity(0.1)),
          ),
        ),
        Positioned.fill(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
            child: Container(color: Colors.transparent),
          ),
        ),
      ],
    );
  }
}

// --------------------------------------------------------------------------
// Payment Workflow Bottom Sheet
// --------------------------------------------------------------------------

class _PaymentWorkflowSheet extends ConsumerStatefulWidget {
  final Map<String, dynamic> invoice;
  final double amount;
  final List<String> gateways;
  final String studentId;
  final SchoolBrandState brand;
  final NumberFormat currencyFormat;

  const _PaymentWorkflowSheet({
    required this.invoice,
    required this.amount,
    required this.gateways,
    required this.studentId,
    required this.brand,
    required this.currencyFormat,
  });

  @override
  ConsumerState<_PaymentWorkflowSheet> createState() => _PaymentWorkflowSheetState();
}

class _PaymentWorkflowSheetState extends ConsumerState<_PaymentWorkflowSheet> {
  int _currentStep = 0; // 0: Select Method, 1: Processing, 2: Success, 3: Failed
  String? _selectedMethod;
  String _reference = "";

  @override
  void initState() {
    super.initState();
    if (widget.gateways.isNotEmpty) {
      _selectedMethod = widget.gateways[0];
    }
  }

  Future<void> _processPayment() async {
    if (_selectedMethod == null) return;
    
    setState(() {
      _currentStep = 1; // Processing UI
    });

    // Simulate Gateway handshake delay for realism
    await Future.delayed(const Duration(seconds: 2));

    final success = await ref.read(financeSnapshotDataProvider(widget.studentId).notifier).processPayment(
      widget.studentId,
      widget.invoice['id'],
      widget.amount,
      _selectedMethod!,
    );

    if (!mounted) return;

    if (success) {
      setState(() {
        _reference = "TXN-${DateTime.now().millisecondsSinceEpoch}";
        _currentStep = 2; // Success UI
      });
    } else {
      setState(() {
        _currentStep = 3; // Failed UI
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(topLeft: Radius.circular(32), topRight: Radius.circular(32)),
      ),
      padding: EdgeInsets.only(
        left: 24, right: 24, top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 48,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 48,
              height: 4,
              decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 32),
          _buildStepContent(),
        ],
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0: return _buildMethodSelection();
      case 1: return _buildProcessing();
      case 2: return _buildSuccess();
      case 3: return _buildFailed();
      default: return const SizedBox();
    }
  }

  Widget _buildMethodSelection() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Confirm Payment', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(16)),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(widget.invoice['title'], style: const TextStyle(fontWeight: FontWeight.w600)),
              Text(widget.currencyFormat.format(widget.amount), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
            ],
          ),
        ),
        const SizedBox(height: 32),
        const Text('Select Valid Gateway', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.grey)),
        const SizedBox(height: 16),
        ...widget.gateways.map((m) => _buildGatewayOption(m)).toList(),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: _selectedMethod == null ? null : _processPayment,
          style: ElevatedButton.styleFrom(
            backgroundColor: widget.brand.primaryColor,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 20),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: const Text('Proceed to Pay Securely', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        )
      ],
    );
  }

  Widget _buildGatewayOption(String methodId) {
    IconData icon;
    String title;
    
    switch (methodId.toLowerCase()) {
      case 'razorpay': icon = Icons.payments; title = 'Razorpay (Cards/UPI/NetBanking)'; break;
      case 'stripe': icon = Icons.credit_card; title = 'Stripe (International Cards)'; break;
      case 'cash': icon = Icons.money; title = 'Cash at School Counter'; break;
      case 'bank_transfer': icon = Icons.account_balance; title = 'Direct Bank Transfer'; break;
      default: icon = Icons.payment; title = methodId;
    }

    final isSelected = _selectedMethod == methodId;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => setState(() => _selectedMethod = methodId),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: isSelected ? widget.brand.primaryColor : Colors.grey.shade200, width: 2),
            borderRadius: BorderRadius.circular(16),
            color: isSelected ? widget.brand.primaryColor.withOpacity(0.05) : Colors.white,
          ),
          child: Row(
            children: [
              Icon(icon, color: isSelected ? widget.brand.primaryColor : Colors.grey),
              const SizedBox(width: 16),
              Expanded(child: Text(title, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal))),
              if (isSelected) Icon(Icons.check_circle, color: widget.brand.primaryColor)
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProcessing() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 48),
        SizedBox(
          width: 80, height: 80,
          child: CircularProgressIndicator(color: widget.brand.primaryColor, strokeWidth: 8, strokeCap: StrokeCap.round),
        ),
        const SizedBox(height: 32),
        const Text('Securely Processing...', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text('Please do not close this window.', style: TextStyle(color: Colors.grey)),
        const SizedBox(height: 48),
      ],
    );
  }

  Widget _buildSuccess() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), shape: BoxShape.circle),
          child: const Icon(Icons.check_circle, color: Colors.green, size: 80),
        ),
        const SizedBox(height: 24),
        const Text('Payment Successful!', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.green)),
        const SizedBox(height: 8),
        Text('Reference: $_reference', style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.w600)),
        const SizedBox(height: 48),
        ElevatedButton(
          onPressed: () => Navigator.pop(context),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.white,
            foregroundColor: Colors.black87,
            elevation: 0,
            side: const BorderSide(color: Colors.black12),
            padding: const EdgeInsets.symmetric(vertical: 20),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: const Text('Back to Dashboard', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        )
      ],
    );
  }

  Widget _buildFailed() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), shape: BoxShape.circle),
          child: const Icon(Icons.error, color: Colors.red, size: 80),
        ),
        const SizedBox(height: 24),
        const Text('Payment Failed', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.red)),
        const SizedBox(height: 8),
        const Text('Something went wrong during the transaction.', style: TextStyle(color: Colors.grey), textAlign: TextAlign.center),
        const SizedBox(height: 48),
        ElevatedButton(
          onPressed: () => setState(() => _currentStep = 0),
          style: ElevatedButton.styleFrom(
            backgroundColor: widget.brand.primaryColor,
            padding: const EdgeInsets.symmetric(vertical: 20),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: const Text('Try Again', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        )
      ],
    );
  }
}
