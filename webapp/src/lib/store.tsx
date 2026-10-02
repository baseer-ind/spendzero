import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Local-first app state for Project Future.
 *
 * Everything persists in the browser (localStorage) so the core loop works
 * with no backend: create a dream, resist a craving, watch the money move.
 * SSR-safe: the server and the first client paint both render EMPTY state
 * (hydrated=false); real data is loaded in an effect, so there is no
 * hydration mismatch. Gate any dynamic UI on `hydrated`.
 */

export type Dream = {
  id: string;
  name: string;
  emoji: string;
  target: number; // rupees
  saved: number; // rupees
  createdAt: number;
};

export type SaveEvent = {
  id: string;
  dreamId: string;
  amount: number; // rupees
  note: string;
  at: number;
};

type State = {
  name: string | null;
  dreams: Dream[];
  activeDreamId: string | null;
  events: SaveEvent[];
};

const EMPTY: State = { name: null, dreams: [], activeDreamId: null, events: [] };
const KEY = "project_future_state_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function formatINR(n: number): string {
  // Indian digit grouping (e.g. 1,20,000).
  const s = Math.round(n).toString();
  if (s.length <= 3) return `₹${s}`;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `₹${rest},${last3}`;
}

type Ctx = State & {
  hydrated: boolean;
  activeDream: Dream | null;
  totalSaved: number;
  currentStreak: number;
  setName: (n: string) => void;
  addDream: (d: { name: string; emoji?: string; target: number }) => string;
  setActiveDream: (id: string) => void;
  applySaving: (amount: number, note: string) => Dream | null;
  reset: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        setState({ ...EMPTY, ...parsed });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore quota / private mode */
    }
  }, [state, hydrated]);

  const setName = useCallback((n: string) => {
    setState((s) => ({ ...s, name: n.trim() || null }));
  }, []);

  const addDream = useCallback(
    (d: { name: string; emoji?: string; target: number }) => {
      const id = uid();
      setState((s) => ({
        ...s,
        dreams: [
          ...s.dreams,
          {
            id,
            name: d.name.trim(),
            emoji: d.emoji || "✨",
            target: Math.max(1, Math.round(d.target)),
            saved: 0,
            createdAt: Date.now(),
          },
        ],
        activeDreamId: s.activeDreamId ?? id,
      }));
      return id;
    },
    [],
  );

  const setActiveDream = useCallback((id: string) => {
    setState((s) => ({ ...s, activeDreamId: id }));
  }, []);

  const applySaving = useCallback((amount: number, note: string) => {
    let updated: Dream | null = null;
    setState((s) => {
      const targetId = s.activeDreamId ?? s.dreams[0]?.id ?? null;
      if (!targetId) return s;
      const dreams = s.dreams.map((dr) => {
        if (dr.id !== targetId) return dr;
        updated = { ...dr, saved: dr.saved + Math.round(amount) };
        return updated;
      });
      const event: SaveEvent = {
        id: uid(),
        dreamId: targetId,
        amount: Math.round(amount),
        note,
        at: Date.now(),
      };
      return { ...s, dreams, events: [event, ...s.events].slice(0, 200) };
    });
    return updated;
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const activeDream = useMemo(
    () => state.dreams.find((d) => d.id === state.activeDreamId) ?? state.dreams[0] ?? null,
    [state.dreams, state.activeDreamId],
  );

  const totalSaved = useMemo(
    () => state.dreams.reduce((a, d) => a + d.saved, 0),
    [state.dreams],
  );

  const currentStreak = useMemo(() => {
    // Count consecutive days ending today that have at least one save event.
    if (state.events.length === 0) return 0;
    const days = new Set(
      state.events.map((e) => new Date(e.at).toISOString().slice(0, 10)),
    );
    let streak = 0;
    const cursor = new Date();
    // allow the streak to count from today or yesterday
    if (!days.has(cursor.toISOString().slice(0, 10))) {
      cursor.setDate(cursor.getDate() - 1);
      if (!days.has(cursor.toISOString().slice(0, 10))) return 0;
    }
    while (days.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [state.events]);

  const value: Ctx = {
    ...state,
    hydrated,
    activeDream,
    totalSaved,
    currentStreak,
    setName,
    addDream,
    setActiveDream,
    applySaving,
    reset,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
