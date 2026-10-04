import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/Shell";
import { formatINR, useStore, type Dream } from "@/lib/store";

export const Route = createFileRoute("/pause")({
  validateSearch: (s: Record<string, unknown>) => ({
    amt: Number(s.amt) || 0,
    from: typeof s.from === "string" ? s.from : "",
    cat: typeof s.cat === "string" ? s.cat : "Food",
  }),
  head: () => ({ meta: [{ title: "Your choice — SELFly" }] }),
  component: PauseScreen,
});

function pct(saved: number, target: number) {
  return Math.min(100, Math.round((saved / target) * 100));
}

/**
 * The decision moment — NOT a waiting room. The intervention is the choice
 * itself: amount + two directions. Choosing triggers a short, beautiful
 * micro-transition (~1.3s) and then auto-continues. No "Continue" button, no
 * separate pause/reward pages, no guilt, no countdown.
 */
function PauseScreen() {
  const { amt, cat } = Route.useSearch();
  const navigate = useNavigate();
  const {
    cart, cartTotal, clearCart, applySaving, activeDream,
    recordDecision, dreams, setActiveDream, imageFor,
  } = useStore();

  const amount = amt || cartTotal || 0;
  const [phase, setPhase] = useState<"decide" | "moving" | "enjoyed">("decide");
  const [targetId, setTargetId] = useState<string>(activeDream?.id ?? dreams[0]?.id ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

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

  const target = dreams.find((d) => d.id === targetId) ?? activeDream ?? dreams[0] ?? null;

  function enjoy() {
    recordDecision({ category: cat, amount, trigger: "unspecified", choice: "enjoyed" });
    if (cart.length) clearCart();
    setPhase("enjoyed");
    timer.current = setTimeout(() => navigate({ to: "/" }), 1300);
  }

  function build() {
    if (!target) { navigate({ to: "/future" }); return; }
    setActiveDream(target.id);
    recordDecision({ category: cat, amount, trigger: "unspecified", choice: "redirected", dreamId: target.id });
    applySaving(amount, "Chose the future", cat);
    if (cart.length) clearCart();
    setPhase("moving");
    timer.current = setTimeout(() => navigate({ to: "/" }), 1600);
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden flex flex-col">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0" style={{ background: "radial-gradient(120% 55% at 50% 0%, oklch(0.79 0.105 82 / 0.14), transparent 60%)" }} />

        {/* DECIDE — amount + two directions. Simple, calm, fast. */}
        {phase === "decide" && (
          <div className="relative z-10 flex-1 flex flex-col justify-center px-7 pb-8 animate-rise">
            <p className="text-[11px] uppercase tracking-[0.32em] text-gold/80 text-center">your choice</p>
            <div className="mt-5 text-center">
              <p className="font-display text-[68px] leading-none">{formatINR(amount)}</p>
              <p className="mt-2 text-[12px] uppercase tracking-[0.2em] text-foreground/40">on {cat.toLowerCase()}</p>
            </div>

            {/* optional, quiet destination switch (only when >1 dream) */}
            {dreams.length > 1 && (
              <div className="mt-7 flex flex-wrap justify-center gap-2">
                {dreams.slice(0, 4).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setTargetId(d.id)}
                    className={`rounded-full border px-3 py-1.5 text-[12.5px] transition ${d.id === target?.id ? "border-gold/50 bg-gold/15 text-gold" : "border-white/10 bg-white/5 text-foreground/55"}`}
                  >
                    {d.emoji} {d.name}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 space-y-3">
              <button onClick={build} className="w-full rounded-2xl px-5 py-4 text-left text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
                <span className="block font-display text-[19px]">
                  {target ? `Move it to ${target.name}` : "Build my future"}
                </span>
                <span className="mt-0.5 block text-[13px] text-background/75">
                  {target ? `${target.name} gets ${formatINR(amount)} closer.` : "Create a goal to move it toward."}
                </span>
              </button>
              <button onClick={enjoy} className="w-full rounded-2xl border border-white/14 bg-white/5 px-5 py-4 text-left">
                <span className="block font-display text-[19px]">Enjoy it</span>
                <span className="mt-0.5 block text-[13px] text-foreground/50">Keep your order — you chose it consciously.</span>
              </button>
            </div>
          </div>
        )}

        {/* MOVING — the micro-transition (auto-continues) */}
        {phase === "moving" && target && (
          <MovedToFuture amount={amount} dream={target} cover={imageFor(target.cover)} />
        )}

        {/* ENJOYED — a brief, non-judgmental acknowledgement (auto-continues) */}
        {phase === "enjoyed" && (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-7 text-center">
            <div className="animate-rise">
              <p className="font-display text-[34px] leading-tight">Enjoy it.</p>
              <p className="mt-3 text-[15px] text-foreground/60 max-w-[26ch] mx-auto">
                You chose this consciously. That's the whole point.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MovedToFuture({ amount, dream, cover }: { amount: number; dream: Dream; cover?: string }) {
  const before = pct(dream.saved - amount, dream.target);
  const after = pct(dream.saved, dream.target);
  const [grow, setGrow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrow(true), 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
      <p className="text-[12px] uppercase tracking-[0.28em] text-gold/80 animate-rise">moved toward</p>
      <p className="font-display text-[56px] leading-none mt-3 animate-rise">{formatINR(amount)}</p>

      <div className="mt-8 flex flex-col items-center gap-3 animate-rise">
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-white/5 text-[36px] ring-1 ring-gold/25">
          {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : dream.emoji}
        </div>
        <p className="font-display text-[22px]">{dream.name}</p>
      </div>

      <div className="mt-6 w-full max-w-[240px]">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-all duration-[1100ms] ease-out"
            style={{ width: `${grow ? after : before}%`, background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))" }}
          />
        </div>
        <p className="mt-3 text-[13.5px] text-gold">+{formatINR(amount)} closer</p>
      </div>
    </div>
  );
}
