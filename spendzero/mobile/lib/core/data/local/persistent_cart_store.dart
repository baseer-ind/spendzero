import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../models/cart_item.dart';

const _kCartKey = 'spendzero_persistent_cart_v2';

/// StateNotifier that owns the in-memory cart and syncs it to
/// SharedPreferences on every mutation. This is the single source of truth
/// for the user's active craving cart across all fictional apps.
class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kCartKey);
    if (raw == null) return;
    try {
      final list = (jsonDecode(raw) as List)
          .map((e) => CartItem.fromJson(e as Map<String, dynamic>))
          .toList();
      state = list;
    } catch (_) {
      // Corrupted cache — start fresh.
    }
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _kCartKey,
      jsonEncode(state.map((e) => e.toJson()).toList()),
    );
  }

  /// Adds or increments a cart item. If the same [listingId] already exists
  /// in the cart for the same [appId], the quantity is increased.
  void addItem(CartItem item) {
    final existing = state.where(
      (e) => e.listingId == item.listingId && e.appId == item.appId,
    );
    if (existing.isNotEmpty) {
      state = [
        for (final e in state)
          if (e.listingId == item.listingId && e.appId == item.appId)
            CartItem(
              listingId: e.listingId,
              name: e.name,
              unitPricePaise: e.unitPricePaise,
              quantity: e.quantity + item.quantity,
              appId: e.appId,
              categoryId: e.categoryId,
              imageColorSeed: e.imageColorSeed,
            )
          else
            e,
      ];
    } else {
      state = [...state, item];
    }
    _save();
  }

  void setQuantity(String listingId, String appId, int qty) {
    if (qty <= 0) {
      removeItem(listingId, appId);
      return;
    }
    state = [
      for (final e in state)
        if (e.listingId == listingId && e.appId == appId)
          CartItem(
            listingId: e.listingId,
            name: e.name,
            unitPricePaise: e.unitPricePaise,
            quantity: qty,
            appId: e.appId,
            categoryId: e.categoryId,
            imageColorSeed: e.imageColorSeed,
          )
        else
          e,
    ];
    _save();
  }

  void removeItem(String listingId, String appId) {
    state = state
        .where((e) => !(e.listingId == listingId && e.appId == appId))
        .toList();
    _save();
  }

  /// Clears only the items from a specific fictional app (after checkout).
  void clearApp(String appId) {
    state = state.where((e) => e.appId != appId).toList();
    _save();
  }

  void clearAll() {
    state = [];
    _save();
  }

  /// Items belonging to a specific fictional app.
  List<CartItem> itemsForApp(String appId) =>
      state.where((e) => e.appId == appId).toList();

  int totalPaiseForApp(String appId) =>
      itemsForApp(appId).fold(0, (sum, e) => sum + e.totalPaise);

  int totalCountForApp(String appId) =>
      itemsForApp(appId).fold(0, (sum, e) => sum + e.quantity);
}

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>(
  (_) => CartNotifier(),
);
