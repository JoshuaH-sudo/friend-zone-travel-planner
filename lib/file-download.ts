/**
 * Reads an explicit platform override from the URL query string.
 *
 * The React Native WebView host can append `?platform=ios` or
 * `?platform=android` to the URL it loads so that the web app does not have
 * to rely on user-agent sniffing when auto-detection is unreliable.
 *
 * Returns `"ios"`, `"android"`, or `null` (no override).
 */
function getPlatformParam(): "ios" | "android" | null {
  if (typeof window === "undefined") return null;
  const platform = new URLSearchParams(window.location.search).get("platform");
  if (platform === "ios") return "ios";
  if (platform === "android") return "android";
  return null;
}

/**
 * Returns true when the web app is running inside a React Native WebView.
 *
 * The native app injects `window.ReactNativeWebView` into the WebView context,
 * which is the same object used by the native theme bridge.  When present it
 * means we are inside a managed WebView on either iOS or Android.
 */
function isInReactNativeWebView(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.ReactNativeWebView !== "undefined"
  );
}

/**
 * Determines whether to use the Web Share API instead of anchor-click download.
 *
 * The Web Share API is preferred in two cases:
 *
 * 1. **iOS** — Safari silently ignores the `download` attribute on anchor
 *    elements, so the share sheet is the only reliable save path.
 *
 * 2. **React Native WebView (any platform)** — The WebView does not have a
 *    native download manager, so blob-URL anchor clicks silently do nothing on
 *    Android.  Routing through the Web Share API lets the host app (or Android
 *    system) handle file saving correctly.
 *
 * The `?platform=ios|android` URL param takes precedence over auto-detection —
 * useful when the WebView host wants to force a specific path regardless of
 * what the code would otherwise infer from the environment.
 */
function shouldUseWebShare(): boolean {
  // Explicit URL param overrides take highest priority.
  const param = getPlatformParam();
  if (param === "ios") return true;
  if (param === "android") return false;

  // Inside a React Native WebView anchor downloads don't work on either platform.
  if (isInReactNativeWebView()) return true;

  // Auto-detect iOS via user-agent / touch capability for plain Safari.
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ reports itself as "MacIntel" but has touch support
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Downloads or shares a file depending on the platform capabilities.
 *
 * - **iOS Safari** — the `download` attribute is ignored, so the Web Share
 *   API is used to open the native share sheet.
 * - **React Native WebView (iOS or Android)** — the WebView has no download
 *   manager, so the Web Share API is used here too.  Android WebView surfaces
 *   the share sheet which allows the user to save the file.
 * - **Android Chrome & desktop browsers** — the classic anchor-click download
 *   path is used, which triggers the browser's built-in download behaviour.
 *
 * The React Native WebView host can pass `?platform=ios` or
 * `?platform=android` in the URL to override automatic platform detection.
 *
 * @throws {Error} When sharing fails for a reason other than the user
 *   dismissing the share sheet (AbortError is silently ignored).
 */
export async function downloadOrShareFile(
  blob: Blob,
  filename: string,
): Promise<void> {
  if (
    shouldUseWebShare() &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function"
  ) {
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (err) {
        // AbortError means the user dismissed the share sheet — not a failure.
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Any other error (e.g. NotAllowedError due to expired user gesture)
        // falls through to the anchor-download path as a last resort.
      }
    }
  }

  // Standard anchor download — works on Android, desktop, and any browser
  // that supports the `download` attribute.
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
