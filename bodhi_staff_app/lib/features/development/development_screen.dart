import 'package:flutter/material.dart';
import 'package:bodhi_staff_app/core/widgets/global_header.dart';

class DevelopmentScreen extends StatelessWidget {
  const DevelopmentScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      
      
      
      appBar: GlobalHeader(title: 'Child Development'),
      body: const Center(child: Text('Development Module\n(Coming Soon)', textAlign: TextAlign.center)),
    );
  }
}
