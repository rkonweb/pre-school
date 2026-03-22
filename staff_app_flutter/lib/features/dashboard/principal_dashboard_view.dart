import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/state/auth_state.dart';
import '../../shared/components/all_modules_overlay.dart';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const _ink  = Color(0xFF140E28);
const _ink3 = Color(0xFF7B7291);
const _line = Color(0x12140E28);
const _bg2  = Color(0xFFF5F3FF);
const _pA   = Color(0xFF6366F1); // principal accent — indigo
const _pB   = Color(0xFF8B5CF6);
const _pC   = Color(0xFFA78BFA);

const _pGrad = LinearGradient(
  colors: [_pA, _pB, _pC],
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
);

class PrincipalDashboardView extends ConsumerWidget {
  const PrincipalDashboardView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProfileProvider);
    final firstName = (user?.name ?? 'Principal').split(' ').first;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Hero ────────────────────────────────────────────────────────────
        _PrincipalHero(name: firstName),
        const SizedBox(height: 20),

        // ── KPI Row ─────────────────────────────────────────────────────────
        const _SectionLabel('📊  SCHOOL OVERVIEW'),
        const SizedBox(height: 12),
        const _KpiRow(),
        const SizedBox(height: 24),

        // ── Quick Actions ────────────────────────────────────────────────────
        const _SectionLabel('⚡  QUICK ACTIONS'),
        const SizedBox(height: 12),
        _QuickActions(context: context),
        const SizedBox(height: 24),

        // ── Recent Alerts ────────────────────────────────────────────────────
        const _SectionLabel('🔔  SCHOOL HAPPENINGS'),
        const SizedBox(height: 12),
        const _AlertFeed(),
      ],
    );
  }
}

// ── Hero ──────────────────────────────────────────────────────────────────────
class _PrincipalHero extends StatelessWidget {
  final String name;
  const _PrincipalHero({required this.name});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: _pGrad,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: _pA.withOpacity(0.35), blurRadius: 24, offset: const Offset(0, 8))],
      ),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.18), borderRadius: BorderRadius.circular(100)),
            child: const Text('Principal · School Overview',
              style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
          ),
          const SizedBox(height: 10),
          Text('Welcome, $name 🎓',
            style: const TextStyle(fontFamily: 'Clash Display', fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.5)),
          const SizedBox(height: 6),
          Text('Academic Year 2025–26 · Term 2',
            style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w500, color: Colors.white.withOpacity(0.75))),
        ])),
        Container(
          width: 56, height: 56,
          decoration: BoxDecoration(color: Colors.white.withOpacity(0.18), shape: BoxShape.circle),
          child: const Icon(Icons.school_rounded, color: Colors.white, size: 28),
        ),
      ]),
    );
  }
}

// ── KPI Row ───────────────────────────────────────────────────────────────────
class _KpiRow extends StatelessWidget {
  const _KpiRow();

  @override
  Widget build(BuildContext context) {
    const kpis = [
      ('1,240', 'Students', Icons.people_alt_rounded, Color(0xFF3B82F6)),
      ('87%', 'Attendance', Icons.how_to_reg_rounded, Color(0xFF10B981)),
      ('58', 'Staff', Icons.badge_rounded, Color(0xFF8B5CF6)),
      ('₹14.2L', 'Fees', Icons.payments_rounded, Color(0xFFF59E0B)),
    ];
    return Row(
      children: [
        for (int i = 0; i < kpis.length; i++) ...[
          if (i > 0) const SizedBox(width: 8),
          Expanded(child: _KpiCard(value: kpis[i].$1, label: kpis[i].$2, icon: kpis[i].$3, color: kpis[i].$4)),
        ],
      ],
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String value, label;
  final IconData icon;
  final Color color;
  const _KpiCard({required this.value, required this.label, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _line, width: 1.5),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(children: [
        Container(
          width: 34, height: 34,
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, size: 17, color: color),
        ),
        const SizedBox(height: 6),
        Text(value, style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 15, fontWeight: FontWeight.w900, color: color)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 9, fontWeight: FontWeight.w700, color: _ink3, letterSpacing: 0.3)),
      ]),
    );
  }
}

// ── Quick Actions ─────────────────────────────────────────────────────────────
class _QuickActions extends StatelessWidget {
  final BuildContext context;
  const _QuickActions({required this.context});

  @override
  Widget build(BuildContext context) {
    final actions = [
      (_Action('All Modules', Icons.apps_rounded, _pA, () => showAllModulesMenu(context))),
      (_Action('Circulars', Icons.campaign_rounded, const Color(0xFFF43F5E), () {})),
      (_Action('Staff', Icons.badge_rounded, const Color(0xFF8B5CF6), () {})),
      (_Action('Reports', Icons.assessment_rounded, const Color(0xFF10B981), () {})),
      (_Action('Admissions', Icons.person_add_rounded, const Color(0xFF3B82F6), () {})),
      (_Action('Settings', Icons.settings_rounded, const Color(0xFF64748B), () {})),
    ];
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 3, crossAxisSpacing: 10, mainAxisSpacing: 10, childAspectRatio: 0.95,
      children: actions.map((a) => _QACard(action: a)).toList(),
    );
  }
}

class _Action {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  const _Action(this.label, this.icon, this.color, this.onTap);
}

class _QACard extends StatelessWidget {
  final _Action action;
  const _QACard({required this.action});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () { HapticFeedback.selectionClick(); action.onTap(); },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: _line, width: 1.5),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 3))],
        ),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(color: action.color.withOpacity(0.1), borderRadius: BorderRadius.circular(13)),
            child: Icon(action.icon, size: 22, color: action.color),
          ),
          const SizedBox(height: 8),
          Text(action.label, textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w800, color: _ink)),
        ]),
      ),
    );
  }
}

// ── Alert Feed ────────────────────────────────────────────────────────────────
class _AlertFeed extends StatelessWidget {
  const _AlertFeed();

  @override
  Widget build(BuildContext context) {
    const alerts = [
      _AlertData('High Staff Absenteeism', '8 staff on leave today. Review substitution.', Icons.warning_amber_rounded, Color(0xFFF59E0B)),
      _AlertData('New Admission Enquiry', 'Rahul S. (Grade 2) submitted an inquiry.', Icons.person_add_rounded, Color(0xFF3B82F6)),
      _AlertData('Fee Collection Milestone', 'Daily target reached — ₹54,200 collected.', Icons.stars_rounded, Color(0xFF10B981)),
    ];
    return Column(
      children: alerts.map((a) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: _AlertCard(data: a),
      )).toList(),
    );
  }
}

class _AlertData {
  final String title, subtitle;
  final IconData icon;
  final Color color;
  const _AlertData(this.title, this.subtitle, this.icon, this.color);
}

class _AlertCard extends StatelessWidget {
  final _AlertData data;
  const _AlertCard({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _line, width: 1.5),
      ),
      child: Row(children: [
        Container(
          width: 40, height: 40,
          decoration: BoxDecoration(color: data.color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
          child: Icon(data.icon, size: 20, color: data.color),
        ),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(data.title, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w800, color: _ink)),
          const SizedBox(height: 2),
          Text(data.subtitle, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w500, color: _ink3), maxLines: 1, overflow: TextOverflow.ellipsis),
        ])),
        const Icon(Icons.chevron_right_rounded, size: 18, color: _ink3),
      ]),
    );
  }
}

// ── Shared ────────────────────────────────────────────────────────────────────
class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) => Text(text,
    style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 0.8, color: Color(0xFF94A3B8)));
}


