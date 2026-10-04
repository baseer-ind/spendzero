import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Profile } from "./assessment";
import { cloudEnabled } from "./supabase";
import {
  cloudSignUp, cloudSignIn, cloudSignOut, cloudRecover, currentSession,
  pullSnapshot, hasCloudData, pushProfile, pushDream, pushDecision, deleteDreamCloud,
} from "./cloud";

/**
 * Local-first app state for SELFly.
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
  cover?: string; // image URL or data: URL (curated / searched / uploaded)
};

// Indian delivery address (checkout simulation only — no real orders are placed).
export type Address = {
  name: string;
  phone: string;
  flat: string; // Flat / House no / Building
  area: string; // Area / Street / Sector
  landmark: string;
  city: string;
  state: string;
  pin: string; // PIN Code
};

export type SaveEvent = {
  id: string;
  dreamId: string;
  amount: number; // rupees
  note: string;
  category?: string; // e.g. "Food", "Shopping"
  at: number;
};

// A conscious decision at the moment of purchase (both choices are legitimate).
export type Decision = {
  id: string;
  category: string; // craving category
  amount: number; // rupees considered
  trigger: string; // the feeling the user named
  choice: "enjoyed" | "redirected";
  dreamId?: string; // set when redirected
  at: number;
};

export type CartItem = {
  id: string;
  name: string;
  price: number; // rupees
  qty: number;
  image?: string;
  vertical?: string; // Food, Electronics, …
};

export type Account = { name: string; email: string };

export type WishItem = { id: string; name: string; price: number; image?: string; vertical: string };

// Per-day engagement aggregates (attention, not money). Active time only —
// background/idle time is excluded by the tracker. See lib/tracking.tsx and
// docs/CONSUMPTION_INTELLIGENCE.md.
export type DayEngagement = {
  activeMs: number;
  byVertical: Record<string, number>; // active ms per vertical (Food, Electronics…)
  byApp: Record<string, number>; // active ms per fictional app
  productsViewed: number; // products seen in a list
  productsOpened: number; // product detail opens
  cartAdds: number;
  cartValueExplored: number; // ₹ value added to cart (whether or not bought)
};

function emptyDay(): DayEngagement {
  return { activeMs: 0, byVertical: {}, byApp: {}, productsViewed: 0, productsOpened: 0, cartAdds: 0, cartValueExplored: 0 };
}

// A finished browsing session (for the activity timeline). Active time only.
export type SessionLog = { id: string; vertical: string; app?: string; at: number; ms: number };
function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

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
  decisionLog: Decision[];
  postGoalSeen: boolean;
  profilePhoto: string | null; // image URL or data: URL
  address: Address | null;
  wishlist: WishItem[];
  engagement: Record<string, DayEngagement>; // keyed by YYYY-MM-DD
  sessionLog: SessionLog[];
};

const EMPTY: State = {
  name: null, account: null, dreams: [], activeDreamId: null, events: [], cart: [],
  storySeen: false, profile: null, decisions: 0, decisionLog: [], postGoalSeen: false,
  profilePhoto: null, address: null, wishlist: [], engagement: {}, sessionLog: [],
};
const KEY = "project_future_state_v1";
const CREDS_KEY = "project_future_creds_v1";
const IMAGES_KEY = "project_future_images_v1";

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

type AuthResult = { ok: true; pendingVerification?: boolean } | { ok: false; error: string };

type Ctx = State & {
  hydrated: boolean;
  authed: boolean;
  activeDream: Dream | null;
  totalSaved: number;
  keptByCategory: Record<string, number>;
  currentStreak: number;
  cartTotal: number;
  cartCount: number;
  addToCart: (item: { id: string; name: string; price: number; image?: string; vertical?: string }) => void;
  setCartQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  setStorySeen: () => void;
  setProfile: (p: Profile) => void;
  recordDecision: (d: { category: string; amount: number; trigger: string; choice: "enjoyed" | "redirected"; dreamId?: string }) => void;
  setPostGoalSeen: () => void;
  setName: (n: string) => void;
  register: (d: { name: string; email: string; password: string }) => Promise<AuthResult>;
  login: (d: { email: string; password: string }) => Promise<AuthResult>;
  logout: () => void;
  recoverPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  cloudEnabled: boolean;
  syncing: boolean;
  booting: boolean;
  addDream: (d: { name: string; emoji?: string; target: number; cover?: string }) => string;
  updateDream: (id: string, patch: { name?: string; emoji?: string; target?: number; cover?: string | null }) => void;
  deleteDream: (id: string) => void;
  setActiveDream: (id: string) => void;
  setDreamCover: (id: string, cover: string | null) => void;
  imageFor: (ref?: string | null) => string | undefined;
  applySaving: (amount: number, note: string, category?: string) => Dream | null;
  setProfilePhoto: (url: string | null) => void;
  saveAddress: (a: Address) => void;
  // wishlist
  toggleWish: (item: WishItem) => void;
  inWishlist: (id: string) => boolean;
  // engagement / consumption intelligence
  trackActive: (ms: number, vertical: string, app?: string) => void;
  logSession: (e: { vertical: string; app?: string; at: number; ms: number }) => void;
  trackView: (count?: number) => void;
  trackOpen: () => void;
  trackCartExplore: (value: number) => void;
  weekSummary: WeekSummary;
  todaySummary: WeekSummary;
  reset: () => void;
};

export type WeekSummary = {
  activeMs: number;
  byVertical: Record<string, number>;
  byApp: Record<string, number>;
  productsViewed: number;
  productsOpened: number;
  cartAdds: number;
  cartValueExplored: number;
  spent: number; // from decisions: choice "enjoyed"
  redirected: number; // from decisions: choice "redirected"
  decisions: number;
  enjoyedCount: number;
  redirectedCount: number;
  sessions: number;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  // User images (dream covers, profile photo) live in their OWN store, keyed by a
  // short id, so a large photo can never block the main state from persisting.
  const [images, setImages] = useState<Record<string, string>>({});
  const [syncing, setSyncing] = useState(false);
  // True during the initial cloud-session restore so the gate shows the splash
  // instead of flashing the auth screen for a returning user.
  const [booting, setBooting] = useState(cloudEnabled);

  // Refs so fire-and-forget cloud pushes can read the latest state/images/uid
  // without being in every callback's dependency list.
  const uidRef = useRef<string | null>(null);
  const stateRef = useRef<State>(state);
  const imagesRef = useRef<Record<string, string>>(images);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { imagesRef.current = images; }, [images]);

  const resolveRef = useCallback((ref?: string | null): string | undefined => {
    if (!ref) return undefined;
    return ref.startsWith("u_") ? imagesRef.current[ref] : ref;
  }, []);

  // ---- fire-and-forget cloud pushes (no-ops unless cloud + authed) ----
  const cloudReady = () => cloudEnabled && !!uidRef.current;
  const pushDreamCloud = useCallback((d: Dream) => {
    if (!cloudReady()) return;
    void pushDream(uidRef.current!, { id: d.id, name: d.name, emoji: d.emoji, target: d.target, saved: d.saved, cover: resolveRef(d.cover) });
  }, [resolveRef]);
  const pushProfileCloud = useCallback(() => {
    if (!cloudReady()) return;
    const s = stateRef.current;
    void pushProfile(uidRef.current!, {
      name: s.name, email: s.account?.email ?? "", profile: s.profile,
      profilePhoto: resolveRef(s.profilePhoto) ?? undefined,
      storySeen: s.storySeen, postGoalSeen: s.postGoalSeen,
    });
  }, [resolveRef]);
  const pushDecisionCloud = useCallback((d: Decision) => {
    if (!cloudReady()) return;
    void pushDecision(uidRef.current!, { id: d.id, category: d.category, amount: d.amount, trigger: d.trigger, choice: d.choice, dreamId: d.dreamId, at: d.at });
  }, []);

  // Push the whole local snapshot to the cloud (first-time migration / first sync).
  const migrateUp = useCallback(async (uid: string) => {
    const s = stateRef.current;
    await pushProfile(uid, {
      name: s.name, email: s.account?.email ?? "", profile: s.profile,
      profilePhoto: resolveRef(s.profilePhoto) ?? undefined,
      storySeen: s.storySeen, postGoalSeen: s.postGoalSeen,
    });
    for (const d of s.dreams) {
      await pushDream(uid, { id: d.id, name: d.name, emoji: d.emoji, target: d.target, saved: d.saved, cover: resolveRef(d.cover) });
    }
    for (const d of s.decisionLog) {
      await pushDecision(uid, { id: d.id, category: d.category, amount: d.amount, trigger: d.trigger, choice: d.choice, dreamId: d.dreamId, at: d.at });
    }
  }, [resolveRef]);

  // Replace the in-session user data with the cloud snapshot (returning user).
  const applySnapshot = useCallback((uid: string, name: string, email: string, snap: NonNullable<Awaited<ReturnType<typeof pullSnapshot>>>) => {
    setState((s) => ({
      ...s,
      account: { name: snap.name || name, email },
      name: snap.name || name,
      profile: snap.profile,
      profilePhoto: snap.profilePhoto,
      dreams: snap.dreams.map((d) => ({ id: d.id, name: d.name, emoji: d.emoji, target: d.target, saved: d.saved, createdAt: Date.now(), cover: d.cover })),
      activeDreamId: snap.dreams[0]?.id ?? null,
      decisionLog: snap.decisionLog.map((d) => ({ id: d.id, category: d.category, amount: d.amount, trigger: d.trigger, choice: d.choice, dreamId: d.dreamId, at: d.at })),
      decisions: snap.decisionLog.length,
      storySeen: snap.storySeen,
      postGoalSeen: snap.postGoalSeen,
    }));
  }, []);

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
    try {
      const rawImg = localStorage.getItem(IMAGES_KEY);
      if (rawImg) setImages(JSON.parse(rawImg) as Record<string, string>);
    } catch {
      /* ignore */
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

  // Persist images separately; on quota failure, drop images no dream/profile uses.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
    } catch {
      try {
        const used = new Set<string>();
        state.dreams.forEach((d) => d.cover && used.add(d.cover));
        if (state.profilePhoto) used.add(state.profilePhoto);
        const pruned: Record<string, string> = {};
        for (const k of Object.keys(images)) if (used.has(k)) pruned[k] = images[k];
        localStorage.setItem(IMAGES_KEY, JSON.stringify(pruned));
      } catch {
        /* give up silently — main state is safe regardless */
      }
    }
  }, [images, hydrated, state.dreams, state.profilePhoto]);

  // After local hydration, restore a cloud session (if any) and pull the account's
  // data. With cloud enabled but no session, a prior device-local "account" is
  // cleared so the user signs in/up (their local dreams still migrate on signup).
  useEffect(() => {
    if (!hydrated || !cloudEnabled) return;
    let cancelled = false;
    // Never let a slow/unreachable backend trap the user on the splash.
    const guard = setTimeout(() => { if (!cancelled) setBooting(false); }, 4000);
    (async () => {
      const sess = await currentSession();
      if (cancelled) return;
      if (!sess) {
        setState((s) => (s.account ? { ...s, account: null } : s));
        setBooting(false);
        return;
      }
      uidRef.current = sess.uid;
      setSyncing(true);
      const snap = await pullSnapshot(sess.uid);
      if (cancelled) { setSyncing(false); setBooting(false); return; }
      if (snap && (snap.dreams.length || snap.profile)) {
        applySnapshot(sess.uid, sess.name, sess.email, snap);
      } else {
        // session but no cloud data yet — adopt the session and push what we have
        setState((s) => ({ ...s, account: { name: sess.name || s.name || "", email: sess.email } }));
        await migrateUp(sess.uid);
      }
      setSyncing(false);
      setBooting(false);
    })();
    return () => { cancelled = true; clearTimeout(guard); };
  }, [hydrated, applySnapshot, migrateUp]);

  // Store a chosen image and return a ref id; pass through URLs/SVG/existing ids.
  const putImg = useCallback((val?: string | null): string | undefined => {
    if (!val) return undefined;
    if (/^data:image\/(jpeg|png|webp)/i.test(val)) {
      const id = "u_" + uid();
      setImages((m) => ({ ...m, [id]: val }));
      return id;
    }
    return val; // remote URL, SVG data-URI illustration, or an existing "u_" id
  }, []);

  const imageFor = useCallback(
    (ref?: string | null): string | undefined => {
      if (!ref) return undefined;
      if (ref.startsWith("u_")) return images[ref];
      return ref;
    },
    [images],
  );

  const setName = useCallback((n: string) => {
    setState((s) => ({ ...s, name: n.trim() || null }));
    setTimeout(() => pushProfileCloud(), 0);
  }, [pushProfileCloud]);

  const register = useCallback(async (d: { name: string; email: string; password: string }): Promise<AuthResult> => {
    const email = d.email.trim().toLowerCase();
    const name = d.name.trim();
    if (!name) return { ok: false, error: "Enter your name." };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email." };
    if (d.password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

    if (cloudEnabled) {
      setSyncing(true);
      const res = await cloudSignUp(name, email, d.password);
      if (!res.ok) { setSyncing(false); return { ok: false, error: res.error }; }
      if (!res.hasSession) {
        // Email confirmation is on: no session yet. Do not log in or migrate;
        // the user verifies by email, then signs in (migration runs then).
        setSyncing(false);
        return { ok: true, pendingVerification: true };
      }
      uidRef.current = res.uid;
      setState((s) => ({ ...s, account: { name, email }, name }));
      // migrate any existing local data into the new account (best effort)
      try { await migrateUp(res.uid); } catch { /* keep local data; recoverable */ }
      setSyncing(false);
      return { ok: true };
    }

    // local-only fallback (no cloud configured)
    const creds = readCreds();
    if (creds[email]) return { ok: false, error: "An account with this email already exists. Sign in instead." };
    creds[email] = { name, pass: hash(d.password) };
    writeCreds(creds);
    setState((s) => ({ ...s, account: { name, email }, name }));
    return { ok: true };
  }, [migrateUp]);

  const login = useCallback(async (d: { email: string; password: string }): Promise<AuthResult> => {
    const email = d.email.trim().toLowerCase();

    if (cloudEnabled) {
      setSyncing(true);
      const res = await cloudSignIn(email, d.password);
      if (!res.ok) { setSyncing(false); return { ok: false, error: res.error }; }
      uidRef.current = res.uid;
      const existing = await hasCloudData(res.uid);
      if (existing) {
        const snap = await pullSnapshot(res.uid);
        if (snap) applySnapshot(res.uid, snap.name || "", email, snap);
        else setState((s) => ({ ...s, account: { name: s.name || "", email } }));
      } else {
        setState((s) => ({ ...s, account: { name: s.name || "", email } }));
        try { await migrateUp(res.uid); } catch { /* recoverable */ }
      }
      setSyncing(false);
      return { ok: true };
    }

    const creds = readCreds();
    const rec = creds[email];
    if (!rec || rec.pass !== hash(d.password)) return { ok: false, error: "Wrong email or password." };
    setState((s) => ({ ...s, account: { name: rec.name, email }, name: rec.name }));
    return { ok: true };
  }, [applySnapshot, migrateUp]);

  const logout = useCallback(() => {
    if (cloudEnabled) void cloudSignOut();
    uidRef.current = null;
    setImages({});
    setState(EMPTY);
  }, []);

  const recoverPassword = useCallback(async (email: string): Promise<{ ok: boolean; error?: string }> => {
    const e = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return { ok: false, error: "Enter a valid email." };
    if (!cloudEnabled) return { ok: false, error: "Password recovery needs the cloud account system." };
    return await cloudRecover(e);
  }, []);

  const addDream = useCallback(
    (d: { name: string; emoji?: string; target: number; cover?: string }) => {
      const id = uid();
      const coverRef = putImg(d.cover);
      const newDream: Dream = {
        id,
        name: d.name.trim(),
        emoji: d.emoji || "✨",
        target: Math.max(1, Math.round(d.target)),
        saved: 0,
        createdAt: Date.now(),
        cover: coverRef,
      };
      setState((s) => ({
        ...s,
        dreams: [...s.dreams, newDream],
        activeDreamId: s.activeDreamId ?? id,
      }));
      pushDreamCloud(newDream);
      return id;
    },
    [putImg, pushDreamCloud],
  );

  const updateDream = useCallback(
    (id: string, patch: { name?: string; emoji?: string; target?: number; cover?: string | null }) => {
      // Convert a new cover to a stored ref; null clears it; undefined leaves it.
      const coverRef = patch.cover === undefined ? undefined : patch.cover === null ? null : putImg(patch.cover);
      let updated: Dream | null = null;
      setState((s) => ({
        ...s,
        dreams: s.dreams.map((d) => {
          if (d.id !== id) return d;
          const next = { ...d };
          if (patch.name !== undefined && patch.name.trim()) next.name = patch.name.trim();
          if (patch.emoji) next.emoji = patch.emoji;
          if (patch.target !== undefined && patch.target > 0) next.target = Math.max(1, Math.round(patch.target));
          if (patch.cover !== undefined) next.cover = coverRef === null ? undefined : coverRef;
          updated = next;
          return next;
        }),
      }));
      if (updated) pushDreamCloud(updated);
    },
    [putImg, pushDreamCloud],
  );

  const deleteDream = useCallback((id: string) => {
    setState((s) => {
      const dreams = s.dreams.filter((d) => d.id !== id);
      const activeDreamId = s.activeDreamId === id ? (dreams[0]?.id ?? null) : s.activeDreamId;
      return { ...s, dreams, activeDreamId };
    });
    if (cloudEnabled && uidRef.current) void deleteDreamCloud(id);
  }, []);

  const setActiveDream = useCallback((id: string) => {
    setState((s) => ({ ...s, activeDreamId: id }));
  }, []);

  const setDreamCover = useCallback((id: string, cover: string | null) => {
    const ref = cover === null ? null : putImg(cover);
    setState((s) => ({
      ...s,
      dreams: s.dreams.map((d) => (d.id === id ? { ...d, cover: ref ?? undefined } : d)),
    }));
  }, [putImg]);

  const setProfilePhoto = useCallback((url: string | null) => {
    const ref = url === null ? null : putImg(url) ?? null;
    setState((s) => ({ ...s, profilePhoto: ref }));
    // push after state ref updates on next tick
    setTimeout(() => pushProfileCloud(), 0);
  }, [putImg, pushProfileCloud]);

  const saveAddress = useCallback((a: Address) => {
    setState((s) => ({ ...s, address: a }));
  }, []);

  const toggleWish = useCallback((item: WishItem) => {
    setState((s) => {
      const exists = s.wishlist.some((w) => w.id === item.id);
      return { ...s, wishlist: exists ? s.wishlist.filter((w) => w.id !== item.id) : [item, ...s.wishlist] };
    });
  }, []);
  const inWishlist = useCallback((id: string) => state.wishlist.some((w) => w.id === id), [state.wishlist]);

  // --- engagement (attention) ---
  const mutDay = useCallback((fn: (d: DayEngagement) => DayEngagement) => {
    setState((s) => {
      const k = todayKey();
      const day = s.engagement[k] ? { ...s.engagement[k] } : emptyDay();
      return { ...s, engagement: { ...s.engagement, [k]: fn(day) } };
    });
  }, []);

  const trackActive = useCallback((ms: number, vertical: string, app?: string) => {
    if (ms <= 0) return;
    mutDay((d) => ({
      ...d,
      activeMs: d.activeMs + ms,
      byVertical: { ...d.byVertical, [vertical]: (d.byVertical[vertical] || 0) + ms },
      byApp: app ? { ...d.byApp, [app]: (d.byApp[app] || 0) + ms } : d.byApp,
    }));
  }, [mutDay]);

  const logSession = useCallback((e: { vertical: string; app?: string; at: number; ms: number }) => {
    if (e.ms < 2000) return; // ignore trivial sessions
    setState((s) => ({ ...s, sessionLog: [{ id: uid(), ...e }, ...s.sessionLog].slice(0, 300) }));
  }, []);

  const trackView = useCallback((count = 1) => mutDay((d) => ({ ...d, productsViewed: d.productsViewed + count })), [mutDay]);
  const trackOpen = useCallback(() => mutDay((d) => ({ ...d, productsOpened: d.productsOpened + 1 })), [mutDay]);
  const trackCartExplore = useCallback((value: number) => mutDay((d) => ({ ...d, cartAdds: d.cartAdds + 1, cartValueExplored: d.cartValueExplored + Math.max(0, Math.round(value)) })), [mutDay]);

  const applySaving = useCallback((amount: number, note: string, category?: string) => {
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
        category,
        at: Date.now(),
      };
      return { ...s, dreams, events: [event, ...s.events].slice(0, 200) };
    });
    if (updated) pushDreamCloud(updated);
    return updated;
  }, [pushDreamCloud]);

  const addToCart = useCallback((item: { id: string; name: string; price: number; image?: string; vertical?: string }) => {
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

  const setStorySeen = useCallback(() => {
    setState((s) => ({ ...s, storySeen: true }));
    setTimeout(() => pushProfileCloud(), 0);
  }, [pushProfileCloud]);
  const setProfile = useCallback((p: Profile) => {
    setState((s) => ({ ...s, profile: p }));
    setTimeout(() => pushProfileCloud(), 0);
  }, [pushProfileCloud]);
  const recordDecision = useCallback(
    (d: { category: string; amount: number; trigger: string; choice: "enjoyed" | "redirected"; dreamId?: string }) => {
      const decision: Decision = { id: uid(), at: Date.now(), ...d };
      setState((s) => ({
        ...s,
        decisions: s.decisions + 1,
        decisionLog: [decision, ...s.decisionLog].slice(0, 300),
      }));
      pushDecisionCloud(decision);
    },
    [pushDecisionCloud],
  );
  const setPostGoalSeen = useCallback(() => {
    setState((s) => ({ ...s, postGoalSeen: true }));
    setTimeout(() => pushProfileCloud(), 0);
  }, [pushProfileCloud]);

  const reset = useCallback(() => setState(EMPTY), []);

  const weekSummary = useMemo<WeekSummary>(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 3600 * 1000;
    const acc: WeekSummary = {
      activeMs: 0, byVertical: {}, byApp: {}, productsViewed: 0, productsOpened: 0,
      cartAdds: 0, cartValueExplored: 0, spent: 0, redirected: 0, decisions: 0,
      enjoyedCount: 0, redirectedCount: 0, sessions: 0,
    };
    acc.sessions = state.sessionLog.filter((e) => e.at >= weekAgo).length;
    for (const [k, d] of Object.entries(state.engagement)) {
      if (new Date(k + "T00:00:00").getTime() < weekAgo) continue;
      acc.activeMs += d.activeMs;
      acc.productsViewed += d.productsViewed;
      acc.productsOpened += d.productsOpened;
      acc.cartAdds += d.cartAdds;
      acc.cartValueExplored += d.cartValueExplored;
      for (const [v, ms] of Object.entries(d.byVertical)) acc.byVertical[v] = (acc.byVertical[v] || 0) + ms;
      for (const [a, ms] of Object.entries(d.byApp)) acc.byApp[a] = (acc.byApp[a] || 0) + ms;
    }
    for (const dec of state.decisionLog) {
      if (dec.at < weekAgo) continue;
      acc.decisions += 1;
      if (dec.choice === "enjoyed") acc.spent += dec.amount;
      else acc.redirected += dec.amount;
    }
    return acc;
  }, [state.engagement, state.decisionLog, state.sessionLog]);

  const todaySummary = useMemo<WeekSummary>(() => {
    const k = todayKey();
    const d = state.engagement[k] ?? emptyDay();
    const start = new Date(k + "T00:00:00").getTime();
    const acc: WeekSummary = {
      activeMs: d.activeMs, byVertical: { ...d.byVertical }, byApp: { ...d.byApp },
      productsViewed: d.productsViewed, productsOpened: d.productsOpened, cartAdds: d.cartAdds,
      cartValueExplored: d.cartValueExplored, spent: 0, redirected: 0, decisions: 0,
      enjoyedCount: 0, redirectedCount: 0, sessions: 0,
    };
    acc.sessions = state.sessionLog.filter((e) => e.at >= start).length;
    for (const dec of state.decisionLog) {
      if (dec.at < start) continue;
      acc.decisions += 1;
      if (dec.choice === "enjoyed") { acc.spent += dec.amount; acc.enjoyedCount += 1; }
      else { acc.redirected += dec.amount; acc.redirectedCount += 1; }
    }
    return acc;
  }, [state.engagement, state.decisionLog, state.sessionLog]);

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

  // Money redirected, grouped by craving category (for the "Money You Kept" view).
  const keptByCategory = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of state.events) {
      const c = e.category || "Other";
      m[c] = (m[c] || 0) + e.amount;
    }
    return m;
  }, [state.events]);

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
    keptByCategory,
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
    recoverPassword,
    cloudEnabled,
    syncing,
    booting,
    addDream,
    updateDream,
    deleteDream,
    setActiveDream,
    setDreamCover,
    imageFor,
    applySaving,
    setProfilePhoto,
    saveAddress,
    toggleWish,
    inWishlist,
    trackActive,
    logSession,
    trackView,
    trackOpen,
    trackCartExplore,
    weekSummary,
    todaySummary,
    reset,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
