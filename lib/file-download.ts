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
 * Returns true when running on an iOS device (iPhone, iPad, iPod).
 *
 * iOS Safari does not honour the `download` attribute on anchor elements, so
 * we need a different strategy there.  Android Chrome supports the attribute
 * natively, so we intentionally exclude Android from this check.
 *
 * The `?platform=ios|android` URL param takes precedence over user-agent
 * detection — useful when the WebView host can declare the platform explicitly.
 */
function shouldUseWebShare(): boolean {
  const param = getPlatformParam();
  if (param === "ios") return true;
  if (param === "android") return false;

  // Auto-detect iOS via user-agent / touch capability.
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
 * On iOS, Safari silently ignores the `download` attribute on anchor elements.
 * The Web Share API is used instead so the user gets a native share sheet that
 * lets them save the file to Files, send it via AirDrop, etc.
 *
 * On Android and desktop browsers the classic anchor‑click approach is used,
 * which triggers the browser's built-in download behaviour.
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
