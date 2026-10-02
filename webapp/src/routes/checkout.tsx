import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { NavBar, Screen } from "@/components/Shell";
import { formatINR, useStore, type Address } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Project Future" },
      { name: "description", content: "Review your order before you decide." },
    ],
  }),
  component: CheckoutScreen,
});

const STATES = [
  "Telangana", "Andhra Pradesh", "Karnataka", "Maharashtra", "Tamil Nadu",
  "Delhi", "Uttar Pradesh", "Gujarat", "West Bengal", "Kerala", "Rajasthan",
  "Madhya Pradesh", "Punjab", "Haryana", "Bihar", "Odisha", "Other",
];

type Pay = "upi" | "card" | "netbanking" | "cod";
const PAYMENTS: { id: Pay; label: string; note: string; icon: string }[] = [
  { id: "upi", label: "UPI", note: "Approve in your UPI app", icon: "🟣" },
  { id: "card", label: "Credit / Debit Card", note: "Visa, RuPay, Mastercard", icon: "💳" },
  { id: "netbanking", label: "Net Banking", note: "All major Indian banks", icon: "🏦" },
  { id: "cod", label: "Cash on Delivery", note: "Pay when it arrives", icon: "💵" },
];

function CheckoutScreen() {
  const { hydrated, cart, cartTotal, cartCount, address, saveAddress, account } = useStore();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(!address);
  const [pay, setPay] = useState<Pay>("upi");
  const [form, setForm] = useState<Address>(
    address ?? {
      name: account?.name ?? "",
      phone: "",
      flat: "",
      area: "",
      landmark: "",
      city: "Hyderabad",
      state: "Telangana",
      pin: "",
    },
  );
  const [error, setError] = useState<string | null>(null);

  const deliveryFee = cartTotal >= 199 ? 0 : 29;
  const gst = Math.round(cartTotal * 0.05); // 5% GST on restaurant food
  const payable = cartTotal + deliveryFee + gst;

  if (hydrated && cartCount === 0) {
    return (
      <Screen>
        <NavBar title="Checkout" back="/cart" />
        <div className="mx-6 mt-16 rounded-3xl border border-white/8 bg-surface p-8 text-center">
          <p className="font-display text-[22px]">Nothing to check out</p>
          <Link to="/today" className="mt-6 inline-block rounded-full px-6 py-3 text-background font-medium" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
            Explore today
          </Link>
        </div>
      </Screen>
    );
  }

  function set<K extends keyof Address>(k: K, v: Address[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function saveAddr() {
    if (!form.name.trim()) return setError("Add a name for delivery.");
    if (!/^\d{10}$/.test(form.phone.trim())) return setError("Enter a 10-digit mobile number.");
    if (!form.flat.trim() || !form.area.trim()) return setError("Add your flat and area.");
    if (!/^\d{6}$/.test(form.pin.trim())) return setError("Enter a valid 6-digit PIN Code.");
    saveAddress({ ...form, name: form.name.trim(), phone: form.phone.trim(), pin: form.pin.trim() });
    setError(null);
    setEditing(false);
  }

  function placeOrder() {
    if (!address && editing) {
      setError("Add a delivery address first.");
      return;
    }
    // The moment of commitment IS the intervention point.
    navigate({ to: "/pause", search: { amt: payable, from: "checkout", cat: "Food" } });
  }

  const field = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] outline-none placeholder:text-foreground/35 focus:border-gold/50";

  return (
    <Screen>
      <NavBar title="Checkout" back="/cart" />

      {/* Delivery address */}
      <div className="mx-6 mt-3">
        <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/45">Deliver to</p>
        {address && !editing ? (
          <div className="mt-2 flex items-start justify-between rounded-2xl border border-white/8 bg-surface p-4">
            <div>
              <p className="font-display text-[15px]">{address.name} · {address.phone}</p>
              <p className="mt-1 text-[13px] text-foreground/60">
                {address.flat}, {address.area}{address.landmark ? `, near ${address.landmark}` : ""}
              </p>
              <p className="text-[13px] text-foreground/60">{address.city}, {address.state} — {address.pin}</p>
            </div>
            <button onClick={() => setEditing(true)} className="text-[12px] text-gold">Change</button>
          </div>
        ) : (
          <div className="mt-2 rounded-2xl border border-white/8 bg-surface p-4">
            <div className="grid grid-cols-2 gap-3">
              <input className={field} placeholder="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} />
              <input className={field} placeholder="Mobile number" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} />
            </div>
            <input className={`${field} mt-3`} placeholder="Flat / House no / Building" value={form.flat} onChange={(e) => set("flat", e.target.value)} />
            <input className={`${field} mt-3`} placeholder="Area / Street / Sector" value={form.area} onChange={(e) => set("area", e.target.value)} />
            <input className={`${field} mt-3`} placeholder="Landmark (optional)" value={form.landmark} onChange={(e) => set("landmark", e.target.value)} />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input className={field} placeholder="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
              <input className={field} placeholder="PIN Code" inputMode="numeric" maxLength={6} value={form.pin} onChange={(e) => set("pin", e.target.value.replace(/\D/g, ""))} />
            </div>
            <select className={`${field} mt-3`} value={form.state} onChange={(e) => set("state", e.target.value)}>
              {STATES.map((s) => <option key={s} value={s} className="bg-surface">{s}</option>)}
            </select>
            {error && <p className="mt-3 text-[12px] text-destructive">{error}</p>}
            <button onClick={saveAddr} className="mt-4 w-full rounded-full py-3 text-center font-medium text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
              Save address
            </button>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="mx-6 mt-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/45">{cartCount} item{cartCount === 1 ? "" : "s"}</p>
        <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-white/8 bg-surface p-4">
          {cart.map((it) => (
            <div key={it.id} className="flex items-center justify-between text-[14px]">
              <span className="text-foreground/80">{it.qty} × {it.name}</span>
              <span className="text-foreground/60">{formatINR(it.price * it.qty)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment method (simulation only) */}
      <div className="mx-6 mt-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/45">Payment method</p>
        <div className="mt-2 flex flex-col gap-2">
          {PAYMENTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPay(p.id)}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${pay === p.id ? "border-gold/50 bg-gold/5" : "border-white/8 bg-surface"}`}
            >
              <span className="text-[20px]">{p.icon}</span>
              <span className="flex-1">
                <span className="block text-[14px] text-foreground/85">{p.label}</span>
                <span className="block text-[12px] text-foreground/45">{p.note}</span>
              </span>
              <span className={`grid h-5 w-5 place-items-center rounded-full border ${pay === p.id ? "border-gold bg-gold/20 text-gold" : "border-white/20"}`}>{pay === p.id ? "✓" : ""}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-foreground/40">This is a safe simulation — no real payment is taken and no card details are stored.</p>
      </div>

      {/* Bill */}
      <div className="mx-6 mt-6 rounded-2xl bg-surface p-5 text-sm">
        <div className="flex justify-between text-foreground/55"><span>Item total</span><span>{formatINR(cartTotal)}</span></div>
        <div className="mt-2 flex justify-between text-foreground/55"><span>Delivery fee</span><span>{deliveryFee === 0 ? "FREE" : formatINR(deliveryFee)}</span></div>
        <div className="mt-2 flex justify-between text-foreground/55"><span>GST (5%)</span><span>{formatINR(gst)}</span></div>
        <div className="my-3 h-px bg-white/8" />
        <div className="flex items-center justify-between">
          <span className="text-foreground/80">To pay</span>
          <span className="font-display text-[20px]">{formatINR(payable)}</span>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-3 pb-10">
        <button
          onClick={placeOrder}
          className="block w-full rounded-full py-4 text-center font-medium text-background"
          style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))", boxShadow: "0 10px 30px -8px oklch(0.79 0.105 82 / 0.4)" }}
        >
          Place order · {formatINR(payable)}
        </button>
        <p className="pt-1 text-center text-[11px] text-foreground/40">One breath before it's confirmed — then it's your call.</p>
      </div>
    </Screen>
  );
}
