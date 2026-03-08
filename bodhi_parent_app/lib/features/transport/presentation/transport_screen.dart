import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../ui/components/app_header.dart';
import '../../../core/theme/app_theme.dart';
import '../data/transport_provider.dart';
import '../../dashboard/data/dashboard_provider.dart';

class TransportScreen extends ConsumerStatefulWidget {
  const TransportScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<TransportScreen> createState() => _TransportScreenState();
}

class _TransportScreenState extends ConsumerState<TransportScreen> {
  int _selectedTabIndex = 0;
  GoogleMapController? _mapController;

  // Default to school location (India) if no GPS data yet
  static const _defaultPosition = LatLng(28.6139, 77.2090);

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final dashboardAsync = ref.read(dashboardDataProvider);
      final activeStudentId = dashboardAsync.value?['activeStudentId'];
      if (activeStudentId != null) {
        ref.read(liveTransportDataProvider(activeStudentId).notifier).startPolling();
      }
    });
  }

  @override
  void deactivate() {
    final dashboardAsync = ref.read(dashboardDataProvider);
    final activeStudentId = dashboardAsync.value?['activeStudentId'];
    if (activeStudentId != null) {
       ref.read(liveTransportDataProvider(activeStudentId).notifier).stopPolling();
    }
    super.deactivate();
  }

  @override
  Widget build(BuildContext context) {
    final dashboardAsync = ref.watch(dashboardDataProvider);
    final activeStudentId = dashboardAsync.value?['activeStudentId'];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppHeader(
        title: 'Transport',
        subtitle: 'Bus #7 · South Colony Route',
        showBackButton: false,
        showMenuButton: true,
        actions: [
          ElevatedButton(
            onPressed: () {},
            style: AppTheme.headerButtonStyle(),
            child: const Icon(Icons.info_outline, size: 20),
          ),
        ],
      ),
      body: activeStudentId == null 
        ? const Center(child: CircularProgressIndicator())
        : _buildTransportBody(context, activeStudentId),
    );
  }

  Widget _buildTransportBody(BuildContext context, String studentId) {
    final transportAsync = ref.watch(liveTransportDataProvider(studentId));

    return transportAsync.when(
      data: (data) {
        // If real data says not active, handle it. Let's assume we show the active UI with mock data if needed for the demo
        final isActive = data['isActive'] ?? true; 
        
        if (!isActive) {
           return Center(
             child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.directions_bus_filled_outlined, size: 80, color: Color(0xFFCBD5E1)),
                  const SizedBox(height: 16),
                  Text("Transport not active", style: GoogleFonts.sora(fontSize: 18, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
                  const SizedBox(height: 8),
                  Text("Tracking will resume when the bus starts moving.", style: GoogleFonts.dmSans(color: const Color(0xFF64748B))),
                ],
             ),
           );
        }

        return RefreshIndicator(
          onRefresh: () async {
            // ref.invalidate(liveTransportDataProvider(studentId));
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.only(bottom: 100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 10),
                _buildCinematicMap(),
                _buildEtaFloatCard(data),
                const SizedBox(height: 16),
                _buildTabBar(),
                const SizedBox(height: 16),
                if (_selectedTabIndex == 0) _buildLivePanel(data),
              ],
            ),
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.redAccent),
              const SizedBox(height: 16),
              Text(
                'Could not load transport data.\nMake sure the internal server is running.',
                textAlign: TextAlign.center,
                style: GoogleFonts.dmSans(color: const Color(0xFF64748B)),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () {
                  ref.invalidate(liveTransportDataProvider(studentId));
                },
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF3B6EF8),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCinematicMap() {
    final locationUpdate = ref.watch(transportLocationProvider);

    // Pan the map camera whenever a new GPS fix arrives (post-frame to avoid build-phase side effects)
    ref.listen<LocationUpdate?>(transportLocationProvider, (prev, next) {
      if (next?.lat != null && next?.lng != null && _mapController != null) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _mapController?.animateCamera(
            CameraUpdate.newLatLng(LatLng(next!.lat!, next.lng!)),
          );
        });
      }
    });

    // Derive bus position from live data or fall back to default
    final busPosition = (locationUpdate?.lat != null && locationUpdate?.lng != null)
        ? LatLng(locationUpdate!.lat!, locationUpdate.lng!)
        : _defaultPosition;

    final speed = locationUpdate?.speed?.toStringAsFixed(0) ?? '—';
    final eta = locationUpdate?.etaMinutes;
    final statusMsg = locationUpdate?.statusMessage ?? 'Bus #7 — South Colony';

    final now = TimeOfDay.now();
    final liveTime = '${now.hourOfPeriod == 0 ? 12 : now.hourOfPeriod}:${now.minute.toString().padLeft(2, '0')} ${now.period == DayPeriod.am ? 'AM' : 'PM'}';

    final busMarker = Marker(
      markerId: const MarkerId('bus'),
      position: busPosition,
      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      infoWindow: InfoWindow(title: 'School Bus', snippet: statusMsg),
    );

    return Container(
      height: 280,
      width: double.infinity,
      child: Stack(
        children: [
          // ── Real Google Map ─────────────────────────────────────────────
          GoogleMap(
            initialCameraPosition: CameraPosition(target: busPosition, zoom: 15),
            markers: {busMarker},
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            mapToolbarEnabled: false,
            onMapCreated: (controller) => _mapController = controller,
          ),

          // ── Live badge ─────────────────────────────────────────────────
          Positioned(
            top: 16, right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4))],
              ),
              child: Row(children: [
                Container(width: 6, height: 6, decoration: const BoxDecoration(color: Colors.redAccent, shape: BoxShape.circle))
                    .animate(onPlay: (c) => c.repeat(reverse: true)).fade(duration: 800.ms),
                const SizedBox(width: 6),
                Text('LIVE $liveTime', style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
              ]),
            ),
          ),

          // ── Bus info pill ──────────────────────────────────────────────
          Positioned(
            bottom: 70, left: 16,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 20, offset: const Offset(0, 10))],
              ),
              child: Row(children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.directions_bus_rounded, color: Color(0xFF3B6EF8), size: 20),
                ),
                const SizedBox(width: 12),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(statusMsg, style: GoogleFonts.sora(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
                  if (eta != null)
                    Text('ETA: $eta min', style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF64748B)))
                  else
                    Text('Tracking active', style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF64748B))),
                ]),
                const SizedBox(width: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(color: const Color(0xFF3B6EF8).withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                  child: Column(children: [
                    Text(speed, style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF3B6EF8))),
                    Text('km/h', style: GoogleFonts.dmSans(fontSize: 9, fontWeight: FontWeight.w700, color: const Color(0xFF3B6EF8))),
                  ]),
                ),
              ]),
            ).animate().slideY(begin: 0.5, duration: 400.ms, curve: Curves.easeOutBack),
          ),

          // ── Recenter button ────────────────────────────────────────────
          Positioned(
            bottom: 16, right: 16,
            child: GestureDetector(
              onTap: () => _mapController?.animateCamera(CameraUpdate.newLatLngZoom(busPosition, 15)),
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10)],
                ),
                child: const Icon(Icons.my_location_rounded, color: Color(0xFF1E293B), size: 20),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEtaFloatCard(Map<String, dynamic> data) {
    final locationUpdate = ref.watch(transportLocationProvider);
    final etaMinutes = locationUpdate?.etaMinutes ?? (data['locationUpdate']?['etaMinutes'] as int?);
    final speed = locationUpdate?.speed ?? (data['locationUpdate']?['speed'] as double?);
    final statusMsg = locationUpdate?.statusMessage ?? (data['locationUpdate']?['statusMessage'] as String?) ?? 'Tracking active';

    // Compute ETA clock time from minutes
    String etaText = '—';
    if (etaMinutes != null) {
      final etaTime = DateTime.now().add(Duration(minutes: etaMinutes));
      final h = etaTime.hour > 12 ? etaTime.hour - 12 : (etaTime.hour == 0 ? 12 : etaTime.hour);
      final m = etaTime.minute.toString().padLeft(2, '0');
      final period = etaTime.hour >= 12 ? 'PM' : 'AM';
      etaText = '$h:$m $period';
    }

    final speedValue = speed?.toInt() ?? 0;
    final speedFraction = (speedValue / 80.0).clamp(0.0, 1.0);

    return Transform.translate(
      offset: const Offset(0, -30),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 20, offset: const Offset(0, 10))],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('ESTIMATED ARRIVAL', style: GoogleFonts.sora(fontSize: 10, fontWeight: FontWeight.w800, color: const Color(0xFF94A3B8), letterSpacing: 1.1)),
                  const SizedBox(height: 4),
                  Text(etaText, style: GoogleFonts.sora(fontSize: 32, fontWeight: FontWeight.w900, color: const Color(0xFF1E293B))),
                  const SizedBox(height: 8),
                  Text('📍 $statusMsg', style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF64748B), fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      if (etaMinutes != null)
                        _buildPill('🕐 $etaMinutes min', const Color(0xFFF1F5F9), const Color(0xFF475569)),
                      if (etaMinutes != null) const SizedBox(width: 8),
                      _buildPill('🛰 GPS Live', const Color(0xFF00C9A7).withOpacity(0.12), const Color(0xFF00C9A7)),
                    ],
                  )
                ],
              ),
            ),
            // Circular Speed Gauge
            SizedBox(
              width: 80, height: 80,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  CircularProgressIndicator(
                    value: speedFraction,
                    strokeWidth: 6,
                    color: const Color(0xFF00C9A7),
                    backgroundColor: const Color(0xFFE2E8F0),
                  ),
                  Column(mainAxisSize: MainAxisSize.min, children: [
                    const Icon(Icons.speed_rounded, size: 20, color: Color(0xFF00C9A7)),
                    const SizedBox(height: 2),
                    Text('$speedValue', style: GoogleFonts.sora(fontSize: 18, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
                    Text('KM/H', style: GoogleFonts.dmSans(fontSize: 9, fontWeight: FontWeight.w700, color: const Color(0xFF94A3B8))),
                  ]),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildPill(String text, Color bgColor, Color textColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(12)),
      child: Text(text, style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.w700, color: textColor)),
    );
  }

  Widget _buildTabBar() {
    final tabs = ['Live', 'Route', 'Driver', 'Pickup', 'History', 'Safety'];
    return SizedBox(
      height: 40,
      child: ListView.separated(
         padding: const EdgeInsets.symmetric(horizontal: 20),
         scrollDirection: Axis.horizontal,
         itemCount: tabs.length,
         separatorBuilder: (context, index) => const SizedBox(width: 8),
         itemBuilder: (context, index) {
            final isSelected = _selectedTabIndex == index;
            return GestureDetector(
               onTap: () => setState(() => _selectedTabIndex = index),
               child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                     color: isSelected ? const Color(0xFF1E293B) : Colors.transparent,
                     borderRadius: BorderRadius.circular(20),
                     border: Border.all(color: isSelected ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0))
                  ),
                  alignment: Alignment.center,
                  child: Text(
                     tabs[index],
                     style: GoogleFonts.dmSans(fontSize: 14, fontWeight: FontWeight.w600, color: isSelected ? Colors.white : const Color(0xFF475569)),
                  ),
               ),
            );
         },
      ),
    );
  }

  Widget _buildLivePanel(Map<String, dynamic> data) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          // Telemetry Strip
          Row(
            children: [
               Expanded(child: _buildTeleCell('🛑', '3', 'Stops Left', const Color(0xFF3B6EF8))),
               const SizedBox(width: 12),
               Expanded(child: _buildTeleCell('📏', '4.2', 'KM Away', const Color(0xFF00C9A7))),
               const SizedBox(width: 12),
               Expanded(child: _buildTeleCell('👦', '24', 'On Board', const Color(0xFF8B5CF6))),
               const SizedBox(width: 12),
               Expanded(child: _buildTeleCell('❄️', 'ON', 'A/C', const Color(0xFF00C9A7))),
            ],
          ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.1),

          const SizedBox(height: 24),

          // Speed Graph placeholder
          Container(
             padding: const EdgeInsets.all(20),
             decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFE2E8F0))),
             child: Column(
                children: [
                   Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                         Row(
                            children: [
                               const Icon(Icons.multiline_chart_rounded, color: Color(0xFFFF6B3D)),
                               const SizedBox(width: 8),
                               Text('Live Speed Graph', style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
                            ],
                         ),
                         Text('38 km/h', style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
                      ],
                   ),
                   const SizedBox(height: 16),
                   SizedBox(
                      height: 60,
                      width: double.infinity,
                      child: CustomPaint(painter: SparklinePainter()),
                   ),
                ],
             ),
          ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1),

          const SizedBox(height: 24),

          // Student Roster
          Container(
             padding: const EdgeInsets.all(20),
             decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFE2E8F0))),
             child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                         Text('Students on Bus', style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
                         Text('24 aboard', style: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF64748B), fontWeight: FontWeight.w600)),
                      ],
                   ),
                   const SizedBox(height: 16),
                   SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                         children: [
                            _buildAvatarCol('EJ', 'Emma', const Color(0xFF6366F1), const Color(0xFF8B5CF6), showCheck: true),
                            _buildAvatarCol('AK', 'Aryan', const Color(0xFF3B82F6), const Color(0xFF06B6D4)),
                            _buildAvatarCol('PS', 'Priya', const Color(0xFFF59E0B), const Color(0xFFEF4444)),
                            _buildAvatarCol('RV', 'Rohan', const Color(0xFF10B981), const Color(0xFF059669)),
                            _buildAvatarCol('+19', 'More', const Color(0xFF64748B), const Color(0xFF475569)),
                         ],
                      ),
                   )
                ],
             ),
          ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.1),

          const SizedBox(height: 24),

          // Vitals Grid
          GridView.count(
             crossAxisCount: 2,
             shrinkWrap: true,
             physics: const NeverScrollableScrollPhysics(),
             mainAxisSpacing: 12,
             crossAxisSpacing: 12,
             childAspectRatio: 1.4,
             children: [
                _buildVitalCard('GPS Signal', 'Excellent', '12 satellites', Icons.radar, const Color(0xFF00C9A7)),
                _buildVitalCard('Fuel Level', '72%', '340 km range', Icons.local_gas_station_rounded, const Color(0xFFF5A623)),
                _buildVitalCard('Brake', 'Normal', '38% used', Icons.speed_rounded, const Color(0xFF3B6EF8)),
                _buildVitalCard('Engine Temp', '82°C', 'Normal range', Icons.thermostat_rounded, const Color(0xFFFF6B3D)),
             ],
          ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.1),

          const SizedBox(height: 24),

          // Comms
          Container(
             padding: const EdgeInsets.all(20),
             decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFE2E8F0))),
             child: Column(
                children: [
                   Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                         Text('Driver Communications', style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
                         Text('Reply ›', style: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF3B6EF8), fontWeight: FontWeight.w700)),
                      ],
                   ),
                   const SizedBox(height: 16),
                   Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                         Container(
                            width: 36, height: 36,
                            decoration: BoxDecoration(shape: BoxShape.circle, gradient: const LinearGradient(colors: [Color(0xFF667EEA), Color(0xFF764BA2)])),
                            alignment: Alignment.center,
                            child: const Text('RK', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                         ),
                         const SizedBox(width: 12),
                         Expanded(
                            child: Column(
                               crossAxisAlignment: CrossAxisAlignment.start,
                               children: [
                                  Row(
                                     mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                     children: [
                                        Text('Rajesh Kumar', style: GoogleFonts.sora(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
                                        Text('3:28 PM', style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF94A3B8))),
                                     ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text('All students are safe and comfortable. Slight delay due to signal at MG Road. Estimated arrival 3:50 PM.', style: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF475569))),
                               ],
                            ),
                         )
                      ],
                   ),
                ],
             ),
          ).animate().fadeIn(delay: 500.ms).slideY(begin: 0.1),
        ],
      ),
    );
  }

  Widget _buildVitalCard(String title, String val, String sub, IconData icon, Color color) {
     return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFE2E8F0))),
        child: Column(
           crossAxisAlignment: CrossAxisAlignment.start,
           mainAxisAlignment: MainAxisAlignment.center,
           children: [
              Row(
                 children: [
                    Icon(icon, size: 16, color: color),
                    const SizedBox(width: 6),
                    Text(title, style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF64748B))),
                 ],
              ),
              const Spacer(),
              Text(val, style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
              const SizedBox(height: 2),
              Text(sub, style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8))),
           ],
        ),
     );
  }

  Widget _buildAvatarCol(String initials, String name, Color c1, Color c2, {bool showCheck = false}) {
     return Padding(
        padding: const EdgeInsets.only(right: 16),
        child: Column(
           children: [
              Stack(
                 clipBehavior: Clip.none,
                 children: [
                    Container(
                       width: 44, height: 44,
                       decoration: BoxDecoration(shape: BoxShape.circle, gradient: LinearGradient(colors: [c1, c2], begin: Alignment.topLeft, end: Alignment.bottomRight)),
                       alignment: Alignment.center,
                       child: Text(initials, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                    if (showCheck)
                       Positioned(
                          bottom: -2, right: -2,
                          child: Container(
                             padding: const EdgeInsets.all(2),
                             decoration: BoxDecoration(color: const Color(0xFF1E293B), shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2)),
                             child: const Icon(Icons.check, size: 10, color: Colors.white),
                          ),
                       )
                 ],
              ),
              const SizedBox(height: 8),
              Text(name, style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
              Text('Stop 5', style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF94A3B8))),
           ],
        ),
     );
  }

  Widget _buildTeleCell(String emoji, String val, String lbl, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
         children: [
            Text(emoji, style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 4),
            Text(val, style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
            Text(lbl, style: GoogleFonts.dmSans(fontSize: 10, color: const Color(0xFF64748B))),
         ],
      ),
    );
  }
}

class SparklinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final zoneGradient = LinearGradient(
       colors: [const Color(0xFFFF6B3D).withOpacity(0.2), const Color(0xFFFF6B3D).withOpacity(0.0)],
       begin: Alignment.topCenter,
       end: Alignment.bottomCenter,
    ).createShader(Rect.fromLTRB(0, 0, size.width, size.height));

    final fillPaint = Paint()
      ..shader = zoneGradient
      ..style = PaintingStyle.fill;
      
    final linePaint = Paint()
      ..color = const Color(0xFFFF6B3D)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
      
    final path = Path();
    path.moveTo(0, size.height * 0.8);
    path.quadraticBezierTo(size.width * 0.1, size.height * 0.6, size.width * 0.2, size.height * 0.7);
    path.quadraticBezierTo(size.width * 0.35, size.height * 0.9, size.width * 0.5, size.height * 0.4);
    path.quadraticBezierTo(size.width * 0.7, size.height * 0.2, size.width * 0.8, size.height * 0.5);
    path.quadraticBezierTo(size.width * 0.9, size.height * 0.6, size.width, size.height * 0.4);
    
    final fillPath = Path.from(path);
    fillPath.lineTo(size.width, size.height);
    fillPath.lineTo(0, size.height);
    fillPath.close();
    
    canvas.drawPath(fillPath, fillPaint);
    canvas.drawPath(path, linePaint);
    
    // Limits
    final dashPaint = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;
    canvas.drawLine(Offset(0, size.height * 0.3), Offset(size.width, size.height * 0.3), dashPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
