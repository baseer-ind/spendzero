import { createFileRoute, Link } from "@tanstack/react-router";
import { NavBar, Screen } from "@/components/Shell";
import { useStore } from "@/lib/store";
import { computeAchievements } from "@/lib/achievements";

export const Route = createFileRoute("/achievements")({
  head: () => ({ meta: [{ title: "Achievements — SELFly" }] }),
  component: AchievementsScreen,
});

function AchievementsScreen() {
  const { hydrated, events, dreams, totalSaved, decisions } = useStore();
  const list = computeAchievements({ events, dreams, totalSaved, pauses: decisions });
  const unlocked = list.filter((a) => a.unlocked).length;

  return (
    <Screen>
      <NavBar title="Achievements" back="/profile" />
      <div className="px-6 pt-4 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">who you're becoming</p>
        <h1 className="font-display text-[34px] leading-[1.05] mt-2">
          {hydrated ? unlocked : 0} of {list.length}
          <span className="text-shimmer-gold"> unlocked</span>
        </h1>
      </div>

      <div className="mt-7 flex flex-col gap-3 px-6">
        {list.map((a) => (
          <Link
            key={a.id}
            to={a.to}
            className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
              a.unlocked ? "border-gold/30 bg-surface" : "border-white/8 bg-surface/50 opacity-60"
            }`}
          >
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-[20px] ${a.unlocked ? "bg-gold/15 ring-1 ring-gold/40" : "bg-white/5"}`}>
              {a.unlocked ? a.icon : "🔒"}
            </div>
            <div className="flex-1">
              <h4 className="font-display text-[16px]">{a.title}</h4>
              <p className="mt-0.5 text-[12px] text-foreground/50">{a.desc}</p>
            </div>
            <span className="text-foreground/30">›</span>
          </Link>
        ))}
      </div>

      <p className="px-6 mt-8 text-center text-[12px] text-foreground/40">
        Earned by choosing — not by spending.
      </p>
    </Screen>
  );
}
