import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { AuthScreen } from "./AuthGate";
import { Story } from "./onboarding/Story";
import { Assessment } from "./onboarding/Assessment";
import { ProfileResult } from "./onboarding/ProfileResult";
import { FirstGoal } from "./onboarding/FirstGoal";
import { GoalTransition } from "./onboarding/GoalTransition";
import { SelflyMark, SelflyGlyph } from "./brand/SelflyMark";
import { FeedbackFab } from "./FeedbackFab";

/**
 * Sequences the story-first first-run journey (see docs/PRODUCT_JOURNEY.md):
 *   splash → Story → Account → Assessment → Profile → First Goal → App
 * SSR-safe: renders a stable splash before hydration.
 */
export function ExperienceGate({ children }: { children: ReactNode }) {
  const { hydrated, booting, authed, storySeen, profile, dreams, postGoalSeen } = useStore();
  const [showResult, setShowResult] = useState(false);

  if (!hydrated || booting) return <Splash />;
  if (!storySeen) return <Story />;
  if (!authed) return <AuthScreen />;
  if (!profile) return <Assessment onDone={() => setShowResult(true)} />;
  if (showResult) return <ProfileResult onContinue={() => setShowResult(false)} />;
  if (dreams.length === 0) return <FirstGoal />;
  if (!postGoalSeen) return <GoalTransition />;
  return (
    <>
      {children}
      <FeedbackFab />
    </>
  );
}

function Splash() {
  return (
    <div className="min-h-screen bg-[#0F1419] text-white grid place-items-center">
      <div className="flex flex-col items-center gap-5 animate-rise px-8 text-center">
        <SelflyGlyph size={56} />
        <SelflyMark size={32} showSpark={false} />
        <p className="mt-1 text-[13px] text-white/55">Choose for your future self.</p>
      </div>
    </div>
  );
}
