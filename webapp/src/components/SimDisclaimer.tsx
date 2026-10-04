import { useEffect, useState } from "react";

/**
 * Honest, lightweight "this is a simulation" bottom sheet, shown the first time
 * a user enters each simulated vertical/store. Acknowledgement is persisted
 * per-vertical in localStorage so it never nags. Short, reassuring, one tap.
 */

const ACK_KEY = "selfly_sim_ack_v1";

const COPY: Record<string, string> = {
  food: "No real order or payment will be made.",
  grocery: "No real order or payment will be made.",
  shopping: "No real order or payment will be made.",
  electronics: "No real purchase will be made.",
  beauty: "No real order or payment will be made.",
  home: "No real order or payment will be made.",
  travel: "No real booking will be made.",
  entertainment: "No real ticket will be purchased.",
  _default: "No real order, booking or payment will be made.",
};

function readAck(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(ACK_KEY) || "{}");
  } catch {
    return {};
  }
}

export function SimDisclaimer({ vertical }: { vertical: string }) {
  const key = (vertical || "_default").toLowerCase();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ack = readAck();
    if (!ack[key]) {
      // next tick so the entrance animation plays after paint
      const t = setTimeout(() => setOpen(true), 120);
      return () => clearTimeout(t);
    }
  }, [key]);

  function dismiss() {
    try {
      const ack = readAck();
      ack[key] = true;
      localStorage.setItem(ACK_KEY, JSON.stringify(ack));
    } catch {
      /* non-fatal */
    }
    setOpen(false);
  }

  if (!open) return null;
  const line = COPY[key] ?? COPY._default;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Simulation notice">
      <button aria-label="Dismiss" onClick={dismiss} className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
      <div className="relative z-10 w-full max-w-[440px] rounded-t-[28px] border-t border-white/10 bg-surface px-6 pb-9 pt-6 animate-rise">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/15" />
        <div className="flex items-center gap-2 text-gold">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 8h.01M11 12h1v4h1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[11px] uppercase tracking-[0.22em]">a quick note</span>
        </div>
        <h2 className="mt-3 font-display text-[24px] leading-tight">You're exploring a simulation</h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-foreground/65">
          This experience helps you notice how you browse and make spending decisions. {line}
        </p>
        <button
          onClick={dismiss}
          className="mt-6 h-13 w-full rounded-full py-4 text-center font-semibold text-background"
          style={{ background: "linear-gradient(135deg, #EAD4AF, #C9A988)" }}
        >
          Got it, let's explore
        </button>
        <p className="mt-3 text-center text-[11.5px] text-foreground/40">Prices and availability are simulated.</p>
      </div>
    </div>
  );
}
