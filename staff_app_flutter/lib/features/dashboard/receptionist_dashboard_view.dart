import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const _ink  = Color(0xFF140E28);
const _ink3 = Color(0xFF7B7291);
const _line = Color(0x12140E28);
const _rA   = Color(0xFF0891B2); // receptionist teal
const _rB   = Color(0xFF0E7490);

class ReceptionistDashboardView extends StatelessWidget {
  const ReceptionistDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _ReceptionistHero(),
        const SizedBox(height: 20),

        const _SectionLabel('📊  TODAY\'S SUMMARY'),
        const SizedBox(height: 12),
        const _StatRow(),
        const SizedBox(height: 24),

        const _SectionLabel('⚡  QUICK ACTIONS'),
        const SizedBox(height: 12),
        const _QuickActions(),
        const SizedBox(height: 24),

        const _SectionLabel('👤  TODAY\'S VISITORS'),
        const SizedBox(height: 12),
        const _VisitorList(),
      ],
    );
  }
}

class _ReceptionistHero extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [_rA, _rB], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: _rA.withOpacity(0.35), blurRadius: 24, offset: const Offset(0, 8))],
      ),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.18), borderRadius: BorderRadius.circular(100)),
            child: const Text('Receptionist · Front Desk', style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
          ),
          const SizedBox(height: 10),
          const Text('Reception 🎫', style: TextStyle(fontFamily: 'Clash Display', fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.5)),
          const SizedBox(height: 6),
          Text('12 visitors today · 3 waiting', style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w500, color: Colors.white.withOpacity(0.75))),
        ])),
        Container(
          width: 56, height: 56,
          decoration: BoxDecoration(color: Colors.white.withOpacity(0.18), shape: BoxShape.circle),
          child: const Icon(Icons.sensor_door_rounded, color: Colors.white, size: 28),
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
      ('12', 'Visitors', Color(0xFF0891B2)),
      ('3', 'Waiting', Color(0xFFF59E0B)),
      ('5', 'Enquiries', Color(0xFF8B5CF6)),
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
      ('Add Visitor', Icons.person_add_rounded, const Color(0xFF0891B2)),
      ('Parent Req.', Icons.contact_support_rounded, const Color(0xFF8B5CF6)),
      ('Directory', Icons.contacts_rounded, const Color(0xFF3B82F6)),
      ('Enquiries', Icons.quiz_rounded, const Color(0xFF10B981)),
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

class _VisitorList extends StatelessWidget {
  const _VisitorList();

  @override
  Widget build(BuildContext context) {
    const visitors = [
      _Visitor('Ramesh Sharma', 'Meeting: Grade 2-A Teacher', '10:30 AM', 'Waiting', Color(0xFFF59E0B)),
      _Visitor('Priya Mehta', 'Fee Payment', '10:15 AM', 'Served', Color(0xFF10B981)),
      _Visitor('Suresh Kumar', 'Admission Enquiry', '11:00 AM', 'Scheduled', Color(0xFF3B82F6)),
    ];
    return Column(
      children: visitors.map((v) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: _line, width: 1.5)),
        child: Row(children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(color: _rA.withOpacity(0.1), shape: BoxShape.circle),
            child: Center(child: Text(v.name[0], style: const TextStyle(fontFamily: 'Clash Display', fontSize: 16, fontWeight: FontWeight.w800, color: _rA))),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(v.name, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w800, color: _ink)),
            Text(v.purpose, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w500, color: _ink3), maxLines: 1, overflow: TextOverflow.ellipsis),
          ])),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(v.time, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w600, color: _ink3)),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: v.statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(100)),
              child: Text(v.status, style: TextStyle(fontFamily: 'Satoshi', fontSize: 9.5, fontWeight: FontWeight.w800, color: v.statusColor)),
            ),
          ]),
        ]),
      )).toList(),
    );
  }
}

class _Visitor {
  final String name, purpose, time, status;
  final Color statusColor;
  const _Visitor(this.name, this.purpose, this.time, this.status, this.statusColor);
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) => Text(text,
    style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 0.8, color: Color(0xFF94A3B8)));
}
