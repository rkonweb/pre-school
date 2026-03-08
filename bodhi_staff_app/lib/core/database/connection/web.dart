import 'package:drift/drift.dart';
import 'package:drift/web.dart';

QueryExecutor openDatabase() {
  return WebDatabase('bodhi_staff');
}
