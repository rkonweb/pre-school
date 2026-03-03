import 'package:flutter/material.dart';
import 'package:bodhi_staff_app/core/widgets/global_header.dart';

class HealthScreen extends StatelessWidget {
  const HealthScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      
      
      
      appBar: GlobalHeader(title: 'Health Records'),
      body: const Center(child: Text('Health Module\n(Coming Soon)', textAlign: TextAlign.center)),
    );
  }
}
