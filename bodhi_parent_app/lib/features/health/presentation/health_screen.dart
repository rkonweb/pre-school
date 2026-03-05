import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../../dashboard/data/dashboard_provider.dart';
import '../data/health_provider.dart';

class HealthScreen extends ConsumerWidget {
  const HealthScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(dashboardDataProvider);
    final brand = ref.watch(schoolBrandProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: const AppHeader(
        title: 'Health & Medical',
        subtitle: 'Medical records & emergency contacts',
      ),
      body: dashboardAsync.when(
        data: (data) {
          final students = data['students'] as List?;
          if (students == null || students.isEmpty) return const Center(child: Text('No students found.'));
          final studentId = students[0]['id'] as String;
          final healthAsync = ref.watch(healthDataProvider(studentId));

          return healthAsync.when(
            data: (health) => RefreshIndicator(
              onRefresh: () => ref.refresh(healthDataProvider(studentId).future),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _buildMedicalInfo(health, brand),
                  const SizedBox(height: 16),
                  _buildEmergencyContact(health, brand),
                  const SizedBox(height: 16),
                  _buildHealthRecords(health, brand),
                  const SizedBox(height: 32),
                ],
              ),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text(err.toString()),
                ElevatedButton(
                  onPressed: () => ref.refresh(healthDataProvider(studentId)),
                  child: const Text('Retry'),
                )
              ],
            )),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildMedicalInfo(HealthData health, SchoolBrandState brand) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.medical_information, color: brand.primaryColor),
                const SizedBox(width: 8),
                const Text('Medical Information', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            const Divider(height: 24),
            _infoRow('Blood Group', health.bloodGroup ?? 'Not recorded', Icons.water_drop, Colors.red),
            const SizedBox(height: 12),
            _infoRow('Allergies', health.allergies?.isNotEmpty == true ? health.allergies! : 'None recorded',
                Icons.warning_amber, Colors.orange),
            const SizedBox(height: 12),
            _infoRow('Medical Conditions', health.medicalConditions?.isNotEmpty == true ? health.medicalConditions! : 'None recorded',
                Icons.healing, Colors.purple),
          ],
        ),
      ),
    );
  }

  Widget _buildEmergencyContact(HealthData health, SchoolBrandState brand) {
    final contact = health.emergencyContact;
    if (contact == null || (contact['name'] == null && contact['phone'] == null)) {
      return const SizedBox.shrink();
    }

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: const Color(0xFFE8F5E9),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.emergency, color: Colors.green),
                SizedBox(width: 8),
                Text('Emergency Contact', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.green)),
              ],
            ),
            const SizedBox(height: 12),
            if (contact['name'] != null)
              Text(contact['name'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            if (contact['phone'] != null)
              Text(contact['phone'], style: const TextStyle(color: Colors.grey, fontSize: 14)),
          ],
        ),
      ),
    );
  }

  Widget _buildHealthRecords(HealthData health, SchoolBrandState brand) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Health Check Records', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 12),
        if (health.healthRecords.isEmpty)
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: const Padding(
              padding: EdgeInsets.all(24),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.health_and_safety, size: 48, color: Colors.grey),
                    SizedBox(height: 8),
                    Text('No health records yet', style: TextStyle(color: Colors.grey)),
                  ],
                ),
              ),
            ),
          )
        else
          ...health.healthRecords.map((record) => Card(
            margin: const EdgeInsets.only(bottom: 12),
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        record.recordedAt != null
                            ? _formatDate(record.recordedAt!)
                            : 'Date Unknown',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      if (record.generalHealth != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: brand.primaryColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(record.generalHealth!, style: TextStyle(color: brand.primaryColor, fontSize: 12)),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 16,
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
            ),
          )),
      ],
    );
  }

  Widget _infoRow(String label, String value, IconData icon, Color color) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
              Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _metricChip(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F4FF),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
        ],
      ),
    );
  }

  String _formatDate(String iso) {
    try {
      final dt = DateTime.parse(iso);
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return iso;
    }
  }
}
