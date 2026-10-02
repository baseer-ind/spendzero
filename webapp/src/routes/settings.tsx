import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav, NavBar, Screen, StatusBar } from "@/components/Shell";
import { APP_VERSION } from "@/lib/feedback";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Project Future" }] }),
  component: SettingsScreen,
});

const APP_KEYS = [
  "project_future_state_v1",
  "project_future_creds_v1",
  "project_future_feedback_v1",
];

function SettingsScreen() {
  const [confirming, setConfirming] = useState(false);
  const [legal, setLegal] = useState<null | "privacy" | "terms" | "disclaimer">(null);

  function exportData() {
    try {
      const dump: Record<string, unknown> = { exportedAt: new Date().toISOString(), appVersion: APP_VERSION };
      for (const k of APP_KEYS) {
        const v = localStorage.getItem(k);
        if (v) try { dump[k] = JSON.parse(v); } catch { dump[k] = v; }
      }
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "project-future-my-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }

  function deleteData() {
    try { for (const k of APP_KEYS) localStorage.removeItem(k); } catch { /* ignore */ }
    window.location.href = "/";
  }

  return (
    <Screen>
      <StatusBar />
      <NavBar title="Settings" back="/profile" />

      <div className="px-6 pt-2">
        <h1 className="font-display text-[26px]">Settings & privacy</h1>
        <p className="mt-1 text-[13px] text-foreground/55">Your data stays on this device. You're in control of it.</p>
      </div>

      {/* Data controls */}
      <div className="mx-6 mt-6 overflow-hidden rounded-2xl border border-white/8 bg-surface">
        <button onClick={exportData} className="flex w-full items-center justify-between border-b border-white/5 px-5 py-4 text-left">
          <span className="text-[14px] text-foreground/85">⬇ Export my data</span>
          <span className="text-[12px] text-foreground/45">JSON ›</span>
        </button>
        <button onClick={() => setConfirming(true)} className="flex w-full items-center justify-between px-5 py-4 text-left">
          <span className="text-[14px] text-destructive">🗑 Delete my data</span>
          <span className="text-[12px] text-foreground/45">›</span>
        </button>
      </div>

      {/* Legal / trust */}
      <div className="mx-6 mt-4 overflow-hidden rounded-2xl border border-white/8 bg-surface">
        <button onClick={() => setLegal("privacy")} className="flex w-full items-center justify-between border-b border-white/5 px-5 py-4 text-left"><span className="text-[14px] text-foreground/85">Privacy Policy</span><span className="text-foreground/30">›</span></button>
        <button onClick={() => setLegal("terms")} className="flex w-full items-center justify-between border-b border-white/5 px-5 py-4 text-left"><span className="text-[14px] text-foreground/85">Terms of Use</span><span className="text-foreground/30">›</span></button>
        <button onClick={() => setLegal("disclaimer")} className="flex w-full items-center justify-between px-5 py-4 text-left"><span className="text-[14px] text-foreground/85">About brands & money</span><span className="text-foreground/30">›</span></button>
      </div>

      <div className="mx-6 mt-4 overflow-hidden rounded-2xl border border-white/8 bg-surface">
        <Link to="/feedback" className="flex w-full items-center justify-between border-b border-white/5 px-5 py-4 text-left"><span className="text-[14px] text-foreground/85">Feedback & suggestions</span><span className="text-foreground/30">›</span></Link>
        <a href="mailto:hello@projectfuture.app" className="flex w-full items-center justify-between px-5 py-4 text-left"><span className="text-[14px] text-foreground/85">Contact support</span><span className="text-[12px] text-foreground/45">email ›</span></a>
      </div>

      <p className="mt-6 px-6 text-center text-[11px] text-foreground/35">Project Future · v{APP_VERSION}</p>

      {confirming && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55" onClick={() => setConfirming(false)}>
          <div className="w-full max-w-[440px] rounded-t-3xl border-t border-white/10 bg-background p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-[20px]">Delete all your data?</h3>
            <p className="mt-2 text-[13px] text-foreground/60">This permanently removes your account, dreams, savings tally, activity and feedback from this device. This can't be undone.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setConfirming(false)} className="flex-1 rounded-full border border-white/15 py-3 text-[14px] text-foreground/75">Cancel</button>
              <button onClick={deleteData} className="flex-1 rounded-full bg-destructive py-3 text-[14px] font-medium text-white">Delete everything</button>
            </div>
          </div>
        </div>
      )}

      {legal && <LegalSheet kind={legal} onClose={() => setLegal(null)} />}

      <BottomNav active="profile" />
    </Screen>
  );
}

function LegalSheet({ kind, onClose }: { kind: "privacy" | "terms" | "disclaimer"; onClose: () => void }) {
  const content = LEGAL[kind];
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-[440px] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-background p-6 pb-10" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-[20px]">{content.title}</h3>
        <p className="mt-1 text-[11px] uppercase tracking-wider text-gold/70">Draft — pending legal review</p>
        <div className="mt-4 space-y-3 text-[13px] leading-relaxed text-foreground/70">
          {content.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <button onClick={onClose} className="mt-6 w-full rounded-full border border-white/12 bg-white/5 py-3 text-[14px] text-foreground/80">Close</button>
      </div>
    </div>
  );
}

const LEGAL = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "This is a draft summary, not final legal text. A lawyer-reviewed policy will replace it before public launch.",
      "Project Future stores your data on your device only (your browser's local storage): your name/email for the local account, your dreams, your virtual savings tally, your in-app browsing activity, and any feedback you send. We do not currently run a server that collects this data.",
      "Photos you add (dream covers, profile photo) stay on your device and are never uploaded.",
      "We never ask for real card or bank details. Checkout is a simulation; no real payment is taken.",
      "You can export or permanently delete all of your data at any time from Settings.",
    ],
  },
  terms: {
    title: "Terms of Use",
    body: [
      "This is a draft summary, not final legal text.",
      "Project Future is a behavioural tool to help you notice spending urges, pause, and consciously decide. The shopping environment is a simulation for practice and awareness.",
      "The “money you kept / redirected” figure is a virtual tally to track your own choices. It is not money held, transferred, or invested by Project Future, and it is not financial advice.",
      "Use the app responsibly. Educational content reflects published research and is not medical or financial advice.",
    ],
  },
  disclaimer: {
    title: "About brands & money",
    body: [
      "All stores, brands, products, restaurants, prices and offers in Project Future are fictional and created for a realistic simulation. They do not represent, and are not affiliated with, any real company.",
      "No real purchase is ever made and no real payment is collected.",
      "“Money you kept” is a personal awareness tally — Project Future does not hold or move your money. A real “move to savings” option, via a regulated partner, may come later and will be clearly labelled.",
    ],
  },
} as const;
