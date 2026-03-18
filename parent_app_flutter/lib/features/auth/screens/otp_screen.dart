import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'package:parent_app_flutter/core/network/auth_service.dart';
import 'package:parent_app_flutter/features/dashboard/screens/shell_screen.dart';

class OtpScreen extends StatefulWidget {
  final String mobile;

  const OtpScreen({Key? key, required this.mobile}) : super(key: key);

  @override
  _OtpScreenState createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final TextEditingController _otpController = TextEditingController();
  bool _isLoading = false;
  String _errorMessage = '';
  int _activeBoxIndex = 0;
  bool _isSuccess = false;
  final FocusNode _focusNode = FocusNode();
  
  Timer? _timer;
  int _start = 30;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _focusNode.requestFocus();
    _startTimer();
  }

  void _startTimer() {
    setState(() {
      _start = 30;
      _canResend = false;
    });
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_start == 0) {
        setState(() {
          _canResend = true;
        });
        timer.cancel();
      } else {
        setState(() {
          _start--;
        });
      }
    });
  }

  Future<void> _resendOtp() async {
    if (!_canResend) return;
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });
    final success = await AuthService.requestOtp(widget.mobile);
    setState(() {
      _isLoading = false;
    });
    if (success) {
      _startTimer();
    } else {
      setState(() {
        _errorMessage = 'Failed to resend OTP. Please try again.';
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _focusNode.dispose();
    _otpController.dispose();
    super.dispose();
  }

  void _onKeyTapped(String key) {
    if (_otpController.text.length < 6) {
      setState(() {
        _otpController.text += key;
        _activeBoxIndex = _otpController.text.length;
        _errorMessage = '';
      });
      // Auto-verify when all 6 digits are entered
      if (_otpController.text.length == 6 && !_isLoading) {
        Future.delayed(const Duration(milliseconds: 150), () {
          if (mounted) _handleVerify();
        });
      }
    }
  }

  void _onDeleteTapped() {
    if (_otpController.text.isNotEmpty) {
      setState(() {
        _otpController.text = _otpController.text.substring(0, _otpController.text.length - 1);
        _activeBoxIndex = _otpController.text.length;
        _errorMessage = '';
      });
    }
  }

  Future<void> _handleVerify() async {
    final code = _otpController.text.trim();
    if (code.isEmpty || code.length < 4) {
      setState(() => _errorMessage = 'Please enter a valid OTP');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final res = await AuthService.verifyOtp(widget.mobile, code);
      if (res != null) {
        setState(() => _isSuccess = true);
        await Future.delayed(const Duration(milliseconds: 600)); // Success flash delay
        if (mounted) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const ShellScreen()),
            (Route<dynamic> route) => false,
          );
        }
      } else {
        setState(() {
           _isLoading = false;
           _errorMessage = 'Invalid OTP. Please try again.';
        });
      }
    } catch (e) {
      setState(() {
         _isLoading = false;
         _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: KeyboardListener(
        focusNode: _focusNode,
        onKeyEvent: (KeyEvent event) {
          if (event is KeyDownEvent) {
            final key = event.logicalKey;
            if (key == LogicalKeyboardKey.backspace) {
              _onDeleteTapped();
            } else if (key == LogicalKeyboardKey.enter || key == LogicalKeyboardKey.numpadEnter) {
              if (!_isLoading) _handleVerify();
            } else if (event.character != null && RegExp(r'^[0-9]$').hasMatch(event.character!)) {
              if (_otpController.text.length < 6) {
                _onKeyTapped(event.character!);
              }
            }
          }
        },
        child: Container(
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
              // Header Back Button
              Padding(
                padding: const EdgeInsets.only(top: 24, left: 24),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
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
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              // Hero Icon
              Center(
                child: Container(
                  width: 72, height: 72,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF059669)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                    borderRadius: BorderRadius.circular(22),
                    boxShadow: const [BoxShadow(color: Color(0x6610B981), blurRadius: 32, offset: Offset(0, 10))],
                  ),
                  child: const Center(
                    child: Icon(Icons.shield_rounded, color: Colors.white, size: 36),
                  ),
                ),
              ),
              const SizedBox(height: 22),
              
              // Text Content
              const Text(
                'Verify Phone',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Text.rich(
                  TextSpan(
                    text: 'We\'ve sent a verification code to\n',
                    children: [
                      TextSpan(
                        text: widget.mobile,
                        style: const TextStyle(color: Color(0xFFA78BFA), fontWeight: FontWeight.w700),
                      ),
                    ]
                  ),
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: Colors.white.withOpacity(0.45),
                    height: 1.5,
                  ),
                ),
              ),
              
              const SizedBox(height: 36),
              
              // OTP Boxes
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(6, (index) {
                    final isFilled = index < _otpController.text.length;
                    final isActive = index == _activeBoxIndex;
                    final val = isFilled ? _otpController.text[index] : '';
                    
                    Color borderColor = Colors.white.withOpacity(0.12);
                    Color bgColor = Colors.white.withOpacity(0.07);
                    List<BoxShadow>? shadows;
                    
                    if (_isSuccess) {
                      borderColor = const Color(0xFF10B981);
                      bgColor = const Color(0x2E10B981);
                      shadows = const [BoxShadow(color: Color(0x4010B981), blurRadius: 16, offset: Offset(0, 4))];
                    } else if (isActive) {
                      borderColor = const Color(0xFF818CF8);
                      shadows = const [BoxShadow(color: Color(0x336366F1), blurRadius: 0, spreadRadius: 3)];
                    } else if (isFilled) {
                      borderColor = const Color(0xFF6366F1);
                      bgColor = const Color(0x2E6366F1);
                      shadows = const [BoxShadow(color: Color(0x406366F1), blurRadius: 16, offset: Offset(0, 4))];
                    }

                    return Container(
                      width: 48, height: 56,
                      decoration: BoxDecoration(
                        color: bgColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: borderColor, width: isActive ? 2 : 2), // Keep width 2 to match HTML mock
                        boxShadow: shadows,
                      ),
                      child: Center(
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            Text(
                              val,
                              style: const TextStyle(
                                fontFamily: 'Outfit',
                                fontSize: 24,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                            // Simulated cursor
                            if (isActive && !_isSuccess)
                               Container(
                                 width: 2, height: 26,
                                 decoration: BoxDecoration(color: const Color(0xFF818CF8), borderRadius: BorderRadius.circular(2)),
                               )
                          ],
                        ),
                      ),
                    );
                  }),
                ),
              ),

              if (_errorMessage.isNotEmpty) ...[
                const SizedBox(height: 16),
                Text(
                  _errorMessage,
                  style: const TextStyle(color: Color(0xFFF43F5E), fontSize: 13, fontWeight: FontWeight.w500),
                  textAlign: TextAlign.center,
                )
              ],

              const Spacer(),

              // Resend & Timer
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                         SizedBox(
                           width:  22, height: 22,
                           child: _start > 0 ? CircularProgressIndicator(
                             value: _start / 30,
                             strokeWidth: 2.5,
                             color: const Color(0xFF6366F1),
                             backgroundColor: Colors.white.withOpacity(0.10),
                           ) : const SizedBox(),
                         ),
                         const SizedBox(width: 8),
                         Text(
                           _start > 0 ? '00:${_start.toString().padLeft(2, '0')}' : '', 
                           style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white.withOpacity(0.45))
                         ),
                      ],
                    ),
                    Text(
                      'Didn\'t receive code?',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.white.withOpacity(0.28)),
                    ),
                    GestureDetector(
                      onTap: _canResend ? _resendOtp : null,
                      child: Text(
                        'Resend', 
                        style: TextStyle(
                          fontSize: 12, 
                          fontWeight: FontWeight.w800, 
                          color: _canResend ? const Color(0xFF818CF8) : Colors.white.withOpacity(0.28)
                        )
                      ),
                    )
                  ],
                ),
              ),

              // Custom Numpad Grid
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 28).copyWith(bottom: 24),
                child: GridView.count(
                  crossAxisCount: 3,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 8,
                  crossAxisSpacing: 8,
                  childAspectRatio: 2.1,
                  children: [
                    for (int i = 1; i <= 9; i++) _buildNumKey(i.toString()),
                    _buildDelKey(),
                    _buildNumKey('0'),
                    _buildVerifyKey(),
                  ],
                ),
              )
            ],
          ),
        ),
      ),
      ), // Closing KeyboardListener
    );
  }

  Widget _buildNumKey(String num) {
    return GestureDetector(
      onTap: () => _onKeyTapped(num),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.08),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Center(
          child: Text(
            num,
            style: const TextStyle(
              fontFamily: 'Outfit',
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDelKey() {
    return GestureDetector(
      onTap: _onDeleteTapped,
      child: Container(
        decoration: BoxDecoration(
           color: const Color(0x1EF43F5E),
           border: Border.all(color: const Color(0x26F43F5E)),
           borderRadius: BorderRadius.circular(16),
        ),
        child: const Center(
          child: Icon(Icons.backspace_rounded, color: Color(0xFFF43F5E), size: 20),
        ),
      ),
    );
  }

  Widget _buildVerifyKey() {
    return GestureDetector(
      onTap: _isLoading ? null : _handleVerify,
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)], begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [BoxShadow(color: Color(0x666366F1), blurRadius: 20, offset: Offset(0, 6))],
        ),
        child: Center(
          child: _isLoading 
             ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
             : const Icon(Icons.check_rounded, color: Colors.white, size: 24),
        ),
      ),
    );
  }
}
