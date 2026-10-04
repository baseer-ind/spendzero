/**
 * SELFly brand marks — the final approved logo from the brand board, rendered
 * from PNG (never recreated in CSS/SVG). Dark-UI variants (light ink) are used
 * because the app is dark-themed; light variants exist for light surfaces.
 *
 *   /brand/selfly-symbol-dark.png  — the champagne S, for compact marks & icons
 *   /brand/selfly-logo-dark.png    — the full S + "SELFly" lockup
 */

/** Compact square symbol (the S). Primary mark for headers and tight corners. */
export function SelflyGlyph({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/brand/selfly-symbol-dark.png"
      alt="SELFly"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Full lockup: S + "SELFly" wordmark. Use for splash, auth and brand moments. */
export function SelflyLockup({ height = 40, className = "" }: { height?: number; className?: string }) {
  return (
    <img
      src="/brand/selfly-logo-dark.png"
      alt="SELFly"
      className={`object-contain ${className}`}
      style={{ height, width: "auto" }}
    />
  );
}

/**
 * Backwards-compatible wordmark export. Renders the full lockup so existing call
 * sites that used the typographic mark now show the real logo. `size` maps to a
 * sensible lockup height. `showSpark` is ignored (the logo has its own form).
 */
export function SelflyMark({ size = 28, className = "" }: { size?: number; showSpark?: boolean; className?: string }) {
  return <SelflyLockup height={Math.round(size * 1.5)} className={className} />;
}
