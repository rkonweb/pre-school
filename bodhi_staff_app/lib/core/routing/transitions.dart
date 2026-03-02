import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:animations/animations.dart';

/// Registry maps route names to transition types using the `animations` package
class TransitionRegistry {
  /// Standard Shared Axis Transition (Horizontal) for Top Level Tabs
  static CustomTransitionPage<void> sharedAxisHorizontal(
      BuildContext context, GoRouterState state, Widget child) {
    return CustomTransitionPage<void>(
      key: state.pageKey,
      child: child,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return SharedAxisTransition(
          animation: animation,
          secondaryAnimation: secondaryAnimation,
          transitionType: SharedAxisTransitionType.horizontal,
          child: child,
        );
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }

  /// Shared Element Shared Axis Transition (Vertical) for Details Pages
  static CustomTransitionPage<void> sharedAxisVertical(
      BuildContext context, GoRouterState state, Widget child) {
    return CustomTransitionPage<void>(
      key: state.pageKey,
      child: child,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return SharedAxisTransition(
          animation: animation,
          secondaryAnimation: secondaryAnimation,
          transitionType: SharedAxisTransitionType.vertical,
          child: child,
        );
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }

  /// Fade through transition for dialogs or minor state changes
  static CustomTransitionPage<void> fadeThrough(
      BuildContext context, GoRouterState state, Widget child) {
    return CustomTransitionPage<void>(
      key: state.pageKey,
      child: child,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return FadeThroughTransition(
          animation: animation,
          secondaryAnimation: secondaryAnimation,
          child: child,
        );
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }
}
