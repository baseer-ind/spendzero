import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav, NavBar, Screen, StatusBar } from "@/components/Shell";
import { fmtDuration } from "@/lib/tracking";
import { formatINR, useStore } from "@/lib/store";

export const Route = createFileRoute("/consumption")({
  head: () => ({
    meta: [
      { title: "My Consumption — SELFly" },
      { name: "description", content: "How your attention and your money actually move." },
    ],
  }),
  component: ConsumptionScreen,
});

const CAT_ICON: Record<string, string> = {
  Food: "🍽️", Electronics: "📱", Shopping: "🛍️", Grocery: "🛒", Travel: "✈️", Entertainment: "🎬", Other: "✨",
};

function dayKey(d: Date) { return d.toISOString().slice(0, 10); }
function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

function ConsumptionScreen() {
  const { hydrated, weekSummary: w, todaySummary: t, sessionLog, engagement, activeDream, imageFor } = useStore();

  const verticals = Object.entries(w.byVertical).sort((a, b) => b[1] - a[1]);
  const totalVertMs = Math.max(1, verticals.reduce((a, [, v]) => a + v, 0));
  const apps = Object.entries(w.byApp).sort((a, b) => b[1] - a[1]);
  const maxApp = Math.max(1, ...apps.map(([, v]) => v));

  const attentionBeatsSpend = w.cartValueExplored > w.spent;

  // Today's activity timeline (real sessions, newest first).
  const todayStart = new Date(dayKey(new Date()) + "T00:00:00").getTime();
  const todaySessions = sessionLog.filter((e) => e.at >= todayStart).slice(0, 12);

  // Last 7 days of active time, for a simple bar chart.
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const k = dayKey(d);
    return { label: d.toLocaleDateString("en-IN", { weekday: "narrow" }), ms: engagement[k]?.activeMs ?? 0 };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.ms));

  return (
    <Screen>
      <StatusBar />
      <NavBar title="My Consumption" back="/profile" />

      <div className="px-6 pt-2 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80">your exploring</p>
        <h1 className="font-display text-[28px] leading-[1.1] mt-2">
          See where your <span className="text-shimmer-gold italic">attention went.</span>
        </h1>
        <p className="mt-2 text-[13px] text-foreground/55">Only active browsing is counted — not background or idle time.</p>
      </div>

      {/* TODAY */}
      <div className="px-6 mt-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/40">today</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Tile label="Exploring time" value={hydrated ? fmtDuration(t.activeMs) : "—"} />
          <Tile label="Products viewed" value={String(t.productsViewed)} />
          <Tile label="Value explored" value={formatINR(t.cartValueExplored)} />
          <Tile label="Money redirected" value={formatINR(t.redirected)} gold />
        </div>
      </div>

      {/* Your decisions (today) */}
      {hydrated && t.decisions > 0 && (
        <div className="mx-6 mt-5 rounded-2xl border border-white/8 bg-surface p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/40">your decisions today</p>
          <div className="mt-3 flex items-center justify-between text-[13px]">
            <span className="text-foreground/70">{t.decisions} moment{t.decisions === 1 ? "" : "s"} paused</span>
            <span className="text-foreground/55">{t.enjoyedCount} enjoyed · {t.redirectedCount} redirected</span>
          </div>
          {t.redirected > 0 && <p className="mt-2 text-[13px] text-gold">{formatINR(t.redirected)} moved toward your future.</p>}
        </div>
      )}

      {/* TIMELINE — real sessions today */}
      {hydrated && todaySessions.length > 0 && (
        <div className="px-6 mt-8">
          <h2 className="font-display text-[20px]">Your day, step by step</h2>
          <div className="mt-4 flex flex-col">
            {todaySessions.map((e) => (
              <div key={e.id} className="flex items-start gap-3 border-l border-white/10 pl-4 pb-4 last:pb-0">
                <div className="-ml-[21px] mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gold" />
                <div className="flex-1">
                  <p className="text-[11px] text-foreground/40">{fmtTime(e.at)}</p>
                  <p className="text-[14px] text-foreground/85">
                    {CAT_ICON[e.vertical] ?? "✨"} {e.vertical}
                    {e.app ? <span className="text-foreground/40"> · {e.app}</span> : null}
                  </p>
                  <p className="text-[12px] text-foreground/50">{fmtDuration(e.ms)} exploring</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* THIS WEEK */}
      <div className="px-6 mt-8">
        <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/40">this week</p>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3 px-6">
        <Tile label="Exploring" value={hydrated ? fmtDuration(w.activeMs) : "—"} />
        <Tile label="Products viewed" value={String(w.productsViewed)} />
        <Tile label="Money spent" value={formatINR(w.spent)} />
        <Tile label="Money redirected" value={formatINR(w.redirected)} gold />
      </div>

      {/* 7-day attention bars */}
      {hydrated && w.activeMs > 0 && (
        <div className="mx-6 mt-5 rounded-2xl border border-white/8 bg-surface p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/40">last 7 days</p>
          <div className="mt-3 flex items-end justify-between gap-2" style={{ height: 80 }}>
            {days.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
                <div className="w-full rounded-t bg-gradient-to-t from-[oklch(0.72_0.12_80)] to-[oklch(0.92_0.09_84)]" style={{ height: `${Math.max(4, Math.round((d.ms / maxDay) * 64))}px` }} />
                <span className="text-[10px] text-foreground/40">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FUTURE CONNECTION */}
      {hydrated && w.redirected > 0 && activeDream && (
        <div className="mx-6 mt-6 overflow-hidden rounded-3xl border border-gold/20 bg-surface">
          <div className="p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold/80">attention → future</p>
            <p className="mt-2 text-[14px] text-foreground/70">
              You explored {fmtDuration(w.activeMs)} this week and redirected <span className="text-gold">{formatINR(w.redirected)}</span> toward:
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/5 text-[20px]">
                {imageFor(activeDream.cover) ? <img src={imageFor(activeDream.cover)} alt="" className="h-full w-full object-cover" /> : activeDream.emoji}
              </div>
              <div className="flex-1">
                <p className="text-[14px]">{activeDream.name}</p>
                <p className="text-[12px] text-foreground/50">{formatINR(activeDream.saved)} / {formatINR(activeDream.target)}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.round((activeDream.saved / activeDream.target) * 100))}%`, background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The insight — attention vs money */}
      {hydrated && (w.cartValueExplored > 0 || w.activeMs > 0) && (
        <div className="mx-6 mt-6 rounded-3xl border border-gold/20 bg-[radial-gradient(circle_at_top,oklch(0.79_0.105_82/0.12),transparent_70%)] p-6">
          <p className="font-display text-[19px] leading-snug text-balance">
            {attentionBeatsSpend
              ? "Your attention was bigger than your spending."
              : "Your attention and your money moved together this week."}
          </p>
          <p className="mt-2 text-[13px] text-foreground/60">
            You explored {formatINR(w.cartValueExplored)} of products and spent {formatINR(w.spent)}.
            {w.redirected > 0 && ` ${formatINR(w.redirected)} went toward your future.`}
          </p>
          <p className="mt-2 text-[12px] text-foreground/40">This is awareness, not judgement.</p>
        </div>
      )}

      {/* What caught your attention */}
      <div className="px-6 mt-8">
        <h2 className="font-display text-[20px]">What caught your attention?</h2>
        {verticals.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/8 bg-surface p-6 text-center text-[13px] text-foreground/55">
            Browse a little and your attention map appears here.
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {verticals.map(([v, ms]) => {
              const pctv = Math.round((ms / totalVertMs) * 100);
              return (
                <div key={v}>
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="flex items-center gap-2 text-foreground/80"><span>{CAT_ICON[v] ?? "✨"}</span>{v}</span>
                    <span className="text-foreground/60">{fmtDuration(ms)} · {pctv}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full" style={{ width: `${pctv}%`, background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* App-level */}
      {apps.length > 0 && (
        <div className="px-6 mt-8">
          <h2 className="font-display text-[20px]">Time by app</h2>
          <div className="mt-4 flex flex-col gap-3">
            {apps.map(([a, ms]) => (
              <div key={a} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-[13px] text-foreground/75">{a}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full" style={{ width: `${Math.round((ms / maxApp) * 100)}%`, background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))" }} />
                </div>
                <span className="w-16 shrink-0 text-right text-[12px] text-foreground/55">{fmtDuration(ms)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mx-6 mt-8 text-[11px] text-foreground/35">
        SELFly measures only your activity inside this app. Awareness of time spent in other apps (Amazon,
        Flipkart, etc.) is a separate, permission-based capability — see the roadmap.
      </p>

      <div className="px-6 mt-6 pb-10">
        <Link to="/savings" className="block w-full rounded-full py-4 text-center font-medium text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
          See money you kept
        </Link>
      </div>

      <BottomNav active="profile" />
    </Screen>
  );
}

function Tile({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-surface p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/45">{label}</p>
      <p className={`mt-2 font-display text-[22px] ${gold ? "text-shimmer-gold" : "text-foreground/90"}`}>{value}</p>
    </div>
  );
}
