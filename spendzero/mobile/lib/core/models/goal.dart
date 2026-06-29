class SavingsGoal {
  const SavingsGoal({
    required this.id,
    required this.title,
    required this.emoji,
    required this.targetPaise,
    required this.savedPaise,
  });

  final String id;
  final String title;
  final String emoji;
  final int targetPaise;
  final int savedPaise;

  double get progress => targetPaise == 0 ? 0 : (savedPaise / targetPaise).clamp(0, 1);

  factory SavingsGoal.fromJson(Map<String, dynamic> json) => SavingsGoal(
        id: json['id'] as String,
        title: json['title'] as String,
        emoji: json['icon_key'] as String? ?? '🎯',
        targetPaise: json['target_amount_paise'] as int,
        savedPaise: json['saved_amount_paise'] as int? ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'icon_key': emoji,
        'target_amount_paise': targetPaise,
        'saved_amount_paise': savedPaise,
      };

  SavingsGoal copyWith({int? savedPaise}) => SavingsGoal(
        id: id,
        title: title,
        emoji: emoji,
        targetPaise: targetPaise,
        savedPaise: savedPaise ?? this.savedPaise,
      );
}
