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

/** Compact symbol-only mark (the rising spark in a soft champagne ring). */
export function SelflyGlyph({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-label="SELFly"
      role="img"
    >
      <circle cx="24" cy="24" r="22" fill="none" stroke="#C9A988" strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M12 36 Q 26 32 38 12" fill="none" stroke="#C9A988" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="38" cy="12" r="3.4" fill="#E3CBA5" />
    </svg>
  );
}
