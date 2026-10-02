import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Screen } from "@/components/Shell";
import { Img } from "@/components/Img";
import { restaurant, type Dish, type Diet } from "@/lib/catalog";
import { formatINR, useStore } from "@/lib/store";

export const Route = createFileRoute("/food/$appId/$restaurantId")({
  head: () => ({ meta: [{ title: "Menu — Project Future" }] }),
  component: RestaurantMenu,
});

const DIET_RING: Record<Diet, string> = { veg: "border-green-500", egg: "border-amber-500", nonveg: "border-red-500" };
const DIET_FILL: Record<Diet, string> = { veg: "bg-green-500", egg: "bg-amber-500", nonveg: "bg-red-500" };

function DietDot({ diet }: { diet: Diet }) {
  return (
    <span className={`inline-grid h-3.5 w-3.5 place-items-center rounded-sm border ${DIET_RING[diet]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DIET_FILL[diet]}`} />
    </span>
  );
}

function RestaurantMenu() {
  const { appId, restaurantId } = Route.useParams();
  const r = restaurant(restaurantId);
  const { cart, addToCart, cartCount, cartTotal } = useStore();
  const [vegOnly, setVegOnly] = useState(false);
  const [open, setOpen] = useState<Dish | null>(null);

  const sections = useMemo(() => {
    if (!r) return [];
    const dishes = r.dishes.filter((d) => (vegOnly ? d.diet === "veg" : true));
    const order = ["Popular", "Biryani", "Thali", "Tiffins", "Main Course", "Rice", "Starters", "Breads", "Sides", "Street Food", "Chinese", "Sweets", "Beverages", "Desserts"];
    const groups: Record<string, Dish[]> = {};
    for (const d of dishes) (groups[d.section] ??= []).push(d);
    return Object.keys(groups)
      .sort((a, b) => (order.indexOf(a) + 100) % 100 - ((order.indexOf(b) + 100) % 100))
      .map((s) => ({ section: s, items: groups[s] }));
  }, [r, vegOnly]);

  if (!r) {
    return (
      <Screen>
        <div className="mx-6 mt-24 text-center text-foreground/60">Restaurant not found. <Link to="/food" className="text-gold">Back to food</Link></div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div className="relative h-[280px] w-full overflow-hidden">
        <Img src={r.img} alt={r.name} emoji="🍽️" seed={r.id} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
        <Link to="/food/$appId" params={{ appId }} aria-label="Back" className="absolute left-5 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </Link>
      </div>

      <div className="-mt-14 relative px-6">
        <div className="rounded-3xl border border-white/10 bg-surface p-5">
          <h1 className="font-display text-[24px] leading-tight">{r.name}</h1>
          <p className="mt-1 text-[12px] text-foreground/50">{r.cuisines.join(" · ")}</p>
          <div className="mt-3 flex items-center gap-4 text-[12px] text-foreground/65">
            <span className="rounded-md bg-green-600/20 px-2 py-0.5 text-green-400">★ {r.rating}</span>
            <span>{r.etaMins} min</span>
            <span>{r.distanceKm} km</span>
            <span>{r.deliveryFee === 0 ? "Free delivery" : `₹${r.deliveryFee}`}</span>
          </div>
          {r.offer && <p className="mt-3 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2 text-[12px] text-gold">🎁 {r.offer}</p>}
        </div>
      </div>

      <div className="px-6 mt-5 flex items-center justify-between">
        <h2 className="font-display text-[18px]">Menu</h2>
        <button onClick={() => setVegOnly(!vegOnly)} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] ${vegOnly ? "border-green-500/50 bg-green-500/10 text-green-400" : "border-white/10 text-foreground/60"}`}>
          <DietDot diet="veg" /> Veg only
        </button>
      </div>

      <div className="mt-3 px-6 pb-28">
        {sections.map(({ section, items }) => (
          <div key={section} className="mt-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/40">{section}</p>
            <div className="mt-3 flex flex-col divide-y divide-white/6">
              {items.map((d) => {
                const inCart = cart.find((c) => c.id === d.id);
                return (
                  <div key={d.id} className="flex gap-4 py-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <DietDot diet={d.diet} />
                        {d.bestseller && <span className="text-[10px] uppercase tracking-wider text-gold">★ Bestseller</span>}
                      </div>
                      <h4 className="mt-1 font-display text-[16px] leading-tight">{d.name}</h4>
                      <p className="mt-1 text-[13px] text-foreground/80">
                        {formatINR(d.price)} {d.mrp && <span className="ml-1 text-foreground/40 line-through">{formatINR(d.mrp)}</span>}
                      </p>
                      <p className="mt-1 text-[12px] text-foreground/50 line-clamp-2">{d.desc}</p>
                    </div>
                    <div className="relative w-28 shrink-0">
                      <button onClick={() => setOpen(d)} className="block w-full">
                        <Img src={d.img} alt={d.name} emoji="🍴" seed={d.id} className="h-24 w-28 rounded-xl object-cover" />
                      </button>
                      <button
                        onClick={() => (d.addons && d.addons.length ? setOpen(d) : addToCart({ id: d.id, name: d.name, price: d.price, image: d.img }))}
                        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-lg px-5 py-1.5 text-[13px] font-semibold shadow ${inCart ? "bg-gold/20 text-gold ring-1 ring-gold/40" : "bg-surface-elevated text-gold ring-1 ring-gold/30"}`}
                      >
                        {inCart ? `${inCart.qty} ·` : "ADD"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {open && <DishSheet dish={open} onClose={() => setOpen(null)} />}

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[440px] justify-center px-5 pb-5">
        {cartCount > 0 && (
          <Link to="/cart" className="flex w-full items-center justify-between rounded-full px-6 py-4 text-background font-medium shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
            <span>{cartCount} in cart</span>
            <span>View cart · {formatINR(cartTotal)} →</span>
          </Link>
        )}
      </div>
    </Screen>
  );
}

