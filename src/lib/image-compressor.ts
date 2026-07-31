/**
 * Utility for image file validation & client-side compression.
 */

// Supported image MIME types & extensions
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validates file format and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'File tidak ditemukan.' };
  }

  // Allow PDF/documents for CV uploads, but for images enforce image types
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
      error: `Ukuran file terlalu besar (${sizeInMB} MB). Maksimal ukuran file adalah 10 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Client-side Canvas Image Optimizer.
 * Optimizes images to HD (max 1920x1920px at WebP quality 0.90) while preserving PNG transparency.
 * Returns crisp, high-definition optimized WebP File.
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.90
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

        // Scale down ONLY if image is larger than 1920px (Full HD)
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
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

        // Clear canvas to preserve PNG transparency (no solid white background override)
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const newFilename = `${originalNameWithoutExt}.webp`;

            const compressedFile = new File([blob], newFilename, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}
