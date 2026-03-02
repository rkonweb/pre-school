import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class RoleHeaderCard extends StatelessWidget {
  final String staffName;
  final String role;
  final String branchName;
  final String? profileImageUrl;

  const RoleHeaderCard({
    Key? key,
    required this.staffName,
    required this.role,
    required this.branchName,
    this.profileImageUrl,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.s16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: AppTheme.radiusLarge,
        boxShadow: AppTheme.softShadow,
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          // Profile Image / Fallback Avatar
          CircleAvatar(
            radius: 28,
            backgroundColor: AppTheme.primaryLight.withOpacity(0.2),
            backgroundImage:
                profileImageUrl != null ? NetworkImage(profileImageUrl!) : null,
            child: profileImageUrl == null
                ? Text(
                    staffName.isNotEmpty ? staffName[0].toUpperCase() : 'S',
                    style: const TextStyle(
                      color: AppTheme.primaryDark,
                      fontWeight: FontWeight.bold,
                      fontSize: 24,
                    ),
                  )
                : null,
          ),
          const SizedBox(width: AppTheme.s16),

          // Staff Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Good Morning,',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppTheme.textMuted,
                        fontSize: 12,
                      ),
                ),
                Text(
                  staffName,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                        fontSize: 18,
                      ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppTheme.s4),

                // Role & Branch Chips
                Row(
                  children: [
                    _buildChip(role, AppTheme.primary,
                        AppTheme.primaryLight.withOpacity(0.1)),
                    const SizedBox(width: AppTheme.s8),
                    _buildChip(branchName, AppTheme.textMuted, AppTheme.border),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String label, Color textColor, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: AppTheme.s8, vertical: AppTheme.s4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: textColor,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
