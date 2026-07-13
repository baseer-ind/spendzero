import { Link } from "react-router-dom";
import { BottomNav, NavBar, Screen, StatusBar } from "../components/Shell";
import futureSelf from "../assets/future-self.jpg";


const DREAMS = [
  { name: "Japan, Cherry Season", pct: 73, total: "₹28,500", saved: "₹20,790", days: "in 4 months" },
  { name: "My Dream Home", pct: 18, total: "₹18,40,000", saved: "₹3,31,200", days: "in 3 years" },
  { name: "The MacBook", pct: 41, total: "₹1,20,000", saved: "₹49,200", days: "in 6 months" },
];

function FutureScreen() {
  return (
    <Screen>
      <StatusBar />
      <NavBar title="My Future" back="/" />

      <div className="relative mx-6 overflow-hidden rounded-3xl">
        <img
          src={futureSelf}
          alt="Future self"
          width={1024}
          height={1024}
          className="h-[440px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="text-[11px] uppercase tracking-[0.32em] text-gold/80 animate-rise">a letter from</p>
          <h1 className="font-display text-[36px] leading-[1.02] mt-2 animate-rise text-balance">
            Your future self,
            <br />
            <span className="text-shimmer-gold italic">four months from now.</span>
          </h1>
        </div>
      </div>

      <div className="mx-6 mt-6 rounded-3xl border border-white/8 bg-surface p-6 animate-rise">
        <p className="font-display text-[16px] leading-relaxed italic text-foreground/80 text-balance">
          "I'm writing this from a small ryokan in Kyoto. The room smells of cedar. It rained today.
          <br /><br />
          You almost ordered sushi last Tuesday. You didn't. That ₹820 paid for the taxi that brought me here.
          <br /><br />
          Thank you for staying."
        </p>
        <p className="mt-5 text-[11px] uppercase tracking-[0.28em] text-gold/70">— You, in April 2027</p>
      </div>

      <div className="px-6 mt-9">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[22px]">Dreams in motion</h2>
          <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/40">3 active</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 px-6">
        {DREAMS.map((d, i) => (
          <div
            key={d.name}
            className="rounded-2xl border border-white/8 bg-surface p-5 animate-rise"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-display text-[17px]">{d.name}</h4>
                <p className="mt-1 text-[11px] text-foreground/45">{d.days}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-[18px] text-gold">{d.pct}%</p>
                <p className="text-[10px] text-foreground/45">{d.saved} / {d.total}</p>
              </div>
            </div>
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${d.pct}%`,
                  background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))",
                }}
              />
            </div>
          </div>
        ))}

        <Link
          to="/"
          className="mt-2 grid h-20 place-items-center rounded-2xl border border-dashed border-white/15 text-[12px] uppercase tracking-[0.22em] text-foreground/50"
        >
          + Add a new dream
        </Link>
      </div>

      <BottomNav active="future" />
    </Screen>
  );
}

export default FutureScreen;
