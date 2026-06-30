import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _kPersonalizationKey = 'spendzero_personalization_v1';
const _maxPriceSamples = 40;
const _maxSearchTerms = 25;

/// Time-of-day buckets used to infer "when does this user usually browse"
/// without ever touching a clock-based server signal.
enum DayPart { morning, afternoon, evening, night }

DayPart dayPartNow() {
  final hour = DateTime.now().hour;
  if (hour >= 5 && hour < 12) return DayPart.morning;
  if (hour >= 12 && hour < 17) return DayPart.afternoon;
  if (hour >= 17 && hour < 22) return DayPart.evening;
  return DayPart.night;
}

/// Every signal the offline personalization engine learns from, purely on
/// device. Nothing here ever leaves SharedPreferences — there is no AI
/// model and no network call involved, just frequency counting.
class PersonalizationSignals {
  PersonalizationSignals({
    Map<String, int>? categoryViews,
    Map<String, int>? appViews,
    Map<String, int>? dietCounts,
    List<int>? priceSamplesPaise,
    List<String>? searchTerms,
    Map<String, int>? dayPartCounts,
  })  : categoryViews = categoryViews ?? {},
        appViews = appViews ?? {},
        dietCounts = dietCounts ?? {},
        priceSamplesPaise = priceSamplesPaise ?? [],
        searchTerms = searchTerms ?? [],
        dayPartCounts = dayPartCounts ?? {};

  final Map<String, int> categoryViews;
  final Map<String, int> appViews;
  final Map<String, int> dietCounts;
  final List<int> priceSamplesPaise;
  final List<String> searchTerms;
  final Map<String, int> dayPartCounts;

  Map<String, dynamic> toJson() => {
        'category_views': categoryViews,
        'app_views': appViews,
        'diet_counts': dietCounts,
        'price_samples_paise': priceSamplesPaise,
        'search_terms': searchTerms,
        'day_part_counts': dayPartCounts,
      };

  factory PersonalizationSignals.fromJson(Map<String, dynamic> json) {
    Map<String, int> intMap(dynamic raw) => (raw as Map<String, dynamic>? ?? {})
        .map((k, v) => MapEntry(k, v as int));
    return PersonalizationSignals(
      categoryViews: intMap(json['category_views']),
      appViews: intMap(json['app_views']),
      dietCounts: intMap(json['diet_counts']),
      priceSamplesPaise: (json['price_samples_paise'] as List<dynamic>? ?? [])
          .map((e) => e as int)
          .toList(),
      searchTerms: (json['search_terms'] as List<dynamic>? ?? [])
          .map((e) => e as String)
          .toList(),
      dayPartCounts: intMap(json['day_part_counts']),
    );
  }

  /// Categories ranked by how often the user has browsed them, most first.
  List<String> topCategories({int limit = 3}) {
    final entries = categoryViews.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return entries.take(limit).map((e) => e.key).toList();
  }

  /// Fictional apps ranked by view frequency, most first.
  List<String> topApps({int limit = 3}) {
    final entries = appViews.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return entries.take(limit).map((e) => e.key).toList();
  }

  /// The dietary tag the user gravitates toward, once there's enough
  /// signal to be confident (at least 3 samples). Null means "no
  /// preference learned yet" — callers should not filter in that case.
  String? preferredDietTag() {
    final total = dietCounts.values.fold(0, (a, b) => a + b);
    if (total < 3) return null;
    final sorted = dietCounts.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return sorted.isEmpty ? null : sorted.first.key;
  }

  /// Median of recently viewed item prices, used as a soft "this is roughly
  /// the price range this user shops in" signal. Null until enough data.
  int? typicalPricePaise() {
    if (priceSamplesPaise.length < 3) return null;
    final sorted = [...priceSamplesPaise]..sort();
    return sorted[sorted.length ~/ 2];
  }

  /// The day part the user most often opens the app during.
  DayPart? preferredDayPart() {
    if (dayPartCounts.isEmpty) return null;
    final sorted = dayPartCounts.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return DayPart.values.firstWhere((d) => d.name == sorted.first.key);
  }
}

/// SharedPreferences-backed personalization engine. Every "record*" call is
/// fire-and-forget from the UI's perspective — it updates in-memory state
/// immediately and persists in the background, mirroring every other
/// `*Store` in the app. There is no AI or cloud involvement: recommendations
/// are produced purely by ranking frequency counters kept on-device.
class PersonalizationNotifier extends StateNotifier<PersonalizationSignals> {
  PersonalizationNotifier() : super(PersonalizationSignals()) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kPersonalizationKey);
    if (raw == null) return;
    try {
      state = PersonalizationSignals.fromJson(
        jsonDecode(raw) as Map<String, dynamic>,
      );
    } catch (_) {
      // Corrupted cache — start fresh.
    }
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kPersonalizationKey, jsonEncode(state.toJson()));
  }

  Map<String, int> _bumped(Map<String, int> map, String key) =>
      {...map, key: (map[key] ?? 0) + 1};

  void recordCategoryView(String categoryId) {
    state = PersonalizationSignals(
      categoryViews: _bumped(state.categoryViews, categoryId),
      appViews: state.appViews,
      dietCounts: state.dietCounts,
      priceSamplesPaise: state.priceSamplesPaise,
      searchTerms: state.searchTerms,
      dayPartCounts: _bumped(state.dayPartCounts, dayPartNow().name),
    );
    _save();
  }

  void recordAppView(String appId) {
    state = PersonalizationSignals(
      categoryViews: state.categoryViews,
      appViews: _bumped(state.appViews, appId),
      dietCounts: state.dietCounts,
      priceSamplesPaise: state.priceSamplesPaise,
      searchTerms: state.searchTerms,
      dayPartCounts: state.dayPartCounts,
    );
    _save();
  }

  void recordDietaryView(String dietTag) {
    state = PersonalizationSignals(
      categoryViews: state.categoryViews,
      appViews: state.appViews,
      dietCounts: _bumped(state.dietCounts, dietTag),
      priceSamplesPaise: state.priceSamplesPaise,
      searchTerms: state.searchTerms,
      dayPartCounts: state.dayPartCounts,
    );
    _save();
  }

  void recordPriceView(int amountPaise) {
    final samples = [...state.priceSamplesPaise, amountPaise];
    if (samples.length > _maxPriceSamples) samples.removeAt(0);
    state = PersonalizationSignals(
      categoryViews: state.categoryViews,
      appViews: state.appViews,
      dietCounts: state.dietCounts,
      priceSamplesPaise: samples,
      searchTerms: state.searchTerms,
      dayPartCounts: state.dayPartCounts,
    );
    _save();
  }

  void recordSearch(String query) {
    final trimmed = query.trim().toLowerCase();
    if (trimmed.isEmpty) return;
    final terms = [...state.searchTerms]..remove(trimmed);
    terms.add(trimmed);
    if (terms.length > _maxSearchTerms) terms.removeAt(0);
    state = PersonalizationSignals(
      categoryViews: state.categoryViews,
      appViews: state.appViews,
      dietCounts: state.dietCounts,
      priceSamplesPaise: state.priceSamplesPaise,
      searchTerms: terms,
      dayPartCounts: state.dayPartCounts,
    );
    _save();
  }
}

final personalizationProvider =
    StateNotifierProvider<PersonalizationNotifier, PersonalizationSignals>(
  (_) => PersonalizationNotifier(),
);
