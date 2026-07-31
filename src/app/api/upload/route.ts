import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyJWT } from '@/lib/auth';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB for images
const MAX_DOC_SIZE_BYTES = 10 * 1024 * 1024;  // 10 MB for documents (PDF/DOC)
// Max base64 Data URL size to store in DB as fallback (500 KB binary ≈ 667 KB base64)
// Images larger than this MUST use disk or cloud storage; we reject otherwise.
const MAX_BASE64_FALLBACK_BYTES = 500 * 1024; // 500 KB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx'];

export async function POST(request: NextRequest) {
  // 1. Verify Admin Session
  const sessionCookie = request.cookies.get('nadia_session')?.value;
  const verifiedToken = sessionCookie ? await verifyJWT(sessionCookie) : null;
  if (!verifiedToken) {
    return NextResponse.json(
      { error: 'Sesi Admin telah berakhir. Silakan login kembali di /admin/login' },
      { status: 401 }
    );
  }

  try {
    // 2. Parse Multipart FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah.' }, { status: 400 });
    }

    // 3. Detect file type
    const isDocument = file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.toLowerCase().endsWith('.pdf') ||
      file.name.toLowerCase().endsWith('.doc') ||
      file.name.toLowerCase().endsWith('.docx');

    // 4. Backend Size Validation
    const maxSize = isDocument ? MAX_DOC_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
    if (file.size > maxSize) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const limit = isDocument ? '10 MB' : '5 MB';
      return NextResponse.json(
        { error: `Ukuran file terlalu besar (${sizeInMB} MB). Maksimal ukuran file adalah ${limit}.` },
        { status: 400 }
      );
    }

    // 5. Format & Extension Validation
    const fileNameLower = file.name.toLowerCase();
    const extension = '.' + fileNameLower.split('.').pop();
    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
    const isExtValid = ALLOWED_EXTENSIONS.includes(extension);

    if (!isMimeValid && !isExtValid) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Harap gunakan format JPG, JPEG, PNG, WebP, atau PDF.' },
        { status: 400 }
      );
    }

    // 6. Convert file stream to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 7a. Try Cloudinary upload first (works on Vercel / serverless)
    const { uploadToCloudinary, isCloudinaryConfigured } = await import('@/lib/cloudinary');
    if (isCloudinaryConfigured()) {
      try {
        const folder = isDocument ? 'portfolio/documents' : 'portfolio/images';
        const cloudUrl = await uploadToCloudinary(buffer, folder, file.type || 'image/webp');
        return NextResponse.json({
          success: true,
          url: cloudUrl,
          filename: file.name,
          size: file.size,
        });
      } catch (cloudErr) {
        console.warn('Cloudinary upload failed, falling back:', cloudErr);
      }
    }

    // 7b. Try saving to local disk (/public/uploads)
    try {
      const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}_${sanitizedOriginalName}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');

      await mkdir(uploadDir, { recursive: true });
      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
        filename: file.name,
        size: file.size,
      });
    } catch (fsError: any) {
      // 7c. Last resort: Base64 Data URL fallback
      // ONLY allowed if the binary data is small enough to store in DB safely.
      if (buffer.byteLength > MAX_BASE64_FALLBACK_BYTES) {
        return NextResponse.json(
          {
            error:
              `Penyimpanan file tidak tersedia dan gambar terlalu besar untuk disimpan sementara (${(buffer.byteLength / 1024).toFixed(0)} KB). ` +
              `Silakan konfigurasi Cloudinary di environment variable CLOUDINARY_URL, atau gunakan gambar yang lebih kecil (< 500 KB setelah kompresi).`,
          },
          { status: 507 }
        );
      }

      const mimeType = file.type && file.type !== 'application/octet-stream'
        ? file.type
        : isDocument ? 'application/pdf' : 'image/webp';
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        filename: file.name,
        size: file.size,
      });
    }
  } catch (error: any) {
    console.error('Upload endpoint error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengunggah file.' },
      { status: 500 }
    );
  }
}
