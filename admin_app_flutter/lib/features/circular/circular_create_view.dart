import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/state/auth_state.dart';
import 'circular_provider.dart';
import '../../shared/components/top_nav_bell.dart';

class CircularCreateView extends ConsumerStatefulWidget {
  const CircularCreateView({super.key});

  @override
  ConsumerState<CircularCreateView> createState() => _CircularCreateViewState();
}

class _CircularCreateViewState extends ConsumerState<CircularCreateView> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _subjectController = TextEditingController();
  final _contentController = TextEditingController();
  String _priority = 'NORMAL';
  String _category = 'GENERAL';
  final List<String> _targetRoles = [];
  bool _isLoading = false;

  final List<String> _availableRoles = ['PRINCIPAL', 'ADMIN', 'TEACHER', 'STAFF', 'PARENT', 'ACCOUNTANT', 'RECEPTIONIST'];

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_targetRoles.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select at least one target role')));
      return;
    }

    setState(() => _isLoading = true);

    try {
      final user = ref.read(userProfileProvider);
      final response = await http.post(
        Uri.parse('http://localhost:3000/api/mobile/v1/staff/circulars'),
        headers: {
          'Authorization': 'Bearer ${user!.token}',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'title': _titleController.text,
          'subject': _subjectController.text,
          'content': _contentController.text,
          'priority': _priority,
          'category': _category,
          'targetRoles': _targetRoles,
          'isPublished': true,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          ref.invalidate(circularListProvider);
          if (mounted) Navigator.pop(context);
          return;
        }
      }
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: ${response.statusCode}')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Create Circular',
          style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF140E28)),
        ),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, color: Color(0xFF140E28)),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (_isLoading)
            const Center(child: Padding(padding: EdgeInsets.only(right: 16), child: CircularProgressIndicator(strokeWidth: 2)))
          else
            TextButton(
              onPressed: _submit,
              child: const Text('Post', style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF7C3AED))),
            ),
          const TopNavBell(badgeText: '3'),
          const SizedBox(width: 8),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            TextFormField(
              controller: _titleController,
              decoration: _inputDecoration('Title', 'Enter circular title'),
              validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _subjectController,
              decoration: _inputDecoration('Subject (Optional)', 'Brief summary'),
              style: const TextStyle(fontFamily: 'Satoshi'),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _contentController,
              decoration: _inputDecoration('Content', 'Supports Markdown...'),
              maxLines: 5,
              validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              style: const TextStyle(fontFamily: 'Satoshi'),
            ),
            const SizedBox(height: 24),
            const Text('Priority', style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w800, fontSize: 12, color: Color(0xFF64748B))),
            const SizedBox(height: 8),
            Row(
              children: ['NORMAL', 'IMPORTANT', 'URGENT'].map((p) => Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(p, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _priority == p ? Colors.white : const Color(0xFF64748B))),
                    selected: _priority == p,
                    onSelected: (val) => setState(() => _priority = p),
                    selectedColor: p == 'URGENT' ? const Color(0xFFEF4444) : const Color(0xFF7C3AED),
                    backgroundColor: const Color(0xFFF8FAFC),
                  ),
                ),
              )).toList(),
            ),
            const SizedBox(height: 24),
            const Text('Categories', style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w800, fontSize: 12, color: Color(0xFF64748B))),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: ['GENERAL', 'ACADEMIC', 'EVENT', 'EXAM', 'HOLIDAY'].map((c) => ChoiceChip(
                label: Text(c, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _category == c ? Colors.white : const Color(0xFF64748B))),
                selected: _category == c,
                onSelected: (val) => setState(() => _category = c),
                selectedColor: const Color(0xFF7C3AED),
                backgroundColor: const Color(0xFFF8FAFC),
              )).toList(),
            ),
            const SizedBox(height: 24),
            const Text('Target Roles', style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w800, fontSize: 12, color: Color(0xFF64748B))),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: _availableRoles.map((role) {
                final isSelected = _targetRoles.contains(role);
                return FilterChip(
                  label: Text(role, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : const Color(0xFF64748B))),
                  selected: isSelected,
                  onSelected: (val) {
                    setState(() {
                      if (val) {
                        _targetRoles.add(role);
                      } else {
                        _targetRoles.remove(role);
                      }
                    });
                  },
                  selectedColor: const Color(0xFF140E28),
                  backgroundColor: const Color(0xFFF8FAFC),
                  checkmarkColor: Colors.white,
                );
              }).toList(),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, String hint) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      labelStyle: const TextStyle(fontFamily: 'Satoshi', color: Color(0xFF64748B), fontWeight: FontWeight.w600, fontSize: 14),
      hintStyle: const TextStyle(fontFamily: 'Satoshi', color: Color(0xFFCBD5E1), fontSize: 14),
      filled: true,
      fillColor: const Color(0xFFF8FAFC),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF7C3AED), width: 1.5)),
    );
  }
}
