import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Screen } from "@/components/Shell";
import { formatINR, useStore, type Dream } from "@/lib/store";

export const Route = createFileRoute("/pause")({
  validateSearch: (s: Record<string, unknown>) => ({
    amt: Number(s.amt) || 0,
    from: typeof s.from === "string" ? s.from : "",
    cat: typeof s.cat === "string" ? s.cat : "Food",
  }),
  head: () => ({ meta: [{ title: "A moment — Project Future" }] }),
  component: PauseScreen,
});

// "Understand why you want it" — naming the trigger is the first step.
const FEELINGS = [
  "I genuinely want it",
  "I'm hungry",
  "I'm bored",
  "It looked interesting",
  "It's a great deal",
  "I deserve a treat",
  "I'm not sure",
];

function PauseScreen() {
  const { amt, cat } = Route.useSearch();
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, applySaving, activeDream, recordDecision, dreams, setActiveDream } = useStore();

  const amount = amt || cartTotal || 0;
  const [step, setStep] = useState<"feel" | "decide" | "choose" | "bought">("feel");
  const [feeling, setFeeling] = useState<string | null>(null);

  if (amount <= 0) {
    return (
      <Screen>
        <div className="mx-6 mt-24 rounded-3xl border border-white/8 bg-surface p-8 text-center">
          <p className="font-display text-[20px]">Nothing to decide right now</p>
          <Link to="/" className="mt-5 inline-block rounded-full px-6 py-3 text-background font-medium" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>Back home</Link>
        </div>
      </Screen>
    );
  }

  function buy() {
    recordDecision({ category: cat, amount, trigger: feeling ?? "unspecified", choice: "enjoyed" });
    if (cart.length) clearCart();
    setStep("bought");
  }

  function buildFuture() {
    if (dreams.length === 0) {
      navigate({ to: "/future" });
      return;
    }
    setStep("choose");
  }

  function doRedirect(goalId: string) {
    setActiveDream(goalId);
    recordDecision({ category: cat, amount, trigger: feeling ?? "unspecified", choice: "redirected", dreamId: goalId });
    applySaving(amount, feeling ? `Paused — ${feeling.toLowerCase()}` : "Paused a craving", cat);
    if (cart.length) clearCart();
    navigate({ to: "/continue" });
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden grain flex flex-col">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(120% 55% at 50% 0%, oklch(0.79 0.105 82 / 0.12), transparent 60%)" }} />

        {/* STEP 1 — understand why you want it */}
        {step === "feel" && (
          <div className="flex-1 flex flex-col justify-center px-7 animate-rise">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80">take a moment</p>
            <h1 className="font-display text-[40px] leading-[1.03] mt-3">You want this.</h1>
            <p className="mt-4 text-[15px] text-foreground/60">No judgement — just notice. What's going on right now?</p>
            <div className="mt-7 flex flex-col gap-2.5">
              {FEELINGS.map((f) => (
                <button
                  key={f}
                  onClick={() => { setFeeling(f); setStep("decide"); }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left text-[15px] text-foreground/85 hover:border-gold/40 transition"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — the decision moment: craving vs. future, both legitimate */}
        {step === "decide" && (
          <div className="flex-1 overflow-y-auto px-7 py-10 animate-rise">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80">{feeling}</p>

            {/* The craving */}
            <div className="mt-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">this craving · {cat}</p>
              <p className="font-display text-[44px] leading-none mt-1">{formatINR(amount)}</p>
            </div>

            {/* The future — dreams made visible, as opportunity, not guilt */}
            {dreams.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-[22px] leading-tight">Your future is waiting.</h2>
                <p className="mt-1.5 text-[13.5px] text-foreground/55">
                  You could put {formatINR(amount)} toward it instead.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {dreams.map((d) => <DreamGlance key={d.id} dream={d} active={d.id === (activeDream?.id ?? dreams[0]?.id)} />)}
                </div>
              </div>
            )}

            <p className="mt-9 text-center font-display italic text-[15px] text-foreground/55">One choice. Two directions.</p>
            <p className="mt-1 text-center text-[13px] text-foreground/40">{formatINR(amount)} — what do you choose?</p>

            <div className="mt-5 space-y-3">
              <button onClick={buy} className="w-full rounded-2xl border border-white/12 bg-white/5 px-5 py-4 text-left">
                <span className="block font-display text-[16px]">Enjoy it</span>
                <span className="mt-0.5 block text-[12.5px] text-foreground/50">Keep the order. You chose it consciously.</span>
              </button>
              <button onClick={buildFuture} className="w-full rounded-2xl px-5 py-4 text-left text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
                <span className="block font-display text-[16px]">Build my future</span>
                <span className="mt-0.5 block text-[12.5px] text-background/70">
                  Put {formatINR(amount)} toward {activeDream ? activeDream.name : "your dream"}.
                </span>
              </button>
            </div>
            <button onClick={() => setStep("feel")} className="mt-6 block w-full text-center text-[13px] text-foreground/45">← back</button>
          </div>
        )}

        {/* STEP 3 — pick the goal, see before → after */}
        {step === "choose" && (
          <div className="flex-1 overflow-y-auto px-7 py-10 animate-rise">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80">where should it go?</p>
            <h1 className="font-display text-[30px] leading-[1.1] mt-3">
              Move <span className="text-shimmer-gold">{formatINR(amount)}</span> toward…
            </h1>
            <div className="mt-6 flex flex-col gap-3">
              {dreams.map((d) => <GoalChoiceCard key={d.id} dream={d} amount={amount} onPick={() => doRedirect(d.id)} />)}
            </div>
            <button onClick={() => setStep("decide")} className="mt-6 block w-full text-center text-[13px] text-foreground/45">← back</button>
          </div>
        )}

        {/* STEP 4 — enjoy it, no shame */}
        {step === "bought" && (
          <div className="flex-1 flex flex-col justify-center px-7 text-center animate-rise">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold/10 ring-1 ring-gold/30 text-[32px]">🎉</div>
            <h1 className="font-display text-[34px] leading-tight mt-6">Enjoy it.</h1>
            <p className="mt-4 text-[15px] text-foreground/60 max-w-[30ch] mx-auto">
              You made the choice consciously — that's the whole point. No guilt here.
            </p>
            <div className="mt-8 space-y-3">
              <Link to="/" className="block w-full rounded-full py-4 text-center font-medium text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>Back home</Link>
              {dreams.length > 0 && (
                <Link to="/future" className="block w-full rounded-full border border-white/10 bg-white/5 py-4 text-center text-sm text-foreground/70">See my future</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function pct(d: Dream) {
  return Math.min(100, Math.round((d.saved / d.target) * 100));
}

// Read-only glance at a dream during the decision — shows the real cover/photo.
function DreamGlance({ dream, active }: { dream: Dream; active: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-3 ${active ? "border-gold/40 bg-gold/5" : "border-white/8 bg-surface"}`}>
      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/5 text-[24px]">
        {dream.cover ? <img src={dream.cover} alt="" className="h-full w-full object-cover" /> : dream.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="truncate font-display text-[15px]">{dream.name}</h4>
          <span className="shrink-0 text-[12px] text-gold">{pct(dream)}%</span>
        </div>
        <p className="mt-0.5 text-[11px] text-foreground/45">{formatINR(dream.saved)} / {formatINR(dream.target)}</p>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full" style={{ width: `${pct(dream)}%`, background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))" }} />
        </div>
      </div>
    </div>
  );
}

// Goal card in the choose step — makes the redirect tangible (before → after).
function GoalChoiceCard({ dream, amount, onPick }: { dream: Dream; amount: number; onPick: () => void }) {
  const before = dream.saved;
  const after = dream.saved + amount;
  const afterPct = Math.min(100, Math.round((after / dream.target) * 100));
  return (
    <button onClick={onPick} className="overflow-hidden rounded-2xl border border-white/10 bg-surface text-left transition hover:border-gold/40">
      <div className="relative h-24 w-full">
        {dream.cover ? (
          <img src={dream.cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-white/5 text-[30px]">{dream.emoji}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
          <span className="font-display text-[17px] text-white drop-shadow">{dream.emoji} {dream.name}</span>
          <span className="rounded-full bg-black/45 px-2 py-0.5 text-[12px] text-gold backdrop-blur">+{formatINR(amount)}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-foreground/50">Before <span className="text-foreground/80">{formatINR(before)}</span></span>
          <span className="text-foreground/50">After <span className="text-gold">{formatINR(after)}</span></span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${afterPct}%`, background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))" }} />
        </div>
        <p className="mt-2 text-[12.5px] text-foreground/60">{dream.name.replace(/^(My |my )/, "")} just got {formatINR(amount)} closer.</p>
      </div>
    </button>
  );
}
