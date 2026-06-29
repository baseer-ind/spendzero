class CravingCompleted {
  const CravingCompleted({
    required this.cravingSessionId,
    required this.amountNotSpentPaise,
    required this.todaySavingsPaise,
    required this.monthSavingsPaise,
  });

  final String cravingSessionId;
  final int amountNotSpentPaise;
  final int todaySavingsPaise;
  final int monthSavingsPaise;

  factory CravingCompleted.fromJson(Map<String, dynamic> json) => CravingCompleted(
        cravingSessionId: json['craving_session_id'] as String,
        amountNotSpentPaise: json['amount_not_spent_paise'] as int,
        todaySavingsPaise: json['today_savings_paise'] as int,
        monthSavingsPaise: json['month_savings_paise'] as int,
      );
}
