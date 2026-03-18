import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/network/api_client.dart';

class TransportApplyScreen extends StatefulWidget {
  final String applicationStatus;
  final String statusMessage;
  final String? rejectionReason;
  final List<Map<String, dynamic>> availableRoutes;
  final VoidCallback? onApplied;

  const TransportApplyScreen({
    Key? key,
    required this.applicationStatus,
    required this.statusMessage,
    this.rejectionReason,
    this.availableRoutes = const [],
    this.onApplied,
  }) : super(key: key);

  @override
  State<TransportApplyScreen> createState() => _TransportApplyScreenState();
}

class _TransportApplyScreenState extends State<TransportApplyScreen>
    with SingleTickerProviderStateMixin {
  final _searchController = TextEditingController();
  final _mapController = MapController();
  String? _selectedRouteId;
  bool _submitting = false;
  bool _submitted = false;
  bool _loadingLocation = false;
  bool _showSearch = false;
  List<Map<String, dynamic>> _searchResults = [];
  Timer? _debounce;

  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  LatLng _pin = const LatLng(13.0827, 80.2707); // Default: Chennai
  String _address = '';
  String _shortAddress = '';

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 500));
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _animController.forward();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _animController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  // ─── CURRENT LOCATION ───
  Future<void> _getCurrentLocation() async {
    setState(() => _loadingLocation = true);
    try {
      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
        if (perm == LocationPermission.denied) {
          _snack('Location permission denied', err: true);
          setState(() => _loadingLocation = false);
          return;
        }
      }
      if (perm == LocationPermission.deniedForever) {
        _snack('Location permanently denied. Enable in Settings.', err: true);
        setState(() => _loadingLocation = false);
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high);
      final ll = LatLng(pos.latitude, pos.longitude);
      await _reverseGeocode(ll);
      _mapController.move(ll, 16);
    } catch (e) {
      _snack('Could not get location: $e', err: true);
    }
    if (mounted) setState(() => _loadingLocation = false);
  }

  // ─── REVERSE GEOCODE via Nominatim ───
  Future<void> _reverseGeocode(LatLng ll) async {
    setState(() => _pin = ll);
    try {
      final res = await Dio().get(
        'https://nominatim.openstreetmap.org/reverse',
        queryParameters: {
          'lat': ll.latitude,
          'lon': ll.longitude,
          'format': 'json',
          'addressdetails': 1,
        },
        options: Options(headers: {
          'User-Agent': 'EduSphere-ParentApp/1.0',
          'Accept-Language': 'en',
        }),
      );
      if (res.statusCode == 200) {
        final data = res.data;
        final displayName = data['display_name'] ?? '';
        final addr = data['address'] ?? {};
        final short = [
          addr['road'] ?? addr['neighbourhood'] ?? '',
          addr['suburb'] ?? addr['city_district'] ?? '',
          addr['city'] ?? addr['town'] ?? addr['village'] ?? '',
        ].where((s) => s.isNotEmpty).join(', ');
        if (mounted) {
          setState(() {
            _address = displayName;
            _shortAddress = short.isNotEmpty ? short : displayName;
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _address =
              '${ll.latitude.toStringAsFixed(5)}, ${ll.longitude.toStringAsFixed(5)}';
          _shortAddress = _address;
        });
      }
    }
  }

  // ─── SEARCH via Nominatim ───
  void _onSearchChanged(String q) {
    _debounce?.cancel();
    if (q.length < 3) {
      setState(() => _searchResults = []);
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 400), () async {
      try {
        final res = await Dio().get(
          'https://nominatim.openstreetmap.org/search',
          queryParameters: {
            'q': q,
            'format': 'json',
            'limit': 6,
            'addressdetails': 1,
            'countrycodes': 'in',
          },
          options: Options(headers: {
            'User-Agent': 'EduSphere-ParentApp/1.0',
            'Accept-Language': 'en',
          }),
        );
        if (res.statusCode == 200 && mounted) {
          final List<dynamic> list = res.data;
          setState(() {
            _searchResults = list
                .map<Map<String, dynamic>>((item) => {
                      'name': item['display_name'] ?? '',
                      'lat': item['lat'] ?? '0',
                      'lon': item['lon'] ?? '0',
                    })
                .toList();
          });
        }
      } catch (_) {
        if (mounted) setState(() => _searchResults = []);
      }
    });
  }

  void _pickSearchResult(Map<String, dynamic> r) {
    final ll = LatLng(double.parse(r['lat']), double.parse(r['lon']));
    _reverseGeocode(ll);
    _mapController.move(ll, 16);
    setState(() {
      _showSearch = false;
      _searchController.clear();
      _searchResults = [];
    });
  }

  // ─── SUBMIT ───
  Future<void> _submit() async {
    if (_address.isEmpty) {
      _snack('Please select your pickup address on the map', err: true);
      return;
    }
    setState(() => _submitting = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final sid = prefs.getString('active_student_id') ?? '';
      final res = await ApiClient.dio.post('/transport', data: {
        'studentId': sid,
        'address': _address,
        'lat': _pin.latitude,
        'lng': _pin.longitude,
        'preferredRouteId': _selectedRouteId,
      });
      if (res.data['success'] == true) {
        setState(() {
          _submitted = true;
          _submitting = false;
        });
        widget.onApplied?.call();
      } else {
        setState(() => _submitting = false);
        _snack(res.data['error'] ?? 'Something went wrong', err: true);
      }
    } catch (e) {
      setState(() => _submitting = false);
      _snack('Failed to submit. Please try again.', err: true);
    }
  }

  void _snack(String msg, {bool err = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg,
          style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white)),
      backgroundColor: err ? const Color(0xFFEF4444) : const Color(0xFF10B981),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.all(16),
    ));
  }

  // ═══════════════════════════
  //  BUILD
  // ═══════════════════════════
  @override
  Widget build(BuildContext context) {
    if (_submitted) return _successView();
    if (widget.applicationStatus == 'PENDING') return _pendingView();
    if (widget.applicationStatus == 'REJECTED') return _rejectedView();
    return _formView();
  }

  // ──── SUCCESS ────
  Widget _successView() => Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            _statusBadge(Icons.check_rounded, const Color(0xFF10B981)),
            const SizedBox(height: 24),
            const Text('Application Submitted!',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
            const SizedBox(height: 10),
            const Text('Your transport application has been sent. You will be notified once reviewed.',
                style: TextStyle(fontSize: 13, color: Color(0x99FFFFFF), height: 1.5),
                textAlign: TextAlign.center),
            const SizedBox(height: 28),
            _infoBox('What happens next?', Icons.schedule, [
              'School admin will review your application',
              'A route and stop will be assigned',
              'You can track the bus once approved',
            ]),
          ]),
        ),
      );

  // ──── PENDING ────
  Widget _pendingView() => FadeTransition(
        opacity: _fadeAnim,
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              _statusBadge(Icons.hourglass_top_rounded, const Color(0xFFF59E0B)),
              const SizedBox(height: 24),
              const Text('Application Under Review',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
              const SizedBox(height: 10),
              Text(widget.statusMessage,
                  style: const TextStyle(fontSize: 13, color: Color(0x99FFFFFF), height: 1.5),
                  textAlign: TextAlign.center),
              const SizedBox(height: 28),
              _infoBox('Your application is being processed', Icons.info_outline, [
                'The school will assign a bus route',
                'You can track the bus once approved',
                'Check back soon for updates',
              ]),
            ]),
          ),
        ),
      );

  // ──── REJECTED ────
  Widget _rejectedView() => FadeTransition(
        opacity: _fadeAnim,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(children: [
            const SizedBox(height: 16),
            _statusBadge(Icons.close_rounded, const Color(0xFFEF4444)),
            const SizedBox(height: 18),
            const Text('Application Not Approved',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
            const SizedBox(height: 8),
            if (widget.rejectionReason != null && widget.rejectionReason!.isNotEmpty)
              Container(
                margin: const EdgeInsets.symmetric(vertical: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.2)),
                ),
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Icon(Icons.message_outlined, color: Color(0xFFEF4444), size: 16),
                  const SizedBox(width: 10),
                  Expanded(child: Text(widget.rejectionReason!,
                      style: const TextStyle(fontSize: 12, color: Color(0xB3FFFFFF), height: 1.4))),
                ]),
              ),
            const Text('You can re-apply with updated details below.',
                style: TextStyle(fontSize: 13, color: Color(0x80FFFFFF))),
            const SizedBox(height: 16),
            _mapWidget(),
            _addressCard(),
            if (widget.availableRoutes.isNotEmpty) ...[const SizedBox(height: 16), _routeSection()],
            const SizedBox(height: 20),
            _submitBtn('Re-Apply'),
            const SizedBox(height: 20),
          ]),
        ),
      );

  // ──── FORM ────
  Widget _formView() => FadeTransition(
        opacity: _fadeAnim,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            // Hero
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                    colors: [Color(0xFF1E1B58), Color(0xFF12113A)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight),
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF6366F1).withOpacity(0.15), blurRadius: 24, offset: const Offset(0, 8))
                ],
              ),
              child: Row(children: [
                Container(
                  width: 50, height: 50,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)]),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.directions_bus_rounded, color: Colors.white, size: 26),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Apply for Transport',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.3)),
                    SizedBox(height: 3),
                    Text('Pick your pickup location on the map',
                        style: TextStyle(fontSize: 12, color: Color(0x99FFFFFF))),
                  ]),
                ),
              ]),
            ),
            const SizedBox(height: 20),
            _mapWidget(),
            _addressCard(),
            if (widget.availableRoutes.isNotEmpty) ...[const SizedBox(height: 16), _routeSection()],
            const SizedBox(height: 20),
            _submitBtn(),
            const SizedBox(height: 20),
          ]),
        ),
      );

  // ═════════════════════════════
  //  MAP WIDGET (full-width, tall)
  // ═════════════════════════════
  Widget _mapWidget() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _label('Pickup Location', Icons.location_on_outlined),
        const SizedBox(height: 10),

        // ── SEARCH BAR + GPS BUTTON (outside the map so taps work) ──
        Row(children: [
          // Search bar - tappable
          Expanded(
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () => setState(() => _showSearch = true),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E1B58).withOpacity(0.6),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.25)),
                ),
                child: Row(children: [
                  const Icon(Icons.search, size: 18, color: Color(0xFF818CF8)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _shortAddress.isNotEmpty ? _shortAddress : 'Search for a location…',
                      style: TextStyle(
                          fontSize: 13,
                          color: _shortAddress.isNotEmpty ? Colors.white : const Color(0x66FFFFFF)),
                      maxLines: 1, overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (_shortAddress.isNotEmpty)
                    const Icon(Icons.edit_outlined, size: 14, color: Color(0x66FFFFFF)),
                ]),
              ),
            ),
          ),
          const SizedBox(width: 8),
          // GPS button
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: _loadingLocation ? null : _getCurrentLocation,
            child: Container(
              width: 46, height: 46,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)]),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [BoxShadow(color: const Color(0xFF6366F1).withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 3))],
              ),
              child: _loadingLocation
                  ? const Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.my_location, color: Colors.white, size: 20),
            ),
          ),
        ]),

        // ── SEARCH PANEL (appears below search bar) ──
        if (_showSearch) _searchPanel(),

        const SizedBox(height: 10),

        // ── MAP (clean, just pin + hint) ──
        SizedBox(
          height: 360,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Stack(
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: _pin,
                    initialZoom: 14,
                    onTap: (_, ll) => _reverseGeocode(ll),
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.edusphere.parent',
                    ),
                    MarkerLayer(markers: [
                      Marker(
                        point: _pin,
                        width: 48,
                        height: 48,
                        child: _pinIcon(),
                      ),
                    ]),
                  ],
                ),
                // Hint
                if (_address.isEmpty)
                  Positioned(
                    bottom: 10, left: 0, right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(20)),
                        child: const Text('Tap on the map to set pickup point',
                            style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500)),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ─── SEARCH PANEL (dropdown below search bar) ───
  Widget _searchPanel() {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1744),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.25)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 6)),
        ],
      ),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        // Search TextField
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 6, 8, 4),
          child: Row(children: [
            const Icon(Icons.search, size: 18, color: Color(0xFF818CF8)),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: _searchController,
                autofocus: true,
                onChanged: _onSearchChanged,
                style: const TextStyle(fontSize: 14, color: Colors.white),
                decoration: const InputDecoration(
                  hintText: 'Search address, area, landmark…',
                  hintStyle: TextStyle(color: Color(0x55FFFFFF), fontSize: 14),
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(vertical: 10),
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close, size: 18, color: Color(0x99FFFFFF)),
              onPressed: () => setState(() {
                _showSearch = false;
                _searchController.clear();
                _searchResults = [];
              }),
            ),
          ]),
        ),
        Divider(height: 1, color: const Color(0xFF6366F1).withOpacity(0.15)),
        // Use Current Location
        InkWell(
          onTap: () {
            setState(() { _showSearch = false; _searchController.clear(); _searchResults = []; });
            _getCurrentLocation();
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(children: [
              Container(
                width: 32, height: 32,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)]),
                  borderRadius: BorderRadius.circular(9),
                ),
                child: const Icon(Icons.my_location, size: 15, color: Colors.white),
              ),
              const SizedBox(width: 12),
              const Text('Use Current Location',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF818CF8))),
            ]),
          ),
        ),
        // Results
        if (_searchResults.isNotEmpty) ...[
          Divider(height: 1, color: const Color(0xFF6366F1).withOpacity(0.15)),
          ConstrainedBox(
            constraints: const BoxConstraints(maxHeight: 200),
            child: ListView.separated(
              shrinkWrap: true,
              padding: EdgeInsets.zero,
              itemCount: _searchResults.length,
              separatorBuilder: (_, __) => Divider(height: 1, color: const Color(0xFF6366F1).withOpacity(0.08)),
              itemBuilder: (_, i) {
                final r = _searchResults[i];
                return InkWell(
                  onTap: () => _pickSearchResult(r),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                    child: Row(children: [
                      const Icon(Icons.location_on_outlined, size: 16, color: Color(0xFF818CF8)),
                      const SizedBox(width: 10),
                      Expanded(child: Text(r['name'] ?? '',
                          style: const TextStyle(fontSize: 12, color: Color(0xCCFFFFFF), height: 1.3),
                          maxLines: 2, overflow: TextOverflow.ellipsis)),
                    ]),
                  ),
                );
              },
            ),
          ),
        ],
      ]),
    );
  }

  // ─── ADDRESS CARD ───
  Widget _addressCard() {
    if (_address.isEmpty) return const SizedBox(height: 8);
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1B58).withOpacity(0.6),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.2)),
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.pin_drop, size: 18, color: Color(0xFF818CF8)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('SELECTED ADDRESS',
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0x80FFFFFF), letterSpacing: 1.2)),
              const SizedBox(height: 4),
              Text(_address,
                  style: const TextStyle(fontSize: 13, color: Colors.white, fontWeight: FontWeight.w600, height: 1.4),
                  maxLines: 3, overflow: TextOverflow.ellipsis),
            ]),
          ),
        ]),
      ),
    );
  }

  // ─── ROUTE SECTION ───
  Widget _routeSection() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _label('Preferred Route (Optional)', Icons.route_outlined),
      const SizedBox(height: 10),
      ...widget.availableRoutes.map(_routeCard),
    ]);
  }

  Widget _routeCard(Map<String, dynamic> route) {
    final stops = (route['stops'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final sel = _selectedRouteId == route['id'];
    return GestureDetector(
      onTap: () => setState(() => _selectedRouteId = route['id'] as String),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: sel ? const Color(0xFF6366F1).withOpacity(0.1) : const Color(0xFF1E1B58).withOpacity(0.4),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: sel ? const Color(0xFF6366F1).withOpacity(0.5) : const Color(0xFF6366F1).withOpacity(0.1),
            width: sel ? 1.5 : 1,
          ),
        ),
        child: Row(children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: sel ? const Color(0xFF6366F1).withOpacity(0.2) : const Color(0xFF0F0D2A),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(Icons.directions_bus_rounded, size: 18,
                color: sel ? const Color(0xFF818CF8) : const Color(0x66FFFFFF)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(route['name'] as String,
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700,
                      color: sel ? const Color(0xFF818CF8) : Colors.white)),
              if (stops.isNotEmpty)
                Text('${stops.length} stops', style: const TextStyle(fontSize: 11, color: Color(0x80FFFFFF))),
            ]),
          ),
          if (sel) const Icon(Icons.check_circle, color: Color(0xFF6366F1), size: 20),
        ]),
      ),
    );
  }

  // ─── SUBMIT BUTTON ───
  Widget _submitBtn([String label = 'Submit Application']) {
    return SizedBox(
      width: double.infinity, height: 54,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: _submitting
              ? [const Color(0xFF6366F1).withOpacity(0.4), const Color(0xFF8B5CF6).withOpacity(0.4)]
              : [const Color(0xFF6366F1), const Color(0xFF8B5CF6)]),
          borderRadius: BorderRadius.circular(16),
          boxShadow: _submitting ? [] : [BoxShadow(color: const Color(0xFF6366F1).withOpacity(0.3), blurRadius: 14, offset: const Offset(0, 6))],
        ),
        child: MaterialButton(
          onPressed: _submitting ? null : _submit,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: _submitting
              ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
              : Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const Icon(Icons.send_rounded, size: 18, color: Colors.white),
                  const SizedBox(width: 10),
                  Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
                ]),
        ),
      ),
    );
  }

  // ─── HELPERS ───
  Widget _pinIcon() => Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
          padding: const EdgeInsets.all(7),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)]),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [BoxShadow(color: const Color(0xFF6366F1).withOpacity(0.4), blurRadius: 10, offset: const Offset(0, 4))],
          ),
          child: const Icon(Icons.location_on, color: Colors.white, size: 18),
        ),
        Container(width: 3, height: 8,
            decoration: const BoxDecoration(color: Color(0xFF6366F1),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(2)))),
      ]);

  Widget _statusBadge(IconData icon, Color c) => Container(
        width: 86, height: 86,
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [c, c.withOpacity(0.8)]),
          borderRadius: BorderRadius.circular(26),
          boxShadow: [BoxShadow(color: c.withOpacity(0.3), blurRadius: 24, offset: const Offset(0, 8))],
        ),
        child: Icon(icon, color: Colors.white, size: 42),
      );

  Widget _label(String t, IconData i) => Row(children: [
        Icon(i, size: 15, color: const Color(0xFF818CF8)),
        const SizedBox(width: 8),
        Text(t, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 0.5)),
      ]);

  Widget _infoBox(String title, IconData icon, List<String> items) => Container(
        width: double.infinity, padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1B58).withOpacity(0.5),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.15)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Icon(icon, size: 16, color: const Color(0xFF818CF8)),
            const SizedBox(width: 10),
            Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white)),
          ]),
          const SizedBox(height: 12),
          ...items.map((s) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 3),
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Padding(padding: EdgeInsets.only(top: 5), child: Icon(Icons.circle, size: 4, color: Color(0xFF818CF8))),
                  const SizedBox(width: 10),
                  Expanded(child: Text(s, style: const TextStyle(fontSize: 12, color: Color(0x99FFFFFF), height: 1.3))),
                ]),
              )),
        ]),
      );
}
