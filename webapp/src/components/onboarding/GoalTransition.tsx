import { useNavigate } from "@tanstack/react-router";
import { formatINR, useStore } from "@/lib/store";

export function GoalTransition() {
  const { activeDream, dreams, setPostGoalSeen } = useStore();
  const navigate = useNavigate();
  const goal = activeDream ?? dreams[0];
  if (!goal) return null;

  function go(to: string) {
    setPostGoalSeen();
    navigate({ to });
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden grain flex flex-col justify-center px-7">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(120% 55% at 50% 0%, oklch(0.79 0.105 82 / 0.18), transparent 60%)" }} />
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80 animate-rise">your future has a name</p>
        <h1 className="font-display text-[44px] leading-[1.02] mt-3 animate-rise">
          {goal.emoji} <span className="text-shimmer-gold italic">{goal.name}</span>
        </h1>
        <p className="mt-4 font-display text-[22px] text-foreground/85 animate-rise">
          {formatINR(goal.saved)} <span className="text-foreground/40">/ {formatINR(goal.target)}</span>
        </p>
        <p className="mt-5 text-[15px] leading-relaxed text-foreground/70 max-w-[32ch] animate-rise">
          This is what you're choosing for.
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-foreground/55 max-w-[32ch] animate-rise">
          Now browse like you normally would — we'll add the pause when it's time to decide.
        </p>

        <div className="mt-9 space-y-3 animate-rise">
          <button onClick={() => go("/today")} className="w-full rounded-full py-4 text-center font-medium text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
            Explore today
          </button>
          <button onClick={() => go("/")} className="w-full rounded-full border border-white/10 bg-white/5 py-4 text-center text-sm text-foreground/70">
            View my future
          </button>
        </div>
      </div>
    </div>
  );
}
