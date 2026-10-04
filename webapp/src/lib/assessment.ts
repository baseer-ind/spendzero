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

// Short, non-judgmental insight shown after each answer (no shaming, no medical or
// dopamine claims). Keyed by the question's dimension; bucketed by how strongly the
// user related to the statement.
const INSIGHTS: Record<string, { high: string; mid: string; low: string }> = {
  affective: {
    high: "Buying on the spot is normal — the goal isn't to stop, just to notice which of these you genuinely value.",
    mid: "A short pause before buying can make the choice feel more like yours.",
    low: "You tend to weigh things first. We'll build on that strength.",
  },
  deliberation: {
    high: "Thinking purchases over already works for you — we'll reinforce it.",
    mid: "A little more space before deciding can help.",
    low: "We'll add a gentle pause so decisions feel less rushed.",
  },
  emotion: {
    high: "Shopping to shift a mood is really common. Noticing the trigger is the first step — no judgement.",
    mid: "Sometimes the feeling passes faster than we expect.",
    low: "Your spending isn't very mood-driven — useful to know.",
  },
  scroll: {
    high: "Scrolling and sales can turn into spending we didn't plan. Seeing the pattern is what helps.",
    mid: "A quick check-in can separate 'saw it' from 'need it'.",
    low: "Notifications don't pull you much — that's a real advantage.",
  },
  present: {
    high: "Something now almost always feels more real than a far-off goal. We'll make your future feel closer.",
    mid: "Picturing the goal vividly helps it compete with 'now'.",
    low: "You can keep future goals in view — that's a strength.",
  },
  regret: {
    high: "Noticing regret afterwards is valuable — the pause tries to catch it beforehand.",
    mid: "A beat before buying can head off the next-day second-guess.",
    low: "You rarely regret small buys — a good sign of intention.",
  },
  selfEfficacy: {
    high: "Walking away once the moment passes is a real strength.",
    mid: "The urge often fades if you give it a moment.",
    low: "The pause is here to make walking away easier.",
  },
  goalClarity: {
    high: "Clear goals make conscious spending much easier — a great foundation.",
    mid: "A concrete goal gives your money somewhere to go.",
    low: "We'll help you name a goal worth redirecting toward.",
  },
};

export function insightFor(q: Question, value: number): string {
  const set = INSIGHTS[q.dimension] ?? INSIGHTS.affective;
  const bucket = value >= 3 ? "high" : value <= 1 ? "low" : "mid";
  return set[bucket];
}

// ---------------------------------------------------------------------------
// Scenario-based assessment. Each scenario maps to one existing question id so
// the profile calculation (computeProfile) is unchanged: a choice records its
// `value` (0–4, already in the original statement's polarity) under that id.
// ---------------------------------------------------------------------------

export type Kind = "deal" | "food" | "wishlist" | "social" | "checkout" | "goal" | "timer" | "scroll" | "reward" | "future";

export type Choice = {
  label: string;
  value: number; // 0–4, consumed by computeProfile as answers[scenario.qid]
  reaction: string; // short, non-judgmental micro-response
};

export type Scenario = {
  qid: string; // matches a QUESTIONS id
  kind: Kind; // drives the contextual visual treatment
  eyebrow: string;
  situation: string;
  amount?: number; // ₹ shown on the contextual "card"
  badge?: string; // e.g. "Only 2 left", "20% off", "Sale ends in 15:00"
  choices: Choice[];
};

