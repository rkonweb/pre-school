import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:bodhi_parent_app/core/theme/app_theme.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/school_brand_provider.dart';

class HorizontalDateStrip extends ConsumerStatefulWidget {
  final DateTime selectedDate;
  final Function(DateTime) onDateSelected;
  final DateTime? firstDate;
  final DateTime? lastDate;

  const HorizontalDateStrip({
    super.key,
    required this.selectedDate,
    required this.onDateSelected,
    this.firstDate,
    this.lastDate,
  });

  @override
  ConsumerState<HorizontalDateStrip> createState() => _HorizontalDateStripState();
}

class _HorizontalDateStripState extends ConsumerState<HorizontalDateStrip> {
  late ScrollController _scrollController;
  final double _itemWidth = 68.0;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    WidgetsBinding.instance.addPostFrameCallback((_) => _centerSelectedDate(animated: false));
  }

  @override
  void didUpdateWidget(HorizontalDateStrip oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedDate != widget.selectedDate) {
      _centerSelectedDate();
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _centerSelectedDate({bool animated = true}) {
    if (!_scrollController.hasClients) return;
    
    // We generate 61 dates: 30 before, selected, 30 after
    const centerIndex = 30;
    // Context size might throw during init, safety check
    if (!mounted) return;
    final screenWidth = MediaQuery.of(context).size.width;
    // 48 is roughly the width of the calendar icon + padding
    final offset = (centerIndex * _itemWidth) - (screenWidth / 2) + (_itemWidth / 2) + 48;
    
    if (animated) {
      _scrollController.animateTo(
        offset,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    } else {
      _scrollController.jumpTo(offset);
    }
  }

  @override
  Widget build(BuildContext context) {
    final brand = ref.watch(schoolBrandProvider);
    final today = DateTime.now();
    final List<DateTime> dates = List.generate(61, (index) {
      return widget.selectedDate.subtract(const Duration(days: 30)).add(Duration(days: index));
    });

    return Container(
      height: 90,
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          // Calendar Icon on the Left
          Padding(
            padding: const EdgeInsets.only(left: 8.0),
            child: IconButton(
              icon: Icon(Icons.calendar_month, color: brand.secondaryColor),
              onPressed: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: widget.selectedDate,
                  firstDate: widget.firstDate ?? DateTime(2020),
                  lastDate: widget.lastDate ?? DateTime(2101),
                );
                if (picked != null) {
                  widget.onDateSelected(picked);
                }
              },
            ),
          ),
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 8),
              itemCount: dates.length,
              itemBuilder: (context, index) {
                final date = dates[index];
                final isSelected = date.year == widget.selectedDate.year &&
                    date.month == widget.selectedDate.month &&
                    date.day == widget.selectedDate.day;
                final isToday = date.year == today.year &&
                    date.month == today.month &&
                    date.day == today.day;

                return GestureDetector(
                  onTap: () => widget.onDateSelected(date),
                  child: Container(
                    width: 60,
                    margin: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
                    decoration: BoxDecoration(
                      color: isSelected ? brand.secondaryColor : (isToday ? brand.primaryColor.withOpacity(0.1) : Colors.transparent),
                      borderRadius: BorderRadius.circular(12),
                      border: isToday && !isSelected ? Border.all(color: brand.primaryColor, width: 1) : null,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          DateFormat('E').format(date).toUpperCase(),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isSelected ? brand.primaryColor : Colors.grey.shade600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          date.day.toString(),
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: isSelected ? brand.primaryColor : (isToday ? brand.primaryColor : Colors.black87),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
