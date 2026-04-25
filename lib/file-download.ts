/**
 * Downloads or shares a file depending on the platform capabilities.
 *
 * On mobile devices (e.g. iOS) the `download` attribute on anchor elements is
 * not supported by Safari. The Web Share API is used instead when the browser
 * supports sharing files, so the user gets a native share sheet that lets them
 * save the file to Files, send it via AirDrop, etc.
 *
 * On desktop browsers that do not support the Web Share API for files the
 * classic anchor‑click approach is used as a fallback.
 */
export async function downloadOrShareFile(
  blob: Blob,
  filename: string,
): Promise<void> {
  if (
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

  // Fallback: anchor element with download attribute (desktop browsers)
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
