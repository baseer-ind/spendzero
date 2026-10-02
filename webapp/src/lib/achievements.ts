import type { SaveEvent, Dream } from "./store";

// Achievements reinforce identity + progress and always point somewhere useful.
export type Achievement = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  to: string; // where tapping it leads
};

function distinctDays(events: SaveEvent[]): number {
  return new Set(events.map((e) => new Date(e.at).toISOString().slice(0, 10))).size;
}

export function computeAchievements(args: {
  events: SaveEvent[];
  dreams: Dream[];
  totalSaved: number;
  pauses: number; // conscious decisions (buy or not-today)
}): Achievement[] {
  const { events, dreams, totalSaved, pauses } = args;
  const anyMilestone = dreams.some((d) => d.saved > 0 && d.saved / d.target >= 0.1);
  return [
    { id: "first_pause", title: "First Pause", desc: "You stopped to decide before spending.", icon: "✦", unlocked: pauses >= 1, to: "/journey" },
    { id: "first_redirect", title: "First Redirection", desc: "You moved money toward your future.", icon: "→", unlocked: events.length >= 1, to: "/future" },
    { id: "built_1000", title: "₹1,000 Future Built", desc: "₹1,000 redirected in total.", icon: "◆", unlocked: totalSaved >= 1000, to: "/future" },
    { id: "momentum_7", title: "7-Day Momentum", desc: "Conscious decisions on seven days.", icon: "☀", unlocked: distinctDays(events) >= 7, to: "/journey" },
    { id: "first_milestone", title: "First Dream Milestone", desc: "A goal passed 10%.", icon: "🏔", unlocked: anyMilestone, to: "/future" },
  ];
}
