import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/registry/module_registry.dart';
import '../../core/state/quick_actions_provider.dart';

class CustomiseQuickActionsSheet extends ConsumerWidget {
  const CustomiseQuickActionsSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const CustomiseQuickActionsSheet(),
    );
  }

  void _toggle(BuildContext context, WidgetRef ref, String key) {
    var selectedKeys = List<String>.from(ref.read(quickActionsProvider));
    
    if (selectedKeys.contains(key)) {
      selectedKeys.remove(key);
    } else {
      if (selectedKeys.length >= 12) {
         ScaffoldMessenger.of(context).showSnackBar(
           const SnackBar(content: Text('You can only select up to 12 quick actions.'))
         );
         return;
      }
      selectedKeys.add(key);
    }
    
    // Save state instantly for immediate realtime dashboard UI updates!
    ref.read(quickActionsProvider.notifier).saveActions(selectedKeys);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final modules = ModuleRegistry.allModules.where((m) => m.key != 'dashboard').toList();
    final selectedKeys = ref.watch(quickActionsProvider);

    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                 const Text('Customise Quick Actions', style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 18, fontWeight: FontWeight.bold)),
                 TextButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    child: const Text('Done', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                 )
              ],
            ),
          ),
          const Divider(),
          Expanded(
            child: ListView.builder(
              itemCount: modules.length,
              itemBuilder: (context, index) {
                final m = modules[index];
                final isSelected = selectedKeys.contains(m.key);
                return CheckboxListTile(
                  title: Text(m.label, style: const TextStyle(fontWeight: FontWeight.w600)),
                  secondary: Icon(m.icon, color: m.color),
                  value: isSelected,
                  onChanged: (_) => _toggle(context, ref, m.key),
                  activeColor: const Color(0xFF6366F1),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
