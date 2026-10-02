import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Screen } from "@/components/Shell";
import { Img } from "@/components/Img";
import { ExploreNudge } from "@/components/ExploreNudge";
import { useBrowseTracking } from "@/lib/tracking";
import { ELECTRONICS_APP, discountPct, product, productsByCategory } from "@/lib/electronics";
import { formatINR, useStore } from "@/lib/store";

export const Route = createFileRoute("/electronics/$productId")({
  head: () => ({ meta: [{ title: "Product — Project Future" }] }),
  component: ProductDetail,
});

function ProductDetail() {
  useBrowseTracking("Electronics", ELECTRONICS_APP.id);
  const { productId } = Route.useParams();
  const p = product(productId);
  const navigate = useNavigate();
  const { addToCart, trackOpen, trackCartExplore, toggleWish, inWishlist, cartCount, cartTotal } = useStore();
  const [variant, setVariant] = useState(0);
  const [hero, setHero] = useState(0);

  useEffect(() => { if (p) trackOpen(); }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) {
    return (
      <Screen>
        <div className="mx-6 mt-24 text-center text-foreground/60">Product not found. <Link to="/electronics" className="text-gold">Back to TechBazaar</Link></div>
      </Screen>
    );
  }

  const wished = inWishlist(p.id);
  const vLabel = p.variants ? ` · ${p.variants.options[variant]}` : "";
  const images = [p.img, ...p.gallery];

  function add() {
    if (!p) return;
    const item = { id: p.id + (p.variants ? `-${variant}` : ""), name: p.name + vLabel, price: p.price, image: p.img, vertical: "Electronics" };
    addToCart(item);
    trackCartExplore(p.price);
  }

  return (
    <Screen>
      {/* gallery */}
      <div className="relative">
        <Img src={images[hero]} alt={p.name} emoji="📦" seed={p.id + hero} className="h-[320px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />
        <Link to="/electronics" aria-label="Back" className="absolute left-5 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </Link>
        <button onClick={() => toggleWish({ id: p.id, name: p.name, price: p.price, image: p.img, vertical: "Electronics" })} aria-label="Wishlist" className="absolute right-5 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/45 backdrop-blur">
          <span className={wished ? "text-red-400" : "text-white"}>{wished ? "♥" : "♡"}</span>
        </button>
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((_, i) => <button key={i} onClick={() => setHero(i)} className={`h-1.5 rounded-full transition-all ${i === hero ? "w-5 bg-gold" : "w-1.5 bg-white/40"}`} aria-label={`Image ${i + 1}`} />)}
          </div>
        )}
      </div>

      <div className="px-6 pt-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/40">{p.brand} · {p.category}</p>
        <h1 className="mt-1 font-display text-[22px] leading-tight">{p.name}</h1>
        <div className="mt-2 flex items-center gap-2 text-[12px]">
          <span className="rounded bg-green-600/20 px-2 py-0.5 text-green-400">★ {p.rating}</span>
          <span className="text-foreground/50">{p.ratingCount.toLocaleString("en-IN")} ratings</span>
        </div>

        <div className="mt-3 flex items-end gap-3">
          <span className="font-display text-[30px]">{formatINR(p.price)}</span>
          <span className="pb-1 text-[14px] text-foreground/40 line-through">{formatINR(p.mrp)}</span>
          <span className="pb-1 text-[14px] font-semibold text-red-400">{discountPct(p)}% off</span>
        </div>

        {p.stockLeft != null && p.stockLeft <= 5 && (
          <p className="mt-2 inline-block rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 text-[12px] text-red-300">⏳ Only {p.stockLeft} left — selling fast</p>
        )}
        {p.bankOffer && (
          <div className="mt-3 rounded-xl border border-gold/25 bg-gold/5 px-3 py-2 text-[12.5px] text-gold">🏦 {p.bankOffer}</div>
        )}

        {/* availability + delivery */}
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-foreground/60">
          <span>{p.stockLeft && p.stockLeft > 0 ? <span className="text-green-400">In stock</span> : <span className="text-red-400">Out of stock</span>}</span>
          <span>🚚 Delivery by tomorrow</span>
          <span>{p.price >= 499 ? "Free delivery" : "₹40 delivery"}</span>
          <span>↩️ 7-day replacement</span>
        </div>

        <p className="mt-4 text-[13.5px] leading-relaxed text-foreground/70">{p.desc}</p>

        {/* variants */}
        {p.variants && (
          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/40">{p.variants.label}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.variants.options.map((o, i) => (
                <button key={o} onClick={() => setVariant(i)} className={`rounded-xl border px-3.5 py-2 text-[13px] ${i === variant ? "border-gold/50 bg-gold/10 text-gold" : "border-white/10 text-foreground/70"}`}>{o}</button>
              ))}
            </div>
          </div>
        )}

        {/* specs */}
        <div className="mt-6">
          <h2 className="font-display text-[17px]">Specifications</h2>
          <div className="mt-2 overflow-hidden rounded-2xl border border-white/8">
            {p.specs.map((s, i) => (
              <div key={s.label} className={`flex justify-between px-4 py-3 text-[13px] ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                <span className="text-foreground/50">{s.label}</span>
                <span className="text-foreground/85">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* recommendations */}
        {(() => {
          const similar = productsByCategory(p.category).filter((x) => x.id !== p.id).slice(0, 6);
          const pool = similar.length > 0 ? similar : productsByCategory(null).filter((x) => x.id !== p.id).slice(0, 6);
          return (
            <div className="mt-7">
              <h2 className="font-display text-[17px]">More like this</h2>
              <div className="mt-3 -mx-6 overflow-x-auto px-6 no-scrollbar">
                <div className="flex gap-3 pr-2">
                  {pool.map((x) => (
                    <Link key={x.id} to="/electronics/$productId" params={{ productId: x.id }} className="w-[130px] shrink-0 overflow-hidden rounded-2xl border border-white/8 bg-surface">
                      <Img src={x.img} alt={x.name} emoji="📦" seed={x.id} className="h-24 w-full object-cover" />
                      <div className="p-2.5">
                        <p className="line-clamp-2 text-[12px] leading-tight text-foreground/85">{x.name}</p>
                        <p className="mt-1 text-[12.5px] font-semibold">{formatINR(x.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* reviews */}
        <div className="mt-6 pb-40">
          <h2 className="font-display text-[17px]">Reviews</h2>
          <div className="mt-2 flex flex-col gap-3">
            {p.reviews.map((r, i) => (
              <div key={i} className="rounded-2xl border border-white/8 bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-foreground/85">{r.user}</span>
                  <span className="text-[12px] text-gold">{"★".repeat(r.stars)}<span className="text-foreground/20">{"★".repeat(5 - r.stars)}</span></span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/65">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* sticky actions */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[440px] items-center gap-3 border-t border-white/10 bg-background/95 px-5 py-4 backdrop-blur">
        <button onClick={add} className="flex-1 rounded-full border border-gold/40 bg-gold/10 py-3.5 text-center font-medium text-gold">Add to cart</button>
        <button onClick={() => { add(); navigate({ to: "/cart" }); }} className="flex-1 rounded-full py-3.5 text-center font-medium text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>Buy now</button>
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
