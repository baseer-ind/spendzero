import { Link } from "react-router-dom";
import sushi from "../assets/food-sushi.jpg";
import burger from "../assets/food-burger.jpg";
import grocery from "../assets/food-grocery.jpg";


type App = {
  id: string;
  name: string;
  tag: string;
  img: string;
  avg: string;
  eta: string;
  accent: string;
};

const APPS: App[] = [
  {
    id: "sushi",
    name: "Zomato",
    tag: "Japanese · Sushi & ramen near you",
    img: sushi,
    avg: "₹820",
    eta: "32 min",
    accent: "#E23744",
  },
  {
    id: "burger",
    name: "Swiggy",
    tag: "Comfort · Burgers, biryani, late nights",
    img: burger,
    avg: "₹540",
    eta: "28 min",
    accent: "#FC8019",
  },
  {
    id: "grocery",
    name: "Blinkit",
    tag: "Groceries · in 10 minutes",
    img: grocery,
    avg: "₹310",
    eta: "10 min",
    accent: "#F8CB45",
  },
];

function OrderScreen() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(120% 60% at 50% 0%, oklch(0.79 0.105 82 / 0.08), transparent 60%)",
          }}
        />

        <StatusBar />
        <NavBar />

        <main className="px-6 pb-40 pt-2">
          <Intro />
          <PauseCard />
          <AppList />
          <SkipCraving />
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

/* ───────────── Components ───────────── */

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-7 pt-4 text-[12px] tracking-wide text-foreground/80">
      <span className="font-medium">9:41</span>
      <div className="flex items-center gap-1.5 opacity-80">
        <Signal /> <Wifi /> <Battery />
      </div>
    </div>
  );
}

function NavBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-5">
      <Link
        to="/"
        aria-label="Back"
        className="h-10 w-10 rounded-full bg-surface ring-1 ring-white/10 grid place-items-center text-foreground/80 hover:text-foreground transition"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 6-6 6 6 6" />
        </svg>
      </Link>
      <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        A Moment
      </p>
      <button
        aria-label="More"
        className="h-10 w-10 rounded-full bg-surface ring-1 ring-white/10 grid place-items-center text-foreground/80"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
    </div>
  );
}

function Intro() {
  return (
    <header className="pt-9 pb-6 animate-rise">
      <p className="text-[12px] uppercase tracking-[0.28em] text-muted-foreground">
        Before you order
      </p>
      <h1 className="font-display text-[36px] leading-[1.08] mt-3 text-balance">
        Pause for a <span className="italic text-shimmer-gold">breath</span>,
        then choose.
      </h1>
      <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground max-w-[34ch]">
        The craving will pass. The future you're building won't.
      </p>
    </header>
  );
}

function PauseCard() {
  return (
    <section
      className="relative overflow-hidden rounded-[24px] ring-1 ring-gold/20 p-5 animate-rise"
      style={{
        animationDelay: "120ms",
        background:
          "linear-gradient(140deg, oklch(0.235 0.012 80 / 0.7) 0%, oklch(0.20 0.01 260 / 0.6) 100%)",
      }}
    >
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 grid place-items-center">
          <span className="absolute inset-0 rounded-full bg-gold/15 animate-ping [animation-duration:2.4s]" />
          <span className="relative h-12 w-12 rounded-full grid place-items-center ring-1 ring-gold/40 bg-gold/10">
            <span className="font-display text-gold text-[18px]">✦</span>
          </span>
        </div>
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
            Trade-off
          </p>
          <p className="mt-1.5 text-[14.5px] leading-relaxed">
            One order today ≈{" "}
            <span className="font-display text-gold-soft">2 days</span> closer
            to Kyoto.
          </p>
        </div>
      </div>
    </section>
  );
}

