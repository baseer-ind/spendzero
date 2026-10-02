import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

/**
 * Attention tracking for the simulated marketplace.
 *
 * Counts ACTIVE time only: the tab must be visible AND the user must have
 * interacted within IDLE_MS. Background-tab time and idle time are excluded,
 * so "28 minutes exploring" means real attention, not a left-open tab.
 * See docs/CONSUMPTION_INTELLIGENCE.md.
 */
const IDLE_MS = 30_000;
const TICK_MS = 1_000;
const FLUSH_EVERY = 5; // flush to the store every 5 active seconds

// A single cross-route "explore session" so the pause nudge can say
// "you've been exploring for X minutes" even as the user moves between screens
// within the same vertical. Client-memory only.
const sess = { vertical: "", activeMs: 0 };

export function useBrowseTracking(vertical: string, app?: string) {
  const { trackActive } = useStore();
  const lastActivity = useRef(Date.now());
  const buffer = useRef(0);
  const sinceFlush = useRef(0);

  useEffect(() => {
    if (sess.vertical !== vertical) {
      sess.vertical = vertical;
      sess.activeMs = 0;
    }
  }, [vertical]);

  useEffect(() => {
    const bump = () => { lastActivity.current = Date.now(); };
    const evs: (keyof DocumentEventMap)[] = ["pointerdown", "keydown", "scroll", "pointermove", "touchstart"];
    evs.forEach((e) => document.addEventListener(e, bump, { passive: true }));

    const flush = () => {
      if (buffer.current > 0) {
        trackActive(buffer.current, vertical, app);
        buffer.current = 0;
      }
    };

    const id = window.setInterval(() => {
      const visible = document.visibilityState === "visible";
      const active = visible && Date.now() - lastActivity.current < IDLE_MS;
      if (active) {
        buffer.current += TICK_MS;
        sess.activeMs += TICK_MS;
        sinceFlush.current += 1;
        if (sinceFlush.current >= FLUSH_EVERY) { flush(); sinceFlush.current = 0; }
      }
    }, TICK_MS);

    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      flush();
      window.clearInterval(id);
      evs.forEach((e) => document.removeEventListener(e, bump));
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [vertical, app, trackActive]);
}

/** Live seconds of the current explore session (for the pause nudge). */
export function useExploreSeconds(): number {
  const [s, setS] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setS(Math.floor(sess.activeMs / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);
  return s;
}

export function resetExploreSession() {
  sess.activeMs = 0;
}

export function fmtDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}
