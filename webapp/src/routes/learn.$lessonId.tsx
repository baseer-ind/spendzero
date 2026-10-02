import { createFileRoute, Link } from "@tanstack/react-router";
import { NavBar, Screen } from "@/components/Shell";
import { MicroFeedback } from "@/components/MicroFeedback";
import { lesson, research } from "@/lib/learn";

export const Route = createFileRoute("/learn/$lessonId")({
  head: () => ({ meta: [{ title: "Lesson — Project Future" }] }),
  component: LessonScreen,
});

function LessonScreen() {
  const { lessonId } = Route.useParams();
  const l = lesson(lessonId);

  if (!l) {
    return (
      <Screen>
        <NavBar title="Future Intelligence" back="/learn" />
        <div className="mx-6 mt-24 text-center text-foreground/60">
          Lesson not found. <Link to="/learn" className="text-gold">Back to Future Intelligence</Link>
        </div>
      </Screen>
    );
  }

  const sources = l.research.map(research).filter(Boolean);

  return (
    <Screen>
      <NavBar title="Future Intelligence" back="/learn" />

      <div className="px-6 pt-2 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80">{l.minutes} min read</p>
        <h1 className="font-display text-[32px] leading-[1.08] mt-2">{l.title}</h1>
      </div>

      {/* Insight */}
      <div className="px-6 mt-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/40">the insight</p>
        <p className="mt-2 text-[16px] leading-relaxed text-foreground/85">{l.insight}</p>
      </div>

      {/* Example — A vs B */}
      <div className="mx-6 mt-7 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-surface p-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/40">{l.example.optionA.label}</p>
          <p className="mt-3 font-display text-[28px]">{l.example.optionA.price}</p>
        </div>
        <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 text-center">
          <div className="flex items-center justify-center gap-2">
            {l.example.optionB.strike && <span className="text-[14px] text-foreground/40 line-through">{l.example.optionB.strike}</span>}
            {l.example.optionB.tag && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-gold">{l.example.optionB.tag}</span>}
          </div>
          <p className="mt-2 font-display text-[28px] text-gold">{l.example.optionB.price}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-foreground/40">{l.example.optionB.label}</p>
        </div>
      </div>
      <p className="mx-6 mt-3 text-center text-[12.5px] text-foreground/55">{l.example.note}</p>

      {/* Question */}
      <div className="mx-6 mt-7 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,oklch(0.79_0.105_82/0.1),transparent_70%)] p-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-gold/80">ask yourself</p>
        <p className="mt-2 font-display text-[20px] leading-snug text-balance">{l.question}</p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/65">{l.takeaway}</p>
      </div>

      {/* Research */}
      {sources.length > 0 && (
        <div className="px-6 mt-8">
          <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/40">what the research found</p>
          <div className="mt-3 flex flex-col gap-3">
            {sources.map((s) => (
              <div key={s!.id} className="rounded-2xl border border-white/8 bg-surface p-4">
                <p className="text-[13px] text-foreground/80">{s!.authors} ({s!.year})</p>
                <p className="mt-0.5 text-[12.5px] italic text-foreground/55">{s!.title} — {s!.publication}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-foreground/70">{s!.finding}</p>
                <p className="mt-2 text-[11.5px] text-foreground/45">Limitation: {s!.limitation}</p>
                {s!.link && <a href={s!.link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[12px] text-gold">Read the source →</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Try it */}
      <div className="px-6 mt-8 pb-16">
        <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/40">try it</p>
        <p className="mt-2 text-[13.5px] text-foreground/65">Take the idea into a real craving — then pause, and decide for yourself.</p>
        <Link to={l.tryIt.to} className="mt-4 block w-full rounded-full py-4 text-center font-medium text-background" style={{ background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))" }}>
          {l.tryIt.label} →
        </Link>
        <p className="mt-4 text-center text-[11px] text-foreground/35">
          Research suggests these patterns are common — not that everyone responds the same way.
        </p>
        <MicroFeedback question="Was this lesson useful?" screen={`learn/${l.id}`} options={["Yes", "No"]} />
      </div>
    </Screen>
  );
}
