import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/components/quick_action_grid.dart';
import '../../shared/components/custom_list_item.dart';

class DriverDashboardView extends StatelessWidget {
  const DriverDashboardView({super.key});

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
              label: 'Start\nRoute',
              icon: Icons.play_arrow,
              baseColor: const Color(0xFF3B82F6),
              onTap: () {},
            ),
            QuickActionItem(
              label: 'Scan\nStudent',
              icon: Icons.qr_code_scanner,
              baseColor: const Color(0xFF10B981),
              onTap: () {},
            ),
            QuickActionItem(
              label: 'Vehicle\nCheck',
              icon: Icons.car_repair,
              baseColor: const Color(0xFFF59E0B),
              onTap: () {},
            ),
            QuickActionItem(
              label: 'SOS\nAlert',
              icon: Icons.warning,
              baseColor: const Color(0xFFEF4444),
              onTap: () {},
            ),
          ],
        ),
        const SizedBox(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Current Route', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 18)),
            TextButton(onPressed: () {}, child: const Text('Map', style: TextStyle(fontSize: 12))),
          ],
        ),
        const SizedBox(height: 8),
        CustomListItem(
          title: 'Route 42 - Morning Pickup',
          subtitle: 'Next stop: 4th Ave & Elm St (3 mins away)',
          time: 'On Time',
          icon: Icons.directions_bus,
          themeGradient: AppTheme.driverTheme,
          onTap: () {},
        ),
        const SizedBox(height: 12),
        CustomListItem(
          title: 'Route Updates',
          subtitle: 'Main street is cleared. Proceed normally.',
          time: '07:15 AM',
          icon: Icons.info_outline,
          themeGradient: AppTheme.adminTheme,
          onTap: () {},
        ),
      ],
    );
  }
}
