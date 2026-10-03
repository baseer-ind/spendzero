import { Link, useLocation } from "@tanstack/react-router";

/**
 * Floating feedback button shown across the app once a user is onboarded.
 * Sits above the bottom navigation, out of the way, always one tap from the
 * feedback screen. Hidden on screens where it would intrude: the feedback
 * screen itself and the focused decision moment (pause → continue).
 */
export function FeedbackFab() {
  const { pathname } = useLocation();
  const hidden = /^\/(feedback|pause|continue)/.test(pathname);
  if (hidden) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px]">
      <Link
        to="/feedback"
        aria-label="Send feedback"
        className="pointer-events-auto absolute bottom-[104px] right-4 flex items-center gap-2 rounded-full border border-[#C9A988]/35 bg-[oklch(0.16_0.008_260/0.82)] px-3.5 py-2.5 text-[12px] font-medium text-[#D9CDBD] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-transform active:scale-95"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 11.5a8.38 8.38 0 01-8.5 8.5 9.5 9.5 0 01-3.8-.8L3 21l1.8-5.2A8.38 8.38 0 014 11.5 8.5 8.5 0 0112.5 3 8.38 8.38 0 0121 11.5z"
            stroke="#C9A988"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Feedback
      </Link>
    </div>
  );
}
