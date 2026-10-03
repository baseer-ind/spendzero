import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav, NavBar, Screen, StatusBar } from "@/components/Shell";
import { FEEDBACK_TYPES, STATUS_LABEL, localFeedbackStore, type FeedbackType } from "@/lib/feedback";

export const Route = createFileRoute("/feedback")({
  validateSearch: (s: Record<string, unknown>) => ({
    type: typeof s.type === "string" ? s.type : "",
    screen: typeof s.screen === "string" ? s.screen : "",
  }),
  head: () => ({
    meta: [
      { title: "Feedback — SELFly" },
      { name: "description", content: "Tell us what works, what doesn't, and what you'd love next." },
    ],
  }),
  component: FeedbackScreen,
});

function FeedbackScreen() {
  const { type: initialType, screen } = Route.useSearch();
  const [type, setType] = useState<FeedbackType>((initialType as FeedbackType) || "general");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);
  const [tab, setTab] = useState<"send" | "mine">("send");
  const [mine, setMine] = useState(() => localFeedbackStore.list());

  function submit() {
    if (!message.trim()) return;
    localFeedbackStore.add({ type, message: message.trim(), screen: screen || "feedback", contact: contact.trim() || undefined });
    setMessage("");
    setContact("");
    setSent(true);
    setMine(localFeedbackStore.list());
  }

  const visibleMine = mine.filter((m) => m.type !== "micro");

  return (
    <Screen>
      <StatusBar />
      <NavBar title="Feedback" back="/profile" />

      <div className="px-6 pt-2">
        <h1 className="font-display text-[26px]">Help shape SELFly</h1>
        <p className="mt-1 text-[13px] text-foreground/55">Every note is read. No email needed — guest feedback is welcome.</p>
      </div>

      <div className="mt-5 flex gap-2 px-6">
        <TabBtn on={tab === "send"} onClick={() => { setTab("send"); setSent(false); }}>Send feedback</TabBtn>
        <TabBtn on={tab === "mine"} onClick={() => setTab("mine")}>My feedback{visibleMine.length > 0 ? ` (${visibleMine.length})` : ""}</TabBtn>
      </div>

      {tab === "send" && !sent && (
        <div className="px-6 mt-5 pb-10">
          <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/40">What's this about?</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {FEEDBACK_TYPES.map((t) => (
              <button key={t.id} onClick={() => setType(t.id)} className={`flex items-center gap-2 rounded-xl border p-3 text-left text-[13px] ${type === t.id ? "border-gold/50 bg-gold/10 text-gold" : "border-white/10 bg-surface text-foreground/75"}`}>
                <span>{t.emoji}</span><span className="leading-tight">{t.label}</span>
              </button>
            ))}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what happened, what you'd change, or what you'd love to see…"
            rows={5}
            className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] outline-none placeholder:text-foreground/35 focus:border-gold/50"
          />
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email or mobile (optional — only if you want a reply)"
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] outline-none placeholder:text-foreground/35 focus:border-gold/50"
          />

          <button onClick={submit} disabled={!message.trim()} className="mt-5 w-full rounded-full py-4 text-center font-medium text-background disabled:opacity-50" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
            Submit feedback
          </button>
          <p className="mt-3 text-center text-[11px] text-foreground/40">
            Saved on this device for now. When accounts sync, your notes reach the team.
          </p>
        </div>
      )}

      {tab === "send" && sent && (
        <div className="mx-6 mt-8 rounded-3xl border border-gold/25 bg-gold/5 p-8 text-center">
          <div className="text-[34px]">🙏</div>
          <p className="mt-3 font-display text-[22px]">Thank you.</p>
          <p className="mt-1.5 text-[13px] text-foreground/60">Your feedback is saved. It genuinely shapes what we build next.</p>
          <div className="mt-6 flex flex-col gap-3">
            <button onClick={() => setSent(false)} className="rounded-full border border-white/12 bg-white/5 py-3 text-[14px] text-foreground/80">Send another</button>
            <button onClick={() => setTab("mine")} className="rounded-full py-3 font-medium text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>See my feedback</button>
          </div>
        </div>
      )}

      {tab === "mine" && (
        <div className="px-6 mt-5 pb-10">
          {visibleMine.length === 0 ? (
            <div className="rounded-3xl border border-white/8 bg-surface p-8 text-center">
              <div className="text-[30px]">📝</div>
              <p className="mt-3 font-display text-[18px]">You haven't sent feedback yet</p>
              <p className="mt-1 text-[13px] text-foreground/55">When you do, you'll see its status here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleMine.map((m) => (
                <div key={m.id} className="rounded-2xl border border-white/8 bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-foreground/45">{FEEDBACK_TYPES.find((t) => t.id === m.type)?.label ?? m.type}</span>
                    <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] text-foreground/70">{STATUS_LABEL[m.status]}</span>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/80">{m.message}</p>
                  <p className="mt-2 text-[11px] text-foreground/35">{new Date(m.createdAt).toLocaleDateString("en-IN")} · {m.screen}</p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-5 text-center text-[11px] text-foreground/40">We can't promise every idea ships — but every one is read.</p>
        </div>
      )}

      <div className="px-6 mt-2 pb-6 text-center">
        <Link to="/profile" className="text-[12px] text-gold/70">← back to profile</Link>
      </div>

      <BottomNav active="profile" />
    </Screen>
  );
}

function TabBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-4 py-2 text-[13px] ${on ? "bg-gold/15 text-gold ring-1 ring-gold/40" : "bg-white/5 text-foreground/60"}`}>
      {children}
    </button>
  );
}
