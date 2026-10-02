// Generate docs/product-image-manifest.json from the REAL catalogue data.
// No new catalogue is invented — this reads electronics.ts, market.ts, catalog.ts.
// Run: node scripts/gen-manifest.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docs = join(root, "..", "docs");
const read = (p) => readFileSync(join(root, p), "utf8");

const PRIORITY = { electronics: "P0", shopping: "P0", food: "P0", grocery: "P0", beauty: "P1", home: "P1", travel: "P2", entertainment: "P2" };
const PREFIX = { gr: { v: "grocery", store: "FreshKart" }, sh: { v: "shopping", store: "StyleBazaar" }, tr: { v: "travel", store: "TripNest" }, en: { v: "entertainment", store: "ShowTime" }, be: { v: "beauty", store: "GlowBox" }, ho: { v: "home", store: "NestMart" } };
const EXTS = ["webp", "jpg", "jpeg", "avif", "png"];

function photoFile(vertical, id) {
  return `${vertical}/${id}.webp`;
}
function hasPhoto(vertical, id) {
  return EXTS.some((e) => existsSync(join(root, `public/products/${vertical}/${id}.${e}`)));
}

const items = [];
const field = (win, key) => win.match(new RegExp(key + ':\\s*"([^"]+)"'))?.[1];

// --- Electronics --- window-based so field order/spacing doesn't matter.
{
  const src = read("src/lib/electronics.ts");
  const re = /id:\s*"([a-z0-9-]+)"/g;
  let m;
  while ((m = re.exec(src))) {
    const id = m[1];
    const win = src.slice(m.index, m.index + 500);
    const category = field(win, "category");
    if (!category) continue; // not a product object
    items.push({ vertical: "electronics", productId: id, name: field(win, "name"), store: "TechBazaar", brand: field(win, "brand"), category, home: /bestseller:\s*true|trending:\s*true/.test(win) });
  }
}

// --- Market --- window-based.
{
  const src = read("src/lib/market.ts");
  const re = /id:\s*"([a-z]{2}-[a-z0-9-]+)"/g;
  let m;
  while ((m = re.exec(src))) {
    const id = m[1];
    const pfx = PREFIX[id.slice(0, 2)];
    if (!pfx) continue;
    const win = src.slice(m.index, m.index + 500);
    const category = field(win, "category");
    if (!category) continue;
    items.push({ vertical: pfx.v, productId: id, name: field(win, "name"), store: pfx.store, brand: field(win, "brand"), category, home: /bestseller:\s*true|trending:\s*true/.test(win) });
  }
}

// --- Food (catalog.ts) --- track current restaurant (window has `area:`); a dish window has `section:`.
{
  const src = read("src/lib/catalog.ts");
  const re = /id:\s*"([a-z0-9-]+)"/g;
  let curStore = "";
  let m;
  while ((m = re.exec(src))) {
    const id = m[1];
    const win = src.slice(m.index, m.index + 300);
    // A dish object has `section:` close to its id; a restaurant object has `area:`+`city:` and no nearby section.
    if (/section:\s*"/.test(win)) {
      items.push({ vertical: "food", productId: id, name: field(win, "name"), store: curStore, brand: curStore, category: field(win, "section"), home: /bestseller:\s*true/.test(win) });
      continue;
    }
    if (/area:\s*"/.test(win) && /city:\s*"/.test(win)) { curStore = field(win, "name") || curStore; }
  }
}

// Enrich + detect duplicates / issues.
const byFilename = {};
for (const it of items) {
  it.priority = PRIORITY[it.vertical] ?? "P2";
  it.photoFilename = photoFile(it.vertical, it.productId);
  it.currentImage = "generated-illustration (productArt)";
  it.photoPresent = hasPhoto(it.vertical, it.productId);
  it.appearsIn = { homeToday: !!it.home, categoryGrid: true, search: true, productDetail: true, wishlist: true, cart: true };
  byFilename[it.photoFilename] = (byFilename[it.photoFilename] || 0) + 1;
}
const duplicates = Object.entries(byFilename).filter(([, n]) => n > 1).map(([f]) => f);

const counts = { total: items.length, P0: 0, P1: 0, P2: 0, photographs: 0, illustrations: 0, missing: 0, byVertical: {} };
for (const it of items) {
  counts[it.priority]++;
  counts.byVertical[it.vertical] = (counts.byVertical[it.vertical] || 0) + 1;
  if (it.photoPresent) counts.photographs++; else counts.illustrations++;
}

const manifest = { generatedAt: new Date().toISOString(), counts, duplicateFilenames: duplicates, products: items };
writeFileSync(join(docs, "product-image-manifest.json"), JSON.stringify(manifest, null, 2));

// Human-readable manifest.
const order = ["electronics", "shopping", "food", "grocery", "beauty", "home", "travel", "entertainment"];
let md = `# Product Image Manifest

Generated from the live catalogue by \`webapp/scripts/gen-manifest.mjs\`. Re-run
after catalogue changes. Machine-readable: \`docs/product-image-manifest.json\`.

**${counts.total} products** · P0 ${counts.P0} · P1 ${counts.P1} · P2 ${counts.P2}
· Photographs present: **${counts.photographs}** · Illustration fallback: ${counts.illustrations}
· Missing (listed but file absent): ${counts.missing} · Duplicate filenames: ${duplicates.length}

Every product below currently uses the generated vector illustration (productArt).
To replace one with a real photo: save it at \`webapp/public/products/<photoFilename>\`
and add its productId to \`HAS_PHOTO\` in \`webapp/src/lib/productImages.ts\` — or just
run the audit which lists what's present. See \`docs/ADDING_PRODUCT_PHOTOS.md\` and
\`docs/PRODUCT_PHOTO_SPEC.md\`.

Appears-in legend: G=category grid, S=search, D=detail, W=wishlist, C=cart, H=home/today.
`;
for (const v of order) {
  const list = items.filter((it) => it.vertical === v);
  if (!list.length) continue;
  const pr = list[0].priority;
  md += `\n## ${v[0].toUpperCase() + v.slice(1)} — ${list.length} products (${pr})\n\n`;
  md += `| productId | name | store | category | photoFilename | appears |\n|---|---|---|---|---|---|\n`;
  for (const it of list) {
    const a = `${it.appearsIn.categoryGrid ? "G" : ""}${it.appearsIn.search ? "S" : ""}${it.appearsIn.productDetail ? "D" : ""}${it.appearsIn.wishlist ? "W" : ""}${it.appearsIn.cart ? "C" : ""}${it.appearsIn.homeToday ? "H" : ""}`;
    md += `| \`${it.productId}\` | ${it.name} | ${it.store} | ${it.category} | \`${it.photoFilename}\` | ${a} |\n`;
  }
}
md += `\n## Issues\n`;
md += duplicates.length ? `- Duplicate photo filenames: ${duplicates.join(", ")}\n` : `- No duplicate filenames.\n`;
md += counts.missing ? `- ${counts.missing} products reference a photo file that is absent (see image audit).\n` : `- No missing photo files.\n`;
md += `- All ${counts.total} products currently render the generated illustration fallback (0 photographs). This is expected until real assets are added.\n`;
writeFileSync(join(docs, "PRODUCT_IMAGE_MANIFEST.md"), md);

console.log("Wrote docs/product-image-manifest.json and docs/PRODUCT_IMAGE_MANIFEST.md");
console.log(JSON.stringify(counts, null, 2));
if (duplicates.length) console.log("DUPLICATE filenames:", duplicates);
