import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/state/auth_state.dart';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const _ink  = Color(0xFF140E28);
const _ink3 = Color(0xFF7B7291);
const _line = Color(0x12140E28);
const _dA   = Color(0xFF7C3AED);
const _dB   = Color(0xFF6D28D9);

class DriverDashboardView extends ConsumerWidget {
  const DriverDashboardView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProfileProvider);
    final firstName = (user?.name ?? 'Driver').split(' ').first;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _DriverHero(name: firstName),
        const SizedBox(height: 20),

        // ── Quick Actions ──────────────────────────────────────────────────────
        const _SectionLabel('⚡  QUICK ACTIONS'),
        const SizedBox(height: 12),
        _QuickActions(),
        const SizedBox(height: 24),

        // ── Route Info ────────────────────────────────────────────────────────
        const _SectionLabel('🚌  TODAY\'S ROUTE'),
        const SizedBox(height: 12),
        const _RouteCard(),
        const SizedBox(height: 24),

        // ── Student Boarding List ─────────────────────────────────────────────
        const _SectionLabel('🧒  STUDENT BOARDING'),
        const SizedBox(height: 12),
        const _BoardingList(),
      ],
    );
  }
}

// ── Hero ──────────────────────────────────────────────────────────────────────
class _DriverHero extends StatelessWidget {
  final String name;
  const _DriverHero({required this.name});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [_dA, _dB], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: _dA.withOpacity(0.38), blurRadius: 24, offset: const Offset(0, 8))],
      ),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.18), borderRadius: BorderRadius.circular(100)),
            child: const Text('Driver · Route 42 · Morning', style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
          ),
          const SizedBox(height: 10),
          Text('Hello, $name 🚌', style: const TextStyle(fontFamily: 'Clash Display', fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.5)),
          const SizedBox(height: 6),
          Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: const Color(0xFF22C55E).withOpacity(0.22), borderRadius: BorderRadius.circular(100)),
              child: const Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.circle, size: 7, color: Color(0xFF22C55E)),
                SizedBox(width: 4),
                Text('On Time', style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF22C55E))),
              ]),
            ),
            const SizedBox(width: 8),
            Text('Next stop in 3 min', style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w500, color: Colors.white.withOpacity(0.75))),
          ]),
        ])),
        Container(
          width: 56, height: 56,
          decoration: BoxDecoration(color: Colors.white.withOpacity(0.18), shape: BoxShape.circle),
          child: const Icon(Icons.directions_bus_filled_rounded, color: Colors.white, size: 28),
        ),
      ]),
    );
  }
}

// ── Quick Actions ─────────────────────────────────────────────────────────────
class _QuickActions extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final actions = [
      ('Start Route', Icons.play_arrow_rounded, const Color(0xFF10B981)),
      ('Mark Boarding', Icons.how_to_reg_rounded, const Color(0xFF3B82F6)),
      ('SOS Alert', Icons.warning_rounded, const Color(0xFFEF4444)),
      ('Apply Leave', Icons.check_circle_outline_rounded, const Color(0xFFF59E0B)),
    ];
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 4, crossAxisSpacing: 10, mainAxisSpacing: 10, childAspectRatio: 0.88,
      children: actions.map((a) => GestureDetector(
        onTap: () => HapticFeedback.selectionClick(),
        child: Container(
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: _line, width: 1.5),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))]),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Container(width: 40, height: 40,
              decoration: BoxDecoration(color: a.$3.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(a.$2, size: 20, color: a.$3)),
            const SizedBox(height: 6),
            Text(a.$1, textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9.5, fontWeight: FontWeight.w800, color: _ink)),
          ]),
        ),
      )).toList(),
    );
  }
}

// ── Route Card ────────────────────────────────────────────────────────────────
class _RouteCard extends StatelessWidget {
  const _RouteCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: _line, width: 1.5),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 3))],
      ),
      child: Column(children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Route 42 — Morning Pickup', style: TextStyle(fontFamily: 'Satoshi', fontSize: 14, fontWeight: FontWeight.w800, color: _ink)),
            SizedBox(height: 4),
            Text('6 stops remaining · 12 km', style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w500, color: _ink3)),
          ]),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(gradient: const LinearGradient(colors: [_dA, _dB]), borderRadius: BorderRadius.circular(10)),
            child: const Text('VIEW MAP', style: TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white)),
          ),
        ]),
        const SizedBox(height: 14),
        const Divider(height: 1, color: _line),
        const SizedBox(height: 12),
        // Progress bar
        const Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Progress', style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w600, color: _ink3)),
          Text('3 / 9 stops', style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w700, color: _ink)),
        ]),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(100),
          child: LinearProgressIndicator(
            value: 3 / 9,
            minHeight: 7,
            backgroundColor: const Color(0xFFF1F0F7),
            valueColor: const AlwaysStoppedAnimation<Color>(_dA),
          ),
        ),
      ]),
    );
  }
}

// ── Boarding List ─────────────────────────────────────────────────────────────
class _BoardingList extends StatefulWidget {
  const _BoardingList();

  @override
  State<_BoardingList> createState() => _BoardingListState();
}

class _BoardingListState extends State<_BoardingList> {
  final List<bool> _boarded = [true, true, false, false, false];

  static const _students = [
    ('Arjun Sharma', 'Stop 1 · Picked up'),
    ('Priya Patel', 'Stop 2 · Picked up'),
    ('Rohan Mehta', 'Stop 4 · Elm Street'),
    ('Ananya Singh', 'Stop 5 · MG Road'),
    ('Karan Gupta', 'Stop 6 · Lake View'),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(_students.length, (i) {
        final s = _students[i];
        return GestureDetector(
          onTap: () { HapticFeedback.selectionClick(); setState(() => _boarded[i] = !_boarded[i]); },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: _boarded[i] ? const Color(0xFFF0FDF4) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: _boarded[i] ? const Color(0xFF22C55E).withOpacity(0.4) : _line, width: 1.5),
            ),
            child: Row(children: [
              Container(
                width: 38, height: 38,
                decoration: BoxDecoration(
                  color: _boarded[i] ? const Color(0xFF22C55E).withOpacity(0.15) : _dA.withOpacity(0.08),
                  shape: BoxShape.circle,
                ),
                child: Center(child: Text(s.$1[0],
                  style: TextStyle(fontFamily: 'Clash Display', fontSize: 15, fontWeight: FontWeight.w800,
                    color: _boarded[i] ? const Color(0xFF22C55E) : _dA))),
              ),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(s.$1, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w800, color: _ink)),
                Text(s.$2, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w500, color: _ink3)),
              ])),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: Icon(
                  key: ValueKey(_boarded[i]),
                  _boarded[i] ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                  color: _boarded[i] ? const Color(0xFF22C55E) : _ink3,
                  size: 22,
                ),
              ),
            ]),
          ),
        );
      }),
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
