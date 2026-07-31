import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyJWT } from '@/lib/auth';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

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

    // 3. Backend Size Validation (Max 5MB)
    if (file.size > MAX_SIZE_BYTES) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        { error: `Ukuran file terlalu besar (${sizeInMB} MB). Maksimal ukuran file adalah 5 MB.` },
        { status: 400 }
      );
    }

    // 4. Format & Extension Validation
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

    // 5. Convert file stream to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Try saving to local disk (/public/uploads)
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
      // 7. Fallback for Vercel / Read-Only Serverless File Systems (EROFS)
      // Convert tiny compressed WebP buffer into a high-compatibility Data URL
      const mimeType = file.type || 'image/webp';
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
    console.error('Image upload endpoint error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengunggah file gambar.' },
      { status: 500 }
    );
  }
}
