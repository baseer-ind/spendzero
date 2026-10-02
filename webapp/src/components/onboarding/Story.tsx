import { useState } from "react";
import { useStore } from "@/lib/store";

const PANELS = [
  {
    kicker: "The problem",
    title: ["Money rarely leaks", "through big decisions."],
    body: "It leaks through small, forgettable ones — the taps you don't even remember making.",
  },
  {
    kicker: "The insight",
    title: ["The urge to buy", "is loudest before you buy."],
    body: "And it fades fast. A short pause is usually all it takes to see it clearly.",
  },
  {
    kicker: "The stance",
    title: ["Spending isn't", "the enemy."],
    body: "Buy the things you genuinely love. The only target is the autopilot spending you'd regret.",
  },
  {
    kicker: "The idea",
    title: ["Turn the cravings you skip", "into a future you want."],
    body: "Every time you choose not to waste money, you can watch something meaningful get closer.",
  },
];

export function Story() {
  const { setStorySeen } = useStore();
  const [i, setI] = useState(0);
  const last = i === PANELS.length - 1;
  const p = PANELS[i];

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden grain flex flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(120% 55% at 50% 0%, oklch(0.79 0.105 82 / 0.12), transparent 60%), radial-gradient(90% 40% at 20% 100%, oklch(0.72 0.14 248 / 0.08), transparent 70%)" }}
        />
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex gap-1.5">
            {PANELS.map((_, idx) => (
              <span key={idx} className={`h-1 rounded-full transition-all ${idx === i ? "w-6 bg-gold" : "w-2 bg-white/15"}`} />
            ))}
          </div>
          <button onClick={setStorySeen} className="text-[12px] uppercase tracking-[0.18em] text-foreground/45">Skip</button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-7">
          <p className="text-[12px] uppercase tracking-[0.28em] text-gold/80 animate-rise">{p.kicker}</p>
          <h1 className="font-display text-[40px] leading-[1.05] mt-4 text-balance animate-rise">
            {p.title[0]}
            <br />
            <span className="text-shimmer-gold italic">{p.title[1]}</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-foreground/60 max-w-[34ch] animate-rise">{p.body}</p>
        </div>

        <div className="px-7 pb-10">
          <button
            onClick={() => (last ? setStorySeen() : setI(i + 1))}
            className="h-13 w-full rounded-full py-4 text-center font-medium text-background"
            style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}
          >
            {last ? "I'm in" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
