import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../../dashboard/data/dashboard_provider.dart';
import '../../../core/payments/payment_service.dart';
import '../../../core/config/app_config.dart';

// ─── Models & Providers ──────────────────────────────────────────────────────
class StoreItem {
  final String id;
  final String name;
  final String category;
  final double price;
  final int stock;
  final String? description;
  final String? imageUrl;

  StoreItem({required this.id, required this.name, required this.category, required this.price, required this.stock, this.description, this.imageUrl});

  factory StoreItem.fromJson(Map<String, dynamic> json) => StoreItem(
    id: json['id'] ?? '',
    name: json['name'] ?? '',
    category: json['category'] ?? 'OTHER',
    price: (json['price'] as num?)?.toDouble() ?? 0.0,
    stock: json['stock'] ?? 0,
    description: json['description'],
    imageUrl: json['imageUrl'],
  );
}

final storeItemsProvider = FutureProvider<List<StoreItem>>((ref) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get('parent/store');
  if (response.data['success'] == true) {
    return (response.data['data']['items'] as List? ?? []).map((e) => StoreItem.fromJson(e)).toList();
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load store');
  }
});

final storeOrdersProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get('parent/store', queryParameters: {'view': 'orders'});
  if (response.data['success'] == true) {
    return List<Map<String, dynamic>>.from(response.data['data'] ?? []);
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load orders');
  }
});

// ─── Screen ──────────────────────────────────────────────────────────────────
class SchoolStoreScreen extends ConsumerStatefulWidget {
  const SchoolStoreScreen({super.key});

  @override
  ConsumerState<SchoolStoreScreen> createState() => _SchoolStoreScreenState();
}

