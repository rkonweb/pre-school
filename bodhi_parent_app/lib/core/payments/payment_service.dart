import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';

// ─── Payment Result Model ─────────────────────────────────────────────────────
class PaymentResult {
  final bool success;
  final String? paymentId;
  final String? orderId;
  final String? signature;
  final String? errorMessage;

  PaymentResult({
    required this.success,
    this.paymentId,
    this.orderId,
    this.signature,
    this.errorMessage,
  });
}

// ─── Payment Service ─────────────────────────────────────────────────────────
class PaymentService {
  final ApiClient _apiClient;

  PaymentService(this._apiClient);

  /// Step 1: Create order on backend
  /// Returns Razorpay order details if successful
  Future<Map<String, dynamic>?> createOrder({
    required String studentId,
    required String feeId,
    required double amount,
  }) async {
    try {
      final response = await _apiClient.post('parent/finance/orders', data: {
        'studentId': studentId,
        'feeId': feeId,
        'amount': (amount * 100).toInt(), // Razorpay uses paise
      });
      if (response.data['success'] == true) {
        return response.data['order'] as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      debugPrint('PaymentService.createOrder error: $e');
      return null;
    }
  }

  /// Create a store order (items purchase, no feeId required).
  /// Returns a [PaymentResult] with orderId on success.
  Future<PaymentResult> createStoreOrder({
    required double amount,
    required String studentId,
    required List<Map<String, dynamic>> items,
    String description = 'School Store Order',
  }) async {
    try {
      final response = await _apiClient.post('parent/store/orders', data: {
        'studentId': studentId,
        'items': items,
        'amount': (amount * 100).toInt(), // Razorpay uses paise
        'description': description,
      });
      if (response.data['success'] == true) {
        final order = response.data['order'] as Map<String, dynamic>?;
        return PaymentResult(
          success: true,
          orderId: order?['id'] as String? ?? order?['orderId'] as String?,
        );
      }
      return PaymentResult(
        success: false,
        errorMessage: response.data['error'] ?? 'Failed to create store order',
      );
    } catch (e) {
      debugPrint('PaymentService.createStoreOrder error: $e');
      return PaymentResult(success: false, errorMessage: e.toString());
    }
  }

  /// Step 2: Verify payment on backend
  /// Returns true if payment verified successfully
  Future<bool> verifyPayment({
    required String paymentId,
    required String orderId,
    required String signature,
  }) async {
    try {
      final response = await _apiClient.post('parent/finance/verify', data: {
        'paymentId': paymentId,
        'orderId': orderId,
        'signature': signature,
      });
      return response.data['success'] == true;
    } catch (e) {
      debugPrint('PaymentService.verifyPayment error: $e');
      return false;
    }
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
final paymentServiceProvider = Provider<PaymentService>((ref) {
  return PaymentService(ref.read(apiClientProvider));
});
