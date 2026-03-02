import 'package:bodhi_staff_app/ui/components/app_drawer.dart';
import 'package:bodhi_staff_app/ui/components/app_drawer.dart';
import 'package:flutter/material.dart';
import 'package:bodhi_staff_app/core/widgets/global_header.dart';
import '../../core/theme/app_theme.dart';

class ProgressScreen extends StatelessWidget {
  const ProgressScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      
      
      drawer: const AppDrawer(),
      appBar: GlobalHeader(title: 'Progress Reports'),
      body: const Center(child: Text('Progress Report Module\n(Coming Soon)', textAlign: TextAlign.center)),
    );
  }
}
