/**
 * native-bridge.ts
 *
 * Utilities for communicating theme state from the Next.js web app to a React
 * Native host app that wraps the web app in a WebView.
 *
 * Usage:
 *   - Mount <NativeThemeSync /> once at the app root (inside ThemeProvider).
 *   - The component reads an initial theme from the "?theme=" URL param that
 *     the native app can inject when opening the WebView.
 *   - It also posts a THEME_UPDATE message every time next-themes resolves a
 *     new theme so the native app can keep its background / status bar in sync.
 */

/** Structured payload sent to the React Native WebView host. */
export interface NativeThemePayload {
  type: "THEME_UPDATE";
  payload: {
    /** Resolved theme name (e.g. "light" | "dark"). */
    theme: string;
    /** Hex background color matching the app's CSS --background variable. */
    backgroundColor: string;
    /** React Native StatusBar style. */
    statusBarStyle: "light-content" | "dark-content";
  };
}

/**
 * Payload sent to the React Native WebView host when the web app wants to
 * download or share a file.  The native app is responsible for writing the
 * file to disk and/or invoking the system share sheet.
 */
export interface NativeDownloadPayload {
  type: "DOWNLOAD_FILE";
  payload: {
    /** Suggested file name including extension (e.g. "backup.json"). */
    filename: string;
    /** MIME type of the file (e.g. "application/json"). */
    mimeType: string;
    /** Base-64 encoded file content (no data-URI prefix). */
    base64: string;
  };
}

interface ThemeConfig {
  backgroundColor: string;
  statusBarStyle: "light-content" | "dark-content";
}

/**
 * Per-theme color config.
 *
 * backgroundColor values are hex equivalents of the CSS custom properties
 * defined in globals.css:
 *   light → --background: hsl(40 33% 97%)  ≈ #faf8f5
 *   dark  → --background: hsl(200 25% 8%)  ≈ #0f1619
 */
const THEME_CONFIGS: Record<string, ThemeConfig> = {
  light: {
    backgroundColor: "#faf8f5",
    statusBarStyle: "dark-content",
  },
  dark: {
    backgroundColor: "#0f1619",
    statusBarStyle: "light-content",
  },
};

const DEFAULT_THEME_CONFIG: ThemeConfig = THEME_CONFIGS.light;

/** Builds the full payload object for a given resolved theme name. */
export function getNativeThemePayload(resolvedTheme: string): NativeThemePayload {
  const config = THEME_CONFIGS[resolvedTheme] ?? DEFAULT_THEME_CONFIG;
  return {
    type: "THEME_UPDATE",
    payload: {
      theme: resolvedTheme,
      ...config,
    },
  };
}

// Extend the global Window type so TypeScript knows about the RN bridge.
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

/**
 * Sends the current theme to the React Native WebView host.
 *
 * Safe to call at any time – silently does nothing when:
 *   - executed server-side (no `window`)
 *   - the app is not running inside a React Native WebView
 */
export function sendThemeToNative(resolvedTheme: string): void {
  if (typeof window === "undefined" || !window.ReactNativeWebView) return;
  const payload = getNativeThemePayload(resolvedTheme);
  window.ReactNativeWebView.postMessage(JSON.stringify(payload));
}

/**
 * Asks the React Native WebView host to save/share a file.
 *
 * The blob is converted to a base-64 string and posted as a
 * `DOWNLOAD_FILE` message.  The native app is expected to write the file
 * to the device and/or open the system share sheet.
 *
 * This is the only reliable way to trigger a file download from a React
 * Native WebView — neither the anchor `download` attribute nor
 * `navigator.share({ files })` works inside an Android WebView.
 *
 * Safe to call at any time – silently does nothing when the app is not
 * running inside a React Native WebView.
 */
export async function sendFileToNative(
  blob: Blob,
  filename: string,
): Promise<void> {
  if (typeof window === "undefined" || !window.ReactNativeWebView) return;

  // Convert blob → ArrayBuffer → base-64 string.
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const base64 = btoa(
    Array.from(bytes, (b) => String.fromCharCode(b)).join(""),
  );

  const payload: NativeDownloadPayload = {
    type: "DOWNLOAD_FILE",
    payload: {
      filename,
      mimeType: blob.type || "application/octet-stream",
      base64,
    },
  };
  window.ReactNativeWebView.postMessage(JSON.stringify(payload));
}
