import '../../models/user_stats.dart';
import '../contracts.dart';
import 'local_goal_repository.dart';
import 'local_seed_data.dart';
import 'local_store.dart';

const _historyKey = 'local_craving_history_v1';

class LocalStatsRepository implements StatsRepository {
  LocalStatsRepository(this._store);

  final LocalStore _store;

  DateTime _dateOnly(DateTime dt) => DateTime(dt.year, dt.month, dt.day);

  @override
  Future<UserStats> fetchStats() async {
    final history = await _store.readList(_historyKey);
    if (history.isEmpty) return seedStats;

    final savedEntries = history.where((e) => e['outcome'] == 'saved').toList();

    final totalAmountNotSpentPaise = savedEntries.fold<int>(
      0,
      (sum, e) => sum + (e['amount_paise'] as int),
    );

    final cravingsCompleted = history.length;

    final categoriesExplored = history
        .map((e) => e['category_id'] as String)
        .toSet()
        .toList();

    final savedDates = savedEntries
        .map((e) => _dateOnly(DateTime.parse(e['completed_at'] as String)))
        .toSet()
        .toList()
      ..sort((a, b) => b.compareTo(a));

    var currentStreakDays = 0;
    if (savedDates.isNotEmpty) {
      final today = _dateOnly(DateTime.now());
      final yesterday = today.subtract(const Duration(days: 1));
      final mostRecent = savedDates.first;
      if (mostRecent == today || mostRecent == yesterday) {
        currentStreakDays = 1;
        var cursor = mostRecent;
        for (var i = 1; i < savedDates.length; i++) {
          final expectedPrev = cursor.subtract(const Duration(days: 1));
          if (savedDates[i] == expectedPrev) {
            currentStreakDays++;
            cursor = savedDates[i];
          } else {
            break;
          }
        }
      }
    }

    var longestStreakDays = 0;
    if (savedDates.isNotEmpty) {
      var run = 1;
      longestStreakDays = 1;
      for (var i = 1; i < savedDates.length; i++) {
        final expectedPrev = savedDates[i - 1].subtract(const Duration(days: 1));
        if (savedDates[i] == expectedPrev) {
          run++;
        } else {
          run = 1;
        }
        if (run > longestStreakDays) longestStreakDays = run;
      }
    }

    final goalRepository = LocalGoalRepository(_store);
    final goals = await goalRepository.fetchGoals();
    final goalsCompleted = goals.where((g) => g.savedPaise >= g.targetPaise).length;

    return UserStats(
      totalAmountNotSpentPaise: totalAmountNotSpentPaise,
      cravingsCompleted: cravingsCompleted,
      goalsCompleted: goalsCompleted,
      currentStreakDays: currentStreakDays,
      longestStreakDays: longestStreakDays,
      categoriesExplored: categoriesExplored,
    );
  }

  @override
  Future<List<Map<String, dynamic>>> fetchHistory() async {
    final history = await _store.readList(_historyKey);
    final sorted = [...history]
      ..sort((a, b) => (b['completed_at'] as String).compareTo(a['completed_at'] as String));
    return sorted;
  }
}
