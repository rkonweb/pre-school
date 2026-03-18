import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

class AdminStaffDetailsView extends StatelessWidget {
  final Map<String, dynamic> staffData;

  const AdminStaffDetailsView({super.key, required this.staffData});

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

  Widget _buildDetailRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFF4F6F9),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: const Color(0xFF7B7291)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFB5B0C4),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value.isNotEmpty ? value : 'Not provided',
                  style: const TextStyle(
                    fontFamily: 'Satoshi',
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF140E28),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'N/A';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd MMM, yyyy').format(date);
    } catch (e) {
      return dateStr.split('T').first;
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = '${staffData['firstName'] ?? ''} ${staffData['lastName'] ?? ''}'.trim();
    final role = staffData['customRole'] != null ? staffData['customRole']['name'] : staffData['role'] ?? 'STAFF';
    final dept = staffData['department'] ?? 'General';
    final email = staffData['email'] ?? '';
    final phone = staffData['mobile'] ?? staffData['phone'] ?? 'N/A';
    final dob = _formatDate(staffData['dateOfBirth']);
    final joiningDate = _formatDate(staffData['joiningDate']);
    final employmentType = staffData['employmentType'] ?? 'Full-Time';
    final status = staffData['status'] ?? 'ACTIVE';
    final gender = staffData['gender'] ?? 'N/A';
    final bloodGroup = staffData['bloodGroup'] ?? 'N/A';
    final qualifications = staffData['qualifications'] ?? 'N/A';
    final experience = staffData['experience'] ?? 'N/A';
    final subjects = staffData['subjects'] ?? 'N/A';

    final emergencyName = staffData['emergencyContactName'] ?? 'N/A';
    final emergencyRelation = staffData['emergencyContactRelation'] ?? 'N/A';
    final emergencyPhone = staffData['emergencyContactPhone'] ?? 'N/A';

    final bankName = staffData['bankName'] ?? 'N/A';
    final bankAccountNo = staffData['bankAccountNo'] ?? 'N/A';
    final bankIfsc = staffData['bankIfsc'] ?? 'N/A';

    final address = [
      staffData['address'],
      staffData['addressCity'],
      staffData['addressState'],
      staffData['addressCountry'],
      staffData['addressZip']
    ].where((e) => e != null && e.toString().trim().isNotEmpty).join(', ');

    final initial = name.isNotEmpty ? name[0].toUpperCase() : '?';

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
            const Text(
              'Staff Details',
              style: TextStyle(
                fontFamily: 'Clash Display',
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Color(0xFF140E28),
              ),
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Column(
          children: [
            // Profile Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0x12140E28)),
                boxShadow: const [
                  BoxShadow(color: Color(0x0A140E28), blurRadius: 10, offset: Offset(0, 4)),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: _getRoleBgColor(role),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      initial,
                      style: TextStyle(
                        fontFamily: 'Clash Display',
                        fontSize: 32,
                        fontWeight: FontWeight.w700,
                        color: _getRoleColor(role),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    name.isEmpty ? 'Unknown' : name,
                    style: const TextStyle(
                      fontFamily: 'Clash Display',
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF140E28),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getRoleBgColor(role),
                      borderRadius: BorderRadius.circular(100),
                      border: Border.all(color: _getRoleColor(role).withValues(alpha: 0.2)),
                    ),
                    child: Text(
                      role,
                      style: TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: _getRoleColor(role),
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: status.toUpperCase() == 'ACTIVE' ? Colors.green.shade50 : Colors.red.shade50,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          status.toUpperCase(),
                          style: TextStyle(
                            fontFamily: 'Satoshi',
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: status.toUpperCase() == 'ACTIVE' ? Colors.green.shade700 : Colors.red.shade700,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '•  $employmentType',
                        style: const TextStyle(
                          fontFamily: 'Satoshi',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF7B7291),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            
            // Professional Details
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0x12140E28)),
                boxShadow: const [
                  BoxShadow(color: Color(0x0A140E28), blurRadius: 10, offset: Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Professional Info',
                    style: TextStyle(fontFamily: 'Clash Display', fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF140E28)),
                  ),
                  const SizedBox(height: 8),
                  const Divider(color: Color(0xFFF4F6F9)),
                  _buildDetailRow('Department', dept, Icons.business_center_rounded),
                  _buildDetailRow('Designation', staffData['designation'] ?? 'N/A', Icons.badge_rounded),
                  _buildDetailRow('Date of Joining', joiningDate, Icons.calendar_today_rounded),
                  _buildDetailRow('Qualifications', qualifications, Icons.school_rounded),
                  _buildDetailRow('Experience', experience, Icons.work_history_rounded),
                  _buildDetailRow('Subjects', subjects, Icons.book_rounded),
                ],
              ),
            ),
            const SizedBox(height: 16),
            
            // Contact Details
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0x12140E28)),
                boxShadow: const [
                  BoxShadow(color: Color(0x0A140E28), blurRadius: 10, offset: Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Contact & Personal Info',
                    style: TextStyle(fontFamily: 'Clash Display', fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF140E28)),
                  ),
                  const SizedBox(height: 8),
                  const Divider(color: Color(0xFFF4F6F9)),
                  _buildDetailRow('Phone Number', phone, Icons.phone_rounded),
                  _buildDetailRow('Email Address', email, Icons.email_rounded),
                  _buildDetailRow('Gender', gender, Icons.person_rounded),
                  _buildDetailRow('Date of Birth', dob, Icons.cake_rounded),
                  _buildDetailRow('Blood Group', bloodGroup, Icons.bloodtype_rounded),
                  _buildDetailRow('Address', address.isNotEmpty ? address : 'N/A', Icons.location_on_rounded),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Emergency Contact
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0x12140E28)),
                boxShadow: const [
                  BoxShadow(color: Color(0x0A140E28), blurRadius: 10, offset: Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Emergency Contact',
                    style: TextStyle(fontFamily: 'Clash Display', fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF140E28)),
                  ),
                  const SizedBox(height: 8),
                  const Divider(color: Color(0xFFF4F6F9)),
                  _buildDetailRow('Contact Name', emergencyName, Icons.medical_services_rounded),
                  _buildDetailRow('Relationship', emergencyRelation, Icons.family_restroom_rounded),
                  _buildDetailRow('Phone Number', emergencyPhone, Icons.contact_emergency_rounded),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Bank Details
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0x12140E28)),
                boxShadow: const [
                  BoxShadow(color: Color(0x0A140E28), blurRadius: 10, offset: Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Bank Details',
                    style: TextStyle(fontFamily: 'Clash Display', fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF140E28)),
                  ),
                  const SizedBox(height: 8),
                  const Divider(color: Color(0xFFF4F6F9)),
                  _buildDetailRow('Bank Name', bankName, Icons.account_balance_rounded),
                  _buildDetailRow('Account Number', bankAccountNo, Icons.numbers_rounded),
                  _buildDetailRow('IFSC Code', bankIfsc, Icons.password_rounded),
                ],
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
