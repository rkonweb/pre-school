import 'package:flutter/material.dart';
import '../../core/widgets/global_header.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/school_brand_provider.dart';
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

  final List<String> _diaryTypes = ['HOMEWORK', 'NOTICE', 'COMPLAINT', 'APPRECIATION'];

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.existingEntry?.title ?? '');
    _contentController = TextEditingController(text: widget.existingEntry?.content ?? '');
    _selectedType = widget.existingEntry?.type ?? 'HOMEWORK';
    
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
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a class'), backgroundColor: AppTheme.danger));
      return;
    }

    setState(() => _isSaving = true);

    final data = {
      'title': _titleController.text,
      'content': _contentController.text,
      'type': _selectedType,
      'classroomId': _selectedClassroomId,
      'recipientType': 'CLASS', // Currently targeting whole classes
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
          SnackBar(
            content: Text(widget.existingEntry == null ? 'Diary entry posted successfully!' : 'Entry updated!'),
            backgroundColor: AppTheme.success,
          ),
        );
        context.pop();
      } else {
        final error = ref.read(diaryProvider).error;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error ?? 'Operation failed'), backgroundColor: AppTheme.danger),
        );
      }
    }
  }

  void _confirmDelete() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Entry'),
        content: const Text('Are you sure you want to delete this diary entry? This action cannot be undone.'),
        shape: RoundedRectangleBorder(borderRadius: AppTheme.radiusLarge),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppTheme.textMuted)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() => _isSaving = true);
              final success = await ref.read(diaryProvider.notifier).deleteEntry(widget.existingEntry!.id);
              if (mounted) {
                setState(() => _isSaving = false);
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Entry deleted'), backgroundColor: AppTheme.success));
                  context.pop();
                } else {
                   final error = ref.read(diaryProvider).error;
                   ScaffoldMessenger.of(context).showSnackBar(
                     SnackBar(content: Text(error ?? 'Failed to delete'), backgroundColor: AppTheme.danger),
                   );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.danger,
              shape: RoundedRectangleBorder(borderRadius: AppTheme.radiusMedium),
            ),
            child: const Text('Delete', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(diaryProvider);
    final brand = ref.watch(schoolBrandProvider);
    final isNewDateStr = DateFormat('MMM dd, yyyy').format(state.selectedDate);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: GlobalHeader(
        title: widget.existingEntry == null ? 'Create Entry' : 'Edit Entry',
        showBackButton: true,
        actions: [
          if (widget.existingEntry != null)
            IconButton(
              icon: const Icon(Icons.delete_outline, color: AppTheme.danger),
              onPressed: _confirmDelete,
            ),
        ],
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppTheme.s24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (widget.existingEntry == null) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: brand.primaryColor.withOpacity(0.05),
                      borderRadius: AppTheme.radiusMedium,
                      border: Border.all(color: brand.primaryColor.withOpacity(0.1)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.calendar_today, size: 18, color: brand.primaryColor),
                        const SizedBox(width: 8),
                        Text(
                          'Scheduling for: $isNewDateStr',
                          style: TextStyle(
                            color: brand.primaryColor,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Target Class Dropdown
                const Text('Select Class', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _selectedClassroomId,
                  icon: const Icon(Icons.keyboard_arrow_down, color: AppTheme.textMuted),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    border: OutlineInputBorder(borderRadius: AppTheme.radiusMedium, borderSide: const BorderSide(color: AppTheme.border)),
                    enabledBorder: OutlineInputBorder(borderRadius: AppTheme.radiusMedium, borderSide: const BorderSide(color: AppTheme.border)),
                    focusedBorder: OutlineInputBorder(borderRadius: AppTheme.radiusMedium, borderSide: BorderSide(color: brand.primaryColor)),
                  ),
                  items: state.classrooms.map((c) => DropdownMenuItem(
                    value: c['id'] as String,
                    child: Text(c['name'] as String, style: const TextStyle(fontWeight: FontWeight.w500)),
                  )).toList(),
                  onChanged: (val) {
                    setState(() => _selectedClassroomId = val);
                  },
                  validator: (val) => val == null ? 'Classroom is required' : null,
                ),
                const SizedBox(height: 24),

                // Post Type Dropdown
                const Text('Post Type', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _selectedType,
                  icon: const Icon(Icons.keyboard_arrow_down, color: AppTheme.textMuted),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    border: OutlineInputBorder(borderRadius: AppTheme.radiusMedium, borderSide: const BorderSide(color: AppTheme.border)),
                    enabledBorder: OutlineInputBorder(borderRadius: AppTheme.radiusMedium, borderSide: const BorderSide(color: AppTheme.border)),
                    focusedBorder: OutlineInputBorder(borderRadius: AppTheme.radiusMedium, borderSide: BorderSide(color: brand.primaryColor)),
                  ),
                  items: _diaryTypes.map((type) => DropdownMenuItem(
                    value: type,
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          margin: const EdgeInsets.only(right: 8),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _getTypeColor(type, brand),
                          ),
                        ),
                        Text(type, style: const TextStyle(fontWeight: FontWeight.w500)),
                      ],
                    ),
                  )).toList(),
                  onChanged: (val) {
                    setState(() => _selectedType = val!);
                  },
                ),
                const SizedBox(height: 24),

                // Title Input
                const Text('Subject Title', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _titleController,
                  decoration: InputDecoration(
                    hintText: 'e.g., Math Ch 3 Assessment',
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    border: OutlineInputBorder(borderRadius: AppTheme.radiusMedium, borderSide: const BorderSide(color: AppTheme.border)),
                    enabledBorder: OutlineInputBorder(borderRadius: AppTheme.radiusMedium, borderSide: const BorderSide(color: AppTheme.border)),
                    focusedBorder: OutlineInputBorder(borderRadius: AppTheme.radiusMedium, borderSide: BorderSide(color: brand.primaryColor)),
                  ),
                  textCapitalization: TextCapitalization.sentences,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) return 'Please enter a title';
                    return null;
                  },
                ),
                const SizedBox(height: 24),

                // Description Block
                const Text('Description', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _contentController,
                  maxLines: 6,
                  decoration: InputDecoration(
                    hintText: 'Provide details about the homework or notice...',
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    border: OutlineInputBorder(borderRadius: AppTheme.radiusMedium, borderSide: const BorderSide(color: AppTheme.border)),
                    enabledBorder: OutlineInputBorder(borderRadius: AppTheme.radiusMedium, borderSide: const BorderSide(color: AppTheme.border)),
                    focusedBorder: OutlineInputBorder(borderRadius: AppTheme.radiusMedium, borderSide: BorderSide(color: brand.primaryColor)),
                  ),
                  textCapitalization: TextCapitalization.sentences,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) return 'Please enter description details';
                    return null;
                  },
                ),

                const SizedBox(height: 48),

                // Final Button
                SizedBox(
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : _saveEntry,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: brand.primaryColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: AppTheme.radiusMedium),
                      elevation: 2,
                    ),
                    child: _isSaving
                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text(
                            widget.existingEntry == null ? 'Publish Entry' : 'Update Entry',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getTypeColor(String type, SchoolBrandState brand) {
    switch (type) {
      case 'NOTICE':
      case 'ANNOUNCEMENT':
        return brand.secondaryColor;
      case 'COMPLAINT':
        return AppTheme.danger;
      case 'APPRECIATION':
        return AppTheme.success;
      case 'HOMEWORK':
      default:
        return brand.primaryColor;
    }
  }
}
