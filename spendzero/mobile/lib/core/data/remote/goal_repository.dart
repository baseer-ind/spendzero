import '../../models/goal.dart';
import '../../network/api_client.dart';
import '../contracts.dart';

class ApiGoalRepository implements GoalRepository {
  ApiGoalRepository(this._client);

  final ApiClient _client;

  @override
  Future<List<SavingsGoal>> fetchGoals({bool includeArchived = false}) async {
    final json = await _client.get('/goals') as List<dynamic>;
    final goals = json
        .map((item) => SavingsGoal.fromJson(item as Map<String, dynamic>))
        .toList();
    return includeArchived ? goals : goals.where((g) => !g.archived).toList();
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
    final json = await _client.post('/goals', body: {
      'title': title,
      'icon_key': emoji,
      'target_amount_paise': targetPaise,
      'target_date': targetDate?.toIso8601String(),
      'notes': notes,
      'category': category,
      'priority': priority.name,
      'image_seed': imageSeed,
    }) as Map<String, dynamic>;
    return SavingsGoal.fromJson(json);
  }

  @override
  Future<SavingsGoal?> updateGoal(SavingsGoal goal) async {
    final json = await _client.put('/goals/${goal.id}', body: goal.toJson()) as Map<String, dynamic>?;
    return json == null ? null : SavingsGoal.fromJson(json);
  }

  @override
  Future<void> deleteGoal(String goalId) async {
    throw UnsupportedError('Deleting goals requires backend support not yet wired up.');
  }

  @override
  Future<SavingsGoal?> setArchived(String goalId, bool archived) async {
    final json = await _client.put('/goals/$goalId', body: {'archived': archived}) as Map<String, dynamic>?;
    return json == null ? null : SavingsGoal.fromJson(json);
  }
}
