import 'package:flutter/material.dart';

class ModuleItem {
  final String title;
  final IconData icon;
  final LinearGradient gradientTheme;
  final int notificationCount;
  final VoidCallback onTap;

  ModuleItem({
    required this.title,
    required this.icon,
    required this.gradientTheme,
    this.notificationCount = 0,
    required this.onTap,
  });
}

class ModuleGrid extends StatelessWidget {
  final List<ModuleItem> modules;

  const ModuleGrid({super.key, required this.modules});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 0.85, // Adjust for icon + text height
      ),
      itemCount: modules.length,
      itemBuilder: (context, index) {
        final module = modules[index];

        return InkWell(
          onTap: module.onTap,
          borderRadius: BorderRadius.circular(20),
          child: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Theme.of(context).dividerColor.withValues(alpha: 0.5)),
            ),
            child: Stack(
              children: [
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: module.gradientTheme.colors.first.withValues(alpha: 0.1),
                        ),
                        child: Icon(module.icon, color: module.gradientTheme.colors.first, size: 28),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        module.title,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                if (module.notificationCount > 0)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(
                        color: Colors.redAccent,
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        module.notificationCount > 99 ? '99+' : module.notificationCount.toString(),
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
