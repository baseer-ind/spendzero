import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';

import '../../../core/models/goal.dart';
import '../../../core/providers/providers.dart';
import '../../../design_system/components/dream_cover.dart';

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

const _categories = <String>[
  'General',
  'Travel',
  'Gadgets',
  'Vehicle',
  'Home',
  'Education',
  'Lifestyle',
  'Emergency',
];

Future<void> showCreateGoalSheet(BuildContext context, WidgetRef ref, {SavingsGoal? editing}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    builder: (context) => _CreateGoalSheet(editing: editing),
  );
}

class _CreateGoalSheet extends ConsumerStatefulWidget {
  const _CreateGoalSheet({this.editing});

  final SavingsGoal? editing;

  @override
  ConsumerState<_CreateGoalSheet> createState() => _CreateGoalSheetState();
}

class _CreateGoalSheetState extends ConsumerState<_CreateGoalSheet> {
  late final _titleController = TextEditingController(text: widget.editing?.title ?? '');
  late final _targetController = TextEditingController(
    text: widget.editing == null ? '' : (widget.editing!.targetPaise ~/ 100).toString(),
  );
  late final _notesController = TextEditingController(text: widget.editing?.notes ?? '');
  late String _emoji = widget.editing?.emoji ?? '🎯';
  late String _category = widget.editing?.category ?? 'General';
  late GoalPriority _priority = widget.editing?.priority ?? GoalPriority.medium;
  late DateTime? _targetDate = widget.editing?.targetDate;
  late String? _coverRef = widget.editing?.imageSeed;
  bool _isSaving = false;
  String? _error;

  bool get _isEditing => widget.editing != null;

