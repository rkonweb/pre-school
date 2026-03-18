import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:staff_app_flutter/core/theme/app_theme.dart';
import 'package:staff_app_flutter/core/state/auth_state.dart';

class StaffAttendanceReportView extends ConsumerStatefulWidget {
  const StaffAttendanceReportView({super.key});

  @override
  ConsumerState<StaffAttendanceReportView> createState() => _StaffAttendanceReportViewState();
}

class _StaffAttendanceReportViewState extends ConsumerState<StaffAttendanceReportView> {
  DateTime _currentMonth = DateTime.now();
  List<dynamic> _records = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchReport();
  }

  Future<void> _fetchReport() async {
    setState(() => _isLoading = true);
    final user = ref.read(userProfileProvider);
    if (user?.token == null) return;

    final url = Uri.parse('http://localhost:3000/api/mobile/v1/staff/attendance/self?month=${_currentMonth.month}&year=${_currentMonth.year}');
    try {
      final res = await http.get(url, headers: {'Authorization': 'Bearer ${user!.token}'});
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true) {
          setState(() {
            _records = data['attendance'];
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching report: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _changeMonth(int offset) {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month + offset, 1);
    });
    _fetchReport();
  }

  int get _presentCount => _records.where((r) => r['status'] == 'PRESENT').length;
  int get _absentCount => _records.where((r) => r['status'] == 'ABSENT').length;
  int get _lateCount => _records.where((r) => r['status'] == 'LATE').length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Attendance Report', style: TextStyle(fontFamily: 'Cabinet Grotesk', fontWeight: FontWeight.w900, color: Color(0xFF140E28))),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF140E28)),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(24),
              children: [
                _buildMonthSelector(),
                const SizedBox(height: 24),
                _buildStats(),
                const SizedBox(height: 32),
                const Text('Daily Logs', style: TextStyle(fontFamily: 'Cabinet Grotesk', fontWeight: FontWeight.w800, fontSize: 18, color: Color(0xFF140E28))),
                const SizedBox(height: 16),
                if (_records.isEmpty)
                  const Center(child: Padding(padding: EdgeInsets.all(24.0), child: Text('No attendance recorded for this month.', style: TextStyle(color: Color(0xFF7B7291))))),
                ..._records.map((r) => _buildRecordCard(r)).toList(),
              ],
            ),
    );
  }

  Widget _buildMonthSelector() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        IconButton(icon: const Icon(Icons.chevron_left), onPressed: () => _changeMonth(-1)),
        Text(DateFormat('MMMM yyyy').format(_currentMonth), style: const TextStyle(fontFamily: 'Satoshi', fontSize: 16, fontWeight: FontWeight.w800)),
        IconButton(icon: const Icon(Icons.chevron_right), onPressed: () => _changeMonth(1)),
      ],
    );
  }

  Widget _buildStats() {
    return Row(
      children: [
        Expanded(child: _statCard('Present', _presentCount.toString(), const Color(0xFF16A34A), const Color(0xFFF0FDF4))),
        const SizedBox(width: 12),
        Expanded(child: _statCard('Late', _lateCount.toString(), const Color(0xFFD97706), const Color(0xFFFFFBEB))),
        const SizedBox(width: 12),
        Expanded(child: _statCard('Absent', _absentCount.toString(), const Color(0xFFDC2626), const Color(0xFFFEF2F2))),
      ],
    );
  }

  Widget _statCard(String label, String value, Color color, Color bg) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(16)),
      child: Column(
        children: [
          Text(value, style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 24, fontWeight: FontWeight.w900, color: color)),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, fontWeight: FontWeight.w700, color: color.withOpacity(0.8))),
        ],
      ),
    );
  }

  Widget _buildRecordCard(dynamic record) {
    final date = DateTime.parse(record['date']).toLocal();
    final status = record['status'];
    final punches = record['punches'] as List;

    Color color = status == 'PRESENT' ? const Color(0xFF16A34A) : status == 'ABSENT' ? const Color(0xFFDC2626) : const Color(0xFFD97706);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color.fromRGBO(20, 14, 40, 0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(DateFormat('EEEE, MMM d').format(date), style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF140E28))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                child: Text(status, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w800)),
              )
            ],
          ),
          if (punches.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: punches.map((p) {
                final pt = DateTime.parse(p['timestamp']).toLocal();
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(6)),
                  child: Text('${p['type']}: ${DateFormat('HH:mm').format(pt)}', style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, color: Color(0xFF475569))),
                );
              }).toList(),
            )
          ]
        ],
      ),
    );
  }
}
