import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _kSeenAchievementsKey = 'project_future_achievements_seen_v1';

/// Tracks which achievement ids the user has already had a celebration
/// shown for. Unlock state itself is always derived fresh from
/// [UserStats] (see `achievement.dart`) — this store exists purely so the
/// same badge doesn't pop a celebration dialog twice.
class SeenAchievementsNotifier extends StateNotifier<Set<String>> {
  SeenAchievementsNotifier() : super(<String>{}) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_kSeenAchievementsKey);
    if (raw == null) return;
    state = raw.toSet();
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_kSeenAchievementsKey, state.toList());
  }

  /// Marks [ids] as seen and returns only the ones that were newly added
  /// (i.e. not already seen before this call).
  List<String> markSeen(Iterable<String> ids) {
    final fresh = ids.where((id) => !state.contains(id)).toList();
    if (fresh.isEmpty) return fresh;
    state = {...state, ...fresh};
    _save();
    return fresh;
  }
}

final seenAchievementsProvider =
    StateNotifierProvider<SeenAchievementsNotifier, Set<String>>(
  (_) => SeenAchievementsNotifier(),
);
