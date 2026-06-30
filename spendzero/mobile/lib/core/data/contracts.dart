import '../models/cart.dart';
import '../models/category.dart';
import '../models/craving_completed.dart';
import '../models/goal.dart';
import '../models/listing.dart';
import '../models/user_stats.dart';

/// Repository contracts implemented by both `local/` (on-device storage,
/// the V1 MVP default — see [providers.useLocalBackend]) and `remote/`
/// (the FastAPI-backed implementation, kept for when a backend is wired
/// back in). The UI only ever depends on these interfaces via the
/// providers in `core/providers/providers.dart`, so switching backends
/// never requires touching a screen.
abstract class CategoryRepository {
  Future<List<SpendCategory>> fetchCategories();
  Future<List<Listing>> fetchListings(String categoryId, {String? query});
}

abstract class GoalRepository {
  Future<List<SavingsGoal>> fetchGoals({bool includeArchived = false});
  Future<SavingsGoal> createGoal({
    required String title,
    required String emoji,
    required int targetPaise,
    DateTime? targetDate,
    String notes = '',
    String category = 'General',
    GoalPriority priority = GoalPriority.medium,
    String? imageSeed,
  });
  Future<SavingsGoal?> updateGoal(SavingsGoal goal);
  Future<void> deleteGoal(String goalId);
  Future<SavingsGoal?> setArchived(String goalId, bool archived);
}

abstract class CartRepository {
  Future<Cart> fetchCart(String categoryId);
  Future<Cart> saveItems(String categoryId, List<Map<String, dynamic>> items);
}

abstract class CravingRepository {
  Future<CravingCompleted> checkout({
    required String categoryId,
    String? brandId,
    required List<Map<String, dynamic>> items,
  });

  Future<void> recordOutcome({
    required String cravingSessionId,
    required String outcome,
    String? goalId,
  });
}

abstract class StatsRepository {
  Future<UserStats> fetchStats();
  Future<List<Map<String, dynamic>>> fetchHistory() async => [];
}

abstract class FeedbackRepository {
  Future<void> submit({
    required String message,
    String category = 'general',
    int? rating,
  });
}
