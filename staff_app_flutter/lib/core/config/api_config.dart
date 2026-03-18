import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

/// Returns the base API URL, always pointing to port 3000.
/// Works whether app is on localhost, 127.0.0.1, Android emulator, or web.
String get apiBase {
  if (kIsWeb) {
    // We can't use dart:html directly without conditional imports, 
    // so for web we'll just return localhost for local dev.
    return 'http://localhost:3000';
  }
  
  // For Android emulator, use 10.0.2.2 instead of localhost
  if (Platform.isAndroid) {
    return 'http://10.0.2.2:3000';
  }
  
  // For iOS simulator, macOS, or other desktop
  return 'http://localhost:3000';
}
