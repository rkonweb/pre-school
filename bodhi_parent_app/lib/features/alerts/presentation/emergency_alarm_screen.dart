import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../../core/notifications/emergency_alarm_service.dart';

/// Full-screen alarm overlay shown when an emergency alert fires.
/// The only way to stop the alarm is to explicitly tap "Dismiss Alarm".
class EmergencyAlarmScreen extends StatefulWidget {
  final String title;
  final String message;
  final String alertType;

  const EmergencyAlarmScreen({
    super.key,
    required this.title,
    required this.message,
    this.alertType = 'GENERAL',
  });

  @override
  State<EmergencyAlarmScreen> createState() => _EmergencyAlarmScreenState();
}

class _EmergencyAlarmScreenState extends State<EmergencyAlarmScreen>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _sirenController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _sirenAnimation;

  static const _typeEmojis = {
    'CLOSURE': '🏫',
    'WEATHER': '⛈️',
    'BUS_BREAKDOWN': '🚌',
    'SAFETY': '🔒',
    'HEALTH': '🏥',
    'GENERAL': '🚨',
  };

  @override
  void initState() {
    super.initState();

    // Lock screen orientation to portrait during alarm
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

    // Pulsing background
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 0.0, end: 0.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    // Siren icon bounce
    _sirenController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    )..repeat(reverse: true);
    _sirenAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _sirenController, curve: Curves.elasticOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _sirenController.dispose();
    SystemChrome.setPreferredOrientations(DeviceOrientation.values);
    super.dispose();
  }

  Future<void> _dismissAlarm() async {
    await EmergencyAlarmService.instance.stopAlarm();
    if (mounted) {
      context.go('/alerts');
    }
  }

  @override
  Widget build(BuildContext context) {
    final emoji = _typeEmojis[widget.alertType] ?? '🚨';

    return PopScope(
      canPop: false, // prevent back button dismissal — must use Dismiss button
      child: Scaffold(
        body: AnimatedBuilder(
          animation: _pulseAnimation,
          builder: (context, child) {
            return Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color.lerp(const Color(0xFFB71C1C), const Color(0xFFD32F2F),
                        _pulseAnimation.value)!,
                    Color.lerp(const Color(0xFF880000), const Color(0xFFB71C1C),
                        _pulseAnimation.value)!,
                  ],
                ),
              ),
              child: child,
            );
          },
          child: SafeArea(
            child: Column(
              children: [
                // Top status bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  child: Row(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'EMERGENCY ALERT — ACTIVE',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2,
                        ),
                      ),
                    ],
                  ),
                ),

                const Spacer(flex: 2),

                // Siren Icon
                ScaleTransition(
                  scale: _sirenAnimation,
                  child: Text(
                    emoji,
                    style: const TextStyle(fontSize: 80),
                    textAlign: TextAlign.center,
                  ),
                ),

                const SizedBox(height: 32),

                // Title
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: Text(
                    widget.title,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      height: 1.2,
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Message
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: Text(
                    widget.message,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 16,
                      height: 1.5,
                    ),
                  ),
                ),

                const Spacer(flex: 3),

                // Wave decoration
                Container(
                  height: 2,
                  margin: const EdgeInsets.symmetric(horizontal: 40),
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),

                const SizedBox(height: 32),

                // DISMISS BUTTON
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: SizedBox(
                    width: double.infinity,
                    height: 64,
                    child: ElevatedButton(
                      onPressed: _dismissAlarm,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFFD32F2F),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.notifications_off_rounded, size: 22),
                          SizedBox(width: 12),
                          Text(
                            'DISMISS ALARM',
                            style: TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 16,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Small hint text
                const Text(
                  'Tap to stop the alarm sound',
                  style: TextStyle(color: Colors.white38, fontSize: 12),
                ),

                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
