import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:latlong2/latlong.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import 'package:url_launcher/url_launcher.dart';
import 'transport_apply_screen.dart';

class BusTrackerScreen extends StatefulWidget {
  const BusTrackerScreen({Key? key}) : super(key: key);

  @override
  State<BusTrackerScreen> createState() => _BusTrackerScreenState();
}

class _BusTrackerScreenState extends State<BusTrackerScreen> with TickerProviderStateMixin {
  Timer? _pollTimer;
  bool _isLoading = true;
  bool _isActive = false;
  String _error = '';

  // Transport data
  String _tripType = 'PICKUP';
  Map<String, dynamic>? _route;
  Map<String, dynamic>? _vehicle;
  Map<String, dynamic>? _driver;
  Map<String, dynamic>? _pickupStop;
  Map<String, dynamic>? _dropStop;
  Map<String, dynamic>? _telemetry;
  List<Map<String, dynamic>> _routeStops = [];
  String _statusMessage = 'Loading...';

  // Application state
  String _applicationStatus = 'NOT_APPLIED';
  String? _rejectionReason;
  List<Map<String, dynamic>> _availableRoutes = [];

  // Map
  final MapController _mapController = MapController();
  LatLng? _busPosition;
  double _busHeading = 0;

  // Animation
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  // Default center (Bangalore)
  final LatLng _defaultCenter = const LatLng(12.9716, 77.5946);

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 0.4, end: 1.0).animate(_pulseController);

    _loadTransportData();
    _pollTimer = Timer.periodic(const Duration(seconds: 10), (_) => _loadTransportData());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _loadTransportData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final activeStudentId = prefs.getString('active_student_id') ?? '';
      if (activeStudentId.isEmpty) {
        setState(() {
          _isLoading = false;
          _isActive = false;
          _statusMessage = 'No student selected';
        });
        return;
      }

      final response = await ApiClient.dio.get('/transport', queryParameters: {
        'studentId': activeStudentId,
      });

      if (response.data['success'] == true) {
        final isActive = response.data['isActive'] == true;
        setState(() {
          _isLoading = false;
          _isActive = isActive;
          _applicationStatus = response.data['applicationStatus'] ?? 'NOT_APPLIED';
          if (isActive) {
            _tripType = response.data['tripType'] ?? 'PICKUP';
            _route = response.data['route'];
            _vehicle = response.data['vehicle'];
            _driver = response.data['driver'];
            _pickupStop = response.data['studentStops']?['pickup'];
            _dropStop = response.data['studentStops']?['drop'];
            _telemetry = response.data['liveTelemetry'];
            _statusMessage = _telemetry?['status'] ?? 'On Route';

            // Parse route stops
            final stops = response.data['routeStops'] as List?;
            if (stops != null) {
              _routeStops = stops.map<Map<String, dynamic>>((s) => Map<String, dynamic>.from(s)).toList();
            }

            // Update bus position
            if (_telemetry != null && _telemetry!['lat'] != null && _telemetry!['lng'] != null) {
              _busPosition = LatLng(
                (_telemetry!['lat'] as num).toDouble(),
                (_telemetry!['lng'] as num).toDouble(),
              );
              _busHeading = (_telemetry?['heading'] as num?)?.toDouble() ?? 0;
            }
          } else {
            _statusMessage = response.data['message'] ?? 'No active trip';
            _rejectionReason = response.data['rejectionReason'];
            // Parse available routes
            final routes = response.data['availableRoutes'] as List?;
            if (routes != null) {
              _availableRoutes = routes.map<Map<String, dynamic>>((r) => Map<String, dynamic>.from(r)).toList();
            }
          }
          _error = '';
        });
      }
    } catch (e) {
      // On error, show the application form (not demo data)
      if (_isLoading) {
        setState(() {
          _isLoading = false;
          _isActive = false;
          _applicationStatus = 'NOT_APPLIED';
          _statusMessage = 'Could not connect to server. You can still apply for transport below.';
          _error = '';
        });
      }
    }
  }

  Future<void> _callDriver() async {
    final phone = _driver?['phone'];
    if (phone != null) {
      final uri = Uri.parse('tel:$phone');
      try { await launchUrl(uri); } catch (_) {}
    }
  }

  LatLng get _mapCenter {
    if (_busPosition != null) return _busPosition!;
    final stop = _tripType == 'PICKUP' ? _pickupStop : _dropStop;
    if (stop != null && stop['lat'] != null && stop['lng'] != null) {
      return LatLng((stop['lat'] as num).toDouble(), (stop['lng'] as num).toDouble());
    }
    return _defaultCenter;
  }

  List<LatLng> get _routePolyline {
    return _routeStops
        .where((s) => s['lat'] != null && s['lng'] != null)
        .map((s) => LatLng((s['lat'] as num).toDouble(), (s['lng'] as num).toDouble()))
        .toList();
  }

  String get _etaMinutes {
    final speed = (_telemetry?['speed'] ?? 0).toDouble();
    if (speed > 0) {
      final remaining = max(1, (15 * (1 - _routeProgress)).round());
      return '$remaining';
    }
    return '8';
  }

  double get _routeProgress {
    if (_routeStops.isEmpty || _busPosition == null) return 0.5;
    // Find nearest stop to bus position
    double minDist = double.infinity;
    int nearestIdx = 0;
    for (int i = 0; i < _routeStops.length; i++) {
      final s = _routeStops[i];
      if (s['lat'] == null || s['lng'] == null) continue;
      final d = _distanceBetween(
        _busPosition!.latitude, _busPosition!.longitude,
        (s['lat'] as num).toDouble(), (s['lng'] as num).toDouble(),
      );
      if (d < minDist) {
        minDist = d;
        nearestIdx = i;
      }
    }
    return (nearestIdx + 0.5) / _routeStops.length;
  }

  double _distanceBetween(double lat1, double lng1, double lat2, double lng2) {
    final dLat = (lat2 - lat1) * pi / 180;
    final dLng = (lng2 - lng1) * pi / 180;
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1 * pi / 180) * cos(lat2 * pi / 180) * sin(dLng / 2) * sin(dLng / 2);
    return 6371 * 2 * atan2(sqrt(a), sqrt(1 - a)); // km
  }

  String get _distanceRemaining {
    if (_busPosition == null) return '3.2';
    final stop = _tripType == 'PICKUP' ? _pickupStop : _dropStop;
    if (stop == null || stop['lat'] == null) return '--';
    final d = _distanceBetween(
      _busPosition!.latitude, _busPosition!.longitude,
      (stop['lat'] as num).toDouble(), (stop['lng'] as num).toDouble(),
    );
    return d.toStringAsFixed(1);
  }

  Color _getStatusColor() {
    switch (_statusMessage.toUpperCase()) {
      case 'ON_ROUTE': case 'MOVING': return const Color(0xFF10B981);
      case 'STOPPED': case 'AT_STOP': return const Color(0xFFF59E0B);
      case 'DELAYED': return const Color(0xFFEF4444);
      default: return const Color(0xFF10B981);
    }
  }

  String _getStatusLabel() {
    switch (_statusMessage.toUpperCase()) {
      case 'ON_ROUTE': case 'MOVING': return '● On Route';
      case 'STOPPED': return '◼ Stopped';
      case 'AT_STOP': return '◉ At Stop';
      case 'DELAYED': return '⚠ Delayed';
      default: return '● On Route';
    }
  }

  bool _isStudentStop(Map<String, dynamic> stop) {
    final studentStop = _tripType == 'PICKUP' ? _pickupStop : _dropStop;
    if (studentStop == null) return false;
    return stop['id'] == studentStop['id'] || stop['name'] == studentStop['name'];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070E1A),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF38BDF8)))
            : Column(
                children: [
                  _buildHeader(),
                  Expanded(
                    child: _isActive
                        ? _buildActiveContent()
                        : _buildNoTripState(),
                  ),
                ],
              ),
      ),
    );
  }

  // ─── HEADER ──────────────────────────────
  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: const Color(0xFF070E1A),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 16),
            ),
          ),
          const SizedBox(width: 12),
          Text('Bus Tracker', style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white)),
          const SizedBox(width: 10),
          if (_isActive)
            AnimatedBuilder(
              animation: _pulseAnimation,
              builder: (ctx, _) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.15 + _pulseAnimation.value * 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3 + _pulseAnimation.value * 0.2)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6, height: 6,
                      decoration: BoxDecoration(
                        color: Color.lerp(const Color(0xFF10B981), const Color(0xFF34D399), _pulseAnimation.value),
                        shape: BoxShape.circle,
                        boxShadow: [BoxShadow(color: const Color(0xFF10B981).withOpacity(_pulseAnimation.value * 0.6), blurRadius: 6)],
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Text('LIVE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF10B981), letterSpacing: 0.5)),
                  ],
                ),
              ),
            ),
          const Spacer(),
          if (_isActive)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: _tripType == 'PICKUP' ? const Color(0xFFF97316).withOpacity(0.15) : const Color(0xFF8B5CF6).withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                _tripType == 'PICKUP' ? '🌅 Pickup' : '🌇 Drop',
                style: TextStyle(
                  fontSize: 11, fontWeight: FontWeight.w800,
                  color: _tripType == 'PICKUP' ? const Color(0xFFF97316) : const Color(0xFF8B5CF6),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // ─── ACTIVE CONTENT ──────────────────────
  Widget _buildActiveContent() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        children: [
          // MAP
          _buildMapView(),
          // ETA Panel
          _buildETAPanel(),
          // Details sheet
          Container(
            decoration: const BoxDecoration(
              color: Color(0xFFF0F2F5),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(28),
                topRight: Radius.circular(28),
              ),
            ),
            child: Column(
              children: [
                const SizedBox(height: 12),
                Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)))),
                const SizedBox(height: 16),
                _buildStudentStopCard(),
                const SizedBox(height: 12),
                _buildDriverCard(),
                const SizedBox(height: 12),
                _buildRouteTimeline(),
                const SizedBox(height: 12),
                _buildVehicleInfoCard(),
                const SizedBox(height: 30),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── MAP VIEW ────────────────────────────
  Widget _buildMapView() {
    return SizedBox(
      height: 280,
      child: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _mapCenter,
              initialZoom: 13.5,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.bodhiboard.parentapp',
              ),
              // Route polyline
              if (_routePolyline.length >= 2)
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: _routePolyline,
                      color: const Color(0xFF3B82F6),
                      strokeWidth: 4,
                    ),
                  ],
                ),
              // Stop markers
              MarkerLayer(
                markers: [
                  // Route stop markers
                  ..._routeStops.where((s) => s['lat'] != null && s['lng'] != null).map((s) {
                    final isStudent = _isStudentStop(s);
                    return Marker(
                      point: LatLng((s['lat'] as num).toDouble(), (s['lng'] as num).toDouble()),
                      width: isStudent ? 36 : 24,
                      height: isStudent ? 36 : 24,
                      child: Container(
                        decoration: BoxDecoration(
                          color: isStudent ? const Color(0xFF10B981) : const Color(0xFF3B82F6),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: isStudent ? 3 : 2),
                          boxShadow: [
                            BoxShadow(
                              color: (isStudent ? const Color(0xFF10B981) : const Color(0xFF3B82F6)).withOpacity(0.5),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: Icon(
                          isStudent ? Icons.person_pin_circle : Icons.location_on,
                          color: Colors.white,
                          size: isStudent ? 18 : 12,
                        ),
                      ),
                    );
                  }),
                  // Bus marker
                  if (_busPosition != null)
                    Marker(
                      point: _busPosition!,
                      width: 44,
                      height: 44,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFFF97316), Color(0xFFEF4444)]),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: [
                            BoxShadow(color: const Color(0xFFF97316).withOpacity(0.6), blurRadius: 16, spreadRadius: 3),
                          ],
                        ),
                        child: const Icon(Icons.directions_bus, color: Colors.white, size: 22),
                      ),
                    ),
                ],
              ),
            ],
          ),
          // Speed overlay
          Positioned(
            top: 12, right: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.7),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.speed, color: Color(0xFF38BDF8), size: 14),
                  const SizedBox(width: 4),
                  Text('${_telemetry?['speed'] ?? 0} km/h', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
                ],
              ),
            ),
          ),
          // Last updated overlay
          Positioned(
            top: 12, left: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.7),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.update, color: Color(0xFF10B981), size: 12),
                  const SizedBox(width: 4),
                  Text(
                    _telemetry?['lastUpdated'] != null ? 'Just now' : 'Awaiting GPS',
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.white70),
                  ),
                ],
              ),
            ),
          ),
          // Re-center button
          Positioned(
            bottom: 12, right: 12,
            child: GestureDetector(
              onTap: () {
                _mapController.move(_mapCenter, 13.5);
              },
              child: Container(
                width: 40, height: 40,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 8)],
                ),
                child: const Icon(Icons.my_location, color: Color(0xFF3B82F6), size: 20),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── ETA PANEL ──────────────────────────
  Widget _buildETAPanel() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF070E1A), Color(0xFF0F1729)],
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        _isActive ? _etaMinutes : '--',
                        style: GoogleFonts.outfit(fontSize: 48, fontWeight: FontWeight.w900, color: Colors.white, height: 1),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 6, left: 4),
                        child: Text('min', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white54)),
                      ),
                    ],
                  ),
                  Text(
                    _tripType == 'PICKUP' ? 'Until pickup at your stop' : 'Until drop at your stop',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.white54),
                  ),
                ],
              ),
              const Spacer(),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _getStatusColor().withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _getStatusColor().withOpacity(0.3)),
                    ),
                    child: Text(_getStatusLabel(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: _getStatusColor())),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.route, color: Colors.white38, size: 14),
                      const SizedBox(width: 4),
                      Text('$_distanceRemaining km away', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white60)),
                    ],
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Progress bar
          Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Route Progress', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white38)),
                  Text('${(_routeProgress * 100).round()}% complete', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF38BDF8))),
                ],
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 8,
                child: Stack(
                  children: [
                    Container(decoration: BoxDecoration(color: Colors.white.withOpacity(0.06), borderRadius: BorderRadius.circular(4))),
                    FractionallySizedBox(
                      widthFactor: _routeProgress.clamp(0, 1),
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFF0EA5E9), Color(0xFF38BDF8), Color(0xFF10B981)]),
                          borderRadius: BorderRadius.circular(4),
                          boxShadow: [BoxShadow(color: const Color(0xFF38BDF8).withOpacity(0.4), blurRadius: 8)],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ─── STUDENT STOP CARD ──────────────────
  Widget _buildStudentStopCard() {
    final stop = _tripType == 'PICKUP' ? _pickupStop : _dropStop;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF10B981), Color(0xFF059669)]),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: const Color(0xFF10B981).withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(14)),
            child: const Icon(Icons.person_pin_circle, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _tripType == 'PICKUP' ? 'YOUR PICKUP STOP' : 'YOUR DROP STOP',
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white.withOpacity(0.7), letterSpacing: 1),
                ),
                const SizedBox(height: 4),
                Text(stop?['name'] ?? 'Not assigned', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
                Text('Scheduled: ${stop?['time'] ?? '--:--'}', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white.withOpacity(0.8))),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
            child: Column(
              children: [
                Text(_etaMinutes, style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
                const Text('min', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white70)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── DRIVER CARD ────────────────────────
  Widget _buildDriverCard() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Row(
        children: [
          Container(
            width: 50, height: 50,
            decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)]), borderRadius: BorderRadius.circular(16)),
            child: const Icon(Icons.person, color: Colors.white, size: 26),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('DRIVER', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: AppTheme.t4, letterSpacing: 1)),
                const SizedBox(height: 2),
                Text(_driver?['name'] ?? 'Not Assigned', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.t1)),
                if (_vehicle != null)
                  Text('🚌 ${_vehicle!['registrationNumber'] ?? ''} · ${_vehicle!['capacity'] ?? ''} seats',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.t3)),
              ],
            ),
          ),
          if (_driver?['phone'] != null)
            GestureDetector(
              onTap: _callDriver,
              child: Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF059669)]),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [BoxShadow(color: const Color(0xFF10B981).withOpacity(0.3), blurRadius: 8)],
                ),
                child: const Icon(Icons.phone, color: Colors.white, size: 20),
              ),
            ),
        ],
      ),
    );
  }

  // ─── ROUTE TIMELINE ─────────────────────
  Widget _buildRouteTimeline() {
    if (_routeStops.isEmpty) return const SizedBox();
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.timeline, color: Color(0xFF3B82F6), size: 18),
              const SizedBox(width: 8),
              Text('Route Timeline', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.t1)),
              const Spacer(),
              Text('${_routeStops.length} stops', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.t4)),
            ],
          ),
          const SizedBox(height: 14),
          ..._routeStops.asMap().entries.map((entry) {
            final stop = entry.value;
            final isStudentStop = _isStudentStop(stop);
            final busStopIndex = _busPosition != null ? _getNearestStopIndex() : 0;
            final isDone = entry.key < busStopIndex;
            final isCurrent = entry.key == busStopIndex;

            Color dotColor = isDone ? const Color(0xFF38BDF8) : isCurrent ? const Color(0xFF10B981) : const Color(0xFFE2E8F0);
            Color lineColor = isDone ? const Color(0xFF38BDF8).withOpacity(0.3) : const Color(0xFFE2E8F0);
            final isLast = entry.key == _routeStops.length - 1;

            return IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 30,
                    child: Column(
                      children: [
                        Container(
                          width: (isCurrent || isStudentStop) ? 20 : 14,
                          height: (isCurrent || isStudentStop) ? 20 : 14,
                          decoration: BoxDecoration(
                            color: isStudentStop ? const Color(0xFF10B981) : dotColor,
                            shape: BoxShape.circle,
                            border: (isCurrent || isStudentStop) ? Border.all(color: (isStudentStop ? const Color(0xFF10B981) : dotColor).withOpacity(0.3), width: 3) : null,
                            boxShadow: (isCurrent || isStudentStop) ? [BoxShadow(color: (isStudentStop ? const Color(0xFF10B981) : dotColor).withOpacity(0.3), blurRadius: 8)] : [],
                          ),
                          child: isDone
                              ? const Icon(Icons.check, color: Colors.white, size: 10)
                              : isCurrent
                                  ? const Icon(Icons.directions_bus, color: Colors.white, size: 10)
                                  : isStudentStop
                                      ? const Icon(Icons.person, color: Colors.white, size: 10)
                                      : null,
                        ),
                        if (!isLast)
                          Expanded(child: Container(width: 2, margin: const EdgeInsets.symmetric(vertical: 2), color: lineColor)),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: (isCurrent || isStudentStop) ? const EdgeInsets.all(10) : const EdgeInsets.symmetric(vertical: 2),
                      decoration: (isCurrent || isStudentStop)
                          ? BoxDecoration(
                              color: (isStudentStop ? const Color(0xFF10B981) : const Color(0xFF3B82F6)).withOpacity(0.06),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: (isStudentStop ? const Color(0xFF10B981) : const Color(0xFF3B82F6)).withOpacity(0.15)),
                            )
                          : null,
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  stop['name'] ?? 'Stop',
                                  style: TextStyle(fontSize: 13, fontWeight: (isCurrent || isStudentStop) ? FontWeight.w800 : FontWeight.w600, color: AppTheme.t1),
                                ),
                                if (isStudentStop) Text('Your Stop', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: const Color(0xFF10B981))),
                              ],
                            ),
                          ),
                          Text(
                            _tripType == 'PICKUP' ? (stop['pickupTime'] ?? '') : (stop['dropTime'] ?? ''),
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: isDone ? AppTheme.t4 : AppTheme.t2),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  int _getNearestStopIndex() {
    if (_busPosition == null || _routeStops.isEmpty) return 0;
    double minDist = double.infinity;
    int idx = 0;
    for (int i = 0; i < _routeStops.length; i++) {
      final s = _routeStops[i];
      if (s['lat'] == null || s['lng'] == null) continue;
      final d = _distanceBetween(_busPosition!.latitude, _busPosition!.longitude, (s['lat'] as num).toDouble(), (s['lng'] as num).toDouble());
      if (d < minDist) { minDist = d; idx = i; }
    }
    return idx;
  }

  // ─── VEHICLE INFO CARD ──────────────────
  Widget _buildVehicleInfoCard() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.directions_bus_filled, color: Color(0xFF3B82F6), size: 18),
              const SizedBox(width: 8),
              Text('Vehicle Details', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.t1)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildInfoChip('Route', _route?['name'] ?? '--', Icons.route),
              const SizedBox(width: 10),
              _buildInfoChip('Vehicle', _vehicle?['registrationNumber'] ?? '--', Icons.directions_bus),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildInfoChip('Capacity', '${_vehicle?['capacity'] ?? '--'} seats', Icons.people),
              const SizedBox(width: 10),
              _buildInfoChip('Speed', '${_telemetry?['speed'] ?? 0} km/h', Icons.speed),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: const Color(0xFF64748B)),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: AppTheme.t4)),
                  Text(value, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.t1), overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── NO TRIP STATE ──────────────────────
  Widget _buildNoTripState() {
    return TransportApplyScreen(
      applicationStatus: _applicationStatus,
      statusMessage: _statusMessage,
      rejectionReason: _rejectionReason,
      availableRoutes: _availableRoutes,
      onApplied: () {
        // Refresh data after applying
        _loadTransportData();
      },
    );
  }
}
