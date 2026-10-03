import { useState } from "react";
import { formatINR, useStore } from "@/lib/store";
import { amountInWords, parseAmount } from "@/lib/money";
import { ImagePicker } from "@/components/ImagePicker";

const EXAMPLES = [
  { emoji: "🛟", name: "Emergency Fund", hint: 100000, kw: "savings safety india" },
  { emoji: "👨‍👩‍👧", name: "Parents' Vacation", hint: 80000, kw: "india family travel" },
  { emoji: "🏍️", name: "New Bike", hint: 150000, kw: "motorcycle india" },
  { emoji: "💍", name: "Wedding", hint: 500000, kw: "indian wedding" },
  { emoji: "🎓", name: "Child's Education", hint: 300000, kw: "india student graduation" },
  { emoji: "🪙", name: "Gold", hint: 100000, kw: "gold jewellery india" },
  { emoji: "🏡", name: "Own Home", hint: 2000000, kw: "india house home" },
  { emoji: "💼", name: "Start a Business", hint: 500000, kw: "india small business shop" },
  { emoji: "🏔️", name: "India Trip", hint: 60000, kw: "himalayas india travel" },
  { emoji: "✨", name: "Personal dream", hint: 50000, kw: "goal dream" },
];

export function FirstGoal() {
  const { addDream } = useStore();
  const [emoji, setEmoji] = useState("🏖️");
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState(false);
  const [kw, setKw] = useState("india dream");
  const [cover, setCover] = useState<string | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);

  function choose(ex: (typeof EXAMPLES)[number]) {
    setEmoji(ex.emoji);
    setName(ex.name);
    setTarget(String(ex.hint));
    setKw(ex.kw);
    setPicked(true);
    setError(null);
  }

  function create() {
    const amt = parseInt(target.replace(/[^0-9]/g, ""), 10);
    if (!name.trim() || !amt || amt <= 0) {
      setError("Give your goal a name and a target.");
      return;
    }
    addDream({ name, emoji, target: amt, cover });
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
                <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-white/5 px-4 focus-within:border-gold/50">
                  <span className="text-foreground/50">₹</span>
                  <input
                    value={parseAmount(target) > 0 ? parseAmount(target).toLocaleString("en-IN") : target.replace(/[^0-9]/g, "")}
                    onChange={(e) => setTarget(e.target.value.replace(/[^0-9]/g, ""))}
                    inputMode="numeric"
                    className="w-full bg-transparent px-2 py-3 text-[16px] outline-none"
                  />
                </div>
                {parseAmount(target) > 0 && <p className="mt-1.5 text-[12px] text-gold/75">{amountInWords(parseAmount(target))}</p>}
              </label>
              <div className="mt-5">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Cover image</span>
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="mt-2 flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 text-left"
                >
                  {cover ? (
                    <img src={cover} alt="" className="h-16 w-20 rounded-xl object-cover" />
                  ) : (
                    <span className="grid h-16 w-20 place-items-center rounded-xl bg-white/5 text-[24px]">{emoji}</span>
                  )}
                  <span className="text-[14px] text-foreground/75">
                    {cover ? "Change cover" : "Add a cover to make it real"}
                    <span className="mt-0.5 block text-[12px] text-foreground/45">Suggested · Search · Your photo</span>
                  </span>
                </button>
              </div>
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

        <ImagePicker
          open={showPicker}
          kind="cover"
          seedKeyword={kw}
          onPick={(url) => setCover(url)}
          onRemove={cover ? () => setCover(undefined) : undefined}
          onClose={() => setShowPicker(false)}
        />
      </div>
    </div>
  );
}
