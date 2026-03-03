import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../theme/school_brand_provider.dart';
import '../routing/drawer_provider.dart';

class GlobalHeader extends ConsumerWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final bool showChat;
  final bool showNotifications;
  final bool showBackButton;
  final Color? backgroundColor;
  final bool useGradient;

  final PreferredSizeWidget? bottom;

  const GlobalHeader({
    Key? key,
    required this.title,
    this.actions,
    this.showChat = true,
    this.showNotifications = true,
    this.showBackButton = false,
    this.backgroundColor,
    this.useGradient = false,
    this.bottom,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brand = ref.watch(schoolBrandProvider);

    return AppBar(
      title: Text(title, style: TextStyle(color: brand.secondaryColor, fontWeight: FontWeight.w900, fontSize: 19, letterSpacing: -0.5)),
      backgroundColor: useGradient ? Colors.transparent : (backgroundColor ?? brand.primaryColor).withOpacity(0.9),
      flexibleSpace: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: useGradient ? Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  brand.primaryColor.withOpacity(0.9),
                  brand.primaryColor.withBlue(brand.primaryColor.blue + 30).withRed(brand.primaryColor.red - 10).withOpacity(0.9),
                ],
              ),
            ),
          ) : Container(color: Colors.transparent),
        ),
      ),
      elevation: 0,
      centerTitle: false,
      leading: showBackButton 
        ? IconButton(
            icon: Icon(Icons.arrow_back_ios_new_rounded, color: brand.secondaryColor),
            onPressed: () => context.pop(),
          )
        : IconButton(
            icon: Icon(Icons.menu, color: brand.secondaryColor),
            onPressed: () {
              ref.read(shellScaffoldKeyProvider).currentState?.openDrawer();
            },
          ),
      iconTheme: IconThemeData(color: brand.secondaryColor),
      actionsIconTheme: IconThemeData(color: brand.secondaryColor),
      actions: [
        if (showChat)
          IconButton(
            icon: Icon(Icons.chat_bubble_outline, color: brand.secondaryColor, size: 22),
            onPressed: () {},
          ),
        if (showNotifications)
          IconButton(
            icon: Icon(Icons.notifications_none, color: brand.secondaryColor, size: 22),
            onPressed: () => ref.read(shellScaffoldKeyProvider).currentState?.openDrawer(), // or navigate to inbox
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
      bottom: bottom ?? PreferredSize(
        preferredSize: const Size.fromHeight(1.0),
        child: Container(
          color: Colors.black.withOpacity(0.05),
          height: 1.0,
        ),
      ),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(kToolbarHeight + (bottom?.preferredSize.height ?? 0));
}
