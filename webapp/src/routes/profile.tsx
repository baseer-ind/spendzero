import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav, NavBar, Screen, StatusBar } from "@/components/Shell";
import avatar from "@/assets/avatar-user.jpg";
import { formatINR, useStore } from "@/lib/store";

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
  icon, label, value, danger, onClick,
}: { icon: string; label: string; value?: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between border-b border-white/5 px-5 py-4 text-left last:border-0">
      <div className="flex items-center gap-4">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-[14px]">{icon}</span>
        <span className={`text-[14px] ${danger ? "text-destructive" : "text-foreground/85"}`}>{label}</span>
      </div>
      <span className="flex items-center gap-2 text-[12px] text-foreground/45">
        {value} <span className="text-foreground/30">›</span>
      </span>
    </button>
  );
}

function ProfileScreen() {
  const { account, name, totalSaved, currentStreak, dreams, events, logout } = useStore();
  const displayName = account?.name || name || "You";
  return (
    <Screen>
      <StatusBar />
      <NavBar title="Me" back="/" />

      {/* Portrait */}
      <div className="px-6 text-center animate-rise">
        <div className="relative mx-auto h-28 w-28">
          <div
            className="absolute -inset-2 rounded-full opacity-60 blur-xl"
            style={{ background: "radial-gradient(circle, oklch(0.79 0.105 82 / 0.5), transparent 70%)" }}
          />
          <img src={avatar} alt="You" width={1024} height={1024} className="relative h-28 w-28 rounded-full border border-gold/30 object-cover" />
        </div>
        <p className="mt-5 text-[11px] uppercase tracking-[0.32em] text-gold/80">becoming</p>
        <h1 className="mt-2 font-display text-[28px] leading-tight">{displayName}</h1>
        <p className="mt-1 text-[12px] text-foreground/50">
          {account?.email ?? ""}{account?.email ? " · " : ""}{currentStreak}-day streak
        </p>
      </div>

      {/* Identity card */}
      <div className="mx-6 mt-7 rounded-3xl border border-gold/20 bg-[radial-gradient(circle_at_top,oklch(0.79_0.105_82/0.15),transparent_70%)] p-6 text-center animate-rise">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">your north star</p>
        <p className="mt-3 font-display text-[20px] leading-snug italic text-balance">
          "I am the kind of person who chooses tomorrow, gently."
        </p>
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
        <Row icon="◎" label="My dreams" value={`${dreams.length} active`} />
        <Row icon="◐" label="Daily ritual time" value="9:00 PM" />
      </div>

      <div className="mx-6 mt-4 overflow-hidden rounded-2xl border border-white/8 bg-surface">
        <Row icon="✦" label="Notifications" value="Gentle" />
        <Row icon="◈" label="Appearance" value="Midnight" />
        <Row icon="?" label="Help & philosophy" />
      </div>

      <div className="mx-6 mt-4 overflow-hidden rounded-2xl border border-white/8 bg-surface">
        <Row icon="→" label="Sign out" danger onClick={logout} />
      </div>

      <div className="mt-8 px-6 text-center">
        <p className="font-display italic text-[13px] text-foreground/40">
          Project Future · v1.0
        </p>
        <Link to="/" className="mt-3 inline-block text-[11px] uppercase tracking-[0.22em] text-gold/70">
          ← back to today
        </Link>
      </div>

      <BottomNav active="profile" />
    </Screen>
  );
}
