import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import sushi from "@/assets/food-sushi.jpg";
import burger from "@/assets/food-burger.jpg";
import grocery from "@/assets/food-grocery.jpg";
import { formatINR, useStore } from "@/lib/store";

export const Route = createFileRoute("/order")({
  head: () => ({
    meta: [
      { title: "A moment to choose — Project Future" },
      {
        name: "description",
        content:
          "Before you order, pause. Every craving you skip brings your future closer.",
      },
    ],
  }),
  component: OrderScreen,
});

type App = {
  id: string;
  name: string;
  tag: string;
  img: string;
  avg: number;
  eta: string;
  accent: string;
};

const APPS: App[] = [
  { id: "sushi", name: "Zomato", tag: "Japanese · Sushi & ramen near you", img: sushi, avg: 820, eta: "32 min", accent: "#E23744" },
  { id: "burger", name: "Swiggy", tag: "Comfort · Burgers, biryani, late nights", img: burger, avg: 540, eta: "28 min", accent: "#FC8019" },
  { id: "grocery", name: "Blinkit", tag: "Groceries · in 10 minutes", img: grocery, avg: 310, eta: "10 min", accent: "#F8CB45" },
];

function OrderScreen() {
  const { hydrated, activeDream, events, totalSaved, currentStreak } = useStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(820);

  function resist() {
    navigate({ to: "/pause", search: { amt: amount, from: "quick" } });
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(120% 60% at 50% 0%, oklch(0.79 0.105 82 / 0.08), transparent 60%)" }}
        />
        <StatusBar />
        <NavBar />

        <main className="px-6 pb-40 pt-2">
          <Intro />

          {!activeDream && hydrated && (
            <Link
              to="/future"
              className="mt-2 block rounded-[22px] border border-gold/25 bg-surface p-5 text-center"
            >
              <p className="font-display text-[18px]">Set a dream first</p>
              <p className="mt-1 text-[13px] text-foreground/55">
                You need something to save toward. Tap to add one.
              </p>
            </Link>
          )}

          <section className="mt-7">
            <div className="flex items-end justify-between mb-5 px-1">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  What were you about to order?
                </p>
                <h2 className="font-display text-[22px] mt-1">Pick the craving</h2>
              </div>
            </div>

            <ul className="space-y-4">
              {APPS.map((a, i) => (
                <li key={a.id} className="animate-rise" style={{ animationDelay: `${120 + i * 90}ms` }}>
                  <Link to="/restaurants" className="block">
                    <AppRow app={a} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-9 animate-rise" style={{ animationDelay: "440ms" }}>
            <div className="relative overflow-hidden rounded-[24px] ring-1 ring-white/10 bg-surface-elevated p-6">
              <div
                aria-hidden
                className="absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl"
                style={{ background: "oklch(0.79 0.105 82 / 0.18)" }}
              />
              <p className="text-[11px] uppercase tracking-[0.28em] text-gold">The brave choice</p>
              <h3 className="font-display text-[24px] mt-2 leading-tight text-balance">
                Skip it. Move{" "}
                <span className="text-shimmer-gold">{formatINR(amount)}</span> to{" "}
                {activeDream ? activeDream.name : "your dream"}.
              </h3>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-[13px] text-foreground/55">Amount</span>
                <div className="flex items-center rounded-full bg-white/5 ring-1 ring-white/10 px-2">
                  <span className="px-1 text-foreground/60">₹</span>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value.replace(/[^0-9]/g, ""), 10) || 0))}
                    inputMode="numeric"
                    className="w-20 bg-transparent py-2 text-[15px] outline-none"
                  />
                </div>
              </div>

              <button
                onClick={resist}
                className="mt-5 h-12 w-full rounded-full grid place-items-center text-background font-medium tracking-wide text-[14px]"
                style={{
                  background: "radial-gradient(120% 200% at 20% 0%, #f5e1aa 0%, #D8B36A 55%, #a8853d 120%)",
                  boxShadow: "0 16px 40px -16px rgba(216,179,106,0.55), inset 0 0 0 1px rgba(255,255,255,0.35)",
                }}
              >
                Move to my future
              </button>

              <p className="mt-5 text-center text-[11px] tracking-[0.2em] uppercase text-muted-foreground/70">
                {hydrated
                  ? `${currentStreak} day streak · ${events.length} skipped · ${formatINR(totalSaved)} saved`
                  : "—"}
              </p>
            </div>
          </section>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

function AppRow({ app }: { app: App }) {
  return (
    <div className="group w-full text-left relative overflow-hidden rounded-[22px] bg-surface ring-1 ring-white/8 hover:ring-white/15 transition">
      <div className="flex items-stretch gap-0">
        <div className="relative h-[124px] w-[124px] shrink-0 overflow-hidden">
          <img src={app.img} alt={app.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(17,19,24,0) 55%, rgba(17,19,24,0.85) 100%)" }} />
        </div>
        <div className="flex-1 px-4 py-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: app.accent }} />
              <p className="font-display text-[19px] leading-none">{app.name}</p>
            </div>
            <p className="mt-1.5 text-[12px] text-muted-foreground leading-snug max-w-[22ch]">{app.tag}</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">{formatINR(app.avg)} avg · {app.eta}</span>
            <span className="h-7 min-w-[64px] px-3 rounded-full grid place-items-center text-[11px] bg-white/5 text-foreground/70">
              Browse →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return null;
}

function NavBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-5">
      <Link to="/" aria-label="Back" className="h-10 w-10 rounded-full bg-surface ring-1 ring-white/10 grid place-items-center text-foreground/80 hover:text-foreground transition">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>
      </Link>
      <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">A Moment</p>
      <span className="h-10 w-10" />
    </div>
  );
}

