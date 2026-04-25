/**
 * Predefined solid colour presets for trip banners.
 * Colours are chosen to work well with light/white text overlaid on top.
 */
export const BANNER_COLOR_PRESETS: string[] = [
  "#2d6a4f", // forest green
  "#1e6091", // ocean blue
  "#6a0572", // purple
  "#b5451b", // terracotta
  "#3d5a80", // navy
  "#5c6bc0", // indigo
  "#00695c", // teal
  "#558b2f", // olive
  "#ad1457", // rose
  "#0277bd", // sky blue
  "#4a4e69", // dusk purple
  "#37474f", // slate
  "#6d4c41", // mocha
  "#c05829", // amber
  "#1b5e20", // dark green
  "#7b4f2e", // brown
];

/** Returns a randomly selected colour from the preset palette. */
export function generateRandomBannerColor(): string {
  return (
    BANNER_COLOR_PRESETS[
      Math.floor(Math.random() * BANNER_COLOR_PRESETS.length)
    ] ?? BANNER_COLOR_PRESETS[0]
  );
}

// ---------------------------------------------------------------------------
// Contrast / legibility helpers
// ---------------------------------------------------------------------------

/**
 * Parses a hex colour string (`#rrggbb` or `#rgb`) into an [r, g, b] tuple
 * with each component in the 0–255 range. Returns null for invalid input.
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.replace(/^#/, "");
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null;
  return [
    parseInt(expanded.slice(0, 2), 16),
    parseInt(expanded.slice(2, 4), 16),
    parseInt(expanded.slice(4, 6), 16),
  ];
}

/**
 * Computes the WCAG 2.1 relative luminance of a hex colour.
 * Returns a value in the range 0 (absolute black) – 1 (absolute white),
 * or null if the colour string cannot be parsed.
 */
export function getRelativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [rLin, gLin, bLin] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Minimum relative luminance a banner background must have in light mode so
 * that the dark foreground text remains legible.
 */
const LIGHT_THEME_MIN_LUMINANCE = 0.06;

/**
 * Maximum relative luminance a banner background may have in dark mode so
 * that the light foreground text remains legible.
 */
const DARK_THEME_MAX_LUMINANCE = 0.35;

/**
 * Returns `true` when the given hex colour is appropriate to use as a banner
 * background for the supplied resolved theme.
 *
 * - **Light mode** – very dark colours are blocked because the theme's dark
 *   foreground text would become hard to read on a dark background.
 * - **Dark mode** – very bright colours are blocked because the theme's light
 *   foreground text would become hard to read on a bright background.
 * - Returns `true` when `resolvedTheme` is `undefined` (e.g. during SSR /
 *   before hydration) so no colours are incorrectly blocked on first render.
 */
export function isColorAllowedForTheme(
  hex: string,
  resolvedTheme: string | undefined,
): boolean {
  const lum = getRelativeLuminance(hex);
  if (lum === null) return true; // unparseable — don't block
  if (resolvedTheme === "light") return lum >= LIGHT_THEME_MIN_LUMINANCE;
  if (resolvedTheme === "dark") return lum <= DARK_THEME_MAX_LUMINANCE;
  return true;
}
