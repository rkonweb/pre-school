import 'package:flutter/material.dart';

class TopNavBell extends StatelessWidget {
  final String badgeText;

  const TopNavBell({super.key, this.badgeText = '3'});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 16.0),
      child: Center(
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(13),
                border: Border.all(color: const Color.fromRGBO(20, 14, 40, 0.07), width: 1.5),
                boxShadow: const [
                  BoxShadow(color: Color.fromRGBO(20, 14, 40, 0.06), blurRadius: 8, offset: Offset(0, 2)),
                ],
              ),
              child: const Icon(Icons.notifications_none_outlined, size: 18, color: Color(0xFF140E28)),
            ),
            if (badgeText.isNotEmpty && badgeText != '0')
              Positioned(
                top: -4,
                right: -4,
                child: Container(
                  width: 18,
                  height: 18,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFF3264),
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFFFAFBFE), width: 2.5),
                  ),
                  child: Center(
                    child: Text(
                      badgeText,
                      style: const TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
