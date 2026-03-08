import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';

// ─── Providers ───────────────────────────────────────────────────────────────
class AlertsData {
  final List<Map<String, dynamic>> activeAlerts;
  final List<Map<String, dynamic>> recentAlerts;
  final bool hasActiveAlerts;

  AlertsData({required this.activeAlerts, required this.recentAlerts, required this.hasActiveAlerts});

  factory AlertsData.fromJson(Map<String, dynamic> json) => AlertsData(
    activeAlerts: List<Map<String, dynamic>>.from(json['activeAlerts'] ?? []),
    recentAlerts: List<Map<String, dynamic>>.from(json['recentAlerts'] ?? []),
    hasActiveAlerts: json['hasActiveAlerts'] == true,
  );
}

final alertsProvider = FutureProvider<AlertsData>((ref) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get('parent/alerts');
  if (response.data['success'] == true) {
    return AlertsData.fromJson(response.data['data']);
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load alerts');
  }
});

// ─── Circulars Provider ───────────────────────────────────────────────────────
final circularsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get('parent/circulars');
  if (response.data['success'] == true) {
    return List<Map<String, dynamic>>.from(response.data['data'] ?? []);
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load circulars');
  }
});

// ─── Filter State Provider ──────────────────────────────────────────────────
final selectedAlertFilterProvider = StateProvider<String>((ref) => 'All');

// ─── Emergency Alerts Screen ─────────────────────────────────────────────────
class AlertsScreen extends ConsumerWidget {
  const AlertsScreen({super.key});

  static const _typeData = {
    'CLOSURE': {'emoji': '🏫', 'label': 'School Closure', 'severity': 'HIGH'},
    'WEATHER': {'emoji': '⛈️', 'label': 'Weather Warning', 'severity': 'MEDIUM'},
    'BUS_BREAKDOWN': {'emoji': '🚌', 'label': 'Bus Breakdown', 'severity': 'MEDIUM'},
    'SAFETY': {'emoji': '🔒', 'label': 'Safety Alert', 'severity': 'HIGH'},
    'GENERAL': {'emoji': '🚨', 'label': 'Emergency', 'severity': 'EMERGENCY'},
  };

