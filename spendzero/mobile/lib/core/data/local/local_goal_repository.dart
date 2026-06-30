import 'package:uuid/uuid.dart';

import '../../models/goal.dart';
import '../contracts.dart';
import 'local_seed_data.dart';
import 'local_store.dart';

const _goalsKey = 'local_goals_v1';

class LocalGoalRepository implements GoalRepository {
  LocalGoalRepository(this._store);

  final LocalStore _store;

  Future<List<SavingsGoal>> _readAll() async {
    final stored = await _store.readList(_goalsKey);
    if (stored.isEmpty) {
      final seeded = seedGoals.map((g) => g.toJson()).toList();
      await _store.writeList(_goalsKey, seeded);
      return seedGoals;
    }
    return stored.map(SavingsGoal.fromJson).toList();
  }

  @override
  Future<List<SavingsGoal>> fetchGoals({bool includeArchived = false}) async {
    final all = await _readAll();
    return includeArchived ? all : all.where((g) => !g.archived).toList();
  }

  @override
  Future<SavingsGoal> createGoal({
    required String title,
    required String emoji,
    required int targetPaise,
    DateTime? targetDate,
    String notes = '',
    String category = 'General',
    GoalPriority priority = GoalPriority.medium,
    String? imageSeed,
  }) async {
    final goals = await _readAll();
    final goal = SavingsGoal(
      id: const Uuid().v4(),
      title: title,
      emoji: emoji,
      targetPaise: targetPaise,
      savedPaise: 0,
      targetDate: targetDate,
      notes: notes,
      category: category,
      priority: priority,
      imageSeed: imageSeed,
    );
    final updated = [...goals, goal];
    await _store.writeList(_goalsKey, updated.map((g) => g.toJson()).toList());
    return goal;
  }

  @override
  Future<SavingsGoal?> updateGoal(SavingsGoal goal) async {
    final goals = await _readAll();
    final index = goals.indexWhere((g) => g.id == goal.id);
    if (index == -1) return null;
    final updated = [...goals];
    updated[index] = goal;
    await _store.writeList(_goalsKey, updated.map((g) => g.toJson()).toList());
    return goal;
  }

  @override
  Future<void> deleteGoal(String goalId) async {
    final goals = await _readAll();
    final updated = goals.where((g) => g.id != goalId).toList();
    await _store.writeList(_goalsKey, updated.map((g) => g.toJson()).toList());
  }

  @override
  Future<SavingsGoal?> setArchived(String goalId, bool archived) async {
    final goals = await _readAll();
    final index = goals.indexWhere((g) => g.id == goalId);
    if (index == -1) return null;
    final updatedGoal = goals[index].copyWith(archived: archived);
    final updated = [...goals];
    updated[index] = updatedGoal;
    await _store.writeList(_goalsKey, updated.map((g) => g.toJson()).toList());
    return updatedGoal;
  }

  /// Concrete-only helper (not part of [GoalRepository]) used by the
  /// craving repository to credit a savings outcome to a goal.
  Future<SavingsGoal?> allocateSavings(String goalId, int amountPaise) async {
    final goals = await _readAll();
    final index = goals.indexWhere((g) => g.id == goalId);
    if (index == -1) return null;
    final updatedGoal = goals[index].copyWith(savedPaise: goals[index].savedPaise + amountPaise);
    final updated = [...goals];
    updated[index] = updatedGoal;
    await _store.writeList(_goalsKey, updated.map((g) => g.toJson()).toList());
    return updatedGoal;
  }
}
