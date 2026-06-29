import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/providers/providers.dart';

Future<void> showFeedbackSheet(BuildContext context) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    builder: (context) => const _FeedbackSheet(),
  );
}

class _FeedbackSheet extends ConsumerStatefulWidget {
  const _FeedbackSheet();

  @override
  ConsumerState<_FeedbackSheet> createState() => _FeedbackSheetState();
}

class _FeedbackSheetState extends ConsumerState<_FeedbackSheet> {
  final _messageController = TextEditingController();
  int? _rating;
  bool _isSubmitting = false;
  String? _error;
  bool _submitted = false;

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final message = _messageController.text.trim();
    if (message.isEmpty) {
      setState(() => _error = 'Tell us what happened or what you think.');
      return;
    }
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      final repo = await ref.read(feedbackRepositoryProvider.future);
      await repo.submit(message: message, rating: _rating);
      if (mounted) setState(() => _submitted = true);
    } catch (_) {
      setState(() => _error = 'Couldn\'t send feedback. Please try again.');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
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
        children: _submitted ? _thankYou(context) : _form(context),
      ),
    );
  }

  List<Widget> _thankYou(BuildContext context) {
    return [
      Text('Thanks!', style: Theme.of(context).textTheme.titleLarge),
      const SizedBox(height: 8),
      Text(
        'Your feedback was sent. It genuinely helps shape what we fix next.',
        style: Theme.of(context).textTheme.bodyMedium,
      ),
      const SizedBox(height: 16),
      FilledButton(
        onPressed: () => Navigator.of(context).pop(),
        child: const Text('Close'),
      ),
    ];
  }

  List<Widget> _form(BuildContext context) {
    return [
      Text('Send feedback', style: Theme.of(context).textTheme.titleLarge),
      const SizedBox(height: 4),
      Text(
        'Found a bug, or have an idea? Tell us — this goes straight to the team.',
        style: Theme.of(context).textTheme.bodySmall,
      ),
      const SizedBox(height: 16),
      Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(5, (i) {
          final value = i + 1;
          return IconButton(
            onPressed: () => setState(() => _rating = value),
            icon: Icon(
              (_rating ?? 0) >= value ? Icons.star_rounded : Icons.star_outline_rounded,
              color: Theme.of(context).colorScheme.secondary,
            ),
            tooltip: '$value star${value == 1 ? '' : 's'}',
          );
        }),
      ),
      TextField(
        controller: _messageController,
        maxLines: 4,
        decoration: const InputDecoration(
          labelText: 'Your feedback',
          hintText: 'What happened? What would make this better?',
          border: OutlineInputBorder(),
        ),
      ),
      if (_error != null) ...[
        const SizedBox(height: 8),
        Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
      ],
      const SizedBox(height: 16),
      Row(
        children: [
          Expanded(
            child: TextButton(
              onPressed: () => context.push('/diagnostics'),
              child: const Text('View diagnostics'),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: FilledButton(
              onPressed: _isSubmitting ? null : _submit,
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Send'),
            ),
          ),
        ],
      ),
    ];
  }
}
