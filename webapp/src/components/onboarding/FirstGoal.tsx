import { useState } from "react";
import { formatINR, useStore } from "@/lib/store";

const EXAMPLES = [
  { emoji: "🏖️", name: "Travel", hint: 50000 },
  { emoji: "🏡", name: "Dream Home", hint: 1000000 },
  { emoji: "🚗", name: "A Car", hint: 300000 },
  { emoji: "👨‍👩‍👧", name: "For my parents", hint: 100000 },
  { emoji: "🛟", name: "Emergency Fund", hint: 100000 },
  { emoji: "🎓", name: "Education", hint: 200000 },
  { emoji: "✨", name: "Personal dream", hint: 50000 },
];

export function FirstGoal() {
  const { addDream } = useStore();
  const [emoji, setEmoji] = useState("🏖️");
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState(false);

  function choose(ex: (typeof EXAMPLES)[number]) {
    setEmoji(ex.emoji);
    setName(ex.name);
    setTarget(String(ex.hint));
    setPicked(true);
    setError(null);
  }

  function create() {
    const amt = parseInt(target.replace(/[^0-9]/g, ""), 10);
    if (!name.trim() || !amt || amt <= 0) {
      setError("Give your goal a name and a target.");
      return;
    }
    addDream({ name, emoji, target: amt });
    // gate falls through to the app once a dream exists
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden grain flex flex-col">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(120% 55% at 50% 0%, oklch(0.79 0.105 82 / 0.12), transparent 60%)" }} />

        <div className="px-7 pt-14">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">The point of all this</p>
          <h1 className="font-display text-[34px] leading-[1.05] mt-3 text-balance">
            What would make saving
            <br />
            <span className="text-shimmer-gold italic">feel worth it?</span>
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-7 pt-7 pb-40">
          {!picked ? (
            <div className="grid grid-cols-2 gap-3">
              {EXAMPLES.map((ex) => (
                <button key={ex.name} onClick={() => choose(ex)} className="rounded-2xl border border-white/10 bg-surface p-4 text-left hover:border-gold/40 transition">
                  <div className="text-[24px]">{ex.emoji}</div>
                  <div className="mt-2 font-display text-[16px]">{ex.name}</div>
                  <div className="mt-0.5 text-[11px] text-foreground/45">e.g. {formatINR(ex.hint)}</div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-[26px]">{emoji}</div>
                <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[16px] outline-none focus:border-gold/50" />
              </div>
              <label className="mt-5 block">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Target amount</span>
                <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-white/5 px-4">
                  <span className="text-foreground/50">₹</span>
                  <input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="numeric" className="w-full bg-transparent px-2 py-3 text-[16px] outline-none" />
                </div>
              </label>
              {target && /^\d+$/.test(target) && (
                <p className="mt-4 rounded-2xl border border-gold/20 bg-gold/5 p-4 font-display text-[18px]">
                  {emoji} {name || "Your goal"} — <span className="text-gold">{formatINR(0)} / {formatINR(parseInt(target, 10))}</span>
                </p>
              )}
              {error && <p className="mt-3 text-[13px] text-destructive">{error}</p>}
              <button onClick={() => setPicked(false)} className="mt-5 text-[13px] text-foreground/50">← pick a different goal</button>
            </div>
          )}
        </div>

        {picked && (
          <div className="absolute inset-x-0 bottom-0 px-7 pb-10 pt-6 bg-gradient-to-t from-background via-background to-transparent">
            <button onClick={create} className="h-13 w-full rounded-full py-4 text-center font-medium text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
              Start building this
            </button>
            <p className="mt-3 text-center text-[12px] text-foreground/45">From now on, the money you choose not to waste moves this forward.</p>
          </div>
        )}
      </div>
    </div>
  );
}
