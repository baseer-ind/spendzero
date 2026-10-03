import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav, NavBar, Screen, StatusBar } from "@/components/Shell";
import futureSelf from "@/assets/future-self.jpg";
import { ImagePicker } from "@/components/ImagePicker";
import { formatINR, useStore, type Dream } from "@/lib/store";
import { amountInWords, parseAmount } from "@/lib/money";

export const Route = createFileRoute("/future")({
  head: () => ({
    meta: [
      { title: "My Future — SELFly" },
      { name: "description", content: "The dreams you're building, one intentional choice at a time." },
    ],
  }),
  component: FutureScreen,
});

const EMOJIS = ["✨", "🏖️", "🏡", "💻", "🚗", "🎓", "💍", "📷", "✈️", "⌚", "🎸", "🧘", "🏍️", "🪙", "💼", "🛟"];

function AmountField({ value, onChange }: { value: string; onChange: (raw: string) => void }) {
  const n = parseAmount(value);
  const display = n > 0 ? n.toLocaleString("en-IN") : value.replace(/[^0-9]/g, "");
  return (
    <div className="mt-3">
      <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 focus-within:border-gold/50">
        <span className="text-foreground/50">₹</span>
        <input
          value={display}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          placeholder="Target amount"
          className="w-full bg-transparent px-2 py-3 text-[15px] outline-none placeholder:text-foreground/35"
        />
      </div>
      {n > 0 && <p className="mt-1.5 text-[12px] text-gold/75">{amountInWords(n)}</p>}
    </div>
  );
}

type FormInit = { name: string; emoji: string; target: string; cover?: string };

