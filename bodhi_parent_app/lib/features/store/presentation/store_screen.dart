import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../../dashboard/data/dashboard_provider.dart';

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
  final Map<String, int> _cart = {};
  bool _isPlacingOrder = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  static const _catEmoji = {'UNIFORM': '👕', 'STATIONERY': '✏️', 'BOOK': '📚', 'KIT': '🎒', 'OTHER': '📦'};
  static const _catColor = {'UNIFORM': Color(0xFF1565C0), 'STATIONERY': Color(0xFFF57F17), 'BOOK': Color(0xFF1B5E20), 'KIT': Color(0xFF4A148C), 'OTHER': Color(0xFF607D8B)};

  double get _cartTotal {
    // Simplified — real implementation would look up prices
    return 0.0;
  }

  int get _cartCount => _cart.values.fold(0, (a, b) => a + b);

  Future<void> _placeOrder(String studentId, List<StoreItem> items) async {
    if (_cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Your cart is empty')));
      return;
    }
    setState(() => _isPlacingOrder = true);
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
                  onPressed: item.stock > 0 ? () => setState(() => _cart[item.id] = 1) : null,
                  style: ElevatedButton.styleFrom(backgroundColor: color, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 6), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                  child: const Text('Add', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              )
            else
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                GestureDetector(
                  onTap: () => setState(() { if (_cart[item.id]! <= 1) _cart.remove(item.id); else _cart[item.id] = _cart[item.id]! - 1; }),
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
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text('🛒 Cart', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 16),
          ..._cart.entries.map((e) => ListTile(title: Text(e.key.substring(e.key.length - 6)), trailing: Text('×${e.value}'))),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _isPlacingOrder ? null : () {
              Navigator.pop(ctx);
              // TODO: Get student ID from dashboard provider
              _placeOrder('STUDENT_ID', []);
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32), foregroundColor: Colors.white, minimumSize: const Size(double.infinity, 48)),
            child: _isPlacingOrder ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2) : const Text('Place Order'),
          ),
        ]),
      ),
    );
  }

  String _formatDate(dynamic iso) {
    try { final dt = DateTime.parse(iso.toString()); return '${dt.day}/${dt.month}/${dt.year}'; } catch (_) { return ''; }
  }
}
