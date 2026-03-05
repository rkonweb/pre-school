import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';

// ─── Models ──────────────────────────────────────────────────────────────────
class PTMSession {
  final String id;
  final String title;
  final String date;
  final String startTime;
  final String endTime;
  final int slotMinutes;
  final List<Map<String, dynamic>> myBookings;

  PTMSession({required this.id, required this.title, required this.date, required this.startTime, required this.endTime, required this.slotMinutes, required this.myBookings});

  factory PTMSession.fromJson(Map<String, dynamic> json) => PTMSession(
    id: json['id'] ?? '',
    title: json['title'] ?? '',
    date: json['date'] ?? '',
    startTime: json['startTime'] ?? '09:00',
    endTime: json['endTime'] ?? '16:00',
    slotMinutes: json['slotMinutes'] ?? 10,
    myBookings: List<Map<String, dynamic>>.from(json['bookings'] ?? []),
  );

  List<String> get availableSlots {
    final slots = <String>[];
    final startParts = startTime.split(':');
    final endParts = endTime.split(':');
    int current = int.parse(startParts[0]) * 60 + int.parse(startParts[1]);
    final end = int.parse(endParts[0]) * 60 + int.parse(endParts[1]);
    while (current + slotMinutes <= end) {
      final h = (current ~/ 60).toString().padLeft(2, '0');
      final m = (current % 60).toString().padLeft(2, '0');
      slots.add('$h:$m');
      current += slotMinutes;
    }
    return slots;
  }

  Set<String> get bookedSlots => myBookings.map((b) => b['slotTime'] as String).toSet();
}

// ─── Providers ───────────────────────────────────────────────────────────────
final ptmSessionsProvider = FutureProvider<List<PTMSession>>((ref) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get('parent/ptm');
  if (response.data['success'] == true) {
    return (response.data['data'] as List? ?? []).map((e) => PTMSession.fromJson(e)).toList();
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load PTM sessions');
  }
});

final myPTMBookingsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get('parent/ptm', queryParameters: {'view': 'my-bookings'});
  if (response.data['success'] == true) {
    return List<Map<String, dynamic>>.from(response.data['data'] ?? []);
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load bookings');
  }
});

// ─── Screen ──────────────────────────────────────────────────────────────────
class PTMScreen extends ConsumerStatefulWidget {
  const PTMScreen({super.key});

  @override
  ConsumerState<PTMScreen> createState() => _PTMScreenState();
}

