import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/components/quick_action_grid.dart';
import '../../shared/components/custom_list_item.dart';

class AdminDashboardView extends StatelessWidget {
  const AdminDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Quick Actions', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 18)),
        const SizedBox(height: 16),
        QuickActionGrid(
          actions: [
            QuickActionItem(
              label: 'Approve\nLeave',
              icon: Icons.check_circle_outline,
              baseColor: const Color(0xFF10B981),
              onTap: () {},
            ),
            QuickActionItem(
              label: 'Manage\nFees',
              icon: Icons.monetization_on,
              baseColor: const Color(0xFFF59E0B),
              onTap: () {},
            ),
            QuickActionItem(
              label: 'Staff\nDirectory',
              icon: Icons.contact_phone,
              baseColor: const Color(0xFF3B82F6),
              onTap: () {},
            ),
            QuickActionItem(
              label: 'Broadcast\nAlert',
              icon: Icons.campaign,
              baseColor: const Color(0xFFEF4444),
              onTap: () {},
            ),
          ],
        ),
        const SizedBox(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Pending Approvals', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 18)),
            TextButton(onPressed: () {}, child: const Text('View All', style: TextStyle(fontSize: 12))),
          ],
        ),
        const SizedBox(height: 8),
        CustomListItem(
          title: 'Leave Request: Sarah J.',
          subtitle: 'Medical leave requested for Oct 12 - Oct 14.',
          time: '2 hrs ago',
          icon: Icons.person_off,
          themeGradient: AppTheme.adminTheme,
          onTap: () {},
        ),
        const SizedBox(height: 12),
        CustomListItem(
          title: 'Purchase Order #1042',
          subtitle: 'New lab equipment requisitions from Science Dept.',
          time: '5 hrs ago',
          icon: Icons.shopping_cart,
          themeGradient: AppTheme.hrManagerTheme,
          onTap: () {},
        ),
      ],
    );
  }
}
