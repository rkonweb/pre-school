import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../features/auth/screens/login_screen.dart';

import '../../core/network/api_client.dart';

void main() {
  ApiClient.init();
  runApp(const ParentApp());
}

class ParentApp extends StatelessWidget {
  const ParentApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EduSphere Parent Portal',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: LoginScreen(),
    );
  }
}
