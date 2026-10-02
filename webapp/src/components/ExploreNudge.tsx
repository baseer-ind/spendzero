import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useExploreSeconds, resetExploreSession } from "@/lib/tracking";

/**
 * A gentle, non-forcing awareness nudge. After a stretch of active browsing it
 * surfaces how long it's been and offers a real choice — keep going, or pause.
 * This is deliberately NOT an engagement-maximising pattern: the mission is to
 * make attention visible, not to keep people scrolling. See docs/EXPLORE_MODE.md.
 */
export function ExploreNudge({ thresholdSec = 120 }: { thresholdSec?: number }) {
  const seconds = useExploreSeconds();
  const navigate = useNavigate();
  const [snoozeUntil, setSnoozeUntil] = useState(thresholdSec);
  const [dismissed, setDismissed] = useState(false);

  const show = !dismissed && seconds >= snoozeUntil;
  if (!show) return null;

  const mins = Math.max(1, Math.round(seconds / 60));

  return (
    <div className="fixed inset-x-0 bottom-0 z-[55] mx-auto flex max-w-[440px] justify-center px-5 pb-24">
      <div className="w-full rounded-3xl border border-white/12 bg-background/95 p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur animate-rise">
        <p className="text-[11px] uppercase tracking-[0.26em] text-gold/80">just noticing</p>
        <p className="mt-2 font-display text-[19px] leading-snug">
          You've been exploring for about {mins} {mins === 1 ? "minute" : "minutes"}.
        </p>
        <p className="mt-1.5 text-[13px] text-foreground/55">No rush — enjoy it. Just making your attention visible.</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => { setSnoozeUntil(seconds + thresholdSec); }}
            className="flex-1 rounded-full border border-white/12 bg-white/5 py-3 text-[14px] text-foreground/80"
          >
            Keep exploring
          </button>
          <button
            onClick={() => { resetExploreSession(); setDismissed(true); navigate({ to: "/today" }); }}
            className="flex-1 rounded-full py-3 text-center font-medium text-background"
            style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}
          >
            Take a pause
          </button>
        </div>
      </div>
    </div>
  );
}
