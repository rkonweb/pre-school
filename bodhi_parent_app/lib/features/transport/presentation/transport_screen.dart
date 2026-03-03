import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:ui';
import '../../../core/theme/school_brand_provider.dart';
import '../data/transport_provider.dart';
import '../../dashboard/data/dashboard_provider.dart';

class TransportScreen extends ConsumerStatefulWidget {
  const TransportScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<TransportScreen> createState() => _TransportScreenState();
}

class _TransportScreenState extends ConsumerState<TransportScreen> {
  @override
  void initState() {
    super.initState();
    // Delay to let riverpod settle before starting the loop
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
    final brand = ref.watch(schoolBrandProvider);
    final dashboardAsync = ref.watch(dashboardDataProvider);
    final activeStudentId = dashboardAsync.value?['activeStudentId'];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Live Transport', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: activeStudentId == null 
        ? const Center(child: CircularProgressIndicator())
        : _buildTransportBody(context, activeStudentId, brand),
    );
  }

  Widget _buildTransportBody(BuildContext context, String studentId, SchoolBrandState brand) {
    final transportAsync = ref.watch(liveTransportDataProvider(studentId));

    return RefreshIndicator(
      onRefresh: () => ref.read(liveTransportDataProvider(studentId).notifier).refresh(),
      child: Stack(
        children: [
          Positioned.fill(child: _buildStunningBackground(brand)),
          
          transportAsync.when(
            data: (data) {
               if (data['isActive'] == false) {
                   return CustomScrollView(
                       physics: const AlwaysScrollableScrollPhysics(),
                       slivers: [
                           SliverFillRemaining(
                               child: Center(
                                   child: Padding(
                                       padding: const EdgeInsets.all(32),
                                       child: Column(
                                           mainAxisSize: MainAxisSize.min,
                                           children: [
                                               const Icon(Icons.directions_bus_filled_outlined, size: 64, color: Colors.grey),
                                               const SizedBox(height: 16),
                                               Text(
                                                  data['message'] ?? "Transport not active right now.",
                                                  textAlign: TextAlign.center,
                                                  style: const TextStyle(fontSize: 18, color: Colors.black54),
                                               )
                                           ]
                                       )
                                   )
                               ),
                           ),
                       ],
                   );
               }
               return _buildActiveMapView(data, brand);
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => Center(child: Text('Error: $err')),
          )
        ],
      ),
    );
  }

  Widget _buildActiveMapView(Map<String, dynamic> data, SchoolBrandState brand) {
      final live = data['liveTelemetry'];
      final stops = data['studentStops'];
      final route = data['route'] ?? {};
      final vehicle = data['vehicle'] ?? {};
      final driver = data['driver'];
      final tripType = data['tripType'];

      return Column(
          children: [
              // Glassmorphic Radar Container
              Expanded(
                 flex: 3,
                 child: Container(
                     margin: const EdgeInsets.all(16),
                     decoration: BoxDecoration(
                         color: const Color(0xFF1E293B), // Dark Slate Background for Radar
                         borderRadius: BorderRadius.circular(32),
                         boxShadow: [
                           BoxShadow(color: brand.primaryColor.withOpacity(0.3), blurRadius: 30, spreadRadius: -5),
                           BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 5)),
                         ],
                     ),
                     child: ClipRRect(
                       borderRadius: BorderRadius.circular(32),
                       child: Stack(
                           alignment: Alignment.center,
                           children: [
                               // Radar Grids
                               ...List.generate(4, (index) => Container(
                                 width: (index + 1) * 80.0,
                                 height: (index + 1) * 80.0,
                                 decoration: BoxDecoration(
                                   shape: BoxShape.circle,
                                   border: Border.all(color: Colors.white.withOpacity(0.05), width: 1),
                                 ),
                               )),
                               
                               // Crosshairs
                               Container(width: 2, height: double.infinity, color: Colors.white.withOpacity(0.05)),
                               Container(width: double.infinity, height: 2, color: Colors.white.withOpacity(0.05)),
                               
                               // Radar Scanner Sweep (Simulated via Rotation)
                               TweenAnimationBuilder(
                                 tween: Tween<double>(begin: 0, end: 2 * 3.14159),
                                 duration: const Duration(seconds: 4),
                                 builder: (context, double value, child) {
                                   return Transform.rotate(
                                     angle: value,
                                     child: Container(
                                       width: 300,
                                       height: 300,
                                       decoration: BoxDecoration(
                                         shape: BoxShape.circle,
                                         gradient: SweepGradient(
                                           colors: [Colors.transparent, brand.primaryColor.withOpacity(0.4), brand.primaryColor],
                                           stops: const [0.0, 0.8, 1.0],
                                         ),
                                       ),
                                     ),
                                   );
                                 },
                                 onEnd: () {
                                   // Infinite rotation is usually done by resetting state, but for a simple sweep this works
                                 },
                               ),

                               // Live Vehicle Blip
                               if (live != null)
                                 TweenAnimationBuilder<double>(
                                   tween: Tween<double>(begin: 0.8, end: 1.2),
                                   duration: const Duration(milliseconds: 1000),
                                   builder: (context, scale, child) {
                                     return Transform.scale(
                                       scale: scale,
                                       child: Container(
                                         padding: const EdgeInsets.all(12),
                                         decoration: BoxDecoration(
                                           color: brand.primaryColor,
                                           shape: BoxShape.circle,
                                           boxShadow: [
                                             BoxShadow(color: brand.primaryColor.withOpacity(0.5), blurRadius: 20 * scale, spreadRadius: 5 * scale)
                                           ]
                                         ),
                                         child: const Icon(Icons.directions_bus, color: Colors.white, size: 28),
                                       ),
                                     );
                                   }
                                 ),

                               if (live != null)
                                 Positioned(
                                   bottom: 20,
                                   child: Container(
                                       padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                       decoration: BoxDecoration(
                                         color: Colors.black87,
                                         borderRadius: BorderRadius.circular(20),
                                         border: Border.all(color: Colors.white24)
                                       ),
                                       child: Row(
                                         mainAxisSize: MainAxisSize.min,
                                         children: [
                                           const Icon(Icons.speed, color: Colors.greenAccent, size: 16),
                                           const SizedBox(width: 8),
                                           Text('${live['speed'] ?? 0} km/h', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1)),
                                         ],
                                       ),
                                   )
                                 ),
                                 
                               // Trip Type Badge
                               Positioned(
                                   top: 20,
                                   left: 20,
                                   child: Container(
                                       padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                       decoration: BoxDecoration(
                                         color: Colors.white.withOpacity(0.1), 
                                         borderRadius: BorderRadius.circular(20), 
                                         border: Border.all(color: Colors.white24)
                                       ),
                                       child: Row(
                                           mainAxisSize: MainAxisSize.min,
                                           children: [
                                               Icon(tripType == 'PICKUP' ? Icons.wb_sunny : Icons.nightlight_round, size: 16, color: Colors.yellowAccent),
                                               const SizedBox(width: 8),
                                               Text('${tripType ?? 'LIVE'} TRIP', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white, letterSpacing: 1)),
                                           ],
                                       ),
                                   )
                               )
                           ]
                       ),
                     ),
                 ),
              ),

              // Glassmorphic Info Cards
              Expanded(
                  flex: 3,
                  child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                      decoration: const BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.only(topLeft: Radius.circular(40), topRight: Radius.circular(40))
                      ),
                      child: SingleChildScrollView(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                                // Vehicle Identifier
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(vehicle['registrationNumber'] ?? 'Bus Details', style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900)),
                                        const SizedBox(height: 4),
                                        Text(route['name'] ?? 'Route Info', style: TextStyle(color: Colors.grey.shade600, fontSize: 14, fontWeight: FontWeight.w500)),
                                      ],
                                    ),
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(color: brand.primaryColor.withOpacity(0.1), shape: BoxShape.circle),
                                      child: Icon(Icons.airport_shuttle, color: brand.primaryColor),
                                    )
                                  ]
                                ),
                                
                                const SizedBox(height: 24),
                                
                                // Beautiful Timeline Step
                                Container(
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(24),
                                    border: Border.all(color: Colors.grey.shade200)
                                  ),
                                  child: Row(
                                      children: [
                                          Container(
                                            padding: const EdgeInsets.all(12),
                                            decoration: BoxDecoration(color: const Color(0xFF2E7D32).withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                                            child: const Icon(Icons.location_on, color: Color(0xFF2E7D32)),
                                          ),
                                          const SizedBox(width: 16),
                                          Expanded(
                                              child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                      const Text('Your Designated Stop', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.w600)),
                                                      const SizedBox(height: 4),
                                                      Text(
                                                          tripType == 'PICKUP' ? (stops['pickup']?['name'] ?? 'Not set') : (stops['drop']?['name'] ?? 'Not set'),
                                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17)
                                                      )
                                                  ],
                                              )
                                          ),
                                          Column(
                                              crossAxisAlignment: CrossAxisAlignment.end,
                                              children: [
                                                  const Text('ETA', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.w600)),
                                                  const SizedBox(height: 4),
                                                  Text(
                                                      tripType == 'PICKUP' ? (stops['pickup']?['time'] ?? '--:--') : (stops['drop']?['time'] ?? '--:--'),
                                                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF2E7D32))
                                                  )
                                              ]
                                          )
                                      ]
                                  ),
                                ),
                                
                                const SizedBox(height: 16),
                                
                                if (driver != null)
                                  Container(
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: Colors.white, 
                                        borderRadius: BorderRadius.circular(24),
                                        border: Border.all(color: Colors.grey.shade200),
                                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))]
                                      ),
                                      child: Row(
                                          children: [
                                              const CircleAvatar(
                                                radius: 24,
                                                backgroundColor: Color(0xFFE2E8F0), 
                                                child: Icon(Icons.person, color: Colors.grey, size: 28)
                                              ),
                                              const SizedBox(width: 16),
                                              Expanded(
                                                  child: Column(
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      children: [
                                                          const Text('Pilot / Driver', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.w600)),
                                                          const SizedBox(height: 2),
                                                          Text(driver['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                                      ],
                                                  )
                                              ),
                                              Container(
                                                decoration: BoxDecoration(
                                                  color: brand.primaryColor.withOpacity(0.1),
                                                  shape: BoxShape.circle
                                                ),
                                                child: IconButton(
                                                    icon: Icon(Icons.phone, color: brand.primaryColor),
                                                    onPressed: () {},
                                                ),
                                              )
                                          ],
                                      ),
                                  ),
                                  
                                const SizedBox(height: 24),
                            ]
                        ),
                      )
                  )
              )
          ]
      );
  }

  Widget _buildStunningBackground(SchoolBrandState brand) {
    return Stack(
      children: [
        Positioned(
          bottom: -50,
          right: -50,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFF2563EB).withOpacity(0.08)),
          ),
        ),
        Positioned.fill(
          child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50), child: Container(color: Colors.transparent)),
        ),
      ],
    );
  }
}
