// Product imagery that reads as a real catalogue: clean vector product
// illustrations on a light studio background with a soft shadow — not an emoji on
// a dark gradient. Offline, stable, legal (no brand/trademark imagery, no
// external hosts). Real licensed photographs can replace these per-product via
// the ProductImage `src` without any component change. See docs/FINAL_UX_REALISM_AUDIT.md.

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Tasteful product colourways, picked by seed (so a product is stable).
const COLORWAYS = [
  { a: "#2b3444", b: "#3f4a5c", c: "#8a94a6" }, // slate
  { a: "#1f4d5c", b: "#2f6b7d", c: "#7fb6c4" }, // teal
  { a: "#5c2b3a", b: "#7d3f52", c: "#c48a9c" }, // rose
  { a: "#4a3b1f", b: "#6b5630", c: "#c9ab74" }, // amber
  { a: "#2f2b5c", b: "#443f7d", c: "#938ec4" }, // indigo
  { a: "#2b5c3a", b: "#3f7d52", c: "#8ac49c" }, // green
  { a: "#5c4a2b", b: "#7d663f", c: "#c4a97f" }, // tan
  { a: "#3a2b5c", b: "#523f7d", c: "#9c8ac4" }, // violet
];

// keyword → product silhouette kind.
const KIND: [string, string][] = [
  ["earbud", "earbuds"], ["headphone", "headphones"], ["smartphone", "phone"], ["phone", "phone"],
  ["smartwatch", "watch"], ["watch", "watch"], ["laptop", "laptop"], ["monitor", "monitor"],
  ["keyboard", "keyboard"], ["gamepad", "gamepad"], ["game", "gamepad"], ["camera", "camera"],
  ["vlog", "camera"], ["power bank", "powerbank"], ["speaker", "speaker"],
  ["tshirt", "tshirt"], ["t-shirt", "tshirt"], ["kurta", "kurta"], ["kurti", "kurta"], ["saree", "saree"],
  ["jeans", "jeans"], ["denim", "jeans"], ["shoe", "shoe"], ["footwear", "shoe"], ["sandal", "shoe"],
  ["handbag", "bag"], ["backpack", "backpack"], ["bag", "bag"], ["sunglass", "sunglasses"], ["wallet", "wallet"],
  ["banana", "produce"], ["tomato", "produce"], ["onion", "produce"], ["vegetable", "produce"], ["fruit", "produce"],
  ["milk", "carton"], ["paneer", "carton"], ["atta", "sack"], ["flour", "sack"], ["rice", "sack"], ["staple", "sack"],
  ["noodles", "packet"], ["biscuit", "packet"], ["snack", "packet"], ["tea", "box"], ["detergent", "box"], ["dishwash", "bottle"],
  ["face wash", "tube"], ["moisturizer", "tube"], ["lipstick", "lipstick"], ["kajal", "lipstick"],
  ["shampoo", "bottle"], ["hair oil", "bottle"], ["perfume", "perfume"], ["beard", "bottle"], ["bottle", "bottle"],
  ["cookware", "pan"], ["pan", "pan"], ["cooker", "pan"], ["mixer", "appliance"], ["vacuum", "appliance"], ["appliance", "appliance"],
  ["wall art", "frame"], ["lamp", "lamp"], ["chair", "chair"], ["furniture", "chair"], ["bedsheet", "bedding"], ["bedding", "bedding"],
  ["cleaner", "bottle"],
  ["flight", "plane"], ["airplane", "plane"], ["hotel", "hotel"], ["resort", "hotel"], ["train", "train"], ["package", "mountain"], ["himalaya", "mountain"], ["kerala", "mountain"], ["beach", "mountain"], ["travel", "plane"],
  ["movie", "ticket"], ["cinema", "ticket"], ["recliner", "ticket"], ["concert", "note"], ["comedy", "note"], ["event", "note"], ["streaming", "play"], ["music", "note"],
];

function kindFor(keyword: string): string {
  const k = keyword.toLowerCase();
  for (const [needle, kind] of KIND) if (k.includes(needle)) return kind;
  return "box";
}