  static const _filterOptions = ['All', 'Emergency', 'General', 'Health', 'Transport'];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brand = ref.watch(schoolBrandProvider);
    final alertsAsync = ref.watch(alertsProvider);
    final selectedFilter = ref.watch(selectedAlertFilterProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppHeader(
        title: 'Alerts & Notices',
        subtitle: 'Critical school-wide updates',
        actions: [
          ElevatedButton(
            onPressed: () {},
            style: AppTheme.headerButtonStyle(),
            child: const Icon(Icons.info_outline, size: 20),
          ),
        ],
      ),
      body: alertsAsync.when(
        data: (data) => RefreshIndicator(
          onRefresh: () => ref.refresh(alertsProvider.future),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Filter Chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _filterOptions.map((filter) {
                    final isSelected = selectedFilter == filter;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        label: Text(filter),
                        selected: isSelected,
                        onSelected: (_) {
                          ref.read(selectedAlertFilterProvider.notifier).state = filter;
                        },
                        backgroundColor: Colors.white,
                        selectedColor: AppTheme.primaryColor.withOpacity(0.2),
                        labelStyle: TextStyle(
                          color: isSelected ? AppTheme.primaryColor : Colors.grey,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                        side: BorderSide(
                          color: isSelected ? AppTheme.primaryColor : Colors.grey.shade300,
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 20),

              // Active Alerts
              if (data.hasActiveAlerts) ...[
                const SizedBox(height: 8),
                ...data.activeAlerts.map((a) => _buildActiveAlert(context, a)),
                const SizedBox(height: 24),
              ],

              // All Clear State
              if (!data.hasActiveAlerts)
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(color: const Color(0xFFE8F5E9), borderRadius: BorderRadius.circular(20)),
                  child: const Row(
                    children: [
                      Text('✅', style: TextStyle(fontSize: 32)),
                      SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('All Clear', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF2E7D32))),
                            Text('No active emergencies at this time.', style: TextStyle(color: Color(0xFF388E3C), fontSize: 13)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 20),

              // History
              if (data.recentAlerts.isNotEmpty) ...[
                const Text('Recent Alerts', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.grey)),
                const SizedBox(height: 12),
                ...data.recentAlerts
                    .where((a) => a['isActive'] == false)
                    .map((a) => _buildHistoryAlert(a)),
              ],
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFD32F2F))),
        error: (err, _) => Center(child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text(err.toString()),
            ElevatedButton(onPressed: () => ref.refresh(alertsProvider), child: const Text('Retry')),
          ],
        )),
      ),
    );
  }

  Widget _buildActiveAlert(BuildContext context, Map<String, dynamic> a) {
    final typeInfo = _typeData[a['type']] ?? {'emoji': '🚨', 'label': 'Emergency', 'severity': 'EMERGENCY'};
    final severity = typeInfo['severity'] ?? 'EMERGENCY';

    Color getBorderColor(String sev) {
      switch (sev) {
        case 'EMERGENCY':
          return const Color(0xFFD32F2F);
        case 'HIGH':
          return const Color(0xFFFF9800);
        case 'MEDIUM':
          return const Color(0xFF2196F3);
        default:
          return Colors.grey;
      }
    }

    final borderColor = getBorderColor(severity);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border(
          left: BorderSide(color: borderColor, width: 6),
        ),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8)],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                if (severity == 'EMERGENCY')
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0, end: 1),
                    duration: const Duration(seconds: 1),
                    builder: (context, value, child) {
                      return Transform.scale(
                        scale: 0.8 + (value * 0.2),
                        child: Icon(
                          Icons.warning_rounded,
                          color: borderColor,
                          size: 24,
                        ),
                      );
                    },
                  )
                else
                  Icon(Icons.info_rounded, color: borderColor, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        typeInfo['label']!,
                        style: TextStyle(
                          color: borderColor,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        a['title'] ?? '',
                        style: const TextStyle(
                          color: Color(0xFF1A1D2E),
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              a['message'] ?? '',
              style: const TextStyle(
                color: Color(0xFF4A5068),
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Sent: ${_formatTime(a['sentAt'])}',
                  style: const TextStyle(color: Colors.grey, fontSize: 11),
                ),
                if (severity == 'EMERGENCY')
                  ElevatedButton(
                    onPressed: () {
                      context.push('/emergency-alarm', extra: {
                        'title': a['title'] ?? 'Emergency Alert',
                        'message': a['message'] ?? 'Please check immediately',
                        'alertType': a['type'] ?? 'GENERAL',
                      });
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: borderColor,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text(
                      'View Details',
                      style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryAlert(Map<String, dynamic> a) {
    final typeInfo = _typeData[a['type']] ?? {'emoji': '🚨', 'label': 'Emergency'};

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEEEEEE)),
      ),
      child: Row(
        children: [
          Text(typeInfo['emoji']!, style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(a['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                Text(_formatTime(a['sentAt']), style: const TextStyle(color: Colors.grey, fontSize: 11)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(8)),
            child: const Text('Resolved', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  String _formatTime(dynamic iso) {
    if (iso == null) return '';
    try {
      final dt = DateTime.parse(iso.toString()).toLocal();
      return '${dt.day}/${dt.month}/${dt.year} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return iso.toString();
    }
  }
}

// ─── Circulars Screen ─────────────────────────────────────────────────────────
class CircularsScreen extends ConsumerWidget {
  const CircularsScreen({super.key});

  static const _typeColors = {
    'CIRCULAR': Color(0xFF1565C0),
    'NOTICE': Color(0xFFF57F17),
    'NEWSLETTER': Color(0xFF1B5E20),
    'FORM': Color(0xFF4A148C),
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brand = ref.watch(schoolBrandProvider);
    final circularsAsync = ref.watch(circularsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppHeader(
        title: 'Circulars',
        subtitle: 'Official notices & newsletters',
        actions: [
          ElevatedButton(
            onPressed: () {},
            style: AppTheme.headerButtonStyle(),
            child: const Icon(Icons.search_rounded, size: 20),
          ),
        ],
      ),
      body: circularsAsync.when(
        data: (circulars) {
          if (circulars.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.article_outlined, size: 64, color: Color(0xFFDDDDDD)),
                  SizedBox(height: 16),
                  Text('No circulars yet', style: TextStyle(color: Colors.grey, fontSize: 16)),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.refresh(circularsProvider.future),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: circulars.length,
              itemBuilder: (ctx, i) {
                final c = circulars[i];
                final color = _typeColors[c['type']] ?? Colors.grey;
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: Container(
                      width: 48, height: 48,
                      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(14)),
                      child: Icon(Icons.article_outlined, color: color, size: 24),
                    ),
                    title: Text(c['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                          child: Text(c['type'] ?? '', style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(height: 4),
                        if (c['content'] != null)
                          Text(c['content'], style: const TextStyle(fontSize: 12, color: Colors.grey), maxLines: 2, overflow: TextOverflow.ellipsis),
                        Text(
                          _formatDate(c['publishedAt']),
                          style: const TextStyle(fontSize: 11, color: Colors.grey),
                        ),
                      ],
                    ),
                    trailing: c['fileUrl'] != null
                        ? Icon(Icons.download, color: color)
                        : const Icon(Icons.chevron_right, color: Colors.grey),
                  ),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text(err.toString()),
              ElevatedButton(onPressed: () => ref.refresh(circularsProvider), child: const Text('Retry')),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(dynamic iso) {
    if (iso == null) return '';
    try {
      final dt = DateTime.parse(iso.toString());
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return '';
    }
  }
}
