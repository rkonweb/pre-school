import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) => throw UnimplementedError());

const _adminDefaultActions = ['billing', 'admissions', 'staff', 'reports', 'inventory', 'settings', 'students'];
const _teacherDefaultActions = ['attendance', 'self_attendance', 'marks', 'diary', 'homework', 'circulars', 'timetable'];

final quickActionsProvider = StateNotifierProvider<QuickActionsNotifier, List<String>>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return QuickActionsNotifier(prefs);
});

class QuickActionsNotifier extends StateNotifier<List<String>> {
  final SharedPreferences _prefs;
  
  QuickActionsNotifier(this._prefs) : super([]) {
    _loadFromCache();
  }

  void _loadFromCache() {
    final cached = _prefs.getStringList('dashboard_quick_actions');
    if (cached != null && cached.isNotEmpty) {
      state = cached;
    }
  }

  void saveActions(List<String> newActions) {
    state = newActions;
    _prefs.setStringList('dashboard_quick_actions', newActions);
  }

  void loadDefaultsForRole(String role) {
    if (state.isNotEmpty) return; // Only set defaults if uninitialized
    
    final r = role.toUpperCase();
    if (r == 'ADMIN') {
      saveActions(List.from(_adminDefaultActions));
    } else {
      saveActions(List.from(_teacherDefaultActions));
    }
  }
}
