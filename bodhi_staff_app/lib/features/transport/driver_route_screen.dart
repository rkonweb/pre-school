import 'package:bodhi_staff_app/ui/components/app_drawer.dart';
import 'package:bodhi_staff_app/ui/components/app_drawer.dart';
import 'package:flutter/material.dart';
import '../../core/widgets/global_header.dart';
import '../../core/theme/app_theme.dart';

class RouteStop {
  final String id;
  final String locationName;
  final String expectedTime;
  final List<StudentToPickup> students;
  bool isCompleted;

  RouteStop({
    required this.id,
    required this.locationName,
    required this.expectedTime,
    required this.students,
    this.isCompleted = false,
  });
}

class StudentToPickup {
  final String id;
  final String name;
  final String? photoUrl;
  bool hasBoarded;

  StudentToPickup({
    required this.id,
    required this.name,
    this.photoUrl,
    this.hasBoarded = false,
  });
}

class DriverRouteScreen extends StatefulWidget {
  final List<RouteStop> stops;

  const DriverRouteScreen({Key? key, required this.stops}) : super(key: key);

  @override
  State<DriverRouteScreen> createState() => _DriverRouteScreenState();
}

class _DriverRouteScreenState extends State<DriverRouteScreen> {
  bool _tripStarted = false;
  late List<RouteStop> _stops;

  @override
  void initState() {
    super.initState();
    _stops = widget.stops;
  }

  void _startTrip() {
    setState(() => _tripStarted = true);
    // 1. Trigger ANIM_ROUTE_START Lottie
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Trip Started! GPS Ping Active 🚍')),
    );
    // 2. Start Background GPS service
  }

  void _toggleStudentBoarding(
      RouteStop stop, StudentToPickup student, bool boarded) {
    setState(() {
      student.hasBoarded = boarded;
      // Auto-mark stop completed if all students boarded
      stop.isCompleted = stop.students.every((s) => s.hasBoarded);
    });
    // Queue mutation to Offline DB
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      
      
      drawer: const AppDrawer(),
      appBar: GlobalHeader(
        title: 'Route 42 - Morning',
        actions: [
          IconButton(
            icon: const Icon(Icons.report_problem, color: AppTheme.textMuted),
            onPressed: () {
              // Open Incident Report BottomSheet
            },
          )
        ],
      ),
      body: Column(
        children: [
          // Large Hero Action
          if (!_tripStarted)
            Padding(
              padding: const EdgeInsets.all(AppTheme.s24),
              child: ElevatedButton(
                onPressed: _startTrip,
                style: ElevatedButton.styleFrom(
                  minimumSize:
                      const Size.fromHeight(80), // Massive Hit Area for Gloves
                  backgroundColor: AppTheme.success,
                  shape: RoundedRectangleBorder(
                      borderRadius: AppTheme.radiusLarge),
                ),
                child: const Text('START TRIP',
                    style:
                        TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              ),
            ),

          if (_tripStarted)
            Container(
              padding: const EdgeInsets.all(AppTheme.s16),
              color: AppTheme.success.withOpacity(0.1),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.gps_fixed, color: AppTheme.success),
                  SizedBox(width: 8),
                  Text('GPS Tracking Active',
                      style: TextStyle(
                          color: AppTheme.success,
                          fontWeight: FontWeight.bold)),
                ],
              ),
            ),

          // Stop Checklist
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(AppTheme.s16),
              itemCount: _stops.length,
              itemBuilder: (context, index) {
                final stop = _stops[index];
                return _buildRouteStopCard(stop);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRouteStopCard(RouteStop stop) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppTheme.s16),
      shape: RoundedRectangleBorder(
        borderRadius: AppTheme.radiusMedium,
        side: BorderSide(
          color: stop.isCompleted ? AppTheme.success : AppTheme.border,
          width: stop.isCompleted ? 2 : 1,
        ),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          initiallyExpanded: !stop.isCompleted,
          title: Text(stop.locationName,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                decoration:
                    stop.isCompleted ? TextDecoration.lineThrough : null,
                color: stop.isCompleted
                    ? AppTheme.textMuted
                    : AppTheme.textPrimary,
              )),
          subtitle: Text(stop.expectedTime),
          leading: Icon(
            stop.isCompleted ? Icons.check_circle : Icons.location_on,
            color: stop.isCompleted ? AppTheme.success : AppTheme.primary,
            size: 32, // Large hit area implication
          ),
          children: stop.students
              .map((student) => Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: AppTheme.s16, vertical: 8.0),
                    child: Row(
                      children: [
                        CircleAvatar(
                            backgroundColor: AppTheme.border,
                            child: Text(student.name[0])),
                        const SizedBox(width: AppTheme.s16),
                        Expanded(
                            child: Text(student.name,
                                style: const TextStyle(fontSize: 18))),

                        // Massive Toggle Button for easy one-hand usage
                        InkWell(
                          onTap: () => _toggleStudentBoarding(
                              stop, student, !student.hasBoarded),
                          child: Container(
                            width: 100,
                            height: 50,
                            decoration: BoxDecoration(
                              color: student.hasBoarded
                                  ? AppTheme.success
                                  : AppTheme.background,
                              borderRadius: BorderRadius.circular(25),
                              border: Border.all(
                                  color: student.hasBoarded
                                      ? AppTheme.success
                                      : AppTheme.border),
                            ),
                            child: Center(
                              child: Text(
                                student.hasBoarded ? 'BOARDED' : 'WAITING',
                                style: TextStyle(
                                  color: student.hasBoarded
                                      ? Colors.white
                                      : AppTheme.textMuted,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ))
              .toList(),
        ),
      ),
    );
  }
}
