import { useState } from "react";
import { QUESTIONS, SCALE, computeProfile } from "@/lib/assessment";
import { useStore } from "@/lib/store";

/** One question at a time, visible progress, conversational. Builds the profile. */
export function Assessment({ onDone }: { onDone: () => void }) {
  const { setProfile } = useStore();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const q = QUESTIONS[i];
  const pct = Math.round((i / QUESTIONS.length) * 100);

  function answer(value: number) {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (i < QUESTIONS.length - 1) {
      setI(i + 1);
    } else {
      setProfile(computeProfile(next));
      onDone();
    }
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden grain flex flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(120% 55% at 50% 0%, oklch(0.79 0.105 82 / 0.10), transparent 60%)" }}
        />
        <div className="px-6 pt-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setI(Math.max(0, i - 1))}
              disabled={i === 0}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-foreground/70 disabled:opacity-30"
              aria-label="Back"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </button>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))" }} />
            </div>
            <span className="text-[12px] text-foreground/45 tabular-nums">{i + 1}/{QUESTIONS.length}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-7">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">A quick read on your moments</p>
          <h2 key={q.id} className="font-display text-[28px] leading-[1.15] mt-4 text-balance animate-rise">{q.prompt}</h2>

          <div className="mt-8 flex flex-col gap-2.5">
            {SCALE.map((s) => (
              <button
                key={s.value}
                onClick={() => answer(s.value)}
                className={`w-full rounded-2xl border px-5 py-4 text-left text-[15px] transition ${
                  answers[q.id] === s.value ? "border-gold/50 bg-gold/10 text-foreground" : "border-white/10 bg-white/5 text-foreground/80 hover:border-white/20"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <p className="px-7 pb-10 text-center text-[12px] text-foreground/40">
          No right answers. Nothing here is a grade.
        </p>
      </div>
    </div>
  );
}
