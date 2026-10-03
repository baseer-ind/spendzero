import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav, NavBar, Screen, StatusBar } from "@/components/Shell";
import { CATEGORIES, LESSONS, lessonsForCategory } from "@/lib/learn";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Future Intelligence — SELFly" },
      { name: "description", content: "Understand how everyday spending decisions really work." },
    ],
  }),
  component: LearnHub,
});

function LearnHub() {
  const featured = LESSONS[0];
  return (
    <Screen>
      <StatusBar />
      <NavBar title="Future Intelligence" back="/" />

      <div className="px-6 pt-2 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80">understand why you want it</p>
        <h1 className="font-display text-[30px] leading-[1.1] mt-2">
          How spending decisions <span className="text-shimmer-gold italic">actually work.</span>
        </h1>
        <p className="mt-3 text-[13.5px] text-foreground/55">
          Short, evidence-based reads — then try the idea in a real craving. No jargon, no shame.
        </p>
      </div>

      {/* Featured lesson */}
      <Link to="/learn/$lessonId" params={{ lessonId: featured.id }} className="mx-6 mt-6 block overflow-hidden rounded-3xl border border-gold/25 bg-[radial-gradient(circle_at_top,oklch(0.79_0.105_82/0.14),transparent_70%)] p-6 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.26em] text-gold/80">start here · {featured.minutes} min</p>
        <h2 className="mt-2 font-display text-[24px]">{featured.title}</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/70">{featured.insight}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-gold">Read & try it →</span>
      </Link>

      {/* Categories */}
      <div className="px-6 mt-9">
        <h3 className="font-display text-[18px]">Explore by topic</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {CATEGORIES.map((c) => {
            const ls = lessonsForCategory(c.id);
            const target = ls[0];
            const inner = (
              <>
                <div className="text-[24px]">{c.emoji}</div>
                <div className="mt-2 font-display text-[15px] leading-tight">{c.title}</div>
                <div className="mt-1 text-[11.5px] text-foreground/45 line-clamp-2">{c.blurb}</div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-foreground/35">
                  {ls.length > 0 ? `${ls.length} lesson${ls.length === 1 ? "" : "s"}` : "Coming soon"}
                </div>
              </>
            );
            return target ? (
              <Link key={c.id} to="/learn/$lessonId" params={{ lessonId: target.id }} className="rounded-2xl border border-white/10 bg-surface p-4 hover:border-gold/40 transition">
                {inner}
              </Link>
            ) : (
              <div key={c.id} className="rounded-2xl border border-white/8 bg-surface/60 p-4 opacity-70">{inner}</div>
            );
          })}
        </div>
      </div>

      <p className="mx-6 mt-8 mb-4 text-center text-[11px] text-foreground/35">
        SELFly shares what research has found — not medical or financial advice.
      </p>

      <BottomNav active="home" />
    </Screen>
  );
}
