/**
 * Cloudinary configuration and upload utility.
 * Used as cloud storage to avoid EROFS on serverless (Vercel).
 * Uses dynamic import('cloudinary') to prevent Next.js / Turbopack bundle hoisting issues.
 */

/**
 * Check if Cloudinary environment variable is properly formatted with cloudinary://
 */
export function isCloudinaryConfigured(): boolean {
  const envUrl = process.env.CLOUDINARY_URL;
  return typeof envUrl === 'string' && envUrl.trim().startsWith('cloudinary://');
}

/**
 * Dynamically import and configure Cloudinary SDK only when valid config exists.
 */
async function getCloudinary() {
  if (!isCloudinaryConfigured()) {
    return null;
  }
  try {
    const { v2: cloudinary } = await import('cloudinary');
    cloudinary.config({ secure: true });
    return cloudinary;
  } catch (err) {
    console.warn('Failed to initialize Cloudinary SDK:', err);
    return null;
  }
}

/**
 * Upload a buffer to Cloudinary and return the secure URL.
 * @param buffer  - Image binary data
 * @param folder  - Cloudinary folder (e.g. "portfolio/projects")
 * @param mimeType - MIME type of the file
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'portfolio',
  mimeType: string = 'image/webp'
): Promise<string> {
  const cloudinary = await getCloudinary();
  if (!cloudinary) {
    throw new Error('CLOUDINARY_URL environment variable is not configured with a valid cloudinary:// URL.');
  }

  const resourceType = mimeType.startsWith('image/') ? 'image' : 'raw';
  const format = mimeType === 'image/webp' ? 'webp'
    : mimeType === 'image/jpeg' || mimeType === 'image/jpg' ? 'jpg'
    : mimeType === 'image/png' ? 'png'
    : undefined;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        format,
        transformation: resourceType === 'image' ? [
          { quality: 'auto:good' },
          { fetch_format: 'webp' },
        ] : undefined,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Ensures an image URL is safe for storing in DB (not a massive Base64 string).
 * If it is a Base64 Data URL, uploads to Cloudinary (if configured) or strips if too large.
 */
export async function sanitizeImageUrl(
  url: string | null | undefined,
  folder: string = 'portfolio'
): Promise<string | null> {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return null;
  }

  const trimmed = url.trim();

  // If it's already a standard HTTP/HTTPS or server relative URL (/uploads/), return as is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/uploads/')) {
    return trimmed;
  }

  // If it's a Base64 Data URL
  if (trimmed.startsWith('data:')) {
    // 1. If Cloudinary is configured, upload the Base64 Data URL directly to Cloudinary
    if (isCloudinaryConfigured()) {
      const cloudinary = await getCloudinary();
      if (cloudinary) {
        try {
          const res = await cloudinary.uploader.upload(trimmed, {
            folder,
            transformation: [{ quality: 'auto:good' }, { fetch_format: 'webp' }],
          });
          return res.secure_url;
        } catch (err) {
          console.warn('Cloudinary upload of Base64 Data URL failed:', err);
        }
      }
    }

    // 2. If Cloudinary is not configured or failed, check Base64 string length.
    // Allow small compressed images (< 300 KB) as a safe DB fallback.
    // Only strip if > 300 KB to prevent Neon DB SQL query size crashes.
    if (trimmed.length > 300000) {
      console.warn('Base64 image is too large (>300KB) and Cloudinary is not configured. Stripping to prevent DB crash.');
      return null;
    }
  }

  return trimmed;
}

/**
 * Batch sanitize an array of image URLs
 */
export async function sanitizeImageUrls(
  urls: (string | null | undefined)[],
  folder: string = 'portfolio'
): Promise<string[]> {
  if (!urls || !Array.isArray(urls)) return [];
  const results = await Promise.all(urls.map((u) => sanitizeImageUrl(u, folder)));
  return results.filter((u): u is string => u !== null && u !== '');
}
