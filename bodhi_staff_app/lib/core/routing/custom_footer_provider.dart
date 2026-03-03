import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:bodhi_staff_app/core/routing/navigation_tab_model.dart';
import 'package:flutter/material.dart';

class CustomFooterNotifier extends StateNotifier<List<NavigationTabModel>> {
  bool _isLoaded = false;
  List<NavigationTabModel>? _persistedTabs;

  CustomFooterNotifier() : super([]) {
    _loadCustomFooter();
  }

  static const _prefsKey = 'custom_footer_tabs_v1';

  Future<void> _loadCustomFooter() async {
    final prefs = await SharedPreferences.getInstance();
    final String? tabsJson = prefs.getString(_prefsKey);
    if (tabsJson != null) {
      try {
        final List<dynamic> decodedList = json.decode(tabsJson);
        final loadedTabs = decodedList
            .map((item) => NavigationTabModel.fromJson(item))
            .toList();
        _persistedTabs = loadedTabs.take(5).toList();
        state = _persistedTabs!;
      } catch (e) {
        print("Error loading custom footer: $e");
      }
    }
    _isLoaded = true;
  }

  bool get isLoaded => _isLoaded;
  bool get hasCustomTabs => _persistedTabs != null && _persistedTabs!.isNotEmpty;

  Future<void> replaceTab(int index, NavigationTabModel newTab) async {
    final currentTabs = List<NavigationTabModel>.from(state);
    
    // Prevent adding if it's already there (maybe just swap?)
    final existingIndex = currentTabs.indexWhere((t) => t.route == newTab.route);
    if (existingIndex != -1 && existingIndex != index) {
      // Swapping behaviour
      final oldTab = currentTabs[index];
      currentTabs[index] = newTab;
      currentTabs[existingIndex] = oldTab;
    } else {
      if (index >= 0 && index < currentTabs.length) {
        currentTabs[index] = newTab;
      } else if (currentTabs.length < 5) {
        currentTabs.add(newTab);
      }
    }
    state = currentTabs;
    _persistedTabs = currentTabs;
    await _saveCustomFooter(currentTabs);
  }

  Future<void> _saveCustomFooter(List<NavigationTabModel> tabs) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonList = tabs.map((t) => t.toJson()).toList();
    await prefs.setString(_prefsKey, json.encode(jsonList));
  }

  void setInitialDefaultTabsIfEmpty(List<NavigationTabModel> defaultTabs) {
    if (!_isLoaded) return;
    if (!hasCustomTabs && state.isEmpty) {
      // Use defaults if nothing persisted
      state = defaultTabs.take(5).toList();
    }
  }
}

final customFooterProvider = 
    StateNotifierProvider<CustomFooterNotifier, List<NavigationTabModel>>((ref) {
  return CustomFooterNotifier();
});
