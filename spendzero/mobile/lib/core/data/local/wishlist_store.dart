import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _kWishlistKey = 'project_future_wishlist_v1';

/// A single saved entity — a restaurant, product, store, hotel, etc. —
/// identified by [entityId] scoped to its [appId] (the same scoping used by
/// `CartItem`/`persistent_cart_store.dart`), so the same product id in two
/// different fictional apps doesn't collide.
class WishlistEntry {
  const WishlistEntry({
    required this.entityId,
    required this.appId,
    required this.categoryId,
    required this.savedAt,
  });

  final String entityId;
  final String appId;
  final String categoryId;
  final DateTime savedAt;

  Map<String, dynamic> toJson() => {
        'entity_id': entityId,
        'app_id': appId,
        'category_id': categoryId,
        'saved_at': savedAt.toIso8601String(),
      };

  factory WishlistEntry.fromJson(Map<String, dynamic> json) => WishlistEntry(
        entityId: json['entity_id'] as String,
        appId: json['app_id'] as String,
        categoryId: json['category_id'] as String,
        savedAt: DateTime.parse(json['saved_at'] as String),
      );
}

/// SharedPreferences-backed wishlist, mirroring `CartNotifier`'s
/// load-once/save-on-mutation pattern. Works across every fictional app —
/// a restaurant, a product, a hotel are all just an (entityId, appId) pair.
class WishlistNotifier extends StateNotifier<List<WishlistEntry>> {
  WishlistNotifier() : super([]) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kWishlistKey);
    if (raw == null) return;
    try {
      state = (jsonDecode(raw) as List)
          .map((e) => WishlistEntry.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      // Corrupted cache — start fresh.
    }
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _kWishlistKey,
      jsonEncode(state.map((e) => e.toJson()).toList()),
    );
  }

  bool isSaved(String entityId, String appId) =>
      state.any((e) => e.entityId == entityId && e.appId == appId);

  void toggle(String entityId, String appId, String categoryId) {
    if (isSaved(entityId, appId)) {
      state = state
          .where((e) => !(e.entityId == entityId && e.appId == appId))
          .toList();
    } else {
      state = [
        WishlistEntry(
          entityId: entityId,
          appId: appId,
          categoryId: categoryId,
          savedAt: DateTime.now(),
        ),
        ...state,
      ];
    }
    _save();
  }

  List<WishlistEntry> forApp(String appId) =>
      state.where((e) => e.appId == appId).toList();
}

final wishlistProvider =
    StateNotifierProvider<WishlistNotifier, List<WishlistEntry>>(
  (_) => WishlistNotifier(),
);
