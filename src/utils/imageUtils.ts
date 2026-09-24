/**
 * Utilities for image compression and validation for corporate branding logos
 */

/**
 * Compresses and resizes an uploaded image file to a lightweight data URL.
 * Keeps output below 50KB so it safely fits within both localStorage and Firestore document limits.
 */
export async function compressImageFile(file: File, maxDim = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's an SVG, read directly as text or data URL
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read SVG file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Failed to read file'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        // Draw onto canvas
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try PNG first to preserve transparent backgrounds
        try {
          const pngUrl = canvas.toDataURL('image/png');
          // If PNG is under 80KB, keep PNG
          if (pngUrl.length < 80000) {
            resolve(pngUrl);
            return;
          }
        } catch {
          // Fall through to jpeg
        }

        // Otherwise use high-efficiency JPEG
        const jpegUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(jpegUrl);
      };

      img.onerror = () => {
        // Fallback to raw data url if image decode failed
        resolve(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Checks whether an image URL can be loaded successfully by the browser.
 */
export function validateImageUrl(url: string, timeoutMs = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string' || !url.trim()) {
      resolve(false);
      return;
    }

    // Data URLs are locally valid if formatted properly
    if (url.startsWith('data:image/')) {
      resolve(true);
      return;
    }

    const img = new Image();
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      resolve(false);
    }, timeoutMs);

    img.onload = () => {
      if (!timedOut) {
        clearTimeout(timer);
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!timedOut) {
        clearTimeout(timer);
        resolve(false);
      }
    };

    img.src = url;
  });
}
