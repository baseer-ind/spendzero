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
  const glowX = 32 + (h % 36); // 32–68%
  const curveLift = 150 + ((h >> 4) % 150); // how high the path rises
  const gid = `s${h % 100000}`;
  const champagne = "#C9A988";
  // Seeded star field for texture.
  let stars = "";
  for (let i = 0; i < 26; i++) {
    const sx = (hash(seed + "x" + i) % 800);
    const sy = (hash(seed + "y" + i) % 300);
    const sr = 0.6 + (hash(seed + "r" + i) % 14) / 10;
    const so = 0.1 + (hash(seed + "o" + i) % 45) / 100;
    stars += `<circle cx="${sx}" cy="${sy}" r="${sr.toFixed(1)}" fill="#fff" fill-opacity="${so.toFixed(2)}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b232c"/><stop offset="0.4" stop-color="#141b22"/><stop offset="0.75" stop-color="#0F1419"/><stop offset="1" stop-color="#090c10"/></linearGradient>
<radialGradient id="${gid}g" cx="${glowX}%" cy="30%" r="60%"><stop offset="0" stop-color="#E9D4B0" stop-opacity="0.55"/><stop offset="0.35" stop-color="${champagne}" stop-opacity="0.22"/><stop offset="1" stop-color="${champagne}" stop-opacity="0"/></radialGradient>
<linearGradient id="${gid}p" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${champagne}" stop-opacity="0.1"/><stop offset="1" stop-color="#F0DDBE" stop-opacity="0.95"/></linearGradient>
<linearGradient id="${gid}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#20160f"/><stop offset="1" stop-color="#0b0e12"/></linearGradient>
</defs>
<rect width="800" height="600" fill="url(#${gid})"/>
${stars}
<rect width="800" height="600" fill="url(#${gid}g)"/>
<circle cx="${glowX * 8}" cy="168" r="46" fill="#F3E6CC" fill-opacity="0.9"/>
<circle cx="${glowX * 8}" cy="168" r="78" fill="#E9D4B0" fill-opacity="0.18"/>
<path d="M0 430 L150 330 L300 410 L430 300 L560 400 L690 330 L800 400 L800 600 L0 600 Z" fill="url(#${gid}m)" fill-opacity="0.9"/>
<path d="M0 470 L120 410 L260 465 L400 390 L540 460 L680 405 L800 455 L800 600 L0 600 Z" fill="#0b0e12" fill-opacity="0.85"/>
<path d="M-20 600 Q 340 ${600 - curveLift} 840 ${360 - (curveLift >> 1)}" fill="none" stroke="${champagne}" stroke-opacity="0.07" stroke-width="46"/>
<path d="M-20 560 Q 320 ${560 - curveLift} 840 ${300 - (curveLift >> 1)}" fill="none" stroke="url(#${gid}p)" stroke-width="3.5"/>
<circle cx="700" cy="${300 - (curveLift >> 1)}" r="6" fill="#F3E6CC"/>
<circle cx="700" cy="${300 - (curveLift >> 1)}" r="18" fill="${champagne}" fill-opacity="0.22"/>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Dedicated cinematic backdrops for the three onboarding intro screens. Each is
 * a distinct composition on the Midnight → champagne palette, designed so copy
 * sits legibly over the lower third. Offline, gender-neutral, no stock/Japan.
 *   "idea"   — dawn horizon + a lone figure starting a path
 *   "problem"— a quiet, still night field (the pause)
 *   "future" — an open valley opening toward a bright, rising destination
 */
export function onboardingScene(kind: "idea" | "problem" | "future"): string {
  const champagne = "#C9A988";
  const star = (seed: string, n: number, maxY: number) => {
    let s = "";
    for (let i = 0; i < n; i++) {
      const x = hash(seed + "sx" + i) % 800;
      const y = hash(seed + "sy" + i) % maxY;
      const r = 0.5 + (hash(seed + "sr" + i) % 13) / 10;
      const o = 0.12 + (hash(seed + "so" + i) % 50) / 100;
      s += `<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="#fff" fill-opacity="${o.toFixed(2)}"/>`;
    }
    return s;
  };

  let scene: string;
  if (kind === "idea") {
    scene = `
<radialGradient id="og" cx="50%" cy="34%" r="62%"><stop offset="0" stop-color="#F0DEC0" stop-opacity="0.6"/><stop offset="0.4" stop-color="${champagne}" stop-opacity="0.2"/><stop offset="1" stop-color="${champagne}" stop-opacity="0"/></radialGradient>
<rect width="800" height="600" fill="url(#bg)"/>${star("idea", 22, 320)}<rect width="800" height="600" fill="url(#og)"/>
<circle cx="400" cy="210" r="52" fill="#F5EAD2" fill-opacity="0.95"/><circle cx="400" cy="210" r="92" fill="#E9D4B0" fill-opacity="0.16"/>
<path d="M0 450 Q 400 360 800 440 L800 600 L0 600 Z" fill="#161d25"/>
<path d="M0 500 Q 400 430 800 495 L800 600 L0 600 Z" fill="#0c1015"/>
<path d="M300 600 Q 420 480 420 300" fill="none" stroke="${champagne}" stroke-opacity="0.5" stroke-width="2.5" stroke-dasharray="2 10" stroke-linecap="round"/>
<g transform="translate(372 452)"><ellipse cx="14" cy="60" rx="20" ry="5" fill="#000" fill-opacity="0.35"/><circle cx="14" cy="10" r="9" fill="#0b0e12"/><path d="M14 19 C 6 24 4 40 8 58 M14 19 C 22 24 24 40 20 58" stroke="#0b0e12" stroke-width="9" stroke-linecap="round" fill="none"/></g>`;
  } else if (kind === "problem") {
    scene = `
<radialGradient id="og" cx="62%" cy="26%" r="55%"><stop offset="0" stop-color="${champagne}" stop-opacity="0.3"/><stop offset="1" stop-color="${champagne}" stop-opacity="0"/></radialGradient>
<rect width="800" height="600" fill="url(#bg)"/>${star("problem", 30, 360)}<rect width="800" height="600" fill="url(#og)"/>
<circle cx="560" cy="150" r="30" fill="#EFE2C6" fill-opacity="0.5"/>
<path d="M0 470 L200 410 L360 460 L540 395 L720 455 L800 430 L800 600 L0 600 Z" fill="#12181f"/>
<path d="M0 520 Q 400 480 800 515 L800 600 L0 600 Z" fill="#0b0e12"/>
<circle cx="120" cy="250" r="1.6" fill="${champagne}" fill-opacity="0.8"/><circle cx="680" cy="300" r="1.4" fill="${champagne}" fill-opacity="0.7"/>`;
  } else {
    scene = `
<radialGradient id="og" cx="50%" cy="30%" r="70%"><stop offset="0" stop-color="#F6ECD6" stop-opacity="0.7"/><stop offset="0.35" stop-color="#E3CBA5" stop-opacity="0.3"/><stop offset="1" stop-color="${champagne}" stop-opacity="0"/></radialGradient>
<linearGradient id="opath" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${champagne}" stop-opacity="0.12"/><stop offset="1" stop-color="#F3E6CC" stop-opacity="0.95"/></linearGradient>
<rect width="800" height="600" fill="url(#bg)"/>${star("future", 20, 300)}<rect width="800" height="600" fill="url(#og)"/>
<circle cx="400" cy="175" r="60" fill="#F7EEDC" fill-opacity="0.95"/><circle cx="400" cy="175" r="110" fill="#E9D4B0" fill-opacity="0.18"/>
<path d="M0 420 L170 320 L330 400 L470 300 L620 390 L800 330 L800 600 L0 600 Z" fill="#1a130d" fill-opacity="0.92"/>
<path d="M0 470 L160 420 L320 470 L480 410 L640 465 L800 420 L800 600 L0 600 Z" fill="#0b0e12"/>
<path d="M300 600 Q 410 440 410 250" fill="none" stroke="url(#opath)" stroke-width="5" stroke-linecap="round"/>
<path d="M260 600 Q 410 450 410 250" fill="none" stroke="${champagne}" stroke-opacity="0.08" stroke-width="40" stroke-linecap="round"/>
<circle cx="410" cy="250" r="7" fill="#F7EEDC"/><circle cx="410" cy="250" r="22" fill="#E9D4B0" fill-opacity="0.25"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c242e"/><stop offset="0.45" stop-color="#141b22"/><stop offset="0.8" stop-color="#0F1419"/><stop offset="1" stop-color="#090c10"/></linearGradient>${scene.includes("<radialGradient") || scene.includes("<linearGradient") ? "" : ""}</defs>${scene}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
