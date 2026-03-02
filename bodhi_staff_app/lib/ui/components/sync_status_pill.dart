import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class SyncStatusPill extends StatelessWidget {
  final SyncState state;

  const SyncStatusPill({Key? key, required this.state}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;
    String label;
    IconData icon;

    switch (state) {
      case SyncState.online:
        bgColor = AppTheme.success.withOpacity(0.15);
        textColor = AppTheme.success;
        label = 'Online';
        icon = Icons.cloud_done_rounded;
        break;
      case SyncState.offline:
        bgColor = AppTheme.warning.withOpacity(0.15);
        textColor = AppTheme.warning;
        label = 'Offline (Queued)';
        icon = Icons.cloud_off_rounded;
        break;
      case SyncState.syncing:
        bgColor = AppTheme.primaryLight.withOpacity(0.15);
        textColor = AppTheme.primaryDark;
        label = 'Syncing...';
        icon = Icons.sync_rounded;
        break;
      case SyncState.error:
        bgColor = AppTheme.danger.withOpacity(0.15);
        textColor = AppTheme.danger;
        label = 'Sync Error';
        icon = Icons.error_outline_rounded;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: AppTheme.s8, vertical: AppTheme.s4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (state == SyncState.syncing)
            SizedBox(
              width: 12,
              height: 12,
              child:
                  CircularProgressIndicator(strokeWidth: 2, color: textColor),
            )
          else
            Icon(icon, size: 14, color: textColor),
          const SizedBox(width: AppTheme.s4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}

enum SyncState { online, offline, syncing, error }
