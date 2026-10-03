// Launch-grade image reliability.
//
// Core catalogue imagery must never be a broken <img>, must work offline, and
// must not depend on third-party hosts (LoremFlickr/Unsplash/etc.). So every
// catalogue image is a deterministic, inline SVG "art tile": a seeded gradient +
// a context glyph + an optional label. Tiny (~1KB), instant, offline, consistent.
//
// Real photographic assets can be layered in later by mapping ids → bundled
// files; components already go through Img with a graceful fallback, so swapping
// a URL in requires no UI change. See docs/IMAGE_LAUNCH_AUDIT.md.

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Pleasant deep palettes (works on the dark UI). Picked by seed.
const PALETTES: [string, string][] = [
  ["#3b2f17", "#1a1408"], // amber/food
  ["#1e3a5f", "#0b1626"], // blue/electronics
  ["#3a1f3a", "#180b18"], // magenta
  ["#17382b", "#081611"], // green/grocery
  ["#3a2417", "#180d08"], // terracotta
  ["#2a2340", "#100c1c"], // violet/travel
  ["#3a2030", "#180a12"], // rose/beauty
  ["#20303a", "#0a1216"], // teal
];

// keyword → glyph. First substring hit wins; order matters (specific first).
const GLYPHS: [string, string][] = [
  // food
  ["biryani", "🍛"], ["haleem", "🥘"], ["salan", "🥘"], ["curry", "🍛"], ["butter chicken", "🍗"],
  ["chicken 65", "🍗"], ["chicken", "🍗"], ["mutton", "🍖"], ["gongura", "🍲"], ["paneer", "🧀"],
  ["dal", "🥣"], ["dosa", "🥞"], ["idli", "🍘"], ["vada", "🍩"], ["pongal", "🍚"], ["thali", "🍱"],
  ["meals", "🍱"], ["pulihora", "🍚"], ["pesarattu", "🥞"], ["rice", "🍚"], ["roti", "🫓"],
  ["naan", "🫓"], ["pav", "🍔"], ["misal", "🥘"], ["noodles", "🍜"], ["manchurian", "🥟"],
  ["egg", "🍳"], ["gulab", "🍮"], ["jamun", "🍮"], ["jalebi", "🍥"], ["kaju", "🍬"], ["katli", "🍬"],
  ["falooda", "🍨"], ["meetha", "🍮"], ["qubani", "🍮"], ["sweet", "🍬"], ["mithai", "🍬"],
  ["chai", "☕"], ["coffee", "☕"], ["lassi", "🥛"], ["irani", "☕"], ["dessert", "🍮"],
  ["restaurant", "🍽️"], ["tiffin", "🍽️"], ["street food", "🌮"], ["food", "🍽️"], ["pizza", "🍕"],
  ["burger", "🍔"], ["sushi", "🍣"], ["grocery", "🛒"],
  // electronics
  ["earbud", "🎧"], ["headphone", "🎧"], ["smartphone", "📱"], ["phone", "📱"], ["smartwatch", "⌚"],
  ["watch", "⌚"], ["power bank", "🔋"], ["speaker", "🔊"], ["laptop", "💻"], ["monitor", "🖥️"],
  ["keyboard", "⌨️"], ["gamepad", "🎮"], ["game", "🎮"], ["camera", "📷"], ["vlog", "📷"],
  // dreams / lifestyle
  ["wedding", "💍"], ["gold", "🪙"], ["jewel", "💍"], ["house", "🏡"], ["home", "🏡"],
  ["motorcycle", "🏍️"], ["bike", "🏍️"], ["car", "🚗"], ["graduation", "🎓"], ["student", "🎓"],
  ["education", "🎓"], ["business", "💼"], ["shop", "🏪"], ["himalaya", "🏔️"], ["mountain", "🏔️"],
  ["beach", "🏖️"], ["kerala", "🌴"], ["travel", "✈️"], ["family", "👨‍👩‍👧"], ["diwali", "🪔"],
  ["festival", "🎉"], ["savings", "🛟"], ["safety", "🛟"], ["dream", "✨"], ["goal", "🎯"],
  ["future", "🌅"], ["kyoto", "⛩️"], ["japan", "🗾"],
];

