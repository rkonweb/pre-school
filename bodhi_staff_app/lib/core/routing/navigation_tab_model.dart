import 'package:flutter/material.dart';

class NavigationTabModel {
  final String label;
  final IconData icon;
  final String route;
  final bool isAction;

  NavigationTabModel({
    required this.label,
    required this.icon,
    required this.route,
    this.isAction = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'label': label,
      'iconCodePoint': icon.codePoint,
      'iconFontFamily': icon.fontFamily,
      'iconFontPackage': icon.fontPackage,
      'route': route,
      'isAction': isAction,
    };
  }

  factory NavigationTabModel.fromJson(Map<String, dynamic> json) {
    return NavigationTabModel(
      label: json['label'],
      icon: IconData(
        json['iconCodePoint'],
        fontFamily: json['iconFontFamily'],
        fontPackage: json['iconFontPackage'],
      ),
      route: json['route'],
      isAction: json['isAction'] ?? false,
    );
  }
}
