import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class QuickActionTile extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;
  final VoidCallback? onLongPress;
  final Color? color;

  const QuickActionTile({
    Key? key,
    required this.label,
    required this.icon,
    required this.onTap,
    this.onLongPress,
    this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        onLongPress: onLongPress,
        borderRadius: AppTheme.radiusMedium, // More rounded borders
        child: Container(
          padding: const EdgeInsets.all(AppTheme.s16), // More padding
          decoration: BoxDecoration(
            color: color ?? AppTheme.surface, // Full solid pastel color
            borderRadius: AppTheme.radiusMedium,
            boxShadow: AppTheme.softShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, // Align to left like dribble
            mainAxisAlignment: MainAxisAlignment.spaceBetween, // Space out icon and text
            children: [
              // White circle enclosing the icon
              Container(
                padding: const EdgeInsets.all(AppTheme.s8),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: AppTheme.textPrimary, size: 24),
              ),
              Text(
                label,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
