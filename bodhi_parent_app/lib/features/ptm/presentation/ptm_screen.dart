import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../../dashboard/data/dashboard_provider.dart';
import '../data/ptm_provider.dart';

// ─── Screen ──────────────────────────────────────────────────────────────────
class PTMScreen extends ConsumerStatefulWidget {
  const PTMScreen({super.key});

  @override
  ConsumerState<PTMScreen> createState() => _PTMScreenState();
}

class _PTMScreenState extends ConsumerState<PTMScreen> with SingleTickerProviderStateMixin {
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
    final dashboardAsync = ref.watch(dashboardDataProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppHeader(
        title: 'Parent-Teacher Meeting',
        subtitle: 'Schedule meetings with teachers',
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: TabBar(
            controller: _tabController,
            indicatorColor: const Color(0xFF3B6EF8),
            labelColor: const Color(0xFF3B6EF8),
            unselectedLabelColor: const Color(0xFF64748B),
            labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            tabs: const [Tab(text: 'Available Slots'), Tab(text: 'My Bookings')],
          ),
        ),
      ),
      body: Consumer(
        builder: (context, ref, child) {
          final activeStudent = ref.watch(activeStudentProvider);

          if (activeStudent == null) {
            return const Center(child: Text('No students found.'));
          }

          final studentId = activeStudent['id']?.toString();
          if (studentId == null) {
            return const Center(child: Text('Student ID not found.'));
          }

          return TabBarView(
            controller: _tabController,
            children: [
              _buildAvailableSlotsTab(studentId),
              _buildMyBookingsTab(studentId),
            ],
          );
        },
      ),
    );
  }

  Widget _buildAvailableSlotsTab(String studentId) {
    return ref.watch(ptmSlotsProvider(studentId)).when(
      data: (slots) {
        if (slots.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.calendar_today_outlined, size: 64, color: Colors.grey.shade300),
                const SizedBox(height: 16),
                Text('No available slots', style: TextStyle(color: Colors.grey.shade600, fontSize: 16)),
              ],
            ),
          );
        }

        // Group slots by date
        final slotsByDate = <String, List<PtmSlot>>{};
        for (var slot in slots) {
          if (!slotsByDate.containsKey(slot.date)) {
            slotsByDate[slot.date] = [];
          }
          slotsByDate[slot.date]!.add(slot);
        }

        return RefreshIndicator(
          onRefresh: () => ref.refresh(ptmSlotsProvider(studentId).future),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
            children: slotsByDate.entries.map((entry) {
              final date = entry.key;
              final dateSlots = entry.value;
              final dt = DateTime.tryParse(date);
              final dateStr = dt != null ? DateFormat('EEEE, MMM d, yyyy').format(dt) : date;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),
                  Text(
                    dateStr,
                    style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                  ).animate().fadeIn(delay: 50.ms).slideY(begin: 0.1),
                  const SizedBox(height: 12),
                  ...dateSlots.asMap().entries.map((e) {
                    final idx = e.key;
                    final slot = e.value;
                    return _buildSlotCard(slot, studentId, idx).animate().fadeIn(delay: (100 + idx * 50).ms).slideY(begin: 0.1);
                  }).toList(),
                ],
              );
            }).toList(),
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text(err.toString(), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }

  Widget _buildSlotCard(PtmSlot slot, String studentId, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFF3B6EF8).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.person_outline, color: Color(0xFF3B6EF8), size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      slot.teacherName,
                      style: GoogleFonts.sora(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                    ),
                    Text(
                      slot.subject,
                      style: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(Icons.access_time_outlined, size: 16, color: const Color(0xFF94A3B8)),
              const SizedBox(width: 6),
              Text(
                '${slot.startTime} - ${slot.endTime}',
                style: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF64748B)),
              ),
              const Spacer(),
              if (slot.isBooked)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Booked',
                    style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey.shade600),
                  ),
                )
              else
                ElevatedButton(
                  onPressed: () => _bookSlot(slot.id, studentId),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF3B6EF8),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    elevation: 0,
                  ),
                  child: Text(
                    'Book',
                    style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMyBookingsTab(String studentId) {
    return ref.watch(ptmBookingsProvider(studentId)).when(
      data: (bookings) {
        if (bookings.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.event_busy_outlined, size: 64, color: Colors.grey.shade300),
                const SizedBox(height: 16),
                Text('No bookings yet', style: TextStyle(color: Colors.grey.shade600, fontSize: 16)),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => ref.refresh(ptmBookingsProvider(studentId).future),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
            children: bookings.asMap().entries.map((e) {
              final idx = e.key;
              final booking = e.value;
              return _buildBookingCard(booking, idx).animate().fadeIn(delay: (100 + idx * 50).ms).slideY(begin: 0.1);
            }).toList(),
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text(err.toString(), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingCard(PtmBooking booking, int index) {
    final statusColor = booking.status == 'CONFIRMED'
        ? const Color(0xFF00C9A7)
        : booking.status == 'PENDING'
            ? const Color(0xFFF5A623)
            : const Color(0xFFFF6B3D);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8)],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              booking.status == 'CONFIRMED' ? Icons.check_circle : Icons.pending_outlined,
              color: statusColor,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  booking.teacherName,
                  style: GoogleFonts.sora(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                ),
                Text(
                  booking.subject,
                  style: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF64748B)),
                ),
                const SizedBox(height: 4),
                Text(
                  '${booking.date} at ${booking.startTime}',
                  style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF94A3B8)),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              booking.status,
              style: GoogleFonts.dmSans(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: statusColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _bookSlot(String slotId, String studentId) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.post('parent/ptm/book', data: {
        'slotId': slotId,
        'studentId': studentId,
      });

      if (mounted) {
        if (response.data['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Slot booked successfully!'),
              backgroundColor: Color(0xFF00C9A7),
            ),
          );
          ref.refresh(ptmSlotsProvider(studentId));
          ref.refresh(ptmBookingsProvider(studentId));
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response.data['error'] ?? 'Booking failed')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    }
  }
}
