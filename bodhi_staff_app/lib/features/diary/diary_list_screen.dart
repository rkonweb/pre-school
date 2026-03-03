import 'package:flutter/material.dart';
import '../../core/widgets/global_header.dart';
import '../../core/widgets/horizontal_date_strip.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:bodhi_staff_app/core/theme/app_theme.dart';
import 'diary_provider.dart';
import 'models/diary_entry.dart';
import 'package:intl/intl.dart';

import 'package:bodhi_staff_app/core/theme/school_brand_provider.dart';

class DiaryListScreen extends ConsumerStatefulWidget {
  const DiaryListScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<DiaryListScreen> createState() => _DiaryListScreenState();
}

class _DiaryListScreenState extends ConsumerState<DiaryListScreen> {
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(diaryProvider);
    final notifier = ref.read(diaryProvider.notifier);
    final brand = ref.watch(schoolBrandProvider);

    return Scaffold(
      appBar: GlobalHeader(
        title: 'Diary',
        actions: const [], // Removed Calendar and Refresh from Header
      ),
      body: Column(
        children: [
          HorizontalDateStrip(
            selectedDate: state.selectedDate,
            onDateSelected: (date) => notifier.setDate(date),
          ),
          _buildFilterBar(context, state, notifier, brand),
          Expanded(
            child: state.isLoading && state.entries.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : state.error != null
                    ? Center(
                        child: Text(
                          state.error!,
                          style: const TextStyle(color: AppTheme.danger),
                        ))
                    : RefreshIndicator(
                        onRefresh: () => ref.read(diaryProvider.notifier).loadEntries(),
                        child: state.entries.isEmpty
                            ? _buildEmptyState(state)
                            : _buildEntriesList(context, state.entries, ref),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/diary/create'),
        icon: const Icon(Icons.add),
        label: const Text('New Entry'),
        backgroundColor: brand.secondaryColor,
        foregroundColor: brand.primaryColor,
      ),
    );
  }

  Widget _buildEmptyState(DiaryState state) {
    return ListView(
      children: [
        const SizedBox(height: 100),
        Center(
          child: Column(
            children: [
              Icon(Icons.edit_note, size: 80, color: AppTheme.textMuted.withOpacity(0.3)),
              const SizedBox(height: AppTheme.s16),
              Text(
                "No diary entries for ${DateFormat('MMM dd').format(state.selectedDate)}",
                style: const TextStyle(color: AppTheme.textMuted, fontSize: 16),
              ),
              if (state.onlyMine)
                TextButton(
                  onPressed: () => {}, // Handled by segmented button
                  child: const Text("Try switching to 'All Teachers'"),
                )
            ],
          ),
        ),
      ],
    );
  }



  Widget _buildFilterBar(BuildContext context, DiaryState state, DiaryProvider notifier, SchoolBrandState brand) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.s16),
      child: Column(
        children: [
          // Mine vs All Toggle
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: AppTheme.border.withOpacity(0.3),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: _buildToggleButton(
                    label: "Only Mine",
                    isSelected: state.onlyMine,
                    brand: brand,
                    onTap: () => notifier.toggleOnlyMine(true),
                  ),
                ),
                Expanded(
                  child: _buildToggleButton(
                    label: "All Teachers",
                    isSelected: !state.onlyMine,
                    brand: brand,
                    onTap: () => notifier.toggleOnlyMine(false),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  decoration: const InputDecoration(
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(horizontal: 12.0, vertical: 8),
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
              IconButton(
                icon: const Icon(Icons.tune),
                onPressed: () {
                    // Show type filter in a bottom sheet or another way? For now keep it simple.
                },
              )
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildToggleButton({required String label, required bool isSelected, required SchoolBrandState brand, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.surface : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: isSelected ? [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2))
          ] : null,
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? brand.secondaryColor : AppTheme.textMuted,
          ),
        ),
      ),
    );
  }

  Widget _buildEntriesList(BuildContext context, List<DiaryEntry> entries, WidgetRef ref) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.s16, vertical: AppTheme.s8),
      itemCount: entries.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppTheme.s16),
      itemBuilder: (context, index) {
        final entry = entries[index];
        return _buildEntryCard(context, entry);
      },
    );
  }

  Widget _buildEntryCard(BuildContext context, DiaryEntry entry) {
    final entryDate = entry.scheduledFor ?? entry.publishedAt ?? entry.createdAt;
    // ignore: unused_local_variable
    final isToday = _isToday(DateTime.now()); // Logic for editing today's posts
    final now = DateTime.now();
    final canEdit = entryDate.year == now.year && entryDate.month == now.month && entryDate.day == now.day;
    
    final classroomName = entry.classroom?['name'] ?? 'Direct Message';
    final dateFormatted = DateFormat('h:mm a').format(entryDate);
    final authorName = "${entry.author?['firstName'] ?? ''} ${entry.author?['lastName'] ?? ''}".trim();

    // brand is available from build or we can just use ref.read(schoolBrandProvider) here, 
    // but it's better to stay consistent. Let's just use ref.read for helper logic if needed, 
    // but it's already watched in build, so the whole widget rebuilds.
    final brand = ref.read(schoolBrandProvider);

    Color typeColor = brand.secondaryColor;
    if (entry.type == 'NOTICE' || entry.type == 'ANNOUNCEMENT') typeColor = brand.secondaryColor.withOpacity(0.8);
    if (entry.type == 'COMPLAINT') typeColor = AppTheme.danger;
    if (entry.type == 'APPRECIATION') typeColor = AppTheme.success;

    return Card(
      child: InkWell(
        onTap: () {
            // maybe show full detail
        },
        borderRadius: AppTheme.radiusMedium,
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.s16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                   CircleAvatar(
                    radius: 12,
                    backgroundColor: brand.primaryColor.withOpacity(0.1),
                    child: Text(
                        authorName.isNotEmpty ? authorName[0].toUpperCase() : '?',
                        style: TextStyle(fontSize: 10, color: brand.secondaryColor, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: AppTheme.s8),
                  Text(
                    authorName.isNotEmpty ? authorName : 'Unknown Teacher',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: typeColor.withOpacity(0.1),
                      borderRadius: AppTheme.radiusSmall,
                    ),
                    child: Text(
                      entry.type,
                      style: TextStyle(color: typeColor, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                entry.title,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
              ),
              if (entry.content != null && entry.content!.isNotEmpty) ...[
                const SizedBox(height: AppTheme.s8),
                Text(
                  entry.content!,
                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 14),
                ),
              ],
              const SizedBox(height: AppTheme.s16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.class_outlined, size: 14),
                      const SizedBox(width: 4),
                      Text(classroomName, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                      const SizedBox(width: 12),
                      const Icon(Icons.access_time, size: 14),
                      const SizedBox(width: 4),
                      Text(dateFormatted, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                    ],
                  ),
                  if (canEdit)
                    IconButton(
                        icon: const Icon(Icons.edit_outlined, size: 20, color: AppTheme.primary),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () => context.push('/diary/edit', extra: entry),
                    )
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  bool _isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }
}
