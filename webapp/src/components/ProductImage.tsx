import { useState } from "react";
import { productArt } from "@/lib/productArt";

/**
 * Catalogue product image: a consistent light "studio" frame with a loading
 * state, graceful fallback and fixed aspect — so product grids look like a real
 * shopping app and never show a broken-image icon or layout jump.
 *
 * `src` may be a real photo later; if it's missing/fails we render a vector
 * product illustration from `keyword` (productArt) on the same light frame.
 */
export function ProductImage({
  src,
  alt,
  keyword,
  seed,
  className = "",
  rounded = "rounded-none",
}: {
  src?: string;
  alt: string;
  keyword: string;
  seed: string;
  className?: string;
  rounded?: string;
}) {
  const fallback = productArt(keyword, seed);
  const [cur, setCur] = useState(src || fallback);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-[#eef0f4] ${rounded} ${className}`}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-[#e7e8ee]" aria-hidden />}
      <img
        src={cur}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => { if (cur !== fallback) { setCur(fallback); } else { setLoaded(true); } }}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
