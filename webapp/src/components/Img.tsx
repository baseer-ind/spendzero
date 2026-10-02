import { useState } from "react";

/**
 * Image with a graceful fallback (tasteful gradient + emoji) so a slow/broken
 * URL never shows a broken-image icon. In the React web app, <img> loads any
 * host without CORS issues (unlike the old Flutter/canvaskit build).
 */
export function Img({
  src,
  alt,
  emoji,
  className,
  seed,
}: {
  src: string;
  alt: string;
  emoji?: string;
  className?: string;
  seed?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    const key = seed ?? alt ?? "x";
    const hue = key.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    return (
      <div
        className={className}
        style={{
          background: `linear-gradient(135deg, hsl(${hue} 35% 22%), hsl(${(hue + 40) % 360} 40% 14%))`,
          display: "grid",
          placeItems: "center",
        }}
        aria-label={alt}
      >
        {emoji && <span style={{ fontSize: 30 }}>{emoji}</span>}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