function glyphFor(keyword: string): string {
  const k = keyword.toLowerCase();
  for (const [needle, g] of GLYPHS) if (k.includes(needle)) return g;
  return "✨";
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}

/**
 * Deterministic inline SVG art tile for a keyword + seed. Returns a data: URI
 * usable directly as an <img src>. No network, never broken.
 */
export function artImage(keyword: string, seed: string, opts: { label?: string } = {}): string {
  const h = hash(seed || keyword);
  const [c1, c2] = PALETTES[h % PALETTES.length];
  const angle = (h >> 3) % 360;
  const glyph = glyphFor(keyword);
  const label = opts.label ? escapeXml(opts.label) : "";
  const gid = `g${h % 100000}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="${gid}" gradientTransform="rotate(${angle} .5 .5)">
<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<radialGradient id="${gid}b" cx="0.5" cy="0.38" r="0.7">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>
<rect width="800" height="600" fill="url(#${gid})"/>
<rect width="800" height="600" fill="url(#${gid}b)"/>
<text x="400" y="300" font-size="220" text-anchor="middle" dominant-baseline="central">${glyph}</text>
${label ? `<text x="400" y="520" font-size="34" fill="#ffffff" fill-opacity="0.78" text-anchor="middle" font-family="system-ui,Segoe UI,Roboto,sans-serif" font-weight="600">${label}</text>` : ""}
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function glyphForKeyword(keyword: string): string {
  return glyphFor(keyword);
}

/**
 * SELFly brand "scenic" background: a calm Midnight→Charcoal field with a soft
 * champagne glow and a rising path curve (the SELF→FLY / today→future metaphor).
 * Offline, gender-neutral, no Japan/stock imagery. Used for aspirational
 * backgrounds (home/future heroes, dream fallbacks, onboarding) and seeded so
 * each surface is stable but varied. A real photo can replace it via <img src>.
 */
export function scenicArt(seed: string): string {
  const h = hash(seed || "selfly");
  const glowX = 30 + (h % 40); // 30–70%
  const curveLift = 120 + ((h >> 4) % 140); // how high the path rises
  const gid = `s${h % 100000}`;
  const champagne = "#C9A988";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141b22"/><stop offset="0.55" stop-color="#0F1419"/><stop offset="1" stop-color="#0b0e12"/></linearGradient>
<radialGradient id="${gid}g" cx="${glowX}%" cy="26%" r="55%"><stop offset="0" stop-color="${champagne}" stop-opacity="0.34"/><stop offset="0.5" stop-color="${champagne}" stop-opacity="0.08"/><stop offset="1" stop-color="${champagne}" stop-opacity="0"/></radialGradient>
<linearGradient id="${gid}p" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${champagne}" stop-opacity="0.15"/><stop offset="1" stop-color="${champagne}" stop-opacity="0.85"/></linearGradient>
</defs>
<rect width="800" height="600" fill="url(#${gid})"/>
<rect width="800" height="600" fill="url(#${gid}g)"/>
<path d="M-20 560 Q 300 ${560 - curveLift} 840 ${300 - (curveLift >> 1)}" fill="none" stroke="url(#${gid}p)" stroke-width="3"/>
<path d="M-20 600 Q 320 ${600 - curveLift} 840 ${360 - (curveLift >> 1)}" fill="none" stroke="${champagne}" stroke-opacity="0.08" stroke-width="40"/>
<circle cx="700" cy="${300 - (curveLift >> 1)}" r="6" fill="${champagne}"/>
<circle cx="700" cy="${300 - (curveLift >> 1)}" r="16" fill="${champagne}" fill-opacity="0.18"/>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
