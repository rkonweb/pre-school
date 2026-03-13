import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class HybridDashboardScreen extends StatefulWidget {
  const HybridDashboardScreen({super.key});

  @override
  State<HybridDashboardScreen> createState() => _HybridDashboardScreenState();
}

class _HybridDashboardScreenState extends State<HybridDashboardScreen> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState() ;

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // Update loading bar.
          },
          onPageStarted: (String url) {},
          onPageFinished: (String url) {
            // Ensure Teacher role is set on load
            _controller.runJavaScript("if (typeof setRole === 'function') { setRole('teacher'); }");
          },
          onWebResourceError: (WebResourceError error) {},
          onNavigationRequest: (NavigationRequest request) {
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadFlutterAsset('assets/www/index.html');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: WebViewWidget(controller: _controller),
      ),
    );
  }
}
