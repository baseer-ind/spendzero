import { BottomNav, NavBar, Screen, StatusBar } from "../components/Shell";


type Entry = {
  day: string;
  date: string;
  type: "skip" | "milestone" | "letter";
  title: string;
  detail: string;
  amount?: string;
};

const ENTRIES: Entry[] = [
  { day: "Today", date: "Tue 30 Jun", type: "skip", title: "Skipped Sakura sushi", detail: "Closed Zomato. Stayed in.", amount: "+₹820" },
  { day: "Yesterday", date: "Mon 29 Jun", type: "milestone", title: "Crossed 70% to Kyoto", detail: "Twenty quiet days in a row.", amount: "🌸" },
  { day: "Sun", date: "28 Jun", type: "skip", title: "Walked past Starbucks", detail: "Made chai at home instead.", amount: "+₹340" },
  { day: "Sat", date: "27 Jun", type: "letter", title: "A note from Future You", detail: "\"You're doing it. Don't stop.\"" },
  { day: "Fri", date: "26 Jun", type: "skip", title: "Cancelled the impulse Amazon order", detail: "The wireless mouse you didn't need.", amount: "+₹2,400" },
  { day: "Thu", date: "25 Jun", type: "skip", title: "Skipped Swiggy burger", detail: "Cooked pasta. It was better.", amount: "+₹540" },
  { day: "Wed", date: "24 Jun", type: "milestone", title: "10-day streak began", detail: "The morning you decided.", amount: "✦" },
];

function JourneyScreen() {
  return (
    <Screen>
      <StatusBar />
      <NavBar title="Journey" back="/" />

      <div className="px-6 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">since you began</p>
        <h1 className="font-display text-[36px] leading-[1.02] mt-2">
          Every quiet win.
          <br />
          <span className="text-shimmer-gold italic">In order.</span>
        </h1>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-3 px-6">
        {[
          { v: "47", l: "Skips" },
          { v: "₹38,420", l: "Redirected" },
          { v: "23 days", l: "Streak" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-white/8 bg-surface p-4 text-center">
            <p className="font-display text-[18px] text-gold leading-none">{s.v}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-foreground/45">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative mt-10 px-6">
        <div className="absolute left-[34px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/30 via-white/8 to-transparent" />
        <div className="flex flex-col gap-7">
          {ENTRIES.map((e, i) => (
            <div key={i} className="relative flex gap-5 animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="relative z-10 mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gold/40 bg-background">
                <span className={`block h-2 w-2 rounded-full ${
                  e.type === "milestone" ? "bg-gold" : e.type === "letter" ? "bg-future" : "bg-foreground/50"
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">
                    {e.day} · {e.date}
                  </span>
                  {e.amount && (
                    <span className={`text-[12px] font-medium ${
                      e.type === "skip" ? "text-gold" : "text-foreground/70"
                    }`}>{e.amount}</span>
                  )}
                </div>
                <h4 className={`mt-1.5 font-display text-[17px] leading-snug ${
                  e.type === "letter" ? "italic text-foreground/80" : ""
                }`}>
                  {e.title}
                </h4>
                <p className="mt-1 text-[12px] leading-relaxed text-foreground/50">{e.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 mt-10 text-center">
        <p className="font-display italic text-[15px] text-foreground/55 text-balance">
          "The future is built from afternoons like this one."
        </p>
      </div>

      <BottomNav active="journey" />
    </Screen>
  );
}

export default JourneyScreen;
