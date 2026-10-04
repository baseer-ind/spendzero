/**
 * SELFly typographic brand mark.
 *
 * The supplied logo PNGs are low-res board crops with baked-in backgrounds and
 * stray text, so we render the wordmark in type instead — crisp at every size,
 * theme-aware, and carrying the brand meaning: SELF (where you are today) +
 * fly (where your choices take you), with a small rising spark for "flight".
 */
export function SelflyMark({
  size = 28,
  showSpark = true,
  className = "",
}: {
  size?: number;
  showSpark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex items-baseline font-display leading-none tracking-[-0.02em] ${className}`}
      style={{ fontSize: size }}
      aria-label="SELFly"
    >
      <span className="text-white">SEL</span>
      <span
        className="italic"
        style={{
          background: "linear-gradient(105deg, #E3CBA5 0%, #C9A988 55%, #B8946E 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Fly
      </span>
      {showSpark && (
        <svg
          aria-hidden
          width={size * 0.5}
          height={size * 0.5}
          viewBox="0 0 24 24"
          className="absolute"
          style={{ right: -size * 0.28, top: -size * 0.22 }}
        >
          <path
            d="M3 20 Q 13 18 21 5"
            fill="none"
            stroke="#C9A988"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.9"
          />
          <circle cx="21" cy="5" r="2.1" fill="#E3CBA5" />
        </svg>
      )}
    </span>
  );
}

/**
 * The SELFly symbol (V1 flow mark): a confident S — the self, grounded —
 * releasing upward into a rising spark — the future. Primary recognisable mark;
 * used for the app icon, splash, and headers. Renders on dark and light.
 */
export function SelflyGlyph({ size = 36, className = "" }: { size?: number; className?: string }) {
  const gid = `sg${Math.round(size * 100)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-label="SELFly"
      role="img"
    >
      <defs>
        <linearGradient id={gid} x1="10" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#B8946E" />
          <stop offset="0.5" stopColor="#C9A988" />
          <stop offset="1" stopColor="#EAD4AF" />
        </linearGradient>
      </defs>
      <path
        d="M30 14 C 18 12 16 22 24 24.5 C 32 27 30 37 18 35"
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <path
        d="M30 14 C 33 12 35 10 38 7.5"
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <circle cx="39.5" cy="6.5" r="3.3" fill="#EAD4AF" />
    </svg>
  );
}
