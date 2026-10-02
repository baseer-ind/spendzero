// Drop-in photographic product imagery.
//
// How to add a real photo (no code edit to catalogues needed):
//   1. Put a file at  webapp/public/products/<folder>/<productId>.jpg
//      (optional gallery: <productId>_2.jpg, <productId>_3.jpg)
//   2. Add the productId to HAS_PHOTO below.
//   -> The product card/detail will use the photo; otherwise it falls back to the
//      generated vector art (productArt) automatically. No broken images either way.
//
// Folder per vertical: electronics | fashion | grocery | beauty | home | food | travel | entertainment
// (shopping maps to the "fashion" folder). See webapp/public/products/README.md
// and docs/FINAL_UX_REALISM_AUDIT.md.

// Vertical id/label -> asset folder.
const FOLDER: Record<string, string> = {
  electronics: "electronics",
  Electronics: "electronics",
  shopping: "fashion",
  Shopping: "fashion",
  grocery: "grocery",
  Grocery: "grocery",
  beauty: "beauty",
  Beauty: "beauty",
  home: "home",
  Home: "home",
  travel: "travel",
  Travel: "travel",
  entertainment: "entertainment",
  Entertainment: "entertainment",
  food: "food",
  Food: "food",
};

// Product ids that have a real photo committed under public/products/<folder>/.
// Empty for now — vector art is the current default. Add ids as photos land.
export const HAS_PHOTO = new Set<string>([]);

function folderFor(vertical: string): string {
  return FOLDER[vertical] ?? vertical.toLowerCase();
}

/** Primary photo src, or undefined when no photo exists yet (→ vector fallback). */
export function photoSrc(vertical: string, id: string): string | undefined {
  if (!HAS_PHOTO.has(id)) return undefined;
  return `/products/${folderFor(vertical)}/${id}.jpg`;
}

/** Gallery photo srcs (primary + _2/_3…), empty when none exist. */
export function gallerySrc(vertical: string, id: string, extra = 2): string[] {
  if (!HAS_PHOTO.has(id)) return [];
  const f = folderFor(vertical);
  const out = [`/products/${f}/${id}.jpg`];
  for (let i = 2; i <= 1 + extra; i++) out.push(`/products/${f}/${id}_${i}.jpg`);
  return out;
}
