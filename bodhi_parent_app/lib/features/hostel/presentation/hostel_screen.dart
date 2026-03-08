import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../../dashboard/data/dashboard_provider.dart';

class HostelInfo {
  final String roomNumber;
  final String floor;
  final String building;
  final List<String> roommates;
  final String wardenName;
  final String wardenPhone;
  final Map<String, List<String>> mealSchedule;

  HostelInfo({
    required this.roomNumber,
    required this.floor,
    required this.building,
    required this.roommates,
    required this.wardenName,
    required this.wardenPhone,
    required this.mealSchedule,
  });

  factory HostelInfo.fromJson(Map<String, dynamic> json) => HostelInfo(
    roomNumber: json['roomNumber'] ?? 'Not assigned',
    floor: json['floor'] ?? 'N/A',
    building: json['building'] ?? 'N/A',
    roommates: List<String>.from(json['roommates'] ?? []),
    wardenName: json['wardenName'] ?? 'Not assigned',
    wardenPhone: json['wardenPhone'] ?? 'N/A',
    mealSchedule: Map<String, List<String>>.from(
      (json['mealSchedule'] as Map?)?.map((k, v) => MapEntry(k as String, List<String>.from(v ?? []))) ?? {
        'Monday': ['08:00 AM', '01:00 PM', '07:00 PM'],
        'Tuesday': ['08:00 AM', '01:00 PM', '07:00 PM'],
        'Wednesday': ['08:00 AM', '01:00 PM', '07:00 PM'],
        'Thursday': ['08:00 AM', '01:00 PM', '07:00 PM'],
        'Friday': ['08:00 AM', '01:00 PM', '07:00 PM'],
        'Saturday': ['08:00 AM', '01:00 PM', '07:00 PM'],
        'Sunday': ['08:00 AM', '01:00 PM', '07:00 PM'],
      },
    ),
  );
}

final hostelInfoProvider = FutureProvider.family<HostelInfo, String>((ref, studentId) async {
  final api = ref.read(apiClientProvider);
  try {
    final r = await api.get('parent/hostel', queryParameters: {'studentId': studentId});
    if (r.data['success'] == true) {
      return HostelInfo.fromJson(r.data['data'] ?? {});
    }
    throw Exception(r.data['error'] ?? 'Not enrolled in hostel');
  } catch (e) {
    if (e.toString().contains('404') || e.toString().contains('not enrolled')) {
      throw Exception('Not enrolled in hostel');
    }
    rethrow;
  }
});

class HostelScreen extends ConsumerWidget {
  const HostelScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: const AppHeader(
        title: 'Hostel',
        subtitle: 'Room details & meal schedule',
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

          final hostelAsync = ref.watch(hostelInfoProvider(studentId));

          return hostelAsync.when(
            data: (hostel) => RefreshIndicator(
              onRefresh: () => ref.refresh(hostelInfoProvider(studentId).future),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 10),
                    _buildRoomCard(hostel).animate().fadeIn(delay: 50.ms).slideY(begin: 0.1),
                    const SizedBox(height: 16),
                    _buildWardenCard(hostel).animate().fadeIn(delay: 100.ms).slideY(begin: 0.1),
                    const SizedBox(height: 16),
                    _buildRoommatesCard(hostel).animate().fadeIn(delay: 150.ms).slideY(begin: 0.1),
                    const SizedBox(height: 16),
                    _buildMealScheduleCard(hostel).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.bed_outlined, size: 64, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text(
                    err.toString(),
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildRoomCard(HostelInfo hostel) {
    return Container(
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
                child: const Icon(Icons.bed_outlined, color: Color(0xFF3B6EF8), size: 22),
              ),
              const SizedBox(width: 12),
              Text(
                'Room Details',
                style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildInfoRow('Room Number', hostel.roomNumber),
          const SizedBox(height: 12),
          _buildInfoRow('Floor', hostel.floor),
          const SizedBox(height: 12),
          _buildInfoRow('Building', hostel.building),
        ],
      ),
    );
  }

  Widget _buildWardenCard(HostelInfo hostel) {
    return Container(
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
                  color: const Color(0xFF00C9A7).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.person_outline, color: Color(0xFF00C9A7), size: 22),
              ),
              const SizedBox(width: 12),
              Text(
                'Warden',
                style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            hostel.wardenName,
            style: GoogleFonts.sora(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.phone_outlined, size: 16, color: const Color(0xFF3B6EF8)),
              const SizedBox(width: 8),
              Text(
                hostel.wardenPhone,
                style: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF64748B)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRoommatesCard(HostelInfo hostel) {
    return Container(
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
                  color: const Color(0xFFF5A623).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.people_outline, color: Color(0xFFF5A623), size: 22),
              ),
              const SizedBox(width: 12),
              Text(
                'Roommates',
                style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (hostel.roommates.isEmpty)
            Text(
              'No roommates',
              style: GoogleFonts.dmSans(color: const Color(0xFF94A3B8)),
            )
          else
            Column(
              children: hostel.roommates.asMap().entries.map((e) {
                return Padding(
                  padding: EdgeInsets.only(bottom: e.key < hostel.roommates.length - 1 ? 8 : 0),
                  child: Text(
                    '${e.key + 1}. ${e.value}',
                    style: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF64748B)),
                  ),
                );
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildMealScheduleCard(HostelInfo hostel) {
    return Container(
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
                  color: const Color(0xFF8B5CF6).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.restaurant_outlined, color: Color(0xFF8B5CF6), size: 22),
              ),
              const SizedBox(width: 12),
              Text(
                'Meal Schedule',
                style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...hostel.mealSchedule.entries.map((entry) {
            final day = entry.key;
            final times = entry.value;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  day,
                  style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF94A3B8)),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0F4FF),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '🌅 ${times.length > 0 ? times[0] : 'N/A'}',
                          style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF3B6EF8)),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7).withOpacity(0.5),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '🌞 ${times.length > 1 ? times[1] : 'N/A'}',
                          style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.orange),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFECDD2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '🌙 ${times.length > 2 ? times[2] : 'N/A'}',
                          style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.red),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
              ],
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600),
        ),
        const Spacer(),
        Text(
          value,
          style: GoogleFonts.sora(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
        ),
      ],
    );
  }
}
