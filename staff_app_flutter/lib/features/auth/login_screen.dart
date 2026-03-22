import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:local_auth/local_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/state/auth_state.dart';
import '../../core/theme/app_theme.dart';
import '../../core/config/api_config.dart';
import '../../core/services/biometric_service.dart';
import '../../shared/components/phone_input.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

// ─── Country data ─────────────────────────────────────────────────────────────
const _kCountries = [
  {'flag': '🇮🇳', 'name': 'India',          'code': '+91',  'digits': 10},
  {'flag': '🇺🇸', 'name': 'United States',   'code': '+1',   'digits': 10},
  {'flag': '🇬🇧', 'name': 'United Kingdom',  'code': '+44',  'digits': 10},
  {'flag': '🇦🇪', 'name': 'UAE',             'code': '+971', 'digits': 9},
  {'flag': '🇸🇬', 'name': 'Singapore',       'code': '+65',  'digits': 8},
  {'flag': '🇦🇺', 'name': 'Australia',       'code': '+61',  'digits': 9},
  {'flag': '🇨🇦', 'name': 'Canada',          'code': '+1',   'digits': 10},
  {'flag': '🇿🇦', 'name': 'South Africa',    'code': '+27',  'digits': 9},
  {'flag': '🇳🇬', 'name': 'Nigeria',         'code': '+234', 'digits': 10},
  {'flag': '🇳🇵', 'name': 'Nepal',           'code': '+977', 'digits': 10},
  {'flag': '🇧🇩', 'name': 'Bangladesh',      'code': '+880', 'digits': 10},
  {'flag': '🇵🇰', 'name': 'Pakistan',        'code': '+92',  'digits': 10},
];

class _LoginScreenState extends ConsumerState<LoginScreen> {
  int _currentPanel = 0; // 0: Identification, 1: Verification, 2: Success
  String _phoneNumber = '';
  String _selectedAuthMode = 'otp'; // bio, otp, face
  final TextEditingController _phoneController = TextEditingController();
  final List<TextEditingController> _otpControllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _otpFocusNodes = List.generate(6, (_) => FocusNode());

  // Country picker
  Map<String, dynamic> _selectedCountry = _kCountries[0]; // default India
  String? _phoneError;
  bool _isSendingOtp = false;

  bool _isBioScanning = false;
  bool _isFaceScanning = false;
  bool _biometricEnrolled = false;  // whether device has biometric lock set up
  int _otpTimerSeconds = 60;
  Timer? _otpTimer;

  @override
  void initState() {
    super.initState();
    _checkBiometricEnrolled();
  }

  Future<void> _checkBiometricEnrolled() async {
    final svc = BiometricService();
    final enabled = await svc.isEnabled();
    final available = await svc.isAvailable();
    if (mounted) setState(() => _biometricEnrolled = enabled && available);
  }

