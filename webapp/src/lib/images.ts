// Image system for dream covers & profile photos.
//
// Design goals (see docs/IMAGE_SEARCH_ARCHITECTURE.md & docs/USER_IMAGE_PRIVACY.md):
//  - India-first curated suggestions per goal type.
//  - A replaceable ImageSearchProvider — NO API keys live in the frontend.
//    The default provider returns keyworded photos; swap it for a server-proxied
//    search (that holds the key) without touching any component.
//  - Gallery upload & camera capture stay on-device: the file is read to a
//    data: URL and persisted in localStorage. Nothing is uploaded anywhere.
//  - Never use a random stock person's face as a profile photo — the picker
//    offers the user's own photo or initials only.

import { artImage } from "@/lib/localImage";

// Keyworded image. Now generated locally (offline, never broken). Kept async-free
// and same-signature so call sites are unchanged.
export function photo(keyword: string, seed: string, _w = 800, _h = 600): string {
  return artImage(keyword, seed);
}

// A curated set of India-relevant covers for a goal keyword.
export function curatedCovers(keyword: string, count = 6): string[] {
  return Array.from({ length: count }, (_, i) => photo(keyword, `${keyword}-${i}`, 800, 600));
}

// India-first curated keyword presets, keyed loosely by goal theme.
export const COVER_PRESETS: { label: string; kw: string }[] = [
  { label: "Travel", kw: "india travel mountains" },
  { label: "Home", kw: "india house home" },
  { label: "Family", kw: "indian family" },
  { label: "Wedding", kw: "indian wedding" },
  { label: "Vehicle", kw: "motorcycle car india" },
  { label: "Education", kw: "india graduation student" },
  { label: "Gold", kw: "gold jewellery india" },
  { label: "Business", kw: "india small business shop" },
  { label: "Nature", kw: "himalayas kerala india" },
  { label: "Celebration", kw: "diwali festival india" },
];

/**
 * ImageSearchProvider — replaceable. The default implementation maps a free-text
 * query to keyworded photos. To use a real search API, replace ONLY this function
 * with a call to your own backend endpoint that holds the key server-side and
 * returns an array of image URLs. No component imports a provider key.
 */
export type ImageSearchProvider = (query: string, count?: number) => Promise<string[]>;

export const defaultImageSearch: ImageSearchProvider = async (query, count = 9) => {
  const q = query.trim() || "india";
  return Array.from({ length: count }, (_, i) => photo(q, `search-${q}-${i}`, 800, 600));
};

let provider: ImageSearchProvider = defaultImageSearch;
export function setImageSearchProvider(p: ImageSearchProvider) {
  provider = p;
}
export function searchImages(query: string, count = 9): Promise<string[]> {
  return provider(query, count);
}

// Read a gallery/camera file into a data: URL (stays on device).
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(file);
  });
}

/**
 * Crop + downscale an image (from any src) to a square/rect data URL via canvas.
 * `scale` (>=1) zooms in; `offsetX`/`offsetY` are -1..1 pan within the frame.
 * Output is capped so persisted data URLs stay small enough for localStorage.
 */
export function cropToDataURL(
  src: string,
  opts: { scale?: number; offsetX?: number; offsetY?: number; outW?: number; outH?: number } = {},
): Promise<string> {
  const { scale = 1, offsetX = 0, offsetY = 0, outW = 800, outH = 600 } = opts;
  return new Promise((resolve, reject) => {
    const img = new Image();
    // crossOrigin only matters for remote images; setting it for data: URLs is
    // unnecessary and can cause spurious load failures in some browsers.
    if (/^https?:/i.test(src)) img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        // Fit the source to the frame (cover), then apply zoom.
        const frameRatio = outW / outH;
        const imgRatio = img.width / img.height;
        let baseW: number, baseH: number;
        if (imgRatio > frameRatio) {
          baseH = outH;
          baseW = outH * imgRatio;
        } else {
          baseW = outW;
          baseH = outW / imgRatio;
        }
        const drawW = baseW * scale;
        const drawH = baseH * scale;
        const maxDX = (drawW - outW) / 2;
        const maxDY = (drawH - outH) / 2;
        const dx = (outW - drawW) / 2 + offsetX * maxDX;
        const dy = (outH - drawH) / 2 + offsetY * maxDY;
        ctx.drawImage(img, dx, dy, drawW, drawH);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      } catch (e) {
        reject(e as Error);
      }
    };
    img.onerror = () => reject(new Error("Could not load the image for cropping."));
    img.src = src;
  });
}
