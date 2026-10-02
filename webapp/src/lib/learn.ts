// Future Intelligence — evidence-based behavioural education tied to real decisions.
//
// CLAIMS POLICY (enforced in copy):
//  - "Research suggests…", "Studies have found…", "In this experiment…".
//  - Never "dopamine makes you buy", never medical/addiction claims, never
//    "research proves everyone…". Keep WHAT A STUDY FOUND separate from WHAT
//    PROJECT FUTURE INTERPRETS. All examples are India-first, in ₹.
//  See docs/FUTURE_INTELLIGENCE.md and docs/FUTURE_INTELLIGENCE_RESEARCH.md.

export type Category = { id: string; title: string; emoji: string; blurb: string };

export const CATEGORIES: Category[] = [
  { id: "deals", title: "Deals & Discounts", emoji: "🏷️", blurb: "Why a price can feel like a better deal than it is." },
  { id: "impulse", title: "Impulse & Cravings", emoji: "⚡", blurb: "The gap between wanting and deciding." },
  { id: "fomo", title: "FOMO", emoji: "⏳", blurb: "'Limited time' and the fear of missing out." },
  { id: "convenience", title: "Convenience", emoji: "🛵", blurb: "When one tap becomes a habit." },
  { id: "reference", title: "Reference Prices", emoji: "📊", blurb: "The number you compare everything to." },
  { id: "present-future", title: "Present vs Future", emoji: "🌱", blurb: "Why today usually wins — and how to help tomorrow." },
  { id: "social", title: "Social Influence", emoji: "👥", blurb: "What others buy shapes what you want." },
  { id: "emotional", title: "Emotional Spending", emoji: "💭", blurb: "Spending to feel something, or avoid it." },
  { id: "subscriptions", title: "Subscriptions", emoji: "🔁", blurb: "Small recurring charges, big yearly totals." },
  { id: "small", title: "Small Purchases", emoji: "🪙", blurb: "The ₹149s that quietly add up." },
  { id: "online", title: "Online Shopping", emoji: "📱", blurb: "Design choices that nudge the cart." },
  { id: "habit", title: "Habit Building", emoji: "🧭", blurb: "Turning the pause into second nature." },
];

export type Lesson = {
  id: string;
  categoryId: string;
  title: string;
  minutes: number;
  insight: string;
  example: { optionA: { label: string; price: string }; optionB: { label: string; price: string; strike?: string; tag?: string }; note: string };
  question: string;
  takeaway: string;
  research: string[]; // research source ids
  tryIt: { label: string; to: string };
};

export const LESSONS: Lesson[] = [
  {
    id: "discount-trap",
    categoryId: "deals",
    title: "The Discount Trap",
    minutes: 2,
    insight:
      "How a discount is presented can change how valuable an offer feels — even when the product and the final price are exactly the same.",
    example: {
      optionA: { label: "No discount", price: "₹70" },
      optionB: { label: "30% OFF", price: "₹70", strike: "₹100", tag: "30% OFF" },
      note: "The amount you pay is identical: ₹70. Only the presentation is different.",
    },
    question: "Would you have bought it at ₹70 if there had never been a ₹100 reference price?",
    takeaway:
      "That question is the pause. Research suggests a reference price and the framing of a deal can raise how much we value an offer. Noticing it puts the choice back in your hands.",
    research: ["krishna-2002", "chen-1998", "bayer-2013"],
    tryIt: { label: "Explore a deal", to: "/today" },
  },
  {
    id: "scarcity-clock",
    categoryId: "fomo",
    title: "The Scarcity Clock",
    minutes: 2,
    insight:
      "'Only 2 left' and 'offer ends in 10:00' can add pressure to decide quickly — pressure that comes from the promotion, not from what you actually need.",
    example: {
      optionA: { label: "Take your time", price: "₹1,499" },
      optionB: { label: "Ends in 10:00", price: "₹1,499", tag: "Only 2 left" },
      note: "Same product, same price — one just adds a clock and a count.",
    },
    question: "If the timer disappeared, would you still want this today?",
    takeaway:
      "Studies have found that limited-time and limited-quantity promotions can contribute to impulse purchasing. A pause lets the urgency pass so your actual preference can show up.",
    research: ["wu-2020"],
    tryIt: { label: "See today's cravings", to: "/today" },
  },
];

export function lessonsForCategory(categoryId: string): Lesson[] {
  return LESSONS.filter((l) => l.categoryId === categoryId);
}
export function lesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
export function category(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export type ResearchSource = {
  id: string;
  authors: string;
  year: number;
  title: string;
  publication: string;
  link?: string;
  finding: string;
  limitation: string;
};

// Verified sources the user supplied. Findings are stated as the studies found
// them — not as universal truths.
export const RESEARCH: ResearchSource[] = [
  {
    id: "krishna-2002",
    authors: "Krishna, Briesch, Lehmann & Yuan",
    year: 2002,
    title: "A Meta-analysis of the Impact of Price Presentation on Perceived Savings",
    publication: "Journal of Retailing",
    link: "https://business.columbia.edu/faculty/research/meta-analysis-impact-price-presentation-perceived-savings",
    finding:
      "Reviewing 20 published studies, the authors found that how a promotion is presented affects perceived savings; showing a regular/reference price can increase the perceived value of a deal.",
    limitation: "A meta-analysis of prior studies; effects vary by context and were measured largely as perceived (not actual) savings.",
  },
  {
    id: "chen-1998",
    authors: "Chen, Monroe & Lou",
    year: 1998,
    title: "The Effects of Framing Price Promotion Messages on Consumers' Perceptions and Purchase Intentions",
    publication: "Journal of Retailing",
    link: "https://www.sciencedirect.com/science/article/pii/S0022435999801006",
    finding:
      "The framing of the same price reduction — percentage versus absolute amount — changed its perceived significance, with the effect depending on the product's price level.",
    limitation: "Findings depend on price level and product type; measured purchase intentions and perceptions.",
  },
  {
    id: "bayer-2013",
    authors: "Bayer & Ke",
    year: 2013,
    title: "Discounts and Consumer Search Behavior: The Role of Framing",
    publication: "Journal of Economic Psychology",
    link: "https://www.sciencedirect.com/science/article/pii/S0167487013001037",
    finding:
      "In an experiment, participants searched less when prices were presented as discounts even though the underlying shopping problem was objectively identical — relying on salient features of the promotion.",
    limitation: "Experimental setting; behaviour in a controlled search task may differ from real marketplaces.",
  },
  {
    id: "wu-2020",
    authors: "Wu et al.",
    year: 2020,
    title: "How does scarcity promotion lead to impulse purchase in the online market? A field experiment",
    publication: "Journal of Business Research",
    link: "https://www.sciencedirect.com/science/article/pii/S0378720619302095",
    finding:
      "A field experiment found that limited-quantity and limited-time promotions can contribute to impulse-purchase behaviour online.",
    limitation: "Specific platforms/products; contribution to impulse buying is not the same as causing it for every person.",
  },
];

export function research(id: string): ResearchSource | undefined {
  return RESEARCH.find((r) => r.id === id);
}
