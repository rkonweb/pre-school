import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import '../theme/school_brand_provider.dart';

class GlobalHeader extends ConsumerWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;

  const GlobalHeader({Key? key, required this.title, this.actions}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brand = ref.watch(schoolBrandProvider);

    return AppBar(
      title: Text(title, style: TextStyle(color: brand.secondaryColor, fontWeight: FontWeight.bold, fontSize: 18)),
      backgroundColor: brand.primaryColor,
      elevation: 0,
      centerTitle: false,
      leading: IconButton(
        icon: Icon(Icons.menu, color: brand.secondaryColor),
        onPressed: () {
          // Try to open drawer if one exists
          if (Scaffold.maybeOf(context)?.hasDrawer ?? false) {
             Scaffold.of(context).openDrawer();
          }
        },
      ),
      iconTheme: IconThemeData(color: brand.secondaryColor),
      actionsIconTheme: IconThemeData(color: brand.secondaryColor),
      actions: [
        IconButton(
          icon: Icon(Icons.chat_bubble_outline, color: brand.secondaryColor, size: 22),
          onPressed: () {},
        ),
        IconButton(
          icon: Icon(Icons.notifications_none, color: brand.secondaryColor, size: 22),
          onPressed: () {},
        ),
        if (actions != null) 
          ...actions!.map((action) => Theme(
            data: Theme.of(context).copyWith(
              iconTheme: IconThemeData(color: brand.secondaryColor),
            ),
            child: action,
          )),
        const SizedBox(width: 8),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1.0),
        child: Container(
          color: Colors.black.withOpacity(0.05),
          height: 1.0,
        ),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
