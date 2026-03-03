import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'dart:math' as math;
import 'attendance_dashboard_provider.dart';
import '../../core/widgets/student_avatar.dart';
import '../../core/widgets/global_header.dart';

class AttendanceDashboardScreen extends ConsumerWidget {
  const AttendanceDashboardScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(attendanceDashboardProvider);
    final brandYellow = const Color(0xFFFFC107);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: const GlobalHeader(title: 'Attendance'),
      body: SafeArea(
        child: Column(
          children: [
            // ── Scrollable Body ──────────────────────────────
            Expanded(
              child: state.isLoading
                  ? _buildSkeleton()
                  : state.error != null
                      ? _buildError(context, ref, state.error!)
                      : RefreshIndicator(
                          color: brandYellow,
                          onRefresh: () =>
                              ref.read(attendanceDashboardProvider.notifier).load(),
                          child: ListView(
                            padding: const EdgeInsets.only(
                                left: 20, right: 20, bottom: 120),
                            children: [
                              const SizedBox(height: 24),

                              // ── Today's Snapshot ──────────────
                              if (state.todayStats != null)
                                _TodayStatsSection(stats: state.todayStats!),

                              const SizedBox(height: 20),

                              // ── 7-Day Trend ───────────────────
                              if (state.weeklyTrend.isNotEmpty)
                                _WeeklyTrendCard(trend: state.weeklyTrend),

                              const SizedBox(height: 20),

                              // ── Absentee Alerts ───────────────
                              if (state.alerts.isNotEmpty)
                                _AbsenteeAlertsCard(alerts: state.alerts),

                              if (state.alerts.isNotEmpty)
                                const SizedBox(height: 20),

                              // ── Class Breakdown ───────────────
                              if (state.classBreakdown.isNotEmpty)
                                _ClassBreakdownCard(
                                    classes: state.classBreakdown),
                            ],
                          ),
                        ),
            ),
          ],
        ),
      ),

