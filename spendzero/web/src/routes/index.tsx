import { Link } from "react-router-dom";
import kyotoHero from "../assets/kyoto-hero.jpg";
import dreamHome from "../assets/dream-home.jpg";
import dreamMacbook from "../assets/dream-macbook.jpg";
import { useHomeData } from "../lib/useHomeData";
import { goalProgress, type SavingsGoal } from "../lib/models";
import { formatPaise } from "../lib/money";

function Home() {
  const { goals, stats } = useHomeData();

  const topDream = goals.find((g) => !g.archived && goalProgress(g) < 1) ?? goals[0];
  const percent = topDream ? Math.round(goalProgress(topDream) * 100) : 72;
  const remainingPaise = topDream ? topDream.targetPaise - topDream.savedPaise : 2850000;
  const otherDreams = goals.filter((g) => g.id !== topDream?.id && !g.archived);

  const totalSaved = stats?.totalAmountNotSpentPaise ?? 0;
  const streak = stats?.currentStreakDays ?? 7;

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      {/* Mobile frame */}
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden">
        {/* ambient gradient wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(120% 60% at 50% 0%, oklch(0.79 0.105 82 / 0.10), transparent 60%), radial-gradient(80% 40% at 20% 100%, oklch(0.72 0.14 248 / 0.08), transparent 70%)",
          }}
        />

        <StatusBar />
        <TopBar />

        <main className="px-6 pb-36 pt-2">
          <Greeting />
          <HeroDream title={topDream?.title} percent={percent} remainingPaise={remainingPaise} />
          <IntentionalNudge />
          <CollectionRow otherDreams={otherDreams} />
          <MomentumStrip totalSaved={totalSaved} streak={streak} />
          <Whisper />
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

/* ───────────────────────── Components ───────────────────────── */

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-7 pt-4 text-[12px] tracking-wide text-foreground/80">
      <span className="font-medium">9:41</span>
      <div className="flex items-center gap-1.5 opacity-80">
        <Signal />
        <Wifi />
        <Battery />
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-5">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-full bg-surface-elevated grid place-items-center ring-1 ring-white/10">
          <span className="font-display text-[15px] text-gold">f</span>
        </div>
        <div className="leading-tight">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Project Future
          </p>
          <p className="text-[13px] text-foreground/90">Tuesday, June 30</p>
        </div>
      </div>
      <Link
        to="/profile"
        aria-label="Profile"
        className="h-10 w-10 rounded-full bg-surface-elevated ring-1 ring-white/10 grid place-items-center text-foreground/80 hover:text-foreground transition"
      >
        <span className="font-display text-sm">A</span>
      </Link>
    </div>
  );
}

function Greeting() {
  return (
    <header className="pt-10 pb-7 animate-rise">
      <p className="text-[12px] uppercase tracking-[0.28em] text-muted-foreground">
        Good evening, Aarav
      </p>
      <h1 className="font-display text-[40px] leading-[1.05] mt-3 text-balance">
        The future you're <br />
        <span className="italic text-shimmer-gold">building</span> is closer
        today.
      </h1>
    </header>
  );
}

