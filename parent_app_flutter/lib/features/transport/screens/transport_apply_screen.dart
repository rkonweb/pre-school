import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/network/api_client.dart';

class TransportApplyScreen extends StatefulWidget {
  final String applicationStatus; // NOT_APPLIED, PENDING, REJECTED, INACTIVE
  final String statusMessage;
  final String? rejectionReason;
  final List<Map<String, dynamic>> availableRoutes;
  final VoidCallback? onApplied;

  const TransportApplyScreen({
    Key? key,
    required this.applicationStatus,
    required this.statusMessage,
    this.rejectionReason,
    this.availableRoutes = const [],
    this.onApplied,
  }) : super(key: key);

  @override
  State<TransportApplyScreen> createState() => _TransportApplyScreenState();
}

class _TransportApplyScreenState extends State<TransportApplyScreen> with SingleTickerProviderStateMixin {
  final _addressController = TextEditingController();
  String? _selectedRouteId;
  String? _selectedStopId;
  Map<String, dynamic>? _selectedRoute;
  bool _submitting = false;
  bool _submitted = false;
  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _animController.forward();
  }

  @override
  void dispose() {
    _addressController.dispose();
    _animController.dispose();
    super.dispose();
  }

  Future<void> _submitApplication() async {
    if (_addressController.text.trim().isEmpty) {
      _showSnackBar('Please enter your pickup address', isError: true);
      return;
    }

    setState(() => _submitting = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final studentId = prefs.getString('active_student_id') ?? '';

      final response = await ApiClient.dio.post('/transport', data: {
        'studentId': studentId,
        'address': _addressController.text.trim(),
        'preferredRouteId': _selectedRouteId,
        'preferredStopId': _selectedStopId,
      });

      if (response.data['success'] == true) {
        setState(() {
          _submitted = true;
          _submitting = false;
        });
        widget.onApplied?.call();
      } else {
        setState(() => _submitting = false);
        _showSnackBar(response.data['error'] ?? 'Something went wrong', isError: true);
      }
    } catch (e) {
      setState(() => _submitting = false);
      _showSnackBar('Failed to submit application. Please try again.', isError: true);
    }
  }

  void _showSnackBar(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: GoogleFonts.outfit(fontWeight: FontWeight.w600)),
        backgroundColor: isError ? const Color(0xFFEF4444) : const Color(0xFF10B981),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted) return _buildSuccessState();
    if (widget.applicationStatus == 'PENDING') return _buildPendingState();
    if (widget.applicationStatus == 'REJECTED') return _buildRejectedState();
    return _buildApplicationForm();
  }

  // ──────────── SUCCESS STATE ────────────
  Widget _buildSuccessState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100, height: 100,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF10B981), Color(0xFF059669)],
                  begin: Alignment.topLeft, end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(30),
                boxShadow: [BoxShadow(color: const Color(0xFF10B981).withOpacity(0.3), blurRadius: 30, offset: const Offset(0, 10))],
              ),
              child: const Icon(Icons.check_rounded, color: Colors.white, size: 50),
            ),
            const SizedBox(height: 28),
            Text('Application Submitted!',
              style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white),
            ),
            const SizedBox(height: 12),
            Text(
              'Your transport application has been sent to the school. You will be notified once it is reviewed.',
              style: GoogleFonts.outfit(fontSize: 14, color: Colors.white60, height: 1.6),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 36),
            _buildInfoCard(
              icon: Icons.schedule,
              title: 'What happens next?',
              items: [
                'School admin will review your application',
                'A route and stop will be assigned to your child',
                'You can track the bus once approved',
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ──────────── PENDING STATE ────────────
  Widget _buildPendingState() {
    return FadeTransition(
      opacity: _fadeAnim,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100, height: 100,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [BoxShadow(color: const Color(0xFFF59E0B).withOpacity(0.3), blurRadius: 30, offset: const Offset(0, 10))],
                ),
                child: const Icon(Icons.hourglass_top_rounded, color: Colors.white, size: 50),
              ),
              const SizedBox(height: 28),
              Text('Application Under Review',
                style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white),
              ),
              const SizedBox(height: 12),
              Text(
                widget.statusMessage,
                style: GoogleFonts.outfit(fontSize: 14, color: Colors.white60, height: 1.6),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 36),
              _buildInfoCard(
                icon: Icons.info_outline,
                title: 'Your application is being processed',
                items: [
                  'The school will assign a bus route and stop',
                  'You will be able to track the bus once approved',
                  'Check back soon for updates',
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ──────────── REJECTED STATE ────────────
  Widget _buildRejectedState() {
    return FadeTransition(
      opacity: _fadeAnim,
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100, height: 100,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [BoxShadow(color: const Color(0xFFEF4444).withOpacity(0.3), blurRadius: 30, offset: const Offset(0, 10))],
                ),
                child: const Icon(Icons.close_rounded, color: Colors.white, size: 50),
              ),
              const SizedBox(height: 28),
              Text('Application Not Approved',
                style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white),
              ),
              const SizedBox(height: 12),
              if (widget.rejectionReason != null && widget.rejectionReason!.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.2)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.message_outlined, color: Color(0xFFEF4444), size: 18),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(widget.rejectionReason!,
                          style: GoogleFonts.outfit(fontSize: 13, color: Colors.white70, height: 1.5),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],
              Text(
                'You can re-apply with updated details below.',
                style: GoogleFonts.outfit(fontSize: 14, color: Colors.white60, height: 1.6),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),
              // Show the application form below for re-apply
              _buildApplicationFormContent(),
            ],
          ),
        ),
      ),
    );
  }

  // ──────────── APPLICATION FORM ────────────
  Widget _buildApplicationForm() {
    return FadeTransition(
      opacity: _fadeAnim,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Section
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E3A5F), Color(0xFF0F2341)],
                  begin: Alignment.topLeft, end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8))],
              ),
              child: Row(
                children: [
                  Container(
                    width: 56, height: 56,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF38BDF8), Color(0xFF0EA5E9)],
                      ),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Icon(Icons.directions_bus_rounded, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Apply for Transport',
                          style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                        const SizedBox(height: 4),
                        Text('Get your child on the school bus!',
                          style: GoogleFonts.outfit(fontSize: 13, color: Colors.white60),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            _buildApplicationFormContent(),
          ],
        ),
      ),
    );
  }

  Widget _buildApplicationFormContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Address Input
        _buildSectionLabel('Your Pickup Address', Icons.location_on_outlined),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: TextField(
            controller: _addressController,
            maxLines: 3,
            style: GoogleFonts.outfit(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              hintText: 'Enter your full address\ne.g. 12, 3rd Street, Anna Nagar, Chennai',
              hintStyle: GoogleFonts.outfit(color: Colors.white24, fontSize: 13),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.all(16),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'This helps the school assign the closest bus route and stop.',
          style: GoogleFonts.outfit(fontSize: 11, color: Colors.white38),
        ),

        // Route Selection
        if (widget.availableRoutes.isNotEmpty) ...[
          const SizedBox(height: 28),
          _buildSectionLabel('Preferred Route (Optional)', Icons.route_outlined),
          const SizedBox(height: 10),
          _buildRouteSelector(),
        ],

        // Stop Selection
        if (_selectedRoute != null && (_selectedRoute!['stops'] as List).isNotEmpty) ...[
          const SizedBox(height: 24),
          _buildSectionLabel('Preferred Stop (Optional)', Icons.pin_drop_outlined),
          const SizedBox(height: 10),
          _buildStopSelector(),
        ],

        // Available Routes Info
        if (widget.availableRoutes.isNotEmpty) ...[
          const SizedBox(height: 28),
          _buildSectionLabel('Available Routes', Icons.map_outlined),
          const SizedBox(height: 12),
          ...widget.availableRoutes.map((route) => _buildRouteCard(route)),
        ],

        // Submit Button
        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          height: 56,
          child: ElevatedButton(
            onPressed: _submitting ? null : _submitApplication,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF38BDF8),
              foregroundColor: Colors.white,
              disabledBackgroundColor: const Color(0xFF38BDF8).withOpacity(0.4),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
            child: _submitting
                ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.send_rounded, size: 20),
                      const SizedBox(width: 10),
                      Text(
                        widget.applicationStatus == 'REJECTED' ? 'Re-Apply' : 'Submit Application',
                        style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
          ),
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildSectionLabel(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 16, color: const Color(0xFF38BDF8)),
        const SizedBox(width: 8),
        Text(title,
          style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white, letterSpacing: 0.5),
        ),
      ],
    );
  }

  Widget _buildRouteSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          isExpanded: true,
          value: _selectedRouteId,
          hint: Text('Select a route', style: GoogleFonts.outfit(color: Colors.white38, fontSize: 14)),
          dropdownColor: const Color(0xFF1E293B),
          icon: const Icon(Icons.expand_more, color: Colors.white38),
          items: widget.availableRoutes.map<DropdownMenuItem<String>>((route) {
            return DropdownMenuItem<String>(
              value: route['id'] as String,
              child: Text(route['name'] as String,
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 14),
              ),
            );
          }).toList(),
          onChanged: (val) {
            setState(() {
              _selectedRouteId = val;
              _selectedStopId = null;
              _selectedRoute = widget.availableRoutes.firstWhere((r) => r['id'] == val, orElse: () => {});
            });
          },
        ),
      ),
    );
  }

  Widget _buildStopSelector() {
    final stops = (_selectedRoute?['stops'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          isExpanded: true,
          value: _selectedStopId,
          hint: Text('Select nearest stop', style: GoogleFonts.outfit(color: Colors.white38, fontSize: 14)),
          dropdownColor: const Color(0xFF1E293B),
          icon: const Icon(Icons.expand_more, color: Colors.white38),
          items: stops.map<DropdownMenuItem<String>>((stop) {
            return DropdownMenuItem<String>(
              value: stop['id'] as String,
              child: Text('${stop['name']} — ₹${stop['monthlyFee']}/month',
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 13),
              ),
            );
          }).toList(),
          onChanged: (val) => setState(() => _selectedStopId = val),
        ),
      ),
    );
  }

  Widget _buildRouteCard(Map<String, dynamic> route) {
    final stops = (route['stops'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final isSelected = _selectedRouteId == route['id'];
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedRouteId = route['id'] as String;
          _selectedRoute = route;
          _selectedStopId = null;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF38BDF8).withOpacity(0.1) : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFF38BDF8).withOpacity(0.5) : const Color(0xFF334155),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF38BDF8).withOpacity(0.2) : const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.directions_bus_rounded, size: 18,
                    color: isSelected ? const Color(0xFF38BDF8) : Colors.white38,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(route['name'] as String,
                        style: GoogleFonts.outfit(
                          fontSize: 15, fontWeight: FontWeight.w700,
                          color: isSelected ? const Color(0xFF38BDF8) : Colors.white,
                        ),
                      ),
                      if (route['description'] != null && (route['description'] as String).isNotEmpty)
                        Text(route['description'] as String,
                          style: GoogleFonts.outfit(fontSize: 11, color: Colors.white38),
                          maxLines: 1, overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),
                if (isSelected)
                  const Icon(Icons.check_circle, color: Color(0xFF38BDF8), size: 22),
              ],
            ),
            if (stops.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: stops.take(5).map((stop) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        children: [
                          Container(
                            width: 6, height: 6,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isSelected ? const Color(0xFF38BDF8) : Colors.white24,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(stop['name'] as String,
                              style: GoogleFonts.outfit(fontSize: 12, color: Colors.white54),
                            ),
                          ),
                          Text('₹${stop['monthlyFee']}',
                            style: GoogleFonts.outfit(fontSize: 11, color: Colors.white38, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
              if (stops.length > 5)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text('+ ${stops.length - 5} more stops',
                    style: GoogleFonts.outfit(fontSize: 11, color: Colors.white30),
                  ),
                ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard({required IconData icon, required String title, required List<String> items}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: const Color(0xFF38BDF8)),
              const SizedBox(width: 10),
              Text(title,
                style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...items.map((item) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.only(top: 6),
                  child: Icon(Icons.circle, size: 5, color: Color(0xFF38BDF8)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(item, style: GoogleFonts.outfit(fontSize: 13, color: Colors.white54, height: 1.4)),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }
}