class _SchoolStoreScreenState extends ConsumerState<SchoolStoreScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late Razorpay _razorpay;
  final Map<String, int> _cart = {};
  final Map<String, double> _itemPrices = {};
  final Map<String, String> _itemNames = {};
  bool _isPlacingOrder = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _razorpay.clear();
    super.dispose();
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    try {
      final paymentService = ref.read(paymentServiceProvider);
      final verified = await paymentService.verifyPayment(
        orderId: response.orderId ?? '',
        paymentId: response.paymentId ?? '',
        signature: response.signature ?? '',
      );
      if (mounted) {
        if (verified) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('✅ Payment successful! Order placed.'), backgroundColor: Colors.green),
          );
          setState(() => _cart.clear());
          ref.refresh(storeOrdersProvider);
          _tabController.animateTo(1);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Payment received but verification pending'), backgroundColor: Colors.orange),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Payment verification error: $e'), backgroundColor: Colors.red),
        );
      }
    }
    if (mounted) setState(() => _isPlacingOrder = false);
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Payment failed: ${response.message}'), backgroundColor: Colors.red),
      );
      setState(() => _isPlacingOrder = false);
    }
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    if (mounted) setState(() => _isPlacingOrder = false);
  }

  static const _catEmoji = {'UNIFORM': '👕', 'STATIONERY': '✏️', 'BOOK': '📚', 'KIT': '🎒', 'OTHER': '📦'};
  static const _catColor = {'UNIFORM': Color(0xFF1565C0), 'STATIONERY': Color(0xFFF57F17), 'BOOK': Color(0xFF1B5E20), 'KIT': Color(0xFF4A148C), 'OTHER': Color(0xFF607D8B)};

  double get _cartTotal => _cart.entries.fold(
      0.0, (sum, e) => sum + ((_itemPrices[e.key] ?? 0.0) * e.value));

  int get _cartCount => _cart.values.fold(0, (a, b) => a + b);

  Future<void> _initiateCheckout(String studentId) async {
    if (_cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Your cart is empty')));
      return;
    }
    setState(() => _isPlacingOrder = true);
    try {
      final paymentService = ref.read(paymentServiceProvider);
      final cartItems = _cart.entries.map((e) => {'itemId': e.key, 'quantity': e.value}).toList();

      final result = await paymentService.createStoreOrder(
        amount: _cartTotal,
        studentId: studentId,
        items: cartItems,
      );

      if (!result.success || result.orderId == null) {
        // Backend didn't return an order id — fall back to direct order placement
        await _placeOrder(studentId);
        return;
      }

      final options = <String, dynamic>{
        'key': AppConfig.razorpayKeyId, // Set by school admin in ERP Login Settings
        'order_id': result.orderId,
        'amount': (_cartTotal * 100).toInt(),
        'name': 'LittleChanakyas School Store',
        'description': 'Order for ${_cart.length} item(s)',
        'prefill': {'contact': '', 'email': ''},
        'theme': {'color': '#2E7D32'},
      };
      _razorpay.open(options);
    } catch (e) {
      // If payment service throws (network error, etc.), fall back to direct order
      await _placeOrder(studentId);
    }
  }

  Future<void> _placeOrder(String studentId) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final cartItems = _cart.entries.map((e) => {'itemId': e.key, 'quantity': e.value}).toList();
      final response = await apiClient.post('parent/store', data: {
        'studentId': studentId,
        'items': cartItems,
      });
      if (response.data['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Order placed!'), backgroundColor: Colors.green));
          setState(() => _cart.clear());
          ref.refresh(storeOrdersProvider);
          _tabController.animateTo(1);
        }
      } else {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response.data['error'] ?? 'Failed to place order'), backgroundColor: Colors.red),
        );
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isPlacingOrder = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final brand = ref.watch(schoolBrandProvider);
    final dashboardAsync = ref.watch(dashboardDataProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppHeader(
        title: 'School Store',
        subtitle: 'Uniforms, books & school supplies',
        actions: [
          ElevatedButton(
            onPressed: () => _showCartDialog(context, dashboardAsync),
            style: AppTheme.headerButtonStyle(),
            child: Stack(
              alignment: Alignment.center,
              children: [
                const Icon(Icons.shopping_cart_outlined, size: 20),
                if (_cartCount > 0)
                  Positioned(
                    top: 10, right: 10,
                    child: Container(
                      width: 14, height: 14,
                      decoration: const BoxDecoration(color: Color(0xFFEF4444), shape: BoxShape.circle),
                      child: Center(child: Text('$_cartCount', style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold))),
                    ),
                  ),
              ],
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: TabBar(
            controller: _tabController,
            indicatorColor: const Color(0xFF2350DD),
            labelColor: const Color(0xFF2350DD),
            unselectedLabelColor: const Color(0xFF64748B),
            labelStyle: const TextStyle(fontWeight: FontWeight.bold),
            tabs: const [Tab(text: 'Catalog'), Tab(text: 'My Orders')],
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // ─── Catalog ──────────────────────────────────────────────────
          ref.watch(storeItemsProvider).when(
            data: (items) {
              if (items.isEmpty) {
                return const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.store_outlined, size: 64, color: Color(0xFFDDDDDD)),
                  SizedBox(height: 16),
                  Text('Store is empty', style: TextStyle(color: Colors.grey)),
                ]));
              }
              return RefreshIndicator(
                onRefresh: () => ref.refresh(storeItemsProvider.future),
                child: GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 0.75, crossAxisSpacing: 12, mainAxisSpacing: 12),
                  itemCount: items.length,
                  itemBuilder: (ctx, i) => _buildItemCard(items[i]),
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF2E7D32))),
            error: (err, _) => Center(child: Text(err.toString())),
          ),

          // ─── Orders ───────────────────────────────────────────────────
          ref.watch(storeOrdersProvider).when(
            data: (orders) {
              if (orders.isEmpty) {
                return const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.receipt_long_outlined, size: 64, color: Color(0xFFDDDDDD)),
                  SizedBox(height: 16),
                  Text('No orders yet', style: TextStyle(color: Colors.grey)),
                ]));
              }
              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: orders.length,
                itemBuilder: (ctx, i) => _buildOrderCard(orders[i]),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(child: Text(err.toString())),
          ),
        ],
      ),
    );
  }

  Widget _buildItemCard(StoreItem item) {
    final qty = _cart[item.id] ?? 0;
    final color = _catColor[item.category] ?? Colors.grey;

    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8)]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          height: 100,
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: const BorderRadius.vertical(top: Radius.circular(20))),
          child: Center(child: Text(_catEmoji[item.category] ?? '📦', style: const TextStyle(fontSize: 40))),
        ),
        Padding(
          padding: const EdgeInsets.all(12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13), maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 4),
            Text('₹${item.price.toStringAsFixed(0)}', style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 15)),
            Text('${item.stock} in stock', style: const TextStyle(color: Colors.grey, fontSize: 11)),
            const SizedBox(height: 8),
            if (qty == 0)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: item.stock > 0 ? () => setState(() {
                    _cart[item.id] = 1;
                    _itemPrices[item.id] = item.price;
                    _itemNames[item.id] = item.name;
                  }) : null,
                  style: ElevatedButton.styleFrom(backgroundColor: color, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 6), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                  child: const Text('Add', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              )
            else
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                GestureDetector(
                  onTap: () => setState(() { if (_cart[item.id]! <= 1) { _cart.remove(item.id); } else { _cart[item.id] = _cart[item.id]! - 1; } }),
                  child: Container(width: 28, height: 28, decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)), child: Icon(Icons.remove, size: 16, color: color)),
                ),
                Text('$qty', style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 16)),
                GestureDetector(
                  onTap: qty < item.stock ? () => setState(() => _cart[item.id] = (_cart[item.id] ?? 0) + 1) : null,
                  child: Container(width: 28, height: 28, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.add, size: 16, color: Colors.white)),
                ),
              ]),
          ]),
        ),
      ]),
    );
  }

  Widget _buildOrderCard(Map<String, dynamic> order) {
    final items = order['items'] as List? ?? [];
    final statusColors = {'PLACED': Colors.amber, 'CONFIRMED': Colors.blue, 'READY': Colors.purple, 'DELIVERED': Colors.green, 'CANCELLED': Colors.red};
    final status = order['status'] as String? ?? '';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('#${(order['id'] as String).substring((order['id'] as String).length - 6).toUpperCase()}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: statusColors[status]?.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
              child: Text(status, style: TextStyle(color: statusColors[status], fontSize: 11, fontWeight: FontWeight.bold)),
            ),
          ]),
          const SizedBox(height: 8),
          ...items.take(2).map((i) => Text('• ${i['item']?['name']} × ${i['quantity']}', style: const TextStyle(color: Colors.grey, fontSize: 12))),
          if (items.length > 2) Text('+ ${items.length - 2} more items', style: const TextStyle(color: Colors.grey, fontSize: 12)),
          const SizedBox(height: 8),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('₹${(order['totalAmount'] as num?)?.toStringAsFixed(0) ?? '0'}', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2E7D32), fontSize: 16)),
            Text(order['createdAt'] != null ? _formatDate(order['createdAt']) : '', style: const TextStyle(color: Colors.grey, fontSize: 11)),
          ]),
        ]),
      ),
    );
  }

  void _showCartDialog(BuildContext context, AsyncValue dashboardAsync) {
    final studentId = dashboardAsync.value?['activeStudentId'] as String? ?? '';
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              const Text('🛒 Cart', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
              IconButton(onPressed: () => Navigator.pop(ctx), icon: const Icon(Icons.close)),
            ]),
            const Divider(),
            if (_cart.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(child: Text('Your cart is empty', style: TextStyle(color: Colors.grey))),
              )
            else ...[
              ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 280),
                child: ListView(shrinkWrap: true, children: _cart.entries.map((e) {
                  final name = _itemNames[e.key] ?? e.key;
                  final price = _itemPrices[e.key] ?? 0.0;
                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    subtitle: Text('₹${price.toStringAsFixed(0)} each'),
                    trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                      IconButton(
                        icon: const Icon(Icons.remove_circle_outline, size: 20),
                        onPressed: () => setState(() {
                          setModalState(() {
                            if ((e.value) <= 1) { _cart.remove(e.key); } else { _cart[e.key] = e.value - 1; }
                          });
                        }),
                      ),
                      Text('${e.value}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      IconButton(
                        icon: const Icon(Icons.add_circle_outline, size: 20),
                        onPressed: () => setState(() {
                          setModalState(() => _cart[e.key] = e.value + 1);
                        }),
                      ),
                    ]),
                  );
                }).toList()),
              ),
              const Divider(),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text('Total', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text('₹${_cartTotal.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Color(0xFF2E7D32))),
              ]),
              const SizedBox(height: 16),
            ],
            ElevatedButton(
              onPressed: _cart.isEmpty || _isPlacingOrder ? null : () {
                Navigator.pop(ctx);
                _initiateCheckout(studentId);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D32),
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 52),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _isPlacingOrder
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text(_cart.isEmpty ? 'Cart is Empty' : 'Checkout · ₹${_cartTotal.toStringAsFixed(0)}',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ]),
        ),
      ),
    );
  }

  String _formatDate(dynamic iso) {
    try { final dt = DateTime.parse(iso.toString()); return '${dt.day}/${dt.month}/${dt.year}'; } catch (_) { return ''; }
  }
}
