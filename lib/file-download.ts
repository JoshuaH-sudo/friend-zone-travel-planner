/**
 * Returns true when running on an iOS device (iPhone, iPad, iPod).
 *
 * iOS Safari does not honour the `download` attribute on anchor elements, so
 * we need a different strategy there.  Android Chrome supports the attribute
 * natively, so we intentionally exclude Android from this check.
 */
function isIOS(): boolean {
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
 */
export async function downloadOrShareFile(
  blob: Blob,
  filename: string,
): Promise<void> {
  if (
    isIOS() &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function"
  ) {
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] });
      return;
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
