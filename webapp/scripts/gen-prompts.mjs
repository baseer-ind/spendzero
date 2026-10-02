// Generate docs/LAUNCH_IMAGE_PROMPTS.md — a copy-paste prompt pack for the 34
// launch products, each with its EXACT target filename. Generate the image in the
// Claude.ai chat with the prompt, save it as the given filename, and place it in
// the matching folder. Run: node scripts/gen-prompts.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "..", "docs", "product-image-manifest.json"), "utf8"));
const launch = manifest.products.filter((p) => p.launch);

function prompt(it) {
  const base = "clean warm-white studio background, realistic materials, soft studio lighting, centered, no brand logos, no text, no watermark, 4:3 aspect";
  switch (it.vertical) {
    case "food":
      return `Appetising realistic food photograph of ${it.name}, authentic Indian presentation on a simple plate or bowl, natural soft light, clean neutral background, no text, no watermark, 4:3 aspect.`;
    case "shopping":
      return `Ecommerce product photograph of a generic ${it.name} (no brand), ${base}, front view.`;
    case "grocery":
      return `Ecommerce product photograph of a generic ${it.name} with plain fictional packaging (no real brand, no readable text), ${base}.`;
    default:
      return `Studio product photograph of a generic ${it.name} (no brand), ${base}, front three-quarter view.`;
  }
}

let md = `# Launch Image Prompt Pack (34 products)

Generate each image in the Claude.ai chat using the prompt, **save it with the exact
filename shown**, and place it in \`webapp/public/products/<folder>/\`. Then either
send the files to this session, or run \`node webapp/scripts/register-local.mjs\`
followed by \`node webapp/scripts/image-audit.mjs\`.

See \`docs/PRODUCT_PHOTO_SPEC.md\` for the full standard. Save as **.jpg** (or .webp).

`;
const order = ["electronics", "shopping", "food", "grocery"];
for (const v of order) {
  const list = launch.filter((it) => it.vertical === v);
  md += `\n## ${v[0].toUpperCase() + v.slice(1)} (${list.length})\n\n`;
  for (const it of list) {
    const file = `public/products/${it.photoFilename.split("/")[0]}/${it.productId}.jpg`;
    md += `### ${it.name}\n`;
    md += `- **Save as:** \`${file}\`\n`;
    md += `- **Prompt:** ${prompt(it)}\n\n`;
  }
}
writeFileSync(join(root, "..", "docs", "LAUNCH_IMAGE_PROMPTS.md"), md);
console.log(`Wrote docs/LAUNCH_IMAGE_PROMPTS.md (${launch.length} prompts).`);
