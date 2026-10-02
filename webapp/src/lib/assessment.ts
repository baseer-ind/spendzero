// Spending Behaviour Assessment — see docs/SPENDING_PROFILE.md
// Original items (not copied from copyrighted scales). Non-clinical, non-judgmental.
// One 0–4 agreement scale per item. Each item loads onto a dimension; some reverse.

export type Dimension =
  | "affective"
  | "deliberation" // reverse: higher = more deliberate = lower impulse
  | "emotion"
  | "scroll"
  | "present" // present bias: higher = future feels less real
  | "regret"
  | "goalClarity" // higher = clearer goals
  | "selfEfficacy"; // higher = can walk away

export type Question = {
  id: string;
  prompt: string;
  dimension: Dimension;
  reverse?: boolean;
};

export const SCALE = [
  { value: 0, label: "Not me" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Very me" },
];

export const QUESTIONS: Question[] = [
  { id: "q1", prompt: "When I see something I like, I often buy it without much thought.", dimension: "affective" },
  { id: "q2", prompt: "I usually think a purchase over for a while before deciding.", dimension: "deliberation", reverse: true },
  { id: "q3", prompt: "I shop or browse to lift my mood when I'm stressed, bored, or down.", dimension: "emotion" },
  { id: "q4", prompt: "Sales, notifications, or scrolling often lead me to buy things I didn't plan to.", dimension: "scroll" },
  { id: "q5", prompt: "Late at night I'm more likely to add things to a cart.", dimension: "scroll" },
  { id: "q6", prompt: "Saving for something far away feels less real than buying something now.", dimension: "present" },
  { id: "q7", prompt: "I often regret small purchases a day or two later.", dimension: "regret" },
  { id: "q8", prompt: "I have clear things I'm actively saving toward.", dimension: "goalClarity" },
  { id: "q9", prompt: "I can usually walk away from something I wanted once the moment passes.", dimension: "selfEfficacy" },
  { id: "q10", prompt: "Spending on the right things genuinely makes my life better.", dimension: "goalClarity" },
];

export type Archetype = "spark" | "soother" | "scroller" | "planner" | "dreamer";

export type Profile = {
  archetype: Archetype;
  dims: Record<Dimension, number>; // 0..1 per dimension
  impulseIndex: number; // 0..1
  goalClarity: number; // 0..1
  completedAt: number;
};

export const ARCHETYPES: Record<Archetype, {
  title: string;
  pattern: string;
  strength: string;
  opportunity: string;
  help: string;
}> = {
  spark: {
    title: "The Spark",
    pattern: "You decide fast. When something excites you, you often buy it in the moment.",
    strength: "You're decisive and enthusiastic — you don't agonise.",
    opportunity: "A short pause between the spark and the tap.",
    help: "We'll give you a calm beat and show what today's craving could become — before you decide.",
  },
  soother: {
    title: "The Soother",
    pattern: "Spending often shows up when you're stressed, bored, or need a lift.",
    strength: "You're emotionally honest and self-aware.",
    opportunity: "Noticing the feeling first, then choosing on purpose.",
    help: "We'll gently check in on the moment, never judge it, and offer a different kind of win.",
  },
  scroller: {
    title: "The Scroller",
    pattern: "You often discover things while browsing, without planning to buy.",
    strength: "You're curious and open to discovering genuinely good things.",
    opportunity: "A small pause between discovery and purchase.",
    help: "We'll turn some of those moments into a chance to move money toward something you care about.",
  },
  planner: {
    title: "The Planner",
    pattern: "You plan well and rarely buy on impulse.",
    strength: "You're disciplined and consistent — a real strength.",
    opportunity: "Channelling that discipline into bigger, further goals.",
    help: "We'll stay out of your way and help you aim higher, with clear progress toward larger futures.",
  },
  dreamer: {
    title: "The Dreamer",
    pattern: "The future can feel abstract, so it's easy to choose the now.",
    strength: "You're open and aspirational.",
    opportunity: "Making one future feel vivid and close.",
    help: "We'll help you set one meaningful goal and watch it get closer every time you choose it.",
  },
};

function norm(v: number) {
  return Math.max(0, Math.min(1, v / 4));
}

export function computeProfile(answers: Record<string, number>): Profile {
  const dims: Record<Dimension, number[]> = {
    affective: [], deliberation: [], emotion: [], scroll: [],
    present: [], regret: [], goalClarity: [], selfEfficacy: [],
  };
  for (const q of QUESTIONS) {
    const raw = answers[q.id] ?? 2;
    const val = q.reverse ? 4 - raw : raw;
    dims[q.dimension].push(norm(val));
  }
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const d: Record<Dimension, number> = {
    affective: avg(dims.affective),
    deliberation: avg(dims.deliberation), // normalised so higher = more deliberate (reverse applied)
    emotion: avg(dims.emotion),
    scroll: avg(dims.scroll),
    present: avg(dims.present),
    regret: avg(dims.regret),
    goalClarity: avg(dims.goalClarity),
    selfEfficacy: avg(dims.selfEfficacy),
  };

  const impulseIndex = Math.max(0, Math.min(1,
    (d.affective + d.emotion + d.scroll + d.present) / 4 - (d.deliberation + d.selfEfficacy) / 4 + 0.5,
  ));
  const goalClarity = d.goalClarity;

  // Primary archetype:
  let archetype: Archetype;
  if (goalClarity < 0.4 && d.present >= 0.5) archetype = "dreamer";
  else if (impulseIndex < 0.4) archetype = "planner";
  else {
    // highest trigger among scroll / emotion / affective
    const triggers: [Archetype, number][] = [
      ["scroller", d.scroll],
      ["soother", d.emotion],
      ["spark", d.affective],
    ];
    triggers.sort((a, b) => b[1] - a[1]);
    archetype = triggers[0][0];
  }

  return { archetype, dims: d, impulseIndex, goalClarity, completedAt: Date.now() };
}
