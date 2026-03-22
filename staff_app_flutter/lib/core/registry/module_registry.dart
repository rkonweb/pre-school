import 'package:flutter/material.dart';
import '../../shared/components/generic_crud_form.dart';

class ModuleItem {
  final String key;
  final String label;
  final IconData icon;
  final Color color;
  final String route;
  final List<FormFieldConfig>? fields;

  const ModuleItem({
    required this.key,
    required this.label,
    required this.icon,
    required this.color,
    this.route = '',
    this.fields,
  });
}

class ModuleRegistry {
  static const List<ModuleItem> allModules = [
    ModuleItem(
      key: 'dashboard',
      label: 'Dashboard',
      icon: Icons.dashboard_rounded,
      color: Color(0xFF6366F1),
      route: '/dashboard',
    ),
    ModuleItem(
      key: 'admissions',
      label: 'Admissions',
      icon: Icons.person_add_rounded,
      color: Color(0xFF10B981),
      route: '/admissions',
    ),
    ModuleItem(
      key: 'students',
      label: 'Students',
      icon: Icons.school_rounded,
      color: Color(0xFF3B82F6),
      route: '/students',
      fields: [
        FormFieldConfig(key: 'firstName', label: 'First Name', required: true),
        FormFieldConfig(key: 'lastName', label: 'Last Name', required: true),
        FormFieldConfig(key: 'admissionNumber', label: 'Admission Number'),
        FormFieldConfig(key: 'grade', label: 'Grade', type: FormFieldType.dropdown, options: ['Pre-K', 'K1', 'K2', 'Grade 1', 'Grade 2']),
        FormFieldConfig(key: 'gender', label: 'Gender', type: FormFieldType.dropdown, options: ['Male', 'Female', 'Other']),
        FormFieldConfig(key: 'parentName', label: 'Parent Name', required: true),
        FormFieldConfig(key: 'parentMobile', label: 'Parent Mobile', type: FormFieldType.number, required: true),
        FormFieldConfig(key: 'status', label: 'Status', type: FormFieldType.dropdown, options: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'WITHDRAWN']),
      ],
    ),
    ModuleItem(
      key: 'attendance',
      label: 'Attendance',
      icon: Icons.how_to_reg_rounded,
      color: Color(0xFF4ECDC4),
      route: '/attendance',
    ),
    ModuleItem(
      key: 'academics',
      label: 'Academics',
      icon: Icons.auto_stories_rounded,
      color: Color(0xFFF59E0B),
      route: '/academics',
    ),
    ModuleItem(
      key: 'diary',
      label: 'Diary',
      icon: Icons.edit_note_rounded,
      color: Color(0xFF8B5CF6),
      route: '/diary',
    ),
    ModuleItem(
      key: 'leave',
      label: 'Leave',
      icon: Icons.check_circle_outline_rounded,
      color: Color(0xFFF97316),
      route: '/leave',
    ),
    ModuleItem(
      key: 'staff',
      label: 'Staff Management',
      icon: Icons.people_alt_rounded,
      color: Color(0xFFEC4899),
      route: '/staff',
      fields: [
        FormFieldConfig(key: 'name', label: 'Full Name', required: true),
        FormFieldConfig(key: 'role', label: 'Role', type: FormFieldType.dropdown, options: ['TEACHER', 'ADMIN', 'DRIVER', 'STAFF']),
        FormFieldConfig(key: 'phone', label: 'Mobile Number', type: FormFieldType.number, required: true),
        FormFieldConfig(key: 'branch', label: 'Branch', type: FormFieldType.dropdown, options: ['Main Branch', 'North Wing']),
      ],
    ),
    ModuleItem(
      key: 'billing',
      label: 'Billing & Finance',
      icon: Icons.account_balance_wallet_rounded,
      color: Color(0xFF166534),
      route: '/billing',
      fields: [
        FormFieldConfig(key: 'feeHead', label: 'Fee Head', type: FormFieldType.dropdown, options: ['Tuition Fee', 'Transport Fee', 'Activity Fee']),
        FormFieldConfig(key: 'amount', label: 'Amount', type: FormFieldType.number, required: true),
        FormFieldConfig(key: 'dueDate', label: 'Due Date', type: FormFieldType.date),
        FormFieldConfig(key: 'status', label: 'Status', type: FormFieldType.dropdown, options: ['Paid', 'Pending', 'Overdue']),
      ],
    ),
    ModuleItem(
      key: 'communication',
      label: 'Circulars',
      icon: Icons.campaign_rounded,
      color: Color(0xFFF43F5E),
      route: '/circular',
    ),
    ModuleItem(
      key: 'transport',
      label: 'Transport',
      icon: Icons.directions_bus_rounded,
      color: Color(0xFF7C3AED),
      route: '/transport',
    ),
    ModuleItem(
      key: 'inventory',
      label: 'School Inventory',
      icon: Icons.inventory_2_rounded,
      color: Color(0xFF64748B),
      route: '/inventory',
      fields: [
        FormFieldConfig(key: 'itemName', label: 'Item Name', required: true),
        FormFieldConfig(key: 'category', label: 'Category', type: FormFieldType.dropdown, options: ['Stationery', 'Furniture', 'Lab Equipment']),
        FormFieldConfig(key: 'quantity', label: 'Quantity', type: FormFieldType.number, required: true),
        FormFieldConfig(key: 'location', label: 'Storage location', initialValue: 'Main Store'),
      ],
    ),
    ModuleItem(
      key: 'accounts',
      label: 'Accounts & Finance',
      icon: Icons.account_balance_rounded,
      color: Color(0xFF0F172A),
      route: '/accounts',
    ),
    ModuleItem(
      key: 'library',
      label: 'Library',
      icon: Icons.local_library_rounded,
      color: Color(0xFF4F46E5),
      route: '/library',
    ),
    ModuleItem(
      key: 'hr',
      label: 'Human Resources',
      icon: Icons.badge_rounded,
      color: Color(0xFF0EA5E9),
      route: '/hr',
    ),
    ModuleItem(
      key: 'extracurricular',
      label: 'Extracurricular',
      icon: Icons.sports_basketball_rounded,
      color: Color(0xFFF97316),
      route: '/extracurricular',
    ),
    ModuleItem(
      key: 'homework',
      label: 'Homework',
      icon: Icons.menu_book_rounded,
      color: Color(0xFFFB923C),
      route: '/homework',
    ),
    ModuleItem(
      key: 'ptm',
      label: 'PTM Sessions',
      icon: Icons.groups_rounded,
      color: Color(0xFFF43F5E),
      route: '/ptm',
    ),
    ModuleItem(
      key: 'parent-requests',
      label: 'Parent Requests',
      icon: Icons.contact_support_rounded,
      color: Color(0xFF10B981),
      route: '/parent-requests',
    ),
    ModuleItem(
      key: 'canteen',
      label: 'Canteen',
      icon: Icons.restaurant_rounded,
      color: Color(0xFFE11D48),
      route: '/canteen',
    ),
    ModuleItem(
      key: 'hostel',
      label: 'Hostel',
      icon: Icons.hotel_rounded,
      color: Color(0xFF9333EA),
      route: '/hostel',
    ),
    ModuleItem(
      key: 'store',
      label: 'School Store',
      icon: Icons.storefront_rounded,
      color: Color(0xFF0891B2),
      route: '/store',
    ),
    ModuleItem(
      key: 'training',
      label: 'Training Center',
      icon: Icons.model_training_rounded,
      color: Color(0xFF475569),
      route: '/training',
    ),
    ModuleItem(
      key: 'marketing',
      label: 'Marketing',
      icon: Icons.moving_rounded,
      color: Color(0xFFBE123C),
      route: '/marketing',
    ),
    ModuleItem(
      key: 'events',
      label: 'Events & Calendar',
      icon: Icons.event_note_rounded,
      color: Color(0xFF059669),
      route: '/events',
    ),
    ModuleItem(
      key: 'documents',
      label: 'Documents',
      icon: Icons.folder_shared_rounded,
      color: Color(0xFF7E22CE),
      route: '/documents',
    ),
    ModuleItem(
      key: 'reports',
      label: 'Academic Reports',
      icon: Icons.assessment_rounded,
      color: Color(0xFFE11D48),
      route: '/reports-all',
    ),
    ModuleItem(
      key: 'settings',
      label: 'Settings',
      icon: Icons.settings_rounded,
      color: Color(0xFF334155),
      route: '/settings',
      fields: [
        FormFieldConfig(key: 'schoolName', label: 'School Name', required: true),
        FormFieldConfig(key: 'academicYear', label: 'Academic Year', initialValue: '2025-26'),
        FormFieldConfig(key: 'allowBio', label: 'Enable Biometric Login', type: FormFieldType.toggle, initialValue: 'true'),
        FormFieldConfig(key: 'maintenanceMode', label: 'Maintenance Mode', type: FormFieldType.toggle, initialValue: 'false'),
      ],
    ),
    ModuleItem(
      key: 'calendar',
      label: 'School Calendar',
      icon: Icons.calendar_month_rounded,
      color: Color(0xFF0EA5E9),
      route: '/calendar',
    ),
    ModuleItem(
      key: 'self_attendance',
      label: 'My Attendance',
      icon: Icons.fingerprint_rounded,
      color: Color(0xFF16A34A),
      route: '/self-attendance',
    ),
  ];
}
