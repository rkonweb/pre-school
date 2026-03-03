import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/student_avatar.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/school_brand_provider.dart';

class AttendanceStudentCard extends ConsumerStatefulWidget {
  final String studentId;
  final String studentName;
  final String rollNumber;
  final String? avatarUrl;
  final String? status;
  final Function(String status) onMarked;

  const AttendanceStudentCard({
    Key? key,
    required this.studentId,
    required this.studentName,
    required this.rollNumber,
    required this.onMarked,
    this.avatarUrl,
    this.status,
  }) : super(key: key);

  @override
  ConsumerState<AttendanceStudentCard> createState() => _AttendanceStudentCardState();
}

class _AttendanceStudentCardState extends ConsumerState<AttendanceStudentCard> {
  bool _showSavedAnimation = false;

  void _handleMarking(String status) {
    setState(() {
      _showSavedAnimation = true;
    });
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        setState(() {
          _showSavedAnimation = false;
        });
      }
    });
    widget.onMarked(status);
  }

  @override
  Widget build(BuildContext context) {
    final brand = ref.watch(schoolBrandProvider);
    return Dismissible(
      key: Key(widget.rollNumber),
      background: _buildSwipeBackground(true),
      secondaryBackground: _buildSwipeBackground(false),
      onDismissed: (direction) {
        _handleMarking(direction == DismissDirection.startToEnd ? 'PRESENT' : 'ABSENT');
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12.0),
        child: ClipRRect(
          borderRadius: AppTheme.radiusMedium,
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                borderRadius: AppTheme.radiusMedium,
                border: Border.all(color: brand.primaryColor.withOpacity(0.1)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  StudentAvatar(
                    name: widget.studentName,
                    avatarUrl: widget.avatarUrl,
                    radius: 22,
                    backgroundColor: brand.primaryColor.withOpacity(0.12),
                    textColor: brand.primaryColor,
                  ),
                  const SizedBox(width: 12.0),
                  // Right side: Name on line 1, buttons on line 2
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Line 1: Student Name + Monthly Report icon
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                widget.studentName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontWeight: FontWeight.normal,
                                  fontSize: 13,
                                  letterSpacing: -0.3,
                                ),
                              ),
                            ),
                            GestureDetector(
                              onTap: () => context.push(
                                  '/attendance/monthly/${widget.studentId}'),
                              child: Tooltip(
                                message: 'Monthly Report',
                                child: Container(
                                  width: 28,
                                  height: 28,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF3F4F6),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(
                                    Icons.calendar_month_rounded,
                                    size: 15,
                                    color: Color(0xFF6B7280),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        // Line 2: P A L Buttons
                        Row(
                          mainAxisSize: MainAxisSize.max,
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            _buildActionButton('P', AppTheme.success, widget.status == 'PRESENT', () => _handleMarking('PRESENT')),
                            const SizedBox(width: 10),
                            _buildActionButton('A', AppTheme.danger, widget.status == 'ABSENT', () => _handleMarking('ABSENT')),
                            const SizedBox(width: 10),
                            _buildActionButton('L', AppTheme.warning, widget.status == 'LATE', () => _handleMarking('LATE')),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton(String label, Color color, bool isActive, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutBack,
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: isActive ? color : color.withOpacity(0.05),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isActive ? color : color.withOpacity(0.1),
            width: isActive ? 1.5 : 1,
          ),
          boxShadow: [
              BoxShadow(
                color: isActive ? color.withOpacity(0.3) : Colors.transparent,
                blurRadius: isActive ? 8 : 0,
                offset: const Offset(0, 4),
              ),
            ],
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isActive ? Colors.white : color.withOpacity(0.8),
              fontWeight: FontWeight.w900,
              fontSize: 15,
              letterSpacing: 0.5,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSwipeBackground(bool isPresent) {
    return Container(
      color: isPresent ? AppTheme.success : AppTheme.danger,
      alignment: isPresent ? Alignment.centerLeft : Alignment.centerRight,
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isPresent ? Icons.check_circle_outline : Icons.cancel_outlined,
            color: Colors.white,
            size: 32,
          ),
          Text(
            isPresent ? 'Present' : 'Absent',
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
