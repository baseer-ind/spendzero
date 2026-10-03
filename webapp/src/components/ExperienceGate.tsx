import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { AuthScreen } from "./AuthGate";
import { Story } from "./onboarding/Story";
import { Assessment } from "./onboarding/Assessment";
import { ProfileResult } from "./onboarding/ProfileResult";
import { FirstGoal } from "./onboarding/FirstGoal";
import { GoalTransition } from "./onboarding/GoalTransition";

/**
 * Sequences the story-first first-run journey (see docs/PRODUCT_JOURNEY.md):
 *   splash → Story → Account → Assessment → Profile → First Goal → App
 * SSR-safe: renders a stable splash before hydration.
 */
export function ExperienceGate({ children }: { children: ReactNode }) {
  const { hydrated, authed, storySeen, profile, dreams, postGoalSeen } = useStore();
  const [showResult, setShowResult] = useState(false);

  if (!hydrated) return <Splash />;
  if (!storySeen) return <Story />;
  if (!authed) return <AuthScreen />;
  if (!profile) return <Assessment onDone={() => setShowResult(true)} />;
  if (showResult) return <ProfileResult onContinue={() => setShowResult(false)} />;
  if (dreams.length === 0) return <FirstGoal />;
  if (!postGoalSeen) return <GoalTransition />;
  return <>{children}</>;
}

function Splash() {
  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center">
      <div className="flex flex-col items-center gap-4 animate-rise px-8 text-center">
        <img src="/brand/selfly-symbol-white.png" alt="SELFly" className="h-16 w-16 object-contain" />
        <p className="font-display text-[24px] tracking-tight">SELFly</p>
        <p className="mt-1 text-[13px] text-foreground/55">Choose for your future self.</p>
      </div>
    </div>
  );
}
