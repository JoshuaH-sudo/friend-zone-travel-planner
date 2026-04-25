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
