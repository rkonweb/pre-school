import 'package:flutter/material.dart';

class IphoneFrameWrapper extends StatelessWidget {
  final Widget child;
  final bool isEnabled;

  const IphoneFrameWrapper({
    super.key,
    required this.child,
    this.isEnabled = true,
  });

  @override
  Widget build(BuildContext context) {
    if (!isEnabled) return child;

    return Container(
      color: Colors.grey[900],
      child: Center(
        child: Container(
          width: 390, // Approximate width of iPhone 14
          height: 844, // Approximate height of iPhone 14
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: BorderRadius.circular(40),
            border: Border.all(
              color: Colors.black,
              width: 8,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.5),
                blurRadius: 30,
                spreadRadius: 10,
              )
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(32),
            child: child,
          ),
        ),
      ),
    );
  }
}
