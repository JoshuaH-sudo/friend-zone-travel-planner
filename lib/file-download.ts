import { sendFileToNative } from "./native-bridge";

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
 * Returns true when running on an iOS device (iPhone, iPad, iPod) outside of
 * a React Native WebView (i.e. plain Safari).
 *
 * iOS Safari does not honour the `download` attribute on anchor elements, so
 * we need a different strategy there.
 *
 * The `?platform=ios|android` URL param takes precedence over user-agent
 * detection — useful when the WebView host can declare the platform explicitly.
 */
function isIosSafari(): boolean {
  const param = getPlatformParam();
  if (param === "ios") return true;
  if (param === "android") return false;

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
 * - **React Native WebView (iOS or Android)** — neither anchor downloads nor
 *   `navigator.share({ files })` work reliably inside a WebView.  The file is
 *   posted to the native app via `window.ReactNativeWebView.postMessage()` as a
 *   base-64 encoded `DOWNLOAD_FILE` message.  The native app is responsible for
 *   writing the file and/or opening the system share sheet.
 * - **iOS Safari** — the `download` attribute is ignored; the Web Share API is
 *   used to open the native share sheet.
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
  // Inside a React Native WebView neither anchor downloads nor navigator.share
  // with files works on Android.  Use the postMessage native bridge instead.
  if (isInReactNativeWebView()) {
    await sendFileToNative(blob, filename);
    return;
  }

  // Plain iOS Safari ignores the anchor `download` attribute — use the Web
  // Share API to surface the native share sheet.
  if (
    isIosSafari() &&
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

  // Standard anchor download — works on Android Chrome, desktop, and any
  // browser that supports the `download` attribute.
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
