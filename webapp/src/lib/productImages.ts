// Data-driven product imagery.
//
// A product's picture is resolved, not hand-maintained. The renderer
// (ProductImage) does not care where the image comes from:
//   type "local"        → a file we committed under public/products/<folder>/
//   type "remote"       → an approved, licensed external URL (e.g. Pexels), with credit
//   type "illustration" → the generated vector fallback (productArt)
//
// Only the ~34 "launch visual catalogue" products must look photographic for V1.
// Everything else stays available but uses the illustration until real feeds exist.
// NO scraping, NO arbitrary image URLs, NO API keys in the frontend. See
// docs/PRODUCT_IMAGE_MANIFEST.md and docs/IMAGE_STRATEGY.md.

export type MediaType = "local" | "remote" | "illustration";
export type ProductMedia = {
  type: MediaType;
  src?: string; // undefined only for pure illustration (caller supplies the art)
  gallery?: string[];
  credit?: string; // e.g. "Photo by X on Pexels" — attribution must be preserved
  source?: string; // e.g. "pexels"
  sourceId?: string;
  licenseNote?: string;
};

// The launch visual catalogue — the products users see first. These MUST be
// photographic for V1. (34 total: Electronics 8, Shopping 8, Food 10, Grocery 8.)
export const LAUNCH_IDS: Record<string, string[]> = {
  electronics: ["soniq-airbuds-pro", "voltedge-x7", "pulse-fit-2", "aero-overear", "quanta-powercell", "orbit-boom", "nimbus-ultrabook", "quanta-mon27"],
  shopping: ["sh-tshirt", "sh-kurta", "sh-jeans", "sh-saree", "sh-kurti", "sh-shoes", "sh-bag", "sh-backpack"],
  food: ["dz-chk-bir", "dz-haleem", "dz-mut-bir", "ck-butter-chk", "ck-paneer", "ug-dosa", "ug-thali", "mt-vadapav", "mt-pavbhaji", "ar-gongura"],
  grocery: ["gr-banana", "gr-milk", "gr-atta", "gr-rice", "gr-noodles", "gr-tea", "gr-tomato", "gr-paneer"],
};
const LAUNCH_SET = new Set(Object.values(LAUNCH_IDS).flat());
export function isLaunchProduct(id: string): boolean {
  return LAUNCH_SET.has(id);
}

const FOLDER: Record<string, string> = {
  electronics: "electronics", Electronics: "electronics",
  shopping: "shopping", Shopping: "shopping",
  grocery: "grocery", Grocery: "grocery",
  beauty: "beauty", Beauty: "beauty",
  home: "home", Home: "home",
  travel: "travel", Travel: "travel",
  entertainment: "entertainment", Entertainment: "entertainment",
  food: "food", Food: "food",
};
function folderFor(vertical: string): string {
  return FOLDER[vertical] ?? vertical.toLowerCase();
}

/**
 * The photo registry. Populate an entry to give a product a real photograph —
 * either a committed local file or an approved remote (Pexels) URL with credit.
 * Empty by default: the catalogue renders illustrations until real assets land.
 *
 * Local example:   "soniq-airbuds-pro": { type: "local", src: "/products/electronics/soniq-airbuds-pro.webp" }
 * Remote example:  "soniq-airbuds-pro": { type: "remote", src: "https://images.pexels.com/...", source: "pexels", credit: "Photo by … on Pexels", licenseNote: "Pexels License" }
 */
export const PHOTO_REGISTRY: Record<string, ProductMedia> = {};

/** Resolve a product's media. Registry wins; otherwise illustration fallback. */
export function resolveMedia(vertical: string, id: string, illustrationSrc: string): ProductMedia {
  const reg = PHOTO_REGISTRY[id];
  if (reg && reg.src) return reg;
  return { type: "illustration", src: illustrationSrc };
}

/** Primary photo src if a real photo is registered, else undefined (→ illustration). */
export function photoSrc(_vertical: string, id: string): string | undefined {
  const reg = PHOTO_REGISTRY[id];
  return reg && reg.type !== "illustration" ? reg.src : undefined;
}

/** Gallery photo srcs (registry only), empty when none. */
export function gallerySrc(_vertical: string, id: string): string[] {
  const reg = PHOTO_REGISTRY[id];
  return reg?.gallery ?? (reg && reg.type !== "illustration" && reg.src ? [reg.src] : []);
}

/** Conventional local path for a launch product (for tooling / when adding files). */
export function conventionalLocalPath(vertical: string, id: string): string {
  return `/products/${folderFor(vertical)}/${id}.webp`;
}
