import { toBlob } from 'html-to-image';

// Capture an element as an image and return the data URL
export async function captureElementAsImage(
  element: HTMLElement
): Promise<{
  dataUrl: string;
  dataBlob: Blob;
}> {
  try {
    const imageBlobData = await toBlob(element);
    if (!imageBlobData) {
      throw new Error('Failed to convert element to Blob');
    }
    const imageDataUrl = URL.createObjectURL(imageBlobData);
    return {
      dataUrl: imageDataUrl,
      dataBlob: imageBlobData,
    }
  } catch (error) {
    console.error('Error capturing element:', error);
    throw error;
  }
}

// Copy an image to clipboard
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
    // Check if the Clipboard API is available and supports ClipboardItem
    if (navigator.clipboard && window.ClipboardItem) {
      // Create a ClipboardItem
      const item = new ClipboardItem({ 'image/png': blob });

      // Write to clipboard
      await navigator.clipboard.write([item]);
      return true;
    } else {
      return false;
    }
}

// Download image
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