// --- product silhouettes, drawn centred around (200,150) in a 400x300 viewBox ---
function draw(kind: string, c: { a: string; b: string; c: string }): string {
  const o = "#1a1d24"; // outline
  const sw = 'stroke="' + o + '" stroke-width="3" stroke-linejoin="round"';
  switch (kind) {
    case "headphones":
      return `<path d="M120 150a80 80 0 0 1 160 0" fill="none" ${sw}/><rect x="104" y="140" width="34" height="60" rx="12" fill="${c.b}" ${sw}/><rect x="262" y="140" width="34" height="60" rx="12" fill="${c.b}" ${sw}/>`;
    case "earbuds":
      return `<g><circle cx="165" cy="130" r="22" fill="${c.c}" ${sw}/><rect x="158" y="148" width="14" height="46" rx="7" fill="${c.b}" ${sw}/></g><g><circle cx="235" cy="130" r="22" fill="${c.c}" ${sw}/><rect x="228" y="148" width="14" height="46" rx="7" fill="${c.b}" ${sw}/></g>`;
    case "phone":
      return `<rect x="158" y="80" width="84" height="150" rx="16" fill="${c.b}" ${sw}/><rect x="168" y="94" width="64" height="118" rx="6" fill="${c.c}"/><circle cx="222" cy="104" r="4" fill="${o}"/>`;
    case "watch":
      return `<rect x="176" y="96" width="48" height="24" rx="8" fill="${c.b}" ${sw}/><rect x="176" y="178" width="48" height="24" rx="8" fill="${c.b}" ${sw}/><rect x="164" y="112" width="72" height="80" rx="18" fill="${c.a}" ${sw}/><rect x="176" y="124" width="48" height="56" rx="10" fill="${c.c}"/>`;
    case "laptop":
      return `<rect x="140" y="92" width="120" height="78" rx="8" fill="${c.b}" ${sw}/><rect x="150" y="102" width="100" height="58" rx="3" fill="${c.c}"/><path d="M122 176h156l10 22H112z" fill="${c.a}" ${sw}/>`;
    case "monitor":
      return `<rect x="128" y="86" width="144" height="92" rx="8" fill="${c.b}" ${sw}/><rect x="138" y="96" width="124" height="72" rx="3" fill="${c.c}"/><rect x="188" y="178" width="24" height="26" fill="${c.b}" ${sw}/><rect x="164" y="204" width="72" height="10" rx="4" fill="${c.a}" ${sw}/>`;
    case "keyboard":
      return `<rect x="116" y="120" width="168" height="62" rx="10" fill="${c.b}" ${sw}/>${Array.from({length:30},(_,i)=>`<rect x="${128+(i%10)*15}" y="${132+Math.floor(i/10)*15}" width="10" height="10" rx="2" fill="${c.c}"/>`).join("")}`;
    case "gamepad":
      return `<path d="M150 120h100c22 0 34 20 40 46 6 28-16 40-34 28l-18-16h-76l-18 16c-18 12-40 0-34-28 6-26 18-46 40-46z" fill="${c.b}" ${sw}/><circle cx="176" cy="150" r="7" fill="${c.c}"/><circle cx="224" cy="150" r="7" fill="${c.c}"/>`;
    case "camera":
      return `<rect x="140" y="112" width="120" height="84" rx="12" fill="${c.b}" ${sw}/><rect x="168" y="100" width="36" height="16" rx="4" fill="${c.a}" ${sw}/><circle cx="200" cy="156" r="30" fill="${c.a}" ${sw}/><circle cx="200" cy="156" r="16" fill="${c.c}"/>`;
    case "powerbank":
      return `<rect x="158" y="96" width="84" height="120" rx="14" fill="${c.b}" ${sw}/><rect x="174" y="150" width="52" height="8" rx="4" fill="${c.c}"/><rect x="174" y="166" width="34" height="8" rx="4" fill="${c.c}"/>`;
    case "speaker":
      return `<rect x="156" y="88" width="88" height="128" rx="16" fill="${c.b}" ${sw}/><circle cx="200" cy="128" r="18" fill="${c.a}" ${sw}/><circle cx="200" cy="180" r="24" fill="${c.a}" ${sw}/><circle cx="200" cy="180" r="10" fill="${c.c}"/>`;
    case "tshirt":
      return `<path d="M150 108l34-16 16 14 16-14 34 16 16 34-26 14-6-10v94h-68v-94l-6 10-26-14z" fill="${c.b}" ${sw}/>`;
    case "kurta":
      return `<path d="M156 100l24-12 20 12 20-12 24 12v110c0 8-6 14-14 14h-60c-8 0-14-6-14-14z" fill="${c.b}" ${sw}/><line x1="200" y1="100" x2="200" y2="224" stroke="${c.c}" stroke-width="3"/>`;
    case "saree":
      return `<path d="M150 96c40 10 60 40 60 80s14 36 40 48c-50 14-100-10-108-60-5-30 0-56 8-68z" fill="${c.b}" ${sw}/>`;
    case "jeans":
      return `<path d="M164 92h72v40l-6 96h-26l-4-74-4 74h-26l-6-96z" fill="${c.b}" ${sw}/><line x1="200" y1="96" x2="200" y2="130" stroke="${c.c}" stroke-width="3"/>`;
    case "shoe":
      return `<path d="M120 180c20-6 34-18 50-34 10 8 28 12 60 14 22 2 44 8 48 22 2 10-6 16-18 16H126c-8 0-12-10-6-18z" fill="${c.b}" ${sw}/><path d="M118 198h160" stroke="${c.c}" stroke-width="6"/>`;
    case "bag":
      return `<path d="M156 120h88l10 96h-108z" fill="${c.b}" ${sw}/><path d="M172 120c0-20 12-32 28-32s28 12 28 32" fill="none" ${sw}/>`;
    case "backpack":
      return `<rect x="150" y="104" width="100" height="120" rx="24" fill="${c.b}" ${sw}/><rect x="172" y="150" width="56" height="50" rx="10" fill="${c.c}"/><path d="M176 108c0-16 48-16 48 0" fill="none" ${sw}/>`;
    case "sunglasses":
      return `<path d="M130 140h140" ${sw}/><rect x="132" y="138" width="54" height="34" rx="16" fill="${c.c}" ${sw}/><rect x="214" y="138" width="54" height="34" rx="16" fill="${c.c}" ${sw}/>`;
    case "wallet":
      return `<rect x="146" y="116" width="108" height="72" rx="10" fill="${c.b}" ${sw}/><rect x="212" y="140" width="42" height="26" rx="6" fill="${c.a}" ${sw}/><circle cx="226" cy="153" r="5" fill="${c.c}"/>`;
    case "produce":
      return `<circle cx="178" cy="160" r="34" fill="${c.c}" ${sw}/><circle cx="224" cy="150" r="28" fill="${c.b}" ${sw}/><path d="M224 122c6-10 2-16-4-18" fill="none" ${sw}/>`;
    case "carton":
      return `<path d="M168 110h64v8l-10 10v88h-44v-88l-10-10z" fill="${c.b}" ${sw}/><rect x="176" y="150" width="48" height="30" rx="3" fill="${c.c}"/>`;
    case "sack":
      return `<path d="M160 118c10-8 70-8 80 0l8 86c2 14-10 20-48 20s-50-6-48-20z" fill="${c.b}" ${sw}/><rect x="176" y="150" width="48" height="34" rx="4" fill="${c.c}"/>`;
    case "packet":
      return `<path d="M158 104h84v8l-6 6 6 6v70c0 8-6 14-14 14h-56c-8 0-14-6-14-14v-70l6-6-6-6z" fill="${c.b}" ${sw}/><rect x="172" y="146" width="56" height="30" rx="3" fill="${c.c}"/>`;
    case "box":
      return `<path d="M150 118l50-20 50 20-50 20z" fill="${c.c}" ${sw}/><path d="M150 118v70l50 20v-70z" fill="${c.b}" ${sw}/><path d="M250 118v70l-50 20v-70z" fill="${c.a}" ${sw}/>`;
    case "tube":
      return `<rect x="176" y="94" width="48" height="118" rx="10" fill="${c.b}" ${sw}/><rect x="186" y="80" width="28" height="18" rx="4" fill="${c.a}" ${sw}/><rect x="186" y="140" width="28" height="30" rx="4" fill="${c.c}"/>`;
    case "lipstick":
      return `<rect x="182" y="150" width="36" height="66" rx="6" fill="${c.a}" ${sw}/><path d="M186 150h28v-44l-8-18h-12l-8 18z" fill="${c.c}" ${sw}/>`;
    case "bottle":
      return `<path d="M184 86h32v22l10 14v88c0 8-6 14-14 14h-24c-8 0-14-6-14-14v-88l10-14z" fill="${c.b}" ${sw}/><rect x="188" y="78" width="24" height="12" rx="3" fill="${c.a}" ${sw}/><rect x="176" y="150" width="48" height="34" rx="4" fill="${c.c}"/>`;
    case "perfume":
      return `<rect x="174" y="120" width="52" height="92" rx="10" fill="${c.b}" ${sw}/><rect x="190" y="98" width="20" height="24" fill="${c.b}" ${sw}/><rect x="186" y="84" width="28" height="16" rx="3" fill="${c.a}" ${sw}/><rect x="184" y="150" width="32" height="34" rx="4" fill="${c.c}"/>`;
    case "pan":
      return `<ellipse cx="190" cy="168" rx="60" ry="22" fill="${c.b}" ${sw}/><ellipse cx="190" cy="162" rx="60" ry="22" fill="${c.c}" ${sw}/><rect x="250" y="156" width="70" height="12" rx="6" fill="${c.a}" ${sw}/>`;
    case "appliance":
      return `<path d="M164 110h72v70c0 16-12 26-36 26s-36-10-36-26z" fill="${c.b}" ${sw}/><rect x="176" y="92" width="48" height="22" rx="6" fill="${c.a}" ${sw}/><rect x="180" y="150" width="40" height="22" rx="4" fill="${c.c}"/>`;
    case "frame":
      return `<rect x="150" y="96" width="100" height="108" rx="6" fill="${c.a}" ${sw}/><rect x="164" y="110" width="72" height="80" rx="3" fill="${c.c}"/><path d="M164 190l24-30 16 16 14-20 18 34z" fill="${c.b}"/>`;
    case "lamp":
      return `<path d="M168 110h64l-14 34h-36z" fill="${c.c}" ${sw}/><rect x="196" y="144" width="8" height="56" fill="${c.b}" ${sw}/><ellipse cx="200" cy="206" rx="34" ry="10" fill="${c.a}" ${sw}/>`;
    case "chair":
      return `<rect x="166" y="96" width="60" height="70" rx="12" fill="${c.b}" ${sw}/><rect x="160" y="166" width="72" height="18" rx="6" fill="${c.c}" ${sw}/><line x1="172" y1="184" x2="166" y2="214" ${sw}/><line x1="220" y1="184" x2="226" y2="214" ${sw}/>`;
    case "bedding":
      return `<path d="M136 150h128v40c0 8-6 14-14 14H150c-8 0-14-6-14-14z" fill="${c.b}" ${sw}/><path d="M150 150c0-24 100-24 100 0" fill="${c.c}" ${sw}/><rect x="158" y="134" width="40" height="22" rx="8" fill="#fff" ${sw}/>`;
    case "plane":
      return `<path d="M120 160l150-26 20-18 12 4-8 22 36 20-6 10-44-6-26 28-10-2 6-26-40 6-14 14-10-2z" fill="${c.b}" ${sw}/>`;
    case "hotel":
      return `<rect x="150" y="110" width="100" height="94" rx="6" fill="${c.b}" ${sw}/>${Array.from({length:12},(_,i)=>`<rect x="${164+(i%4)*22}" y="${124+Math.floor(i/4)*26}" width="12" height="14" rx="2" fill="${c.c}"/>`).join("")}`;
    case "train":
      return `<rect x="140" y="110" width="120" height="78" rx="18" fill="${c.b}" ${sw}/><rect x="152" y="124" width="96" height="30" rx="6" fill="${c.c}"/><circle cx="168" cy="194" r="10" fill="${c.a}" ${sw}/><circle cx="232" cy="194" r="10" fill="${c.a}" ${sw}/>`;
    case "mountain":
      return `<path d="M110 196l44-80 30 44 24-34 46 70z" fill="${c.b}" ${sw}/><path d="M138 152l16-36 14 22-10 14z" fill="#fff"/>`;
    case "ticket":
      return `<path d="M140 120h120v20a10 10 0 0 0 0 20v20H140v-20a10 10 0 0 0 0-20z" fill="${c.b}" ${sw}/><line x1="214" y1="120" x2="214" y2="180" stroke="${c.c}" stroke-width="3" stroke-dasharray="6 6"/>`;
    case "note":
      return `<circle cx="178" cy="196" r="16" fill="${c.b}" ${sw}/><circle cx="238" cy="186" r="16" fill="${c.b}" ${sw}/><path d="M194 196v-78l60-14v78" fill="none" ${sw}/>`;
    case "play":
      return `<rect x="150" y="104" width="100" height="92" rx="14" fill="${c.b}" ${sw}/><path d="M188 134l34 20-34 20z" fill="#fff" ${sw}/>`;
    default:
      return `<path d="M150 118l50-20 50 20-50 20z" fill="${c.c}" ${sw}/><path d="M150 118v70l50 20v-70z" fill="${c.b}" ${sw}/><path d="M250 118v70l-50 20v-70z" fill="${c.a}" ${sw}/>`;
  }
}

/** Realistic-feeling product tile: light studio background + vector product + soft shadow. */
export function productArt(keyword: string, seed: string): string {
  const h = hash(seed || keyword);
  const c = COLORWAYS[h % COLORWAYS.length];
  const kind = kindFor(keyword);
  const gid = `p${h % 100000}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfbfd"/><stop offset="1" stop-color="#e7e8ee"/></linearGradient>
<radialGradient id="${gid}h" cx="0.5" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>
<rect width="400" height="300" fill="url(#${gid})"/>
<rect width="400" height="300" fill="url(#${gid}h)"/>
<ellipse cx="200" cy="232" rx="92" ry="16" fill="#000000" opacity="0.10"/>
${draw(kind, c)}
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function productKind(keyword: string): string {
  return kindFor(keyword);
}
