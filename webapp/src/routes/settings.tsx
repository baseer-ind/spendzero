import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav, NavBar, Screen, StatusBar } from "@/components/Shell";
import { APP_VERSION } from "@/lib/feedback";
import { cloudEnabled } from "@/lib/supabase";
import { deleteAccountCloud } from "@/lib/cloud";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — SELFly" }] }),
  component: SettingsScreen,
});

const APP_KEYS = [
  "project_future_state_v1",
  "project_future_creds_v1",
  "project_future_feedback_v1",
  "project_future_images_v1",
  "selfly_sim_ack_v1",
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

  async function deleteData() {
    // Server-side deletes data + media + the Auth user, then we clear the device.
    if (cloudEnabled) {
      try { await deleteAccountCloud(); } catch { /* best effort */ }
    }
    try { for (const k of APP_KEYS) localStorage.removeItem(k); } catch { /* ignore */ }
    window.location.href = "/";
  }

  return (
    <Screen>
      <StatusBar />
      <NavBar title="Settings" back="/profile" />

      <div className="px-6 pt-2">
        <h1 className="font-display text-[26px]">Settings & privacy</h1>
        <p className="mt-1 text-[13px] text-foreground/55">Your account is secured in the cloud; some data stays on this device. You're in control of it.</p>
      </div>

      {/* Data controls */}
      <div className="mx-6 mt-6 overflow-hidden rounded-2xl border border-white/8 bg-surface">
        <button onClick={exportData} className="flex w-full items-center justify-between border-b border-white/5 px-5 py-4 text-left">
          <span className="text-[14px] text-foreground/85">⬇ Export my data</span>
          <span className="text-[12px] text-foreground/45">JSON ›</span>
        </button>
        <button onClick={() => setConfirming(true)} className="flex w-full items-center justify-between px-5 py-4 text-left">
          <span className="text-[14px] text-destructive">🗑 Delete my account</span>
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

      <p className="mt-6 px-6 text-center text-[11px] text-foreground/35">SELFly · v{APP_VERSION}</p>

      {confirming && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55" onClick={() => setConfirming(false)}>
          <div className="w-full max-w-[440px] rounded-t-3xl border-t border-white/10 bg-background p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-[20px]">Delete your account?</h3>
            <p className="mt-2 text-[13px] text-foreground/60">This permanently removes your dreams, savings tally, activity and feedback from your cloud account and this device, and signs you out. This can't be undone.</p>
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
        <p className="mt-1 text-[11px] uppercase tracking-wider text-gold/70">Plain-language summary · how the app works today</p>
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
      "This is a plain-language summary of how SELFly handles your information today.",
      "Your account (email and password) is managed securely by Supabase, our authentication provider. We never see or store your raw password.",
      "When you have an account, your profile, dreams, virtual savings tally and decisions are stored in your private cloud account so they're there when you return — on any device. Access is restricted so only you can read your own data.",
      "Profile and dream-cover photos are stored in secure cloud file storage, in a private folder only you can access.",
      "Some things stay only on this device and are never uploaded: your shopping cart, the one-time 'simulation' notices you've dismissed, and temporary screen state.",
      "Shopping, prices, carts and checkout are entirely simulated. We never ask for real card or bank details, no real order or payment is ever made, and your savings are a virtual tally — SELFly is not a bank and never holds money.",
      "You can export or permanently delete your data at any time from Settings.",
    ],
  },
  terms: {
    title: "Terms of Use",
    body: [
      "This is a draft summary, not final legal text.",
      "SELFly is a behavioural tool to help you notice spending urges, pause, and consciously decide. The shopping environment is a simulation for practice and awareness.",
      "The “money you kept / redirected” figure is a virtual tally to track your own choices. It is not money held, transferred, or invested by SELFly, and it is not financial advice.",
      "Use the app responsibly. Educational content reflects published research and is not medical or financial advice.",
    ],
  },
  disclaimer: {
    title: "About brands & money",
    body: [
      "All stores, brands, products, restaurants, prices and offers in SELFly are fictional and created for a realistic simulation. They do not represent, and are not affiliated with, any real company.",
      "No real purchase is ever made and no real payment is collected.",
      "“Money you kept” is a personal awareness tally — SELFly does not hold or move your money. A real “move to savings” option, via a regulated partner, may come later and will be clearly labelled.",
    ],
  },
} as const;
