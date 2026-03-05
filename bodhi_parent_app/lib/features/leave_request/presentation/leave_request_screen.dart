import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../../dashboard/data/dashboard_provider.dart';

class LeaveRequestScreen extends ConsumerStatefulWidget {
  const LeaveRequestScreen({super.key});

  @override
  ConsumerState<LeaveRequestScreen> createState() => _LeaveRequestScreenState();
}

class _LeaveRequestScreenState extends ConsumerState<LeaveRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _reasonController = TextEditingController();
  DateTime? _startDate;
  DateTime? _endDate;
  bool _isSubmitting = false;
  String? _successMessage;
  String? _errorMessage;

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _pickDate(bool isStart) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
          if (_endDate != null && _endDate!.isBefore(_startDate!)) _endDate = null;
        } else {
          _endDate = picked;
        }
      });
    }
  }

  Future<void> _submit(String studentId, String phone) async {
    if (!_formKey.currentState!.validate()) return;
    if (_startDate == null || _endDate == null) {
      setState(() => _errorMessage = 'Please select both start and end dates.');
      return;
    }

    setState(() { _isSubmitting = true; _errorMessage = null; _successMessage = null; });

    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.post('parent/leave-request', data: {
        'studentId': studentId,
        'startDate': _startDate!.toIso8601String(),
        'endDate': _endDate!.toIso8601String(),
        'reason': _reasonController.text.trim(),
      });

      if (response.data['success'] == true) {
        setState(() {
          _successMessage = 'Leave request submitted successfully!';
          _reasonController.clear();
          _startDate = null;
          _endDate = null;
        });
      } else {
        setState(() => _errorMessage = response.data['error'] ?? 'Failed to submit leave request');
      }
    } catch (e) {
      setState(() => _errorMessage = 'Network error. Please try again.');
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dashboardAsync = ref.watch(dashboardDataProvider);
    final brand = ref.watch(schoolBrandProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: const AppHeader(
        title: 'Request Leave',
        subtitle: 'Apply for student absence',
      ),
      body: dashboardAsync.when(
        data: (data) {
          final students = data['students'] as List?;
          if (students == null || students.isEmpty) return const Center(child: Text('No students found.'));
          final studentId = students[0]['id'] as String;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Icon Header
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: brand.primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                      children: [
                        Icon(Icons.event_available, size: 48, color: brand.primaryColor),
                        const SizedBox(height: 8),
                        Text(
                          'Submit a Leave Request',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: brand.primaryColor),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'This will be reviewed by the school',
                          style: TextStyle(color: brand.primaryColor.withOpacity(0.7), fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Date Pickers
                  Row(
                    children: [
                      Expanded(child: _buildDatePicker('Start Date', _startDate, () => _pickDate(true), brand)),
                      const SizedBox(width: 12),
                      Expanded(child: _buildDatePicker('End Date', _endDate, () => _pickDate(false), brand)),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Reason Field
                  TextFormField(
                    controller: _reasonController,
                    maxLines: 5,
                    decoration: InputDecoration(
                      labelText: 'Reason for Leave',
                      hintText: 'Explain the reason...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: brand.primaryColor, width: 2),
                      ),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter a reason' : null,
                  ),
                  const SizedBox(height: 24),

                  // Success / Error messages
                  if (_successMessage != null)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: const Color(0xFFE8F5E9), borderRadius: BorderRadius.circular(12)),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle, color: Colors.green),
                          const SizedBox(width: 8),
                          Expanded(child: Text(_successMessage!, style: const TextStyle(color: Colors.green))),
                        ],
                      ),
                    ),
                  if (_errorMessage != null)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: const Color(0xFFFFEBEE), borderRadius: BorderRadius.circular(12)),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, color: Colors.red),
                          const SizedBox(width: 8),
                          Expanded(child: Text(_errorMessage!, style: const TextStyle(color: Colors.red))),
                        ],
                      ),
                    ),
                  const SizedBox(height: 16),

                  // Submit Button
                  SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : () => _submit(studentId, ''),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: brand.primaryColor,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: _isSubmitting
                          ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                          : const Text('Submit Request', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildDatePicker(String label, DateTime? date, VoidCallback onTap, SchoolBrandState brand) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          border: Border.all(color: date != null ? brand.primaryColor : Colors.grey.shade300, width: date != null ? 2 : 1),
          borderRadius: BorderRadius.circular(12),
          color: date != null ? brand.primaryColor.withOpacity(0.05) : Colors.white,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(color: Colors.grey.shade600, fontSize: 11)),
            const SizedBox(height: 4),
            Text(
              date != null ? '${date.day}/${date.month}/${date.year}' : 'Select date',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: date != null ? brand.primaryColor : Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
