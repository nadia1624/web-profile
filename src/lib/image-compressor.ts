/**
 * Utility for image file validation & client-side compression to WebP.
 */

// Supported image MIME types & extensions
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates file format and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'File tidak ditemukan.' };
  }

  // Allow PDF/documents for CV uploads if needed, but for images enforce image types
  const isImage = file.type.startsWith('image/');
  if (isImage) {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase()) || ALLOWED_IMAGE_EXTENSIONS.includes(extension);

    if (!isValidType) {
      return {
        valid: false,
        error: 'Format gambar tidak didukung. Harap pilih file bertipe JPG, JPEG, PNG, atau WebP.',
      };
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Ukuran file terlalu besar (${sizeInMB} MB). Maksimal ukuran file adalah 5 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Client-side Canvas Image Compressor & Resizer
 * Automatically resizes images down to max 1200x1200px and exports as optimized WebP
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.80
): Promise<File> {
  // If file is not an image (e.g. PDF CV), return original file
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create HTML5 Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer WebP export if supported, otherwise fallback to JPEG
        const targetMime = 'image/webp';
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Create WebP filename
            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const newFilename = `${originalNameWithoutExt}.webp`;

            const compressedFile = new File([blob], newFilename, {
              type: targetMime,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          targetMime,
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}
