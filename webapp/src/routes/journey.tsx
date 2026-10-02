import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav, NavBar, Screen } from "@/components/Shell";
import { formatINR, useStore } from "@/lib/store";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Journey — Project Future" },
      { name: "description", content: "Every quiet win, in chronological order." },
    ],
  }),
  component: JourneyScreen,
});

function relativeDay(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(today) - startOf(d)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function JourneyScreen() {
  const { hydrated, events, totalSaved, currentStreak } = useStore();

  return (
    <Screen>
      <NavBar title="Journey" back="/" />

      <div className="px-6 pt-4 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">since you began</p>
        <h1 className="font-display text-[36px] leading-[1.02] mt-2">
          Every quiet win.
          <br />
          <span className="text-shimmer-gold italic">In order.</span>
        </h1>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-3 px-6">
        {[
          { v: hydrated ? String(events.length) : "—", l: "Skips" },
          { v: hydrated ? formatINR(totalSaved) : "—", l: "Redirected" },
          { v: hydrated ? `${currentStreak} ${currentStreak === 1 ? "day" : "days"}` : "—", l: "Streak" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-white/8 bg-surface p-4 text-center">
            <p className="font-display text-[18px] text-gold leading-none">{s.v}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-foreground/45">{s.l}</p>
          </div>
        ))}
      </div>

      {hydrated && events.length === 0 ? (
        <div className="mx-6 mt-10 rounded-2xl border border-white/8 bg-surface p-8 text-center">
          <p className="font-display text-[20px]">No wins logged yet</p>
          <p className="mt-2 text-[13px] text-foreground/55">
            Resist a craving and it'll appear here — every rupee you redirect, in order.
          </p>
          <Link
            to="/today"
            className="mt-5 inline-block rounded-full px-6 py-3 text-background font-medium"
            style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}
          >
            Skip a craving
          </Link>
        </div>
      ) : (
        <div className="relative mt-10 px-6">
          <div className="absolute left-[34px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/30 via-white/8 to-transparent" />
          <div className="flex flex-col gap-7">
            {events.map((e, i) => (
              <div key={e.id} className="relative flex gap-5 animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="relative z-10 mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gold/40 bg-background">
                  <span className="block h-2 w-2 rounded-full bg-gold" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">{relativeDay(e.at)}</span>
                    <span className="text-[12px] font-medium text-gold">+ {formatINR(e.amount)}</span>
                  </div>
                  <h4 className="mt-1.5 font-display text-[17px] leading-snug">{e.note}</h4>
                  <p className="mt-1 text-[12px] leading-relaxed text-foreground/50">
                    Redirected toward your future.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 mt-10 text-center">
        <p className="font-display italic text-[15px] text-foreground/55 text-balance">
          "The future is built from afternoons like this one."
        </p>
      </div>

      <BottomNav active="journey" />
    </Screen>
  );
}
