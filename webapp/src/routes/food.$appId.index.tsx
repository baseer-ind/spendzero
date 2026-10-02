import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { NavBar, Screen } from "@/components/Shell";
import { Img } from "@/components/Img";
import { FOOD_CUISINES, foodApp, restaurantsForApp } from "@/lib/catalog";
import { useBrowseTracking } from "@/lib/tracking";
import { ExploreNudge } from "@/components/ExploreNudge";
import { formatINR } from "@/lib/store";

export const Route = createFileRoute("/food/$appId/")({
  head: () => ({ meta: [{ title: "Restaurants — Project Future" }] }),
  component: FoodAppHome,
});

function FoodAppHome() {
  const { appId } = Route.useParams();
  useBrowseTracking("Food", appId);
  const app = foodApp(appId);
  const all = restaurantsForApp(appId);
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return all.filter((r) => {
      const matchC = !cuisine || r.cuisines.includes(cuisine);
      const matchQ =
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.cuisines.some((c) => c.toLowerCase().includes(query)) ||
        r.dishes.some((d) => d.name.toLowerCase().includes(query));
      return matchC && matchQ;
    });
  }, [all, q, cuisine]);

  return (
    <Screen>
      <NavBar title={app?.name ?? "Food"} back="/food" />

      <div className="px-6 pt-2">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="text-foreground/40">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search restaurants or dishes…"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-foreground/35"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto px-6 pb-1 no-scrollbar">
        <Chip active={cuisine === null} onClick={() => setCuisine(null)}>All</Chip>
        {FOOD_CUISINES.map((c) => (
          <Chip key={c} active={cuisine === c} onClick={() => setCuisine(cuisine === c ? null : c)}>{c}</Chip>
        ))}
      </div>

      <div className="px-6 mt-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/40">
          {results.length} {results.length === 1 ? "place" : "places"} near you
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-5 px-6 pb-10">
        {results.map((r, i) => (
          <Link
            key={r.id}
            to="/food/$appId/$restaurantId"
            params={{ appId, restaurantId: r.id }}
            className="group overflow-hidden rounded-3xl border border-white/8 bg-surface animate-rise"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="relative h-44 w-full overflow-hidden">
              <Img src={r.img} alt={r.name} emoji="🍽️" seed={r.id} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
              {r.offer && (
                <div className="absolute bottom-3 left-3 rounded-lg bg-black/55 px-2.5 py-1 text-[12px] font-medium text-gold backdrop-blur">
                  {r.offer}
                </div>
              )}
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[12px] backdrop-blur">
                <span className="text-gold">★</span>{r.rating}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {r.vegOnly && (
                      <span className="grid h-3 w-3 place-items-center rounded-sm border border-green-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      </span>
                    )}
                    <h3 className="font-display text-[19px] leading-tight">{r.name}</h3>
                    {r.vegOnly && <span className="text-[10px] uppercase tracking-wider text-green-400">Pure veg</span>}
                  </div>
                  <p className="mt-1 text-[12px] text-foreground/50">{r.cuisines.join(" · ")}</p>
                  <p className="mt-0.5 text-[11px] text-foreground/40">{r.area}, {r.city}</p>
                </div>
                <div className="text-right text-[12px] text-foreground/55">
                  <div>{r.etaMins} min</div>
                  <div>{r.distanceKm} km</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-[12px] text-foreground/55">
                <span>{formatINR(r.costForTwo)} for two</span>
                <span>{r.deliveryFee === 0 ? "Free delivery" : `₹${r.deliveryFee} delivery`}</span>
              </div>
            </div>
          </Link>
        ))}
        {results.length === 0 && (
          <div className="rounded-2xl border border-white/8 bg-surface p-8 text-center text-foreground/55">
            Nothing matches "{q}". Try another craving.
          </div>
        )}
      </div>

      <ExploreNudge />
    </Screen>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition ${
        active ? "border-gold/50 bg-gold/15 text-gold" : "border-white/10 bg-white/5 text-foreground/65"
      }`}
    >
      {children}
    </button>
  );
}
