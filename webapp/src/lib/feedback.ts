// Feedback & suggestions.
//
// Backend-ready by design: everything goes through FeedbackStore. Today the only
// implementation persists locally (localStorage). When a backend exists, add a
// syncing implementation — no UI changes needed. We never pretend local feedback
// has reached the product team; the UI says it's saved on this device for now.
// See docs/FEEDBACK_SYSTEM.md.

export const APP_VERSION = "1.0.0-rc1";

export type FeedbackType = "problem" | "suggestion" | "feature" | "confusing" | "broken" | "general" | "micro" | "other";

export type FeedbackStatus = "new" | "reviewed" | "planned" | "in_progress" | "released" | "closed";

export type FeedbackItem = {
  id: string;
  type: FeedbackType;
  category?: string; // free-form sub-category / title
  message: string;
  screen?: string; // context where it was sent
  rating?: string; // for micro-feedback (👍 / 🙂 / 😐 / 😕 / 👎 / yes / no)
  createdAt: number;
  appVersion: string;
  platform: string;
  status: FeedbackStatus;
  priority?: "low" | "medium" | "high";
  contact?: string; // optional, never required
  metadata?: Record<string, unknown>;
  synced: boolean; // false until a backend acknowledges it
};

export interface FeedbackStore {
  add(item: Omit<FeedbackItem, "id" | "createdAt" | "appVersion" | "platform" | "status" | "synced">): FeedbackItem;
  list(): FeedbackItem[];
}

const KEY = "project_future_feedback_v1";

function platform(): string {
  if (typeof navigator === "undefined") return "web";
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "web-android";
  if (/iphone|ipad|ipod/i.test(ua)) return "web-ios";
  return "web";
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Local (device-only) implementation. Swap/extend with a backend-syncing store later.
export const localFeedbackStore: FeedbackStore = {
  add(partial) {
    const item: FeedbackItem = {
      id: uid(),
      createdAt: Date.now(),
      appVersion: APP_VERSION,
      platform: platform(),
      status: "new",
      synced: false,
      ...partial,
    };
    try {
      const all = localFeedbackStore.list();
      localStorage.setItem(KEY, JSON.stringify([item, ...all].slice(0, 500)));
    } catch {
      /* ignore quota / private mode */
    }
    return item;
  },
  list() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]") as FeedbackItem[];
    } catch {
      return [];
    }
  },
};

export const FEEDBACK_TYPES: { id: FeedbackType; label: string; emoji: string }[] = [
  { id: "problem", label: "Report a problem", emoji: "🐞" },
  { id: "broken", label: "Something isn't working", emoji: "🔧" },
  { id: "confusing", label: "Something feels confusing", emoji: "😕" },
  { id: "suggestion", label: "Suggest an improvement", emoji: "💡" },
  { id: "feature", label: "Request a feature", emoji: "✨" },
  { id: "general", label: "Tell us what you think", emoji: "💬" },
  { id: "other", label: "Other", emoji: "📝" },
];

export const STATUS_LABEL: Record<FeedbackStatus, string> = {
  new: "Submitted",
  reviewed: "Under review",
  planned: "Planned",
  in_progress: "In progress",
  released: "Released",
  closed: "Closed",
};