class _PTMScreenState extends ConsumerState<PTMScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String? _bookingSessionId;
  bool _isBooking = false;

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

  Future<void> _bookSlot(String sessionId, String studentId, String slotTime) async {
    setState(() => _isBooking = true);
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.post('parent/ptm', data: {
        'sessionId': sessionId,
        'studentId': studentId,
        'slotTime': slotTime,
      });
      if (response.data['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('✅ Slot $slotTime booked!'), backgroundColor: Colors.green),
          );
          setState(() => _bookingSessionId = null);
          ref.refresh(ptmSessionsProvider);
          ref.refresh(myPTMBookingsProvider);
        }
      } else {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response.data['error'] ?? 'Booking failed'), backgroundColor: Colors.red),
        );
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isBooking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final brand = ref.watch(schoolBrandProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppHeader(
        title: 'Parent-Teacher Meeting',
        subtitle: 'Schedule meetings with teachers',
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: TabBar(
            controller: _tabController,
            indicatorColor: const Color(0xFF2350DD),
            labelColor: const Color(0xFF2350DD),
            unselectedLabelColor: const Color(0xFF64748B),
            labelStyle: const TextStyle(fontWeight: FontWeight.bold),
            tabs: const [Tab(text: 'Upcoming Sessions'), Tab(text: 'My Bookings')],
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // ─── Sessions Tab ─────────────────────────────────────────────
          ref.watch(ptmSessionsProvider).when(
            data: (sessions) {
              if (sessions.isEmpty) {
                return const Center(
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.people_outline, size: 64, color: Color(0xFFDDDDDD)),
                    SizedBox(height: 16),
                    Text('No upcoming PTM sessions', style: TextStyle(color: Colors.grey)),
                  ]),
                );
              }
              return RefreshIndicator(
                onRefresh: () => ref.refresh(ptmSessionsProvider.future),
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: sessions.length,
                  itemBuilder: (ctx, i) => _buildSessionCard(sessions[i], brand),
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF7B1FA2))),
            error: (err, _) => Center(child: Text(err.toString())),
          ),

          // ─── My Bookings Tab ──────────────────────────────────────────
          ref.watch(myPTMBookingsProvider).when(
            data: (bookings) {
              if (bookings.isEmpty) {
                return const Center(
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.calendar_today_outlined, size: 64, color: Color(0xFFDDDDDD)),
                    SizedBox(height: 16),
                    Text('No bookings yet', style: TextStyle(color: Colors.grey)),
                  ]),
                );
              }
              return RefreshIndicator(
                onRefresh: () => ref.refresh(myPTMBookingsProvider.future),
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: bookings.length,
                  itemBuilder: (ctx, i) => _buildBookingCard(bookings[i]),
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(child: Text(err.toString())),
          ),
        ],
      ),
    );
  }

  Widget _buildSessionCard(PTMSession session, SchoolBrandState brand) {
    final dt = DateTime.tryParse(session.date);
    final isExpanded = _bookingSessionId == session.id;
    final alreadyBooked = session.myBookings.any((b) => b['status'] == 'CONFIRMED');

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: const Color(0xFF7B1FA2).withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.people, color: Color(0xFF7B1FA2), size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(session.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  if (dt != null) Text(
                    '${dt.day}/${dt.month}/${dt.year} · ${session.startTime} – ${session.endTime}',
                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ])),
              ]),
              if (alreadyBooked) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(12)),
                  child: Row(children: [
                    const Icon(Icons.check_circle, color: Colors.green, size: 16),
                    const SizedBox(width: 8),
                    Text('Slot: ${session.myBookings.first['slotTime']} — Confirmed', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 13)),
                  ]),
                ),
              ] else ...[
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => setState(() => _bookingSessionId = isExpanded ? null : session.id),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF7B1FA2), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    child: Text(isExpanded ? 'Close' : 'Book a Slot'),
                  ),
                ),
              ],
            ]),
          ),

          if (isExpanded && !alreadyBooked)
            Container(
              decoration: const BoxDecoration(color: Color(0xFFF3E5F5), borderRadius: BorderRadius.vertical(bottom: Radius.circular(20))),
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Select a time slot:', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF7B1FA2))),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: session.availableSlots.map((slot) {
                    final isBooked = session.bookedSlots.contains(slot);
                    return GestureDetector(
                      onTap: isBooked || _isBooking ? null : () {
                        // TODO: Get studentId from dashboard provider
                        _bookSlot(session.id, 'REPLACE_WITH_STUDENT_ID', slot);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: isBooked ? Colors.grey.shade200 : Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: isBooked ? Colors.grey.shade300 : const Color(0xFF7B1FA2), width: 1.5),
                        ),
                        child: Text(slot, style: TextStyle(fontWeight: FontWeight.bold, color: isBooked ? Colors.grey : const Color(0xFF7B1FA2), fontSize: 13)),
                      ),
                    );
                  }).toList(),
                ),
              ]),
            ),
        ],
      ),
    );
  }

  Widget _buildBookingCard(Map<String, dynamic> booking) {
    final session = booking['session'] as Map<String, dynamic>?;
    final dt = session != null ? DateTime.tryParse(session['date'] ?? '') : null;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          width: 48, height: 48,
          decoration: BoxDecoration(color: const Color(0xFF7B1FA2).withOpacity(0.1), borderRadius: BorderRadius.circular(14)),
          child: const Center(child: Text('👨‍👩‍👧', style: TextStyle(fontSize: 22))),
        ),
        title: Text(session?['title'] ?? 'PTM Session', style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (dt != null) Text('${dt.day}/${dt.month}/${dt.year}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
          Text('Slot: ${booking['slotTime']}', style: const TextStyle(color: Color(0xFF7B1FA2), fontWeight: FontWeight.bold)),
        ]),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(color: booking['status'] == 'CONFIRMED' ? Colors.green.shade50 : Colors.grey.shade100, borderRadius: BorderRadius.circular(8)),
          child: Text(booking['status'] ?? '', style: TextStyle(color: booking['status'] == 'CONFIRMED' ? Colors.green : Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}
