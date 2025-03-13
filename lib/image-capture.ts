import html2canvas from "html2canvas"

// Capture an element as an image and return the data URL
export async function captureElementAsImage(element: HTMLElement): Promise<string> {
  try {
    // Get the current theme
    const isDarkTheme = document.documentElement.classList.contains("dark")

    // Create a clone of the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement
    const container = document.createElement("div")

    // Set the background color based on the current theme
    container.style.backgroundColor = isDarkTheme ? "#1f1f1f" : "#ffffff"
    container.style.padding = "20px"
    container.style.position = "absolute"
    container.style.left = "-9999px"
    container.style.top = "-9999px"
    container.appendChild(clone)

    // Add the container to the document
    document.body.appendChild(container)

    // Capture the element
    const canvas = await html2canvas(container, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: isDarkTheme ? "#1f1f1f" : "#ffffff",
      logging: false,
    })

    // Remove the container
    document.body.removeChild(container)

    return canvas.toDataURL("image/png")
  } catch (error) {
    console.error("Error capturing element:", error)
    throw error
  }
}

// Helper function to convert data URL to Blob
function dataURLToBlob(dataURL: string): Blob {
  // Convert base64 to raw binary data held in a string
  const byteString = atob(dataURL.split(",")[1])

  // Separate out the mime component
  const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0]

  // Write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  // Create a blob with the ArrayBuffer and the mime type
  return new Blob([ab], { type: mimeString })
}

// Copy an image to clipboard
export async function copyImageToClipboard(dataUrl: string): Promise<boolean> {
  try {
    // Convert data URL to blob directly without using fetch
    const blob = dataURLToBlob(dataUrl)

    // Check if the Clipboard API is available and supports ClipboardItem
    if (navigator.clipboard && window.ClipboardItem) {
      // Create a ClipboardItem
      const item = new ClipboardItem({ "image/png": blob })

      // Write to clipboard
      await navigator.clipboard.write([item])
      return true
    } else {
      // Fallback for browsers that don't support clipboard.write with images
      return fallbackCopyImage(dataUrl)
    }
  } catch (error) {
    console.error("Error copying image to clipboard:", error)

    // Try fallback method
    return fallbackCopyImage(dataUrl)
  }
}

// Fallback method for copying images
function fallbackCopyImage(dataUrl: string): boolean {
  try {
    const img = document.createElement("img")
    img.src = dataUrl
    img.style.position = "fixed"
    img.style.pointerEvents = "none"
    img.style.opacity = "0"
    document.body.appendChild(img)

    try {
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNode(img)
      selection?.removeAllRanges()
      selection?.addRange(range)
      const success = document.execCommand("copy")
      selection?.removeAllRanges()
      document.body.removeChild(img)
      return success
    } catch (fallbackError) {
      console.error("Fallback clipboard copy failed:", fallbackError)
      document.body.removeChild(img)
      return false
    }
  } catch (error) {
    console.error("Complete clipboard failure:", error)
    return false
  }
}

// Download image
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

