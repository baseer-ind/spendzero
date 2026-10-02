import { useState } from "react";
import { localFeedbackStore } from "@/lib/feedback";

/**
 * Lightweight one-tap feedback at a key moment. Records to the same feedback
 * store (type "micro"), shows a brief thanks, and never blocks the flow.
 * Use sparingly — don't over-survey.
 */
export function MicroFeedback({ question, screen, options }: { question: string; screen: string; options?: string[] }) {
  const choices = options ?? ["👍", "🙂", "😐", "😕", "👎"];
  const [done, setDone] = useState(false);

  if (done) {
    return <p className="mt-4 text-center text-[12px] text-foreground/45">Thanks for the signal 🙏</p>;
  }

  return (
    <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-center">
      <p className="text-[12.5px] text-foreground/60">{question}</p>
      <div className="mt-3 flex justify-center gap-2">
        {choices.map((c) => (
          <button
            key={c}
            onClick={() => { localFeedbackStore.add({ type: "micro", message: question, rating: c, screen }); setDone(true); }}
            className="min-w-11 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[18px] hover:border-gold/40 transition"
            aria-label={c}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
