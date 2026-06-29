import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/providers.dart';

const _presetGoals = <(String, String)>[
  ('🏖', 'Goa Trip'),
  ('🚗', 'New Bike'),
  ('📱', 'iPhone'),
  ('💻', 'Laptop'),
  ('🏡', 'House'),
  ('🎓', 'Education'),
  ('💍', 'Wedding'),
  ('🚑', 'Emergency Fund'),
];

Future<void> showCreateGoalSheet(BuildContext context, WidgetRef ref) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    builder: (context) => const _CreateGoalSheet(),
  );
}

class _CreateGoalSheet extends ConsumerStatefulWidget {
  const _CreateGoalSheet();

  @override
  ConsumerState<_CreateGoalSheet> createState() => _CreateGoalSheetState();
}

class _CreateGoalSheetState extends ConsumerState<_CreateGoalSheet> {
  final _titleController = TextEditingController();
  final _targetController = TextEditingController();
  String _emoji = '🎯';
  bool _isSaving = false;
  String? _error;

  @override
  void dispose() {
    _titleController.dispose();
    _targetController.dispose();
    super.dispose();
  }

  void _applyPreset((String, String) preset) {
    setState(() {
      _emoji = preset.$1;
      _titleController.text = preset.$2;
    });
  }

  Future<void> _save() async {
    final title = _titleController.text.trim();
    final targetRupees = int.tryParse(_targetController.text.trim());
    if (title.isEmpty || targetRupees == null || targetRupees <= 0) {
      setState(() => _error = 'Enter a goal name and a target amount.');
      return;
    }
    setState(() {
      _isSaving = true;
      _error = null;
    });
    try {
      final repo = await ref.read(goalRepositoryProvider.future);
      await repo.createGoal(title: title, emoji: _emoji, targetPaise: targetRupees * 100);
      ref.invalidate(goalsProvider);
      if (mounted) Navigator.of(context).pop();
    } catch (_) {
      setState(() => _error = 'Couldn\'t save this goal. Please try again.');
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('New savings goal', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _presetGoals
                .map(
                  (preset) => ActionChip(
                    label: Text('${preset.$1} ${preset.$2}'),
                    onPressed: () => _applyPreset(preset),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _titleController,
            decoration: const InputDecoration(labelText: 'Goal name'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _targetController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Target amount (₹)'),
          ),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ],
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _isSaving ? null : _save,
            child: _isSaving
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Create goal'),
          ),
        ],
      ),
    );
  }
}
