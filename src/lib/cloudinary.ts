/**
 * Cloudinary configuration and upload utility.
 * Used as cloud storage to avoid EROFS on serverless (Vercel).
 */

import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary using environment variable CLOUDINARY_URL
// Format: cloudinary://api_key:api_secret@cloud_name
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
}

export { cloudinary };

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
  if (!process.env.CLOUDINARY_URL) {
    throw new Error('CLOUDINARY_URL environment variable is not set.');
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
    if (process.env.CLOUDINARY_URL) {
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

    // 2. If Cloudinary is not configured or failed, check Base64 string length.
    // If > 100 KB, it will cause Prisma / Neon DB query size errors.
    // Strip it to prevent DB crashes.
    if (trimmed.length > 100000) {
      console.warn('Base64 image is too large (>100KB) and Cloudinary is not configured. Stripping to prevent DB crash.');
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
