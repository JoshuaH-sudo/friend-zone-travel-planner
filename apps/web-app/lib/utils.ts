import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// Function to adjust color saturation based on daytime or nighttime
export const adjustColorSaturation = (
  baseColor: string,
  isDaytime: boolean
): string => {
  // Example logic: Adjust the brightness of the base color
  return isDaytime
    ? lightenColor(baseColor, 0.05)
    : darkenColor(baseColor, 0.05);
};

// Helper function to lighten a color
export const lightenColor = (color: string, amount: number): string => {
  const [r, g, b] = hexToRgb(color);
  return rgbToHex(
    Math.min(255, Math.floor(r + 255 * amount)),
    Math.min(255, Math.floor(g + 255 * amount)),
    Math.min(255, Math.floor(b + 255 * amount))
  );
};

export const adjustOpacity = (color: string, opacity: number): string => {
  const [r, g, b] = hexToRgb(color);
  const alpha = Math.max(0, Math.min(1, opacity)); // Clamp opacity between 0 and 1
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};


// Helper function to darken a color
export const darkenColor = (color: string, amount: number): string => {
  const [r, g, b] = hexToRgb(color);
  return rgbToHex(
    Math.max(0, Math.floor(r - 255 * amount)),
    Math.max(0, Math.floor(g - 255 * amount)),
    Math.max(0, Math.floor(b - 255 * amount))
  );
};

// Convert hex color to RGB
export const hexToRgb = (hex: string): [number, number, number] => {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

// Convert RGB to hex color
export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