      // ── Mark Attendance FAB ───────────────────────────────
      floatingActionButton: _MarkAttendanceFAB(brandYellow: brandYellow),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildSkeleton() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _shimmer(height: 160, radius: 24),
        const SizedBox(height: 16),
        _shimmer(height: 140, radius: 24),
        const SizedBox(height: 16),
        _shimmer(height: 200, radius: 24),
      ],
    );
  }

  Widget _shimmer({required double height, double radius = 16}) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }

  Widget _buildError(BuildContext context, WidgetRef ref, String error) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.wifi_off_rounded, size: 48, color: Colors.grey[300]),
          const SizedBox(height: 12),
          Text(
            'Could not load dashboard',
            style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Colors.grey[600]),
          ),
          const SizedBox(height: 4),
          Text(error,
              style: TextStyle(fontSize: 12, color: Colors.grey[400]),
              textAlign: TextAlign.center),
          const SizedBox(height: 20),
          TextButton(
            onPressed: () =>
                ref.read(attendanceDashboardProvider.notifier).load(),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

// ── Today Stats Section ───────────────────────────────────────────

class _TodayStatsSection extends StatelessWidget {
  final AttendanceTodayStats stats;
  const _TodayStatsSection({required this.stats});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionLabel('Today\'s Snapshot'),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _StatTile(
                label: 'Present',
                value: stats.present,
                total: stats.total,
                color: const Color(0xFF22C55E),
                bgColor: const Color(0xFFDCFCE7),
                icon: Icons.check_circle_rounded,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _StatTile(
                label: 'Absent',
                value: stats.absent,
                total: stats.total,
                color: const Color(0xFFEF4444),
                bgColor: const Color(0xFFFEE2E2),
                icon: Icons.cancel_rounded,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _StatTile(
                label: 'Late',
                value: stats.late,
                total: stats.total,
                color: const Color(0xFFF59E0B),
                bgColor: const Color(0xFFFEF3C7),
                icon: Icons.schedule_rounded,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _StatTile(
                label: 'Unmarked',
                value: stats.unmarked,
                total: stats.total,
                color: const Color(0xFF8B5CF6),
                bgColor: const Color(0xFFEDE9FE),
                icon: Icons.help_outline_rounded,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _StatTile extends StatefulWidget {
  final String label;
  final int value, total;
  final Color color, bgColor;
  final IconData icon;
  const _StatTile({
    required this.label,
    required this.value,
    required this.total,
    required this.color,
    required this.bgColor,
    required this.icon,
  });
  @override
  State<_StatTile> createState() => _StatTileState();
}

class _StatTileState extends State<_StatTile>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _controller =
        AnimationController(vsync: this, duration: const Duration(milliseconds: 900));
    _anim = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pct = widget.total > 0 ? widget.value / widget.total : 0.0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: widget.color.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: widget.bgColor,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(widget.icon, color: widget.color, size: 18),
              ),
              const Spacer(),
              Text(
                '${(pct * 100).round()}%',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: widget.color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '${widget.value}',
            style: const TextStyle(
              fontSize: 30,
              fontWeight: FontWeight.w900,
              height: 1,
            ),
          ),
          Text(
            widget.label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Colors.grey[500],
              letterSpacing: 0.3,
            ),
          ),
          const SizedBox(height: 10),
          // Animated progress bar
          Container(
            height: 5,
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(4),
            ),
            child: AnimatedBuilder(
              animation: _anim,
              builder: (_, __) => FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: pct * _anim.value,
                child: Container(
                  decoration: BoxDecoration(
                    color: widget.color,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── 7-Day Trend Chart ─────────────────────────────────────────────

class _WeeklyTrendCard extends StatelessWidget {
  final List<WeeklyTrendPoint> trend;
  const _WeeklyTrendCard({required this.trend});

  @override
  Widget build(BuildContext context) {
    final maxRate = trend.isEmpty ? 100 : trend.map((t) => t.rate).reduce(math.max);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 16,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionLabel('7-Day Attendance Trend'),
          const SizedBox(height: 20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: trend.map((t) {
              final isToday = t.dayLabel ==
                  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][
                      DateTime.now().weekday - 1];
              final barH = maxRate > 0
                  ? 60.0 * (t.rate / maxRate)
                  : 0.0;

              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        '${t.rate}%',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: isToday
                              ? const Color(0xFFFFC107)
                              : Colors.grey[400],
                        ),
                      ),
                      const SizedBox(height: 4),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 800),
                        curve: Curves.easeOutCubic,
                        height: barH.clamp(4, 60),
                        decoration: BoxDecoration(
                          gradient: isToday
                              ? const LinearGradient(
                                  colors: [Color(0xFFFFC107), Color(0xFFFF9800)],
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                )
                              : LinearGradient(
                                  colors: [
                                    Colors.blue[200]!,
                                    Colors.blue[100]!
                                  ],
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                ),
                          borderRadius: BorderRadius.circular(6),
                          boxShadow: isToday
                              ? [
                                  BoxShadow(
                                    color: const Color(0xFFFFC107)
                                        .withOpacity(0.5),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ]
                              : [],
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        t.dayLabel,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color:
                              isToday ? Colors.grey[800] : Colors.grey[400],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

// ── Absentee Alerts ───────────────────────────────────────────────

class _AbsenteeAlertsCard extends StatelessWidget {
  final List<AbsenteeAlert> alerts;
  const _AbsenteeAlertsCard({required this.alerts});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF7ED), Color(0xFFFFEDD5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFFED7AA), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFFEA580C).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.warning_amber_rounded,
                    color: Color(0xFFEA580C), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Frequent Absentees',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                        color: Colors.grey[900],
                      ),
                    ),
                    Text(
                      '${alerts.length} student${alerts.length != 1 ? 's' : ''} with >20% absence in 30 days',
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFFEA580C),
                        letterSpacing: 0.2,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...alerts.take(6).map((a) => _AlertRow(alert: a)),
        ],
      ),
    );
  }
}

class _AlertRow extends StatelessWidget {
  final AbsenteeAlert alert;
  const _AlertRow({required this.alert});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          StudentAvatar(
            name: alert.name,
            avatarUrl: alert.avatar,
            radius: 18,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  alert.name,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: Colors.grey[900],
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  alert.className,
                  style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _absentColor(alert.absentRate).withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '${alert.absentRate}% away',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: _absentColor(alert.absentRate),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _absentColor(int rate) {
    if (rate >= 40) return const Color(0xFFDC2626);
    if (rate >= 30) return const Color(0xFFEA580C);
    return const Color(0xFFD97706);
  }
}

// ── Class Breakdown ───────────────────────────────────────────────

class _ClassBreakdownCard extends StatelessWidget {
  final List<ClassBreakdown> classes;
  const _ClassBreakdownCard({required this.classes});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 16,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionLabel('Class Breakdown'),
          const SizedBox(height: 16),
          ...classes.map((c) => _ClassRow(cls: c)),
        ],
      ),
    );
  }
}

