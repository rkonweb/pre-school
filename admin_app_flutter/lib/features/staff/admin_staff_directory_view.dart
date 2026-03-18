import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/state/auth_state.dart';
import '../../core/services/generic_crud_service.dart';

final staffAndRolesProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) return {'staff': [], 'roles': []};
  
  final service = GenericCrudService(token: user!.token);
  final staffRecords = await service.fetchRecords('staff');
  final rolesRecords = await service.fetchRecords('roles');
  
  return {
    'staff': staffRecords,
    'roles': rolesRecords,
  };
});

class AdminStaffDirectoryView extends ConsumerStatefulWidget {
  const AdminStaffDirectoryView({super.key});

  @override
  ConsumerState<AdminStaffDirectoryView> createState() => _AdminStaffDirectoryViewState();
}

class _AdminStaffDirectoryViewState extends ConsumerState<AdminStaffDirectoryView> {
  String _searchQuery = '';
  String _roleFilter = 'All Roles';

  Color _getRoleColor(String? role) {
    if (role == 'ADMIN') return Colors.orange.shade600;
    if (role == 'TEACHER') return Colors.pink.shade600;
    if (role == 'DRIVER') return Colors.blue.shade600;
    if (role == 'STAFF') return Colors.teal.shade600;
    return Colors.grey.shade600;
  }

  Color _getRoleBgColor(String? role) {
    if (role == 'ADMIN') return Colors.orange.shade50;
    if (role == 'TEACHER') return Colors.pink.shade50;
    if (role == 'DRIVER') return Colors.blue.shade50;
    if (role == 'STAFF') return Colors.teal.shade50;
    return Colors.grey.shade50;
  }

  @override
  Widget build(BuildContext context) {
    final dataAsync = ref.watch(staffAndRolesProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF2F0EB),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFAFBFE).withValues(alpha: 0.92),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        automaticallyImplyLeading: false,
        titleSpacing: 20,
        title: Row(
          children: [
            GestureDetector(
              onTap: () => context.pop(),
              child: Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: const Color(0x12140E28)),
                  borderRadius: BorderRadius.circular(13),
                  boxShadow: const [BoxShadow(color: Color(0x0A140E28), blurRadius: 8, offset: Offset(0, 2))],
                ),
                child: const Icon(Icons.arrow_back_rounded, color: Color(0xFF140E28), size: 18),
              ),
            ),
            const SizedBox(width: 12),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Staff Directory', style: TextStyle(fontFamily: 'Clash Display', fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF140E28))),
                Text('Manage all employees', style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF7B7291))),
              ],
            ),
          ],
        ),
      ),
      body: dataAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF140E28))),
        error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.red))),
        data: (data) {
          final List<dynamic> staffList = data['staff'] ?? [];
          final List<dynamic> rolesList = data['roles'] ?? [];
          
          final allRolesSet = <String>{'All Roles'};
          
          // Add all system roles first via backend API 'roles' module
          for (var r in rolesList) {
            allRolesSet.add(r['name']?.toString() ?? '');
          }
          
          // Also fallback add roles explicitly present in staff just in case
          for (var s in staffList) {
            final String assignedRole = s['customRole'] != null ? s['customRole']['name'] : s['role'] ?? 'STAFF';
            allRolesSet.add(assignedRole);
          }
          final dynamicRoles = allRolesSet.where((r) => r.isNotEmpty).toList();
          
          final effectiveRoleFilter = dynamicRoles.contains(_roleFilter) ? _roleFilter : 'All Roles';

          final filtered = staffList.where((s) {
            final name = '${s['firstName']} ${s['lastName']}'.toLowerCase();
            final matchesSearch = _searchQuery.isEmpty || name.contains(_searchQuery.toLowerCase());
            final assignedRole = s['customRole'] != null ? s['customRole']['name'] : s['role'] ?? 'STAFF';
            final matchesRole = effectiveRoleFilter == 'All Roles' || assignedRole == effectiveRoleFilter;
            return matchesSearch && matchesRole;
          }).toList();

          return Column(
            children: [
              // Search & Filter Bar
              Container(
                color: const Color(0xFFFAFBFE).withValues(alpha: 0.92),
                padding: const EdgeInsets.only(left: 20, right: 20, bottom: 16),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 44,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          border: Border.all(color: const Color(0x12140E28)),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: TextField(
                          onChanged: (v) => setState(() => _searchQuery = v),
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                            hintText: 'Search staff',
                            hintStyle: TextStyle(fontFamily: 'Satoshi', fontSize: 13, color: Color(0xFFB5B0C4)),
                            prefixIcon: Icon(Icons.search_rounded, size: 18, color: Color(0xFF7B7291)),
                            contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          ),
                          style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF140E28)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Container(
                      width: 140, // Added fixed width so isExpanded works correctly
                      height: 44,
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: const Color(0x12140E28)),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: effectiveRoleFilter,
                          isExpanded: true,
                          dropdownColor: Colors.white,
                          icon: const Icon(Icons.arrow_drop_down_rounded, size: 20, color: Color(0xFF7B7291)),
                          style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF140E28)),
                          onChanged: (v) {
                            if (v != null) setState(() => _roleFilter = v);
                          },
                          items: dynamicRoles.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) {
                    final p = filtered[i];
                    final name = '${p['firstName'] ?? ''} ${p['lastName'] ?? ''}'.trim();
                    final role = p['customRole'] != null ? p['customRole']['name'] : p['role'] ?? 'STAFF';
                    final dept = p['department'] ?? 'General';
                    final phone = p['phone'] ?? '+91 N/A';
                    final initial = name.isNotEmpty ? name[0].toUpperCase() : '?';

                    return GestureDetector(
                      onTap: () {
                        context.push('/staff/details', extra: p);
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0x12140E28)),
                          boxShadow: const [
                            BoxShadow(color: Color(0x0A140E28), blurRadius: 10, offset: Offset(0, 4)),
                          ],
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: _getRoleBgColor(role),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                initial,
                                style: TextStyle(
                                  fontFamily: 'Clash Display',
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: _getRoleColor(role),
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        name.isEmpty ? 'Unknown' : name,
                                        style: const TextStyle(
                                          fontFamily: 'Satoshi',
                                          fontSize: 15,
                                          fontWeight: FontWeight.w800,
                                          color: Color(0xFF140E28),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: _getRoleBgColor(role),
                                          borderRadius: BorderRadius.circular(100),
                                          border: Border.all(color: _getRoleColor(role).withValues(alpha: 0.2)),
                                        ),
                                        child: Text(
                                          role,
                                          style: TextStyle(
                                            fontFamily: 'Satoshi',
                                            fontSize: 9,
                                            fontWeight: FontWeight.w800,
                                            color: _getRoleColor(role),
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    dept,
                                    style: const TextStyle(
                                      fontFamily: 'Satoshi',
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF7B7291),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.phone_rounded, size: 12, color: Color(0xFFB5B0C4)),
                                      const SizedBox(width: 4),
                                      Text(
                                        phone,
                                        style: const TextStyle(
                                          fontFamily: 'Space Mono',
                                          fontSize: 11,
                                          fontWeight: FontWeight.w500,
                                          color: Color(0xFF7B7291),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ));
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