export const SCENARIOS: Scenario[] = [
  {
    qid: "q1", kind: "deal", eyebrow: "The unexpected deal", amount: 1999, badge: "Only 2 left",
    situation: "You spot something you like, marked down — you weren't planning to buy anything today.",
    choices: [
      { label: "Buy it", value: 4, reaction: "Quick and decisive — we'll just add a beat before the tap." },
      { label: "Think about it", value: 2, reaction: "A moment to think can change a small choice." },
      { label: "Skip it", value: 0, reaction: "Easy to walk past — that's a real strength." },
    ],
  },
  {
    qid: "q2", kind: "timer", eyebrow: "The countdown", badge: "Sale ends in 15:00",
    situation: "A banner says the sale ends in 15 minutes. You hadn't planned to buy anything.",
    choices: [
      { label: "Buy before it ends", value: 4, reaction: "Urgency is designed to rush you — noticing it helps." },
      { label: "Take a moment", value: 0, reaction: "Giving it space usually makes the urgency fade." },
      { label: "Leave it", value: 1, reaction: "The timer only matters if the thing does." },
    ],
  },
  {
    qid: "q3", kind: "reward", eyebrow: "The reward", amount: 1200,
    situation: "You've had a hard week and feel like treating yourself to something.",
    choices: [
      { label: "Treat myself", value: 4, reaction: "Treating yourself is fine — the aim is just to choose it on purpose." },
      { label: "Think about what I actually want", value: 2, reaction: "Sometimes the lift we want isn't the thing in the cart." },
      { label: "Skip it", value: 0, reaction: "You don't lean on spending to reset — good to know." },
    ],
  },
  {
    qid: "q4", kind: "checkout", eyebrow: "At checkout", amount: 149,
    situation: "Your basket is ₹780. At the last step you notice a little extra you didn't plan to add.",
    choices: [
      { label: "Add it", value: 4, reaction: "Those small add-ons add up quietly." },
      { label: "Think first", value: 2, reaction: "A quick check separates 'nice' from 'needed'." },
      { label: "Leave it", value: 0, reaction: "You stick to your list — that's a strength." },
    ],
  },
  {
    qid: "q5", kind: "scroll", eyebrow: "The boredom scroll",
    situation: "You were bored and opened a shopping app. Twenty minutes later there are three things in your cart.",
    choices: [
      { label: "Check out", value: 4, reaction: "Browsing can quietly become buying." },
      { label: "Review the cart", value: 2, reaction: "A second look often clears half the cart." },
      { label: "Close the app", value: 0, reaction: "You can browse without buying — a real advantage." },
    ],
  },
  {
    qid: "q6", kind: "future", eyebrow: "Future you", amount: 1000,
    situation: "You have ₹1,000 free today. You could spend it now, or move it toward something you've wanted for months.",
    choices: [
      { label: "Spend it now", value: 4, reaction: "Now always feels more real than later — we'll make later feel closer." },
      { label: "Split it", value: 2, reaction: "A little now, a little forward — a fair balance." },
      { label: "Save it", value: 0, reaction: "You keep the bigger picture in view." },
    ],
  },
  {
    qid: "q7", kind: "food", eyebrow: "The Friday craving", amount: 450,
    situation: "It's Friday evening. There's food at home, but your favourite biryani is on offer.",
    choices: [
      { label: "Order it", value: 4, reaction: "Cravings are loud in the moment — and quick to fade." },
      { label: "Check first", value: 2, reaction: "A beat to check in can settle a craving." },
      { label: "Skip it", value: 0, reaction: "You can let a craving pass — nicely done." },
    ],
  },
  {
    qid: "q8", kind: "goal", eyebrow: "The goal moment", amount: 500,
    situation: "You're saving ₹10,000 for something that matters. You have ₹700 left this month and spot something you like for ₹500.",
    choices: [
      { label: "Buy it", value: 0, reaction: "Tempting — the goal is what makes the pause worth it." },
      { label: "Think about the goal", value: 4, reaction: "Letting the goal into the moment is exactly the habit." },
      { label: "Skip it", value: 3, reaction: "You kept the goal in front — that's the muscle." },
    ],
  },
  {
    qid: "q9", kind: "wishlist", eyebrow: "The wishlist", amount: 3500, badge: "20% off",
    situation: "Something you've wanted for a while is finally on sale today.",
    choices: [
      { label: "Buy now", value: 0, reaction: "Wanting it a while can make it feel earned — worth a beat." },
      { label: "Wait & think", value: 3, reaction: "If you still want it tomorrow, it's probably a yes." },
      { label: "Skip for now", value: 4, reaction: "Walking away once the moment passes is a real strength." },
    ],
  },
  {
    qid: "q10", kind: "social", eyebrow: "The group plan", amount: 1500,
    situation: "Friends are booking a weekend outing. It wasn't in your plans, but you don't want to miss out.",
    choices: [
      { label: "Join in", value: 2, reaction: "Time with people is often money well spent — if you choose it." },
      { label: "Think about it", value: 3, reaction: "Choosing on purpose beats choosing on FOMO." },
      { label: "Sit this one out", value: 2, reaction: "Knowing what's worth it to you is the whole point." },
    ],
  },
];
