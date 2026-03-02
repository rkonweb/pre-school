import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import 'diary_provider.dart';
import 'models/diary_entry.dart';
import 'package:intl/intl.dart';

class DiaryListScreen extends ConsumerWidget {
  const DiaryListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(diaryProvider);
    final notifier = ref.read(diaryProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Diary Entries'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => notifier.init(),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilterBar(context, state, notifier),
          Expanded(
            child: state.isLoading && state.entries.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : state.error != null
                    ? Center(
                        child: Text(
                          state.error!,
                          style: const TextStyle(color: AppTheme.error),
                        ))
                    : state.entries.isEmpty
                        ? const Center(
                            child: Text(
                              "No diary entries found.",
                              style: TextStyle(color: AppTheme.textMuted),
                            ))
                        : _buildEntriesList(context, state.entries, ref),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/diary/create'),
        icon: const Icon(Icons.add),
        label: const Text('New Entry'),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
      ),
    );
  }

  Widget _buildFilterBar(BuildContext context, DiaryState state, DiaryProvider notifier) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.s16, vertical: AppTheme.s12),
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        border: Border(bottom: BorderSide(color: AppTheme.border)),
      ),
      child: Row(
        children: [
          Expanded(
            child: DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                isDense: true,
                contentPadding: EdgeInsets.symmetric(horizontal: AppTheme.s12, vertical: AppTheme.s8),
                border: OutlineInputBorder(),
                hintText: 'Select Class',
              ),
              value: state.selectedClassroomId,
              items: [
                const DropdownMenuItem(value: null, child: Text("All Classes")),
                ...state.classrooms.map((c) => DropdownMenuItem(
                      value: c['id'] as String,
                      child: Text(c['name'] as String, overflow: TextOverflow.ellipsis),
                    ))
              ],
              onChanged: (val) => notifier.setFilter(classroomId: val),
            ),
          ),
          const SizedBox(width: AppTheme.s8),
          Expanded(
            child: DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                isDense: true,
                contentPadding: EdgeInsets.symmetric(horizontal: AppTheme.s12, vertical: AppTheme.s8),
                border: OutlineInputBorder(),
                hintText: 'Type',
              ),
              value: state.selectedType,
              items: const [
                DropdownMenuItem(value: null, child: Text("All Types")),
                DropdownMenuItem(value: 'HOMEWORK', child: Text("Homework")),
                DropdownMenuItem(value: 'NOTICE', child: Text("Notice")),
                DropdownMenuItem(value: 'APPRECIATION', child: Text("Appreciation")),
                DropdownMenuItem(value: 'ANNOUNCEMENT', child: Text("Announcement")),
                DropdownMenuItem(value: 'COMPLAINT', child: Text("Complaint")),
              ],
              onChanged: (val) => notifier.setFilter(type: val),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEntriesList(BuildContext context, List<DiaryEntry> entries, WidgetRef ref) {
    return RefreshIndicator(
      onRefresh: () => ref.read(diaryProvider.notifier).loadEntries(),
      child: ListView.separated(
        padding: const EdgeInsets.all(AppTheme.s16),
        itemCount: entries.length,
        separatorBuilder: (_, __) => const SizedBox(height: AppTheme.s12),
        itemBuilder: (context, index) {
          final entry = entries[index];
          return _buildEntryCard(context, entry);
        },
      ),
    );
  }

  Widget _buildEntryCard(BuildContext context, DiaryEntry entry) {
    final entryDate = entry.scheduledFor ?? entry.publishedAt ?? entry.createdAt;
    final isToday = _isToday(entryDate);
    final classroomName = entry.classroom?['name'] ?? 'Direct Message';
    final dateFormatted = DateFormat('MMM dd, yyyy h:mm a').format(entryDate);

    Color typeColor = AppTheme.primary;
    if (entry.type == 'NOTICE' || entry.type == 'ANNOUNCEMENT') typeColor = AppTheme.info;
    if (entry.type == 'COMPLAINT') typeColor = AppTheme.error;
    if (entry.type == 'APPRECIATION') typeColor = AppTheme.success;

    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: AppTheme.radiusMedium),
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.s16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: AppTheme.s8, vertical: AppTheme.s4),
                  decoration: BoxDecoration(
                    color: typeColor.withOpacity(0.1),
                    borderRadius: AppTheme.radiusSmall,
                  ),
                  child: Text(
                    entry.type,
                    style: TextStyle(color: typeColor, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
                Text(dateFormatted, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              ],
            ),
            const SizedBox(height: AppTheme.s12),
            Text(
              entry.title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
            ),
            if (entry.content != null && entry.content!.isNotEmpty) ...[
              const SizedBox(height: AppTheme.s8),
              Text(
                entry.content!,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14),
              ),
            ],
            const SizedBox(height: AppTheme.s12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.class_, size: 16, color: AppTheme.textMuted),
                    const SizedBox(width: AppTheme.s4),
                    Text(
                      classroomName,
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                    ),
                  ],
                ),
                if (isToday)
                  TextButton.icon(
                    onPressed: () {
                      context.push('/diary/edit', extra: entry);
                    },
                    icon: const Icon(Icons.edit, size: 16),
                    label: const Text('Edit'),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: AppTheme.s8),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  )
              ],
            ),
          ],
        ),
      ),
    );
  }

  bool _isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }
}
