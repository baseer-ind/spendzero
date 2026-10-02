import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { AuthScreen } from "./AuthGate";
import { Story } from "./onboarding/Story";
import { Assessment } from "./onboarding/Assessment";
import { ProfileResult } from "./onboarding/ProfileResult";
import { FirstGoal } from "./onboarding/FirstGoal";

/**
 * Sequences the story-first first-run journey (see docs/PRODUCT_JOURNEY.md):
 *   splash → Story → Account → Assessment → Profile → First Goal → App
 * SSR-safe: renders a stable splash before hydration.
 */
export function ExperienceGate({ children }: { children: ReactNode }) {
  const { hydrated, authed, storySeen, profile, dreams } = useStore();
  const [showResult, setShowResult] = useState(false);

  if (!hydrated) return <Splash />;
  if (!storySeen) return <Story />;
  if (!authed) return <AuthScreen />;
  if (!profile) return <Assessment onDone={() => setShowResult(true)} />;
  if (showResult) return <ProfileResult onContinue={() => setShowResult(false)} />;
  if (dreams.length === 0) return <FirstGoal />;
  return <>{children}</>;
}

function Splash() {
  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center">
      <div className="flex flex-col items-center gap-3 animate-rise">
        <div className="h-14 w-14 rounded-full grid place-items-center ring-1 ring-gold/40 bg-gold/10 text-gold font-display text-[22px]">✦</div>
        <p className="font-display text-[20px]">Project Future</p>
      </div>
    </div>
  );
}