function Intro() {
  return (
    <header className="pt-9 pb-6 animate-rise">
      <p className="text-[12px] uppercase tracking-[0.28em] text-muted-foreground">Before you order</p>
      <h1 className="font-display text-[36px] leading-[1.08] mt-3 text-balance">
        Pause for a <span className="italic text-shimmer-gold">breath</span>, then choose.
      </h1>
      <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground max-w-[34ch]">
        The craving will pass. The future you're building won't.
      </p>
    </header>
  );
}

function BottomNav() {
  return (
    <nav aria-label="Primary" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-[min(380px,calc(100%-32px))]">
      <div className="rounded-full px-3 py-2.5 flex items-center justify-between ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]" style={{ background: "linear-gradient(180deg, rgba(26,29,36,0.85), rgba(17,19,24,0.85))", backdropFilter: "blur(20px) saturate(140%)" }}>
        <NavLink to="/" label="Today" />
        <NavLink to="/future" label="Future" />
        <CenterAction />
        <NavLink to="/journey" label="Journey" active />
        <NavLink to="/profile" label="Me" />
      </div>
    </nav>
  );
}

function NavLink({ to, label, active = false }: { to: string; label: string; active?: boolean }) {
  return (
    <Link to={to} className={`px-3 py-2 text-[11px] tracking-[0.18em] uppercase transition ${active ? "text-foreground" : "text-muted-foreground/70 hover:text-foreground/80"}`}>
      <span className="relative">
        {label}
        {active && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-gold" />}
      </span>
    </Link>
  );
}

function CenterAction() {
  return (
    <div className="h-12 w-12 rounded-full grid place-items-center text-background" style={{ background: "radial-gradient(circle at 30% 30%, #f5e1aa 0%, #D8B36A 55%, #a8853d 100%)", boxShadow: "0 10px 30px -8px rgba(216,179,106,0.5), inset 0 0 0 1px rgba(255,255,255,0.4)" }}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
    </div>
  );
}

function Signal() { return (<svg viewBox="0 0 16 10" className="h-2.5 w-3.5" fill="currentColor"><rect x="0" y="7" width="2" height="3" rx="0.5" /><rect x="4" y="5" width="2" height="5" rx="0.5" /><rect x="8" y="2.5" width="2" height="7.5" rx="0.5" /><rect x="12" y="0" width="2" height="10" rx="0.5" /></svg>); }
function Wifi() { return (<svg viewBox="0 0 16 12" className="h-3 w-3.5" fill="currentColor"><path d="M8 11.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4ZM2.5 5.5a8 8 0 0 1 11 0l-1.4 1.4a6 6 0 0 0-8.2 0L2.5 5.5Zm2.7 2.7a4.2 4.2 0 0 1 5.6 0L9.4 9.6a2.2 2.2 0 0 0-2.8 0L5.2 8.2Z" /></svg>); }
function Battery() { return (<svg viewBox="0 0 26 12" className="h-3 w-6" fill="none"><rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" opacity="0.6" /><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" /><rect x="24" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.6" /></svg>); }
