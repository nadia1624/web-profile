import { validateImageFile, compressImage } from './image-compressor';

export interface UploadOptions {
  onProgress?: (percent: number) => void;
}

/**
 * Client-side helper function to validate, compress, and upload a file via multipart/form-data.
 * Returns the server relative URL (e.g. /uploads/1722400000_image.webp).
 */
export async function uploadImageFile(file: File, options?: UploadOptions): Promise<string> {
  // 1. Client-side Validation (Format & Size <= 5MB)
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'File tidak memenuhi syarat.');
  }

  // 2. Compress image using HTML5 Canvas to WebP format
  const compressedFile = await compressImage(file);

  // 3. Prepare FormData
  const formData = new FormData();
  formData.append('file', compressedFile);

  // 4. Send HTTP POST request with multipart/form-data
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.error || 'Gagal mengunggah gambar ke server.');
  }

  if (!result.url) {
    throw new Error('Server tidak mengembalikan URL gambar yang valid.');
  }

  return result.url;
}
