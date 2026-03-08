import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../../dashboard/data/dashboard_provider.dart';
import '../data/health_provider.dart';

class HealthScreen extends ConsumerWidget {
  const HealthScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brand = ref.watch(schoolBrandProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: const AppHeader(
        title: 'Health Records',
        subtitle: 'Medical information & check-ups',
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

          final healthAsync = ref.watch(healthDataProvider(studentId));

          return healthAsync.when(
            data: (health) => RefreshIndicator(
              onRefresh: () => ref.refresh(healthDataProvider(studentId).future),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 10),
                    _buildMedicalInfo(health).animate().fadeIn(delay: 50.ms).slideY(begin: 0.1),
                    const SizedBox(height: 16),
                    _buildEmergencyContact(health).animate().fadeIn(delay: 100.ms).slideY(begin: 0.1),
                    const SizedBox(height: 16),
                    _buildHealthRecords(health).animate().fadeIn(delay: 150.ms).slideY(begin: 0.1),
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
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(err.toString()),
                  ElevatedButton(
                    onPressed: () => ref.refresh(healthDataProvider(studentId)),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildMedicalInfo(HealthData health) {
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
          Text(
            'Medical Summary',
            style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
          ),
          const SizedBox(height: 16),
          _infoRow('Blood Group', health.bloodGroup ?? 'Not recorded', Icons.water_drop, Colors.red),
          const SizedBox(height: 12),
          _infoRow('Allergies', health.allergies?.isNotEmpty == true ? health.allergies! : 'None', Icons.warning_amber, Colors.orange),
          const SizedBox(height: 12),
          _infoRow('Medical Conditions', health.medicalConditions?.isNotEmpty == true ? health.medicalConditions! : 'None', Icons.healing, Colors.purple),
        ],
      ),
    );
  }

  Widget _buildEmergencyContact(HealthData health) {
    final contact = health.emergencyContact;
    if (contact == null || (contact['name'] == null && contact['phone'] == null)) {
      return const SizedBox.shrink();
    }

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
                width: 36,
                height: 36,
                decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                child: const Icon(Icons.emergency_outlined, color: Colors.red, size: 18),
              ),
              const SizedBox(width: 12),
              Text(
                'Emergency Contact',
                style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      contact['name'] ?? 'Not set',
                      style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                    ),
                    const SizedBox(height: 4),
                    if (contact['relationship'] != null)
                      Text(
                        contact['relationship'],
                        style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF64748B)),
                      ),
                  ],
                ),
              ),
              if (contact['phone'] != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    contact['phone'],
                    style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.red),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHealthRecords(HealthData health) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Health Check Records',
          style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
        ),
        const SizedBox(height: 12),
        if (health.healthRecords.isEmpty)
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Center(
              child: Column(
                children: [
                  Icon(Icons.health_and_safety_outlined, size: 48, color: Colors.grey.shade300),
                  const SizedBox(height: 8),
                  Text(
                    'No health records yet',
                    style: GoogleFonts.dmSans(color: const Color(0xFF94A3B8)),
                  ),
                ],
              ),
            ),
          )
        else
          ...health.healthRecords.asMap().entries.map((e) {
            final record = e.value;
            final idx = e.key;
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
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        record.recordedAt != null ? _formatDate(record.recordedAt!) : 'Date Unknown',
                        style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 14, color: const Color(0xFF1E293B)),
                      ),
                      if (record.generalHealth != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF00C9A7).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            record.generalHealth!,
                            style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF00C9A7)),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      if (record.height != null) _metricChip('Height', '${record.height} cm'),
                      if (record.weight != null) _metricChip('Weight', '${record.weight} kg'),
                      if (record.bmi != null) _metricChip('BMI', record.bmi!.toStringAsFixed(1)),
                      if (record.bloodPressure != null) _metricChip('BP', record.bloodPressure!),
                      if (record.pulseRate != null) _metricChip('Pulse', '${record.pulseRate} bpm'),
                    ],
                  ),
                ],
              ),
            );
          }).toList(),
      ],
    );
  }

  Widget _infoRow(String label, String value, IconData icon, Color color) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _metricChip(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F4FF),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 13, color: const Color(0xFF1E293B)),
          ),
          Text(
            label,
            style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  String _formatDate(String iso) {
    try {
      final dt = DateTime.parse(iso);
      return '${dt.day} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dt.month - 1]} ${dt.year}';
    } catch (_) {
      return iso;
    }
  }
}
