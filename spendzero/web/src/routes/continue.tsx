import { Link } from "react-router-dom";
import { Screen, StatusBar } from "../components/Shell";
import journeyBg from "../assets/journey-bg.jpg";


function ContinueScreen() {
  return (
    <Screen>
      <div className="relative overflow-hidden">
        <img
          src={journeyBg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />

        <div className="relative">
          <StatusBar />

          {/* Petals */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="animate-petal absolute block h-1.5 w-1.5 rounded-full bg-gold/70"
                style={{
                  left: `${(i * 13 + 7) % 100}%`,
                  animationDelay: `${i * 1.4}s`,
                  animationDuration: `${10 + (i % 4) * 2}s`,
                }}
              />
            ))}
          </div>

          <div className="px-6 pt-16 pb-10 text-center animate-rise">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full"
              style={{
                background: "radial-gradient(circle, oklch(0.92 0.09 84 / 0.35), transparent 70%)",
              }}
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="oklch(0.79 0.105 82)" strokeWidth="1.2" />
                <path d="M7 12.5l3.5 3.5L17 9" stroke="oklch(0.79 0.105 82)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <p className="mt-8 text-[11px] uppercase tracking-[0.32em] text-gold/80">craving passed</p>
            <h1 className="mt-3 font-display text-[40px] leading-[1.05] text-balance">
              Quiet win.
              <br />
              <span className="text-shimmer-gold">You stayed.</span>
            </h1>
            <p className="mt-5 mx-auto max-w-[280px] text-sm leading-relaxed text-foreground/60">
              That craving you almost fed — it cost nothing. And it bought you something real.
            </p>
          </div>

          <div className="mx-6 rounded-3xl border border-gold/25 bg-black/30 p-6 backdrop-blur-sm">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">moved to Kyoto</p>
                <p className="mt-2 font-display text-[44px] leading-none text-shimmer-gold">+ ₹820</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/40">progress</p>
                <p className="font-display text-[18px] text-foreground/85">73% →</p>
              </div>
            </div>

            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: "73%",
                  background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))",
                }}
              />
            </div>

            <div className="mt-5 flex items-center justify-between text-[11px] text-foreground/55">
              <span>₹20,790 / ₹28,500</span>
              <span className="text-gold/80">2 days closer</span>
            </div>
          </div>

          {/* Whisper */}
          <div className="px-6 mt-10 text-center">
            <p className="font-display italic text-[17px] leading-snug text-foreground/70 text-balance">
              "Your Future Self felt that. They smiled, just now."
            </p>
          </div>

          <div className="px-6 mt-10 space-y-3 pb-16">
            <Link
              to="/journey"
              className="block w-full rounded-full py-4 text-center font-medium text-background"
              style={{
                background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))",
              }}
            >
              Continue my journey
            </Link>
            <Link
              to="/"
              className="block w-full rounded-full border border-white/10 bg-white/5 py-4 text-center text-sm text-foreground/70"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    </Screen>
  );
}

export default ContinueScreen;
