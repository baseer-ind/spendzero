import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[12px] font-medium tracking-wide text-foreground/80">
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground/70" />
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground/70" />
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground/40" />
        <span className="ml-1.5 inline-block h-2 w-4 rounded-[2px] border border-foreground/50" />
      </div>
    </div>
  );
}

export function NavBar({
  title,
  back = "/",
  right,
}: {
  title?: string;
  back?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 pt-2 pb-3">
      <Link
        to={back}
        className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-foreground/80 backdrop-blur"
        aria-label="Back"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
      {title && (
        <span className="text-[11px] uppercase tracking-[0.28em] text-foreground/55">
          {title}
        </span>
      )}
      <div className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-foreground/70">
        {right ?? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        )}
      </div>
    </div>
  );
}

export function BottomNav({ active }: { active: "home" | "future" | "journey" | "profile" }) {
  const item = (
    href: string,
    key: typeof active,
    label: string,
    icon: ReactNode,
  ) => {
    const on = active === key;
    return (
      <Link
        to={href}
        className={`flex flex-col items-center gap-1 text-[10px] tracking-wide ${
          on ? "text-gold" : "text-foreground/45"
        }`}
      >
        <span className="grid h-6 w-6 place-items-center">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[440px] justify-center pb-5">
      <div className="pointer-events-auto flex w-[88%] items-center justify-between rounded-full border border-white/10 bg-[oklch(0.16_0.008_260/0.7)] px-7 py-3 backdrop-blur-xl">
        {item("/", "home", "Today",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z" stroke="currentColor" strokeWidth="1.4" />
          </svg>,
        )}
        {item("/future", "future", "Future",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="12" cy="12" r="2.4" fill="currentColor" />
          </svg>,
        )}
        <Link
          to="/order"
          className="-mt-7 grid h-14 w-14 place-items-center rounded-full"
          aria-label="Pause"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, oklch(0.92 0.09 84), oklch(0.72 0.12 80))",
            boxShadow:
              "0 10px 30px -8px oklch(0.79 0.105 82 / 0.55), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 4v16M4 12h16" stroke="#1a1408" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>
        {item("/journey", "journey", "Journey",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 18c4-10 12-10 16 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="4" cy="18" r="1.6" fill="currentColor" />
            <circle cx="20" cy="18" r="1.6" fill="currentColor" />
          </svg>,
        )}
        {item("/profile", "profile", "Me",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="9" r="3.4" stroke="currentColor" strokeWidth="1.4" />
            <path d="M4.5 20c1.6-3.6 4.6-5.5 7.5-5.5s5.9 1.9 7.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>,
        )}
      </div>
    </div>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto min-h-screen w-full max-w-[440px] pb-32 grain">{children}</div>
    </div>
  );
}
