import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:parent_app_flutter/core/theme/app_theme.dart';
import 'package:parent_app_flutter/core/network/auth_service.dart';
import 'otp_screen.dart';

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

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _mobileController = TextEditingController();
  bool _isLoading = false;
  String _errorMessage = '';
  bool _isInputFocused = false;
  final FocusNode _focusNode = FocusNode();

  // Country picker
  Map<String, dynamic> _selectedCountry = Map<String, dynamic>.from(_kCountries[0]);

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      setState(() {
        _isInputFocused = _focusNode.hasFocus;
      });
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    _mobileController.dispose();
    super.dispose();
  }

  void _showCountryPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1A1040),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Column(mainAxisSize: MainAxisSize.min, children: [
          const SizedBox(height: 12),
          Container(width: 40, height: 4, decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 14),
          const Text('Select Country', style: TextStyle(
            fontFamily: 'Outfit', fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
          const SizedBox(height: 12),
          Divider(height: 1, color: Colors.white.withOpacity(0.1)),
          Flexible(child: ListView.separated(
            shrinkWrap: true,
            itemCount: _kCountries.length,
            separatorBuilder: (_, __) => Divider(height: 1, indent: 16, color: Colors.white.withOpacity(0.06)),
            itemBuilder: (_, i) {
              final c = _kCountries[i];
              final isSel = c['code'] == _selectedCountry['code'] && c['name'] == _selectedCountry['name'];
              return ListTile(
                leading: Text(c['flag'] as String, style: const TextStyle(fontSize: 22)),
                title: Text('${c['name']}  ${c['code']}',
                  style: TextStyle(fontFamily: 'Inter', fontSize: 14,
                    fontWeight: isSel ? FontWeight.w700 : FontWeight.w500,
                    color: isSel ? const Color(0xFF818CF8) : Colors.white.withOpacity(0.7))),
                trailing: isSel ? const Icon(Icons.check_circle, color: Color(0xFF818CF8), size: 18) : null,
                onTap: () {
                  setState(() { _selectedCountry = Map<String, dynamic>.from(c); _errorMessage = ''; });
                  Navigator.pop(ctx);
                },
              );
            })),
          const SizedBox(height: 20),
        ]);
      });
  }

  Future<void> _handleLogin() async {
    final phone = _mobileController.text.trim().replaceAll(RegExp(r'\s+'), '');
    final digits = _selectedCountry['digits'] as int;

    if (phone.isEmpty || phone.length < digits) {
      setState(() => _errorMessage = 'Enter a valid $digits-digit mobile number');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    final fullPhone = '${_selectedCountry['code']} $phone';

    final success = await AuthService.requestOtp(fullPhone);
    
    // Quick backdoor for development UI testing
    if(!success && phone == "1234567890") {
         Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => OtpScreen(mobile: fullPhone),
          ),
        );
        setState(() => _isLoading = false);
        return;
    }

    setState(() => _isLoading = false);

    if (success) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => OtpScreen(mobile: fullPhone),
        ),
      );
    } else {
      setState(() => _errorMessage = 'Failed to send OTP. Please check number and try again.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0D0A1E), Color(0xFF141028), Color(0xFF1A1040)],
            stops: [0.0, 0.6, 1.0],
          ),
        ),
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Hero Section
              Padding(
                padding: const EdgeInsets.only(top: 54, left: 28, right: 28, bottom: 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 36, height: 36,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.10),
                        border: Border.all(color: Colors.white.withOpacity(0.14)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(
                        child: Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 16),
                      ),
                    ),
                    const SizedBox(height: 28),
                    const Text(
                      'WELCOME BACK',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFFA78BFA),
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Log in to your\naccount',
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        height: 1.15,
                        letterSpacing: -0.6,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Access real-time intelligence for your children.',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: Colors.white.withOpacity(0.45),
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),

              // Form Section
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'MOBILE NUMBER',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: Colors.white.withOpacity(0.55),
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        decoration: BoxDecoration(
                          color: _isInputFocused ? const Color(0x1A6366F1) : Colors.white.withOpacity(0.07),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: _isInputFocused ? const Color(0xB36366F1) : Colors.white.withOpacity(0.10),
                            width: 1.5,
                          ),
                          boxShadow: _isInputFocused 
                              ? const [BoxShadow(color: Color(0x2E6366F1), blurRadius: 0, spreadRadius: 3)] 
                              : null,
                        ),
                        child: Row(
                          children: [
                            // Country code picker button
                            GestureDetector(
                              onTap: _showCountryPicker,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                                decoration: BoxDecoration(
                                  border: Border(
                                    right: BorderSide(color: Colors.white.withOpacity(0.08), width: 1),
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      _selectedCountry['flag'] as String,
                                      style: const TextStyle(fontSize: 18),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      _selectedCountry['code'] as String,
                                      style: const TextStyle(
                                        fontFamily: 'Inter',
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    Icon(
                                      Icons.keyboard_arrow_down_rounded,
                                      color: Colors.white.withOpacity(0.4),
                                      size: 18,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            // Phone number field
                            Expanded(
                              child: TextField(
                                controller: _mobileController,
                                focusNode: _focusNode,
                                keyboardType: TextInputType.phone,
                                cursorColor: const Color(0xFF818CF8),
                                inputFormatters: [
                                  FilteringTextInputFormatter.digitsOnly,
                                  LengthLimitingTextInputFormatter(_selectedCountry['digits'] as int),
                                ],
                                style: const TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                  letterSpacing: 1.2,
                                ),
                                decoration: InputDecoration(
                                  hintText: 'Enter ${_selectedCountry['digits']}-digit number',
                                  hintStyle: TextStyle(
                                    color: Colors.white.withOpacity(0.25),
                                    fontWeight: FontWeight.w500,
                                    letterSpacing: 0,
                                  ),
                                  border: InputBorder.none,
                                  contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                                ),
                                onChanged: (_) {
                                  if (_errorMessage.isNotEmpty) setState(() => _errorMessage = '');
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (_errorMessage.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          _errorMessage,
                          style: const TextStyle(color: Color(0xFFF43F5E), fontSize: 13, fontWeight: FontWeight.w500),
                        )
                      ],
                    ],
                  ),
                ),
              ),

              // Footer Section
              Padding(
                padding: const EdgeInsets.fromLTRB(28, 16, 28, 36),
                child: Column(
                  children: [
                    GestureDetector(
                      onTap: _isLoading ? null : _handleLogin,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 17),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(18),
                          boxShadow: const [
                            BoxShadow(color: Color(0x736366F1), blurRadius: 28, offset: Offset(0, 8)),
                          ],
                        ),
                        child: Center(
                          child: _isLoading 
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Text(
                                  'Get OTP',
                                  style: TextStyle(
                                    fontFamily: 'Outfit',
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white,
                                    letterSpacing: -0.2,
                                  ),
                                ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text.rich(
                      TextSpan(
                        text: 'By continuing, you agree to our\n',
                        children: [
                          const TextSpan(text: 'Terms of Service', style: TextStyle(color: Color(0xFF818CF8))),
                          const TextSpan(text: ' & '),
                          const TextSpan(text: 'Privacy Policy', style: TextStyle(color: Color(0xFF818CF8))),
                        ]
                      ),
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: Colors.white.withOpacity(0.28),
                        height: 1.5,
                      ),
                    )
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