function DreamForm({
  title,
  init,
  onSave,
  onCancel,
  onDelete,
}: {
  title: string;
  init: FormInit;
  onSave: (d: { name: string; emoji: string; target: number; cover?: string; coverTouched: boolean }) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const { imageFor } = useStore();
  const [name, setName] = useState(init.name);
  const [emoji, setEmoji] = useState(init.emoji);
  const [target, setTarget] = useState(init.target);
  const [cover, setCover] = useState<string | undefined>(init.cover);
  const [coverTouched, setCoverTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const coverSrc = cover ? (cover.startsWith("u_") ? imageFor(cover) : cover) : undefined;

  function save() {
    const amt = parseAmount(target);
    if (!name.trim()) return setError("Give your dream a name.");
    if (!amt) return setError("Enter a target amount.");
    onSave({ name, emoji, target: amt, cover, coverTouched });
  }

  return (
    <div className="mt-2 rounded-2xl border border-gold/25 bg-surface p-5">
      <p className="text-[11px] uppercase tracking-[0.24em] text-gold">{title}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {EMOJIS.map((e) => (
          <button key={e} onClick={() => setEmoji(e)} className={`grid h-10 w-10 place-items-center rounded-xl text-[18px] transition ${emoji === e ? "bg-gold/20 ring-1 ring-gold/50" : "bg-white/5"}`}>{e}</button>
        ))}
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="What are you saving for?"
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] outline-none placeholder:text-foreground/35 focus:border-gold/50"
      />

      <AmountField value={target} onChange={setTarget} />

      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className="mt-3 flex w-full items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-2.5 text-left"
      >
        {coverSrc ? (
          <img src={coverSrc} alt="" className="h-12 w-16 rounded-lg object-cover" />
        ) : (
          <span className="grid h-12 w-16 place-items-center rounded-lg bg-white/5 text-[20px]">{emoji}</span>
        )}
        <span className="text-[13px] text-foreground/70">{coverSrc ? "Change cover" : "Add a cover image"}</span>
      </button>

      {error && <p className="mt-3 text-[12px] text-destructive">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button onClick={save} className="flex-1 rounded-full py-3 text-center font-medium text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
          Save
        </button>
        <button onClick={onCancel} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-foreground/70">Cancel</button>
      </div>

      {onDelete && (
        <button onClick={onDelete} className="mt-3 w-full text-center text-[13px] text-destructive/80">Delete this dream</button>
      )}

      <ImagePicker
        open={showPicker}
        kind="cover"
        seedKeyword={name || "india dream"}
        onPick={(url) => { setCover(url); setCoverTouched(true); }}
        onRemove={cover ? () => { setCover(undefined); setCoverTouched(true); } : undefined}
        onClose={() => setShowPicker(false)}
      />
    </div>
  );
}

function FutureScreen() {
  const { hydrated, dreams, activeDreamId, activeDream, addDream, updateDream, deleteDream, setActiveDream, imageFor } = useStore();
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Dream | null>(null);

  const heroImg = imageFor(activeDream?.cover) || futureSelf;
  const editing = dreams.find((d) => d.id === editId) || null;

  return (
    <Screen>
      <StatusBar />
      <NavBar title="My Future" back="/" />

      <div className="relative mx-6 overflow-hidden rounded-3xl">
        <img src={heroImg} alt="Future self" className="h-[360px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="text-[11px] uppercase tracking-[0.32em] text-gold/80 animate-rise">your future</p>
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
          <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/40">{hydrated ? `${dreams.length} active` : ""}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 px-6">
        {hydrated && dreams.length === 0 && !creating && (
          <div className="rounded-2xl border border-white/8 bg-surface p-6 text-center">
            <p className="font-display text-[18px]">Give your money somewhere meaningful to go</p>
            <p className="mt-1 text-[13px] text-foreground/55">Add the first thing you're saving for.</p>
          </div>
        )}

        {dreams.map((d, i) => {
          if (editId === d.id) {
            return (
              <DreamForm
                key={d.id}
                title="Edit dream"
                init={{ name: d.name, emoji: d.emoji, target: String(d.target), cover: d.cover }}
                onSave={({ name, emoji, target, cover, coverTouched }) => {
                  updateDream(d.id, { name, emoji, target, cover: coverTouched ? (cover ?? null) : undefined });
                  setEditId(null);
                }}
                onCancel={() => setEditId(null)}
                onDelete={() => { setEditId(null); setConfirmDelete(d); }}
              />
            );
          }
          const pct = Math.min(100, Math.round((d.saved / d.target) * 100));
          const isActive = (activeDreamId ?? dreams[0]?.id) === d.id;
          const cover = imageFor(d.cover);
          return (
            <div key={d.id} className={`rounded-2xl border bg-surface p-5 animate-rise transition ${isActive ? "border-gold/40" : "border-white/8"}`} style={{ animationDelay: `${i * 70}ms` }}>
              <button onClick={() => setActiveDream(d.id)} className="w-full text-left">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/5 text-[22px]">
                      {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : d.emoji}
                    </span>
                    <div>
                      <h4 className="font-display text-[17px]">{d.name}</h4>
                      <p className="mt-1 text-[11px] text-foreground/45">{isActive ? "Active dream" : "Tap to make active"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-[18px] text-gold">{pct}%</p>
                    <p className="text-[10px] text-foreground/45">{formatINR(d.saved)} / {formatINR(d.target)}</p>
                  </div>
                </div>
                <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.92 0.09 84))" }} />
                </div>
              </button>
              <div className="mt-3 flex items-center gap-4 border-t border-white/5 pt-3">
                <button onClick={() => setEditId(d.id)} className="text-[12px] text-foreground/60 hover:text-gold">✎ Edit</button>
                <button onClick={() => setConfirmDelete(d)} className="text-[12px] text-foreground/45 hover:text-destructive">🗑 Delete</button>
              </div>
            </div>
          );
        })}

        {!creating && editId === null && (
          <button onClick={() => setCreating(true)} className="mt-2 grid h-20 place-items-center rounded-2xl border border-dashed border-white/15 text-[12px] uppercase tracking-[0.22em] text-foreground/50 hover:text-gold hover:border-gold/40 transition">
            + Add a new dream
          </button>
        )}

        {creating && (
          <DreamForm
            title="New dream"
            init={{ name: "", emoji: "✨", target: "" }}
            onSave={({ name, emoji, target, cover }) => { addDream({ name, emoji, target, cover }); setCreating(false); }}
            onCancel={() => setCreating(false)}
          />
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-[440px] rounded-t-3xl border-t border-white/10 bg-background p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-[20px]">Delete "{confirmDelete.name}"?</h3>
            <p className="mt-2 text-[13px] text-foreground/60">
              This removes it from your active goals — it won't appear on Home, the Decision Moment, or your Future. The {formatINR(confirmDelete.saved)} you've already redirected stays counted in your journey.
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-full border border-white/15 py-3 text-[14px] text-foreground/75">Keep it</button>
              <button onClick={() => { deleteDream(confirmDelete.id); setConfirmDelete(null); }} className="flex-1 rounded-full bg-destructive py-3 text-[14px] font-medium text-white">Delete dream</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="future" />
    </Screen>
  );
}
