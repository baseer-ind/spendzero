/** Data shapes mirroring mobile/lib/core/models/*.dart 1:1. */

export type GoalPriority = "low" | "medium" | "high";

export interface SavingsGoal {
  id: string;
  title: string;
  emoji: string;
  targetPaise: number;
  savedPaise: number;
  targetDate: string | null;
  notes: string;
  category: string;
  priority: GoalPriority;
  archived: boolean;
  imageSeed?: string | null;
}

export function goalProgress(goal: SavingsGoal): number {
  if (goal.targetPaise === 0) return 0;
  return Math.min(Math.max(goal.savedPaise / goal.targetPaise, 0), 1);
}

export function goalFromJson(json: any): SavingsGoal {
  return {
    id: json.id,
    title: json.title,
    emoji: json.icon_key ?? "🎯",
    targetPaise: json.target_amount_paise,
    savedPaise: json.saved_amount_paise ?? 0,
    targetDate: json.target_date ?? null,
    notes: json.notes ?? "",
    category: json.category ?? "General",
    priority: (json.priority as GoalPriority) ?? "medium",
    archived: json.archived ?? false,
    imageSeed: json.image_seed ?? null,
  };
}

export interface SpendCategory {
  id: string;
  slug: string;
  name: string;
  emoji: string;
}

const ICON_BY_KEY: Record<string, string> = {
  "🍔": "🍔",
  "🛒": "🛒",
  "📦": "📦",
  "👕": "👕",
  "💄": "💄",
  "📱": "📱",
  "✈️": "✈️",
  "🏨": "🏨",
  "🎬": "🎬",
  "🚗": "🚗",
  "🎮": "🎮",
  "🎁": "🎁",
};

export function categoryFromJson(json: any): SpendCategory {
  const iconKey: string | undefined = json.icon_key;
  return {
    id: json.id,
    slug: json.slug,
    name: json.name,
    emoji: (iconKey && ICON_BY_KEY[iconKey]) ?? iconKey ?? "🛍️",
  };
}

export interface UserStats {
  totalAmountNotSpentPaise: number;
  cravingsCompleted: number;
  goalsCompleted: number;
  currentStreakDays: number;
  longestStreakDays: number;
  categoriesExplored: string[];
}

export function userStatsFromJson(json: any): UserStats {
  return {
    totalAmountNotSpentPaise: json.total_amount_not_spent_paise,
    cravingsCompleted: json.cravings_completed,
    goalsCompleted: json.goals_completed,
    currentStreakDays: json.current_streak_days,
    longestStreakDays: json.longest_streak_days,
    categoriesExplored: json.categories_explored ?? [],
  };
}
