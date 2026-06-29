import 'package:uuid/uuid.dart';

import '../../models/craving_completed.dart';
import '../contracts.dart';
import 'local_goal_repository.dart';
import 'local_seed_data.dart';
import 'local_store.dart';

const _pendingSessionsKey = 'local_pending_sessions_v1';
const _historyKey = 'local_craving_history_v1';

class LocalCravingRepository implements CravingRepository {
  LocalCravingRepository(this._goalRepository, this._store);

  final LocalGoalRepository _goalRepository;
  final LocalStore _store;

  int _amountPaiseFor(List<Map<String, dynamic>> items) {
    var total = 0;
    for (final item in items) {
      final quantity = item['quantity'] as int;
      final unitPricePaise = item['unit_price_paise'] as int? ??
          findSeedListingById(item['listing_id'] as String)?.pricePaise ??
          0;
      total += unitPricePaise * quantity;
    }
    return total;
  }

  @override
  Future<CravingCompleted> checkout({
    required String categoryId,
    String? brandId,
    required List<Map<String, dynamic>> items,
  }) async {
    final amountPaise = _amountPaiseFor(items);
    final cravingSessionId = const Uuid().v4();

    final pending = await _store.readList(_pendingSessionsKey);
    pending.add({
      'id': cravingSessionId,
      'category_id': categoryId,
      'amount_paise': amountPaise,
      'created_at': DateTime.now().toIso8601String(),
    });
    await _store.writeList(_pendingSessionsKey, pending);

    return CravingCompleted(
      cravingSessionId: cravingSessionId,
      amountNotSpentPaise: amountPaise,
      todaySavingsPaise: amountPaise,
      monthSavingsPaise: amountPaise,
    );
  }

  @override
  Future<void> recordOutcome({
    required String cravingSessionId,
    required String outcome,
    String? goalId,
  }) async {
    final pending = await _store.readList(_pendingSessionsKey);
    final index = pending.indexWhere((s) => s['id'] == cravingSessionId);
    if (index == -1) return;

    final session = pending[index];
    final updatedPending = [...pending]..removeAt(index);
    await _store.writeList(_pendingSessionsKey, updatedPending);

    final history = await _store.readList(_historyKey);
    history.add({
      'id': session['id'],
      'category_id': session['category_id'],
      'amount_paise': session['amount_paise'],
      'outcome': outcome,
      'goal_id': goalId,
      'completed_at': DateTime.now().toIso8601String(),
    });
    await _store.writeList(_historyKey, history);

    if (outcome == 'saved' && goalId != null) {
      await _goalRepository.allocateSavings(goalId, session['amount_paise'] as int);
    }
  }
}
