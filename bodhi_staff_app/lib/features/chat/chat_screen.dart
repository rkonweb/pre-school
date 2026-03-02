import 'package:bodhi_staff_app/ui/components/app_drawer.dart';
import 'package:bodhi_staff_app/ui/components/app_drawer.dart';
import 'package:flutter/material.dart';
import 'package:bodhi_staff_app/core/widgets/global_header.dart';
import '../../core/theme/app_theme.dart';

class ChatScreen extends StatelessWidget {
  const ChatScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      
      
      drawer: const AppDrawer(),
      appBar: GlobalHeader(title: 'Chat'),
      body: const Center(child: Text('Chat Module\n(Coming Soon)', textAlign: TextAlign.center)),
    );
  }
}
