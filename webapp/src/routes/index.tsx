import { createFileRoute, Link } from "@tanstack/react-router";
import kyotoHero from "@/assets/kyoto-hero.jpg";
import dreamHome from "@/assets/dream-home.jpg";
import dreamMacbook from "@/assets/dream-macbook.jpg";
import foodSushi from "@/assets/food-sushi.jpg";
import { formatINR, useStore, type Dream } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project Future — Build the life you're dreaming of" },
      { name: "description", content: "Every craving skipped builds a better future. Intentional living, beautifully designed." },
    ],
  }),
  component: Home,
});

const DREAM_IMAGES = [kyotoHero, dreamHome, dreamMacbook, foodSushi];

function Home() {
  const { hydrated, name, dreams, activeDream, totalSaved, currentStreak } = useStore();
  const greetingName = name || "there";

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden grain">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(120% 60% at 50% 0%, oklch(0.79 0.105 82 / 0.10), transparent 60%), radial-gradient(80% 40% at 20% 100%, oklch(0.72 0.14 248 / 0.08), transparent 70%)" }}
        />

        <StatusBar />
        <TopBar />

        <main className="px-6 pb-36 pt-2">
          <Greeting name={greetingName} />
          {hydrated && activeDream ? <HeroDream dream={activeDream} /> : <HeroEmpty show={hydrated} />}
          <CollectionRow dreams={dreams} activeId={activeDream?.id ?? null} />
          <MomentumStrip totalSaved={totalSaved} streak={currentStreak} show={hydrated} />
          <Whisper />
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

function Greeting({ name }: { name: string }) {
  return (
    <header className="pt-10 pb-7 animate-rise">
      <p className="text-[12px] uppercase tracking-[0.28em] text-muted-foreground">Good evening, {name}</p>
      <h1 className="font-display text-[40px] leading-[1.05] mt-3 text-balance">
        The future you're <br />
        <span className="italic text-shimmer-gold">building</span> is closer today.
      </h1>
    </header>
  );
}

function HeroDream({ dream }: { dream: Dream }) {
  const pct = Math.min(100, Math.round((dream.saved / dream.target) * 100));
  const toGo = Math.max(0, dream.target - dream.saved);
  return (
    <Link
      to="/future"
      className="relative block overflow-hidden rounded-[28px] ring-1 ring-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] animate-rise grain"
      style={{ animationDelay: "120ms" }}
    >
      <div className="relative h-[460px] w-full">
        <img src={kyotoHero} alt={dream.name} className="absolute inset-0 h-full w-full object-cover scale-110" />
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,11,14,0.15) 0%, rgba(10,11,14,0.25) 35%, rgba(10,11,14,0.85) 78%, rgba(10,11,14,0.98) 100%)" }} />
        <Petals />

        <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/30 backdrop-blur-md px-3 py-1.5 ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="text-[10.5px] tracking-[0.22em] uppercase text-white/85">Active Dream</span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 pt-12">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/90">{dream.emoji} your dream</p>
          <h2 className="font-display text-[34px] leading-[1.05] mt-2 text-white">{dream.name}</h2>
          <p className="mt-3 text-[13.5px] text-white/70 max-w-[28ch]">
            Every intentional choice brings it closer.
          </p>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">Still to go</p>
              <p className="font-display text-[28px] mt-1 text-white">
                {formatINR(toGo)} <span className="text-white/45 text-[16px]">left</span>
              </p>
            </div>
            <ProgressRing percent={pct} />
          </div>

          <div className="mt-6">
            <div className="h-[3px] w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--color-gold) 0%, #f3dfa6 100%)" }} />
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-white/55">
              <span>{formatINR(dream.saved)} saved</span>
              <span className="text-gold">{formatINR(dream.target)} goal</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function HeroEmpty({ show }: { show: boolean }) {
  return (
    <Link
      to="/future"
      className="relative block overflow-hidden rounded-[28px] ring-1 ring-white/10 animate-rise"
      style={{ animationDelay: "120ms" }}
    >
      <div className="relative h-[300px] w-full grid place-items-center text-center" style={{ background: "radial-gradient(120% 80% at 50% 0%, oklch(0.235 0.01 260), oklch(0.16 0.008 260))" }}>
        <Petals />
        <div className="relative px-8">
          <div className="mx-auto mb-5 h-14 w-14 rounded-full grid place-items-center ring-1 ring-gold/40 bg-gold/10 text-gold font-display text-[22px]">+</div>
          <h2 className="font-display text-[28px] text-white">Set your first dream</h2>
          <p className="mt-2 text-[13.5px] text-white/60 max-w-[30ch] mx-auto">
            {show ? "Pick something you're saving for. Every craving you skip moves you toward it." : " "}
          </p>
          <span className="mt-6 inline-block rounded-full px-6 py-3 text-background font-medium" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
            Add a dream
          </span>
        </div>
      </div>
    </Link>
  );
}

