import 'user_stats.dart';

/// Static definition of a single unlockable badge. Unlock state is derived
/// from [UserStats] at read time — nothing about *whether* a badge is
/// unlocked is persisted, only which ones the user has already been shown
/// a celebration for (see `achievements_store.dart`).
class AchievementDefinition {
  const AchievementDefinition({
    required this.id,
    required this.title,
    required this.description,
    required this.emoji,
    required this.isUnlocked,
    required this.progressLabel,
  });

  final String id;
  final String title;
  final String description;
  final String emoji;
  final bool Function(UserStats stats) isUnlocked;

  /// Short "3 of 5" style progress string shown while locked.
  final String Function(UserStats stats) progressLabel;
}

const List<AchievementDefinition> allAchievements = [
  AchievementDefinition(
    id: 'first-craving-skipped',
    title: 'First Save',
    description: 'Skip your very first craving.',
    emoji: '🌱',
    isUnlocked: _firstCravingSkipped,
    progressLabel: _firstCravingSkippedProgress,
  ),
  AchievementDefinition(
    id: 'cravings-10',
    title: 'Craving Crusher',
    description: 'Skip 10 cravings in total.',
    emoji: '🛡',
    isUnlocked: _cravings10,
    progressLabel: _cravings10Progress,
  ),
  AchievementDefinition(
    id: 'cravings-50',
    title: 'Iron Will',
    description: 'Skip 50 cravings in total.',
    emoji: '🦾',
    isUnlocked: _cravings50,
    progressLabel: _cravings50Progress,
  ),
  AchievementDefinition(
    id: 'streak-3',
    title: 'Warming Up',
    description: 'Reach a 3-day saving streak.',
    emoji: '🔥',
    isUnlocked: _streak3,
    progressLabel: _streak3Progress,
  ),
  AchievementDefinition(
    id: 'streak-7',
    title: 'One Week Strong',
    description: 'Reach a 7-day saving streak.',
    emoji: '🔥',
    isUnlocked: _streak7,
    progressLabel: _streak7Progress,
  ),
  AchievementDefinition(
    id: 'streak-30',
    title: 'Habit Formed',
    description: 'Reach a 30-day saving streak.',
    emoji: '🏆',
    isUnlocked: _streak30,
    progressLabel: _streak30Progress,
  ),
  AchievementDefinition(
    id: 'saved-1000',
    title: 'First ₹1,000',
    description: 'Save a total of ₹1,000 by skipping purchases.',
    emoji: '💰',
    isUnlocked: _saved1000,
    progressLabel: _saved1000Progress,
  ),
  AchievementDefinition(
    id: 'saved-10000',
    title: 'Big Saver',
    description: 'Save a total of ₹10,000 by skipping purchases.',
    emoji: '💎',
    isUnlocked: _saved10000,
    progressLabel: _saved10000Progress,
  ),
  AchievementDefinition(
    id: 'saved-100000',
    title: 'Savings Legend',
    description: 'Save a total of ₹1,00,000 by skipping purchases.',
    emoji: '👑',
    isUnlocked: _saved100000,
    progressLabel: _saved100000Progress,
  ),
  AchievementDefinition(
    id: 'goal-completed',
    title: 'Dream Achieved',
    description: 'Fully fund a savings dream.',
    emoji: '🎯',
    isUnlocked: _goalCompleted,
    progressLabel: _goalCompletedProgress,
  ),
  AchievementDefinition(
    id: 'explorer-3',
    title: 'Window Shopper',
    description: 'Resist cravings in 3 different categories.',
    emoji: '🧭',
    isUnlocked: _explorer3,
    progressLabel: _explorer3Progress,
  ),
  AchievementDefinition(
    id: 'explorer-6',
    title: 'Category Explorer',
    description: 'Resist cravings in 6 different categories.',
    emoji: '🗺',
    isUnlocked: _explorer6,
    progressLabel: _explorer6Progress,
  ),
];

bool _firstCravingSkipped(UserStats s) => s.cravingsCompleted >= 1;
String _firstCravingSkippedProgress(UserStats s) => '${s.cravingsCompleted.clamp(0, 1)}/1';

bool _cravings10(UserStats s) => s.cravingsCompleted >= 10;
String _cravings10Progress(UserStats s) => '${s.cravingsCompleted.clamp(0, 10)}/10';

bool _cravings50(UserStats s) => s.cravingsCompleted >= 50;
String _cravings50Progress(UserStats s) => '${s.cravingsCompleted.clamp(0, 50)}/50';

bool _streak3(UserStats s) => s.longestStreakDays >= 3;
String _streak3Progress(UserStats s) => '${s.longestStreakDays.clamp(0, 3)}/3';

bool _streak7(UserStats s) => s.longestStreakDays >= 7;
String _streak7Progress(UserStats s) => '${s.longestStreakDays.clamp(0, 7)}/7';

bool _streak30(UserStats s) => s.longestStreakDays >= 30;
String _streak30Progress(UserStats s) => '${s.longestStreakDays.clamp(0, 30)}/30';

bool _saved1000(UserStats s) => s.totalAmountNotSpentPaise >= 100000;
String _saved1000Progress(UserStats s) =>
    '₹${(s.totalAmountNotSpentPaise / 100).clamp(0, 1000).round()}/₹1,000';

bool _saved10000(UserStats s) => s.totalAmountNotSpentPaise >= 1000000;
String _saved10000Progress(UserStats s) =>
    '₹${(s.totalAmountNotSpentPaise / 100).clamp(0, 10000).round()}/₹10,000';

bool _saved100000(UserStats s) => s.totalAmountNotSpentPaise >= 10000000;
String _saved100000Progress(UserStats s) =>
    '₹${(s.totalAmountNotSpentPaise / 100).clamp(0, 100000).round()}/₹1,00,000';

bool _goalCompleted(UserStats s) => s.goalsCompleted >= 1;
String _goalCompletedProgress(UserStats s) => '${s.goalsCompleted.clamp(0, 1)}/1';

bool _explorer3(UserStats s) => s.categoriesExplored.length >= 3;
String _explorer3Progress(UserStats s) => '${s.categoriesExplored.length.clamp(0, 3)}/3';

bool _explorer6(UserStats s) => s.categoriesExplored.length >= 6;
String _explorer6Progress(UserStats s) => '${s.categoriesExplored.length.clamp(0, 6)}/6';
