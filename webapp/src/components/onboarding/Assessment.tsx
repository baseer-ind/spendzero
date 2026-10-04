import { useEffect, useRef, useState } from "react";
import { SCENARIOS, computeProfile, type Kind } from "@/lib/assessment";
import { formatINR, useStore } from "@/lib/store";

/**
 * Scenario-based assessment. Each screen is a real-life moment; the user simply
 * taps what they'd do. Answer → a brief contextual reaction (~750ms) → the next
 * scenario, automatically. No "Continue" button, no questionnaire feel. The
 * profile scoring (computeProfile) is unchanged — each choice carries the value.
 */
export function Assessment({ onDone }: { onDone: () => void }) {
  const { setProfile } = useStore();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [picked, setPicked] = useState<number | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const sc = SCENARIOS[i];
  const pct = Math.round((i / SCENARIOS.length) * 100);

  function choose(idx: number) {
    if (advancing) return;
    const value = sc.choices[idx].value;
    const next = { ...answers, [sc.qid]: value };
    setAnswers(next);
    setPicked(idx);
    setAdvancing(true);
    timer.current = setTimeout(() => {
      if (i < SCENARIOS.length - 1) {
        setI(i + 1);
        setPicked(null);
        setAdvancing(false);
      } else {
        setProfile(computeProfile(next));
        onDone();
      }
    }, 780);
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden flex flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background: "radial-gradient(120% 55% at 50% 0%, oklch(0.79 0.105 82 / 0.10), transparent 60%)" }}
        />

        {/* progress */}
        <div className="relative z-10 px-6 pt-7">
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))" }} />
            </div>
            <span className="text-[12px] text-foreground/45 tabular-nums">{i + 1}/{SCENARIOS.length}</span>
          </div>
        </div>

        <div key={sc.qid} className="relative z-10 flex-1 flex flex-col justify-center px-6 pb-4 animate-rise">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">{sc.eyebrow}</p>

          {/* contextual moment card */}
          <ContextCard kind={sc.kind} amount={sc.amount} badge={sc.badge} />

          <p className="mt-5 text-[17px] leading-relaxed text-foreground/85 text-balance">{sc.situation}</p>
          <p className="mt-3 text-[13px] text-foreground/45">What would you do?</p>

          {/* choices */}
          <div className="mt-4 flex flex-col gap-2.5">
            {sc.choices.map((c, idx) => {
              const isPicked = picked === idx;
              const dim = picked !== null && !isPicked;
              return (
                <button
                  key={c.label}
                  onClick={() => choose(idx)}
                  disabled={advancing}
                  className={`w-full rounded-2xl border px-5 py-4 text-left text-[15.5px] font-medium transition-all duration-200 ${
                    isPicked ? "border-gold/60 bg-gold/15 text-foreground" : "border-white/10 bg-white/5 text-foreground/85 hover:border-white/25"
                  } ${dim ? "opacity-35" : ""}`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* micro-reaction (brief; auto-advances) */}
          <div className="mt-4 h-10">
            {picked !== null && (
              <p className="text-[13.5px] leading-relaxed text-gold/90 animate-rise">{sc.choices[picked].reaction}</p>
            )}
          </div>
        </div>

        <p className="relative z-10 px-7 pb-9 text-center text-[12px] text-foreground/35">
          No right answers — just what you'd really do.
        </p>
      </div>
    </div>
  );
}

/** A small, premium, contextual visual for each kind of moment (line icons, no emoji). */
function ContextCard({ kind, amount, badge }: { kind: Kind; amount?: number; badge?: string }) {
  return (
    <div className="mt-5 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.79 0.105 82 / 0.18), transparent 70%)" }}
      />
      <div className="relative flex items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10 text-gold">
          <KindIcon kind={kind} />
        </span>
        {badge && (
          <span className="rounded-full bg-[#C9A988]/15 px-3 py-1 text-[11px] font-medium text-[#D9CDBD] ring-1 ring-[#C9A988]/30">
            {badge}
          </span>
        )}
      </div>
      {amount != null && (
        <p className="relative mt-4 font-display text-[34px] leading-none">{formatINR(amount)}</p>
      )}
    </div>
  );
}

function KindIcon({ kind }: { kind: Kind }) {
  const s = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "deal": return (<svg {...s}><path d="M20 12l-8 8-8-8V4h8z" /><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" /></svg>);
    case "food": return (<svg {...s}><path d="M4 3v8a3 3 0 006 0V3M7 3v18M17 3c-1.5 1-2 3-2 6s.5 4 2 4v8" /></svg>);
    case "wishlist": return (<svg {...s}><path d="M12 21s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z" /></svg>);
    case "social": return (<svg {...s}><circle cx="9" cy="8" r="3" /><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5M16 6a3 3 0 010 6M20.5 20c0-2-1-3.5-2.5-4.3" /></svg>);
    case "checkout": return (<svg {...s}><path d="M4 5h2l2 11h10l2-8H7" /><circle cx="9" cy="20" r="1.3" fill="currentColor" /><circle cx="18" cy="20" r="1.3" fill="currentColor" /></svg>);
    case "goal": return (<svg {...s}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>);
    case "timer": return (<svg {...s}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" /></svg>);
    case "scroll": return (<svg {...s}><rect x="6" y="2.5" width="12" height="19" rx="3" /><path d="M11 18h2" /></svg>);
    case "reward": return (<svg {...s}><rect x="3" y="8" width="18" height="5" rx="1" /><path d="M5 13v8h14v-8M12 8v13M12 8S9 3 6.5 4.5 9 8 12 8zM12 8s3-5 5.5-3.5S15 8 12 8z" /></svg>);
    case "future": return (<svg {...s}><path d="M3 18c4-9 14-9 18 0" /><circle cx="19" cy="7" r="2.2" fill="currentColor" /><path d="M3 21h18" /></svg>);
    default: return (<svg {...s}><circle cx="12" cy="12" r="8" /></svg>);
  }
}
