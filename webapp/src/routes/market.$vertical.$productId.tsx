import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Screen } from "@/components/Shell";
import { Img } from "@/components/Img";
import { ExploreNudge } from "@/components/ExploreNudge";
import { useBrowseTracking } from "@/lib/tracking";
import { discountPct, marketProduct, vertical } from "@/lib/market";
import { photoSrc } from "@/lib/productImages";
import { formatINR, useStore } from "@/lib/store";

export const Route = createFileRoute("/market/$vertical/$productId")({
  head: () => ({ meta: [{ title: "Product — SELFly" }] }),
  component: MarketProductDetail,
});

function MarketProductDetail() {
  const { vertical: vid, productId } = Route.useParams();
  const v = vertical(vid);
  const p = marketProduct(vid, productId);
  useBrowseTracking(v?.label ?? "Market", v?.name);
  const navigate = useNavigate();
  const { addToCart, trackOpen, trackCartExplore, toggleWish, inWishlist, cartCount, cartTotal } = useStore();

  useEffect(() => { if (p) trackOpen(); }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!v || !p) {
    return (
      <Screen>
        <div className="mx-6 mt-24 text-center text-foreground/60">Not found. <Link to="/today" className="text-gold">Back to Today</Link></div>
      </Screen>
    );
  }

  const wished = inWishlist(p.id);
  const similar = v.products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 6);
  const pool = similar.length > 0 ? similar : v.products.filter((x) => x.id !== p.id).slice(0, 6);
  const physical = !["travel", "entertainment"].includes(v.id);
  const primary = photoSrc(v.id, p.id) || p.img;

  function add() {
    if (!p || !v) return;
    addToCart({ id: p.id, name: p.name, price: p.price, image: primary, vertical: v.label });
    trackCartExplore(p.price);
  }

  return (
    <Screen>
      <div className="relative">
        <Img src={primary} alt={p.name} emoji={v.emoji} seed={p.id} className="h-[300px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />
        <Link to="/market/$vertical" params={{ vertical: vid }} aria-label="Back" className="absolute left-5 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </Link>
        <button onClick={() => toggleWish({ id: p.id, name: p.name, price: p.price, image: primary, vertical: v.label })} aria-label="Wishlist" className="absolute right-5 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/45 backdrop-blur">
          <span className={wished ? "text-red-400" : "text-white"}>{wished ? "♥" : "♡"}</span>
        </button>
      </div>

      <div className="px-6 pt-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/40">{p.brand} · {p.category}</p>
        <h1 className="mt-1 font-display text-[22px] leading-tight">{p.name}</h1>
        <div className="mt-2 flex items-center gap-2 text-[12px]">
          <span className="rounded bg-green-600/20 px-2 py-0.5 text-green-400">★ {p.rating}</span>
          <span className="text-foreground/50">{p.ratingCount.toLocaleString("en-IN")} ratings</span>
          {p.unit && <span className="text-foreground/50">· {p.unit}</span>}
        </div>

        <div className="mt-3 flex items-end gap-3">
          <span className="font-display text-[30px]">{formatINR(p.price)}</span>
          <span className="pb-1 text-[14px] text-foreground/40 line-through">{formatINR(p.mrp)}</span>
          <span className="pb-1 text-[14px] font-semibold text-red-400">{discountPct(p)}% off</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-foreground/60">
          <span className="text-green-400">{physical ? "In stock" : "Available"}</span>
          <span>{physical ? "🚚 Delivery by tomorrow" : "✅ Instant confirmation"}</span>
          <span>{physical ? (p.price >= 499 ? "Free delivery" : "₹40 delivery") : "Free cancellation*"}</span>
        </div>

        <p className="mt-4 text-[13.5px] leading-relaxed text-foreground/70">{p.desc}</p>

        {p.specs && p.specs.length > 0 && (
          <div className="mt-6">
            <h2 className="font-display text-[17px]">Details</h2>
            <div className="mt-2 overflow-hidden rounded-2xl border border-white/8">
              {p.specs.map((s, i) => (
                <div key={s.label} className={`flex justify-between px-4 py-3 text-[13px] ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                  <span className="text-foreground/50">{s.label}</span><span className="text-foreground/85">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-7 pb-40">
          <h2 className="font-display text-[17px]">More like this</h2>
          <div className="mt-3 -mx-6 overflow-x-auto px-6 no-scrollbar">
            <div className="flex gap-3 pr-2">
              {pool.map((x) => (
                <Link key={x.id} to="/market/$vertical/$productId" params={{ vertical: vid, productId: x.id }} className="w-[130px] shrink-0 overflow-hidden rounded-2xl border border-white/8 bg-surface">
                  <Img src={x.img} alt={x.name} emoji={v.emoji} seed={x.id} className="h-24 w-full object-cover" />
                  <div className="p-2.5">
                    <p className="line-clamp-2 text-[12px] leading-tight text-foreground/85">{x.name}</p>
                    <p className="mt-1 text-[12.5px] font-semibold">{formatINR(x.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[440px] items-center gap-3 border-t border-white/10 bg-background/95 px-5 py-4 backdrop-blur">
        <button onClick={add} className="flex-1 rounded-full border border-gold/40 bg-gold/10 py-3.5 text-center font-medium text-gold">{v.ctaWord}</button>
        <button onClick={() => { add(); navigate({ to: "/cart" }); }} className="flex-1 rounded-full py-3.5 text-center font-medium text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>{physical ? "Buy now" : "Proceed"}</button>
      </div>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-[76px] z-30 mx-auto flex max-w-[440px] justify-center px-5">
          <Link to="/cart" className="w-full rounded-full bg-black/60 px-5 py-2 text-center text-[12px] text-gold backdrop-blur">{cartCount} in cart · {formatINR(cartTotal)} — View cart →</Link>
        </div>
      )}

      <ExploreNudge />
    </Screen>
  );
}
