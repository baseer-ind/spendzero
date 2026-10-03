import { useState } from "react";
import { useStore } from "@/lib/store";
import { scenicArt } from "@/lib/localImage";

/**
 * SELFly first-impression intro — a concise 3-screen story shown BEFORE the
 * assessment/onboarding. One idea, one visual, one CTA per screen.
 *
 *   1 · THE IDEA         — small choices today shape who you become
 *   2 · THE PROBLEM      — not every craving deserves your money
 *   3 · THE TRANSFORMATION — small pauses compound into a bigger future
 *
 * Emotional spine: "Small choices today. A bigger, brighter tomorrow."
 * Logo meaning: SELF (where you are today) + FLY (where your choices take you).
 *
 * Visuals use the offline, on-brand `scenicArt` field (Midnight → Charcoal with
 * a champagne glow and a rising path). A real photo can be dropped in later at
 * public/brand/onboarding/selfly-intro-0{1,2,3}.webp — the <img> loads that file
 * when present and falls back to scenicArt on error, so no code change is needed.
 */

type Panel = {
  photo: string;
  seed: string;
  logo: "wordmark" | "symbol";
  eyebrow?: string;
  title: string;
  body: string;
  cta: string;
};

const PANELS: Panel[] = [
  {
    photo: "/brand/onboarding/selfly-intro-01.webp",
    seed: "selfly-idea",
    logo: "wordmark",
    title: "Small choices today.",
    body: "Your everyday choices quietly shape the person you're becoming.",
    cta: "See how it works",
  },
  {
    photo: "/brand/onboarding/selfly-intro-02.webp",
    seed: "selfly-problem",
    logo: "symbol",
    eyebrow: "The moment",
    title: "Not every craving deserves your money.",
    body: "We buy things in the moment and forget them by the weekend. SELFly gives you a moment to pause and decide.",
    cta: "Show me",
  },
  {
    photo: "/brand/onboarding/selfly-intro-03.webp",
    seed: "selfly-future",
    logo: "symbol",
    eyebrow: "The payoff",
    title: "Turn small pauses into a bigger future.",
    body: "The ₹500 you don't spend today brings a goal you care about a little closer. Choose for your future self.",
    cta: "Let's begin",
  },
];

export function Story() {
  const { setStorySeen } = useStore();
  const [i, setI] = useState(0);
  const last = i === PANELS.length - 1;
  const p = PANELS[i];

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden flex flex-col">
        {/* Cinematic brand backdrop — real photo if present, scenicArt otherwise */}
        <img
          key={i}
          src={p.photo}
          alt=""
          aria-hidden
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallback) return;
            img.dataset.fallback = "1";
            img.src = scenicArt(p.seed);
          }}
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover animate-rise"
        />
        {/* Legibility veil, bottom-weighted so copy always reads */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,20,25,0.35) 0%, rgba(15,20,25,0.15) 32%, rgba(15,20,25,0.72) 72%, rgba(15,20,25,0.96) 100%)",
          }}
        />

        <div className="flex items-center justify-between px-6 pt-7">
          <div className="flex gap-1.5">
            {PANELS.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${idx === i ? "w-7 bg-[#C9A988]" : "w-2.5 bg-white/25"}`}
              />
            ))}
          </div>
          <button
            onClick={setStorySeen}
            className="text-[12px] uppercase tracking-[0.18em] text-white/55"
          >
            Skip
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-end px-7 pb-2">
          {p.logo === "wordmark" ? (
            <img
              src="/brand/selfly-wordmark.png"
              alt="SELFly"
              className="h-9 w-auto object-contain self-start mb-6 animate-rise"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <img
              src="/brand/selfly-symbol-white.png"
              alt="SELFly"
              className="h-9 w-9 object-contain self-start mb-5 animate-rise"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          {p.eyebrow && (
            <p className="text-[12px] uppercase tracking-[0.28em] text-[#D9CDBD]/80 animate-rise">
              {p.eyebrow}
            </p>
          )}
          <h1 className="font-display text-[38px] leading-[1.08] mt-3 text-balance text-white animate-rise">
            {p.title}
          </h1>
          <p className="mt-5 text-[15.5px] leading-relaxed text-white/75 max-w-[34ch] animate-rise">
            {p.body}
          </p>
        </div>

        <div className="px-7 pb-10 pt-6">
          <button
            onClick={() => (last ? setStorySeen() : setI(i + 1))}
            className="h-13 w-full rounded-full py-4 text-center font-medium text-[#0F1419]"
            style={{ background: "linear-gradient(135deg, #E3CBA5, #C9A988)" }}
          >
            {p.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
