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

  SavingsGoal copyWith({int? savedPaise}) => SavingsGoal(
        id: id,
        title: title,
        emoji: emoji,
        targetPaise: targetPaise,
        savedPaise: savedPaise ?? this.savedPaise,
      );
}
