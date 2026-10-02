import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { NavBar, Screen } from "@/components/Shell";
import { formatINR, useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "One last pause — Project Future" },
      { name: "description", content: "A breath before you decide." },
    ],
  }),
  component: CartScreen,
});

function CartScreen() {
  const { hydrated, cart, cartTotal, cartCount, setCartQty, removeFromCart, activeDream } = useStore();
  const navigate = useNavigate();

  function pauseAndDecide() {
    if (cartCount === 0) return;
    navigate({ to: "/pause", search: { amt: cartTotal, from: "cart" } });
  }

  if (hydrated && cartCount === 0) {
    return (
      <Screen>
        <NavBar title="Your cart" back="/restaurant" />
        <div className="mx-6 mt-16 rounded-3xl border border-white/8 bg-surface p-8 text-center">
          <p className="font-display text-[22px]">Your cart is empty</p>
          <p className="mt-2 text-[13px] text-foreground/55">Browse a craving — then resist it and watch the money move.</p>
          <Link to="/restaurants" className="mt-6 inline-block rounded-full px-6 py-3 text-background font-medium" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
            Browse restaurants
          </Link>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <NavBar title="One Last Pause" back="/restaurant" />

      <div className="px-6 pt-2 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">your cart</p>
        <h1 className="font-display text-[30px] leading-tight mt-2">
          A breath
          <br />
          <span className="text-shimmer-gold">before you decide.</span>
        </h1>
      </div>

      <div className="mt-6 flex flex-col gap-3 px-6">
        {cart.map((it) => (
          <div key={it.id} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-surface p-3">
            {it.image && <img src={it.image} alt={it.name} loading="lazy" className="h-16 w-16 rounded-xl object-cover" />}
            <div className="flex-1">
              <h4 className="font-display text-[15px]">{it.name}</h4>
              <p className="text-[11px] text-foreground/50">{formatINR(it.price)} each</p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/10 px-3 py-1.5 text-sm">
              <button onClick={() => setCartQty(it.id, it.qty - 1)} className="text-foreground/60 w-4" aria-label="Decrease">−</button>
              <span>{it.qty}</span>
              <button onClick={() => setCartQty(it.id, it.qty + 1)} className="text-foreground/90 w-4" aria-label="Increase">+</button>
            </div>
            <button onClick={() => removeFromCart(it.id)} className="w-6 text-right text-foreground/40" aria-label="Remove">✕</button>
          </div>
        ))}
      </div>

      <div className="mx-6 mt-6 overflow-hidden rounded-3xl border border-gold/25 bg-[radial-gradient(circle_at_top,oklch(0.79_0.105_82/0.18),transparent_70%)] p-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold">the mirror</p>
        <p className="mt-3 font-display text-[20px] leading-snug text-balance">
          Spend {formatINR(cartTotal)} now — or move it to{" "}
          <span className="text-gold">{activeDream ? activeDream.name : "your dream"}.</span>
        </p>
      </div>

      <div className="mx-6 mt-5 rounded-2xl bg-surface p-5 text-sm">
        <div className="flex justify-between text-foreground/55"><span>Subtotal</span><span>{formatINR(cartTotal)}</span></div>
        <div className="mt-2 flex justify-between text-foreground/55"><span>Delivery</span><span>Free</span></div>
        <div className="my-3 h-px bg-white/8" />
        <div className="flex items-center justify-between">
          <span className="text-foreground/80">Total</span>
          <span className="font-display text-[20px]">{formatINR(cartTotal)}</span>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-3 pb-10">
        <button
          onClick={pauseAndDecide}
          className="block w-full rounded-full py-4 text-center font-medium text-background"
          style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))", boxShadow: "0 10px 30px -8px oklch(0.79 0.105 82 / 0.4)" }}
        >
          Take a moment before you decide →
        </button>
        <p className="pt-1 text-center text-[11px] text-foreground/40">A short pause, then it's your call — buy it or build your future.</p>
      </div>
    </Screen>
  );
}
