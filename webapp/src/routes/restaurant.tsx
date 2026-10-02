import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen } from "@/components/Shell";
import sakura from "@/assets/rest-sakura.jpg";
import omakase from "@/assets/dish-omakase.jpg";
import nigiri from "@/assets/dish-nigiri.jpg";
import sushi from "@/assets/food-sushi.jpg";
import { formatINR, useStore } from "@/lib/store";

export const Route = createFileRoute("/restaurant")({
  head: () => ({
    meta: [
      { title: "Sakura Omakase — Project Future" },
      { name: "description", content: "Each plate, a small trade with tomorrow." },
    ],
  }),
  component: RestaurantScreen,
});

const DISHES = [
  { id: "omakase", name: "Chef's Omakase", desc: "12-course tasting", price: 1840, img: omakase },
  { id: "anago", name: "Anago Nigiri", desc: "Sea eel, sweet glaze", price: 420, img: nigiri },
  { id: "aburi", name: "Salmon Aburi Set", desc: "Torched, with yuzu", price: 680, img: sushi },
];

function RestaurantScreen() {
  const { cart, addToCart, cartCount, cartTotal } = useStore();

  return (
    <Screen>
      <div className="relative">
        <div className="relative h-[300px] w-full overflow-hidden">
          <img src={sakura} alt="Sakura Omakase" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
        </div>
        <div className="absolute inset-x-0 top-0">
          <div className="flex items-center justify-between px-5 pt-4">
            <Link to="/restaurants" aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="-mt-16 relative px-6 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">A quiet counter</p>
        <h1 className="font-display text-[32px] leading-[1.05] mt-2">Sakura Omakase</h1>
        <div className="mt-3 flex items-center gap-3 text-[12px] text-foreground/55">
          <span className="text-gold">★ 4.8</span><span className="text-foreground/30">·</span>
          <span>Japanese · ₹₹₹</span><span className="text-foreground/30">·</span><span>32 min</span>
        </div>
      </div>

      <div className="mx-6 mt-6 rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-transparent p-5">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold">the trade</p>
        <p className="mt-2 font-display text-[18px] leading-snug text-foreground/90">
          Everything you don't order here moves straight to your dream.
        </p>
      </div>

      <div className="px-6 mt-8 flex items-center justify-between">
        <h2 className="font-display text-[20px]">The menu</h2>
        <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/40">{DISHES.length} items</span>
      </div>

      <div className="mt-4 flex flex-col gap-3 px-6">
        {DISHES.map((d, i) => {
          const inCart = cart.find((c) => c.id === d.id);
          return (
            <div key={d.id} className="flex gap-4 rounded-2xl border border-white/8 bg-surface p-3 animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
              <img src={d.img} alt={d.name} loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              <div className="flex flex-1 flex-col justify-between py-1">
                <div>
                  <h4 className="font-display text-[16px] leading-tight">{d.name}</h4>
                  <p className="mt-0.5 text-[12px] text-foreground/50">{d.desc}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-display text-[15px]">{formatINR(d.price)}</span>
                  <button
                    onClick={() => addToCart({ id: d.id, name: d.name, price: d.price, image: d.img })}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
                      inCart ? "bg-gold/20 text-gold ring-1 ring-gold/40" : "bg-white/8 text-foreground/85 hover:bg-white/12"
                    }`}
                  >
                    {inCart ? `Added · ${inCart.qty}` : "Add"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-28" />

      {/* Sticky cart bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[440px] justify-center px-5 pb-5">
        {cartCount > 0 ? (
          <Link
            to="/cart"
            className="flex w-full items-center justify-between rounded-full px-6 py-4 text-background font-medium shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]"
            style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}
          >
            <span>{cartCount} in cart</span>
            <span>Review · {formatINR(cartTotal)} →</span>
          </Link>
        ) : (
          <Link
            to="/restaurants"
            className="flex w-full items-center justify-center rounded-full border border-white/10 bg-[oklch(0.16_0.008_260/0.8)] px-6 py-4 text-foreground/70 backdrop-blur-xl"
          >
            Add something to see the trade
          </Link>
        )}
      </div>
    </Screen>
  );
}
