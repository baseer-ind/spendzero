import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../utils/category_labels.dart';
import '../utils/money.dart';

class ActivityRow extends StatelessWidget {
  const ActivityRow({super.key, required this.entry});

  final Map<String, dynamic> entry;

  @override
  Widget build(BuildContext context) {
    final categoryId = entry['category_id'] as String;
    final outcome = entry['outcome'] as String;
    final amountPaise = entry['amount_paise'] as int;
    final completedAt = DateTime.parse(entry['completed_at'] as String);
    final redirected = outcome == 'saved';
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: redirected
                  ? AppTheme.gold.withOpacity(0.16)
                  : AppTheme.destructive.withOpacity(0.16),
              child: Text(emojiForCategory(categoryId), style: const TextStyle(fontSize: 16)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    redirected
                        ? 'Redirected ${formatPaise(amountPaise)} from ${labelForCategory(categoryId)}'
                        : 'Spent on ${labelForCategory(categoryId)}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.foreground,
                          fontWeight: FontWeight.w500,
                        ),
                  ),
                  Text(
                    '${completedAt.day}/${completedAt.month}/${completedAt.year}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