  void _startOtpTimer() {
    _otpTimer?.cancel();
    setState(() => _otpTimerSeconds = 60);
    _otpTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_otpTimerSeconds > 0) {
        setState(() => _otpTimerSeconds--);
      } else {
        _otpTimer?.cancel();
      }
    });
  }

  Future<void> _resendOtp() async {
    final fullPhone = '${_selectedCountry['code']} $_phoneNumber';
    try {
      final res = await http.post(
        Uri.parse('$apiBase/api/mobile/v1/staff/auth/request-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'mobile': fullPhone}),
      ).timeout(const Duration(seconds: 10));
      final data = jsonDecode(res.body);
      if ((res.statusCode == 200 || res.statusCode == 201) && data['success'] == true) {
        _startOtpTimer();
        _showSnack('OTP resent successfully!');
      } else {
        _showSnack(data['error'] ?? 'Failed to resend OTP.');
      }
    } catch (e) {
      _showSnack('Network error. Check server.');
    }
  }

  void _showCntryPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Column(mainAxisSize: MainAxisSize.min, children: [
          const SizedBox(height: 12),
          Container(width: 40, height: 4, decoration: BoxDecoration(
            color: const Color(0xFFCDD3E2), borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 14),
          const Text('Select Country', style: TextStyle(fontFamily: 'Exo 2',
            fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0D1326))),
          const SizedBox(height: 12),
          const Divider(height: 1),
          Flexible(child: ListView.separated(
            shrinkWrap: true,
            itemCount: _kCountries.length,
            separatorBuilder: (_, __) => const Divider(height: 1, indent: 16),
            itemBuilder: (_, i) {
              final c = _kCountries[i];
              final isSel = c['code'] == _selectedCountry['code'] && c['name'] == _selectedCountry['name'];
              return ListTile(
                leading: Text(c['flag'] as String, style: const TextStyle(fontSize: 22)),
                title: Text('${c['name']}  ${c['code']}',
                  style: TextStyle(fontFamily: 'Figtree', fontSize: 14,
                    fontWeight: isSel ? FontWeight.w700 : FontWeight.w500,
                    color: isSel ? const Color(0xFFFF5733) : const Color(0xFF0D1326))),
                trailing: isSel ? const Icon(Icons.check_circle, color: Color(0xFFFF5733), size: 18) : null,
                onTap: () {
                  setState(() { _selectedCountry = c; _phoneError = null; });
                  Navigator.pop(ctx);
                },
              );
            })),
          const SizedBox(height: 20),
        ]);
      });
  }

  Future<void> _handleIdentificationNext() async {
    final digits = _selectedCountry['digits'] as int;
    final phone = _phoneController.text.trim().replaceAll(RegExp(r'\s+'), '');
    if (phone.isEmpty || phone.length < digits) {
      HapticFeedback.vibrate();
      setState(() => _phoneError = 'Enter a valid $digits-digit mobile number');
      return;
    }
    setState(() { _phoneError = null; _isSendingOtp = true; });
    final fullPhone = '${_selectedCountry['code']} $phone';
    try {
      final res = await http.post(
        Uri.parse('$apiBase/api/mobile/v1/staff/auth/request-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'mobile': fullPhone}),
      ).timeout(const Duration(seconds: 10));
      final data = jsonDecode(res.body);
      if ((res.statusCode == 200 || res.statusCode == 201) && data['success'] == true) {
        setState(() {
          _phoneNumber = phone;
          _currentPanel = 1;
          _selectedAuthMode = 'otp';
          _isSendingOtp = false;
        });
        _startOtpTimer();
        Future.microtask(() => _otpFocusNodes[0].requestFocus());
      } else {
        setState(() { _isSendingOtp = false;
          _phoneError = data['error'] ?? 'Could not send OTP. Check the number and try again.'; });
        HapticFeedback.vibrate();
      }
    } catch (e) {
      debugPrint('OTP Request Error: $e');
      setState(() { _isSendingOtp = false;
        _phoneError = 'Network error. Is the server running? $e'; });
      HapticFeedback.vibrate();
    }
  }

  void _handleSuccess(UserProfile profile) {
    if (profile.role == 'ADMIN' || profile.role == 'SUPER_ADMIN') {
      _showSnack('Administrators must use the Administrator App to login.');
      return;
    }
    if (mounted) setState(() => _currentPanel = 2);
    Future.delayed(const Duration(milliseconds: 2600), () {
      // Guard: widget may have been disposed if biometric auto-login fired
      // a second callback after navigation already occurred.
      if (!mounted) return;
      try {
        ref.read(userProfileProvider.notifier).state = profile;
        ref.read(isAuthenticatedProvider.notifier).state = true;
      } catch (_) {
        // Ref already disposed — state was already set by an earlier callback.
        return;
      }
      context.go('/dashboard');
    });
  }

  Future<void> _verifyOtp() async {
    final otp = _otpControllers.map((e) => e.text).join();
    if (otp.length < 6) {
      HapticFeedback.vibrate();
      _showSnack('Please enter the complete 6-digit OTP.');
      return;
    }
    // Send with country code so backend can look up the user
    final fullPhone = '${_selectedCountry['code']} $_phoneNumber';
    try {
      final res = await http.post(
        Uri.parse('$apiBase/api/mobile/v1/staff/auth/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'mobile': fullPhone, 'code': otp}),
      ).timeout(const Duration(seconds: 10));
      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['success'] == true) {
        final u = data['user'] as Map;
        final s = data['school'] as Map? ?? {};
        final profile = UserProfile(
          id: u['id'] ?? '',
          phone: _phoneNumber,
          name: u['name'] ?? '',
          role: u['role'] ?? 'STAFF',
          schoolId: u['schoolId'] ?? '',
          schoolName: u['schoolName'] ?? s['name'] ?? '',
          schoolSlug: u['schoolSlug'] ?? s['slug'] ?? '',
          token: data['token'] ?? '',
          branchId: u['branchId'],
          permissions: (u['permissions'] as List?)?.map((e) => e.toString()).toList() ?? [],
        );
        // Persist token for biometric re-login
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('saved_token',     data['token'] ?? '');
        await prefs.setString('saved_phone',     _phoneNumber);
        await prefs.setString('saved_name',      u['name']?.toString() ?? '');
        await prefs.setString('saved_role',      u['role']?.toString() ?? 'STAFF');
        await prefs.setString('saved_school',    profile.schoolName);
        await prefs.setString('saved_slug',      profile.schoolSlug);
        await prefs.setString('saved_school_id', profile.schoolId);
        if (u['branchId'] != null) await prefs.setString('saved_branch_id', u['branchId'].toString());
        _handleSuccess(profile);
      } else {
        HapticFeedback.vibrate();
        // Clear OTP boxes on failure and focus first
        for (var c in _otpControllers) { c.clear(); }
        setState(() {});
        Future.microtask(() => _otpFocusNodes[0].requestFocus());
        _showSnack(data['error'] ?? 'Invalid or expired OTP. Try again.');
      }
    } catch (e) {
      HapticFeedback.vibrate();
      debugPrint('OTP Verify Error: $e  URL: $apiBase/api/mobile/v1/staff/auth/verify-otp');
      _showSnack('Connection error: $e');
    }
  }

  // ── Real biometric/face login ──────────────────────────────────────────────
  // Authenticates with device biometrics, then restores session from saved token
  Future<void> _startBioScan() async {
    if (!_biometricEnrolled) {
      _showSnack('Biometric lock not enabled. Use OTP to login.');
      setState(() => _selectedAuthMode = 'otp');
      return;
    }
    setState(() => _isBioScanning = true);
    await _authenticateWithBiometric();
    if (mounted) setState(() => _isBioScanning = false);
  }

  Future<void> _startFaceScan() async {
    if (!_biometricEnrolled) {
      _showSnack('Biometric lock not enabled. Use OTP to login.');
      setState(() => _selectedAuthMode = 'otp');
      return;
    }
    setState(() => _isFaceScanning = true);
    await _authenticateWithBiometric();
    if (mounted) setState(() => _isFaceScanning = false);
  }

  Future<void> _authenticateWithBiometric() async {
    final auth = LocalAuthentication();
    try {
      final ok = await auth.authenticate(
        localizedReason: 'Verify your identity to sign in to EduSphere Staff',
      );
      if (!ok || !mounted) return;

      // Restore session from saved token + user data
      final prefs = await SharedPreferences.getInstance();
      final savedToken   = prefs.getString('saved_token');
      final savedPhone   = prefs.getString('saved_phone') ?? '';
      final savedName    = prefs.getString('saved_name') ?? '';
      final savedRole    = prefs.getString('saved_role') ?? 'STAFF';
      final savedSchool  = prefs.getString('saved_school') ?? '';
      final savedSlug    = prefs.getString('saved_slug') ?? '';
      final savedSchoolId= prefs.getString('saved_school_id') ?? '';
      final savedBranchId= prefs.getString('saved_branch_id');

      if (savedToken == null || savedToken.isEmpty) {
        // No saved token — must verify via OTP once more
        _showSnack('First-time setup: please verify via OTP once.');
        if (mounted) setState(() => _selectedAuthMode = 'otp');
        await _sendOtpForBiometric();
        return;
      }

      // Validate token is still alive with the server
      try {
        final res = await http.get(
          Uri.parse('$apiBase/api/mobile/v1/staff/profile'),
          headers: {'Authorization': 'Bearer $savedToken'},
        ).timeout(const Duration(seconds: 8));

        if (res.statusCode == 200) {
          final data = jsonDecode(res.body);
          final u = (data['staff'] ?? data['user'] ?? {}) as Map;
          final profile = UserProfile(
            id: u['id']?.toString() ?? '',
            phone: savedPhone,
            name: u['name']?.toString() ?? savedName,
            role: u['role']?.toString() ?? savedRole,
            schoolId: u['schoolId']?.toString() ?? savedSchoolId,
            schoolName: u['schoolName']?.toString() ?? savedSchool,
            schoolSlug: u['schoolSlug']?.toString() ?? savedSlug,
            token: savedToken,
            branchId: savedBranchId,
            permissions: (u['permissions'] as List?)?.map((e) => e.toString()).toList() ?? [],
          );
          final svc = BiometricService();
          await svc.recordActivity();
          if (mounted) _handleSuccess(profile);
          return;
        }
      } catch (_) {}

      // Token expired — need fresh OTP
      _showSnack('Session expired. Please verify via OTP.');
      if (mounted) setState(() => _selectedAuthMode = 'otp');
      await _sendOtpForBiometric();
    } catch (e) {
      _showSnack('Biometric error: $e');
    }
  }

  Future<void> _sendOtpForBiometric() async {
    if (_phoneNumber.isEmpty) {
      _showSnack('Please enter your phone number first.');
      return;
    }
    final fullPhone = '${_selectedCountry['code']} $_phoneNumber';
    try {
      final res = await http.post(
        Uri.parse('$apiBase/api/mobile/v1/staff/auth/request-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'mobile': fullPhone}),
      ).timeout(const Duration(seconds: 10));
      final data = jsonDecode(res.body);
      if ((res.statusCode == 200 || res.statusCode == 201) && data['success'] == true) {
        if (mounted) {
          setState(() => _selectedAuthMode = 'otp');
          _startOtpTimer();
          Future.microtask(() => _otpFocusNodes[0].requestFocus());
          _showSnack('OTP sent! Biometric login requires OTP verification on web.');
        }
      } else {
        _showSnack(data['error'] ?? 'Failed to send OTP. Try OTP mode directly.');
      }
    } catch (e) {
      _showSnack('Network error: Is the server running on port 3000?');
    }
  }

  void _showSnack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg), behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))));
  }

  @override
  void dispose() {
    _otpTimer?.cancel();
    _phoneController.dispose();
    for (var c in _otpControllers) {
      c.dispose();
    }
    for (var f in _otpFocusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F4F9),
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFFF5733).withOpacity(0.05),
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            right: -50,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFFF1A6E).withOpacity(0.04),
              ),
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                _buildSystemBar(),
                _buildBrandHeader(),
                Expanded(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 400),
                    child: _buildPanel(),
                  ),
                ),
                _buildHomePill(),
              ],
            ),
          ),
          
          if (_currentPanel == 2) _buildSuccessScreen(),
        ],
      ),
    );
  }

  Widget _buildSystemBar() {
    final now = DateTime.now();
    final timeStr = "${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}";
    
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 26, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
            Text(
            timeStr,
            style: TextStyle(
              fontFamily: 'Space Mono',
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: Color(0xFF0D1326),
            ),
          ),
          Row(
            children: [
              _buildSignalIcon(),
              SizedBox(width: 8),
              Text(
                '5G',
                style: TextStyle(
                  fontFamily: 'Space Mono',
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF0D1326),
                ),
              ),
              SizedBox(width: 8),
              _buildBatteryIcon(),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSignalIcon() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: List.generate(4, (index) {
        return Container(
          width: 3,
          height: (index + 1) * 3.0 + 2,
          margin: EdgeInsets.only(left: 1.5),
          decoration: BoxDecoration(
            color: const Color(0xFF0D1326),
            borderRadius: BorderRadius.circular(1),
          ),
        );
      }),
    );
  }

  Widget _buildBatteryIcon() {
    return Stack(
      alignment: Alignment.centerLeft,
      children: [
        Container(
          width: 22,
          height: 11,
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFF0D1326), width: 1.5),
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        Positioned(
          right: -3.5,
          child: Container(
            width: 2,
            height: 5,
            decoration: BoxDecoration(
              color: Color(0xFF0D1326),
              borderRadius: BorderRadius.only(
                topRight: Radius.circular(1.5),
                bottomRight: Radius.circular(1.5),
              ),
            ),
          ),
        ),
        Padding(
          padding: EdgeInsets.all(1.5),
          child: Container(
            width: 14,
            height: 8,
            decoration: BoxDecoration(
              color: const Color(0xFF0D1326),
              borderRadius: BorderRadius.circular(1),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBrandHeader() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE4E8F2))),
      ),
      child: Stack(
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: AppTheme.teacherTheme,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFFF3C5A).withOpacity(0.28),
                      blurRadius: 18,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: const Text('🎓', style: TextStyle(fontSize: 22)),
              ),
              SizedBox(width: 14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'EDUSPHERE',
                    style: TextStyle(
                      fontFamily: 'Exo 2',
                      fontSize: 19,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0D1326),
                      letterSpacing: 0.4,
                    ),
                  ),
                  Text(
                    'STAFF PORTAL · ERM SYSTEM',
                    style: TextStyle(
                      fontFamily: 'Space Mono',
                      fontSize: 8.5,
                      color: Color(0xFF9BA5BF),
                      letterSpacing: 1.8,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPanel() {
    if (_currentPanel == 0) {
      return _buildIdentificationPanel();
    } else {
      return _buildVerificationPanel();
    }
  }

  Widget _buildIdentificationPanel() {
    return Padding(
      padding: EdgeInsets.all(26),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildEyebrow('Step 01 — Identification'),
          SizedBox(height: 7),
          _buildTitle('Access\n', 'Portal'),
          SizedBox(height: 6),
          Text(
            'Enter your registered mobile number to continue to identity verification.',
            style: TextStyle(
              fontFamily: 'Figtree',
              fontSize: 13,
              color: Color(0xFF5E6B8C),
              height: 1.65,
            ),
          ),
          SizedBox(height: 22),
          StandardPhoneInput(
            label: 'MOBILE NUMBER',
            controller: _phoneController,
            selectedCountry: _selectedCountry,
            onSelectCountry: _showCntryPicker,
            errorText: _phoneError,
            onChanged: (_) {
              if (_phoneError != null) setState(() => _phoneError = null);
            },
          ),
          SizedBox(height: 12),
          Row(
            children: [
              Container(
                width: 5,
                height: 5,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: AppTheme.teacherTheme,
                ),
              ).animate(onPlay: (c) => c.repeat()).scale(
                    begin: const Offset(0.7, 0.7),
                    end: const Offset(1.3, 1.3),
                    duration: 1000.ms,
                  ).fadeIn(duration: 1000.ms),
              SizedBox(width: 8),
              Text(
                'Registered staff accounts only · Encrypted channel',
                style: TextStyle(
                  fontFamily: 'Figtree',
                  fontSize: 11,
                  color: Color(0xFF9BA5BF),
                ),
              ),
            ],
          ),
          const Spacer(),
          _isSendingOtp
            ? Container(
                width: double.infinity, height: 52,
                decoration: BoxDecoration(
                  gradient: AppTheme.teacherTheme,
                  borderRadius: BorderRadius.circular(12)),
                child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  SizedBox(width: 18, height: 18,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
                  SizedBox(width: 10),
                  Text('Sending OTP…', style: TextStyle(
                    fontFamily: 'Exo 2', fontSize: 14, fontWeight: FontWeight.w800,
                    color: Colors.white, letterSpacing: .8)),
                ]))
            : _buildPrimaryButton('Continue', _handleIdentificationNext),
          SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Opacity(
                opacity: 0.4,
                child: Text('🔒', style: TextStyle(fontSize: 10)),
              ),
              SizedBox(width: 5),
              Text(
                '256-BIT AES · ISO 27001',
                style: TextStyle(
                  fontFamily: 'Space Mono',
                  fontSize: 9,
                  color: Color(0xFF9BA5BF),
                  letterSpacing: 1.2,
                ),
              ),
            ],
          ),
          SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildVerificationPanel() {
    return Padding(
      padding: EdgeInsets.all(26),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildEyebrow('Step 02 — Verification'),
          SizedBox(height: 7),
          _buildTitle('Verify\n', 'Identity'),
          SizedBox(height: 6),
          RichText(
            text: TextSpan(
              style: TextStyle(fontFamily: 'Figtree', fontSize: 13, color: Color(0xFF5E6B8C)),
              children: [
                const TextSpan(text: 'Continuing as '),
                TextSpan(
                  text: '+91 ${_phoneNumber.isNotEmpty ? _phoneNumber.substring(0, 5) : "XXXXX"} XXXXX',
                  style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF2A3352)),
                ),
              ],
            ),
          ),
          SizedBox(height: 18),
          _buildModeRail(),
          SizedBox(height: 12),
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: _buildAuthModeContent(),
            ),
          ),
          SizedBox(height: 8),
          GestureDetector(
            onTap: () => setState(() => _currentPanel = 0),
            child: Center(
              child: Text(
                '← Change mobile number',
                style: TextStyle(
                  fontFamily: 'Figtree',
                  fontSize: 12,
                  color: Color(0xFF9BA5BF),
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ),
          SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildModeRail() {
    return Container(
      padding: EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F7FC),
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: const Color(0xFFE4E8F2)),
      ),
      child: Row(
        children: [
          _buildModeTab('bio', 'Biometric', Icons.fingerprint),
          _buildModeTab('otp', 'OTP', Icons.smartphone),
          _buildModeTab('face', 'Face ID', Icons.face),
        ],
      ),
    );
  }

  Widget _buildModeTab(String mode, String label, IconData icon) {
    bool isActive = _selectedAuthMode == mode;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() => _selectedAuthMode = mode);
          if (mode == 'otp') {
            // Only start timer if not already running
            if (_otpTimerSeconds == 60) _startOtpTimer();
            Future.microtask(() => _otpFocusNodes[0].requestFocus());
          }
        },
        child: Container(
          height: 32,
          decoration: BoxDecoration(
            gradient: isActive ? AppTheme.teacherTheme : null,
            borderRadius: BorderRadius.circular(100),
            boxShadow: isActive ? [
              BoxShadow(color: const Color(0xFFFF3C5A).withOpacity(0.22), blurRadius: 12, offset: const Offset(0, 3)),
            ] : null,
          ),
          alignment: Alignment.center,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 12, color: isActive ? Colors.white : const Color(0xFF9BA5BF)),
              SizedBox(width: 4),
                Text(
                label,
                style: TextStyle(
                  fontFamily: 'Figtree',
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: isActive ? Colors.white : const Color(0xFF9BA5BF),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAuthModeContent() {
    if (_selectedAuthMode == 'bio') return _buildBioMode();
    if (_selectedAuthMode == 'otp') return _buildOtpMode();
    return _buildFaceMode();
  }

  Widget _buildBioMode() {
    return Column(
      children: [
        const Spacer(),
        GestureDetector(
          onTap: _startBioScan,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Spinning Segments
              Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.transparent),
                ),
                child: CustomPaint(
                  painter: ScannerCirclePainter(isScanning: _isBioScanning),
                ),
              ).animate(onPlay: (c) => c.repeat()).rotate(duration: 6.seconds),
              
              // Arcs
              Container(
                width: 136,
                height: 136,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.transparent),
                ),
                child: CustomPaint(painter: ArcPainter(color: const Color(0xFFFF5733))),
              ).animate(onPlay: (c) => c.repeat()).rotate(duration: 3.seconds),
              
              // Inner Center
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFE4E8F2), width: 2),
                  boxShadow: const [
                     BoxShadow(color: Color(0x0F0D1326), blurRadius: 12, offset: Offset(0, 2)),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.fingerprint, size: 36, color: _isBioScanning ? const Color(0xFFFF1A6E) : const Color(0xFFFF5733)),
                    SizedBox(height: 3),
                    Text(
                      'TOUCH ID',
                      style: TextStyle(fontFamily: 'Space Mono', fontSize: 8, color: Color(0xFF9BA5BF), letterSpacing: 1.2),
                    ),
                  ],
                ),
              ),

              if (_isBioScanning)
                Positioned(
                  top: 20,
                  child: Container(
                    width: 90,
                    height: 2,
                    decoration: BoxDecoration(
                      gradient: AppTheme.teacherTheme,
                      boxShadow: [BoxShadow(color: const Color(0xFFFF3C5A).withOpacity(0.4), blurRadius: 8)],
                    ),
                  ).animate(onPlay: (c) => c.repeat(reverse: true)).moveY(begin: 0, end: 70, duration: 1.4.seconds),
                ),
            ],
          ),
        ),
        SizedBox(height: 12),
        Text(
          _isBioScanning ? 'Scanning fingerprint…' : 'Touch sensor to authenticate',
          style: TextStyle(fontFamily: 'Exo 2', fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF2A3352)),
        ),
        SizedBox(height: 10),
        Text(
          _isBioScanning ? 'Hold still…' : 'Tap to begin scan',
          style: TextStyle(fontFamily: 'Space Mono', fontSize: 9, color: Color(0xFF9BA5BF), letterSpacing: 2),
        ).animate(onPlay: (c) => c.repeat(reverse: true)).fadeOut(duration: 1.1.seconds),
        const Spacer(),
        _buildPrimaryButton('Scan Fingerprint', _startBioScan),
      ],
    );
  }

  Widget _buildOtpMode() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Spacer(),
        Text(
          'ENTER 6-DIGIT CODE',
          style: TextStyle(fontFamily: 'Space Mono', fontSize: 9, color: Color(0xFF9BA5BF), letterSpacing: 2),
        ),
        SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(6, (index) {
            return Container(
              width: 44,
              height: 52,
              decoration: BoxDecoration(
                color: _otpControllers[index].text.isNotEmpty ? const Color(0xFFFFF1EE) : Colors.white,
                border: Border.all(
                  color: _otpControllers[index].text.isNotEmpty ? const Color(0xFFFF1A6E) : const Color(0xFFE4E8F2),
                  width: 1.5,
                ),
                borderRadius: BorderRadius.circular(10),
                boxShadow: const [BoxShadow(color: Color(0x0F0D1326), blurRadius: 4)],
              ),
              child: TextField(
                controller: _otpControllers[index],
                focusNode: _otpFocusNodes[index],
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Exo 2',
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: _otpControllers[index].text.isNotEmpty ? const Color(0xFFFF1A6E) : const Color(0xFF0D1326),
                ),
                inputFormatters: [LengthLimitingTextInputFormatter(1)],
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  hintText: '·',
                  hintStyle: TextStyle(
                    fontSize: 28,
                    color: Color(0xFFD1D5DB),
                    fontWeight: FontWeight.w300,
                  ),
                ),
                onChanged: (value) {
                  if (value.isNotEmpty && index < 5) {
                    _otpFocusNodes[index + 1].requestFocus();
                  }
                  if (value.isEmpty && index > 0) {
                    _otpFocusNodes[index - 1].requestFocus();
                  }
                  setState(() {});
                  if (_otpControllers.every((e) => e.text.isNotEmpty)) {
                    _verifyOtp();
                  }
                },
              ),
            ).animate(target: _otpControllers[index].text.isNotEmpty ? 1 : 0).scale(begin: const Offset(1,1), end: const Offset(1.06, 1.06), duration: 200.ms);
          }),
        ),
        SizedBox(height: 12),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 9),
          decoration: BoxDecoration(
            color: const Color(0xFFF5F7FC),
            border: Border.all(color: const Color(0xFFEEF1F8)),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              RichText(
                 text: TextSpan(
                   style: TextStyle(fontFamily: 'Figtree', fontSize: 11.5, color: Color(0xFF5E6B8C)),
                   children: [
                     const TextSpan(text: 'Expires in '),
                     TextSpan(
                       text: '${_otpTimerSeconds}s',
                       style: TextStyle(fontFamily: 'Space Mono', fontWeight: FontWeight.w700, color: Color(0xFFFF5733)),
                     ),
                   ],
                 ),
              ),
              if (_otpTimerSeconds == 0)
                GestureDetector(
                  onTap: _resendOtp,
                  child: const Text(
                    'Resend OTP',
                    style: TextStyle(
                      fontFamily: 'Figtree',
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFFFF5733),
                      decoration: TextDecoration.underline,
                    ),
                  ),
                )
              else
                Text(
                  'Resend after ${_otpTimerSeconds}s',
                  style: const TextStyle(fontFamily: 'Figtree', fontSize: 11, color: Color(0xFF9BA5BF)),
                ),
            ],
          ),
        ),
        const Spacer(),
        _buildPrimaryButton('Verify Code', _verifyOtp),
      ],
    );
  }

  Widget _buildFaceMode() {
    return Column(
      children: [
        const Spacer(),
        GestureDetector(
          onTap: _startFaceScan,
          child: SizedBox(
            width: 124,
            height: 154,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Corners
                Positioned(top: 0, left: 0, child: _buildFaceCorner(top: true, left: true)),
                Positioned(top: 0, right: 0, child: _buildFaceCorner(top: true, left: false)),
                Positioned(bottom: 0, left: 0, child: _buildFaceCorner(top: false, left: true)),
                Positioned(bottom: 0, right: 0, child: _buildFaceCorner(top: false, left: false)),
                
                // Inner
                Container(
                  width: 88,
                  height: 116,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: const Color(0xFFE4E8F2), width: 1.5),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: const [BoxShadow(color: Color(0x0F0D1326), blurRadius: 12, offset: Offset(0, 2))],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_isFaceScanning ? '🤨' : '😐', style: TextStyle(fontSize: 40)),
                      SizedBox(height: 4),
                      Text(
                        'FACE ID',
                        style: TextStyle(fontFamily: 'Space Mono', fontSize: 8, color: Color(0xFF9BA5BF), letterSpacing: 1),
                      ),
                    ],
                  ),
                ),

                if (_isFaceScanning)
                  Positioned(
                    top: 15,
                    child: Container(
                      width: 88,
                      height: 1.5,
                      decoration: BoxDecoration(
                         gradient: AppTheme.teacherTheme,
                         boxShadow: [BoxShadow(color: const Color(0xFFFF3C5A).withOpacity(0.4), blurRadius: 8)],
                      ),
                    ).animate(onPlay: (c) => c.repeat(reverse: true)).moveY(begin: 0, end: 90, duration: 1.8.seconds),
                  ),
              ],
            ),
          ),
        ),
        SizedBox(height: 14),
        Text(
          _isFaceScanning ? 'Analysing facial geometry…' : 'Position your face in frame',
          style: TextStyle(fontFamily: 'Exo 2', fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF2A3352)),
        ),
        SizedBox(height: 10),
        Text(
          _isFaceScanning ? 'Hold steady…' : 'Tap to begin',
          style: TextStyle(fontFamily: 'Space Mono', fontSize: 9, color: Color(0xFF9BA5BF), letterSpacing: 2),
        ).animate(onPlay: (c) => c.repeat(reverse: true)).fadeOut(duration: 1.1.seconds),
        const Spacer(),
        _buildPrimaryButton('Start Face Scan', _startFaceScan),
      ],
    );
  }

  Widget _buildFaceCorner({required bool top, required bool left}) {
    return Container(
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        border: Border(
           top: top ? const BorderSide(color: Color(0xFFFF5733), width: 2) : BorderSide.none,
           bottom: !top ? const BorderSide(color: Color(0xFFFF5733), width: 2) : BorderSide.none,
           left: left ? const BorderSide(color: Color(0xFFFF5733), width: 2) : BorderSide.none,
           right: !left ? const BorderSide(color: Color(0xFFFF5733), width: 2) : BorderSide.none,
        ),
        borderRadius: BorderRadius.only(
          topLeft: top && left ? const Radius.circular(5) : Radius.zero,
          topRight: top && !left ? const Radius.circular(5) : Radius.zero,
          bottomLeft: !top && left ? const Radius.circular(5) : Radius.zero,
          bottomRight: !top && !left ? const Radius.circular(5) : Radius.zero,
        ),
      ),
    );
  }

  Widget _buildEyebrow(String text) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 1.5,
          decoration: BoxDecoration(
            gradient: AppTheme.teacherTheme,
            borderRadius: BorderRadius.circular(1),
          ),
        ),
        SizedBox(width: 7),
        Text(
          text.toUpperCase(),
          style: TextStyle(
            fontFamily: 'Space Mono',
            fontSize: 9,
            color: Color(0xFF9BA5BF),
            letterSpacing: 2.2,
          ),
        ),
      ],
    );
  }

  Widget _buildTitle(String normalText, String accentText) {
    return RichText(
      text: TextSpan(
        style: TextStyle(
          fontFamily: 'Exo 2',
          fontSize: 30,
          fontWeight: FontWeight.w800,
          color: Color(0xFF0D1326),
          letterSpacing: -0.4,
          height: 1.08,
        ),
        children: [
          TextSpan(text: normalText),
          WidgetSpan(
            child: ShaderMask(
              shaderCallback: (bounds) => AppTheme.teacherTheme.createShader(bounds),
              child: Text(
                accentText,
                style: TextStyle(
                  fontFamily: 'Exo 2',
                  fontWeight: FontWeight.w300,
                  fontStyle: FontStyle.italic,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrimaryButton(String text, VoidCallback onPressed) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: double.infinity,
        height: 52,
        decoration: BoxDecoration(
          gradient: AppTheme.teacherTheme,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFFF3C5A).withOpacity(0.30),
              blurRadius: 24,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              text.toUpperCase(),
              style: TextStyle(
                fontFamily: 'Exo 2',
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: 0.8,
              ),
            ),
            SizedBox(width: 8),
            const Icon(Icons.arrow_forward, color: Colors.white, size: 16),
          ],
        ),
      ),
    ).animate().scale(begin: const Offset(1,1), end: const Offset(1,1)).shimmer(duration: 1500.ms, color: Colors.white.withOpacity(0.18));
  }

  Widget _buildHomePill() {
    return Container(
      height: 36,
      alignment: Alignment.center,
      child: Container(
        width: 120,
        height: 5,
        decoration: BoxDecoration(
          color: const Color(0xFFCDD3E2),
          borderRadius: BorderRadius.circular(100),
        ),
      ),
    );
  }

  Widget _buildSuccessScreen() {
    return Container(
      color: const Color(0xFFFAFBFE),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              alignment: Alignment.center,
              children: [
                _buildRing(112),
                _buildRing(148, delay: 500),
                Container(
                  width: 84,
                  height: 84,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: AppTheme.teacherTheme,
                    boxShadow: [
                      BoxShadow(color: Color(0x4DFF3C5A), blurRadius: 24, offset: Offset(0, 4)),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: const Icon(Icons.check, color: Colors.white, size: 34),
                ).animate().scale(duration: 520.ms, curve: Curves.elasticOut, begin: const Offset(0,0), end: const Offset(1,1)).rotate(begin: -0.2, end: 0, duration: 520.ms),
              ],
            ),
            SizedBox(height: 14),
            Text(
              'ACCESS GRANTED',
              style: TextStyle(
                fontFamily: 'Exo 2',
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0D1326),
                letterSpacing: 0.3,
              ),
            ).animate().slideY(begin: 1.0, end: 0, delay: 300.ms).fadeIn(),
            SizedBox(height: 8),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 18, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1EE),
                border: Border.all(color: const Color(0x33FF5733)),
                borderRadius: BorderRadius.circular(100),
              ),
              child: Text(
                _selectedAuthMode == 'bio' ? 'BIOMETRIC VERIFIED' : _selectedAuthMode == 'otp' ? 'OTP VERIFIED' : 'FACE ID VERIFIED',
                style: TextStyle(
                  fontFamily: 'Space Mono',
                  fontSize: 10,
                  color: Color(0xFFFF1A6E),
                  fontWeight: FontWeight.w700,
                  letterSpacing: 2,
                ),
              ),
            ).animate().slideY(begin: 1.0, end: 0, delay: 380.ms).fadeIn(),
            SizedBox(height: 12),
            Text(
              'Loading your EduSphere\ndashboard, ${ref.watch(userProfileProvider)?.name ?? ''}…',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Figtree',
                fontSize: 13,
                color: Color(0xFF5E6B8C),
                height: 1.6,
              ),
            ).animate().slideY(begin: 1.0, end: 0, delay: 450.ms).fadeIn(),
            SizedBox(height: 20),
            Container(
              width: 180,
              height: 3,
              decoration: BoxDecoration(
                color: const Color(0xFFE4E8F2),
                borderRadius: BorderRadius.circular(100),
              ),
              child: FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: 0,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: AppTheme.teacherTheme,
                    borderRadius: BorderRadius.circular(100),
                  ),
                ),
              ).animate().scaleX(begin: 0, end: 1, duration: 2600.ms, curve: Curves.easeInOut, delay: 600.ms),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 500.ms);
  }

  Widget _buildRing(double size, {int delay = 0}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: const Color(0x33FF3C5A), width: 1.5),
      ),
    ).animate(onPlay: (c) => c.repeat()).scale(begin: const Offset(0.7,0.7), end: const Offset(1.6, 1.6), duration: 2.seconds).fadeOut(duration: 2.seconds);
  }
}

class ScannerCirclePainter extends CustomPainter {
  final bool isScanning;
  ScannerCirclePainter({required this.isScanning});

  @override
  void paint(Canvas canvas, Size size) {
    if (!isScanning) return;
    final center = Offset(size.width / 2, size.height / 2);
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 5
      ..shader = const SweepGradient(
        colors: [Color(0x59FF5733), Colors.transparent, Colors.transparent, Color(0x80FF3C5A), Colors.transparent],
        stops: [0.0, 0.16, 0.25, 0.4, 1.0],
      ).createShader(Rect.fromCircle(center: center, radius: 72));
    
    canvas.drawCircle(center, 71, paint);
  }

  @override
  bool shouldRepaint(covariant ScannerCirclePainter oldDelegate) => oldDelegate.isScanning != isScanning;
}

class ArcPainter extends CustomPainter {
  final Color color;
  ArcPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(Rect.fromCircle(center: center, radius: size.width / 2), -1.5, 1.5, false, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
