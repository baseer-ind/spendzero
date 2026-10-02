import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav, NavBar, Screen, StatusBar } from "@/components/Shell";
import { ImagePicker } from "@/components/ImagePicker";
import { formatINR, useStore } from "@/lib/store";
import { ARCHETYPES } from "@/lib/assessment";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "✦";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Me — Project Future" },
      { name: "description", content: "Who you are becoming." },
    ],
  }),
  component: ProfileScreen,
});

function Row({
  icon, label, value, danger, onClick, to,
}: { icon: string; label: string; value?: string; danger?: boolean; onClick?: () => void; to?: string }) {
  const inner = (
    <>
      <div className="flex items-center gap-4">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-[14px]">{icon}</span>
        <span className={`text-[14px] ${danger ? "text-destructive" : "text-foreground/85"}`}>{label}</span>
      </div>
      <span className="flex items-center gap-2 text-[12px] text-foreground/45">
        {value} <span className="text-foreground/30">›</span>
      </span>
    </>
  );
  const cls = "flex w-full items-center justify-between border-b border-white/5 px-5 py-4 text-left last:border-0";
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return <button onClick={onClick} className={cls}>{inner}</button>;
}

function ProfileScreen() {
  const { account, name, totalSaved, currentStreak, dreams, events, profile, profilePhoto, setProfilePhoto, logout } = useStore();
  const displayName = account?.name || name || "You";
  const archetype = profile ? ARCHETYPES[profile.archetype] : null;
  const [showPhoto, setShowPhoto] = useState(false);
  return (
    <Screen>
      <StatusBar />
      <NavBar title="Me" back="/" />

      {/* Portrait */}
      <div className="px-6 text-center animate-rise">
        <button onClick={() => setShowPhoto(true)} className="relative mx-auto block h-28 w-28" aria-label="Change profile photo">
          <div
            className="absolute -inset-2 rounded-full opacity-60 blur-xl"
            style={{ background: "radial-gradient(circle, oklch(0.79 0.105 82 / 0.5), transparent 70%)" }}
          />
          {profilePhoto ? (
            <img src={profilePhoto} alt="You" className="relative h-28 w-28 rounded-full border border-gold/30 object-cover" />
          ) : (
            <span className="relative grid h-28 w-28 place-items-center rounded-full border border-gold/30 bg-white/5 font-display text-[34px] text-gold">
              {initials(displayName)}
            </span>
          )}
          <span className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full border border-background bg-gold text-[14px] text-background">✎</span>
        </button>
        <p className="mt-5 text-[11px] uppercase tracking-[0.32em] text-gold/80">becoming</p>
        <h1 className="mt-2 font-display text-[28px] leading-tight">{displayName}</h1>
        <p className="mt-1 text-[12px] text-foreground/50">
          {account?.email ?? ""}{account?.email ? " · " : ""}{currentStreak}-day streak
        </p>
      </div>

      {/* Behaviour profile card */}
      <div className="mx-6 mt-7 rounded-3xl border border-gold/20 bg-[radial-gradient(circle_at_top,oklch(0.79_0.105_82/0.15),transparent_70%)] p-6 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">your pattern</p>
        {archetype ? (
          <>
            <p className="mt-2 font-display text-[24px] text-shimmer-gold italic">{archetype.title}</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/75">{archetype.pattern}</p>
          </>
        ) : (
          <p className="mt-3 font-display text-[18px] leading-snug italic text-balance">
            "I choose tomorrow, gently."
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 px-6">
        <div className="rounded-2xl border border-white/8 bg-surface p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/45">lifetime saved</p>
          <p className="mt-2 font-display text-[24px] text-shimmer-gold">{formatINR(totalSaved)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-surface p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/45">cravings passed</p>
          <p className="mt-2 font-display text-[24px] text-foreground/90">{events.length}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="mx-6 mt-7 overflow-hidden rounded-2xl border border-white/8 bg-surface">
        <Row icon="◎" label="My dreams" value={`${dreams.length} active`} to="/future" />
        <Row icon="◴" label="Your exploring" value="attention & money" to="/consumption" />
        <Row icon="₹" label="Money you kept" value={formatINR(totalSaved)} to="/savings" />
        <Row icon="◈" label="Future Intelligence" to="/learn" />
        <Row icon="⟳" label="My journey" value={`${events.length} wins`} to="/journey" />
        <Row icon="✦" label="Achievements" to="/achievements" />
      </div>

      <div className="mx-6 mt-4 overflow-hidden rounded-2xl border border-white/8 bg-surface">
        <Row icon="✎" label="Feedback & suggestions" to="/feedback" />
        <Row icon="⚙" label="Settings & privacy" to="/settings" />
      </div>

      <div className="mx-6 mt-4 overflow-hidden rounded-2xl border border-white/8 bg-surface">
        <Row icon="→" label="Sign out" danger onClick={logout} />
      </div>

      <div className="mt-8 px-6 text-center">
        <p className="font-display italic text-[13px] text-foreground/40">
          Project Future · v1.0.0-rc1
        </p>
        <Link to="/" className="mt-3 inline-block text-[11px] uppercase tracking-[0.22em] text-gold/70">
          ← back to today
        </Link>
      </div>

      <ImagePicker
        open={showPhoto}
        kind="profile"
        onPick={(url) => setProfilePhoto(url)}
        onRemove={profilePhoto ? () => setProfilePhoto(null) : undefined}
        onClose={() => setShowPhoto(false)}
      />

      <BottomNav active="profile" />
    </Screen>
  );
}
