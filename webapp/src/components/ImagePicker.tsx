import { useEffect, useRef, useState } from "react";
import {
  COVER_PRESETS,
  cropToDataURL,
  curatedCovers,
  fileToDataURL,
  searchImages,
} from "@/lib/images";

type Kind = "cover" | "profile";

/**
 * ImagePicker — choose a dream cover or profile photo.
 *  - cover: Suggested (India-first curated) | Search | Upload | Camera
 *  - profile: Upload | Camera only (never a random stock face), + Remove
 * Uploaded/captured photos go through an on-device cropper (canvas → data URL).
 * Remote curated/search images are used as-is (already sized; avoids tainting canvas).
 */
export function ImagePicker({
  open,
  kind,
  seedKeyword,
  onPick,
  onRemove,
  onClose,
}: {
  open: boolean;
  kind: Kind;
  seedKeyword?: string;
  onPick: (url: string) => void;
  onRemove?: () => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"suggested" | "search" | "upload">(kind === "profile" ? "upload" : "suggested");
  const [query, setQuery] = useState(seedKeyword ?? "");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const suggested = curatedCovers(seedKeyword || "india dream", 6);

  useEffect(() => {
    if (!open) {
      setTab(kind === "profile" ? "upload" : "suggested");
      setCropSrc(null);
      setResults([]);
      setQuery(seedKeyword ?? "");
    }
  }, [open, kind, seedKeyword]);

  if (!open) return null;

  async function runSearch(q: string) {
    setLoading(true);
    try {
      setResults(await searchImages(q, 9));
    } finally {
      setLoading(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data = await fileToDataURL(f);
      setCropSrc(data);
    } catch {
      /* ignore */
    }
    e.target.value = "";
  }

  if (cropSrc) {
    return (
      <Cropper
        src={cropSrc}
        aspect={kind === "profile" ? 1 : 4 / 3}
        onCancel={() => setCropSrc(null)}
        onDone={(url) => {
          onPick(url);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55" onClick={onClose}>
      <div
        className="w-full max-w-[440px] rounded-t-3xl border-t border-white/10 bg-background p-5 pb-8 animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[20px]">{kind === "profile" ? "Profile photo" : "Choose a cover"}</h3>
          {onRemove && (
            <button onClick={() => { onRemove(); onClose(); }} className="text-[13px] text-foreground/55">
              Remove
            </button>
          )}
        </div>

        {kind === "cover" && (
          <div className="mt-4 flex gap-2">
            {(["suggested", "search", "upload"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] capitalize ${
                  tab === t ? "bg-gold/15 text-gold ring-1 ring-gold/40" : "bg-white/5 text-foreground/60"
                }`}
              >
                {t === "upload" ? "Upload / Camera" : t}
              </button>
            ))}
          </div>
        )}

        {kind === "cover" && tab === "suggested" && (
          <>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {COVER_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setQuery(p.kw); setTab("search"); runSearch(p.kw); }}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] text-foreground/70"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Grid urls={suggested} onPick={(u) => { onPick(u); onClose(); }} />
          </>
        )}

        {kind === "cover" && tab === "search" && (
          <>
            <form
              onSubmit={(e) => { e.preventDefault(); runSearch(query); }}
              className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <span className="text-foreground/40">🔍</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search images (e.g. Goa beach, Royal Enfield)…"
                className="w-full bg-transparent text-[15px] outline-none placeholder:text-foreground/35"
              />
              <button type="submit" className="text-[13px] font-medium text-gold">Go</button>
            </form>
            {loading ? (
              <p className="mt-6 text-center text-[13px] text-foreground/50">Searching…</p>
            ) : (
              <Grid urls={results} onPick={(u) => { onPick(u); onClose(); }} empty="Search for an image above." />
            )}
          </>
        )}

        {(kind === "profile" || tab === "upload") && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center"
            >
              <div className="text-[26px]">🖼️</div>
              <div className="mt-2 text-[14px]">Choose from gallery</div>
            </button>
            <button
              onClick={() => camRef.current?.click()}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center"
            >
              <div className="text-[26px]">📷</div>
              <div className="mt-2 text-[14px]">Take a photo</div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
            {kind === "profile" && (
              <p className="col-span-2 mt-1 text-center text-[12px] text-foreground/45">
                Your photo stays on this device. We never use a stranger's face.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Grid({ urls, onPick, empty }: { urls: string[]; onPick: (u: string) => void; empty?: string }) {
  if (urls.length === 0 && empty) {
    return <p className="mt-6 text-center text-[13px] text-foreground/45">{empty}</p>;
  }
  return (
    <div className="mt-4 grid max-h-[46vh] grid-cols-3 gap-2 overflow-y-auto">
      {urls.map((u, i) => (
        <button key={i} onClick={() => onPick(u)} className="overflow-hidden rounded-xl border border-white/8">
          <img src={u} alt="" loading="lazy" className="h-24 w-full object-cover" />
        </button>
      ))}
    </div>
  );
}

function Cropper({
  src,
  aspect,
  onDone,
  onCancel,
}: {
  src: string;
  aspect: number;
  onDone: (url: string) => void;
  onCancel: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [ox, setOx] = useState(0);
  const [oy, setOy] = useState(0);
  const [busy, setBusy] = useState(false);
  const outH = 600;
  const outW = Math.round(outH * aspect);

  async function done() {
    setBusy(true);
    try {
      const url = await cropToDataURL(src, { scale, offsetX: ox, offsetY: oy, outW, outH });
      onDone(url);
    } catch {
      onDone(src); // fall back to the raw image if canvas fails
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70" onClick={onCancel}>
      <div className="w-full max-w-[440px] rounded-t-3xl border-t border-white/10 bg-background p-5 pb-8" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-[20px]">Adjust your photo</h3>
        <div
          className="mx-auto mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black"
          style={{ aspectRatio: String(aspect), maxWidth: "100%" }}
        >
          <img
            src={src}
            alt="crop preview"
            className="h-full w-full object-cover"
            style={{ transform: `scale(${scale}) translate(${ox * 12}%, ${oy * 12}%)` }}
          />
        </div>

        <label className="mt-5 block text-[12px] text-foreground/60">
          Zoom
          <input type="range" min={1} max={3} step={0.05} value={scale} onChange={(e) => setScale(+e.target.value)} className="mt-1 w-full accent-gold" />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-foreground/60">
          <label>Move ↔<input type="range" min={-1} max={1} step={0.05} value={ox} onChange={(e) => setOx(+e.target.value)} className="mt-1 w-full accent-gold" /></label>
          <label>Move ↕<input type="range" min={-1} max={1} step={0.05} value={oy} onChange={(e) => setOy(+e.target.value)} className="mt-1 w-full accent-gold" /></label>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-full border border-white/15 py-3 text-[14px] text-foreground/70">Cancel</button>
          <button onClick={done} disabled={busy} className="flex-1 rounded-full py-3 text-center font-medium text-background disabled:opacity-60" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
            {busy ? "Saving…" : "Use photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
