"use client";

import { useNativeThemeSync } from "@/components/hooks/useNativeThemeSync";

/**
 * Mounts the native theme bridge.
 *
 * Renders nothing – purely a side-effect component. Mount once inside
 * <ThemeProvider> at the app root so it always has access to the theme
 * context and runs on every page.
 *
 * Responsibilities:
 *   - Reads `?native=true&theme=<value>` on first render and applies it.
 *   - Posts THEME_UPDATE messages to the React Native WebView host whenever
 *     the resolved theme changes.
 */
export function NativeThemeSync(): null {
  useNativeThemeSync();
  return null;
}
