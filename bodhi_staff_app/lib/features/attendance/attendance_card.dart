import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class AttendanceStudentCard extends StatefulWidget {
  final String studentName;
  final String rollNumber;
  final String? avatarUrl;
  final String? status;
  final Function(String status) onMarked;

  const AttendanceStudentCard({
    Key? key,
    required this.studentName,
    required this.rollNumber,
    required this.onMarked,
    this.avatarUrl,
    this.status,
  }) : super(key: key);

  @override
  State<AttendanceStudentCard> createState() => _AttendanceStudentCardState();
}

class _AttendanceStudentCardState extends State<AttendanceStudentCard> {
  bool _showSavedAnimation = false;

  void _handleMarking(String status) {
    setState(() {
      _showSavedAnimation = true;
    });

    // Simulate animation playing before fully committing UX change
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
    return Dismissible(
      key: Key(widget.rollNumber),
      // Swipe Right = Present, Swipe Left = Absent
      background: _buildSwipeBackground(true),
      secondaryBackground: _buildSwipeBackground(false),
      onDismissed: (direction) {
        _handleMarking(direction == DismissDirection.startToEnd ? 'PRESENT' : 'ABSENT');
      },
      child: Container(
        padding: const EdgeInsets.all(AppTheme.s16),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          border: Border(bottom: BorderSide(color: AppTheme.border)),
        ),
        child: Row(
          children: [
            // Avatar
            CircleAvatar(
              radius: 20,
              backgroundColor: AppTheme.background,
              child: ClipOval(
                child: widget.avatarUrl != null
                    ? Image.network(
                        widget.avatarUrl!.startsWith('http')
                            ? widget.avatarUrl!
                            : 'http://localhost:3000${widget.avatarUrl!.startsWith('/') ? '' : '/'}${widget.avatarUrl}',
                        width: 40,
                        height: 40,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Center(
                          child: Text(widget.studentName[0].toUpperCase(),
                              style:
                                  const TextStyle(color: AppTheme.primaryDark)),
                        ),
                      )
                    : Center(
                        child: Text(widget.studentName[0].toUpperCase(),
                            style:
                                const TextStyle(color: AppTheme.primaryDark)),
                      ),
              ),
            ),
            const SizedBox(width: AppTheme.s16),

            // Name / Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.studentName,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 16),
                  ),
                  Text(
                    'Roll: ' + widget.rollNumber,
                    style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                  ),
                ],
              ),
            ),

            // Marking Buttons (Explicit)
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildActionButton('P', AppTheme.success, widget.status == 'PRESENT', () => _handleMarking('PRESENT')),
                const SizedBox(width: 8),
                _buildActionButton('A', AppTheme.danger, widget.status == 'ABSENT', () => _handleMarking('ABSENT')),
                const SizedBox(width: 8),
                _buildActionButton('L', AppTheme.warning, widget.status == 'LATE', () => _handleMarking('LATE')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(String label, Color color, bool isActive, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: isActive ? color : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isActive ? color : AppTheme.border),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isActive ? Colors.white : color.withOpacity(0.7),
              fontWeight: FontWeight.bold,
              fontSize: 14,
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
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.s24),
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
            style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.bold),
          )
        ],
      ),
    );
  }
}
