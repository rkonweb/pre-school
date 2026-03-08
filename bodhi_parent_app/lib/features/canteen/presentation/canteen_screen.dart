import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../../dashboard/data/dashboard_provider.dart';

// ─── Providers ───────────────────────────────────────────────────────────────
final canteenMenuProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, studentId) async {
  final api = ref.read(apiClientProvider);
  final r = await api.get('parent/canteen', queryParameters: {'studentId': studentId, 'view': 'menu'});
  if (r.data['success'] == true) return Map<String, dynamic>.from(r.data['data'] ?? {});
  throw Exception(r.data['error'] ?? 'Failed to load menu');
});

final canteenWalletProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, studentId) async {
  final api = ref.read(apiClientProvider);
  final r = await api.get('parent/canteen', queryParameters: {'studentId': studentId, 'view': 'wallet'});
  if (r.data['success'] == true) return Map<String, dynamic>.from(r.data['data'] ?? {});
  throw Exception(r.data['error'] ?? 'Failed to load wallet');
});

final canteenOrdersProvider = FutureProvider.family<List<dynamic>, String>((ref, studentId) async {
  final api = ref.read(apiClientProvider);
  final r = await api.get('parent/canteen', queryParameters: {'studentId': studentId, 'view': 'orders'});
  if (r.data['success'] == true) return r.data['data'] as List? ?? [];
  throw Exception(r.data['error'] ?? 'Failed to load orders');
});

// ─── Screen ──────────────────────────────────────────────────────────────────
class CanteenScreen extends ConsumerStatefulWidget {
  const CanteenScreen({super.key});

  @override
  ConsumerState<CanteenScreen> createState() => _CanteenScreenState();
}

class _CanteenScreenState extends ConsumerState<CanteenScreen> {
  int _selectedTab = 0; // 0=All, 1=Breakfast, 2=Lunch, 3=Snacks, 4=Healthy

  static const _tabs = [
    {'emoji': '📋', 'label': 'All'},
    {'emoji': '🌅', 'label': 'Breakfast'},
    {'emoji': '🍱', 'label': 'Lunch'},
    {'emoji': '🧃', 'label': 'Snacks'},
    {'emoji': '🌿', 'label': 'Healthy'},
  ];

  static const _mealEmoji = {
    'BREAKFAST': '🥣',
    'LUNCH': '🍛',
    'SNACK': '🧃',
    'OTHER': '🍽',
  };

  static const _mealTimes = {
    'BREAKFAST': '7:30–8:30 AM',
    'LUNCH': '12:15–1:00 PM',
    'SNACK': '3:00–3:30 PM',
  };

  static const _mealColors = {
    'BREAKFAST': Color(0xFFF57F17),
    'LUNCH': Color(0xFF2E7D32),
    'SNACK': Color(0xFF6A1B9A),
  };

