import 'package:flutter/material.dart';
import 'generic_crud_form.dart';
import '../../core/registry/module_registry.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/state/generic_crud_provider.dart';
import 'top_nav_bell.dart';

class GenericCrudPage extends ConsumerWidget {
  final String moduleKey;

  const GenericCrudPage({super.key, required this.moduleKey});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final module = ModuleRegistry.allModules.firstWhere((m) => m.key == moduleKey, 
      orElse: () => const ModuleItem(key: 'unknown', label: 'Unknown', icon: Icons.help, color: Colors.grey));
    
    final asyncData = ref.watch(apiCrudProvider(moduleKey));
    return asyncData.when(
      data: (data) => _buildScaffold(context, ref, module, data),
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (err, stack) => Scaffold(body: Center(child: Text('Error: $err'))),
    );
  }

  Widget _buildScaffold(BuildContext context, WidgetRef ref, ModuleItem module, List<Map<String, dynamic>> data) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(module.label, style: const TextStyle(fontFamily: 'Cabinet Grotesk', fontWeight: FontWeight.w800)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF140E28),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.read(apiCrudProvider(moduleKey).notifier).refresh(),
          ),
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: Color(0xFF140E28)),
            onPressed: () => _openAddForm(context, ref, module),
          ),
          const TopNavBell(badgeText: '3'),
          const SizedBox(width: 8),
        ],
      ),
      body: data.isEmpty 
        ? _buildEmptyState()
        : ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            itemCount: data.length,
            itemBuilder: (context, index) {
              final item = data[index];
              return _buildListItem(context, ref, module, item);
            },
          ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey[300]),
          const SizedBox(height: 16),
          const Text('No records found', style: TextStyle(fontFamily: 'Satoshi', color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildListItem(BuildContext context, WidgetRef ref, ModuleItem module, Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        title: Text(
          item['firstName'] != null 
            ? '${item['firstName']} ${item['lastName'] ?? ''}' 
            : (item['name'] ?? item['studentName'] ?? 'Unnamed Record'),
          style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w800, color: Color(0xFF140E28)),
        ),
        subtitle: Text(
          item['admissionNumber'] != null 
            ? 'ID: ${item['admissionNumber']} • ${item['grade'] ?? ''}'
            : (item['role'] ?? item['status'] ?? item['grade'] ?? ''),
          style: const TextStyle(fontFamily: 'Satoshi', fontSize: 12, color: Color(0xFF7B7291)),
        ),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFF43F5E), size: 20),
          onPressed: () {
            ref.read(apiCrudProvider(moduleKey).notifier).deleteRecord(item['id']);
          },
        ),
      ),
    );
  }

  void _openAddForm(BuildContext context, WidgetRef ref, ModuleItem module) {
    if (module.fields == null || module.fields!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Form configuration not found for this module.'))
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => GenericCrudForm(
          title: 'Add ${module.label}',
          fields: module.fields!,
          onSubmit: (formData) async {
            try {
              await ref.read(apiCrudProvider(moduleKey).notifier).addRecord(formData);
              if (!context.mounted) return;
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Record added successfully!'))
              );
            } catch (e) {
              if (!context.mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Error: $e'))
              );
            }
          },
        ),
      ),
    );
  }
}
