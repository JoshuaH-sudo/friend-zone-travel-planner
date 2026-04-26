"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { sendThemeToNative } from "@/lib/native-bridge";

/**
 * Reads the initial theme injected by the native app via URL params.
 *
 * The native app opens the WebView with a URL like:
 *   https://ourapp.com?native=true&theme=dark
 *
 * Returns the theme value when the `native` flag is present and the theme
 * is a recognised value, otherwise returns null.
 */
function readUrlTheme(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get("native") !== "true") return null;
  const theme = params.get("theme");
  return theme === "dark" || theme === "light" ? theme : null;
}

/**
 * Synchronises the resolved next-themes theme to the React Native host app.
 *
 * Two complementary mechanisms are used:
 *
 * 1. **Initial theme from URL param** – On first mount the hook reads
 *    `?native=true&theme=<value>` and applies it via `setTheme`, but **only
 *    when the stored preference is `"system"`** (the default for new users).
 *    If the user has explicitly chosen `"light"` or `"dark"` in app settings
 *    that choice is preserved and the URL hint is ignored.
 *
 * 2. **Live updates via postMessage** – Whenever the resolved theme changes,
 *    `sendThemeToNative` posts a THEME_UPDATE message to the WebView host so
 *    the native background colour and status bar style stay in sync.
 *
 * Both mechanisms are no-ops when the app is not running inside a React Native
 * WebView (i.e. `window.ReactNativeWebView` is absent / URL param is missing).
 */
export function useNativeThemeSync(): void {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const lastSentTheme = useRef<string | null>(null);
  const urlThemeApplied = useRef(false);

  // Apply the initial theme from URL param once on mount, but ONLY when the
  // user's stored preference is "system" (the default for new users). If the
  // user has already manually picked "light" or "dark" in settings we must
  // respect that choice and ignore the native hint.
  useEffect(() => {
    if (urlThemeApplied.current) return;
    urlThemeApplied.current = true;

    // `theme` is the value persisted by next-themes ("system" | "light" | "dark").
    // Only override when it is still "system" so manual selections are preserved.
    if (theme !== "system") return;

    const urlTheme = readUrlTheme();
    if (urlTheme) {
      setTheme(urlTheme);
    }
  }, [theme, setTheme]);

  // Send a THEME_UPDATE message whenever the resolved theme changes.
  useEffect(() => {
    if (!resolvedTheme || resolvedTheme === lastSentTheme.current) return;
    lastSentTheme.current = resolvedTheme;
    sendThemeToNative(resolvedTheme);
  }, [resolvedTheme]);
}
