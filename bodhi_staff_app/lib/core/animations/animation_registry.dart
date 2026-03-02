/// Defines the JSON Animation (Lottie) Registry for all micro-feedback and delight interactions.
/// The actual Lottie files will reside in assets/lottie/
class AnimationRegistry {
  static const String ANIM_LOGIN_SUCCESS = 'assets/lottie/login_success.json';
  static const String ANIM_SYNC_LOOP = 'assets/lottie/sync_loop.json';
  static const String ANIM_OFFLINE_HINT = 'assets/lottie/offline_hint.json';
  static const String ANIM_ATTENDANCE_SAVED =
      'assets/lottie/attendance_saved.json';
  static const String ANIM_DIARY_SENT = 'assets/lottie/diary_sent.json';
  static const String ANIM_ROUTE_START = 'assets/lottie/route_start.json';
  static const String ANIM_APPROVAL_DONE = 'assets/lottie/approval_done.json';
  static const String ANIM_ERROR_RETRY = 'assets/lottie/error_retry.json';
}

/// Feature Flag & Accessibility toggles for motion
class MotionSettings {
  static bool reduceMotion =
      false; // Bind this to OS accessibility settings later
  static const Duration defaultTransitionDuration = Duration(milliseconds: 300);
  static const Duration fastTransitionDuration = Duration(milliseconds: 150);
}