class _ClassRow extends StatefulWidget {
  final ClassBreakdown cls;
  const _ClassRow({required this.cls});
  @override
  State<_ClassRow> createState() => _ClassRowState();
}

class _ClassRowState extends State<_ClassRow>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 800));
    _anim = CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic);
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final rate = widget.cls.total > 0
        ? widget.cls.present / widget.cls.total
        : 0.0;
    final rateColor = rate >= 0.8
        ? const Color(0xFF22C55E)
        : rate >= 0.6
            ? const Color(0xFFF59E0B)
            : const Color(0xFFEF4444);

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  widget.cls.name,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Colors.grey[800],
                  ),
                ),
              ),
              Text(
                '${widget.cls.present}/${widget.cls.total}',
                style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Colors.grey[500]),
              ),
              const SizedBox(width: 8),
              Text(
                '${widget.cls.rate}%',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: rateColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Container(
            height: 6,
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(4),
            ),
            child: AnimatedBuilder(
              animation: _anim,
              builder: (_, __) => FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: (rate * _anim.value).clamp(0.0, 1.0),
                child: Container(
                  decoration: BoxDecoration(
                    color: rateColor,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              _miniPill('A:${widget.cls.absent}', const Color(0xFFEF4444)),
              const SizedBox(width: 8),
              _miniPill('L:${widget.cls.late}', const Color(0xFFF59E0B)),
              if (widget.cls.unmarked > 0) ...[
                const SizedBox(width: 8),
                _miniPill('?:${widget.cls.unmarked}', const Color(0xFF8B5CF6)),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _miniPill(String label, Color color) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(label,
            style: TextStyle(
                fontSize: 9, fontWeight: FontWeight.w800, color: color)),
      );
}

// ── Attendance Rate Ring ──────────────────────────────────────────

class _MiniRing extends StatelessWidget {
  final int rate;
  final double size;
  const _MiniRing({required this.rate, required this.size});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: Size(size, size),
            painter: _RingPainter(rate / 100),
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                '$rate',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                  height: 1,
                ),
              ),
              Text(
                '%',
                style: TextStyle(
                  fontSize: 8,
                  fontWeight: FontWeight.w700,
                  color: Colors.grey[400],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  final double progress;
  _RingPainter(this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - 8) / 2;
    final strokeWidth = 5.0;

    // Background ring
    canvas.drawCircle(
      center,
      radius,
      Paint()
        ..color = Colors.grey[100]!
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth,
    );

    // Progress arc
    final color = progress >= 0.8
        ? const Color(0xFF22C55E)
        : progress >= 0.6
            ? const Color(0xFFF59E0B)
            : const Color(0xFFEF4444);

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      2 * math.pi * progress,
      false,
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(_RingPainter oldDelegate) =>
      oldDelegate.progress != progress;
}

// ── Mark Attendance FAB ───────────────────────────────────────────

class _MarkAttendanceFAB extends StatelessWidget {
  final Color brandYellow;
  const _MarkAttendanceFAB({required this.brandYellow});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/attendance/mark'),
      child: Container(
        height: 56,
        margin: const EdgeInsets.symmetric(horizontal: 40),
        decoration: BoxDecoration(
          color: brandYellow,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: brandYellow.withOpacity(0.5),
              blurRadius: 20,
              spreadRadius: 2,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.edit_note_rounded, color: Colors.black, size: 22),
            SizedBox(width: 10),
            Text(
              'Mark Attendance',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w900,
                color: Colors.black,
                letterSpacing: 0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Helpers ───────────────────────────────────────────────────────

Widget _sectionLabel(String label) => Text(
      label.toUpperCase(),
      style: TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w800,
        color: Colors.grey[400],
        letterSpacing: 1,
      ),
    );
