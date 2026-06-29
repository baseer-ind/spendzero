import '../contracts.dart';
import 'local_store.dart';

const _feedbackKey = 'local_feedback_v1';

/// No network call — feedback just accumulates locally for now, per the
/// offline-first directive.
class LocalFeedbackRepository implements FeedbackRepository {
  LocalFeedbackRepository(this._store);

  final LocalStore _store;

  @override
  Future<void> submit({
    required String message,
    String category = 'general',
    int? rating,
  }) async {
    final entries = await _store.readList(_feedbackKey);
    entries.add({
      'message': message,
      'category': category,
      'rating': rating,
      'submitted_at': DateTime.now().toIso8601String(),
    });
    await _store.writeList(_feedbackKey, entries);
  }
}