function HeroDream({
  title,
  percent,
  remainingPaise,
}: {
  title?: string;
  percent: number;
  remainingPaise: number;
}) {
  return (
    <Link
      to="/future"
      // TODO: no dedicated dream-detail route exists yet (mirrors mobile-rn's
      // same TODO) — navigates to /future as the closest reasonable
      // destination until a per-dream detail screen is built.
      className="block relative overflow-hidden rounded-[28px] ring-1 ring-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] animate-rise grain"
      style={{ animationDelay: "120ms" }}
    >
      <div className="relative h-[520px] w-full">
        <img
          src={kyotoHero}
          alt="Kyoto alley at dusk with lanterns and cherry blossoms"
          width={1024}
          height={1536}
          className="absolute inset-0 h-full w-full object-cover scale-110 will-change-transform"
        />
        {/* gradient stack */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,11,14,0.15) 0%, rgba(10,11,14,0.25) 35%, rgba(10,11,14,0.85) 78%, rgba(10,11,14,0.98) 100%)",
          }}
        />
        {/* falling petals */}
        <Petals />

        {/* top meta */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/30 backdrop-blur-md px-3 py-1.5 ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="text-[10.5px] tracking-[0.22em] uppercase text-white/85">
              Active Dream · 01 / 04
            </span>
          </div>
          <span
            aria-hidden
            className="h-9 w-9 rounded-full bg-black/30 backdrop-blur-md ring-1 ring-white/15 grid place-items-center text-white/90"
          >
            <Arrow />
          </span>
        </div>

        {/* bottom content */}
        <div className="absolute inset-x-0 bottom-0 p-6 pt-12">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/90">
            Kyoto, Japan
          </p>
          <h2 className="font-display text-[34px] leading-[1.05] mt-2 text-white">
            {title ?? "My Japan Trip"}
          </h2>
          <p className="mt-3 text-[13.5px] text-white/70 max-w-[28ch]">
            Sakura season opens in 127 days. Every intentional choice brings it
            closer.
          </p>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">
                Distance to Tokyo
              </p>
              <p className="font-display text-[28px] mt-1 text-white">
                {formatPaise(remainingPaise)} <span className="text-white/45 text-[16px]">away</span>
              </p>
            </div>
            <ProgressRing percent={percent} />
          </div>

          {/* milestone bar */}
          <div className="mt-6">
            <div className="h-[3px] w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(0, Math.min(100, percent))}%`,
                  background:
                    "linear-gradient(90deg, var(--color-gold) 0%, #f3dfa6 100%)",
                }}
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-white/55">
              <span>Visa</span>
              <span>Flights</span>
              <span className="text-gold">Stays</span>
              <span>Sakura</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Petals() {
  const petals = Array.from({ length: 9 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((_, i) => {
        const left = (i * 11 + 7) % 100;
        const delay = (i * 1.3) % 14;
        const dur = 12 + ((i * 7) % 8);
        const size = 6 + ((i * 3) % 5);
        return (
          <span
            key={i}
            className="absolute animate-petal rounded-full"
            style={{
              left: `${left}%`,
              top: "-10%",
              width: size,
              height: size,
              background:
                "radial-gradient(circle at 30% 30%, #ffd2e0, #e89bb4 70%, transparent 71%)",
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
              filter: "blur(0.4px)",
              opacity: 0.7,
            }}
          />
        );
      })}
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const off = c - (percent / 100) * c;
  return (
    <div className="relative h-[72px] w-[72px]">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="4"
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="url(#g)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          className="animate-ring"
        />
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f3dfa6" />
            <stop offset="100%" stopColor="#D8B36A" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-[15px] text-white">{percent}%</span>
      </div>
    </div>
  );
}

function IntentionalNudge() {
  return (
    <section
      className="mt-7 rounded-[22px] bg-surface ring-1 ring-white/8 p-5 animate-rise"
      style={{ animationDelay: "240ms" }}
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5 h-10 w-10 rounded-full grid place-items-center ring-1 ring-gold/30 bg-gold/8">
          <span className="text-gold font-display text-[16px]">✦</span>
        </div>
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold">
            Today's intention
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/90 text-balance">
            You felt a craving for sushi at 8:14 PM.
            <span className="text-foreground/55">
              {" "}
              You chose Kyoto instead. <span className="text-gold">+₹420</span>{" "}
              toward sakura.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

function CollectionRow({ otherDreams }: { otherDreams: SavingsGoal[] }) {
  const hasRealData = otherDreams.length > 0;
  return (
    <section className="mt-10 animate-rise" style={{ animationDelay: "340ms" }}>
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Your collection
          </p>
          <h3 className="font-display text-[22px] mt-1">Other futures</h3>
        </div>
        <Link to="/future" className="text-[12px] text-gold/90 tracking-wide">
          View all
        </Link>
      </div>

      <div className="-mx-6 px-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 pr-2">
          {hasRealData ? (
            otherDreams.map((d) => (
              <DreamCard
                key={d.id}
                img={d.imageSeed === "dream-macbook" ? dreamMacbook : dreamHome}
                tag={d.category}
                title={d.title}
                amount={formatPaise(d.targetPaise - d.savedPaise)}
                percent={Math.round(goalProgress(d) * 100)}
              />
            ))
          ) : (
            <>
              <DreamCard img={dreamHome} tag="Mumbai · 2029" title="My Dream Home" amount="₹18.4L" percent={31} />
              <DreamCard img={dreamMacbook} tag="Studio · This year" title="The MacBook" amount="₹1.2L" percent={64} />
            </>
          )}
          <AddDreamCard />
        </div>
      </div>
    </section>
  );
}

function DreamCard({
  img,
  tag,
  title,
  amount,
  percent,
}: {
  img: string;
  tag: string;
  title: string;
  amount: string;
  percent: number;
}) {
  return (
    <article className="relative w-[230px] h-[300px] shrink-0 rounded-[22px] overflow-hidden ring-1 ring-white/10">
      <img
        src={img}
        alt={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,11,14,0.05) 0%, rgba(10,11,14,0.55) 60%, rgba(10,11,14,0.95) 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/60">
          {tag}
        </p>
        <h4 className="font-display text-[20px] mt-1 text-white">{title}</h4>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[12px] text-white/70">{amount} to go</span>
          <span className="text-[11px] text-gold">{percent}%</span>
        </div>
        <div className="mt-2 h-[2px] rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${percent}%`,
              background:
                "linear-gradient(90deg, var(--color-gold) 0%, #f3dfa6 100%)",
            }}
          />
        </div>
      </div>
    </article>
  );
}

function AddDreamCard() {
  return (
    <button className="w-[160px] h-[300px] shrink-0 rounded-[22px] border border-dashed border-white/15 grid place-items-center text-foreground/55 hover:text-gold hover:border-gold/40 transition">
      <div className="flex flex-col items-center gap-3">
        <span className="h-10 w-10 rounded-full ring-1 ring-current grid place-items-center font-display text-xl">
          +
        </span>
        <span className="text-[12px] tracking-[0.18em] uppercase">
          New future
        </span>
      </div>
    </button>
  );
}

function MomentumStrip({ totalSaved, streak }: { totalSaved: number; streak: number }) {
  return (
    <section
      className="mt-10 rounded-[22px] bg-surface-elevated/70 ring-1 ring-white/8 p-5 animate-rise"
      style={{ animationDelay: "440ms" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            This week
          </p>
          <p className="font-display text-[22px] mt-1">
            {streak} intentional days{" "}
            <span className="text-foreground/40 text-[14px] tracking-normal">
              in a row
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-[22px] text-shimmer-gold">
            +{formatPaise(totalSaved || 482000)}
          </p>
          <p className="text-[11px] text-muted-foreground tracking-wide">
            toward dreams
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-end gap-2 h-12">
        {[34, 52, 28, 70, 44, 88, 62].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              background:
                i === 5
                  ? "linear-gradient(180deg, var(--color-gold) 0%, #b8923f 100%)"
                  : "linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0.08))",
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
    </section>
  );
}

function Whisper() {
  return (
    <p
      className="mt-10 text-center font-display italic text-[15px] text-muted-foreground/80 animate-rise"
      style={{ animationDelay: "560ms" }}
    >
      "One more intentional day."
    </p>
  );
}

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
        <NavItem to="/" label="Today" active />
        <NavItem to="/future" label="Future" />
        <CenterAction />
        <NavItem to="/journey" label="Journey" />
        <NavItem to="/profile" label="Me" />
      </div>
    </nav>
  );
}

function NavItem({ to, label, active = false }: { to: string; label: string; active?: boolean }) {
  return (
    <Link
      to={to}
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
    </Link>
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

/* tiny iconography */
function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M9 7h8v8" />
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

export default Home;
