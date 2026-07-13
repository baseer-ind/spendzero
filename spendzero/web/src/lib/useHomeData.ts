import { useCallback, useEffect, useState } from "react";
import { apiClient } from "./apiClient";
import {
  SavingsGoal,
  SpendCategory,
  UserStats,
  goalFromJson,
  categoryFromJson,
  userStatsFromJson,
} from "./models";

interface HomeData {
  goals: SavingsGoal[];
  categories: SpendCategory[];
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const EMPTY_STATS: UserStats = {
  totalAmountNotSpentPaise: 0,
  cravingsCompleted: 0,
  goalsCompleted: 0,
  currentStreakDays: 0,
  longestStreakDays: 0,
  categoriesExplored: [],
};

/**
 * Fetches goals/categories/stats from the real FastAPI backend
 * (GET /goals, /categories, /me/stats — see backend/app/api/{goals,categories,stats}.py)
 * for the Home screen. Falls back to empty data (never fake placeholder
 * dreams) if the backend is unreachable, so the UI still renders its
 * "set your first dream" empty state rather than crashing.
 */
export function useHomeData(): HomeData {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [categories, setCategories] = useState<SpendCategory[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      apiClient.get("/goals"),
      apiClient.get("/categories"),
      apiClient.get("/me/stats"),
    ]).then(([goalsRes, categoriesRes, statsRes]) => {
      if (cancelled) return;
      if (goalsRes.status === "fulfilled" && Array.isArray(goalsRes.value)) {
        setGoals(goalsRes.value.map(goalFromJson));
      } else {
        setGoals([]);
      }
      if (categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value)) {
        setCategories(categoriesRes.value.map(categoryFromJson));
      } else {
        setCategories([]);
      }
      if (statsRes.status === "fulfilled" && statsRes.value) {
        setStats(userStatsFromJson(statsRes.value));
      } else {
        setStats(EMPTY_STATS);
      }
      if (goalsRes.status === "rejected" && categoriesRes.status === "rejected") {
        setError("Couldn't reach the server. Showing offline state.");
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { goals, categories, stats, loading, error, refresh };
}