function CollectionRow({ dreams, activeId }: { dreams: Dream[]; activeId: string | null }) {
  const others = dreams.filter((d) => d.id !== activeId);
  return (
    <section className="mt-10 animate-rise" style={{ animationDelay: "340ms" }}>
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Your collection</p>
          <h3 className="font-display text-[22px] mt-1">Other futures</h3>
        </div>
        <Link to="/future" className="text-[12px] text-gold/90 tracking-wide">View all</Link>
      </div>

      <div className="-mx-6 px-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 pr-2">
          {others.map((d, i) => {
            const pct = Math.min(100, Math.round((d.saved / d.target) * 100));
            return (
              <Link key={d.id} to="/future" className="relative w-[200px] h-[260px] shrink-0 rounded-[22px] overflow-hidden ring-1 ring-white/10">
                <img src={DREAM_IMAGES[(i + 1) % DREAM_IMAGES.length]} alt={d.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,11,14,0.05) 0%, rgba(10,11,14,0.55) 60%, rgba(10,11,14,0.95) 100%)" }} />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h4 className="font-display text-[20px] mt-1 text-white">{d.emoji} {d.name}</h4>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[12px] text-white/70">{formatINR(Math.max(0, d.target - d.saved))} to go</span>
                    <span className="text-[11px] text-gold">{pct}%</span>
                  </div>
                  <div className="mt-2 h-[2px] rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--color-gold) 0%, #f3dfa6 100%)" }} />
                  </div>
                </div>
              </Link>
            );
          })}
          <Link to="/future" className="w-[150px] h-[260px] shrink-0 rounded-[22px] border border-dashed border-white/15 grid place-items-center text-foreground/55 hover:text-gold hover:border-gold/40 transition">
            <div className="flex flex-col items-center gap-3">
              <span className="h-10 w-10 rounded-full ring-1 ring-current grid place-items-center font-display text-xl">+</span>
              <span className="text-[12px] tracking-[0.18em] uppercase">New future</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

function MomentumStrip({ totalSaved, streak, show }: { totalSaved: number; streak: number; show: boolean }) {
  return (
    <section className="mt-10 rounded-[22px] bg-surface-elevated/70 ring-1 ring-white/8 p-5 animate-rise" style={{ animationDelay: "440ms" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Your momentum</p>
          <p className="font-display text-[22px] mt-1">
            {show ? streak : 0} intentional {streak === 1 ? "day" : "days"}{" "}
            <span className="text-foreground/40 text-[14px] tracking-normal">in a row</span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-[22px] text-shimmer-gold">{formatINR(totalSaved)}</p>
          <p className="text-[11px] text-muted-foreground tracking-wide">toward dreams</p>
        </div>
      </div>
    </section>
  );
}

function Whisper() {
  return (
    <p className="mt-10 text-center font-display italic text-[15px] text-muted-foreground/80 animate-rise" style={{ animationDelay: "560ms" }}>
      "One more intentional day."
    </p>
  );
}

function StatusBar() {
  return null;
}

function TopBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-5">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-full bg-surface-elevated grid place-items-center ring-1 ring-white/10">
          <span className="font-display text-[15px] text-gold">✦</span>
        </div>
        <div className="leading-tight">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Project Future</p>
          <p className="text-[13px] text-foreground/90">Every craving. Zero spending.</p>
        </div>
      </div>
      <Link to="/profile" aria-label="Profile" className="h-10 w-10 rounded-full bg-surface-elevated ring-1 ring-white/10 grid place-items-center text-foreground/80">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="3.4" stroke="currentColor" strokeWidth="1.5" /><path d="M4.5 20c1.6-3.6 4.6-5.5 7.5-5.5s5.9 1.9 7.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </Link>
    </div>
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
          <span key={i} className="absolute animate-petal rounded-full" style={{ left: `${left}%`, top: "-10%", width: size, height: size, background: "radial-gradient(circle at 30% 30%, #ffd2e0, #e89bb4 70%, transparent 71%)", animationDelay: `${delay}s`, animationDuration: `${dur}s`, filter: "blur(0.4px)", opacity: 0.7 }} />
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
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
        <circle cx="36" cy="36" r={r} fill="none" stroke="url(#g)" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} className="animate-ring" />
        <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="#f3dfa6" /><stop offset="100%" stopColor="#D8B36A" /></linearGradient></defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center"><span className="font-display text-[15px] text-white">{percent}%</span></div>
    </div>
  );
}

function BottomNav() {
  return (
    <nav aria-label="Primary" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-[min(380px,calc(100%-32px))]">
      <div className="rounded-full px-3 py-2.5 flex items-center justify-between ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]" style={{ background: "linear-gradient(180deg, rgba(26,29,36,0.85), rgba(17,19,24,0.85))", backdropFilter: "blur(20px) saturate(140%)" }}>
        <NavLink to="/" label="Today" active />
        <NavLink to="/future" label="Future" />
        <Link to="/order" aria-label="Pause a craving" className="-mt-7 grid h-12 w-12 place-items-center rounded-full text-background" style={{ background: "radial-gradient(circle at 30% 30%, #f5e1aa 0%, #D8B36A 55%, #a8853d 100%)", boxShadow: "0 10px 30px -8px rgba(216,179,106,0.5), inset 0 0 0 1px rgba(255,255,255,0.4)" }}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </Link>
        <NavLink to="/journey" label="Journey" />
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

function Signal() { return (<svg viewBox="0 0 16 10" className="h-2.5 w-3.5" fill="currentColor"><rect x="0" y="7" width="2" height="3" rx="0.5" /><rect x="4" y="5" width="2" height="5" rx="0.5" /><rect x="8" y="2.5" width="2" height="7.5" rx="0.5" /><rect x="12" y="0" width="2" height="10" rx="0.5" /></svg>); }
function Wifi() { return (<svg viewBox="0 0 16 12" className="h-3 w-3.5" fill="currentColor"><path d="M8 11.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4ZM2.5 5.5a8 8 0 0 1 11 0l-1.4 1.4a6 6 0 0 0-8.2 0L2.5 5.5Zm2.7 2.7a4.2 4.2 0 0 1 5.6 0L9.4 9.6a2.2 2.2 0 0 0-2.8 0L5.2 8.2Z" /></svg>); }
function Battery() { return (<svg viewBox="0 0 26 12" className="h-3 w-6" fill="none"><rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" opacity="0.6" /><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" /><rect x="24" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.6" /></svg>); }
