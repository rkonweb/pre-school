import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import 'package:go_router/go_router.dart';

/// CommandPalette is a global BottomSheet launcher optimized for 2-tap tasks.
/// Invoked typically by a downward swipe or a dedicated FAB.
class CommandPalette extends StatefulWidget {
  final List<CommandItem> availableCommands;

  const CommandPalette({Key? key, required this.availableCommands})
      : super(key: key);

  static void show(BuildContext context, List<CommandItem> commands) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CommandPalette(availableCommands: commands),
    );
  }

  @override
  State<CommandPalette> createState() => _CommandPaletteState();
}

class _CommandPaletteState extends State<CommandPalette> {
  final TextEditingController _searchController = TextEditingController();
  List<CommandItem> _filteredCommands = [];

  @override
  void initState() {
    super.initState();
    _filteredCommands = widget.availableCommands;
    _searchController.addListener(_onSearchChanged);
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredCommands = widget.availableCommands
          .where((cmd) =>
              cmd.title.toLowerCase().contains(query) ||
              (cmd.keywords?.any((kw) => kw.toLowerCase().contains(query)) ??
                  false))
          .toList();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: Column(
        children: [
          // Drag Handle
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppTheme.border,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: AppTheme.s16),

          // Smart Search Input
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppTheme.s24),
            child: TextField(
              controller: _searchController,
              autofocus: true,
              style: const TextStyle(fontSize: 18),
              decoration: InputDecoration(
                hintText: 'What do you need to do?',
                prefixIcon: const Icon(Icons.search, color: AppTheme.primary),
                filled: true,
                fillColor: AppTheme.background,
                border: OutlineInputBorder(
                  borderRadius: AppTheme.radiusMedium,
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
          const SizedBox(height: AppTheme.s16),

          // Results List
          Expanded(
            child: ListView.separated(
              itemCount: _filteredCommands.length,
              separatorBuilder: (context, index) =>
                  const Divider(height: 1, indent: 64, color: AppTheme.border),
              itemBuilder: (context, index) {
                final cmd = _filteredCommands[index];
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: AppTheme.s24, vertical: 4),
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: cmd.color?.withOpacity(0.1) ??
                          AppTheme.primaryLight.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(cmd.icon,
                        color: cmd.color ?? AppTheme.primary, size: 24),
                  ),
                  title: Text(cmd.title,
                      style: const TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 16)),
                  subtitle: cmd.subtitle != null
                      ? Text(cmd.subtitle!,
                          style: TextStyle(color: AppTheme.textMuted))
                      : null,
                  onTap: () {
                    Navigator.pop(context); // Close palette
                    cmd.onExecute(context); // Execute action or route
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class CommandItem {
  final String title;
  final String? subtitle;
  final IconData icon;
  final Color? color;
  final List<String>? keywords;
  final Function(BuildContext) onExecute;

  CommandItem({
    required this.title,
    required this.icon,
    required this.onExecute,
    this.subtitle,
    this.color,
    this.keywords,
  });
}
