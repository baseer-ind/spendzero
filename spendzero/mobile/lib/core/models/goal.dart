enum GoalPriority { low, medium, high }

class SavingsGoal {
  const SavingsGoal({
    required this.id,
    required this.title,
    required this.emoji,
    required this.targetPaise,
    required this.savedPaise,
    this.targetDate,
    this.notes = '',
    this.category = 'General',
    this.priority = GoalPriority.medium,
    this.archived = false,
    this.imageSeed,
  });

  final String id;
  final String title;
  final String emoji;
  final int targetPaise;
  final int savedPaise;
  final DateTime? targetDate;
  final String notes;
  final String category;
  final GoalPriority priority;
  final bool archived;
  final String? imageSeed;

  double get progress => targetPaise == 0 ? 0 : (savedPaise / targetPaise).clamp(0, 1);

  factory SavingsGoal.fromJson(Map<String, dynamic> json) => SavingsGoal(
        id: json['id'] as String,
        title: json['title'] as String,
        emoji: json['icon_key'] as String? ?? '🎯',
        targetPaise: json['target_amount_paise'] as int,
        savedPaise: json['saved_amount_paise'] as int? ?? 0,
        targetDate: json['target_date'] != null
            ? DateTime.tryParse(json['target_date'] as String)
            : null,
        notes: json['notes'] as String? ?? '',
        category: json['category'] as String? ?? 'General',
        priority: GoalPriority.values.firstWhere(
          (p) => p.name == (json['priority'] as String? ?? 'medium'),
          orElse: () => GoalPriority.medium,
        ),
        archived: json['archived'] as bool? ?? false,
        imageSeed: json['image_seed'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'icon_key': emoji,
        'target_amount_paise': targetPaise,
        'saved_amount_paise': savedPaise,
        'target_date': targetDate?.toIso8601String(),
        'notes': notes,
        'category': category,
        'priority': priority.name,
        'archived': archived,
        'image_seed': imageSeed,
      };

  SavingsGoal copyWith({
    String? title,
    String? emoji,
    int? targetPaise,
    int? savedPaise,
    DateTime? targetDate,
    bool clearTargetDate = false,
    String? notes,
    String? category,
    GoalPriority? priority,
    bool? archived,
    String? imageSeed,
  }) => SavingsGoal(
        id: id,
        title: title ?? this.title,
        emoji: emoji ?? this.emoji,
        targetPaise: targetPaise ?? this.targetPaise,
        savedPaise: savedPaise ?? this.savedPaise,
        targetDate: clearTargetDate ? null : (targetDate ?? this.targetDate),
        notes: notes ?? this.notes,
        category: category ?? this.category,
        priority: priority ?? this.priority,
        archived: archived ?? this.archived,
        imageSeed: imageSeed ?? this.imageSeed,
      );
}
