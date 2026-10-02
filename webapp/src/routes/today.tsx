import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav, NavBar, Screen } from "@/components/Shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/today")({
  head: () => ({ meta: [{ title: "Today — Project Future" }] }),
  component: TodayScreen,
});

const CATEGORIES = [
  { emoji: "🍔", name: "Food", to: "/food", live: true, tint: "from-[#E2443A]/30" },
  { emoji: "📱", name: "Electronics", to: "/electronics", live: true, tint: "from-blue-500/25" },
  { emoji: "🛒", name: "Grocery", to: "/market/grocery", live: true, tint: "from-emerald-500/25" },
  { emoji: "👕", name: "Shopping", to: "/market/shopping", live: true, tint: "from-fuchsia-500/25" },
  { emoji: "✈️", name: "Travel", to: "/market/travel", live: true, tint: "from-cyan-500/25" },
  { emoji: "🎬", name: "Entertainment", to: "/market/entertainment", live: true, tint: "from-violet-500/25" },
  { emoji: "💄", name: "Beauty", to: "/market/beauty", live: true, tint: "from-pink-500/25" },
  { emoji: "🏠", name: "Home", to: "/market/home", live: true, tint: "from-amber-500/25" },
];

function TodayScreen() {
  const { activeDream } = useStore();
  return (
    <Screen>
      <NavBar title="Today" back="/" />
      <div className="px-6 pt-4 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">today's decisions</p>
        <h1 className="font-display text-[34px] leading-[1.05] mt-2">
          What are you
          <br />
          <span className="text-shimmer-gold italic">in the mood for?</span>
        </h1>
        {activeDream && (
          <p className="mt-3 text-[13px] text-foreground/55">
            Every craving you skip can move <span className="text-gold">{activeDream.name}</span> closer.
          </p>
        )}
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 px-6">
        {CATEGORIES.map((c) => {
          const card = (
            <div className={`relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br ${c.tint} to-transparent p-5 h-32 flex flex-col justify-between ${c.live ? "" : "opacity-60"}`}>
              <div className="text-[30px]">{c.emoji}</div>
              <div className="flex items-center justify-between">
                <span className="font-display text-[18px]">{c.name}</span>
                {!c.live && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-foreground/60">Soon</span>}
              </div>
            </div>
          );
          return c.live && c.to ? (
            <Link key={c.name} to={c.to} className="animate-rise">{card}</Link>
          ) : (
            <div key={c.name} className="animate-rise cursor-default" aria-disabled>{card}</div>
          );
        })}
      </div>

      <p className="px-6 mt-8 text-center text-[12px] text-foreground/40">
        Browse like you normally would. We'll add the pause when it's time to decide.
      </p>

      <BottomNav active="home" />
    </Screen>
  );
}