  @override
  void dispose() {
    _titleController.dispose();
    _targetController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _applyPreset((String, String) preset) {
    setState(() {
      _emoji = preset.$1;
      _titleController.text = preset.$2;
    });
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _targetDate ?? DateTime.now().add(const Duration(days: 90)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 3650)),
    );
    if (picked != null) setState(() => _targetDate = picked);
  }

  Future<void> _pickFromGallery() async {
    try {
      final picked = await ImagePicker().pickImage(
        source: ImageSource.gallery,
        maxWidth: 1600,
        imageQuality: 85,
      );
      if (picked == null) return;
      // The picker returns a cache path that can be purged; copy the image
      // into the app's documents dir so the cover persists with the dream.
      final dir = await getApplicationDocumentsDirectory();
      final dest = File('${dir.path}/dream_cover_${const Uuid().v4()}.jpg');
      await File(picked.path).copy(dest.path);
      if (mounted) setState(() => _coverRef = 'file:${dest.path}');
    } catch (_) {
      if (mounted) {
        setState(() => _error = "Couldn't add that photo. Try another one.");
      }
    }
  }

  Future<void> _save() async {
    final title = _titleController.text.trim();
    final targetRupees = int.tryParse(_targetController.text.trim());
    if (title.isEmpty || targetRupees == null || targetRupees <= 0) {
      setState(() => _error = 'Enter a dream name and a target amount.');
      return;
    }
    setState(() {
      _isSaving = true;
      _error = null;
    });
    try {
      final repo = await ref.read(goalRepositoryProvider.future);
      if (_isEditing) {
        await repo.updateGoal(widget.editing!.copyWith(
          title: title,
          emoji: _emoji,
          targetPaise: targetRupees * 100,
          targetDate: _targetDate,
          clearTargetDate: _targetDate == null,
          notes: _notesController.text.trim(),
          category: _category,
          priority: _priority,
          imageSeed: _coverRef,
        ));
      } else {
        await repo.createGoal(
          title: title,
          emoji: _emoji,
          targetPaise: targetRupees * 100,
          targetDate: _targetDate,
          notes: _notesController.text.trim(),
          category: _category,
          priority: _priority,
          imageSeed: _coverRef,
        );
      }
      ref.invalidate(goalsProvider);
      ref.invalidate(archivedGoalsProvider);
      if (mounted) Navigator.of(context).pop();
    } catch (_) {
      setState(() => _error = 'Couldn\'t save this dream. Please try again.');
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
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _isEditing ? 'Edit dream' : 'New dream',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            if (!_isEditing) ...[
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
            ],
            Row(
              children: [
                _EmojiPicker(emoji: _emoji, onChanged: (e) => setState(() => _emoji = e)),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _titleController,
                    decoration: const InputDecoration(labelText: 'Dream name'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Cover',
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    letterSpacing: 0.4,
                  ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 76,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: dreamCoverOptions.length + 1,
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemBuilder: (context, i) {
                  final scheme = Theme.of(context).colorScheme;
                  // First tile: pick from the user's gallery.
                  if (i == 0) {
                    final fileSelected = _coverRef?.startsWith('file:') ?? false;
                    return GestureDetector(
                      onTap: _pickFromGallery,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 64,
                            height: 52,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: fileSelected ? scheme.primary : scheme.outlineVariant,
                                width: fileSelected ? 2 : 1,
                              ),
                              image: fileSelected
                                  ? DecorationImage(
                                      image: FileImage(File(_coverRef!.substring(5))),
                                      fit: BoxFit.cover,
                                    )
                                  : null,
                            ),
                            child: fileSelected
                                ? null
                                : Icon(Icons.add_photo_alternate_outlined,
                                    color: scheme.onSurfaceVariant),
                          ),
                          const SizedBox(height: 4),
                          Text('Gallery', style: Theme.of(context).textTheme.labelSmall),
                        ],
                      ),
                    );
                  }

                  final opt = dreamCoverOptions[i - 1];
                  final ref = 'asset:${opt.key}';
                  final selected = _coverRef == ref;
                  return GestureDetector(
                    onTap: () => setState(() => _coverRef = selected ? null : ref),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 64,
                          height: 52,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: selected ? scheme.primary : scheme.outlineVariant,
                              width: selected ? 2 : 1,
                            ),
                            image: DecorationImage(
                              image: AssetImage(opt.asset),
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(opt.label, style: Theme.of(context).textTheme.labelSmall),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _targetController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Target amount (₹)'),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _category,
              decoration: const InputDecoration(labelText: 'Category'),
              items: _categories
                  .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                  .toList(),
              onChanged: (v) => setState(() => _category = v ?? _category),
            ),
            const SizedBox(height: 12),
            Text('Priority', style: Theme.of(context).textTheme.labelLarge),
            const SizedBox(height: 6),
            SegmentedButton<GoalPriority>(
              segments: const [
                ButtonSegment(value: GoalPriority.low, label: Text('Low')),
                ButtonSegment(value: GoalPriority.medium, label: Text('Medium')),
                ButtonSegment(value: GoalPriority.high, label: Text('High')),
              ],
              selected: {_priority},
              onSelectionChanged: (s) => setState(() => _priority = s.first),
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: _pickDate,
              child: InputDecorator(
                decoration: const InputDecoration(labelText: 'Target date (optional)'),
                child: Row(
                  children: [
                    Text(
                      _targetDate == null
                          ? 'No date set'
                          : '${_targetDate!.day}/${_targetDate!.month}/${_targetDate!.year}',
                    ),
                    const Spacer(),
                    if (_targetDate != null)
                      IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () => setState(() => _targetDate = null),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _notesController,
              maxLines: 2,
              decoration: const InputDecoration(labelText: 'Notes (optional)'),
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
                  : Text(_isEditing ? 'Save changes' : 'Create dream'),
            ),
          ],
        ),
      ),
    );
  }
}

const _emojiOptions = [
  '🎯', '🏖', '🚗', '📱', '💻', '🏡', '🎓', '💍', '🚑', '✈️', '🎮', '👗', '⌚', '🎸', '📷', '🛵',
];

class _EmojiPicker extends StatelessWidget {
  const _EmojiPicker({required this.emoji, required this.onChanged});

  final String emoji;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => showModalBottomSheet(
        context: context,
        builder: (context) => GridView.count(
          padding: const EdgeInsets.all(16),
          crossAxisCount: 6,
          children: _emojiOptions
              .map((e) => InkWell(
                    onTap: () {
                      onChanged(e);
                      Navigator.of(context).pop();
                    },
                    child: Center(child: Text(e, style: const TextStyle(fontSize: 28))),
                  ))
              .toList(),
        ),
      ),
      child: Container(
        width: 52,
        height: 52,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(child: Text(emoji, style: const TextStyle(fontSize: 24))),
      ),
    );
  }
}
