import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Verify Admin Session
  const sessionCookie = request.cookies.get('nadia_session')?.value;
  const verifiedToken = sessionCookie ? await verifyJWT(sessionCookie) : null;
  if (!verifiedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If running on Vercel (read-only filesystem) or production without custom storage,
    // convert image to a high-compatibility Base64 Data URL so it works 100% seamlessly online!
    const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';

    if (isVercel) {
      const mimeType = file.type || 'image/png';
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;

      return NextResponse.json({
        url: dataUrl,
        filename: file.name,
        size: file.size,
      });
    }

    // Local Development: Save file to public/uploads
    try {
      const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}_${sanitizedOriginalName}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      
      await mkdir(uploadDir, { recursive: true });
      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);

      return NextResponse.json({ 
        url: `/uploads/${filename}`, 
        filename: file.name,
        size: file.size
      });
    } catch (fsError) {
      // Fallback to Base64 Data URL if local filesystem write fails
      const mimeType = file.type || 'image/png';
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;

      return NextResponse.json({
        url: dataUrl,
        filename: file.name,
        size: file.size,
      });
    }
  } catch (error: any) {
    console.error('Image upload endpoint error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
