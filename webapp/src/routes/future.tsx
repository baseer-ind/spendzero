import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav, NavBar, Screen, StatusBar } from "@/components/Shell";
import futureSelf from "@/assets/future-self.jpg";
import { ImagePicker } from "@/components/ImagePicker";
import { formatINR, useStore } from "@/lib/store";

export const Route = createFileRoute("/future")({
  head: () => ({
    meta: [
      { title: "My Future — Project Future" },
      { name: "description", content: "The dreams you're building, one intentional choice at a time." },
    ],
  }),
  component: FutureScreen,
});

const EMOJIS = ["✨", "🏖️", "🏡", "💻", "🚗", "🎓", "💍", "📷", "✈️", "⌚", "🎸", "🧘"];

function FutureScreen() {
  const { hydrated, dreams, activeDreamId, activeDream, addDream, setActiveDream, setDreamCover } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [cover, setCover] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [editCoverId, setEditCoverId] = useState<string | null>(null);

  function submit() {
    const amt = parseInt(target.replace(/[^0-9]/g, ""), 10);
    if (!name.trim() || !amt || amt <= 0) {
      setError("Give your dream a name and a target amount.");
      return;
    }
    addDream({ name, emoji, target: amt, cover });
    setName("");
    setTarget("");
    setEmoji("✨");
    setCover(undefined);
    setError(null);
    setOpen(false);
  }

  const heroImg = activeDream?.cover || futureSelf;

  return (
    <Screen>
      <StatusBar />
      <NavBar title="My Future" back="/" />

      <div className="relative mx-6 overflow-hidden rounded-3xl">
        <img
          src={heroImg}
          alt="Future self"
          width={1024}
          height={1024}
          className="h-[360px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="text-[11px] uppercase tracking-[0.32em] text-gold/80 animate-rise">
            your future
          </p>
          <h1 className="font-display text-[34px] leading-[1.02] mt-2 animate-rise text-balance">
            Built one
            <br />
            <span className="text-shimmer-gold italic">intentional choice</span> at a time.
          </h1>
        </div>
      </div>

      <div className="px-6 mt-9">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[22px]">Dreams in motion</h2>
          <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/40">
            {hydrated ? `${dreams.length} active` : ""}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 px-6">
        {hydrated && dreams.length === 0 && (
          <div className="rounded-2xl border border-white/8 bg-surface p-6 text-center">
            <p className="font-display text-[18px]">No dreams yet</p>
            <p className="mt-1 text-[13px] text-foreground/55">
              Add the first thing you're saving for.
            </p>
          </div>
        )}

        {dreams.map((d, i) => {
          const pct = Math.min(100, Math.round((d.saved / d.target) * 100));
          const isActive = (activeDreamId ?? dreams[0]?.id) === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setActiveDream(d.id)}
              className={`text-left rounded-2xl border bg-surface p-5 animate-rise transition ${
                isActive ? "border-gold/40" : "border-white/8"
              }`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); setEditCoverId(d.id); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setEditCoverId(d.id); } }}
                    className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/5 text-[22px]"
                  >
                    {d.cover ? <img src={d.cover} alt="" className="h-full w-full object-cover" /> : d.emoji}
                    <span className="absolute bottom-0 right-0 rounded-tl-md bg-black/60 px-1 text-[9px] text-white/90">✎</span>
                  </span>
                  <div>
                    <h4 className="font-display text-[17px]">{d.name}</h4>
                    <p className="mt-1 text-[11px] text-foreground/45">
                      {isActive ? "Active dream" : "Tap to make active"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-[18px] text-gold">{pct}%</p>
                  <p className="text-[10px] text-foreground/45">
                    {formatINR(d.saved)} / {formatINR(d.target)}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))",
                  }}
                />
              </div>
            </button>
          );
        })}

        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="mt-2 grid h-20 place-items-center rounded-2xl border border-dashed border-white/15 text-[12px] uppercase tracking-[0.22em] text-foreground/50 hover:text-gold hover:border-gold/40 transition"
          >
            + Add a new dream
          </button>
        )}

        {open && (
          <div className="mt-2 rounded-2xl border border-gold/25 bg-surface p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold">New dream</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`grid h-10 w-10 place-items-center rounded-xl text-[18px] transition ${
                    emoji === e ? "bg-gold/20 ring-1 ring-gold/50" : "bg-white/5"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What are you saving for?"
              className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] outline-none placeholder:text-foreground/35 focus:border-gold/50"
            />
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              inputMode="numeric"
              placeholder="Target amount (₹)"
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] outline-none placeholder:text-foreground/35 focus:border-gold/50"
            />

            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="mt-3 flex w-full items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-2.5 text-left"
            >
              {cover ? (
                <img src={cover} alt="" className="h-12 w-16 rounded-lg object-cover" />
              ) : (
                <span className="grid h-12 w-16 place-items-center rounded-lg bg-white/5 text-[20px]">{emoji}</span>
              )}
              <span className="text-[13px] text-foreground/70">{cover ? "Change cover" : "Add a cover image"}</span>
            </button>

            {error && <p className="mt-3 text-[12px] text-destructive">{error}</p>}

            <div className="mt-4 flex gap-3">
              <button
                onClick={submit}
                className="flex-1 rounded-full py-3 text-center font-medium text-background"
                style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}
              >
                Create dream
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-foreground/70"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <ImagePicker
        open={showPicker}
        kind="cover"
        seedKeyword={name || "india dream"}
        onPick={(url) => setCover(url)}
        onRemove={cover ? () => setCover(undefined) : undefined}
        onClose={() => setShowPicker(false)}
      />

      <ImagePicker
        open={editCoverId !== null}
        kind="cover"
        seedKeyword={dreams.find((d) => d.id === editCoverId)?.name || "india dream"}
        onPick={(url) => { if (editCoverId) setDreamCover(editCoverId, url); }}
        onRemove={dreams.find((d) => d.id === editCoverId)?.cover ? () => { if (editCoverId) setDreamCover(editCoverId, null); } : undefined}
        onClose={() => setEditCoverId(null)}
      />

      <BottomNav active="future" />
    </Screen>
  );
}
