import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav, NavBar, Screen, StatusBar } from "@/components/Shell";
import { fmtDuration } from "@/lib/tracking";
import { formatINR, useStore } from "@/lib/store";

export const Route = createFileRoute("/consumption")({
  head: () => ({
    meta: [
      { title: "My Consumption — Project Future" },
      { name: "description", content: "How your attention and your money actually move." },
    ],
  }),
  component: ConsumptionScreen,
});

const CAT_ICON: Record<string, string> = {
  Food: "🍽️", Electronics: "📱", Shopping: "🛍️", Grocery: "🛒", Travel: "✈️", Entertainment: "🎬", Other: "✨",
};

function ConsumptionScreen() {
  const { hydrated, weekSummary: w } = useStore();

  const verticals = Object.entries(w.byVertical).sort((a, b) => b[1] - a[1]);
  const totalVertMs = Math.max(1, verticals.reduce((a, [, v]) => a + v, 0));
  const apps = Object.entries(w.byApp).sort((a, b) => b[1] - a[1]);
  const maxApp = Math.max(1, ...apps.map(([, v]) => v));

  const attentionBeatsSpend = w.cartValueExplored > w.spent;

  return (
    <Screen>
      <StatusBar />
      <NavBar title="My Consumption" back="/profile" />

      <div className="px-6 pt-2 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80">this week</p>
        <h1 className="font-display text-[30px] leading-[1.1] mt-2">
          Your attention <span className="text-shimmer-gold italic">and your money.</span>
        </h1>
        <p className="mt-2 text-[13px] text-foreground/55">Only active browsing is counted — not time in the background or idle.</p>
      </div>

      {/* Headline tiles */}
      <div className="mt-6 grid grid-cols-2 gap-3 px-6">
        <Tile label="Exploring" value={hydrated ? fmtDuration(w.activeMs) : "—"} />
        <Tile label="Products viewed" value={String(w.productsViewed)} />
        <Tile label="Cart value explored" value={formatINR(w.cartValueExplored)} />
        <Tile label="Money spent" value={formatINR(w.spent)} />
        <Tile label="Money redirected" value={formatINR(w.redirected)} gold />
        <Tile label="Conscious decisions" value={String(w.decisions)} />
      </div>

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
        Project Future measures only your activity inside this app. Awareness of time spent in other apps (Amazon,
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
