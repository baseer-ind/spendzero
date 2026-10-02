import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Profile } from "./assessment";

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

export type CartItem = {
  id: string;
  name: string;
  price: number; // rupees
  qty: number;
  image?: string;
};

export type Account = { name: string; email: string };

type State = {
  name: string | null;
  account: Account | null;
  dreams: Dream[];
  activeDreamId: string | null;
  events: SaveEvent[];
  cart: CartItem[];
  storySeen: boolean;
  profile: Profile | null;
  decisions: number; // conscious pause decisions made (buy or not-today)
  postGoalSeen: boolean;
};

const EMPTY: State = {
  name: null, account: null, dreams: [], activeDreamId: null, events: [], cart: [],
  storySeen: false, profile: null, decisions: 0, postGoalSeen: false,
};
const KEY = "project_future_state_v1";
const CREDS_KEY = "project_future_creds_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Lightweight, local-only credential store. NOTE: this is a device-local
// account for the beta (no server yet), so the "hash" is only obfuscation,
// not real security. Real cloud auth (Supabase) is the next layer.
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}

type Creds = Record<string, { name: string; pass: string }>;

function readCreds(): Creds {
  try {
    return JSON.parse(localStorage.getItem(CREDS_KEY) || "{}") as Creds;
  } catch {
    return {};
  }
}

function writeCreds(c: Creds) {
  try {
    localStorage.setItem(CREDS_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

export function formatINR(n: number): string {
  // Indian digit grouping (e.g. 1,20,000).
  const s = Math.round(n).toString();
  if (s.length <= 3) return `₹${s}`;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `₹${rest},${last3}`;
}

type AuthResult = { ok: true } | { ok: false; error: string };

type Ctx = State & {
  hydrated: boolean;
  authed: boolean;
  activeDream: Dream | null;
  totalSaved: number;
  currentStreak: number;
  cartTotal: number;
  cartCount: number;
  addToCart: (item: { id: string; name: string; price: number; image?: string }) => void;
  setCartQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  setStorySeen: () => void;
  setProfile: (p: Profile) => void;
  recordDecision: () => void;
  setPostGoalSeen: () => void;
  setName: (n: string) => void;
  register: (d: { name: string; email: string; password: string }) => AuthResult;
  login: (d: { email: string; password: string }) => AuthResult;
  logout: () => void;
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

  const register = useCallback((d: { name: string; email: string; password: string }): AuthResult => {
    const email = d.email.trim().toLowerCase();
    const name = d.name.trim();
    if (!name) return { ok: false, error: "Enter your name." };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email." };
    if (d.password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    const creds = readCreds();
    if (creds[email]) return { ok: false, error: "An account with this email already exists. Sign in instead." };
    creds[email] = { name, pass: hash(d.password) };
    writeCreds(creds);
    setState((s) => ({ ...s, account: { name, email }, name }));
    return { ok: true };
  }, []);

  const login = useCallback((d: { email: string; password: string }): AuthResult => {
    const email = d.email.trim().toLowerCase();
    const creds = readCreds();
    const rec = creds[email];
    if (!rec || rec.pass !== hash(d.password)) return { ok: false, error: "Wrong email or password." };
    setState((s) => ({ ...s, account: { name: rec.name, email }, name: rec.name }));
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, account: null }));
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

  const addToCart = useCallback((item: { id: string; name: string; price: number; image?: string }) => {
    setState((s) => {
      const existing = s.cart.find((c) => c.id === item.id);
      const cart = existing
        ? s.cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
        : [...s.cart, { ...item, qty: 1 }];
      return { ...s, cart };
    });
  }, []);

  const setCartQty = useCallback((id: string, qty: number) => {
    setState((s) => ({
      ...s,
      cart: qty <= 0 ? s.cart.filter((c) => c.id !== id) : s.cart.map((c) => (c.id === id ? { ...c, qty } : c)),
    }));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setState((s) => ({ ...s, cart: s.cart.filter((c) => c.id !== id) }));
  }, []);

  const clearCart = useCallback(() => {
    setState((s) => ({ ...s, cart: [] }));
  }, []);

  const setStorySeen = useCallback(() => setState((s) => ({ ...s, storySeen: true })), []);
  const setProfile = useCallback((p: Profile) => setState((s) => ({ ...s, profile: p })), []);
  const recordDecision = useCallback(() => setState((s) => ({ ...s, decisions: s.decisions + 1 })), []);
  const setPostGoalSeen = useCallback(() => setState((s) => ({ ...s, postGoalSeen: true })), []);

  const reset = useCallback(() => setState(EMPTY), []);

  const cartTotal = useMemo(() => state.cart.reduce((a, c) => a + c.price * c.qty, 0), [state.cart]);
  const cartCount = useMemo(() => state.cart.reduce((a, c) => a + c.qty, 0), [state.cart]);

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
    authed: state.account != null,
    activeDream,
    totalSaved,
    currentStreak,
    cartTotal,
    cartCount,
    addToCart,
    setCartQty,
    removeFromCart,
    clearCart,
    setStorySeen,
    setProfile,
    recordDecision,
    setPostGoalSeen,
    setName,
    register,
    login,
    logout,
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
