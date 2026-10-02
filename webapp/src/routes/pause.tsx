import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Screen } from "@/components/Shell";
import { formatINR, useStore } from "@/lib/store";

export const Route = createFileRoute("/pause")({
  validateSearch: (s: Record<string, unknown>) => ({
    amt: Number(s.amt) || 0,
    from: typeof s.from === "string" ? s.from : "",
  }),
  head: () => ({ meta: [{ title: "A moment — Project Future" }] }),
  component: PauseScreen,
});

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
  const { amt } = Route.useSearch();
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
    recordDecision();
    if (cart.length) clearCart();
    setStep("bought");
  }

  function notToday() {
    recordDecision();
    if (dreams.length === 0) {
      navigate({ to: "/future" });
      return;
    }
    if (dreams.length === 1) {
      doRedirect(dreams[0].id);
      return;
    }
    setStep("choose");
  }

  function doRedirect(goalId: string) {
    setActiveDream(goalId);
    applySaving(amount, feeling ? `Paused — ${feeling.toLowerCase()}` : "Paused a craving");
    if (cart.length) clearCart();
    navigate({ to: "/continue" });
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden grain flex flex-col">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(120% 55% at 50% 0%, oklch(0.79 0.105 82 / 0.12), transparent 60%)" }} />

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

        {step === "decide" && (
          <div className="flex-1 flex flex-col justify-center px-7 animate-rise">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80">{feeling}</p>
            <h1 className="font-display text-[34px] leading-[1.08] mt-3 text-balance">
              Do you want to spend <span className="text-shimmer-gold">{formatINR(amount)}</span> on this?
            </h1>
            <p className="mt-4 text-[14px] text-foreground/55">
              Both answers are okay. {activeDream ? `Skipping it moves ${formatINR(amount)} to ${activeDream.name}.` : ""}
            </p>
            <div className="mt-8 space-y-3">
              <button onClick={buy} className="w-full rounded-full border border-white/12 bg-white/5 py-4 text-center text-[15px] text-foreground/85">
                Yes — I genuinely want it
              </button>
              <button onClick={notToday} className="w-full rounded-full py-4 text-center font-medium text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
                Not today → build my future
              </button>
            </div>
            <button onClick={() => setStep("feel")} className="mt-6 text-center text-[13px] text-foreground/45">← back</button>
          </div>
        )}

        {step === "choose" && (
          <div className="flex-1 flex flex-col justify-center px-7 animate-rise">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80">where should it go?</p>
            <h1 className="font-display text-[32px] leading-[1.08] mt-3">
              Move <span className="text-shimmer-gold">{formatINR(amount)}</span> toward…
            </h1>
            <div className="mt-6 flex flex-col gap-3">
              {dreams.map((d) => {
                const pct = Math.min(100, Math.round((d.saved / d.target) * 100));
                return (
                  <button key={d.id} onClick={() => doRedirect(d.id)} className="rounded-2xl border border-white/10 bg-surface p-4 text-left hover:border-gold/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[16px]">{d.emoji} {d.name}</span>
                      <span className="text-[13px] text-gold">+{formatINR(amount)}</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))" }} />
                    </div>
                    <p className="mt-1.5 text-[11px] text-foreground/45">{formatINR(d.saved)} / {formatINR(d.target)}</p>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStep("decide")} className="mt-6 text-center text-[13px] text-foreground/45">← back</button>
          </div>
        )}

        {step === "bought" && (
          <div className="flex-1 flex flex-col justify-center px-7 text-center animate-rise">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold/10 ring-1 ring-gold/30 text-[32px]">🎉</div>
            <h1 className="font-display text-[34px] leading-tight mt-6">Enjoy it.</h1>
            <p className="mt-4 text-[15px] text-foreground/60 max-w-[30ch] mx-auto">
              You chose this on purpose — that's the whole point. No guilt here.
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
