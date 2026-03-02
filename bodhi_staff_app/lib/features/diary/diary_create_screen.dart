import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import 'diary_provider.dart';
import 'models/diary_entry.dart';
import 'package:intl/intl.dart';

class DiaryCreateScreen extends ConsumerStatefulWidget {
  final DiaryEntry? existingEntry;
  const DiaryCreateScreen({Key? key, this.existingEntry}) : super(key: key);

  @override
  ConsumerState<DiaryCreateScreen> createState() => _DiaryCreateScreenState();
}

class _DiaryCreateScreenState extends ConsumerState<DiaryCreateScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _titleController;
  late TextEditingController _contentController;
  String? _selectedClassroomId;
  String _selectedType = 'HOMEWORK';
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.existingEntry?.title ?? '');
    _contentController = TextEditingController(text: widget.existingEntry?.content ?? '');
    _selectedType = widget.existingEntry?.type ?? 'HOMEWORK';
    
    // Defer setting the class ID if we need to get it from state later
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.existingEntry != null) {
        setState(() {
           _selectedClassroomId = widget.existingEntry!.classroomId;
        });
      } else {
        final state = ref.read(diaryProvider);
        if (state.classrooms.isNotEmpty) {
           setState(() {
             _selectedClassroomId = state.classrooms.first['id'] as String;
           });
        }
      }
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  void _saveEntry() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedClassroomId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a class')));
      return;
    }

    setState(() => _isSaving = true);

    final data = {
      'title': _titleController.text,
      'content': _contentController.text,
      'type': _selectedType,
      'classroomId': _selectedClassroomId,
      'recipientType': 'CLASS',
    };

    bool success;
    if (widget.existingEntry == null) {
      success = await ref.read(diaryProvider.notifier).createEntry(data);
    } else {
      success = await ref.read(diaryProvider.notifier).updateEntry(widget.existingEntry!.id, data);
    }

    if (mounted) {
      setState(() => _isSaving = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(widget.existingEntry == null ? 'Diary entry posted!' : 'Diary entry updated!')),
        );
        context.pop();
      } else {
        final error = ref.read(diaryProvider).error;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error ?? 'Operation failed'), backgroundColor: AppTheme.error),
        );
      }
    }
  }

  void _confirmDelete() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Entry'),
        content: const Text('Are you sure you want to delete this diary entry?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() => _isSaving = true);
              final success = await ref.read(diaryProvider.notifier).deleteEntry(widget.existingEntry!.id);
              if (mounted) {
                setState(() => _isSaving = false);
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Entry deleted')));
                  context.pop();
                } else {
                   final error = ref.read(diaryProvider).error;
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(error ?? 'Failed to delete'), backgroundColor: AppTheme.error),
                    );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.error),
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(diaryProvider);
    final todayStr = DateFormat('MMM dd, yyyy').format(DateTime.now());

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.existingEntry == null ? 'New Diary Entry' : 'Edit Entry'),
        actions: [
          if (widget.existingEntry != null)
            IconButton(
              icon: const Icon(Icons.delete, color: AppTheme.error),
              onPressed: _confirmDelete,
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.s16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Date Indicator (Read Only)
              Container(
                padding: const EdgeInsets.all(AppTheme.s12),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  border: Border.all(color: AppTheme.border),
                  borderRadius: AppTheme.radiusSmall,
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 18, color: AppTheme.textMuted),
                    const SizedBox(width: AppTheme.s8),
                    Text('Date: $todayStr', style: const TextStyle(fontWeight: FontWeight.w500)),
                    const Spacer(),
                    const Text('(Today only)', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                  ],
                ),
              ),
              const SizedBox(height: AppTheme.s16),

              // Class Selector
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Select Class',
                  border: OutlineInputBorder(),
                ),
                value: _selectedClassroomId,
                items: state.classrooms.map((c) => DropdownMenuItem(
                      value: c['id'] as String,
                      child: Text(c['name'] as String),
                    )).toList(),
                onChanged: (val) {
                  setState(() => _selectedClassroomId = val);
                },
                validator: (val) => val == null ? 'Please select a class' : null,
              ),
              const SizedBox(height: AppTheme.s16),

              // Type Selector
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Entry Type',
                  border: OutlineInputBorder(),
                ),
                value: _selectedType,
                items: const [
                  DropdownMenuItem(value: 'HOMEWORK', child: Text("Homework")),
                  DropdownMenuItem(value: 'NOTICE', child: Text("Notice")),
                  DropdownMenuItem(value: 'APPRECIATION', child: Text("Appreciation")),
                  DropdownMenuItem(value: 'ANNOUNCEMENT', child: Text("Announcement")),
                  DropdownMenuItem(value: 'COMPLAINT', child: Text("Complaint")),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _selectedType = val);
                },
              ),
              const SizedBox(height: AppTheme.s16),

              // Title Input
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Title',
                  hintText: 'e.g. Math Chapter 4',
                  border: OutlineInputBorder(),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Title is required' : null,
              ),
              const SizedBox(height: AppTheme.s16),

              // Content Input
              TextFormField(
                controller: _contentController,
                maxLines: 8,
                decoration: const InputDecoration(
                  labelText: 'Message / Content',
                  alignLabelWithHint: true,
                  border: OutlineInputBorder(),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Content is required' : null,
              ),
            ],
          ),
        ),
      ),

      // Bottom Action Area
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.s16),
          child: ElevatedButton(
            onPressed: _isSaving ? null : _saveEntry,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: AppTheme.s16),
            ),
            child: _isSaving
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : Text(widget.existingEntry == null ? 'Post Diary Entry' : 'Update Entry',
                    style: const TextStyle(fontSize: 16)),
          ),
        ),
      ),
    );
  }
}
