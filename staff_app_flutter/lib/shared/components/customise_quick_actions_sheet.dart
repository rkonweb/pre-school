import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/registry/module_registry.dart';
import '../../core/state/quick_actions_provider.dart';
import '../../core/state/auth_state.dart';

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
    HapticFeedback.selectionClick();
    var rawSelected = List<String>.from(ref.read(quickActionsProvider));
    final user = ref.read(userProfileProvider);
    final activeRole = ref.read(activeRoleProvider);

    var selectedKeys = rawSelected.where((k) {
      final module = ModuleRegistry.allModules.firstWhere(
        (m) => m.key == k,
        orElse: () => const ModuleItem(key: '', label: '', icon: Icons.error, color: Colors.red, route: ''),
      );
      return module.key.isNotEmpty && _canAccessModule(module, user, activeRole);
    }).toList();

    if (selectedKeys.contains(key)) {
      selectedKeys.remove(key);
    } else {
      if (selectedKeys.length >= 11) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            behavior: SnackBarBehavior.floating,
            backgroundColor: const Color(0xFF1E1B58),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            content: const Text('Max 11 quick actions allowed',
                style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700)),
          ),
        );
        return;
      }
      selectedKeys.add(key);
    }
    ref.read(quickActionsProvider.notifier).saveActions(selectedKeys);
  }

  bool _canAccessModule(ModuleItem m, UserProfile? user, String activeRole) {
    if (user == null) return false;
    final role = activeRole.toUpperCase();
    if (role == 'ADMIN' || role == 'SUPER_ADMIN') return true;
    if (user.permissions.isEmpty) {
      if (role == 'TEACHER' || role == 'STAFF') {
        const teacherModules = ['dashboard', 'attendance', 'self_attendance', 'homework', 'schedule', 'communication', 'leave', 'diary', 'ptm'];
        return teacherModules.contains(m.key);
      }
      if (role == 'DRIVER') {
        const driverModules = ['dashboard', 'transport', 'communication', 'leave'];
        return driverModules.contains(m.key);
      }
      return ['dashboard', 'leave', 'communication'].contains(m.key);
    }
    return user.permissions.any((p) => p.startsWith('${m.key}.'));
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProfileProvider);
    final activeRole = ref.watch(activeRoleProvider);
    final modules = ModuleRegistry.allModules
        .where((m) => m.key != 'dashboard' && _canAccessModule(m, user, activeRole))
        .toList();
    final selectedKeys = ref.watch(quickActionsProvider);
    final selectedCount = selectedKeys.where((k) => modules.any((m) => m.key == k)).length;

    return Container(
      height: MediaQuery.of(context).size.height * 0.78,
      decoration: const BoxDecoration(
        color: Color(0xFFF9FAFB),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          // ── Handle ──
          const SizedBox(height: 10),
          Container(
            width: 44, height: 5,
            decoration: BoxDecoration(
              color: const Color(0xFFE2E8F0),
              borderRadius: BorderRadius.circular(100),
            ),
          ),

          // ── Header ──
          Container(
            margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF140E28), Color(0xFF2D1B5E)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF140E28).withOpacity(0.25),
                  blurRadius: 20,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Row(children: [
              // Icon
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.tune_rounded, color: Colors.white, size: 22),
              ),
              const SizedBox(width: 14),
              // Title + subtitle
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Quick Actions',
                      style: TextStyle(fontFamily: 'Clash Display', fontSize: 17, fontWeight: FontWeight.w800, color: Colors.white)),
                  Text('$selectedCount of ${modules.length} selected',
                      style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white.withOpacity(0.55))),
                ]),
              ),
              // Done button
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFFF5733), Color(0xFFFF006E)],
                    ),
                    borderRadius: BorderRadius.circular(100),
                    boxShadow: [
                      BoxShadow(color: const Color(0xFFFF5733).withOpacity(0.4), blurRadius: 12, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: const Text('Done',
                      style: TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white)),
                ),
              ),
            ]),
          ),

          // ── Subtitle hint ──
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 4),
            child: Row(children: [
              const Icon(Icons.touch_app_rounded, size: 13, color: Color(0xFF94A3B8)),
              const SizedBox(width: 6),
              Text('Tap to toggle modules in your Quick Actions bar',
                  style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w600, color: Colors.grey.shade500)),
            ]),
          ),

          // ── Grid ──
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 32),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.9,
              ),
              itemCount: modules.length,
              itemBuilder: (context, index) {
                final m = modules[index];
                final isSelected = selectedKeys.contains(m.key);
                return _ModuleCard(
                  module: m,
                  isSelected: isSelected,
                  onTap: () => _toggle(context, ref, m.key),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Individual animated module card ────────────────────────────────────────
class _ModuleCard extends StatefulWidget {
  final ModuleItem module;
  final bool isSelected;
  final VoidCallback onTap;
  const _ModuleCard({required this.module, required this.isSelected, required this.onTap});
  @override
  State<_ModuleCard> createState() => _ModuleCardState();
}

class _ModuleCardState extends State<_ModuleCard> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 180));
    _scale = Tween<double>(begin: 1, end: 0.93)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _handleTap() {
    _ctrl.forward().then((_) => _ctrl.reverse());
    widget.onTap();
  }

  @override
  Widget build(BuildContext context) {
    final sel = widget.isSelected;
    final color = widget.module.color;

    return AnimatedBuilder(
      animation: _scale,
      builder: (_, child) => Transform.scale(scale: _scale.value, child: child),
      child: GestureDetector(
        onTap: _handleTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeInOut,
          decoration: BoxDecoration(
            color: sel ? color.withOpacity(0.08) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: sel ? color.withOpacity(0.5) : const Color(0xFFE8EAF0),
              width: sel ? 2 : 1.5,
            ),
            boxShadow: sel
                ? [BoxShadow(color: color.withOpacity(0.18), blurRadius: 14, offset: const Offset(0, 4))]
                : [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 3))],
          ),
          child: Stack(
            children: [
              // Content
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Icon circle
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 220),
                      width: 48, height: 48,
                      decoration: BoxDecoration(
                        color: sel ? color.withOpacity(0.15) : color.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(widget.module.icon, size: 24,
                          color: sel ? color : color.withOpacity(0.65)),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      widget.module.label,
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 11,
                        fontWeight: sel ? FontWeight.w800 : FontWeight.w600,
                        color: sel ? const Color(0xFF140E28) : const Color(0xFF64748B),
                        height: 1.2,
                      ),
                    ),
                  ],
                ),
              ),

              // Selection checkmark badge
              AnimatedPositioned(
                duration: const Duration(milliseconds: 200),
                curve: Curves.easeOut,
                top: sel ? 8 : 4,
                right: sel ? 8 : 4,
                child: AnimatedOpacity(
                  duration: const Duration(milliseconds: 200),
                  opacity: sel ? 1 : 0,
                  child: Container(
                    width: 20, height: 20,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                      boxShadow: [BoxShadow(color: color.withOpacity(0.35), blurRadius: 6, offset: const Offset(0, 2))],
                    ),
                    child: const Icon(Icons.check_rounded, size: 12, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
