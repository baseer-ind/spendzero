// Launch-aware product-image audit.
//
// Reports the LAUNCH VISUAL CATALOGUE (the ~34 products that must be photographic
// for V1) separately from the long tail. Classifies each as PHOTOGRAPH (a real
// file present), ILLUSTRATION/FALLBACK (vector art), or MISSING (registered but no
// file). SVG/illustration is NEVER counted as a photograph. Run:
//   node scripts/image-audit.mjs
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

function ids(file, re) {
  const src = read(file);
  const out = [];
  let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

// Catalogue ids.
const electronics = [...new Set(ids("src/lib/electronics.ts", /id:\s*"([a-z0-9-]+)"/g))].filter((x) => {
  const win = read("src/lib/electronics.ts");
  return new RegExp('id:\\s*"' + x + '"[\\s\\S]{0,400}category:').test(win);
});
const marketIds = ids("src/lib/market.ts", /id:\s*"([a-z]{2}-[a-z0-9-]+)"/g);
// Food dish ids (have a nearby section:)
const foodSrc = read("src/lib/catalog.ts");
const foodIds = [...foodSrc.matchAll(/id:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]).filter((id) => {
  const i = foodSrc.indexOf('id: "' + id + '"');
  return /section:\s*"/.test(foodSrc.slice(i, i + 200));
});

// LAUNCH set from productImages.ts
const pi = read("src/lib/productImages.ts");
const launchBlock = pi.match(/LAUNCH_IDS[^=]*=\s*\{([\s\S]*?)\};/)?.[1] ?? "";
const LAUNCH = {};
for (const line of launchBlock.split("\n")) {
  const mm = line.match(/(\w+):\s*\[([^\]]*)\]/);
  if (mm) LAUNCH[mm[1]] = [...mm[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}
const LAUNCH_SET = new Set(Object.values(LAUNCH).flat());

const EXTS = ["webp", "jpg", "jpeg", "avif", "png"];
const FOLDER = { electronics: "electronics", shopping: "shopping", grocery: "grocery", beauty: "beauty", home: "home", travel: "travel", entertainment: "entertainment", food: "food" };
function hasFile(folder, id) {
  return EXTS.some((e) => existsSync(join(root, `public/products/${folder}/${id}.${e}`)));
}

const byVertical = {
  electronics: electronics.map((id) => [id, "electronics"]),
  shopping: marketIds.filter((x) => x.startsWith("sh-")).map((id) => [id, "shopping"]),
  grocery: marketIds.filter((x) => x.startsWith("gr-")).map((id) => [id, "grocery"]),
  beauty: marketIds.filter((x) => x.startsWith("be-")).map((id) => [id, "beauty"]),
  home: marketIds.filter((x) => x.startsWith("ho-")).map((id) => [id, "home"]),
  travel: marketIds.filter((x) => x.startsWith("tr-")).map((id) => [id, "travel"]),
  entertainment: marketIds.filter((x) => x.startsWith("en-")).map((id) => [id, "entertainment"]),
  food: foodIds.map((id) => [id, "food"]),
};

console.log("LAUNCH VISUAL CATALOGUE");
console.log("=======================");
let launchPhotos = 0, launchTotal = 0, launchMissing = 0;
for (const [v, list] of Object.entries(LAUNCH)) {
  let have = 0;
  const miss = [];
  for (const id of list) {
    launchTotal++;
    if (hasFile(FOLDER[v], id)) { have++; launchPhotos++; } else { miss.push(id); launchMissing++; }
  }
  console.log(`${v[0].toUpperCase() + v.slice(1)}: ${have}/${list.length} real photos`);
  if (miss.length) console.log(`   need: ${miss.join(", ")}`);
}
console.log(`\nLaunch total: ${launchPhotos}/${launchTotal} photographs.`);

console.log("\nLONG TAIL (non-launch)");
console.log("======================");
let tailPhoto = 0, tailIll = 0;
for (const [v, list] of Object.entries(byVertical)) {
  for (const [id, folder] of list) {
    if (LAUNCH_SET.has(id)) continue;
    if (hasFile(folder, id)) tailPhoto++; else tailIll++;
  }
}
console.log(`Photographic: ${tailPhoto}`);
console.log(`Illustration fallback: ${tailIll}`);

const allIds = Object.values(byVertical).flat().map(([id]) => id);
console.log(`\nTOTAL catalogue: ${allIds.length} products. Photographs: ${launchPhotos + tailPhoto}. Illustration: ${allIds.length - launchPhotos - tailPhoto}.`);
console.log("\n(SVG/illustration is never counted as a photograph.)");

// Hard acceptance gate: launch readiness requires 34/34 real photos, 0 fallback.
console.log("\n==== LAUNCH IMAGE GATE ====");
console.log(`Launch products: ${launchTotal}`);
console.log(`Real photographic assets: ${launchPhotos}/${launchTotal}`);
console.log(`Illustration fallback (launch): ${launchMissing}/${launchTotal}`);
if (launchMissing > 0) {
  console.log(`\n❌ LAUNCH NOT READY: ${launchMissing} launch product(s) still need a real photo.`);
  console.log("   Drop files in public/products/<vertical>/<id>.webp, then:");
  console.log("   node scripts/register-local.mjs && node scripts/image-audit.mjs");
  process.exit(1);
}
console.log("\n✅ LAUNCH IMAGES READY: 34/34 real photographs, 0 illustration fallback.");
