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
 * @param publicId - Optional public ID (without extension)
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
