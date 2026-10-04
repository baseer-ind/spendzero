import { ARCHETYPES } from "@/lib/assessment";
import { useStore } from "@/lib/store";

export function ProfileResult({ onContinue }: { onContinue: () => void }) {
  const { profile } = useStore();
  if (!profile) return null;
  const a = ARCHETYPES[profile.archetype];

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden grain flex flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(120% 55% at 50% 0%, oklch(0.79 0.105 82 / 0.16), transparent 60%)" }}
        />
        <div className="flex-1 overflow-y-auto px-7 pt-14 pb-28">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80 animate-rise">Your pattern</p>
          <h1 className="font-display text-[44px] leading-[1.0] mt-3 text-shimmer-gold italic animate-rise">{a.title}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/80 animate-rise">{a.pattern}</p>

          <Section label="Your strength" body={a.strength} />
          <Section label="Your opportunity" body={a.opportunity} />
          <Section label="How SELFly helps" body={a.help} gold />

          <p className="mt-8 text-[12px] text-foreground/40">
            This is a lens, not a label — it can change as you do. You can retake it anytime.
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-7 pb-10 pt-6 bg-gradient-to-t from-background via-background to-transparent">
          <button
            onClick={onContinue}
            className="h-13 w-full rounded-full py-4 text-center font-medium text-background"
            style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}
          >
            Save my profile
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, body, gold }: { label: string; body: string; gold?: boolean }) {
  return (
    <div className="mt-7 animate-rise">
      <p className={`text-[11px] uppercase tracking-[0.24em] ${gold ? "text-gold" : "text-muted-foreground"}`}>{label}</p>
      <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/85">{body}</p>
    </div>
  );
}
