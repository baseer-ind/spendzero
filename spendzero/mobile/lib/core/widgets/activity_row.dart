import 'package:flutter/material.dart';

import '../utils/category_labels.dart';
import '../utils/money.dart';

class ActivityRow extends StatelessWidget {
  const ActivityRow({super.key, required this.entry});

  final Map<String, dynamic> entry;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final categoryId = entry['category_id'] as String;
    final outcome = entry['outcome'] as String;
    final amountPaise = entry['amount_paise'] as int;
    final completedAt = DateTime.parse(entry['completed_at'] as String);
    final redirected = outcome == 'saved';
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: redirected ? colors.tertiaryContainer : colors.errorContainer,
            child: Text(emojiForCategory(categoryId), style: const TextStyle(fontSize: 16)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  redirected
                      ? 'Redirected ${formatPaise(amountPaise)} from ${labelForCategory(categoryId)}'
                      : 'Spent on ${labelForCategory(categoryId)}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                Text(
                  '${completedAt.day}/${completedAt.month}/${completedAt.year}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: colors.outline),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
