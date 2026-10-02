import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { NavBar, Screen } from "@/components/Shell";
import { Img } from "@/components/Img";
import { ExploreNudge } from "@/components/ExploreNudge";
import { useBrowseTracking } from "@/lib/tracking";
import { EL_CATEGORIES, ELECTRONICS_APP, PRODUCTS, deals, discountPct, trending } from "@/lib/electronics";
import { formatINR, useStore } from "@/lib/store";

export const Route = createFileRoute("/electronics/")({
  head: () => ({ meta: [{ title: "TechBazaar — Project Future" }] }),
  component: ElectronicsHome,
});

function ElectronicsHome() {
  useBrowseTracking("Electronics", ELECTRONICS_APP.id);
  const { trackView, cartCount, cartTotal, wishlist } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<"popular" | "price-asc" | "price-desc" | "rating" | "discount">("popular");
  const [under2k, setUnder2k] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [dealsOnly, setDealsOnly] = useState(false);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      const mc = !cat || p.category === cat;
      const mq = !query || p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
      const mp = !under2k || p.price < 2000;
      const mr = !topRated || p.rating >= 4.3;
      const md = !dealsOnly || discountPct(p) >= 30;
      return mc && mq && mp && mr && md;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "rating": return b.rating - a.rating;
        case "discount": return discountPct(b) - discountPct(a);
        default: return (b.ratingCount) - (a.ratingCount); // popular
      }
    });
    return list;
  }, [q, cat, sort, under2k, topRated, dealsOnly]);

  useEffect(() => { trackView(results.length); }, [cat, q]); // eslint-disable-line react-hooks/exhaustive-deps

  const topDeals = deals();
  const trend = trending();

  return (
    <Screen>
      <NavBar title={ELECTRONICS_APP.name} back="/today" />

      <div className="px-6 pt-2">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="text-foreground/40">🔍</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search gadgets, brands…" className="w-full bg-transparent text-[15px] outline-none placeholder:text-foreground/35" />
        </div>
      </div>

      {/* Deals rail — the browse-heavy environment */}
      {!q && !cat && (
        <>
          <div className="px-6 mt-6 flex items-center justify-between">
            <h2 className="font-display text-[18px]">🔥 Deals of the day</h2>
            <span className="text-[11px] uppercase tracking-[0.2em] text-foreground/40">limited time</span>
          </div>
          <div className="mt-3 -mx-6 overflow-x-auto px-6 no-scrollbar">
            <div className="flex gap-3 pr-2">
              {topDeals.map((p) => (
                <Link key={p.id} to="/electronics/$productId" params={{ productId: p.id }} className="w-[150px] shrink-0 overflow-hidden rounded-2xl border border-white/8 bg-surface">
                  <div className="relative h-28 w-full">
                    <Img src={p.img} alt={p.name} emoji="📦" seed={p.id} className="h-full w-full object-cover" />
                    <span className="absolute left-2 top-2 rounded-md bg-red-600/90 px-1.5 py-0.5 text-[11px] font-semibold text-white">{discountPct(p)}% OFF</span>
                  </div>
                  <div className="p-2.5">
                    <p className="line-clamp-2 text-[12.5px] leading-tight text-foreground/85">{p.name}</p>
                    <p className="mt-1 text-[13px] font-semibold">{formatINR(p.price)} <span className="text-[11px] font-normal text-foreground/40 line-through">{formatINR(p.mrp)}</span></p>
                    {p.stockLeft != null && p.stockLeft <= 5 && <p className="mt-0.5 text-[10.5px] text-red-400">Only {p.stockLeft} left</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Wishlist access (real destination) */}
      <div className="px-6 mt-5 flex items-center justify-between">
        <Link to="/wishlist" className="flex items-center gap-2 text-[13px] text-foreground/70">
          <span className="text-red-400">♥</span> Wishlist {wishlist.length > 0 && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">{wishlist.length}</span>}
        </Link>
        <label className="flex items-center gap-2 text-[12px] text-foreground/55">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-lg border border-white/10 bg-surface px-2 py-1.5 text-[12px] text-foreground/85 outline-none">
            <option value="popular" className="bg-surface">Popular</option>
            <option value="price-asc" className="bg-surface">Price: Low → High</option>
            <option value="price-desc" className="bg-surface">Price: High → Low</option>
            <option value="rating" className="bg-surface">Rating</option>
            <option value="discount" className="bg-surface">Discount</option>
          </select>
        </label>
      </div>

      {/* Category chips */}
      <div className="mt-4 flex gap-2 overflow-x-auto px-6 pb-1 no-scrollbar">
        <Chip active={cat === null} onClick={() => setCat(null)}>All</Chip>
        {EL_CATEGORIES.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>{c}</Chip>)}
      </div>

      {/* Working filters */}
      <div className="mt-2 flex gap-2 overflow-x-auto px-6 pb-1 no-scrollbar">
        <Chip active={under2k} onClick={() => setUnder2k((v) => !v)}>Under ₹2,000</Chip>
        <Chip active={topRated} onClick={() => setTopRated((v) => !v)}>4.3★ & up</Chip>
        <Chip active={dealsOnly} onClick={() => setDealsOnly((v) => !v)}>Big discounts</Chip>
      </div>

      {!q && !cat && trend.length > 0 && (
        <p className="px-6 mt-5 text-[11px] uppercase tracking-[0.22em] text-foreground/40">Trending now</p>
      )}

      {/* Product grid */}
      <div className="mt-3 grid grid-cols-2 gap-3 px-6 pb-28">
        {results.map((p, i) => (
          <Link key={p.id} to="/electronics/$productId" params={{ productId: p.id }} className="overflow-hidden rounded-2xl border border-white/8 bg-surface animate-rise" style={{ animationDelay: `${(i % 8) * 50}ms` }}>
            <div className="relative h-32 w-full">
              <Img src={p.img} alt={p.name} emoji="📦" seed={p.id} className="h-full w-full object-cover" />
              {discountPct(p) > 0 && <span className="absolute left-2 top-2 rounded-md bg-red-600/90 px-1.5 py-0.5 text-[11px] font-semibold text-white">{discountPct(p)}% OFF</span>}
              {p.badge && <span className="absolute right-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] text-gold backdrop-blur">{p.badge}</span>}
            </div>
            <div className="p-3">
              <p className="text-[10.5px] uppercase tracking-wider text-foreground/40">{p.brand}</p>
              <p className="mt-0.5 line-clamp-2 text-[13px] leading-tight text-foreground/85">{p.name}</p>
              <div className="mt-1.5 flex items-center gap-1 text-[11px]">
                <span className="rounded bg-green-600/20 px-1.5 py-0.5 text-green-400">★ {p.rating}</span>
                <span className="text-foreground/40">({(p.ratingCount / 1000).toFixed(1)}k)</span>
              </div>
              <p className="mt-1.5 text-[14px] font-semibold">{formatINR(p.price)} <span className="text-[11px] font-normal text-foreground/40 line-through">{formatINR(p.mrp)}</span></p>
              {p.bankOffer && <p className="mt-1 line-clamp-1 text-[10.5px] text-gold/80">🏦 {p.bankOffer}</p>}
            </div>
          </Link>
        ))}
        {results.length === 0 && (
          <div className="col-span-2 rounded-2xl border border-white/8 bg-surface p-8 text-center text-foreground/55">Nothing matches "{q}".</div>
        )}
      </div>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[440px] justify-center px-5 pb-5">
          <Link to="/cart" className="flex w-full items-center justify-between rounded-full px-6 py-4 text-background font-medium" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
            <span>{cartCount} in cart</span>
            <span>View cart · {formatINR(cartTotal)} →</span>
          </Link>
        </div>
      )}

      <ExploreNudge />
    </Screen>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition ${active ? "border-gold/50 bg-gold/15 text-gold" : "border-white/10 bg-white/5 text-foreground/65"}`}>
      {children}
    </button>
  );
}
