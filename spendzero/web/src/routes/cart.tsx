import { Link } from "react-router-dom";
import { BottomNav, NavBar, Screen, StatusBar } from "../components/Shell";
import nigiri from "../assets/dish-nigiri.jpg";
import sushi from "../assets/food-sushi.jpg";


function CartScreen() {
  return (
    <Screen>
      <StatusBar />
      <NavBar title="One Last Pause" back="/restaurant" />

      <div className="px-6 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">your cart</p>
        <h1 className="font-display text-[30px] leading-tight mt-2">
          Two plates.
          <br />
          <span className="text-shimmer-gold">Two futures.</span>
        </h1>
      </div>

      {/* Items */}
      <div className="mt-6 flex flex-col gap-3 px-6">
        {[
          { img: nigiri, name: "Anago Nigiri", desc: "2 pieces", price: 420 },
          { img: sushi, name: "Salmon Aburi Set", desc: "1 portion", price: 400 },
        ].map((it, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-surface p-3">
            <img src={it.img} alt={it.name} loading="lazy" width={1024} height={1024} className="h-16 w-16 rounded-xl object-cover" />
            <div className="flex-1">
              <h4 className="font-display text-[15px]">{it.name}</h4>
              <p className="text-[11px] text-foreground/50">{it.desc}</p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/10 px-3 py-1.5 text-sm">
              <button className="text-foreground/50">−</button>
              <span>1</span>
              <button className="text-foreground/80">+</button>
            </div>
            <span className="w-16 text-right font-display text-[15px]">₹{it.price}</span>
          </div>
        ))}
      </div>

      {/* The mirror */}
      <div className="mx-6 mt-6 overflow-hidden rounded-3xl border border-gold/25 bg-[radial-gradient(circle_at_top,oklch(0.79_0.105_82/0.18),transparent_70%)] p-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold">the mirror</p>
        <p className="mt-3 font-display text-[20px] leading-snug text-balance">
          If you pay ₹820 now, your Future Self loses <span className="text-gold">2 days in Tokyo.</span>
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/8 bg-black/30 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/50">tonight</p>
            <p className="mt-2 font-display text-[22px]">₹820</p>
            <p className="text-[11px] text-foreground/45">gone in 28 minutes</p>
          </div>
          <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold/80">in Kyoto</p>
            <p className="mt-2 font-display text-[22px] text-gold">2 days</p>
            <p className="text-[11px] text-foreground/65">walking Gion at dusk</p>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="mx-6 mt-5 rounded-2xl bg-surface p-5 text-sm">
        <div className="flex justify-between text-foreground/55">
          <span>Subtotal</span><span>₹820</span>
        </div>
        <div className="mt-2 flex justify-between text-foreground/55">
          <span>Delivery</span><span>Free</span>
        </div>
        <div className="my-3 h-px bg-white/8" />
        <div className="flex items-center justify-between">
          <span className="text-foreground/80">Total</span>
          <span className="font-display text-[20px]">₹820</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 mt-6 space-y-3">
        <Link
          to="/continue"
          className="block w-full rounded-full py-4 text-center font-medium text-background"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))",
            boxShadow: "0 10px 30px -8px oklch(0.79 0.105 82 / 0.4)",
          }}
        >
          Move ₹820 to Kyoto instead →
        </Link>
        <button className="block w-full rounded-full border border-white/10 bg-white/5 py-4 text-center text-sm text-foreground/70">
          I still want to order
        </button>
        <p className="pt-1 text-center text-[11px] text-foreground/40">
          Either way, your Future Self is paying attention.
        </p>
      </div>

      <BottomNav active="home" />
    </Screen>
  );
}

export default CartScreen;
