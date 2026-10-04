import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav, NavBar, Screen } from "@/components/Shell";
import { useStore } from "@/lib/store";
import { scenicArt } from "@/lib/localImage";
import { photoSrc } from "@/lib/productImages";

export const Route = createFileRoute("/today")({
  head: () => ({ meta: [{ title: "Today — SELFly" }] }),
  component: TodayScreen,
});

// Image-led category tiles. A real hero photo at public/brand/categories/<id>.webp
// is used when present; otherwise an on-brand generated backdrop (never a broken
// image, never a claim of product photography). See public/brand/categories/README.
// `rep` points a category tile at a representative launch product photo, so the
// moment real product photography is registered, Today shows it automatically
// (biryani for Food, earbuds for Electronics, etc.). Falls back to a category
// hero file, then an on-brand generated backdrop — never a broken image.
const CATEGORIES = [
  { id: "food", name: "Food", tagline: "Explore cravings", to: "/food", rep: { v: "food", id: "dz-chk-bir" } },
  { id: "electronics", name: "Electronics", tagline: "See what's tempting", to: "/electronics", rep: { v: "electronics", id: "soniq-airbuds-pro" } },
  { id: "grocery", name: "Grocery", tagline: "Everyday essentials", to: "/market/grocery", rep: { v: "grocery", id: "gr-banana" } },
  { id: "shopping", name: "Shopping", tagline: "Browse the latest", to: "/market/shopping", rep: { v: "shopping", id: "sh-shoes" } },
  { id: "travel", name: "Travel", tagline: "Where to next?", to: "/market/travel", rep: null },
  { id: "entertainment", name: "Entertainment", tagline: "A night out", to: "/market/entertainment", rep: null },
  { id: "beauty", name: "Beauty", tagline: "Treat yourself", to: "/market/beauty", rep: null },
  { id: "home", name: "Home", tagline: "For your space", to: "/market/home", rep: null },
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
        {CATEGORIES.map((c) => (
          <Link key={c.id} to={c.to} className="animate-rise group">
            <div className="relative h-44 overflow-hidden rounded-3xl border border-white/8 ring-1 ring-white/5">
              <img
                src={(c.rep && photoSrc(c.rep.v, c.rep.id)) || `/brand/categories/${c.id}.webp`}
                alt=""
                aria-hidden
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.dataset.fb) return;
                  img.dataset.fb = "1";
                  img.src = scenicArt(`cat-${c.id}`);
                }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-active:scale-105"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(15,20,25,0.1) 0%, rgba(15,20,25,0.15) 40%, rgba(15,20,25,0.82) 100%)" }}
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/60">{c.tagline}</p>
                <p className="mt-0.5 font-display text-[20px] text-white">{c.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="px-6 mt-8 text-center text-[12px] text-foreground/40">
        Browse like you normally would. We'll add the pause when it's time to decide.
      </p>

      <BottomNav active="home" />
    </Screen>
  );
}
