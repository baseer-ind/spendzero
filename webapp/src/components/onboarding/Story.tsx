import { useState } from "react";
import { useStore } from "@/lib/store";
import { onboardingScene } from "@/lib/localImage";
import { SelflyMark } from "@/components/brand/SelflyMark";

/**
 * SELFly first-impression intro — a concise 3-screen story shown BEFORE the
 * assessment. One idea, one visual, one CTA per screen.
 *
 *   1 · THE IDEA          — small choices today shape who you become
 *   2 · THE PROBLEM       — not every craving deserves your money
 *   3 · THE TRANSFORMATION — small pauses compound into a bigger future
 *
 * Spine: "Small choices today. A bigger, brighter tomorrow."
 * Logo meaning: SELF (today) + fly (where your choices take you).
 *
 * Backgrounds are cinematic, offline `onboardingScene` fields. A real photo can
 * be dropped at public/brand/onboarding/selfly-intro-0{1,2,3}.webp and it loads
 * automatically, falling back to the scene on error — no code change needed.
 */

type Panel = {
  photo: string;
  scene: "idea" | "problem" | "future";
  eyebrow?: string;
  title: string;
  body: string;
  cta: string;
};

const PANELS: Panel[] = [
  {
    photo: "/brand/onboarding/selfly-intro-01.webp",
    scene: "idea",
    eyebrow: "Welcome to SELFly",
    title: "Small choices today.",
    body: "Your everyday choices quietly shape the person you're becoming.",
    cta: "See how it works",
  },
  {
    photo: "/brand/onboarding/selfly-intro-02.webp",
    scene: "problem",
    eyebrow: "The moment",
    title: "Not every craving deserves your money.",
    body: "We buy things in the moment and forget them by the weekend. SELFly gives you a moment to pause and decide.",
    cta: "Show me",
  },
  {
    photo: "/brand/onboarding/selfly-intro-03.webp",
    scene: "future",
    eyebrow: "The payoff",
    title: "Turn small pauses into a bigger future.",
    body: "The ₹500 you don't spend today brings a goal you care about a little closer.",
    cta: "Let's begin",
  },
];

export function Story() {
  const { setStorySeen } = useStore();
  const [i, setI] = useState(0);
  const last = i === PANELS.length - 1;
  const p = PANELS[i];

  return (
    <div className="min-h-screen w-full bg-[#0F1419] text-white flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden flex flex-col">
        {/* Cinematic backdrop — real photo if present, generated scene otherwise */}
        <img
          key={i}
          src={p.photo}
          alt=""
          aria-hidden
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallback) return;
            img.dataset.fallback = "1";
            img.src = onboardingScene(p.scene);
          }}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover animate-rise"
        />
        {/* Legibility veil, bottom-weighted so copy always reads */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,20,25,0.25) 0%, rgba(15,20,25,0.05) 34%, rgba(15,20,25,0.55) 64%, rgba(15,20,25,0.94) 88%, #0F1419 100%)",
          }}
        />

        {/* Top bar: brand + progress + skip */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-7">
          <SelflyMark size={22} showSpark={false} />
          <button
            onClick={setStorySeen}
            className="text-[12px] uppercase tracking-[0.2em] text-white/55 hover:text-white/80 transition-colors"
          >
            Skip
          </button>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end px-7 pb-3">
          {p.eyebrow && (
            <p className="text-[11.5px] uppercase tracking-[0.3em] text-[#D9CDBD]/85 animate-rise">
              {p.eyebrow}
            </p>
          )}
          <h1 className="font-display text-[40px] leading-[1.06] mt-3 text-balance text-white animate-rise">
            {p.title}
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-white/75 max-w-[34ch] animate-rise">
            {p.body}
          </p>
        </div>

        <div className="relative z-10 px-7 pb-10 pt-7">
          {/* Progress dots */}
          <div className="mb-6 flex items-center gap-2">
            {PANELS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Go to screen ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === i ? "w-8 bg-[#C9A988]" : "w-2.5 bg-white/20"}`}
              />
            ))}
          </div>
          <button
            onClick={() => (last ? setStorySeen() : setI(i + 1))}
            className="h-14 w-full rounded-full text-center text-[16px] font-semibold text-[#0F1419] shadow-[0_14px_40px_-14px_rgba(201,169,136,0.7)] transition-transform active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #EAD4AF, #C9A988)" }}
          >
            {p.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