function DishSheet({ dish, onClose }: { dish: Dish; onClose: () => void }) {
  const { addToCart } = useStore();
  const [chosen, setChosen] = useState<Record<string, boolean>>({});
  const addonTotal = (dish.addons ?? []).reduce((a, x) => a + (chosen[x.name] ? x.price : 0), 0);
  const total = dish.price + addonTotal;

  function add() {
    const picked = (dish.addons ?? []).filter((x) => chosen[x.name]);
    const suffix = picked.length ? "+" + picked.map((p) => p.name).join(",") : "";
    addToCart({
      id: dish.id + suffix,
      name: dish.name + (picked.length ? ` (${picked.map((p) => p.name).join(", ")})` : ""),
      price: total,
      image: dish.img,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-t-3xl border-t border-white/10 bg-background p-5 pb-8 animate-rise" onClick={(e) => e.stopPropagation()}>
        <Img src={dish.img} alt={dish.name} emoji="🍴" seed={dish.id} className="h-44 w-full rounded-2xl object-cover" />
        <div className="mt-4 flex items-center gap-2">
          <DietDot diet={dish.diet} />
          {dish.bestseller && <span className="text-[10px] uppercase tracking-wider text-gold">★ Bestseller</span>}
          <span className="ml-auto text-[12px] text-foreground/60">★ {dish.rating}</span>
        </div>
        <h3 className="mt-2 font-display text-[22px]">{dish.name}</h3>
        <p className="mt-1 text-[13px] text-foreground/55">{dish.desc}</p>

        {dish.addons && dish.addons.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/40">Add-ons</p>
            <div className="mt-2 flex flex-col gap-2">
              {dish.addons.map((x) => (
                <button key={x.name} onClick={() => setChosen((c) => ({ ...c, [x.name]: !c[x.name] }))} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px]">
                  <span>{x.name}</span>
                  <span className="flex items-center gap-2 text-foreground/70">+{formatINR(x.price)}
                    <span className={`grid h-5 w-5 place-items-center rounded-md border ${chosen[x.name] ? "border-gold bg-gold/20 text-gold" : "border-white/20"}`}>{chosen[x.name] ? "✓" : ""}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={add} className="mt-5 w-full rounded-full py-4 text-center font-medium text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
          Add to cart · {formatINR(total)}
        </button>
      </div>
    </div>
  );
}
