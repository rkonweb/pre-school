import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:parent_app_flutter/core/theme/app_theme.dart';
import 'package:parent_app_flutter/features/dashboard/screens/shell_screen.dart' as parent_app_flutter;
import '../services/fees_service.dart';
import 'package:intl/intl.dart';

class FeesScreen extends StatefulWidget {
  const FeesScreen({Key? key}) : super(key: key);

  @override
  _FeesScreenState createState() => _FeesScreenState();
}

class _FeesScreenState extends State<FeesScreen> {
  Map<String, dynamic>? _feesData;
  bool _isLoading = true;
  String _errorMessage = '';
  String _activeTab = 'overview'; // 'overview', 'due', 'history'

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      setState(() { _isLoading = true; _errorMessage = ''; });
      final prefs = await SharedPreferences.getInstance();
      final studentId = prefs.getString('active_student_id');
      
      if (studentId == null) {
        setState(() { _errorMessage = "No active student selected."; _isLoading = false; });
        return;
      }

      final data = await FeesService.fetchFees(studentId);
      setState(() { _feesData = data; _isLoading = false; });
    } catch (e) {
      setState(() { _errorMessage = e.toString(); _isLoading = false; });
    }
  }

  String _fmtCurrency(dynamic amount) {
    final num = (amount ?? 0).toDouble();
    return '₹${NumberFormat('#,##,###').format(num.round())}';
  }

  String _fmtDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      return DateFormat('MMM d, yyyy').format(dt);
    } catch (_) { return dateStr; }
  }

  String _fmtShortDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      return DateFormat('MMM d').format(dt);
    } catch (_) { return ''; }
  }

  String _getMonthGroup(String? dateStr) {
    if (dateStr == null) return 'Earlier';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      return DateFormat('MMMM yyyy').format(dt);
    } catch (_) { return 'Earlier'; }
  }

  int _daysUntil(String? dateStr) {
    if (dateStr == null) return 999;
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      return dt.difference(DateTime.now()).inDays;
    } catch (_) { return 999; }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8FAFC),
        body: Center(child: CircularProgressIndicator(color: AppTheme.a1)),
      );
    }

    if (_errorMessage.isNotEmpty) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        body: Center(child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Text('😕', style: TextStyle(fontSize: 40)),
            const SizedBox(height: 12),
            Text(_errorMessage, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () { setState(() => _isLoading = true); _loadData(); },
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.a1, foregroundColor: Colors.white, elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            ),
          ]),
        )),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          _buildPopupHeader(),
          _buildTabBar(),
          Expanded(
            child: _activeTab == 'overview'
                ? RefreshIndicator(onRefresh: _loadData, child: _buildOverviewTab())
                : _activeTab == 'due'
                    ? RefreshIndicator(onRefresh: _loadData, child: _buildDueFeesTab())
                    : RefreshIndicator(onRefresh: _loadData, child: _buildHistoryTab()),
          ),
        ],
      ),
    );
  }

  Widget _buildPopupHeader() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      padding: const EdgeInsets.fromLTRB(18, 0, 18, 12),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            const SizedBox(height: 10),
            Container(
              width: 36, height: 4,
              decoration: BoxDecoration(
                color: const Color(0x59B49B78),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Container(
                  width: 38, height: 38,
                  decoration: BoxDecoration(
                    color: AppTheme.goldBg,
                    border: Border.all(color: AppTheme.goldBorder),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Center(
                    child: Icon(Icons.account_balance_wallet_rounded, color: AppTheme.goldAcc, size: 20),
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text('Fees & Payments', style: TextStyle(fontFamily: 'Outfit', fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.t1)),
                ),
                GestureDetector(
                  onTap: () {
                    if (Navigator.canPop(context)) {
                      Navigator.pop(context);
                    } else {
                      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const parent_app_flutter.ShellScreen()));
                    }
                  },
                  child: Container(
                    width: 30, height: 30,
                    decoration: BoxDecoration(
                      color: AppTheme.bg2,
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: const Center(child: Icon(Icons.close, color: AppTheme.t2, size: 16)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabBar() {
    final summary = _feesData?['summary'] ?? {};
    final int pendingCount = summary['pendingCount'] ?? 0;

    return Container(
      width: double.infinity,
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 12),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildTabButton('overview', 'Overview'),
            const SizedBox(width: 6),
            _buildTabButton('due', 'Due Fees ($pendingCount)'),
            const SizedBox(width: 6),
            _buildTabButton('history', 'History'),
          ],
        ),
      ),
    );
  }

  Widget _buildTabButton(String tabId, String label) {
    final bool isActive = _activeTab == tabId;
    return GestureDetector(
      onTap: () => setState(() => _activeTab = tabId),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
        decoration: BoxDecoration(
          color: isActive ? AppTheme.a1 : AppTheme.bg2,
          border: Border.all(color: isActive ? Colors.transparent : const Color(0xFFE5E7EB)),
          borderRadius: BorderRadius.circular(20),
          boxShadow: isActive ? [const BoxShadow(color: Color(0x4D6366F1), blurRadius: 14, offset: Offset(0, 4))] : null,
        ),
        child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: isActive ? Colors.white : AppTheme.t3)),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // TAB 1: OVERVIEW
  // ═══════════════════════════════════════════════════════════════
  Widget _buildOverviewTab() {
    final summary = _feesData?['summary'] ?? {};
    final categories = _feesData?['categoryBreakdown'] as List<dynamic>? ?? [];
    final int pct = summary['pctPaid'] ?? 0;
    final double totalDue = (summary['totalDue'] ?? 0).toDouble();
    final double totalPaid = (summary['totalPaid'] ?? 0).toDouble();
    final double totalFees = (summary['totalFees'] ?? 0).toDouble();
    final int overdueCount = summary['overdueCount'] ?? 0;
    final int pendingCount = summary['pendingCount'] ?? 0;

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Overdue alert
          if (overdueCount > 0) ...[
            _buildOverdueAlert(totalDue, summary['nextDueDate'], overdueCount),
            const SizedBox(height: 16),
          ],

          // Hero card
          _buildHeroCard(totalDue, totalPaid, totalFees, pct),
          const SizedBox(height: 16),

          // Quick stats row
          Row(
            children: [
              _buildStatMini('💰', _fmtCurrency(totalFees), 'Total Fees'),
              const SizedBox(width: 8),
              _buildStatMini('✅', _fmtCurrency(totalPaid), 'Paid'),
              const SizedBox(width: 8),
              _buildStatMini('⏳', '$pendingCount', 'Pending'),
              const SizedBox(width: 8),
              _buildStatMini('🚨', '$overdueCount', 'Overdue'),
            ],
          ),
          const SizedBox(height: 24),

          // Next due countdown
          if (summary['nextDueDate'] != null) ...[
            _buildNextDueCountdown(summary['nextDueDate']),
            const SizedBox(height: 24),
          ],

          // Category breakdown
          if (categories.isNotEmpty) ...[
            const Text('Fee Breakdown by Category', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.t1, letterSpacing: -0.3)),
            const SizedBox(height: 12),
            ...categories.map((c) => _buildCategoryCard(c)).toList(),
          ],

          // All clear
          if (totalDue == 0)
            Container(
              margin: const EdgeInsets.only(top: 16),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: const Column(
                children: [
                  Text('🎉', style: TextStyle(fontSize: 32)),
                  SizedBox(height: 8),
                  Text('All Fees Paid!', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF166534))),
                  SizedBox(height: 4),
                  Text('You have no outstanding dues', style: TextStyle(fontSize: 12, color: Color(0xFF15803D))),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildOverdueAlert(double due, String? nextDate, int count) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF1F2), Color(0xFFFFE4E6)],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x40F43F5E)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: const Color(0xFFE11D48).withOpacity(0.1), shape: BoxShape.circle),
            child: const Text('⚠️', style: TextStyle(fontSize: 20)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$count Fee${count > 1 ? 's' : ''} Overdue!',
                    style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFFE11D48), fontSize: 14)),
                const SizedBox(height: 2),
                Text('${_fmtCurrency(due)} pending payment',
                    style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF9F1239), fontSize: 11)),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => setState(() => _activeTab = 'due'),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(color: const Color(0xFFE11D48), borderRadius: BorderRadius.circular(10)),
              child: const Text('Pay Now', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroCard(double totalDue, double totalPaid, double totalFees, int pct) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFFA855F7)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        boxShadow: const [BoxShadow(color: Color(0x406366F1), blurRadius: 24, offset: Offset(0, 10))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Amount Due', style: TextStyle(color: Colors.white60, fontWeight: FontWeight.w600, fontSize: 12)),
                const SizedBox(height: 4),
                Text(_fmtCurrency(totalDue), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 30, letterSpacing: -1)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                  child: Text('of ${_fmtCurrency(totalFees)} total', style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.w600, fontSize: 11)),
                ),
              ],
            ),
          ),
          SizedBox(
            width: 78, height: 78,
            child: Stack(
              fit: StackFit.expand,
              children: [
                CircularProgressIndicator(
                  value: pct / 100,
                  strokeWidth: 7,
                  backgroundColor: Colors.white.withOpacity(0.15),
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                  strokeCap: StrokeCap.round,
                ),
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('$pct%', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18)),
                      const Text('Paid', style: TextStyle(color: Colors.white60, fontWeight: FontWeight.w600, fontSize: 10)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatMini(String emoji, String value, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFE2E8F0))),
        child: Column(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.t1)),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: AppTheme.t4)),
          ],
        ),
      ),
    );
  }

  Widget _buildNextDueCountdown(String dateStr) {
    final days = _daysUntil(dateStr);
    final isUrgent = days <= 7;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isUrgent ? const Color(0xFFFFF7ED) : const Color(0xFFF0F9FF),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isUrgent ? const Color(0xFFFED7AA) : const Color(0xFFBAE6FD)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isUrgent ? const Color(0xFFFB923C).withOpacity(0.1) : const Color(0xFF0EA5E9).withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(isUrgent ? '🔥' : '📅', style: const TextStyle(fontSize: 18)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Next Payment Due', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: isUrgent ? const Color(0xFFC2410C) : const Color(0xFF0369A1))),
                const SizedBox(height: 2),
                Text(_fmtDate(dateStr), style: TextStyle(fontWeight: FontWeight.w600, fontSize: 11, color: isUrgent ? const Color(0xFFEA580C) : const Color(0xFF0284C7))),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: isUrgent ? const Color(0xFFFB923C) : const Color(0xFF0EA5E9),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              days <= 0 ? 'Today!' : '$days day${days == 1 ? '' : 's'}',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryCard(dynamic cat) {
    final String category = cat['category'] ?? 'General';
    final double total = (cat['total'] ?? 0).toDouble();
    final double paid = (cat['paid'] ?? 0).toDouble();
    final double due = (cat['due'] ?? 0).toDouble();
    final int pct = cat['pctPaid'] ?? 0;

    final categoryIcons = {
      'GENERAL': '📋', 'TUITION': '🎓', 'TRANSPORT': '🚌', 'ACTIVITY': '⚽',
      'LAB': '🔬', 'LIBRARY': '📚', 'EXAM': '📝', 'HOSTEL': '🏠',
    };
    final icon = categoryIcons[category.toUpperCase()] ?? '📋';
    final displayName = category[0].toUpperCase() + category.substring(1).toLowerCase();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x08000000), blurRadius: 8, offset: Offset(0, 2))],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Text(icon, style: const TextStyle(fontSize: 20)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(displayName, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppTheme.t1)),
                    const SizedBox(height: 2),
                    Text('${_fmtCurrency(paid)} of ${_fmtCurrency(total)}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppTheme.t3)),
                  ],
                ),
              ),
              Text('$pct%', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: pct == 100 ? const Color(0xFF16A34A) : AppTheme.a1)),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: pct / 100,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor: AlwaysStoppedAnimation(pct == 100 ? const Color(0xFF16A34A) : AppTheme.a1),
              minHeight: 6,
            ),
          ),
          if (due > 0) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text('${_fmtCurrency(due)} due', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFFEF4444))),
              ],
            ),
          ],
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // TAB 2: DUE FEES
  // ═══════════════════════════════════════════════════════════════
  Widget _buildDueFeesTab() {
    final pending = _feesData?['pendingFees'] as List<dynamic>? ?? [];

    if (pending.isEmpty) {
      return const Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text('🎉', style: TextStyle(fontSize: 40)),
          SizedBox(height: 8),
          Text('All Caught Up!', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: AppTheme.t1)),
          SizedBox(height: 4),
          Text('No pending fee payments', style: TextStyle(fontSize: 12, color: AppTheme.t3)),
        ]),
      );
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      itemCount: pending.length,
      itemBuilder: (context, index) {
        final f = pending[index];
        return _buildDueFeeCard(f);
      },
    );
  }

  Widget _buildDueFeeCard(dynamic f) {
    final String title = f['title'] ?? 'Fee';
    final String category = f['category'] ?? 'General';
    final double amount = (f['amount'] ?? 0).toDouble();
    final double paid = (f['paid'] ?? 0).toDouble();
    final double due = (f['due'] ?? 0).toDouble();
    final bool isOverdue = f['isOverdue'] == true;
    final String dueDateStr = f['dueDate'] ?? '';
    final double payPct = amount > 0 ? (paid / amount) : 0;

    final catColors = {
      'GENERAL': const Color(0xFF6366F1), 'TUITION': const Color(0xFF8B5CF6),
      'TRANSPORT': const Color(0xFF0EA5E9), 'ACTIVITY': const Color(0xFFF59E0B),
      'LAB': const Color(0xFF10B981), 'EXAM': const Color(0xFFEC4899),
    };
    final catColor = catColors[category.toUpperCase()] ?? const Color(0xFF6366F1);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isOverdue ? const Color(0x40EF4444) : const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: isOverdue ? const Color(0x15EF4444) : const Color(0x08000000),
            blurRadius: 12, offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppTheme.t1)),
                          const SizedBox(height: 4),
                          Row(children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(color: catColor.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                              child: Text(
                                category[0].toUpperCase() + category.substring(1).toLowerCase(),
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: catColor),
                              ),
                            ),
                            const SizedBox(width: 8),
                            if (isOverdue)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(color: const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(6)),
                                child: const Text('OVERDUE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFFEF4444))),
                              ),
                          ]),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(_fmtCurrency(due), style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: isOverdue ? const Color(0xFFEF4444) : AppTheme.a1)),
                        const SizedBox(height: 2),
                        Text('of ${_fmtCurrency(amount)}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: AppTheme.t4)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                // Payment progress
                if (paid > 0) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('${_fmtCurrency(paid)} paid', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF16A34A))),
                      Text('${(payPct * 100).round()}% complete', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.t4)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: payPct,
                      backgroundColor: const Color(0xFFF1F5F9),
                      valueColor: const AlwaysStoppedAnimation(Color(0xFF16A34A)),
                      minHeight: 5,
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
                // Due date
                Row(
                  children: [
                    Icon(Icons.calendar_today_rounded, size: 12, color: isOverdue ? const Color(0xFFEF4444) : AppTheme.t4),
                    const SizedBox(width: 4),
                    Text('Due: ${_fmtDate(dueDateStr)}',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: isOverdue ? const Color(0xFFEF4444) : AppTheme.t3)),
                  ],
                ),
              ],
            ),
          ),
          // Pay button
          Container(
            decoration: BoxDecoration(
              color: isOverdue ? const Color(0xFFFFF1F2) : const Color(0xFFF8FAFC),
              borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(18), bottomRight: Radius.circular(18)),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(18), bottomRight: Radius.circular(18)),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('${_fmtCurrency(due)} payment for "$title" — Gateway coming soon!'),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  );
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.payment_rounded, size: 16, color: isOverdue ? const Color(0xFFE11D48) : AppTheme.a1),
                      const SizedBox(width: 8),
                      Text('Pay ${_fmtCurrency(due)}',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: isOverdue ? const Color(0xFFE11D48) : AppTheme.a1)),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // TAB 3: PAYMENT HISTORY
  // ═══════════════════════════════════════════════════════════════
  Widget _buildHistoryTab() {
    final payments = _feesData?['paymentHistory'] as List<dynamic>? ?? [];

    if (payments.isEmpty) {
      return const Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text('📋', style: TextStyle(fontSize: 40)),
          SizedBox(height: 8),
          Text('No Payment History', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: AppTheme.t1)),
          SizedBox(height: 4),
          Text('Payments will appear here once made', style: TextStyle(fontSize: 12, color: AppTheme.t3)),
        ]),
      );
    }

    // Group by month
    final Map<String, List<dynamic>> groups = {};
    for (var p in payments) {
      final month = _getMonthGroup(p['date']);
      groups.putIfAbsent(month, () => []);
      groups[month]!.add(p);
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      itemCount: groups.length,
      itemBuilder: (context, index) {
        final month = groups.keys.elementAt(index);
        final items = groups[month]!;
        final totalForMonth = items.fold<double>(0, (sum, p) => sum + (p['amount'] ?? 0).toDouble());

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.only(top: index > 0 ? 16 : 0, bottom: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(month, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.t4, letterSpacing: 0.5)),
                  Text(_fmtCurrency(totalForMonth), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF16A34A))),
                ],
              ),
            ),
            ...items.map((p) => _buildPaymentHistoryCard(p)).toList(),
          ],
        );
      },
    );
  }

  Widget _buildPaymentHistoryCard(dynamic p) {
    final String feeTitle = p['feeTitle'] ?? 'Payment';
    final String category = p['feeCategory'] ?? '';
    final double amount = (p['amount'] ?? 0).toDouble();
    final String method = p['method'] ?? 'Online';
    final String? reference = p['reference'];
    final String date = p['date'] ?? '';

    final methodIcons = {
      'Online': Icons.language_rounded,
      'UPI': Icons.qr_code_rounded,
      'Cash': Icons.money_rounded,
      'Cheque': Icons.edit_note_rounded,
      'Bank Transfer': Icons.account_balance_rounded,
      'Card': Icons.credit_card_rounded,
    };
    final methodIcon = methodIcons[method] ?? Icons.payment_rounded;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: const Color(0xFFF0FDF4), borderRadius: BorderRadius.circular(10)),
            child: Icon(Icons.check_circle_rounded, color: const Color(0xFF16A34A), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(feeTitle, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppTheme.t1)),
                const SizedBox(height: 3),
                Row(children: [
                  Icon(methodIcon, size: 11, color: AppTheme.t4),
                  const SizedBox(width: 4),
                  Text(method, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: AppTheme.t3)),
                  if (reference != null && reference.isNotEmpty) ...[
                    const Text(' · ', style: TextStyle(color: AppTheme.t4)),
                    Text('#$reference', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: AppTheme.t4)),
                  ],
                ]),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(_fmtCurrency(amount), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Color(0xFF16A34A))),
              const SizedBox(height: 2),
              Text(_fmtShortDate(date), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppTheme.t4)),
            ],
          ),
        ],
      ),
    );
  }
}
