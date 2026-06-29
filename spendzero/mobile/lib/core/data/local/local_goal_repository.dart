import 'package:uuid/uuid.dart';

import '../../models/goal.dart';
import '../contracts.dart';
import 'local_seed_data.dart';
import 'local_store.dart';

const _goalsKey = 'local_goals_v1';

class LocalGoalRepository implements GoalRepository {
  LocalGoalRepository(this._store);

  final LocalStore _store;

  @override
  Future<List<SavingsGoal>> fetchGoals() async {
    final stored = await _store.readList(_goalsKey);
    if (stored.isEmpty) {
      final seeded = seedGoals.map((g) => g.toJson()).toList();
      await _store.writeList(_goalsKey, seeded);
      return seedGoals;
    }
    return stored.map(SavingsGoal.fromJson).toList();
  }

  @override
  Future<SavingsGoal> createGoal({
    required String title,
    required String emoji,
    required int targetPaise,
  }) async {
    final goals = await fetchGoals();
    final goal = SavingsGoal(
      id: const Uuid().v4(),
      title: title,
      emoji: emoji,
      targetPaise: targetPaise,
      savedPaise: 0,
    );
    final updated = [...goals, goal];
    await _store.writeList(_goalsKey, updated.map((g) => g.toJson()).toList());
    return goal;
  }

  /// Concrete-only helper (not part of [GoalRepository]) used by the
  /// craving repository to credit a savings outcome to a goal.
  Future<SavingsGoal?> allocateSavings(String goalId, int amountPaise) async {
    final goals = await fetchGoals();
    final index = goals.indexWhere((g) => g.id == goalId);
    if (index == -1) return null;
    final updatedGoal = goals[index].copyWith(savedPaise: goals[index].savedPaise + amountPaise);
    final updated = [...goals];
    updated[index] = updatedGoal;
    await _store.writeList(_goalsKey, updated.map((g) => g.toJson()).toList());
    return updatedGoal;
  }
}
