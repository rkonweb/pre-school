import 'package:flutter/material.dart';
import 'package:bodhi_staff_app/core/widgets/global_header.dart';

class CommunicationScreen extends StatelessWidget {
  const CommunicationScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      
      
      
      appBar: GlobalHeader(title: 'Communication'),
      body: const Center(child: Text('Communication / Announcements Module\n(Coming Soon)', textAlign: TextAlign.center)),
    );
  }
}
