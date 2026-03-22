import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const _ink  = Color(0xFF140E28);
const _ink3 = Color(0xFF7B7291);
const _line = Color(0x12140E28);
const _cA   = Color(0xFFE11D48);
const _cB   = Color(0xFFBE185D);

class CanteenDashboardView extends StatelessWidget {
  const CanteenDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Hero ──────────────────────────────────────────────────────────────
        _CanteenHero(),
        const SizedBox(height: 20),

        // ── Today's Stats ─────────────────────────────────────────────────────
        const _SectionLabel('📊  TODAY\'S SUMMARY'),
        const SizedBox(height: 12),
        const _StatRow(),
        const SizedBox(height: 24),

        // ── Quick Actions ─────────────────────────────────────────────────────
        const _SectionLabel('⚡  QUICK ACTIONS'),
        const SizedBox(height: 12),
        const _QuickActions(),
        const SizedBox(height: 24),

        // ── Menu of the Day ───────────────────────────────────────────────────
        const _SectionLabel('🍽️  MENU OF THE DAY'),
        const SizedBox(height: 12),
        const _MenuList(),
      ],
    );
  }
}

class _CanteenHero extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [_cA, _cB], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: _cA.withOpacity(0.35), blurRadius: 24, offset: const Offset(0, 8))],
      ),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.18), borderRadius: BorderRadius.circular(100)),
            child: const Text('Canteen Manager · Today', style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
          ),
          const SizedBox(height: 10),
          const Text('Canteen 🍽️', style: TextStyle(fontFamily: 'Clash Display', fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.5)),
          const SizedBox(height: 6),
          Text('142 orders today · Kitchen open', style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w500, color: Colors.white.withOpacity(0.75))),
        ])),
        Container(
          width: 56, height: 56,
          decoration: BoxDecoration(color: Colors.white.withOpacity(0.18), shape: BoxShape.circle),
          child: const Icon(Icons.restaurant_rounded, color: Colors.white, size: 28),
        ),
      ]),
    );
  }
}

class _StatRow extends StatelessWidget {
  const _StatRow();

  @override
  Widget build(BuildContext context) {
    const stats = [
      ('142', 'Orders', Color(0xFFE11D48)),
      ('38', 'Pending', Color(0xFFF59E0B)),
      ('104', 'Served', Color(0xFF10B981)),
    ];
    return Row(
      children: [
        for (int i = 0; i < stats.length; i++) ...[
          if (i > 0) const SizedBox(width: 10),
          Expanded(child: _StatCard(value: stats[i].$1, label: stats[i].$2, color: stats[i].$3)),
        ],
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String value, label;
  final Color color;
  const _StatCard({required this.value, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _line, width: 1.5),
      ),
      child: Column(children: [
        Text(value, style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 22, fontWeight: FontWeight.w900, color: color)),
        const SizedBox(height: 4),
        Text(label.toUpperCase(), style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w700, color: _ink3, letterSpacing: 0.3)),
      ]),
    );
  }
}

class _QuickActions extends StatelessWidget {
  const _QuickActions();

  @override
  Widget build(BuildContext context) {
    final actions = [
      ('Mark Orders', Icons.check_circle_outline_rounded, const Color(0xFF10B981)),
      ('View Menu', Icons.menu_book_rounded, const Color(0xFF3B82F6)),
      ('Low Stock', Icons.inventory_2_rounded, const Color(0xFFF59E0B)),
      ('Daily Report', Icons.assessment_rounded, const Color(0xFF8B5CF6)),
    ];
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 4, crossAxisSpacing: 10, mainAxisSpacing: 10, childAspectRatio: 0.9,
      children: actions.map((a) => GestureDetector(
        onTap: () => HapticFeedback.selectionClick(),
        child: Container(
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: _line, width: 1.5)),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Container(width: 38, height: 38,
              decoration: BoxDecoration(color: a.$3.withOpacity(0.1), borderRadius: BorderRadius.circular(11)),
              child: Icon(a.$2, size: 19, color: a.$3)),
            const SizedBox(height: 6),
            Text(a.$1, textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9.5, fontWeight: FontWeight.w800, color: _ink)),
          ]),
        ),
      )).toList(),
    );
  }
}

class _MenuList extends StatelessWidget {
  const _MenuList();

  @override
  Widget build(BuildContext context) {
    const items = [
      ('Veg Fried Rice', 'Lunch · ₹50', Icons.rice_bowl_rounded, Color(0xFF10B981)),
      ('Paneer Roll', 'Snack · ₹30', Icons.lunch_dining_rounded, Color(0xFFF59E0B)),
      ('Mango Lassi', 'Drink · ₹25', Icons.local_drink_rounded, Color(0xFF3B82F6)),
      ('Fruit Salad', 'Dessert · ₹35', Icons.spa_rounded, Color(0xFFE11D48)),
    ];
    return Column(
      children: items.map((item) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: _line, width: 1.5)),
        child: Row(children: [
          Container(width: 40, height: 40,
            decoration: BoxDecoration(color: item.$4.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(item.$3, size: 20, color: item.$4)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(item.$1, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w800, color: _ink)),
            Text(item.$2, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w500, color: _ink3)),
          ])),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.1), borderRadius: BorderRadius.circular(100)),
            child: const Text('Available', style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF10B981))),
          ),
        ]),
      )).toList(),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) => Text(text,
    style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 0.8, color: Color(0xFF94A3B8)));
}
