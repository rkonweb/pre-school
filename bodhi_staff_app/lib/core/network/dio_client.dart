import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class DioClient {
  static final DioClient _instance = DioClient._internal();
  static Dio? _dio;

  DioClient._internal();

  static Dio get instance {
    if (_dio == null) {
      _dio = Dio(BaseOptions(
        baseUrl: 'http://localhost:3000/api/mobile/v1/staff/',
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 60),
      ));

      _dio!.interceptors.add(InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('jwt_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ));
    }
    return _dio!;
  }
}
