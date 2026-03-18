import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiClient {
  static final Dio dio = Dio(BaseOptions(
    // Using a generic local IP for Android emulator (10.0.2.2) or iOS emulator (127.0.0.1)
    // You may need to change this baseUrl depending on exactly how it is launched in production.
    baseUrl: 'http://127.0.0.1:3000/api/mobile/v1/parent', 
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
  ));

  static void init() {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            // Handle unauthorized, emit event or logout
            final prefs = await SharedPreferences.getInstance();
            await prefs.remove('auth_token');
          }
          return handler.next(e);
        },
      ),
    );
  }
}
