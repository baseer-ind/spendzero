import { createFileRoute, Link } from "@tanstack/react-router";
import { NavBar, Screen } from "@/components/Shell";
import { Img } from "@/components/Img";
import { formatINR, useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Project Future" }] }),
  component: WishlistScreen,
});

function WishlistScreen() {
  const { hydrated, wishlist, toggleWish, addToCart, trackCartExplore } = useStore();

  return (
    <Screen>
      <NavBar title="Wishlist" back="/electronics" />

      <div className="px-6 pt-2">
        <h1 className="font-display text-[26px]">Saved for later</h1>
        <p className="mt-1 text-[13px] text-foreground/55">Things you wanted to remember — no pressure to buy.</p>
      </div>

      {hydrated && wishlist.length === 0 ? (
        <div className="mx-6 mt-10 rounded-3xl border border-white/8 bg-surface p-8 text-center">
          <div className="text-[34px]">🤍</div>
          <p className="mt-3 font-display text-[20px]">Nothing saved yet</p>
          <p className="mt-1.5 text-[13px] text-foreground/55">Tap the heart on anything you want to remember.</p>
          <Link to="/electronics" className="mt-6 inline-block rounded-full px-6 py-3 text-background font-medium" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
            Browse TechBazaar
          </Link>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-3 px-6 pb-10">
          {wishlist.map((w) => (
            <div key={w.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-surface p-3">
              <Link to="/electronics/$productId" params={{ productId: w.id }} className="shrink-0">
                <Img src={w.image || ""} alt={w.name} emoji="📦" seed={w.id} className="h-16 w-16 rounded-xl object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to="/electronics/$productId" params={{ productId: w.id }}>
                  <h4 className="line-clamp-2 text-[14px] leading-tight text-foreground/90">{w.name}</h4>
                </Link>
                <p className="mt-1 text-[13px] font-semibold">{formatINR(w.price)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => toggleWish(w)} aria-label="Remove" className="text-[12px] text-foreground/45">Remove</button>
                <button
                  onClick={() => { addToCart({ id: w.id, name: w.name, price: w.price, image: w.image, vertical: w.vertical }); trackCartExplore(w.price); }}
                  className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-[12px] text-gold"
                >
                  Add to cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
}
