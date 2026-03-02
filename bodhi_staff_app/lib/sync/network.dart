import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../../core/database/database_provider.dart';
import '../../core/database/tables.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: 'https://api.yourbackend.com', // Replace with actual ERP URL
    connectTimeout: const Duration(seconds: 10),
  ));

  final db = ref.read(dbProvider);

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      // 1. Inject Auth Tokens from Secure Storage (Mocked for now)
      options.headers['Authorization'] = 'Bearer <JWT_TOKEN>';
      options.headers['x-school-slug'] = 'demo-school';
      return handler.next(options);
    },
    onError: (DioException e, handler) async {
      final isNetworkError = e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.unknown;

      // 2. Offline Queue Interception for Mutations (POST/PUT/DELETE)
      if (isNetworkError &&
          ['POST', 'PUT', 'DELETE'].contains(e.requestOptions.method)) {
        final id = const Uuid().v4();

        // Save to OfflineQueue in local Drift DB
        await db.into(db.offlineQueue).insert(
              OfflineQueueCompanion.insert(
                id: id,
                type: e.requestOptions.path, // Using path as type for demo
                payload: jsonEncode(e.requestOptions.data ?? {}),
              ),
            );

        // Optimistic UI approach: Resolve as "success" so UI continues normally
        return handler.resolve(Response(
          requestOptions: e.requestOptions,
          statusCode: 202, // 202 Accepted (Queued locally)
          data: {'status': 'queued', 'id': id},
        ));
      }
      return handler.next(e);
    },
  ));

  return dio;
});
