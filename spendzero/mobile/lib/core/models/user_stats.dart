class UserStats {
  const UserStats({
    required this.totalAmountNotSpentPaise,
    required this.cravingsCompleted,
    required this.goalsCompleted,
    required this.currentStreakDays,
    required this.longestStreakDays,
    required this.categoriesExplored,
  });

  final int totalAmountNotSpentPaise;
  final int cravingsCompleted;
  final int goalsCompleted;
  final int currentStreakDays;
  final int longestStreakDays;
  final List<String> categoriesExplored;

  factory UserStats.fromJson(Map<String, dynamic> json) => UserStats(
        totalAmountNotSpentPaise: json['total_amount_not_spent_paise'] as int,
        cravingsCompleted: json['cravings_completed'] as int,
        goalsCompleted: json['goals_completed'] as int,
        currentStreakDays: json['current_streak_days'] as int,
        longestStreakDays: json['longest_streak_days'] as int,
        categoriesExplored: (json['categories_explored'] as List).map((e) => e as String).toList(),
      );
}
