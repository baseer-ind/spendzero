import { createFileRoute, Link } from "@tanstack/react-router";
import { NavBar, Screen } from "@/components/Shell";
import { FOOD_APPS } from "@/lib/catalog";

export const Route = createFileRoute("/food/")({
  head: () => ({ meta: [{ title: "Food — Project Future" }] }),
  component: FoodApps,
});

function FoodApps() {
  return (
    <Screen>
      <NavBar title="Food Delivery" back="/today" />
      <div className="px-6 pt-4 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">order from top apps</p>
        <h1 className="font-display text-[30px] leading-[1.1] mt-2">Choose an app to explore</h1>
      </div>

      <div className="mt-6 flex flex-col gap-4 px-6">
        {FOOD_APPS.map((a, i) => (
          <Link
            key={a.id}
            to="/food/$appId"
            params={{ appId: a.id }}
            className="relative overflow-hidden rounded-3xl border border-white/10 animate-rise"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="p-6" style={{ background: `linear-gradient(135deg, ${a.accent}, ${a.accent}22)` }}>
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-[26px] backdrop-blur">
                  {a.glyph}
                </div>
                <div>
                  <h3 className="font-display text-[24px] text-white leading-none">{a.name}</h3>
                  <span className="mt-2 inline-block rounded-full bg-black/25 px-2.5 py-1 text-[11px] text-white/90">🔥 {a.badge}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between bg-surface px-6 py-4">
              <span className="text-[13px] text-foreground/60">{a.tagline}</span>
              <span className="text-[13px] font-medium" style={{ color: a.accent }}>Open →</span>
            </div>
          </Link>
        ))}
      </div>
    </Screen>
  );
}