function AppList() {
  return (
    <section className="mt-9">
      <div className="flex items-end justify-between mb-5 px-1">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            If you choose to order
          </p>
          <h2 className="font-display text-[22px] mt-1">Where from</h2>
        </div>
        <p className="text-[11px] text-muted-foreground tracking-wide">
          3 apps
        </p>
      </div>

      <ul className="space-y-4">
        {APPS.map((a, i) => (
          <li
            key={a.id}
            className="animate-rise"
            style={{ animationDelay: `${200 + i * 110}ms` }}
          >
            <AppRow app={a} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function AppRow({ app }: { app: App }) {
  return (
    <button className="group w-full text-left relative overflow-hidden rounded-[22px] bg-surface ring-1 ring-white/8 hover:ring-white/15 transition">
      <div className="flex items-stretch gap-0">
        {/* Image */}
        <div className="relative h-[124px] w-[124px] shrink-0 overflow-hidden">
          <img
            src={app.img}
            alt={app.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(17,19,24,0) 55%, rgba(17,19,24,0.85) 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: app.accent }}
              />
              <p className="font-display text-[19px] leading-none">
                {app.name}
              </p>
            </div>
            <p className="mt-1.5 text-[12px] text-muted-foreground leading-snug max-w-[22ch]">
              {app.tag}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Dot /> {app.avg} avg
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock /> {app.eta}
              </span>
            </div>
            <span className="h-7 w-7 rounded-full bg-white/5 grid place-items-center text-foreground/70 group-hover:text-gold group-hover:bg-gold/10 transition">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function SkipCraving() {
  return (
    <section
      className="mt-10 animate-rise"
      style={{ animationDelay: "560ms" }}
    >
      <div className="relative overflow-hidden rounded-[24px] ring-1 ring-white/10 bg-surface-elevated p-6">
        <div
          aria-hidden
          className="absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl"
          style={{ background: "oklch(0.79 0.105 82 / 0.18)" }}
        />
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
          Or — the brave choice
        </p>
        <h3 className="font-display text-[24px] mt-2 leading-tight text-balance">
          Skip this craving. <br />
          Move ₹820 to Kyoto.
        </h3>
        <p className="mt-3 text-[13px] text-muted-foreground max-w-[34ch]">
          Sakura blooms in 127 days. Your future self is keeping count.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <Link
            to="/"
            className="flex-1 h-12 rounded-full grid place-items-center text-background font-medium tracking-wide text-[13.5px]"
            style={{
              background:
                "radial-gradient(120% 200% at 20% 0%, #f5e1aa 0%, #D8B36A 55%, #a8853d 120%)",
              boxShadow:
                "0 16px 40px -16px rgba(216,179,106,0.55), inset 0 0 0 1px rgba(255,255,255,0.35)",
            }}
          >
            Move to my future
          </Link>
          <button
            aria-label="Snooze the craving"
            className="h-12 w-12 rounded-full bg-white/5 ring-1 ring-white/10 grid place-items-center text-foreground/80"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2.5 2.5M9 3h6" />
            </svg>
          </button>
        </div>

        <p className="mt-5 text-center text-[11px] tracking-[0.2em] uppercase text-muted-foreground/70">
          7 days · 9 cravings skipped · ₹4,820 saved
        </p>
      </div>
    </section>
  );
}

/* ───── Shared chrome ───── */

function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-[min(380px,calc(100%-32px))]"
    >
      <div
        className="rounded-full px-3 py-2.5 flex items-center justify-between ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(26,29,36,0.85), rgba(17,19,24,0.85))",
          backdropFilter: "blur(20px) saturate(140%)",
        }}
      >
        <NavItem label="Today" />
        <NavItem label="Future" />
        <CenterAction />
        <NavItem label="Journey" active />
        <NavItem label="Me" />
      </div>
    </nav>
  );
}

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      className={`px-3 py-2 text-[11px] tracking-[0.18em] uppercase transition ${
        active ? "text-foreground" : "text-muted-foreground/70 hover:text-foreground/80"
      }`}
    >
      <span className="relative">
        {label}
        {active && (
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-gold" />
        )}
      </span>
    </button>
  );
}

function CenterAction() {
  return (
    <button
      aria-label="Add intention"
      className="h-12 w-12 rounded-full grid place-items-center text-background"
      style={{
        background:
          "radial-gradient(circle at 30% 30%, #f5e1aa 0%, #D8B36A 55%, #a8853d 100%)",
        boxShadow:
          "0 10px 30px -8px rgba(216,179,106,0.5), inset 0 0 0 1px rgba(255,255,255,0.4)",
      }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  );
}

/* tiny icons */
function Dot() {
  return <span className="inline-block h-1 w-1 rounded-full bg-foreground/40" />;
}
function Clock() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function Signal() {
  return (
    <svg viewBox="0 0 16 10" className="h-2.5 w-3.5" fill="currentColor">
      <rect x="0" y="7" width="2" height="3" rx="0.5" />
      <rect x="4" y="5" width="2" height="5" rx="0.5" />
      <rect x="8" y="2.5" width="2" height="7.5" rx="0.5" />
      <rect x="12" y="0" width="2" height="10" rx="0.5" />
    </svg>
  );
}
function Wifi() {
  return (
    <svg viewBox="0 0 16 12" className="h-3 w-3.5" fill="currentColor">
      <path d="M8 11.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4ZM2.5 5.5a8 8 0 0 1 11 0l-1.4 1.4a6 6 0 0 0-8.2 0L2.5 5.5Zm2.7 2.7a4.2 4.2 0 0 1 5.6 0L9.4 9.6a2.2 2.2 0 0 0-2.8 0L5.2 8.2Z" />
    </svg>
  );
}
function Battery() {
  return (
    <svg viewBox="0 0 26 12" className="h-3 w-6" fill="none">
      <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" opacity="0.6" />
      <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" />
      <rect x="24" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export default OrderScreen;
