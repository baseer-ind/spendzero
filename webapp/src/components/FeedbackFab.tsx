import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { localFeedbackStore } from "@/lib/feedback";

/**
 * Small, unobtrusive feedback control shown across the app once onboarded.
 * Default: a quiet circular speech-bubble icon in the lower-right (no text, does
 * not cover content). Tap: a polished bottom sheet with a textarea + Send. After
 * sending/closing it returns to just the icon. Hidden on the decision moment.
 */
export function FeedbackFab() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const hidden = /^\/(pause|continue)/.test(pathname);
  if (hidden) return null;

  function send() {
    if (!msg.trim()) return;
    try {
      localFeedbackStore.add({ type: "general", message: msg.trim(), screen: pathname });
    } catch { /* non-fatal */ }
    setSent(true);
    setMsg("");
    setTimeout(() => { setOpen(false); setSent(false); }, 1200);
  }

  return (
    <>
      {/* quiet circular launcher */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed right-4 z-30 grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-[oklch(0.16_0.008_260/0.75)] text-[#D9CDBD] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-transform active:scale-90"
        style={{ bottom: "calc(104px + env(safe-area-inset-bottom, 0px))" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M21 11.5a8.38 8.38 0 01-8.5 8.5 9.5 9.5 0 01-3.8-.8L3 21l1.8-5.2A8.38 8.38 0 014 11.5 8.5 8.5 0 0112.5 3 8.38 8.38 0 0121 11.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Send feedback">
          <button aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
          <div
            className="relative z-10 w-full max-w-[440px] rounded-t-[28px] border-t border-white/10 bg-surface px-6 pt-5 animate-rise"
            style={{ paddingBottom: "calc(28px + env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
            {sent ? (
              <div className="py-8 text-center">
                <p className="font-display text-[22px]">Thank you 🙏</p>
                <p className="mt-2 text-[14px] text-foreground/60">Your note helps shape SELFly.</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-[22px]">Help us make SELFly better</h2>
                <p className="mt-1.5 text-[13.5px] text-foreground/55">What's working, what's not, or what you'd love next?</p>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  rows={4}
                  autoFocus
                  placeholder="Tell us anything…"
                  className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] outline-none placeholder:text-foreground/30 focus:border-gold/50"
                />
                <div className="mt-4 flex items-center gap-3">
                  <button onClick={() => setOpen(false)} className="flex-1 rounded-full border border-white/10 bg-white/5 py-3.5 text-[14px] text-foreground/70">
                    Close
                  </button>
                  <button
                    onClick={send}
                    disabled={!msg.trim()}
                    className="flex-[1.4] rounded-full py-3.5 text-center font-semibold text-[#0F1419] disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #EAD4AF, #C9A988)" }}
                  >
                    Send feedback
                  </button>
                </div>
                <p className="mt-3 text-center text-[11.5px] text-foreground/35">
                  Want to see past notes? <a href="/my-feedback" className="text-gold">Your feedback</a>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
