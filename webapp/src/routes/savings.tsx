import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav, NavBar, Screen, StatusBar } from "@/components/Shell";
import { formatINR, useStore } from "@/lib/store";

export const Route = createFileRoute("/savings")({
  head: () => ({
    meta: [
      { title: "Money You Kept — Project Future" },
      { name: "description", content: "The money you chose not to spend — and where it's going." },
    ],
  }),
  component: SavingsScreen,
});

const CAT_ICON: Record<string, string> = {
  Food: "🍽️", Shopping: "🛍️", Entertainment: "🎬", Grocery: "🛒", Travel: "✈️", Other: "✨",
};

function SavingsScreen() {
  const { hydrated, totalSaved, keptByCategory, decisions, dreams } = useStore();
  const cats = Object.entries(keptByCategory).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...cats.map(([, v]) => v));

  return (
    <Screen>
      <StatusBar />
      <NavBar title="Money You Kept" back="/profile" />

      <div className="px-6 pt-2 text-center animate-rise">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80">redirected so far</p>
        <p className="mt-3 font-display text-[52px] leading-none text-shimmer-gold">{hydrated ? formatINR(totalSaved) : "—"}</p>
        <p className="mt-3 text-[13px] text-foreground/55">
          across {decisions} conscious {decisions === 1 ? "decision" : "decisions"}
        </p>
      </div>

      {/* Honest framing — this is a behavioural tally, not a bank balance. */}
      <div className="mx-6 mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-[13px] leading-relaxed text-foreground/60">
          This is the money you <span className="text-foreground/90">chose not to spend</span> and redirected toward your
          dreams — a tally that keeps you honest with yourself. It isn't money transferred into a bank account;
          Project Future doesn't hold your money.
        </p>
      </div>

      {/* Category breakdown */}
      <div className="px-6 mt-8">
        <h2 className="font-display text-[20px]">Where it came from</h2>
        {cats.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/8 bg-surface p-6 text-center text-[13px] text-foreground/55">
            Nothing yet. Next time a craving shows up, pause — and watch it add up here.
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {cats.map(([cat, amt]) => (
              <div key={cat}>
                <div className="flex items-center justify-between text-[14px]">
                  <span className="flex items-center gap-2 text-foreground/80">
                    <span>{CAT_ICON[cat] ?? "✨"}</span>{cat}
                  </span>
                  <span className="text-foreground/90">{formatINR(amt)}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full" style={{ width: `${Math.round((amt / max) * 100)}%`, background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))" }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* The real-money future (architecture only — no fake banking) */}
      <div className="mx-6 mt-9 rounded-3xl border border-gold/20 bg-[radial-gradient(circle_at_top,oklch(0.79_0.105_82/0.12),transparent_70%)] p-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">coming later</p>
        <h3 className="mt-2 font-display text-[20px]">Move it to real savings</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/65">
          One day you'll be able to turn money you kept here into money actually saved — moved by you, into a real
          account with a regulated partner. For now, this stays a virtual tally so you can build the habit first.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-[12px] text-foreground/45">
          Money kept → Money redirected → Money actually saved
        </div>
      </div>

      <div className="px-6 mt-8 pb-10">
        <Link to="/future" className="block w-full rounded-full py-4 text-center font-medium text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
          {dreams.length > 0 ? "See my dreams" : "Set your first dream"}
        </Link>
      </div>

      <BottomNav active="profile" />
    </Screen>
  );
}
