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

// Conversational, vertical-adaptive triggers (not a clinical questionnaire).
const TRIGGERS: Record<string, string[]> = {
  Food: ["I'm hungry", "I really want it", "I want a treat", "The deal tempted me", "I'm just browsing", "I'm not sure"],
  Electronics: ["I need it", "I really want it", "I'm comparing options", "The deal tempted me", "I'm just browsing", "I'm not sure"],
  Travel: ["I really want this trip", "I need to book it", "I'm planning ahead", "The deal tempted me", "I'm just exploring", "I'm not sure"],
  Entertainment: ["I really want to go", "I want a break", "The deal tempted me", "I'm just exploring", "I'm not sure"],
  _default: ["I really want it", "I need it", "It caught my attention", "The deal tempted me", "I'm just browsing", "I'm not sure"],
};

function pct(d: Dream) {
  return Math.min(100, Math.round((d.saved / d.target) * 100));
}

function PauseScreen() {
  const { amt, cat } = Route.useSearch();
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, applySaving, activeDream, recordDecision, dreams, setActiveDream, imageFor } = useStore();

  const amount = amt || cartTotal || 0;
  const [step, setStep] = useState<"decide" | "choose" | "bought">("decide");
  const [feeling, setFeeling] = useState<string | null>(null);
  const triggers = TRIGGERS[cat] ?? TRIGGERS._default;

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
    if (dreams.length === 0) { navigate({ to: "/future" }); return; }
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
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(120% 55% at 50% 0%, oklch(0.79 0.105 82 / 0.14), transparent 60%)" }} />

        {/* DECIDE — amount + the two directions lead; trigger is secondary */}
        {step === "decide" && (
          <div className="flex-1 overflow-y-auto px-7 pt-12 pb-10 animate-rise">
            <p className="text-[11px] uppercase tracking-[0.32em] text-gold/80 text-center">take a moment</p>

            {/* The amount — the visual anchor */}
            <div className="mt-5 text-center">
              <p className="text-[13px] text-foreground/55">You're about to spend</p>
              <p className="font-display text-[64px] leading-none mt-1">{formatINR(amount)}</p>
              <p className="mt-2 text-[12px] uppercase tracking-[0.2em] text-foreground/40">on {cat.toLowerCase()}</p>
            </div>

            {/* The two directions — prominent */}
            <p className="mt-8 text-center font-display italic text-[15px] text-foreground/55">One choice. Two directions.</p>
            <div className="mt-4 space-y-3">
              <button onClick={buildFuture} className="w-full rounded-2xl px-5 py-4 text-left text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
                <span className="block font-display text-[18px]">Build my future</span>
                <span className="mt-0.5 block text-[13px] text-background/75">
                  Move {formatINR(amount)} toward {activeDream ? activeDream.name : "your dream"}.
                </span>
              </button>
              <button onClick={buy} className="w-full rounded-2xl border border-white/14 bg-white/5 px-5 py-4 text-left">
                <span className="block font-display text-[18px]">Enjoy it</span>
                <span className="mt-0.5 block text-[13px] text-foreground/50">Keep your order. You chose it consciously.</span>
              </button>
            </div>

            {/* dreams preview (opportunity, not guilt) */}
            {dreams.length > 0 && (
              <div className="mt-7">
                <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/40">this could move</p>
                <div className="mt-2 flex flex-col gap-2">
                  {dreams.slice(0, 3).map((d) => (
                    <div key={d.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-surface p-2.5">
                      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/5 text-[18px]">
                        {imageFor(d.cover) ? <img src={imageFor(d.cover)} alt="" className="h-full w-full object-cover" /> : d.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-[13px]">{d.name}</span>
                          <span className="text-[12px] text-gold">+{formatINR(amount)}</span>
                        </div>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/8">
                          <div className="h-full rounded-full" style={{ width: `${pct(d)}%`, background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* trigger — secondary, optional, conversational */}
            <div className="mt-7">
              <p className="text-center text-[12.5px] text-foreground/45">What's making you want it? <span className="text-foreground/30">(optional)</span></p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {triggers.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFeeling(feeling === t ? null : t)}
                    className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition ${feeling === t ? "border-gold/50 bg-gold/15 text-gold" : "border-white/10 bg-white/5 text-foreground/60"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CHOOSE — pick the goal, before → after */}
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

        {/* BOUGHT — enjoy it, no shame */}
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

function GoalChoiceCard({ dream, amount, onPick }: { dream: Dream; amount: number; onPick: () => void }) {
  const { imageFor } = useStore();
  const cover = imageFor(dream.cover);
  const after = dream.saved + amount;
  const afterPct = Math.min(100, Math.round((after / dream.target) * 100));
  const shortName = dream.name.replace(/^(My |my )/, "");
  return (
    <button onClick={onPick} className="overflow-hidden rounded-2xl border border-white/10 bg-surface text-left transition hover:border-gold/40">
      <div className="relative h-24 w-full">
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" />
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
          <span className="text-foreground/50">Before <span className="text-foreground/80">{formatINR(dream.saved)}</span></span>
          <span className="text-foreground/50">After <span className="text-gold">{formatINR(after)}</span></span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${afterPct}%`, background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))" }} />
        </div>
        <p className="mt-2 text-[12.5px] text-foreground/60">Your {shortName} just got {formatINR(amount)} closer.</p>
      </div>
    </button>
  );
}
