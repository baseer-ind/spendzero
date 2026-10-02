// Honest product-image audit. Classifies every catalogue product's image as:
//   PHOTOGRAPH  — a real file under public/products/<folder>/<id>.(jpg|webp|avif|png)
//   ILLUSTRATION/FALLBACK — generated vector art (productArt) will be used
//   MISSING     — listed in HAS_PHOTO but the file is absent (a real failure)
//
// SVG/illustration/emoji are NOT counted as real images. Exit code is non-zero if
// any product in HAS_PHOTO is missing its file. Run: `node scripts/image-audit.mjs`.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

// Parse product ids per vertical without importing TS.
function ids(file, re) {
  const src = read(file);
  const out = [];
  let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

const electronics = ids("src/lib/electronics.ts", /id:\s*"([a-z0-9-]+)"/g).filter((x) => x.includes("-"));
// market.ts product ids look like gr-xxx / sh-xxx etc.
const marketIds = ids("src/lib/market.ts", /id:\s*"([a-z]{2}-[a-z0-9-]+)"/g);
const foodIds = ids("src/lib/catalog.ts", /id:\s*"([a-z]{2,}-[a-z0-9-]+)"/g);

// HAS_PHOTO set
const photoSrc = read("src/lib/productImages.ts");
const hasPhotoBlock = photoSrc.match(/HAS_PHOTO = new Set<string>\(\[([^\]]*)\]/s)?.[1] ?? "";
const HAS_PHOTO = new Set([...hasPhotoBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]));

const FOLDER = {
  electronics: "electronics", grocery: "grocery", shopping: "shopping", beauty: "beauty",
  home: "home", travel: "travel", entertainment: "entertainment", food: "food",
};
const PREFIX_FOLDER = { gr: "grocery", sh: "fashion", tr: "travel", en: "entertainment", be: "beauty", ho: "home" };
const EXTS = ["jpg", "webp", "avif", "png", "jpeg"];

function fileFor(folder, id) {
  for (const e of EXTS) {
    const p = `public/products/${folder}/${id}.${e}`;
    if (existsSync(join(root, p))) return p;
  }
  return null;
}

function classify(id, folder) {
  const file = fileFor(folder, id);
  if (file) return { kind: "PHOTOGRAPH", file };
  if (HAS_PHOTO.has(id)) return { kind: "MISSING", file: null };
  return { kind: "FALLBACK", file: null };
}

const groups = [
  ["Electronics", electronics.map((id) => [id, "electronics"])],
  ["Shopping", marketIds.filter((x) => x.startsWith("sh-")).map((id) => [id, "shopping"])],
  ["Grocery", marketIds.filter((x) => x.startsWith("gr-")).map((id) => [id, "grocery"])],
  ["Beauty", marketIds.filter((x) => x.startsWith("be-")).map((id) => [id, "beauty"])],
  ["Home", marketIds.filter((x) => x.startsWith("ho-")).map((id) => [id, "home"])],
  ["Travel", marketIds.filter((x) => x.startsWith("tr-")).map((id) => [id, "travel"])],
  ["Entertainment", marketIds.filter((x) => x.startsWith("en-")).map((id) => [id, "entertainment"])],
  ["Food", foodIds.map((id) => [id, "food"])],
];

console.log("PRODUCT IMAGE AUDIT\n===================");
let missing = 0;
let totalPhotos = 0;
let total = 0;
for (const [name, list] of groups) {
  let photos = 0;
  const miss = [];
  for (const [id, folder] of list) {
    const r = classify(id, FOLDER[folder] ? folder : folder);
    if (r.kind === "PHOTOGRAPH") photos++;
    if (r.kind === "MISSING") miss.push(id);
  }
  total += list.length;
  totalPhotos += photos;
  missing += miss.length;
  console.log(`\n${name}: ${photos}/${list.length} real photos` + (photos === 0 ? "  (all illustration fallback)" : ""));
  if (miss.length) console.log(`  MISSING files for: ${miss.join(", ")}`);
}

console.log(`\n-------------------\nTOTAL: ${totalPhotos}/${total} real photographs; ${total - totalPhotos} using illustration fallback.`);
if (missing > 0) {
  console.log(`\nFAIL: ${missing} product(s) are in HAS_PHOTO but their image file is missing.`);
  process.exit(1);
}
if (totalPhotos === 0) {
  console.log("\nNOTE: 0 real photographs present. The catalogue is currently illustration-only.");
  console.log("To populate: add files to public/products/<folder>/<id>.(jpg|webp) and list the ids in HAS_PHOTO.");
}
console.log("\nOK: no broken photo references.");