  @override
  Widget build(BuildContext context) {
    final dashAsync = ref.watch(dashboardDataProvider);
    final studentId = dashAsync.maybeWhen(data: (d) => d['activeStudentId'] as String?, orElse: () => null);

    if (studentId == null) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final menuAsync = ref.watch(canteenMenuProvider(studentId));
    final walletAsync = ref.watch(canteenWalletProvider(studentId));
    final ordersAsync = ref.watch(canteenOrdersProvider(studentId));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppHeader(
        title: 'Canteen',
        subtitle: 'City School · Wednesday, Nov 20',
        showBackButton: false,
        showMenuButton: true,
        actions: [
          ElevatedButton(
            onPressed: () {},
            style: AppTheme.headerButtonStyle(),
            child: const Icon(Icons.search_rounded, size: 20),
          ),
          ElevatedButton(
            onPressed: () {},
            style: AppTheme.headerButtonStyle(),
            child: Stack(
              children: [
                const Center(child: Icon(Icons.notifications_outlined, size: 20)),
                Positioned(top: 10, right: 10,
                  child: Container(width: 8, height: 8,
                    decoration: const BoxDecoration(color: Color(0xFFEF4444), shape: BoxShape.circle))),
              ],
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Container(
            padding: const EdgeInsets.only(bottom: 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: List.generate(_tabs.length, (i) => GestureDetector(
                  onTap: () => setState(() => _selectedTab = i),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: _selectedTab == i ? const Color(0xFF2350DD) : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: _selectedTab == i ? const Color(0xFF2350DD) : const Color(0xFFE2E8F0)),
                    ),
                    child: Row(children: [
                      Text(_tabs[i]['emoji']!, style: const TextStyle(fontSize: 13)),
                      const SizedBox(width: 6),
                      Text(_tabs[i]['label']!, style: GoogleFonts.dmSans(
                        fontSize: 13, fontWeight: FontWeight.w600,
                        color: _selectedTab == i ? Colors.white : const Color(0xFF64748B),
                      )),
                    ]),
                  ),
                )),
              ),
            ),
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(canteenMenuProvider(studentId));
          ref.invalidate(canteenWalletProvider(studentId));
          ref.invalidate(canteenOrdersProvider(studentId));
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildAllergenAlert(),
              const SizedBox(height: 20),
              _buildSectionHeader("Emma's Canteen Wallet", null),
              const SizedBox(height: 12),
              walletAsync.when(
                data: (w) => _buildWalletCard(w as Map<String, dynamic>),
                loading: () => _shimmerBox(120),
                error: (e, _) => _buildWalletCard({'balance': 0.0, 'transactions': []}),
              ),
              const SizedBox(height: 16),
              _buildRechargeRow(),
              const SizedBox(height: 20),
              _buildSectionHeader("Today's Menu", 'Full Menu'),
              const SizedBox(height: 12),
              _buildMenuHeroCard(),
              const SizedBox(height: 16),
              menuAsync.when(
                data: (m) {
                  final items = (m as Map<String, dynamic>)['allItems'] as List? ?? [];
                  final grouped = <String, List<dynamic>>{};
                  for (final item in items) {
                    final mt = item['mealType'] as String? ?? 'OTHER';
                    grouped.putIfAbsent(mt, () => []).add(item);
                  }
                  final filtered = _selectedTab == 0
                      ? grouped
                      : {for (final e in grouped.entries) if (_tabMatchesMeal(_selectedTab, e.key)) e.key: e.value};
                  if (filtered.isEmpty) {
                    return const Center(
                      child: Padding(padding: EdgeInsets.all(40), child: Text('No items for this filter', style: TextStyle(color: Color(0xFF94A3B8)))),
                    );
                  }
                  return Column(
                    children: filtered.entries.map((entry) => Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildMealSectionHeader(entry.key),
                        const SizedBox(height: 8),
                        ...entry.value.map((item) => _buildItemCard(item as Map<String, dynamic>)),
                        const SizedBox(height: 16),
                      ],
                    )).toList(),
                  );
                },
                loading: () => Column(children: [_shimmerBox(140), const SizedBox(height: 12), _shimmerBox(140)]),
                error: (e, _) => _buildErrorText(e.toString()),
              ),
              _buildSectionHeader('Recent Transactions', 'View All'),
              const SizedBox(height: 12),
              walletAsync.when(
                data: (w) => _buildTransactionList((w as Map<String, dynamic>)['transactions'] as List? ?? []),
                loading: () => _shimmerBox(80),
                error: (_, __) => const SizedBox(),
              ),
              const SizedBox(height: 20),
              _buildSectionHeader('Spending Analytics', null),
              const SizedBox(height: 12),
              _buildAnalyticsCard(),
              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildCartBar(),
    );
  }

  // ──────────────────────────────────────────────────────────
  // HEADER
  // ──────────────────────────────────────────────────────────
  Widget _buildHeader() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: () => Navigator.of(context).pop(),
                child: Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.arrow_back_ios_new_rounded, size: 16, color: Color(0xFF0F172A)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('🍽 Canteen', style: GoogleFonts.sora(fontWeight: FontWeight.w800, fontSize: 20, color: const Color(0xFF0F172A))),
                    Text('City School · Wednesday, Nov 20', style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF64748B))),
                  ],
                ),
              ),
              Container(
                width: 36, height: 36,
                decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.search_rounded, size: 18, color: Color(0xFF0F172A)),
              ),
              const SizedBox(width: 8),
              Container(
                width: 36, height: 36,
                decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10)),
                child: Stack(
                  children: [
                    const Center(child: Icon(Icons.notifications_outlined, size: 18, color: Color(0xFF0F172A))),
                    Positioned(top: 8, right: 8,
                      child: Container(width: 8, height: 8,
                        decoration: const BoxDecoration(color: Color(0xFFEF4444), shape: BoxShape.circle))),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Filter tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(_tabs.length, (i) => GestureDetector(
                onTap: () => setState(() => _selectedTab = i),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: _selectedTab == i ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: _selectedTab == i ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0)),
                  ),
                  child: Row(children: [
                    Text(_tabs[i]['emoji']!, style: const TextStyle(fontSize: 13)),
                    const SizedBox(width: 6),
                    Text(_tabs[i]['label']!, style: GoogleFonts.dmSans(
                      fontSize: 13, fontWeight: FontWeight.w600,
                      color: _selectedTab == i ? Colors.white : const Color(0xFF475569),
                    )),
                  ]),
                ),
              )),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────────────────
  // BODY
  // ──────────────────────────────────────────────────────────
  Widget _buildBody(AsyncValue menuAsync, AsyncValue walletAsync, AsyncValue ordersAsync) {
    return RefreshIndicator(
      onRefresh: () async {
        final sid = ref.read(dashboardDataProvider).maybeWhen(data: (d) => d['activeStudentId'] as String?, orElse: () => null);
        if (sid != null) {
          ref.invalidate(canteenMenuProvider(sid));
          ref.invalidate(canteenWalletProvider(sid));
          ref.invalidate(canteenOrdersProvider(sid));
        }
      },
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Allergen Alert
            _buildAllergenAlert(),
            const SizedBox(height: 20),

            // Wallet
            _buildSectionHeader('Emma\'s Canteen Wallet', null),
            const SizedBox(height: 12),
            walletAsync.when(
              data: (w) => _buildWalletCard(w as Map<String, dynamic>),
              loading: () => _shimmerBox(120),
              error: (e, _) => _buildWalletCard({'balance': 0.0, 'transactions': []}),
            ),
            const SizedBox(height: 16),

            // Quick Recharge
            _buildRechargeRow(),
            const SizedBox(height: 20),

            // Today's Menu
            _buildSectionHeader("Today's Menu", 'Full Menu'),
            const SizedBox(height: 12),
            _buildMenuHeroCard(),
            const SizedBox(height: 16),

            menuAsync.when(
              data: (m) {
                final items = (m as Map<String, dynamic>)['allItems'] as List? ?? [];
                final grouped = <String, List<dynamic>>{};
                for (final item in items) {
                  final mt = item['mealType'] as String? ?? 'OTHER';
                  grouped.putIfAbsent(mt, () => []).add(item);
                }

                // Apply tab filter
                final filtered = _selectedTab == 0
                    ? grouped
                    : {
                        for (final e in grouped.entries)
                          if (_tabMatchesMeal(_selectedTab, e.key)) e.key: e.value
                      };

                if (filtered.isEmpty) {
                  return const Center(
                    child: Padding(padding: EdgeInsets.all(40), child: Text('No items for this filter', style: TextStyle(color: Color(0xFF94A3B8)))),
                  );
                }

                return Column(
                  children: filtered.entries.map((entry) => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildMealSectionHeader(entry.key),
                      const SizedBox(height: 8),
                      ...entry.value.map((item) => _buildItemCard(item as Map<String, dynamic>)),
                      const SizedBox(height: 16),
                    ],
                  )).toList(),
                );
              },
              loading: () => Column(children: [_shimmerBox(140), const SizedBox(height: 12), _shimmerBox(140)]),
              error: (e, _) => _buildErrorText(e.toString()),
            ),

            // Transaction History
            _buildSectionHeader('Recent Transactions', 'View All'),
            const SizedBox(height: 12),
            walletAsync.when(
              data: (w) => _buildTransactionList((w as Map<String, dynamic>)['transactions'] as List? ?? []),
              loading: () => _shimmerBox(80),
              error: (_, __) => const SizedBox(),
            ),
            const SizedBox(height: 20),

            // Spending Analytics
            _buildSectionHeader('Spending Analytics', null),
            const SizedBox(height: 12),
            _buildAnalyticsCard(),
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  bool _tabMatchesMeal(int tab, String mt) {
    if (tab == 1) return mt == 'BREAKFAST';
    if (tab == 2) return mt == 'LUNCH';
    if (tab == 3) return mt == 'SNACK';
    if (tab == 4) return true; // Healthy — show all
    return true;
  }

  // ──────────────────────────────────────────────────────────
  // ALLERGEN ALERT
  // ──────────────────────────────────────────────────────────
  Widget _buildAllergenAlert() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFFED7AA)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('⚠️', style: TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Emma's Allergen Profile Active", style: GoogleFonts.sora(fontWeight: FontWeight.w700, fontSize: 13, color: const Color(0xFF9A3412))),
              const SizedBox(height: 4),
              Text("Items containing Emma's allergens are marked and filtered. Menu is personalised based on her dietary record.",
                style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFFC2410C), height: 1.4)),
              const SizedBox(height: 8),
              Wrap(spacing: 6, runSpacing: 6, children: [
                for (final tag in ['🥜 Peanuts', '🥛 Lactose', '🐠 Shellfish'])
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(6)),
                    child: Text(tag, style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF9A3412))),
                  )
              ]),
            ],
          ))
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────────────────
  // WALLET CARD
  // ──────────────────────────────────────────────────────────
  Widget _buildWalletCard(Map<String, dynamic> wallet) {
    final balance = (wallet['balance'] as num?)?.toDouble() ?? 0.0;
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF3B6EF8), Color(0xFF00C9A7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: const Color(0xFF3B6EF8).withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Available Balance', style: GoogleFonts.dmSans(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 4),
                  RichText(text: TextSpan(children: [
                    TextSpan(text: '₹', style: GoogleFonts.sora(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    TextSpan(text: balance.toStringAsFixed(2), style: GoogleFonts.sora(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900)),
                  ])),
                  const SizedBox(height: 4),
                  Text('Updated just now · Auto-recharge enabled', style: GoogleFonts.dmSans(color: Colors.white60, fontSize: 11)),
                ]),
                const Text('🪙', style: TextStyle(fontSize: 36)),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                for (final chip in [
                  {'ico': '⚡', 'lbl': 'Quick Pay'},
                  {'ico': '➕', 'lbl': 'Add Money'},
                  {'ico': '📊', 'lbl': 'Spending'},
                  {'ico': '⚙️', 'lbl': 'Settings'},
                ])
                  Expanded(
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(children: [
                        Text(chip['ico']!, style: const TextStyle(fontSize: 16)),
                        const SizedBox(height: 4),
                        Text(chip['lbl']!, style: GoogleFonts.dmSans(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700)),
                      ]),
                    ),
                  )
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.white.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text('Monthly spend', style: GoogleFonts.dmSans(color: Colors.white70, fontSize: 11)),
                  Text('₹1,240 of ₹2,000 limit', style: GoogleFonts.dmSans(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ]),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: 0.62,
                    minHeight: 6,
                    backgroundColor: Colors.white24,
                    valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
              ]),
            ),
          ],
        ),
      ),
    );
  }

  // ──────────────────────────────────────────────────────────
  // QUICK RECHARGE
  // ──────────────────────────────────────────────────────────
  Widget _buildRechargeRow() {
    final options = [
      {'amt': '₹100', 'lbl': 'Add'},
      {'amt': '₹200', 'lbl': 'Add'},
      {'amt': '₹500', 'lbl': 'Popular'},
      {'amt': '₹1K', 'lbl': 'Best Value'},
    ];
    return Row(
      children: options.map((o) => Expanded(
        child: Container(
          margin: const EdgeInsets.only(right: 8),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)],
          ),
          child: Column(children: [
            Text(o['amt']!, style: GoogleFonts.sora(fontWeight: FontWeight.w800, fontSize: 15, color: const Color(0xFF0F172A))),
            const SizedBox(height: 2),
            Text(o['lbl']!, style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF64748B))),
          ]),
        ),
      )).toList(),
    );
  }

  // ──────────────────────────────────────────────────────────
  // MENU HERO
  // ──────────────────────────────────────────────────────────
  Widget _buildMenuHeroCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('🍽 Wednesday Special Menu', style: GoogleFonts.sora(fontWeight: FontWeight.w800, fontSize: 14, color: const Color(0xFF0F172A))),
          const SizedBox(height: 2),
          Text('Nov 20, 2024 · 3 meal slots', style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF64748B))),
          const SizedBox(height: 12),
          Row(children: [
            for (final slot in [
              {'ico': '🌅', 'name': 'Breakfast', 'time': '7:30–8:30', 'active': false},
              {'ico': '🍱', 'name': 'Lunch', 'time': '12:15–1:00', 'active': true},
              {'ico': '🧃', 'name': 'Snacks', 'time': '3:00–3:30', 'active': false},
            ])
              Expanded(
                child: Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    color: (slot['active'] as bool) ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: (slot['active'] as bool) ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0)),
                  ),
                  child: Column(children: [
                    Text(slot['ico'] as String, style: const TextStyle(fontSize: 18)),
                    const SizedBox(height: 4),
                    Text(slot['name'] as String, style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, fontSize: 11, color: (slot['active'] as bool) ? Colors.white : const Color(0xFF0F172A))),
                    Text(slot['time'] as String, style: GoogleFonts.dmSans(fontSize: 9, color: (slot['active'] as bool) ? Colors.white60 : const Color(0xFF64748B))),
                  ]),
                ),
              )
          ]),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────────────────
  // MEAL SECTION HEADER
  // ──────────────────────────────────────────────────────────
  Widget _buildMealSectionHeader(String mealType) {
    final emoji = mealType == 'BREAKFAST' ? '🌅' : mealType == 'LUNCH' ? '🍱' : '🧃';
    final time = _mealTimes[mealType] ?? '';
    return Row(children: [
      Text('$emoji $mealType · $time', style: GoogleFonts.sora(fontWeight: FontWeight.w700, fontSize: 13, color: const Color(0xFF475569))),
      const SizedBox(width: 12),
      Expanded(child: Container(height: 1, color: const Color(0xFFE2E8F0))),
    ]);
  }

  // ──────────────────────────────────────────────────────────
  // ITEM CARD
  // ──────────────────────────────────────────────────────────
  Widget _buildItemCard(Map<String, dynamic> item) {
    final name = item['name'] as String? ?? '';
    final category = item['category'] as String? ?? '';
    final price = (item['price'] as num?)?.toStringAsFixed(0) ?? '0';
    final mealType = item['mealType'] as String? ?? 'BREAKFAST';
    final emoji = _mealEmoji[mealType] ?? '🍽';

    // Descriptions from UI design
    const descs = {
      'Idli Sambar with Chutney': 'Steamed rice cakes served with hot sambar & coconut chutney. 3 idlis per serving.',
      'Batata Poha with Lemon': 'Flattened rice with potato, mustard seeds, curry leaves & fresh lemon. Light and energising.',
      'Dal Tadka Rice Combo': 'Yellow lentil dal with basmati rice, chapati (2), pickle & papad. Full balanced meal for active students.',
      'Paneer Butter Masala + Rice': 'Creamy tomato-based cottage cheese curry with butter naan (1) and steamed basmati rice.',
      'Seasonal Fruit Bowl': 'Mixed seasonal fruits — apple, banana, papaya, guava and pomegranate. Freshly cut every day.',
      'Grilled Masala Sandwich': 'Whole wheat bread with spiced potato filling, capsicum, onion, green chutney and cheese topping.',
    };
    const ratings = {'Idli Sambar with Chutney': '4.8', 'Batata Poha with Lemon': '4.4', 'Dal Tadka Rice Combo': '4.9', 'Paneer Butter Masala + Rice': '4.6', 'Seasonal Fruit Bowl': '4.5', 'Grilled Masala Sandwich': '4.7'};
    const kcals = {'Idli Sambar with Chutney': 280, 'Batata Poha with Lemon': 240, 'Dal Tadka Rice Combo': 560, 'Paneer Butter Masala + Rice': 620, 'Seasonal Fruit Bowl': 120, 'Grilled Masala Sandwich': 320};
    const nutrients = {
      'Idli Sambar with Chutney': ['9g', '52g', '3g', '2g'],
      'Batata Poha with Lemon': ['5g', '47g', '4g', '3g'],
      'Dal Tadka Rice Combo': ['22g', '88g', '8g', '7g'],
      'Paneer Butter Masala + Rice': ['24g', '72g', '24g', '4g'],
      'Seasonal Fruit Bowl': ['2g', '28g', '0.5g', '4g'],
      'Grilled Masala Sandwich': ['10g', '44g', '11g', '3g'],
    };

    final desc = descs[name] ?? 'Delicious and freshly prepared meal.';
    final rating = ratings[name] ?? '4.5';
    final kcal = kcals[name] ?? 280;
    final nut = nutrients[name] ?? ['8g', '40g', '5g', '3g'];
    final isDairyConcern = name.contains('Paneer') || name.contains('Sandwich');

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(children: [
        Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Emoji box
              Container(
                width: 52, height: 52,
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFF1F5F9)),
                ),
                child: Center(child: Text(emoji, style: const TextStyle(fontSize: 26))),
              ),
              const SizedBox(width: 12),
              // Text body
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('$category · Vegetarian', style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w500)),
                  const SizedBox(height: 3),
                  Text(name, style: GoogleFonts.sora(fontWeight: FontWeight.w700, fontSize: 14, color: const Color(0xFF0F172A))),
                  const SizedBox(height: 4),
                  Text(desc, style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF64748B), height: 1.4), maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 8),
                  // Tags
                  Wrap(spacing: 6, runSpacing: 6, children: [
                    _itemTag('🌿 Veg', const Color(0xFFF0FDF4), const Color(0xFF16A34A)),
                    _itemTag('✓ Safe', const Color(0xFFF0FDF4), const Color(0xFF00C9A7)),
                    if (isDairyConcern)
                      _itemTag('⚠ Contains Dairy', const Color(0xFFFEF2F2), const Color(0xFFEF4444))
                    else
                      _itemTag('$kcal kcal', const Color(0xFFF8FAFC), const Color(0xFF64748B)),
                  ]),
                  const SizedBox(height: 8),
                  // Stars
                  Row(children: [
                    ...List.generate(5, (i) => Icon(
                      i < double.parse(rating).floor() ? Icons.star_rounded : Icons.star_outline_rounded,
                      color: const Color(0xFFF5A623), size: 13,
                    )),
                    const SizedBox(width: 4),
                    Text(rating, style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, fontSize: 11, color: const Color(0xFF0F172A))),
                    const SizedBox(width: 4),
                    Text('(${(int.parse(price) * 3 + 12)} ratings)', style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF94A3B8))),
                  ]),
                ]),
              ),
              // Price + Add
              Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('₹$price', style: GoogleFonts.sora(fontWeight: FontWeight.w900, fontSize: 17, color: const Color(0xFF0F172A))),
                const SizedBox(height: 12),
                Container(
                  width: 34, height: 34,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                  ),
                  child: const Icon(Icons.add_rounded, size: 18, color: Color(0xFF0F172A)),
                )
              ]),
            ],
          ),
        ),
        // Nutrition footer
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: const BoxDecoration(
            color: Color(0xFFF8FAFC),
            borderRadius: BorderRadius.only(bottomLeft: Radius.circular(16), bottomRight: Radius.circular(16)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _nutItem('$kcal', 'Calories'),
              _nutItem(nut[0], 'Protein'),
              _nutItem(nut[1], 'Carbs'),
              _nutItem(nut[2], 'Fat'),
              _nutItem(nut[3], 'Fibre'),
            ],
          ),
        ),
      ]),
    );
  }

  Widget _itemTag(String label, Color bg, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
    decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
    child: Text(label, style: GoogleFonts.dmSans(fontSize: 10, fontWeight: FontWeight.w700, color: color)),
  );

  Widget _nutItem(String val, String lbl) => Column(children: [
    Text(val, style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 12, color: const Color(0xFF0F172A))),
    const SizedBox(height: 2),
    Text(lbl, style: GoogleFonts.dmSans(fontSize: 9, color: const Color(0xFF64748B))),
  ]);

  // ──────────────────────────────────────────────────────────
  // TRANSACTIONS
  // ──────────────────────────────────────────────────────────
  Widget _buildTransactionList(List txns) {
    if (txns.isEmpty) return const Padding(padding: EdgeInsets.all(20), child: Center(child: Text('No transactions yet', style: TextStyle(color: Color(0xFF94A3B8)))));

    const txnEmojis = {'DEBIT': '🍛', 'CREDIT': '💳'};

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Wallet Transactions', style: GoogleFonts.sora(fontWeight: FontWeight.w700, fontSize: 13, color: const Color(0xFF0F172A))),
                Text('This Month', style: GoogleFonts.dmSans(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF94A3B8))),
              ],
            ),
          ),
          ...txns.asMap().entries.map((entry) {
            final i = entry.key;
            final t = entry.value as Map<String, dynamic>;
            final isCredit = t['type'] == 'CREDIT';
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: const Color(0xFFF1F5F9), width: i == 0 ? 1 : 0.5)),
              ),
              child: Row(children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(
                    color: isCredit ? const Color(0xFFF0FDFA) : const Color(0xFFFFF5EE),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(child: Text(txnEmojis[t['type']] ?? '💳', style: const TextStyle(fontSize: 18))),
                ),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(t['description'] ?? '', style: GoogleFonts.dmSans(fontWeight: FontWeight.w600, fontSize: 13, color: const Color(0xFF0F172A))),
                  Text(t['reason'] ?? '', style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF94A3B8))),
                ])),
                Text(
                  '${isCredit ? '+' : '-'}₹${(t['amount'] as num?)?.toStringAsFixed(0) ?? '0'}',
                  style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 14, color: isCredit ? const Color(0xFF00C9A7) : const Color(0xFFEF4444)),
                ),
              ]),
            );
          }),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────────────────
  // ANALYTICS
  // ──────────────────────────────────────────────────────────
  Widget _buildAnalyticsCard() {
    final bars = [
      {'month': 'Jul', 'val': 0.55, 'amt': '₹980'},
      {'month': 'Aug', 'val': 0.72, 'amt': '₹1.2k'},
      {'month': 'Sep', 'val': 0.62, 'amt': '₹1.1k'},
      {'month': 'Oct', 'val': 0.85, 'amt': '₹1.5k'},
      {'month': 'Nov', 'val': 0.70, 'amt': '₹1.2k'},
    ];
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('📊 Monthly Spend Trend', style: GoogleFonts.sora(fontWeight: FontWeight.w700, fontSize: 13, color: const Color(0xFF0F172A))),
            Text('Oct – Nov 2024', style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF94A3B8))),
          ]),
          const SizedBox(height: 20),
          SizedBox(
            height: 80,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: bars.asMap().entries.map((e) {
                final isLast = e.key == bars.length - 1;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Column(mainAxisAlignment: MainAxisAlignment.end, children: [
                      Text(e.value['amt'] as String, style: GoogleFonts.dmSans(
                        fontSize: 9, fontWeight: FontWeight.bold,
                        color: isLast ? const Color(0xFF3B6EF8) : const Color(0xFF94A3B8),
                      )),
                      const SizedBox(height: 4),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 600),
                        height: 60 * (e.value['val'] as double),
                        decoration: BoxDecoration(
                          color: isLast ? const Color(0xFF3B6EF8) : const Color(0xFF3B6EF8).withOpacity(0.25),
                          borderRadius: const BorderRadius.only(topLeft: Radius.circular(4), topRight: Radius.circular(4)),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(e.value['month'] as String, style: GoogleFonts.dmSans(
                        fontSize: 10, fontWeight: isLast ? FontWeight.bold : FontWeight.normal,
                        color: isLast ? const Color(0xFF3B6EF8) : const Color(0xFF94A3B8),
                      )),
                    ]),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),
          const Divider(color: Color(0xFFF1F5F9)),
          const SizedBox(height: 8),
          for (final cat in [
            {'ico': '🍛', 'name': 'Lunch', 'amt': '₹680 · 55%'},
            {'ico': '🥣', 'name': 'Breakfast', 'amt': '₹310 · 25%'},
            {'ico': '🧃', 'name': 'Snacks', 'amt': '₹185 · 15%'},
            {'ico': '🍹', 'name': 'Beverages', 'amt': '₹65 · 5%'},
          ])
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(children: [
                Text(cat['ico']!, style: const TextStyle(fontSize: 18)),
                const SizedBox(width: 10),
                Expanded(child: Text(cat['name']!, style: GoogleFonts.dmSans(fontWeight: FontWeight.w600, fontSize: 13, color: const Color(0xFF0F172A)))),
                Text(cat['amt']!, style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF64748B))),
              ]),
            ),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────────────────
  // CART BAR
  // ──────────────────────────────────────────────────────────
  Widget _buildCartBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 16, offset: const Offset(0, 6))],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(children: [
              Container(
                width: 28, height: 28,
                decoration: const BoxDecoration(color: Colors.white24, shape: BoxShape.circle),
                child: const Center(child: Text('2', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold))),
              ),
              const SizedBox(width: 12),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('2 items in cart', style: GoogleFonts.dmSans(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                Text('₹110.00', style: GoogleFonts.dmSans(color: Colors.white60, fontSize: 11)),
              ]),
            ]),
            Text('Order Now →', style: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
          ],
        ),
      ),
    );
  }

  // ──────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────
  Widget _buildSectionHeader(String title, String? action) {
    return Row(children: [
      Text(title, style: GoogleFonts.sora(fontWeight: FontWeight.w700, fontSize: 14, color: const Color(0xFF0F172A))),
      const SizedBox(width: 10),
      Expanded(child: Container(height: 1, color: const Color(0xFFE2E8F0))),
      if (action != null) ...[
        const SizedBox(width: 10),
        Text(action, style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF3B6EF8))),
      ],
    ]);
  }

  Widget _shimmerBox(double height) => Container(
    height: height,
    decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(16)),
  );

  Widget _buildErrorText(String msg) => Padding(
    padding: const EdgeInsets.all(16),
    child: Text('Error: $msg', style: const TextStyle(color: Colors.red, fontSize: 12)),
  );
}
