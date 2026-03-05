import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/school_brand_provider.dart';

// ─── Models ──────────────────────────────────────────────────────────────────
class SchoolEvent {
  final String id;
  final String title;
  final String type;
  final String date;
  final String? endDate;
  final String? description;
  final String? venue;
  final String? color;

  SchoolEvent({required this.id, required this.title, required this.type, required this.date, this.endDate, this.description, this.venue, this.color});

  factory SchoolEvent.fromJson(Map<String, dynamic> json) => SchoolEvent(
    id: json['id'] ?? '',
    title: json['title'] ?? '',
    type: json['type'] ?? 'OTHER',
    date: json['date'] ?? '',
    endDate: json['endDate'],
    description: json['description'],
    venue: json['venue'],
    color: json['color'],
  );
}

class EventsData {
  final List<SchoolEvent> events;
  final List<SchoolEvent> upcoming;
  final int month;
  final int year;

  EventsData({required this.events, required this.upcoming, required this.month, required this.year});

  factory EventsData.fromJson(Map<String, dynamic> json) => EventsData(
    events: (json['events'] as List? ?? []).map((e) => SchoolEvent.fromJson(e)).toList(),
    upcoming: (json['upcoming'] as List? ?? []).map((e) => SchoolEvent.fromJson(e)).toList(),
    month: json['month'] ?? DateTime.now().month,
    year: json['year'] ?? DateTime.now().year,
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────
class EventFilter {
  final int month;
  final int year;
  EventFilter(this.month, this.year);

  @override
  bool operator ==(Object other) => other is EventFilter && other.month == month && other.year == year;

  @override
  int get hashCode => month.hashCode ^ year.hashCode;
}

final eventsDataProvider = FutureProvider.family<EventsData, EventFilter>((ref, filter) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get(
    'parent/events',
    queryParameters: {'month': filter.month.toString(), 'year': filter.year.toString()},
  );

  if (response.data['success'] == true) {
    return EventsData.fromJson(response.data['data']);
  } else {
    throw Exception(response.data['error'] ?? 'Failed to load events');
  }
});
