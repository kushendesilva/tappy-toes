import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/kick_data.dart';

class KickProvider extends ChangeNotifier {
  static const String storageKey = 'kickDataV1';
  
  final SharedPreferences _prefs;
  KickData _kickData = KickData({});
  bool _hydrated = false;

  KickProvider(this._prefs) {
    _load();
  }

  bool get hydrated => _hydrated;
  KickData get kickData => _kickData;

  String get todayKey {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  List<String> getTodayKicks() {
    return _kickData.getDay(todayKey);
  }

  List<String> getKicksForDay(String day) {
    return _kickData.getDay(day);
  }

  List<String> getAllDays() {
    return _kickData.getAllDays();
  }

  Future<void> recordKick() async {
    final key = todayKey;
    final now = DateTime.now().toIso8601String();
    final currentData = Map<String, List<String>>.from(_kickData.data);
    
    if (currentData.containsKey(key)) {
      currentData[key] = [...currentData[key]!, now];
    } else {
      currentData[key] = [now];
    }
    
    _kickData = KickData(currentData);
    await _persist();
    notifyListeners();
  }

  Future<void> undoLastKick() async {
    final key = todayKey;
    final currentData = Map<String, List<String>>.from(_kickData.data);
    
    if (!currentData.containsKey(key) || currentData[key]!.isEmpty) {
      return;
    }
    
    final arr = List<String>.from(currentData[key]!);
    arr.removeLast();
    
    if (arr.isEmpty) {
      currentData.remove(key);
    } else {
      currentData[key] = arr;
    }
    
    _kickData = KickData(currentData);
    await _persist();
    notifyListeners();
  }

  Future<void> resetToday() async {
    final key = todayKey;
    final currentData = Map<String, List<String>>.from(_kickData.data);
    
    if (!currentData.containsKey(key)) {
      return;
    }
    
    currentData.remove(key);
    _kickData = KickData(currentData);
    await _persist();
    notifyListeners();
  }

  Future<void> resetAll() async {
    _kickData = KickData({});
    await _persist();
    notifyListeners();
  }

  Future<void> _load() async {
    try {
      final raw = _prefs.getString(storageKey);
      if (raw != null) {
        final json = jsonDecode(raw) as Map<String, dynamic>;
        _kickData = KickData.fromJson(json);
      }
    } catch (e) {
      debugPrint('Error loading data: $e');
    }
    _hydrated = true;
    notifyListeners();
  }

  Future<void> _persist() async {
    try {
      final json = jsonEncode(_kickData.toJson());
      await _prefs.setString(storageKey, json);
    } catch (e) {
      debugPrint('Error saving data: $e');
    }
  }
}
